/**
 * Las 8 recetas rápidas del PDF (págs. 6-9). Dato práctico de consulta:
 * cantidades y gramajes se derivan en runtime con el PortionEngine.
 */

import type { Recipe } from './types';

export const RECIPES: readonly Recipe[] = Object.freeze([
  Object.freeze({
    id: 'rec-fajita',
    name: 'Bowl de pollo fajita con arroz',
    slot: 'COMIDA',
    minutes: 12,
    proteins: [Object.freeze({ foodId: 'food:pollo', proteinPortions: 4 })],
    carbFoodId: 'food:arroz',
    fatFoodId: 'food:aove',
    steps: Object.freeze([
      'Cuece el arroz. Haz 2-3 raciones de golpe para varios días.',
      'Corta el pollo en tiras. Sartén fuerte 6-8 min con pimentón, ajo, comino y pimienta.',
      'Añade pimiento y cebolla en tiras; 4-5 min más. Usa el AOVE total de la comida para cocinar.',
      'Monta el bowl con arroz y termina con salsa de yogur curry o pico de gallo.',
    ]),
    tips: Object.freeze([
      'Meal-prep: aguanta muy bien congelado. Guarda arroz y pollo juntos; añade salsa al comer.',
      'Versión pavo: sustituye el pollo por la misma cantidad de pavo.',
    ]),
    sauceIds: Object.freeze(['salsa-yogur-curry', 'salsa-pico-gallo']),
  }),
  Object.freeze({
    id: 'rec-pasta-cremosa',
    name: 'Pasta cremosa de pavo y tomate',
    slot: 'COMIDA',
    minutes: 15,
    proteins: [Object.freeze({ foodId: 'food:pavo', proteinPortions: 4 })],
    carbFoodId: 'food:pasta-integral',
    fatFoodId: 'food:aove',
    steps: Object.freeze([
      'Cuece la pasta y guarda un poco del agua de cocción.',
      'Saltea el pavo picado y el calabacín con el AOVE, ajo y orégano.',
      'Añade tomate triturado. Apaga el fuego y mezcla parte de tu yogur proteico para dejarla cremosa.',
      'Añade la pasta y un chorrito de agua de cocción si hace falta.',
    ]),
    tips: Object.freeze([
      'Cambio de sabor sin cambiar la dieta: curry + tomate para especiado; pimentón ahumado para "barbacoa"; orégano + ajo estilo italiano.',
      'Versión pollo: sustituye el pavo por la misma cantidad de pollo.',
    ]),
    sauceIds: Object.freeze(['salsa-tomate-cremosa']),
  }),
  Object.freeze({
    id: 'rec-loaded',
    name: 'Loaded potato bowl de pollo y huevo',
    slot: 'CENA',
    minutes: 15,
    proteins: [
      Object.freeze({ foodId: 'food:pollo', proteinPortions: 3 }),
      Object.freeze({ foodId: 'food:huevo', proteinPortions: 1 }),
    ],
    carbFoodId: 'food:patata',
    fatFoodId: 'food:aove',
    steps: Object.freeze([
      'Corta la patata en cubos pequeños. Microondas 5-6 min tapada; después airfryer 8-10 min para dorar.',
      'Haz el pollo con ajo, pimentón y pimienta.',
      'Haz 1 huevo a la plancha o cocido.',
      'Monta con tomate/cebolla. Añade BBQ rápida o yogur ajo-limón.',
    ]),
    tips: Object.freeze([]),
    clinicalNote:
      'Por qué solo 5 g de aceite: el huevo con yema ya aporta 0,5R de grasa según tu pauta.',
    sauceIds: Object.freeze(['salsa-bbq', 'salsa-yogur-ajo']),
  }),
  Object.freeze({
    id: 'rec-ternera',
    name: 'Bowl de ternera, huevo y patata',
    slot: 'CENA',
    minutes: 12,
    proteins: [
      Object.freeze({ foodId: 'food:ternera-magra', proteinPortions: 3 }),
      Object.freeze({ foodId: 'food:huevo', proteinPortions: 1 }),
    ],
    carbFoodId: 'food:patata',
    fatFoodId: 'food:aove',
    steps: Object.freeze([
      'Haz la patata igual que en el loaded bowl (microondas + airfryer).',
      'Sartén fuerte: ternera 4-6 min con ajo, pimentón, pimienta y orégano.',
      'Añade huevo y tomate/pepino. Termina con salsa mostaza-yogur o BBQ rápida.',
    ]),
    tips: Object.freeze([
      'Versión más barata: sustituye los 150 g de ternera por 150 g de pollo o pavo. Mantienes 3R de proteína y el huevo completa la cuarta.',
    ]),
    sauceIds: Object.freeze(['salsa-mostaza-yogur', 'salsa-bbq']),
  }),
  Object.freeze({
    id: 'rec-merluza',
    name: 'Merluza con patata + salsa de yogur',
    slot: 'CENA',
    minutes: 12,
    proteins: [Object.freeze({ foodId: 'food:merluza', proteinPortions: 4 })],
    carbFoodId: 'food:patata',
    fatFoodId: 'food:aove',
    steps: Object.freeze([
      'Merluza congelada: descongela en nevera o cocina según instrucciones del envase. Seca bien.',
      'Plancha 3-4 min por lado o airfryer hasta que esté hecha.',
      'Patata: microondas + airfryer. Tomate/pepino al lado.',
      'Usa parte del yogur proteico con ajo, limón y pimienta como salsa.',
    ]),
    tips: Object.freeze(['No cocines el pescado para 7 días: hazlo el día que toca, 8-12 minutos.']),
    sauceIds: Object.freeze(['salsa-yogur-ajo']),
  }),
  Object.freeze({
    id: 'rec-salmon',
    name: 'Bowl fresco de salmón y queso',
    slot: 'CENA',
    minutes: 10,
    proteins: [
      Object.freeze({ foodId: 'food:salmon', proteinPortions: 2 }),
      Object.freeze({ foodId: 'food:queso-fresco', proteinPortions: 2 }),
    ],
    carbFoodId: 'food:patata',
    fatFoodId: 'food:aove',
    steps: Object.freeze([
      'Cocina el salmón a la plancha o airfryer.',
      'Pon patata, tomate y pepino en un bowl.',
      'Añade el queso fresco en dados y el salmón desmenuzado.',
      'Limón, pimienta, ajo y hierbas. Si quieres salsa, usa un poco del yogur del postre.',
    ]),
    tips: Object.freeze([]),
    clinicalNote:
      'La combinación 150 g salmón (2R) + 140 g queso fresco (2R) completa las 4R. El salmón ya cubre la ración de grasa de esa comida según el ajuste de pescado azul de tu pauta.',
    sauceIds: Object.freeze(['salsa-yogur-ajo']),
  }),
  Object.freeze({
    id: 'rec-curry',
    name: 'Pollo curry cremoso con arroz',
    slot: 'COMIDA',
    minutes: 12,
    proteins: [Object.freeze({ foodId: 'food:pollo', proteinPortions: 4 })],
    carbFoodId: 'food:arroz',
    fatFoodId: 'food:aove',
    steps: Object.freeze([
      'Haz pollo y calabacín/cebolla con curry, ajo y pimienta.',
      'Añade 2-3 cucharadas de tomate triturado y un poco de agua.',
      'Apaga el fuego. Mezcla 60 g aprox. del yogur que ibas a tomar en esa comida.',
      'Sirve sobre arroz.',
    ]),
    tips: Object.freeze([]),
    sauceIds: Object.freeze(['salsa-yogur-curry']),
  }),
  Object.freeze({
    id: 'rec-texmex',
    name: 'Pollo tex-mex con arroz',
    slot: 'COMIDA',
    minutes: 12,
    proteins: [Object.freeze({ foodId: 'food:pollo', proteinPortions: 4 })],
    carbFoodId: 'food:arroz',
    fatFoodId: 'food:aove',
    steps: Object.freeze([
      'Pollo en dados + pimentón ahumado + ajo + comino + pimienta.',
      'Añade pimiento y cebolla.',
      'Sirve con arroz, pico de gallo y unas gotas de limón.',
    ]),
    tips: Object.freeze([
      'Plan B de 5 minutos: proteína ya cocinada del meal prep + arroz/patata ya hecha + tomate/pepino + una salsa.',
    ]),
    sauceIds: Object.freeze(['salsa-pico-gallo']),
  }),
]);

const recipeIndex: ReadonlyMap<string, Recipe> = new Map(RECIPES.map((r) => [r.id, r]));

export function recipeById(id: string): Recipe {
  const recipe = recipeIndex.get(id);
  if (!recipe) {
    throw new Error(`Receta desconocida: ${id}`);
  }
  return recipe;
}
