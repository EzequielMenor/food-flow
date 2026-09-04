/**
 * Tests para useDailyFlow hook.
 * Valida el ciclo de vida del estado en memoria, la interactividad optimista
 * y la persistencia transparente en SQLite usando el adaptador node:sqlite.
 */

import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useDailyFlow } from '../useDailyFlow';
import { createMigratedTestDb } from '@/infrastructure/nodeSqliteAdapter';
import { loadDay, saveDay } from '@/infrastructure/dayRepository';
import { buildDay, toggleMealCompleted } from '@/application/dailyFlow';
import type { DbLike } from '@/infrastructure/database';

describe('useDailyFlow Hook', () => {
  let db: DbLike;
  const testDbGetter = () => Promise.resolve(db);
  const mondayKey = '2026-09-07'; // Lunes -> TRAINING (5 comidas)

  beforeEach(async () => {
    db = await createMigratedTestDb();
  });

  it('loads initial suggested state for an untouched date', async () => {
    const { result } = renderHook(() => useDailyFlow(mondayKey, testDbGetter));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.dateKey).toBe(mondayKey);
    expect(result.current.dayType).toBe('TRAINING');
    expect(result.current.isTraining).toBe(true);
    expect(result.current.meals).toHaveLength(5);
    expect(result.current.completedMealsCount).toBe(0);
    expect(result.current.totalMealsCount).toBe(5);
    expect(result.current.isAllCompleted).toBe(false);
    expect(result.current.adherenceRate).toBe(0);
    expect(result.current.error).toBeNull();
  });

  it('restores persisted day state from SQLite', async () => {
    // Guardamos previamente un día con COMIDA completada
    let initial = buildDay(mondayKey, 'TRAINING');
    initial = toggleMealCompleted(initial, 'COMIDA');
    await saveDay(initial, testDbGetter);

    const { result } = renderHook(() => useDailyFlow(mondayKey, testDbGetter));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.completedMealsCount).toBe(1);
    expect(result.current.state.completed.COMIDA).toBe(true);
    expect(result.current.adherenceRate).toBeCloseTo(1 / 5);
  });

  it('toggles meal completion and persists immediately', async () => {
    const { result } = renderHook(() => useDailyFlow(mondayKey, testDbGetter));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.toggleMeal('COMIDA');
    });

    expect(result.current.completedMealsCount).toBe(1);
    expect(result.current.state.completed.COMIDA).toBe(true);

    // Verificamos que SQLite tiene el cambio
    const saved = await loadDay(mondayKey, testDbGetter);
    expect(saved?.completed.COMIDA).toBe(true);

    // Destildar
    await act(async () => {
      await result.current.toggleMeal('COMIDA');
    });

    expect(result.current.completedMealsCount).toBe(0);
    const uncheckSaved = await loadDay(mondayKey, testDbGetter);
    expect(uncheckSaved?.completed.COMIDA).toBeUndefined();
  });

  it('changes day type and recalculates structure', async () => {
    const { result } = renderHook(() => useDailyFlow(mondayKey, testDbGetter));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.dayType).toBe('TRAINING');
    expect(result.current.meals).toHaveLength(5);

    await act(async () => {
      await result.current.changeDayType('REST');
    });

    expect(result.current.dayType).toBe('REST');
    expect(result.current.isTraining).toBe(false);
    expect(result.current.meals).toHaveLength(4);
    expect(result.current.isManuallySet).toBe(true);

    const saved = await loadDay(mondayKey, testDbGetter);
    expect(saved?.dayType).toBe('REST');
    expect(saved?.isManuallySet).toBe(true);
  });

  it('applies ingredient substitution and persists', async () => {
    const { result } = renderHook(() => useDailyFlow(mondayKey, testDbGetter));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.substitute('ALMUERZO', 'food:avena', 'food:arroz');
    });

    const almuerzo = result.current.meals.find((m) => m.momentId === 'ALMUERZO');
    expect(almuerzo?.items.some((i) => i.foodId === 'food:arroz')).toBe(true);

    const saved = await loadDay(mondayKey, testDbGetter);
    expect(saved?.substitutions.ALMUERZO?.['food:avena']).toBe('food:arroz');
  });

  it('switches date and loads target day', async () => {
    const wednesdayKey = '2026-09-09'; // Miércoles -> REST por defecto
    const { result } = renderHook(() => useDailyFlow(mondayKey, testDbGetter));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.changeDate(wednesdayKey);
    });

    await waitFor(() => {
      expect(result.current.dateKey).toBe(wednesdayKey);
      expect(result.current.dayType).toBe('REST');
      expect(result.current.meals).toHaveLength(4);
    });
  });

  it('reverts state and exposes error when persistence fails', async () => {
    const failingDbGetter = () => {
      const failingDb: DbLike = {
        execAsync: () => Promise.reject(new Error('Disk write failed')),
        runAsync: () => Promise.reject(new Error('Disk write failed')),
        getAllAsync: () => Promise.reject(new Error('Disk write failed')),
        getFirstAsync: () => Promise.resolve(null),
        withTransactionAsync: () => Promise.reject(new Error('Disk write failed')),
      };
      return Promise.resolve(failingDb);
    };

    const { result } = renderHook(() => useDailyFlow(mondayKey, failingDbGetter));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.toggleMeal('COMIDA');
    });

    // Estado revertido y error expuesto
    expect(result.current.completedMealsCount).toBe(0);
    expect(result.current.error?.message).toBe('Disk write failed');
  });
});
