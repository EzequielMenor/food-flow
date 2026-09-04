/**
 * Estructura clínica del día según la pauta (BR-001 a BR-005, BR-010).
 * Fuente de verdad nutricional: cuotas de raciones por momento y tipo de día.
 */

import type { DayType, MomentId } from './types';

export type { DayType, MomentId };

export interface MomentTargets {
  readonly proteinPortions: number;
  readonly carbPortions: number;
  /** Cuota base de grasa añadida antes de deducciones (BR-005). */
  readonly fatPortions: number;
  readonly fruitCount: number;
  /** Merienda: fruta libre (cualquier pieza). */
  readonly freeFruitNote: boolean;
  readonly freeVegetables: boolean;
  readonly proteinYogurt: boolean;
  /**
   * ¿La grasa de este momento admite deducción por huevo con yema / pescado azul?
   * En almuerzo y merienda la grasa es fija (15 g de crema de frutos secos) y no
   * se deduce: su proteína es láctea/suplemento sin lípidos intrínsecos.
   * Preentreno, comida y cena sí aplican la regla (BR-006).
   */
  readonly fatAppliesDeduction: boolean;
}

export const MOMENT_ORDER: readonly MomentId[] = Object.freeze([
  'PRE_WORKOUT',
  'ALMUERZO',
  'COMIDA',
  'MERIENDA',
  'CENA',
]);

export const MOMENT_LABELS: Record<MomentId, string> = {
  PRE_WORKOUT: 'Preentreno',
  ALMUERZO: 'Almuerzo',
  COMIDA: 'Comida',
  MERIENDA: 'Merienda',
  CENA: 'Cena',
};

interface MomentBase {
  readonly proteinTraining: number;
  readonly proteinRest: number;
  readonly carbTraining: number;
  readonly carbRest: number;
  readonly fatPortions: number;
  readonly fruitCount: number;
  readonly freeFruitNote: boolean;
  readonly freeVegetables: boolean;
  readonly proteinYogurt: boolean;
  readonly fatAppliesDeduction: boolean;
}

/**
 * Matriz exacta de la tabla "Momentos del Día y Raciones Objetivo"
 * de docs/domain/nutrition-model.md §2.2.
 */
const MATRIX: Record<MomentId, MomentBase> = {
  PRE_WORKOUT: {
    proteinTraining: 0,
    proteinRest: 0,
    carbTraining: 1,
    carbRest: 0,
    fatPortions: 1,
    fruitCount: 1,
    freeFruitNote: false,
    freeVegetables: false,
    proteinYogurt: false,
    fatAppliesDeduction: true,
  },
  ALMUERZO: {
    proteinTraining: 6,
    proteinRest: 6,
    carbTraining: 4,
    carbRest: 3,
    fatPortions: 1,
    fruitCount: 1,
    freeFruitNote: false,
    freeVegetables: false,
    proteinYogurt: false,
    fatAppliesDeduction: false,
  },
  COMIDA: {
    proteinTraining: 4,
    proteinRest: 4,
    carbTraining: 6,
    carbRest: 4,
    fatPortions: 1,
    fruitCount: 0,
    freeFruitNote: false,
    freeVegetables: true,
    proteinYogurt: true,
    fatAppliesDeduction: true,
  },
  MERIENDA: {
    proteinTraining: 2,
    proteinRest: 2,
    carbTraining: 3,
    carbRest: 2,
    fatPortions: 1,
    fruitCount: 0,
    freeFruitNote: true,
    freeVegetables: false,
    proteinYogurt: false,
    fatAppliesDeduction: false,
  },
  CENA: {
    proteinTraining: 4,
    proteinRest: 4,
    carbTraining: 3,
    carbRest: 2,
    fatPortions: 1,
    fruitCount: 0,
    freeFruitNote: false,
    freeVegetables: true,
    proteinYogurt: true,
    fatAppliesDeduction: true,
  },
};

export function getDayMoments(dayType: DayType): readonly MomentId[] {
  return dayType === 'TRAINING' ? MOMENT_ORDER : MOMENT_ORDER.filter((m) => m !== 'PRE_WORKOUT');
}

/** null si el momento no existe para ese tipo de día (preentreno en descanso). */
export function getMomentTargets(momentId: MomentId, dayType: DayType): MomentTargets | null {
  if (momentId === 'PRE_WORKOUT' && dayType === 'REST') {
    return null;
  }
  const base = MATRIX[momentId];
  if (base === undefined) {
    return null;
  }
  return Object.freeze({
    proteinPortions: dayType === 'TRAINING' ? base.proteinTraining : base.proteinRest,
    carbPortions: dayType === 'TRAINING' ? base.carbTraining : base.carbRest,
    fatPortions: base.fatPortions,
    fruitCount: base.fruitCount,
    freeFruitNote: base.freeFruitNote,
    freeVegetables: base.freeVegetables,
    proteinYogurt: base.proteinYogurt,
    fatAppliesDeduction: base.fatAppliesDeduction,
  });
}

export interface DayTotals {
  readonly protein: number;
  readonly carbohydrates: number;
  readonly fat: number;
}

/** Balance diario de raciones contables (complementos cualitativos fuera). */
export function getDayTotals(dayType: DayType): DayTotals {
  return getDayMoments(dayType).reduce<DayTotals>(
    (acc, moment) => {
      const targets = getMomentTargets(moment, dayType);
      if (targets === null) {
        return acc;
      }
      return {
        protein: acc.protein + targets.proteinPortions,
        carbohydrates: acc.carbohydrates + targets.carbPortions,
        fat: acc.fat + targets.fatPortions,
      };
    },
    { protein: 0, carbohydrates: 0, fat: 0 }
  );
}

/** Igual que getMomentTargets pero fallando si el momento no aplica (para UI/tests). */
export function requireMomentTargets(momentId: MomentId, dayType: DayType): MomentTargets {
  const targets = getMomentTargets(momentId, dayType);
  if (targets === null) {
    throw new Error(`El momento ${momentId} no existe en día ${dayType}`);
  }
  return targets;
}
