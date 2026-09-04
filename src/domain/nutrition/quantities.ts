/**
 * Utilidades de presentación canónica de cantidades (puras, sin RN).
 * Los rangos se preservan con barra en medial (50–55 g), nunca se reducen al mínimo.
 */

import type { Food, FoodItemSelection, QuantitySpec } from './types';
import { buildSelection } from './PortionEngine';

export function formatQuantity(quantity: QuantitySpec): string {
  const unit = quantity.unit === 'unit' ? 'ud' : quantity.unit;
  const min = formatNumber(quantity.value);
  if (quantity.maxValue !== undefined) {
    return `${min}–${formatNumber(quantity.maxValue)} ${unit}`;
  }
  return `${min} ${unit}`;
}

/** Construye una selección canónica alimento + raciones (atajo para bloques fijos). */
export function selection(food: Food, portions: number): FoodItemSelection {
  return buildSelection(food, portions);
}

/** Redondea a 1 decimal el ruido de coma flotante al mostrar. */
function formatNumber(n: number): string {
  const rounded = Math.round(n * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1).replace(/\.0$/, '');
}
