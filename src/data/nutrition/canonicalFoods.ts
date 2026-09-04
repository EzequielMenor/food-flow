/**
 * Catálogo canónico de equivalencias de 1R según la pauta de Bel·lan Farmacia
 * (BR-008). Es dato de referencia (vive en src/data), pero respeta la fuente
 * de verdad nutricional: el rango del aguacate (50–55 g) y las categorías con
 * deducción de grasa quedan preservados tal cual los define la pauta.
 */

import {
  type Food,
  type FoodGroupId,
  type MeasurementUnit,
  type QuantitySpec,
} from '@/domain/nutrition/types';

function makeFood(f: {
  id: string;
  name: string;
  group: Food['group'];
  value: number;
  maxValue?: number;
  unit: MeasurementUnit;
  proteinCategory?: Food['proteinCategory'];
  rawStateNote?: string;
}): Food {
  const baseQuantity: QuantitySpec =
    f.maxValue !== undefined
      ? Object.freeze({ value: f.value, maxValue: f.maxValue, unit: f.unit })
      : Object.freeze({ value: f.value, unit: f.unit });
  return Object.freeze({
    id: `food:${f.id}`,
    name: f.name,
    group: f.group,
    baseQuantity,
    ...(f.proteinCategory ? { proteinCategory: f.proteinCategory } : {}),
    ...(f.rawStateNote ? { rawStateNote: f.rawStateNote } : {}),
  });
}

// --- Proteína -------------------------------------------------------------
export const POLLO = makeFood({ id: 'pollo', name: 'Pechuga de pollo', group: 'PROTEIN', value: 50, unit: 'g', proteinCategory: 'LEAN_MEAT' });
export const PAVO = makeFood({ id: 'pavo', name: 'Pavo', group: 'PROTEIN', value: 50, unit: 'g', proteinCategory: 'LEAN_MEAT' });
export const TERNERA_MAGRA = makeFood({ id: 'ternera-magra', name: 'Ternera magra', group: 'PROTEIN', value: 50, unit: 'g', proteinCategory: 'LEAN_MEAT' });
export const MERLUZA = makeFood({ id: 'merluza', name: 'Merluza', group: 'PROTEIN', value: 75, unit: 'g', proteinCategory: 'WHITE_FISH' });
export const SALMON = makeFood({ id: 'salmon', name: 'Salmón', group: 'PROTEIN', value: 75, unit: 'g', proteinCategory: 'FATTY_FISH' });
export const HUEVO = makeFood({ id: 'huevo', name: 'Huevo entero (con yema)', group: 'PROTEIN', value: 1, unit: 'unit', proteinCategory: 'EGG_WITH_YOLK' });
export const PROTEINA_POLVO = makeFood({ id: 'proteina-polvo', name: 'Proteína en polvo', group: 'PROTEIN', value: 10, unit: 'g', proteinCategory: 'POWDER' });
export const LECHE_SEMIDESNATADA = makeFood({ id: 'leche-semidesnatada', name: 'Leche semidesnatada', group: 'PROTEIN', value: 200, unit: 'ml', proteinCategory: 'DAIRY' });
export const QUESO_FRESCO = makeFood({ id: 'queso-fresco', name: 'Queso fresco', group: 'PROTEIN', value: 70, unit: 'g', proteinCategory: 'DAIRY' });

// --- Hidratos -------------------------------------------------------------
export const ARROZ = makeFood({ id: 'arroz', name: 'Arroz integral o blanco', group: 'CARBOHYDRATE', value: 15, unit: 'g', rawStateNote: 'en crudo' });
export const PASTA_INTEGRAL = makeFood({ id: 'pasta-integral', name: 'Pasta integral', group: 'CARBOHYDRATE', value: 15, unit: 'g', rawStateNote: 'en crudo' });
export const AVENA = makeFood({ id: 'avena', name: 'Avena (copos)', group: 'CARBOHYDRATE', value: 15, unit: 'g', rawStateNote: 'en crudo' });
export const PAN_INTEGRAL = makeFood({ id: 'pan-integral', name: 'Pan integral', group: 'CARBOHYDRATE', value: 20, unit: 'g' });
export const PATATA = makeFood({ id: 'patata', name: 'Patata / Boniato', group: 'CARBOHYDRATE', value: 50, unit: 'g', rawStateNote: 'en crudo' });

// --- Grasa ----------------------------------------------------------------
export const AOVE = makeFood({ id: 'aove', name: 'AOVE', group: 'FAT', value: 10, unit: 'g' });
export const CREMA_FRUTOS_SECOS = makeFood({ id: 'crema-frutos-secos', name: 'Frutos secos o crema 100%', group: 'FAT', value: 15, unit: 'g' });
/** 1R grasa = 50–55 g. Rango estricto de la pauta, preservado (nunca reducir a 50). */
export const AGUACATE = makeFood({ id: 'aguacate', name: 'Aguacate', group: 'FAT', value: 50, maxValue: 55, unit: 'g' });

export const FOODS: readonly Food[] = Object.freeze([
  POLLO,
  PAVO,
  TERNERA_MAGRA,
  MERLUZA,
  SALMON,
  HUEVO,
  PROTEINA_POLVO,
  LECHE_SEMIDESNATADA,
  QUESO_FRESCO,
  ARROZ,
  PASTA_INTEGRAL,
  AVENA,
  PAN_INTEGRAL,
  PATATA,
  AOVE,
  CREMA_FRUTOS_SECOS,
  AGUACATE,
]);

const foodIndex: ReadonlyMap<string, Food> = new Map(FOODS.map((f) => [f.id, f]));

export function foodById(id: string): Food | undefined {
  return foodIndex.get(id);
}

/** Igual que foodById pero lanzando si el id no existe (integridad de datos). */
export function requireFood(id: string): Food {
  const food = foodIndex.get(id);
  if (!food) {
    throw new Error(`Alimento no definido en el catálogo canónico: ${id}`);
  }
  return food;
}

/** Opciones del modal de sustitución: mismo grupo exacto (BR-009). */
export function getFoodsByGroup(group: FoodGroupId): readonly Food[] {
  return FOODS.filter((f) => f.group === group);
}
