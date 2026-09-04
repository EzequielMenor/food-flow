/**
 * Tipos del núcleo nutricional (Food Flow).
 * Autosuficiente: no importa de ninguna otra capa.
 * Ver docs/domain/portion-engine.md §1.
 */

export type FoodGroupId = 'PROTEIN' | 'CARBOHYDRATE' | 'FAT';

export type MeasurementUnit = 'g' | 'ml' | 'unit';

export type ProteinCategory =
  | 'LEAN_MEAT'
  | 'WHITE_FISH'
  | 'FATTY_FISH'
  | 'EGG_WITH_YOLK'
  | 'POWDER'
  | 'DAIRY';

export interface QuantitySpec {
  readonly value: number;
  /** Permite modelar rangos exactos como 50–55 g en aguacate. */
  readonly maxValue?: number;
  readonly unit: MeasurementUnit;
}

export interface Food {
  readonly id: string;
  readonly name: string;
  readonly group: FoodGroupId;
  readonly baseQuantity: QuantitySpec;
  readonly proteinCategory?: ProteinCategory;
  readonly rawStateNote?: string;
}

export interface FoodItemSelection {
  readonly food: Food;
  readonly portions: number;
  readonly calculatedQuantity: QuantitySpec;
}

export type DayType = 'TRAINING' | 'REST';

export type MomentId = 'PRE_WORKOUT' | 'ALMUERZO' | 'COMIDA' | 'MERIENDA' | 'CENA';

export class InvalidPortionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPortionError';
  }
}

export class IncompatibleFoodGroupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IncompatibleFoodGroupError';
  }
}
