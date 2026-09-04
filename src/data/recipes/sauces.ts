/**
 * Las 6 fórmulas de salsas del PDF (pág. 5). Datos prácticos: dan sabor sin
 * añadir una segunda ración de grasa.
 */

import type { Sauce } from './types';

export const SAUCES: readonly Sauce[] = Object.freeze([
  Object.freeze({
    id: 'salsa-yogur-ajo',
    name: 'Yogur ajo-limón',
    how: '60-80 g del yogur proteico + ajo en polvo + limón + pimienta + pizca de sal.',
    pairs: 'Pollo, merluza, patata.',
  }),
  Object.freeze({
    id: 'salsa-yogur-curry',
    name: 'Yogur curry',
    how: '60-80 g de yogur + curry + pimentón + limón.',
    pairs: 'Pollo con arroz.',
  }),
  Object.freeze({
    id: 'salsa-bbq',
    name: 'BBQ rápida sin aceite',
    how: '80 g tomate triturado + pimentón ahumado + ajo + vinagre + mostaza al gusto. Calienta 2 min.',
    pairs: 'Ternera, pollo, patata.',
  }),
  Object.freeze({
    id: 'salsa-tomate-cremosa',
    name: 'Tomate cremosa',
    how: '80 g tomate triturado + 40-60 g de yogur + orégano + ajo.',
    pairs: 'Pasta con pollo/pavo.',
  }),
  Object.freeze({
    id: 'salsa-pico-gallo',
    name: 'Pico de gallo',
    how: 'Tomate + cebolla muy picados + limón/vinagre + pimienta.',
    pairs: 'Bowls tex-mex, patata.',
  }),
  Object.freeze({
    id: 'salsa-mostaza-yogur',
    name: 'Mostaza-yogur',
    how: '60 g yogur + 1 cucharadita de mostaza + limón + pimienta.',
    pairs: 'Merluza, pollo.',
  }),
]);

export const SAUCE_RULE_OF_THUMB =
  'Si compras una salsa, que no sea la principal fuente de grasa/azúcar del plato. Si lleva bastante aceite, mayonesa o crema, ya no es "gratis" dentro de tus raciones.';
