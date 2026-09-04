/**
 * Propuesta del menú semanal cerrado del PDF (pág. 4), distribución L-M-J-V
 * entrenamiento / X-S-D descanso. Es adaptación práctica; las cuotas clínicas
 * se aplican desde src/domain/nutrition/dailyStructure.ts según el tipo de día.
 */

export type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = lunes (ISO)

export interface PlanSlot {
  readonly recipeId: string;
  /** P. ej. jueves "pavo ahumado" sobre la receta de pasta cremosa de pavo. */
  readonly variantName?: string;
  /** Proteína fijada para ese día cuando difiere de la receta base. */
  readonly proteinSwap?: { readonly to: string };
}

export interface DayPlan {
  readonly defaultType: 'TRAINING' | 'REST';
  readonly lunch: PlanSlot;
  readonly dinner: PlanSlot;
}

/** Lunes a domingo, según la tabla de la página 4. */
export const WEEKLY_PLAN: readonly [DayPlan, DayPlan, DayPlan, DayPlan, DayPlan, DayPlan, DayPlan] =
  Object.freeze([
    Object.freeze({
      defaultType: 'TRAINING',
      lunch: { recipeId: 'rec-fajita' },
      dinner: { recipeId: 'rec-merluza' },
    }),
    Object.freeze({
      defaultType: 'TRAINING',
      lunch: { recipeId: 'rec-pasta-cremosa' },
      dinner: { recipeId: 'rec-loaded' },
    }),
    Object.freeze({
      defaultType: 'REST',
      lunch: { recipeId: 'rec-curry' },
      dinner: { recipeId: 'rec-salmon' },
    }),
    Object.freeze({
      defaultType: 'TRAINING',
      lunch: Object.freeze({ recipeId: 'rec-pasta-cremosa', variantName: 'Pavo ahumado' }),
      dinner: { recipeId: 'rec-merluza' },
    }),
    Object.freeze({
      defaultType: 'TRAINING',
      lunch: { recipeId: 'rec-texmex' },
      dinner: { recipeId: 'rec-ternera' },
    }),
    Object.freeze({
      defaultType: 'REST',
      lunch: Object.freeze({
        recipeId: 'rec-pasta-cremosa',
        variantName: 'Pasta pollo',
        proteinSwap: { to: 'food:pollo' },
      }),
      dinner: { recipeId: 'rec-salmon' },
    }),
    Object.freeze({
      defaultType: 'REST',
      lunch: Object.freeze({
        recipeId: 'rec-fajita',
        variantName: 'Pavo arroz',
        proteinSwap: { to: 'food:pavo' },
      }),
      dinner: { recipeId: 'rec-loaded' },
    }),
  ]);

export function planForWeekday(weekday: WeekdayIndex): DayPlan {
  return WEEKLY_PLAN[weekday];
}
