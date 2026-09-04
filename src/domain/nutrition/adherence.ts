/**
 * BR-011: métricas de adherencia (funciones puras, sin I/O).
 */

export interface DayAdherence {
  readonly completedMeals: number;
  readonly totalMeals: number;
}

/** Porcentaje 0-100 con resolución 0.1, redondeo seguro y sin decimales falsos. */
export function dailyAdherence({ completedMeals, totalMeals }: DayAdherence): number {
  if (!Number.isFinite(completedMeals) || !Number.isFinite(totalMeals)) {
    return 0;
  }
  if (totalMeals <= 0 || completedMeals <= 0) {
    return 0;
  }
  const pct = (Math.min(completedMeals, totalMeals) / totalMeals) * 100;
  return Math.min(100, Math.round(pct * 10) / 10);
}

/** Fracción de adherencia entrenable 0-1 (para gráficos/barras). */
export function trainingPercentage(day: DayAdherence): number {
  return dailyAdherence(day) / 100;
}

/** Promedio de porcentajes diarios; solo cuentan los días registrados. */
export function weeklyAdherence(days: readonly DayAdherence[]): number {
  const registered = days.filter((d) => d.totalMeals > 0);
  if (registered.length === 0) {
    return 0;
  }
  const sum = registered.reduce((acc, d) => acc + dailyAdherence(d), 0);
  return Math.min(100, Math.round((sum / registered.length) * 10) / 10);
}
