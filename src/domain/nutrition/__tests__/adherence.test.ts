import {
  dailyAdherence,
  trainingPercentage,
  weeklyAdherence,
  type DayAdherence,
} from '../adherence';

/**
 * BR-011: adherencia diaria = comidas completadas / total; semanal = promedio últimos 7 días.
 */
describe('dailyAdherence', () => {
  it('5/5 en entrenamiento = 100%', () => {
    expect(dailyAdherence({ completedMeals: 5, totalMeals: 5 })).toBe(100);
  });

  it('3/4 en descanso = 75%', () => {
    expect(dailyAdherence({ completedMeals: 3, totalMeals: 4 })).toBe(75);
  });

  it('2/5 = 40% (resolución 0.1 y sin decimales falsos tipo 39.99)', () => {
    expect(dailyAdherence({ completedMeals: 2, totalMeals: 5 })).toBe(40);
  });

  it('0 comidas completadas = 0%', () => {
    expect(dailyAdherence({ completedMeals: 0, totalMeals: 4 })).toBe(0);
  });

  it('día sin total de comidas (no registrado) => 0 y no NaN', () => {
    expect(dailyAdherence({ completedMeals: 0, totalMeals: 0 })).toBe(0);
  });

  it('nunca supera el 100% si llegan a registrarse más ítems que el total', () => {
    expect(dailyAdherence({ completedMeals: 6, totalMeals: 5 })).toBe(100);
  });

  it('protege contra NaN', () => {
    expect(dailyAdherence({ completedMeals: NaN, totalMeals: 5 })).toBe(0);
  });
});

describe('trainingPercentage', () => {
  it('expresa el porcentaje con decimales útiles (0-1)', () => {
    expect(trainingPercentage({ completedMeals: 2, totalMeals: 5 })).toBeCloseTo(0.4);
    expect(trainingPercentage({ completedMeals: 5, totalMeals: 5 })).toBeCloseTo(1);
  });
});

describe('weeklyAdherence (promedio de los últimos 7 días)', () => {
  const day = (completed: number, total: number): DayAdherence => ({
    completedMeals: completed,
    totalMeals: total,
  });

  it('promedia solo los días registrados', () => {
    const days = [day(5, 5), day(3, 4), day(0, 0), day(0, 0)];
    // (100 + 75) / 2 días con registros
    expect(weeklyAdherence(days)).toBe(87.5);
  });

  it('semana sin ningún día registrado = 0', () => {
    expect(weeklyAdherence([])).toBe(0);
    expect(weeklyAdherence([day(0, 0), day(0, 0)])).toBe(0);
  });

  it('semana perfecta = 100', () => {
    const days = [day(5, 5), day(5, 5), day(4, 4), day(5, 5), day(5, 5), day(4, 4), day(4, 4)];
    expect(weeklyAdherence(days)).toBe(100);
  });
});
