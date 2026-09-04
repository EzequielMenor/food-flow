/**
 * Núcleo puro de cálculo de raciones (Food Flow).
 * Sin dependencias de React Native ni I/O. Ver docs/domain/portion-engine.md.
 */

import {
  type Food,
  type FoodItemSelection,
  type QuantitySpec,
  InvalidPortionError,
  IncompatibleFoodGroupError,
} from '@/domain/nutrition/types';

/** Raciones → cantidad, preservando rangos (aguacate 2R = 100–110 g). */
export function portionsToQuantity(food: Food, portions: number): QuantitySpec {
  if (!(portions > 0) || Number.isNaN(portions)) {
    throw new InvalidPortionError(`Las raciones deben ser mayores que 0. Recibido: ${portions}`);
  }
  const base = food.baseQuantity;
  return {
    value: portions * base.value,
    ...(base.maxValue !== undefined ? { maxValue: portions * base.maxValue } : {}),
    unit: base.unit,
  };
}

/**
 * Conversión inversa (FR-021): raciones que representa una cantidad real.
 * Base de la sustitución arroz 90 g → patata 300 g (BR-009).
 */
export function portionsFromQuantity(food: Food, value: number): number {
  if (!(value > 0) || Number.isNaN(value)) {
    throw new InvalidPortionError(`La cantidad debe ser mayor que 0. Recibido: ${value}`);
  }
  return value / food.baseQuantity.value;
}

/** Sustituye un alimento por otro del MISMO grupo manteniendo las raciones. */
export function substituteFood(current: FoodItemSelection, targetFood: Food): FoodItemSelection {
  if (current.food.group !== targetFood.group) {
    throw new IncompatibleFoodGroupError(
      `No se puede sustituir alimento del grupo ${current.food.group} por ${targetFood.group}`
    );
  }
  return buildSelection(targetFood, current.portions);
}

/** Construye una selección (prohibido 0R: cantidad inexistente). */
export function buildSelection(food: Food, portions: number): FoodItemSelection {
  return { food, portions, calculatedQuantity: portionsToQuantity(food, portions) };
}

/** ¿La proteína lleva lípidos intrínsecos? Regla genérica por categoría (BR-006). */
export function isFatDeductingProtein(food: Food): boolean {
  return food.proteinCategory === 'EGG_WITH_YOLK' || food.proteinCategory === 'FATTY_FISH';
}

/** 0.5R de grasa por cada ración de proteína de huevo con yema o pescado azul. */
export function calculateFatDeduction(proteinItems: readonly FoodItemSelection[]): number {
  let deduction = 0;
  for (const item of proteinItems) {
    if (isFatDeductingProtein(item.food)) {
      deduction += item.portions * 0.5;
    }
  }
  return deduction;
}

export interface NetFatInput {
  readonly requiredFatPortions: number;
  readonly proteinItems: readonly FoodItemSelection[];
  /** Alimento de grasa añadida (AOVE o crema de frutos secos). */
  readonly fatFood: Food;
}

export interface NetFatResult {
  readonly deductionPortions: number;
  readonly netPortions: number;
  /** null cuando la grasa neta es 0R: no queda grasa que añadir (BR-007). */
  readonly fatSelection: FoodItemSelection | null;
}

/**
 * Grasa neta tras deducciones con suelo no negativo (BR-006, BR-007).
 * Si la deducción cubre el objetivo, el resultado es 0R/0 g (se omite la línea
 * de grasa en pantalla),nunca negativa y nunca lanza.
 */
export function calculateNetFat({
  requiredFatPortions,
  proteinItems,
  fatFood,
}: NetFatInput): NetFatResult {
  const deductionPortions = calculateFatDeduction(proteinItems);
  const netPortions = Math.max(0, requiredFatPortions - deductionPortions);
  return {
    deductionPortions,
    netPortions,
    fatSelection: netPortions > 0 ? buildSelection(fatFood, netPortions) : null,
  };
}
