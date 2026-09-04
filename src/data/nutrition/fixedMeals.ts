/**
 * Bloques automáticos del PDF (pág. 3): preentreno, almuerzo/bowl dulce y
 * merienda/batido. Son datos prácticos con la composición exacta que la pauta
 * exige (cuotas verificadas por test contra dailyStructure).
 */

import type { FoodItemSelection } from '@/domain/nutrition/types';

import { selection } from '@/domain/nutrition/quantities';
import {
  AVENA,
  CREMA_FRUTOS_SECOS,
  LECHE_SEMIDESNATADA,
  PAN_INTEGRAL,
  PROTEINA_POLVO,
} from './canonicalFoods';

export interface FixedBlock {
  readonly label: string;
  readonly note: string;
  readonly items: readonly FoodItemSelection[];
  readonly extras: readonly string[];
}

export interface DayTypeFixedBlocks {
  readonly preWorkout: FixedBlock | null;
  readonly lunch: FixedBlock;
  readonly snack: FixedBlock;
}

function bowlDulce(oatGrams: number): FixedBlock {
  return Object.freeze({
    label: 'Almuerzo / postentreno — bowl dulce',
    note: 'Microndas 2-3 min removiendo; proteína y cacao al final con temperatura más baja.',
    items: Object.freeze([
      selection(AVENA, oatGrams / AVENA.baseQuantity.value),
      selection(LECHE_SEMIDESNATADA, 1),
      selection(PROTEINA_POLVO, 5),
      selection(CREMA_FRUTOS_SECOS, 1),
    ]),
    extras: Object.freeze(['1 pieza de fruta troceada', 'cacao puro']),
  });
}

export const FIXED_BLOCKS: Readonly<Record<'TRAINING' | 'REST', DayTypeFixedBlocks>> = Object.freeze({
  TRAINING: Object.freeze({
    preWorkout: Object.freeze({
      label: 'Preentreno — 2 minutos',
      note: '',
      items: Object.freeze([selection(PAN_INTEGRAL, 1), selection(CREMA_FRUTOS_SECOS, 1)]),
      extras: Object.freeze(['1 plátano (o una pieza de fruta)']),
    }),
    lunch: bowlDulce(60),
    snack: Object.freeze({
      label: 'Merienda — batido (todos los días)',
      note: 'Batidora: leche + fruta + avena. La crema de cacahuete aparte o mezclada.',
      items: Object.freeze([
        selection(LECHE_SEMIDESNATADA, 2),
        selection(AVENA, 3),
        selection(CREMA_FRUTOS_SECOS, 1),
      ]),
      extras: Object.freeze(['1 pieza de fruta']),
    }),
  }),
  REST: Object.freeze({
    preWorkout: null,
    lunch: bowlDulce(45),
    snack: Object.freeze({
      label: 'Merienda — batido (todos los días)',
      note: 'Si te cansa el batido: leche en vaso, fruta entera y avena como porridge. Cambia la forma, no la estructura.',
      items: Object.freeze([
        selection(LECHE_SEMIDESNATADA, 2),
        selection(AVENA, 2),
        selection(CREMA_FRUTOS_SECOS, 1),
      ]),
      extras: Object.freeze(['1 pieza de fruta']),
    }),
  }),
});
