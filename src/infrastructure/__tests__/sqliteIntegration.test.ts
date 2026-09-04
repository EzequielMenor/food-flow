/**
 * Tests de integración reales contra SQLite en memoria usando el adaptador
 * `node:sqlite` (Node 22+) sobre `DbLike`. Sin mocks, validando queries,
 * transacciones, claves foráneas, snapshots y preservación de estado.
 */

import { createMigratedTestDb, createNodeSqliteDb } from '../nodeSqliteAdapter';
import { runMigrations } from '../migrations';
import {
  loadDay,
  saveDay,
  listDaySummaries,
  ensureDayRecord,
} from '../dayRepository';
import {
  loadShoppingList,
  syncShoppingList,
  ensureShoppingList,
  toggleShoppingItem,
  resetShoppingList,
  addCustomShoppingItem,
  deleteShoppingItem,
  shoppingItemId,
} from '../shoppingRepository';
import {
  buildDay,
  toggleMealCompleted,
  setDayType,
  applySubstitution,
  parseDateKey,
} from '@/application/dailyFlow';
import { generateShoppingList } from '@/application/generateShoppingList';
import type { DbLike } from '../database';

describe('SQLite Integration: Migrations & Schema', () => {
  it('applies migrations cleanly and sets user_version to 1', async () => {
    const db = createNodeSqliteDb();
    await runMigrations(db);

    const versionRow = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    expect(versionRow?.user_version).toBe(1);

    // Idempotencia: ejecutarla de nuevo no falla ni altera versión
    await runMigrations(db);
    const recheckRow = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    expect(recheckRow?.user_version).toBe(1);
  });
});

describe('SQLite Integration: dayRepository', () => {
  let db: DbLike;
  const testDbGetter = () => Promise.resolve(db);

  beforeEach(async () => {
    db = await createMigratedTestDb();
  });

  it('returns null for an unrecorded date', async () => {
    const result = await loadDay('2026-09-07', testDbGetter);
    expect(result).toBeNull();
  });

  it('saves and loads a day with completed meals preserving historical snapshot', async () => {
    const dateKey = '2026-09-07'; // Lunes -> entreno
    let state = buildDay(dateKey, 'TRAINING');

    // Marcamos COMIDA como completada
    state = toggleMealCompleted(state, 'COMIDA');

    await saveDay(state, testDbGetter);

    const loaded = await loadDay(dateKey, testDbGetter);
    expect(loaded).not.toBeNull();
    expect(loaded!.dateKey).toBe(dateKey);
    expect(loaded!.dayType).toBe('TRAINING');
    expect(loaded!.completed.COMIDA).toBe(true);
    expect(loaded!.completed.CENA).toBeUndefined();

    // Verificamos que la comida completada tiene ítems en la tabla de snapshots
    const comida = loaded!.meals.find((m) => m.momentId === 'COMIDA');
    expect(comida).toBeDefined();
    expect(comida!.items.length).toBeGreaterThan(0);
    expect(comida!.items[0]?.foodId).toBeDefined();
    expect(comida!.items[0]?.value).toBeGreaterThan(0);
    expect(comida!.items[0]?.unit).toBeDefined();
  });

  it('preserves substitutions on reload', async () => {
    const dateKey = '2026-09-07';
    let state = buildDay(dateKey, 'TRAINING');
    // En ALMUERZO: avena -> arroz
    state = applySubstitution(state, 'ALMUERZO', 'food:avena', 'food:arroz');
    state = toggleMealCompleted(state, 'ALMUERZO');

    await saveDay(state, testDbGetter);

    const loaded = await loadDay(dateKey, testDbGetter);
    expect(loaded).not.toBeNull();
    expect(loaded!.substitutions.ALMUERZO?.['food:avena']).toBe('food:arroz');

    const almuerzo = loaded!.meals.find((m) => m.momentId === 'ALMUERZO');
    const substitutedItem = almuerzo?.items.find((i) => i.foodId === 'food:arroz');
    expect(substitutedItem).toBeDefined();
    expect(substitutedItem?.isSubstitution).toBe(true);
  });

  it('updates day type and cleans unneeded moments when switching to REST', async () => {
    const dateKey = '2026-09-07';
    let state = buildDay(dateKey, 'TRAINING');
    state = toggleMealCompleted(state, 'PRE_WORKOUT');
    await saveDay(state, testDbGetter);

    // Cambiamos a REST (el preentreno ya no existe)
    state = setDayType(state, 'REST');
    await saveDay(state, testDbGetter);

    const loaded = await loadDay(dateKey, testDbGetter);
    expect(loaded!.dayType).toBe('REST');
    expect(loaded!.meals.length).toBe(4);
    expect(loaded!.meals.find((m) => m.momentId === 'PRE_WORKOUT')).toBeUndefined();
  });

  it('aggregates day summaries correctly', async () => {
    const d1 = '2026-09-07';
    const d2 = '2026-09-08';

    let s1 = buildDay(d1, 'TRAINING');
    s1 = toggleMealCompleted(s1, 'COMIDA');
    s1 = toggleMealCompleted(s1, 'CENA');
    await saveDay(s1, testDbGetter);

    let s2 = buildDay(d2, 'REST');
    s2 = toggleMealCompleted(s2, 'COMIDA');
    await saveDay(s2, testDbGetter);

    const summaries = await listDaySummaries(
      new Date(2026, 8, 7),
      new Date(2026, 8, 8),
      testDbGetter
    );

    expect(summaries).toHaveLength(2);
    const sum1 = summaries.find((s) => s.dateKey === d1);
    const sum2 = summaries.find((s) => s.dateKey === d2);

    expect(sum1?.completedMeals).toBe(2);
    expect(sum1?.totalPlannedMeals).toBe(5);
    expect(sum2?.completedMeals).toBe(1);
    expect(sum2?.totalPlannedMeals).toBe(4);
  });

  it('ensureDayRecord writes suggested day if not existing', async () => {
    const dateKey = '2026-09-07';
    await ensureDayRecord(dateKey, testDbGetter);

    const record = await db.getFirstAsync<{ date: string; day_type: string }>(
      'SELECT date, day_type FROM day_records WHERE date = ?',
      [dateKey]
    );
    expect(record).not.toBeNull();
    expect(record?.date).toBe(dateKey);
    expect(record?.day_type).toBe('TRAINING');
  });
});

describe('SQLite Integration: shoppingRepository', () => {
  let db: DbLike;
  const testDbGetter = () => Promise.resolve(db);
  const sampleWeekKey = '2026-09-07';

  beforeEach(async () => {
    db = await createMigratedTestDb();
  });

  it('syncs algorithmic shopping list and loads items ordered', async () => {
    const lines = generateShoppingList(parseDateKey(sampleWeekKey));
    const items = await syncShoppingList(sampleWeekKey, lines, testDbGetter);

    expect(items.length).toBe(lines.length);
    expect(items[0]?.isChecked).toBe(false);

    const pollo = items.find((i) => i.productName.includes('Pollo') || i.productName.includes('Pechuga'));
    expect(pollo).toBeDefined();

    const loaded = await loadShoppingList(sampleWeekKey, testDbGetter);
    expect(loaded.length).toBe(items.length);
  });

  it('preserves isChecked state when re-syncing', async () => {
    const lines = generateShoppingList(parseDateKey(sampleWeekKey));
    await syncShoppingList(sampleWeekKey, lines, testDbGetter);

    // Marcamos un ítem
    const targetId = shoppingItemId(sampleWeekKey, lines[0]!.id);
    await toggleShoppingItem(targetId, true, testDbGetter);

    let loaded = await loadShoppingList(sampleWeekKey, testDbGetter);
    expect(loaded.find((i) => i.id === targetId)?.isChecked).toBe(true);

    // Re-sincronizamos
    await syncShoppingList(sampleWeekKey, lines, testDbGetter);

    loaded = await loadShoppingList(sampleWeekKey, testDbGetter);
    expect(loaded.find((i) => i.id === targetId)?.isChecked).toBe(true);
  });

  it('resets all checked items to false', async () => {
    const lines = generateShoppingList(parseDateKey(sampleWeekKey));
    await syncShoppingList(sampleWeekKey, lines, testDbGetter);

    const id1 = shoppingItemId(sampleWeekKey, lines[0]!.id);
    const id2 = shoppingItemId(sampleWeekKey, lines[1]!.id);
    await toggleShoppingItem(id1, true, testDbGetter);
    await toggleShoppingItem(id2, true, testDbGetter);

    await resetShoppingList(sampleWeekKey, testDbGetter);

    const loaded = await loadShoppingList(sampleWeekKey, testDbGetter);
    expect(loaded.every((i) => !i.isChecked)).toBe(true);
  });

  it('supports custom shopping items and ensures list if empty', async () => {
    // ensureShoppingList genera si está vacía
    const initial = await ensureShoppingList(sampleWeekKey, undefined, testDbGetter);
    expect(initial.length).toBeGreaterThan(0);

    // Añade ítem personalizado
    const custom = await addCustomShoppingItem(
      sampleWeekKey,
      {
        category: 'PANTRY',
        productName: 'Café de especialidad',
        quantityDisplay: '1 paquete',
        note: 'Tueste natural',
      },
      testDbGetter
    );
    expect(custom.productName).toBe('Café de especialidad');

    // Verifica que persiste y no se borra al re-sincronizar
    const lines = generateShoppingList(parseDateKey(sampleWeekKey));
    await syncShoppingList(sampleWeekKey, lines, testDbGetter);

    const loaded = await loadShoppingList(sampleWeekKey, testDbGetter);
    const foundCustom = loaded.find((i) => i.id === custom.id);
    expect(foundCustom).toBeDefined();

    // Borrado
    await deleteShoppingItem(custom.id, testDbGetter);
    const afterDelete = await loadShoppingList(sampleWeekKey, testDbGetter);
    expect(afterDelete.find((i) => i.id === custom.id)).toBeUndefined();
  });
});
