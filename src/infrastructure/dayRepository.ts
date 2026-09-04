/**
 * M3: persistencia del día. El historial de comidas COMPLETADAS guarda una
 * instantánea exacta (tabla meal_entry_items): lo que se registró ese día no se
 * recalcula nunca con datos actuales. Los cambios de cantidad/subsistencia de
 * comidas pendientes se derivan del builder al abrir el día.
 */

import type { DayType, FoodGroupId, MomentId } from '@/domain/nutrition/types';
import {
  buildDay,
  dateKeyOf,
  parseDateKey,
  suggestedDayType,
  type DailyFlowState,
  type FoodItem,
  type PlannedMeal,
} from '@/application/dailyFlow';
import { formatQuantity } from '@/domain/nutrition/quantities';
import { getDatabase, type DbLike } from './database';

interface MealItemRow {
  food_id: string;
  food_name: string;
  food_group: FoodGroupId;
  portions: number;
  quantity_display: string;
  is_substitution: number;
}

interface DayRecordRow {
  date: string;
  day_type: DayType;
  is_manually_set: number;
}

interface MealEntryRow {
  moment_id: MomentId;
  is_completed: number;
  substitutions: string | null;
}

const MOMENT_IDS: readonly MomentId[] = [
  'PRE_WORKOUT',
  'ALMUERZO',
  'COMIDA',
  'MERIENDA',
  'CENA',
];

function itemQuantity(item: FoodItem): string {
  return formatQuantity({
    value: item.value,
    ...(item.maxValue !== undefined ? { maxValue: item.maxValue } : {}),
    unit: item.unit,
  });
}

function parseQuantity(display: string): { value: number; maxValue?: number; unit: 'g' | 'ml' | 'unit' } {
  const match = /^([\d.,]+)(?:–([\d.,]+))?\s*(g|ml|ud)$/.exec(display.trim());
  if (!match) {
    return { value: 0, unit: 'g' };
  }
  const num = (raw: string | undefined): number => Number(raw?.replace(',', '.'));
  const value = num(match[1]);
  const maxValue = match[2] !== undefined ? num(match[2]) : undefined;
  const rawUnit = match[3];
  const unit = rawUnit === 'ud' ? 'unit' : rawUnit === 'ml' ? 'ml' : 'g';
  return { value, ...(maxValue !== undefined ? { maxValue } : {}), unit };
}

function rowToItem(row: MealItemRow): FoodItem {
  const q = parseQuantity(row.quantity_display);
  return Object.freeze({
    foodId: row.food_id,
    name: row.food_name,
    group: row.food_group,
    portions: row.portions,
    value: q.value,
    ...(q.maxValue !== undefined ? { maxValue: q.maxValue } : {}),
    unit: q.unit,
    isSubstitution: row.is_substitution === 1,
  });
}

export async function loadDay(
  dateKey: string,
  getDb: () => Promise<DbLike> = getDatabase
): Promise<DailyFlowState | null> {
  const db = await getDb();
  const record = await db.getFirstAsync<DayRecordRow>(
    'SELECT date, day_type, is_manually_set FROM day_records WHERE date = ?',
    [dateKey]
  );
  if (record === null) {
    return null;
  }

  const entries = await db.getAllAsync<MealEntryRow>(
    'SELECT moment_id, is_completed, substitutions FROM meal_entries WHERE date = ?',
    [dateKey]
  );

  const completed: Partial<Record<MomentId, boolean>> = {};
  const substitutions: Partial<Record<MomentId, Readonly<Record<string, string>>>> = {};
  for (const entry of entries) {
    if (entry.is_completed === 1) {
      completed[entry.moment_id] = true;
    }
    const subs = entry.substitutions;
    if (subs !== null && subs !== '{}') {
      try {
        substitutions[entry.moment_id] = Object.freeze(
          JSON.parse(subs) as Record<string, string>
        );
      } catch {
        substitutions[entry.moment_id] = Object.freeze({});
      }
    }
  }

  let state = buildDay(dateKey, record.day_type, substitutions, completed, record.is_manually_set === 1);

  // Las comidas completadas se restauran con su instantánea histórica exacta
  // (no se recalculan con catálogos o sustituciones actuales).
  const meals: PlannedMeal[] = [];
  for (const meal of state.meals) {
    if (completed[meal.momentId] !== true) {
      meals.push(meal);
      continue;
    }
    const rows = await db.getAllAsync<MealItemRow>(
      `SELECT i.food_id, i.food_name, i.food_group, i.portions, i.quantity_display, i.is_substitution
         FROM meal_entry_items i
         JOIN meal_entries e ON e.id = i.meal_entry_id
        WHERE e.date = ? AND e.moment_id = ?
        ORDER BY i.id`,
      [dateKey, meal.momentId]
    );
    if (rows.length === 0) {
      meals.push(meal);
      continue;
    }
    meals.push(Object.freeze({ ...meal, items: Object.freeze(rows.map(rowToItem)) }));
  }
  state = Object.freeze({ ...state, meals: Object.freeze(meals) });
  return state;
}

export async function saveDay(
  state: DailyFlowState,
  getDb: () => Promise<DbLike> = getDatabase
): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO day_records (date, day_type, is_manually_set, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(date) DO UPDATE SET day_type = excluded.day_type, updated_at = excluded.updated_at`,
      [state.dateKey, state.dayType, state.isManuallySet ? 1 : 0, now, now]
    );

    const moments = MOMENT_IDS;
    for (const momentId of moments) {
      const meal = state.meals.find((m) => m.momentId === momentId);
      if (!meal) {
        // el momento ya no existe en el día actual: se retira todo su registro
        await db.runAsync(
          `DELETE FROM meal_entry_items
            WHERE meal_entry_id IN (SELECT id FROM meal_entries WHERE date = ? AND moment_id = ?)`,
          [state.dateKey, momentId]
        );
        await db.runAsync('DELETE FROM meal_entries WHERE date = ? AND moment_id = ?', [
          state.dateKey,
          momentId,
        ]);
        continue;
      }
      const entryId = `${state.dateKey}_${momentId}`;
      const subMap = state.substitutions[momentId] ?? {};
      await db.runAsync(
        `INSERT INTO meal_entries (id, date, moment_id, is_completed, completed_at, substitutions)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           is_completed = excluded.is_completed,
           completed_at = excluded.completed_at,
           substitutions = excluded.substitutions`,
        [
          entryId,
          state.dateKey,
          momentId,
          state.completed[momentId] ? 1 : 0,
          state.completed[momentId] ? now : null,
          JSON.stringify(subMap),
        ]
      );

      const wasCompleted = state.completed[momentId] === true;
      // la instantánea se reescribe al guardar: refleja el momento del registro/edición
      await db.runAsync('DELETE FROM meal_entry_items WHERE meal_entry_id = ?', [entryId]);
      if (wasCompleted) {
        for (const item of meal.items) {
          await db.runAsync(
            `INSERT INTO meal_entry_items
               (meal_entry_id, food_id, food_name, food_group, portions, quantity_display, is_substitution)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              entryId,
              item.foodId,
              item.name,
              item.group,
              item.portions,
              itemQuantity(item),
              item.isSubstitution ? 1 : 0,
            ]
          );
        }
      }
    }
  });
}

export interface DayRecordSummary {
  readonly dateKey: string;
  readonly dayType: DayType;
  readonly completedMeals: number;
  readonly totalPlannedMeals: number;
}

export async function listDaySummaries(
  fromDate: Date,
  toDate: Date,
  getDb: () => Promise<DbLike> = getDatabase
): Promise<DayRecordSummary[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    date: string;
    day_type: DayType;
    completed: number;
    planned: number;
  }>(
    `SELECT r.date AS date,
            r.day_type AS day_type,
            (SELECT COUNT(*) FROM meal_entries e WHERE e.date = r.date AND e.is_completed = 1) AS completed,
            (SELECT COUNT(*) FROM meal_entries e WHERE e.date = r.date) AS planned
       FROM day_records r
      WHERE r.date BETWEEN ? AND ?`,
    [dateKeyOf(fromDate), dateKeyOf(toDate)]
  );
  return rows.map((r) =>
    Object.freeze({
      dateKey: r.date,
      dayType: r.day_type,
      completedMeals: r.completed,
      totalPlannedMeals: r.planned,
    })
  );
}

/** Guarda una fecha como "tocada" aunque el día no tenga aún propuesta manual. */
export async function ensureDayRecord(
  dateKey: string,
  getDb: () => Promise<DbLike> = getDatabase
): Promise<void> {
  const db = await getDb();
  const record = await db.getFirstAsync<{ date: string }>(
    'SELECT date FROM day_records WHERE date = ?',
    [dateKey]
  );
  if (record === null) {
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO day_records (date, day_type, is_manually_set, created_at, updated_at)
       VALUES (?, ?, 0, ?, ?)`,
      [dateKey, suggestedDayType(dateKey), now, now]
    );
  }
}

export { parseDateKey };
