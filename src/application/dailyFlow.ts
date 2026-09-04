/**
 * Estado y builder del día (M2). Funciones puras que combinan:
 * - data (weekly plan, recetas, bloques fijos) y
 * - dominio (cuotas clínicas + PortionEngine),
 * sin React ni I/O. La persistencia (M3) vive aparte.
 */

import {
  type DayType,
  type FoodGroupId,
  type FoodItemSelection,
  type MeasurementUnit,
  type MomentId,
} from '@/domain/nutrition/types';
import {
  getDayMoments,
  MOMENT_LABELS,
  requireMomentTargets,
} from '@/domain/nutrition/dailyStructure';
import { buildSelection, calculateNetFat, substituteFood } from '@/domain/nutrition/PortionEngine';
import { formatQuantity } from '@/domain/nutrition/quantities';
import { requireFood } from '@/data/nutrition/canonicalFoods';
import { FIXED_BLOCKS } from '@/data/nutrition/fixedMeals';
import type { FixedBlock } from '@/data/nutrition/fixedMeals';
import { recipeById } from '@/data/recipes/recipes';
import { WEEKLY_PLAN, type WeekdayIndex } from '@/data/weekly-plan/weeklyPlan';

export interface FoodItem {
  readonly foodId: string;
  readonly name: string;
  readonly group: FoodGroupId;
  readonly portions: number;
  readonly value: number;
  readonly maxValue?: number;
  readonly unit: MeasurementUnit;
  readonly rawStateNote?: string;
  readonly isSubstitution: boolean;
}

export interface PlannedMeal {
  readonly momentId: MomentId;
  readonly label: string;
  readonly title: string;
  readonly variantName?: string;
  readonly recipeId?: string;
  readonly items: readonly FoodItem[];
  readonly extras: readonly string[];
  readonly targetSummary: string;
  /** Nota cuando la grasa queda recortada por huevo con yema / pescado azul. */
  readonly fatNote?: string;
  readonly note?: string;
}

type Substitutions = Readonly<Partial<Record<MomentId, Readonly<Record<string, string>>>>>;

export interface DailyFlowState {
  readonly dateKey: string;
  readonly dayType: DayType;
  readonly isManuallySet: boolean;
  readonly meals: readonly PlannedMeal[];
  readonly completed: Readonly<Partial<Record<MomentId, boolean>>>;
  readonly substitutions: Substitutions;
}

export function dateKeyOf(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(dateKey: string): Date {
  const parts = dateKey.split('-').map((p) => Number(p));
  const y = parts[0];
  const m = parts[1];
  const d = parts[2];
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

/** 0 = lunes … 6 = domingo (ISO). */
export function weekdayIndexOf(dateKey: string): WeekdayIndex {
  return ((parseDateKey(dateKey).getDay() + 6) % 7) as WeekdayIndex;
}

export function suggestedDayType(dateKey: string): DayType {
  return WEEKLY_PLAN[weekdayIndexOf(dateKey)].defaultType;
}

function toItem(
  sel: FoodItemSelection,
  isSubstitution: boolean
): FoodItem {
  const q = sel.calculatedQuantity;
  return Object.freeze({
    foodId: sel.food.id,
    name: sel.food.name,
    group: sel.food.group,
    portions: sel.portions,
    value: q.value,
    ...(q.maxValue !== undefined ? { maxValue: q.maxValue } : {}),
    unit: q.unit,
    ...(sel.food.rawStateNote ? { rawStateNote: sel.food.rawStateNote } : {}),
    isSubstitution,
  });
}

function withSubstitution(
  sel: FoodItemSelection,
  substitutions: Readonly<Record<string, string>>
): FoodItem {
  const targetId = substitutions[sel.food.id];
  const target = targetId ? requireFood(targetId) : undefined;
  if (!target || target.group !== sel.food.group) {
    return toItem(sel, false);
  }
  return toItem(substituteFood(sel, target), true);
}

/** Fusiona líneas duplicadas del mismo alimento conservando el orden. */
function mergeItemsByFood(items: readonly FoodItem[]): FoodItem[] {
  const byId = new Map<string, FoodItem[]>();
  for (const item of items) {
    const list = byId.get(item.foodId) ?? [];
    list.push(item);
    byId.set(item.foodId, list);
  }
  const merged: FoodItem[] = [];
  for (const item of items) {
    const group = byId.get(item.foodId);
    if (!group || group.length === 0) {
      continue;
    }
    const [first, ...rest] = group;
    if (first === undefined) {
      continue;
    }
    const portions = group.reduce((a, i) => a + i.portions, 0);
    const sel = portions === first.portions && rest.length === 0
      ? buildSelection(requireFood(first.foodId), first.portions)
      : buildSelection(requireFood(first.foodId), portions);
    merged.push(toItem(sel, group.some((i) => i.isSubstitution)));
    byId.set(item.foodId, []);
  }
  return merged;
}

function targetSummary(
  momentId: MomentId,
  dayType: DayType,
  freeVegetables: boolean,
  proteinYogurt: boolean
): string {
  const t = requireMomentTargets(momentId, dayType);
  const parts: string[] = [];
  if (t.proteinPortions > 0) parts.push(`${t.proteinPortions}R proteína`);
  if (t.carbPortions > 0) parts.push(`${t.carbPortions}R HCC`);
  if (t.fatPortions > 0) parts.push(`${t.fatPortions}R grasa`);
  if (freeVegetables) parts.push('verdura libre');
  if (t.fruitCount > 0) parts.push(`${t.fruitCount} fruta`);
  if (t.freeFruitNote) parts.push('fruta libre');
  if (proteinYogurt) parts.push('yogur proteico');
  return parts.join(' · ');
}

function buildFixedMeal(
  momentId: MomentId,
  dayType: DayType,
  substitutions: Readonly<Record<string, string>>,
  block: FixedBlock
): PlannedMeal {
  return Object.freeze({
    momentId,
    label: MOMENT_LABELS[momentId],
    title: block.label,
    items: Object.freeze(block.items.map((s) => withSubstitution(s, substitutions))),
    extras: block.extras,
    targetSummary: targetSummary(momentId, dayType, false, false),
    ...(block.note ? { note: block.note } : {}),
  });
}

export function buildRecipeMeal(
  momentId: MomentId,
  dayType: DayType,
  recipeId: string,
  variantName: string | undefined,
  proteinSwap: string | undefined,
  substitutions: Readonly<Record<string, string>>
): PlannedMeal {
  const recipe = recipeById(recipeId);
  const targets = requireMomentTargets(momentId, dayType);

  // 1) Proteína base (propuesta = receta del plan; sustituciones por encima).
  const proteinSelections: FoodItemSelection[] = recipe.proteins.map((c) => {
    const base = buildSelection(requireFood(c.foodId), c.proteinPortions);
    // proteinSwap de la semana cerrada (p. ej. sábado "pasta pollo" con pollo).
    if (proteinSwap !== undefined && c.foodId === recipe.proteins[0]?.foodId) {
      const swapFood = requireFood(proteinSwap);
      if (swapFood.group === base.food.group) {
        return substituteFood(base, swapFood);
      }
    }
    return base;
  });
  const proteinItemsRaw = proteinSelections.map((s) => withSubstitution(s, substitutions));
  // Alimento sustituido que coincide con otro de la misma receta se fusiona
  // (ej. quitar el huevo del loaded bowl poniendo +1R de pollo => una línea 4R).
  const proteinItems = mergeItemsByFood(proteinItemsRaw);
  // 2) Hidrato: alimento de la receta con las raciones exactas del día.
  const carbSelection = buildSelection(requireFood(recipe.carbFoodId), targets.carbPortions);
  const carbItem = withSubstitution(carbSelection, substitutions);

  // 3) Grasa añadida neta tras deducciones (BR-006/BR-007).
  const proteinSelectionList = proteinItems.map((item) =>
    buildSelection(requireFood(item.foodId), item.portions)
  );
  const net = calculateNetFat({
    requiredFatPortions: targets.fatPortions,
    proteinItems: proteinSelectionList,
    fatFood: requireFood(recipe.fatFoodId),
  });
  const fatItem = net.fatSelection ? withSubstitution(net.fatSelection, substitutions) : null;

  const items: readonly FoodItem[] = Object.freeze([
    ...proteinItems,
    carbItem,
    ...(fatItem ? [fatItem] : []),
  ]);

  const extras: string[] = [];
  if (targets.freeVegetables) {
    extras.push('Verdura libre: tomate, pepino, calabacín, pimiento o cebolla');
  }
  if (targets.proteinYogurt) {
    extras.push('1 yogur rico en proteínas (parte puede ir en la salsa)');
  }
  if (recipe.clinicalNote) {
    extras.push(recipe.clinicalNote);
  }

  const fatNote =
    net.deductionPortions > 0
      ? net.fatSelection === null
        ? `Grasa cubierta: -${net.deductionPortions}R por huevo con yema / pescado azul`
        : `Grasa recortada: -${net.deductionPortions}R para ${formatQuantity(net.fatSelection.calculatedQuantity)} de ${net.fatSelection.food.name}`
      : undefined;

  return Object.freeze({
    momentId,
    label: MOMENT_LABELS[momentId],
    title: recipe.name,
    ...(variantName ? { variantName } : {}),
    recipeId,
    items,
    extras: Object.freeze(extras),
    targetSummary: targetSummary(
      momentId,
      dayType,
      targets.freeVegetables,
      targets.proteinYogurt
    ),
    ...(fatNote ? { fatNote } : {}),
  });
}

export function buildDay(
  dateKey: string,
  dayType: DayType,
  substitutions: Substitutions = {},
  completed: Partial<Record<MomentId, boolean>> = {},
  isManuallySet = false
): DailyFlowState {
  const dayPlan = WEEKLY_PLAN[weekdayIndexOf(dateKey)];
  const fixed = FIXED_BLOCKS[dayType];

  const meals: PlannedMeal[] = getDayMoments(dayType).map((momentId) => {
    const subs = substitutions[momentId] ?? {};
    switch (momentId) {
      case 'PRE_WORKOUT': {
        const block = fixed.preWorkout;
        if (block === null) {
          throw new Error('El preentreno no existe en día de descanso');
        }
        return buildFixedMeal(momentId, dayType, subs, block);
      }
      case 'ALMUERZO':
        return buildFixedMeal(momentId, dayType, subs, fixed.lunch);
      case 'MERIENDA':
        return buildFixedMeal(momentId, dayType, subs, fixed.snack);
      case 'COMIDA':
        return buildRecipeMeal(
          momentId,
          dayType,
          dayPlan.lunch.recipeId,
          dayPlan.lunch.variantName,
          dayPlan.lunch.proteinSwap?.to,
          subs
        );
      case 'CENA':
        return buildRecipeMeal(
          momentId,
          dayType,
          dayPlan.dinner.recipeId,
          dayPlan.dinner.variantName,
          dayPlan.dinner.proteinSwap?.to,
          subs
        );
    }
  });

  const validCompleted: Partial<Record<MomentId, boolean>> = {};
  for (const meal of meals) {
    if (completed[meal.momentId]) {
      validCompleted[meal.momentId] = true;
    }
  }

  return Object.freeze({
    dateKey,
    dayType,
    isManuallySet,
    meals: Object.freeze(meals),
    completed: Object.freeze(validCompleted),
    substitutions: Object.freeze(substitutions),
  });
}

export function createInitialState(dateKey: string): DailyFlowState {
  return buildDay(dateKey, suggestedDayType(dateKey));
}

export function toggleMealCompleted(
  state: DailyFlowState,
  momentId: MomentId
): DailyFlowState {
  const next = { ...state.completed };
  if (next[momentId]) {
    delete next[momentId];
  } else {
    next[momentId] = true;
  }
  return Object.freeze({ ...state, completed: next });
}

export function setDayType(state: DailyFlowState, dayType: DayType): DailyFlowState {
  return Object.freeze({
    ...buildDay(state.dateKey, dayType, state.substitutions, state.completed, true),
    isManuallySet: true,
  });
}

export function applySubstitution(
  state: DailyFlowState,
  momentId: MomentId,
  sourceFoodId: string,
  targetFoodId: string
): DailyFlowState {
  const mealSubs = { ...(state.substitutions[momentId] ?? {}) };
  if (mealSubs[sourceFoodId] === targetFoodId) {
    delete mealSubs[sourceFoodId];
  } else {
    mealSubs[sourceFoodId] = targetFoodId;
  }
  const substitutions = { ...state.substitutions, [momentId]: Object.freeze(mealSubs) };
  return Object.freeze(
    buildDay(state.dateKey, state.dayType, substitutions, state.completed, state.isManuallySet)
  );
}

export function completedCount(state: DailyFlowState): number {
  return state.meals.filter((m) => state.completed[m.momentId]).length;
}

export function formatItemLine(item: FoodItem): string {
  const q = formatQuantity({
    value: item.value,
    ...(item.maxValue !== undefined ? { maxValue: item.maxValue } : {}),
    unit: item.unit,
  });
  return `${q} · ${item.name}${item.rawStateNote ? ` (${item.rawStateNote})` : ''}`;
}
