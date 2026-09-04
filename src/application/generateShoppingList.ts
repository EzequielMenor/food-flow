/**
 * M6: pipeline de compra. Plan semanal -> propuestas -> agregación por producto.
 * Es una función pura: sin SQLite y sin UI. Los checks del usuario se persisten
 * aparte (infrastructure/shoppingRepository) y se fusionan en la UI.
 */

import { buildDay, suggestedDayType, dateKeyOf, parseDateKey } from '@/application/dailyFlow';
import type { FoodGroupId } from '@/domain/nutrition/types';
import { getFoodsByGroup } from '@/data/nutrition/canonicalFoods';

export type ShoppingCategory =
  | 'PROTEIN'
  | 'FISH'
  | 'DAIRY'
  | 'CARBS'
  | 'FATS'
  | 'PRODUCE'
  | 'PANTRY';

export interface ShoppingLine {
  readonly id: string;
  readonly category: ShoppingCategory;
  readonly name: string;
  readonly quantityDisplay: string;
  readonly note?: string;
  readonly sortHint: number;
}

// Categorías de supermercado (los grupos nutricionales no bastan): el pescado
// y los lácteos salen del mismo grupo PROTEIN de la pauta.
const CATEGORY_BY_FOOD: Readonly<Record<FoodGroupId, Partial<Record<string, ShoppingCategory>>>> = {
  PROTEIN: {
    'food:merluza': 'FISH',
    'food:salmon': 'FISH',
    'food:leche-semidesnatada': 'DAIRY',
    'food:queso-fresco': 'DAIRY',
  },
  CARBOHYDRATE: {
    'food:avena': 'CARBS',
    'food:arroz': 'CARBS',
    'food:pasta-integral': 'CARBS',
    'food:pan-integral': 'CARBS',
    'food:patata': 'PRODUCE',
  },
  FAT: {
    'food:aove': 'FATS',
    'food:crema-frutos-secos': 'FATS',
    'food:aguacate': 'PRODUCE',
  },
};

const DEFAULT_CATEGORY: Record<FoodGroupId, ShoppingCategory> = {
  PROTEIN: 'PROTEIN',
  CARBOHYDRATE: 'CARBS',
  FAT: 'FATS',
};

/**
 * Frescos y despensa según la lista cerrada del PDF (págs. 11-12). Son datos de
 * compra, no cálculo: las cantidades agregadas de almacén salen de las comidas;
 * fruta/verdura/especias son "libres" y se listan como guía de compra fija.
 */
export const PRODUCE_AND_PANTRY: readonly Omit<ShoppingLine, 'sortHint'>[] = Object.freeze([
  Object.freeze({ id: 'prod:platano', category: 'PRODUCE' as const, name: 'Plátanos', quantityDisplay: '7 ud', note: '4 para preentreno + 3 para bowls/batidos' }),
  Object.freeze({ id: 'prod:manzana', category: 'PRODUCE' as const, name: 'Manzanas', quantityDisplay: '7 ud', note: 'Meriendas fáciles' }),
  Object.freeze({ id: 'prod:fruta-temporada', category: 'PRODUCE' as const, name: 'Fruta de temporada', quantityDisplay: '4 ud', note: 'Completar fruta de almuerzos/meriendas' }),
  Object.freeze({ id: 'prod:tomate', category: 'PRODUCE' as const, name: 'Tomate', quantityDisplay: '1 kg', note: 'Ensaladas, pico de gallo, bowls' }),
  Object.freeze({ id: 'prod:pepino', category: 'PRODUCE' as const, name: 'Pepino', quantityDisplay: '2 ud', note: 'Cenas frías y bowls' }),
  Object.freeze({ id: 'prod:calabacin', category: 'PRODUCE' as const, name: 'Calabacín', quantityDisplay: '700 g', note: 'Pasta/curry' }),
  Object.freeze({ id: 'prod:pimiento', category: 'PRODUCE' as const, name: 'Pimiento', quantityDisplay: '500 g', note: 'Fajita/tex-mex' }),
  Object.freeze({ id: 'prod:cebolla', category: 'PRODUCE' as const, name: 'Cebolla', quantityDisplay: '500 g', note: 'Base de recetas' }),
  Object.freeze({ id: 'pan:yogur', category: 'PANTRY' as const, name: 'Yogur rico en proteínas', quantityDisplay: '3-4 botes de 500 g', note: '1 ración tras comida y cena; parte va en las salsas' }),
  Object.freeze({ id: 'pan:tomate-triturado', category: 'PANTRY' as const, name: 'Tomate triturado', quantityDisplay: '2 bricks/botes' }),
  Object.freeze({ id: 'pan:limon', category: 'PANTRY' as const, name: 'Limones', quantityDisplay: '2 ud', note: 'Salsas y pescado' }),
  Object.freeze({ id: 'pan:especias', category: 'PANTRY' as const, name: 'Especias (ajo polvo, pimentón, curry, comino, orégano, pimienta, mostaza)', quantityDisplay: 'Reponer solo si falta' }),
]);

interface AggregatedProduct {
  foodId: string;
  name: string;
  grams: number;
  units: number;
  unit: 'g' | 'ml' | 'unit';
}

function categoryFor(foodId: string, group: FoodGroupId): ShoppingCategory {
  return CATEGORY_BY_FOOD[group][foodId] ?? DEFAULT_CATEGORY[group];
}

function displayFor(agg: AggregatedProduct): string {
  if (agg.unit === 'unit') {
    return `${agg.units} ud`;
  }
  if (agg.unit === 'ml') {
    return agg.grams >= 1000 ? `${trimNum(agg.grams / 1000)} L` : `${agg.grams} ml`;
  }
  return agg.grams >= 1000 ? `~${trimNum(agg.grams / 1000)} kg` : `${trimNum(agg.grams)} g`;
}

function trimNum(n: number): string {
  const r = Math.round(n * 100) / 100;
  return String(Number.isInteger(r) ? r : r);
}

const CATEGORY_ORDER: readonly ShoppingCategory[] = [
  'PROTEIN',
  'FISH',
  'DAIRY',
  'CARBS',
  'FATS',
  'PRODUCE',
  'PANTRY',
];

/** Lunes-domingo que contienen el lunes de la semana de `referenceDate`. */
export function weekDateKeys(reference: Date): string[] {
  const monday = parseDateKey(dateKeyOf(reference));
  const shift = (monday.getDay() + 6) % 7;
  monday.setDate(monday.getDate() - shift);
  const keys: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    keys.push(dateKeyOf(d));
  }
  return keys;
}

export function generateShoppingList(referenceDate: Date = new Date()): ShoppingLine[] {
  const dateKeys = weekDateKeys(referenceDate);
  const aggregated = new Map<string, AggregatedProduct>();
  const groupById = foodGroupIndex();

  for (const dateKey of dateKeys) {
    const dayType = suggestedDayType(dateKey);
    const day = buildDay(dateKey, dayType);
    for (const meal of day.meals) {
      for (const item of meal.items) {
        const agg = aggregated.get(item.foodId) ?? {
          foodId: item.foodId,
          name: item.name,
          grams: 0,
          units: 0,
          unit: item.unit,
        };
        if (item.unit === 'unit') {
          agg.units += item.value;
        } else {
          // los rangos (aguacate) se agregan por el mínimo de la pauta
          agg.grams += item.value;
        }
        aggregated.set(item.foodId, agg);
      }
    }
  }

  const lines: ShoppingLine[] = [];
  for (const agg of aggregated.values()) {
    const group = groupById.get(agg.foodId);
    const category = group ? categoryFor(agg.foodId, group) : 'PANTRY';
    lines.push({
      id: `gen:${agg.foodId}`,
      category,
      name: agg.name,
      quantityDisplay: displayFor(agg),
      sortHint: agg.foodId.length,
    });
  }

  lines.push(...PRODUCE_AND_PANTRY.map((p) => ({ ...p, sortHint: 0 })));

  return lines.sort((a, b) => {
    const ca = CATEGORY_ORDER.indexOf(a.category);
    const cb = CATEGORY_ORDER.indexOf(b.category);
    if (ca !== cb) {
      return ca - cb;
    }
    return a.name.localeCompare(b.name, 'es');
  });
}

let groupIndex: Map<string, FoodGroupId> | null = null;
function foodGroupIndex(): Map<string, FoodGroupId> {
  if (groupIndex === null) {
    groupIndex = new Map<string, FoodGroupId>();
    for (const group of ['PROTEIN', 'CARBOHYDRATE', 'FAT'] as const) {
      for (const food of getFoodsByGroup(group)) {
        groupIndex.set(food.id, food.group);
      }
    }
  }
  return groupIndex;
}

export function groupShoppingByCategory(
  lines: readonly ShoppingLine[]
): Readonly<Record<ShoppingCategory, ShoppingLine[]>> {
  const out = {} as Record<ShoppingCategory, ShoppingLine[]>;
  for (const cat of CATEGORY_ORDER) {
    out[cat] = [];
  }
  for (const line of lines) {
    out[line.category].push(line);
  }
  return out;
}

export const shoppingCategoryLabel: Record<ShoppingCategory, string> = {
  PROTEIN: 'Proteína',
  FISH: 'Pescado',
  DAIRY: 'Lácteos',
  CARBS: 'Carbohidratos',
  FATS: 'Grasas',
  PRODUCE: 'Fruta y verdura',
  PANTRY: 'Despensa',
};

/** Semana ISO (lunes) para versionar la lista persistida: YYYY-MM-DD del lunes. */
export function weekKey(reference: Date): string {
  return weekDateKeys(reference)[0] ?? dateKeyOf(reference);
}
