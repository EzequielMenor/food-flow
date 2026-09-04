/**
 * Hook de flujo diario (M2/M3). Gestiona el estado reactivo del día en pantalla,
 * sincronizando de forma transparente con SQLite (dayRepository) mediante
 * actualizaciones optimistas con persistencia inmediata y reversión en error.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  applySubstitution,
  completedCount,
  createInitialState,
  dateKeyOf,
  setDayType,
  toggleMealCompleted,
  type DailyFlowState,
  type PlannedMeal,
} from '@/application/dailyFlow';
import type { DayType, MomentId } from '@/domain/nutrition/types';
import { getDatabase, type DbLike } from '@/infrastructure/database';
import { loadDay, saveDay } from '@/infrastructure/dayRepository';

export interface UseDailyFlowReturn {
  readonly dateKey: string;
  readonly state: DailyFlowState;
  readonly meals: readonly PlannedMeal[];
  readonly dayType: DayType;
  readonly isTraining: boolean;
  readonly isManuallySet: boolean;
  readonly completedMealsCount: number;
  readonly totalMealsCount: number;
  readonly isAllCompleted: boolean;
  readonly adherenceRate: number;
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly toggleMeal: (momentId: MomentId) => Promise<void>;
  readonly changeDayType: (dayType: DayType) => Promise<void>;
  readonly substitute: (
    momentId: MomentId,
    sourceFoodId: string,
    targetFoodId: string
  ) => Promise<void>;
  readonly changeDate: (newDateKey: string) => void;
  readonly refresh: () => Promise<void>;
}

export function useDailyFlow(
  initialDateKey?: string,
  getDb: () => Promise<DbLike> = getDatabase
): UseDailyFlowReturn {
  const [dateKey, setDateKey] = useState<string>(
    () => initialDateKey ?? dateKeyOf(new Date())
  );
  const [state, setState] = useState<DailyFlowState>(() => createInitialState(dateKey));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function fetchDay() {
      try {
        const persisted = await loadDay(dateKey, getDb);
        if (!isCancelled) {
          if (persisted !== null) {
            setState(persisted);
          } else {
            setState(createInitialState(dateKey));
          }
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void fetchDay();

    return () => {
      isCancelled = true;
    };
  }, [dateKey, getDb]);

  const toggleMeal = useCallback(
    async (momentId: MomentId) => {
      const prevState = state;
      const nextState = toggleMealCompleted(prevState, momentId);
      setState(nextState);
      try {
        await saveDay(nextState, getDb);
      } catch (err) {
        setState(prevState);
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    },
    [state, getDb]
  );

  const changeDayType = useCallback(
    async (newDayType: DayType) => {
      const prevState = state;
      const nextState = setDayType(prevState, newDayType);
      setState(nextState);
      try {
        await saveDay(nextState, getDb);
      } catch (err) {
        setState(prevState);
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    },
    [state, getDb]
  );

  const substitute = useCallback(
    async (momentId: MomentId, sourceFoodId: string, targetFoodId: string) => {
      const prevState = state;
      const nextState = applySubstitution(prevState, momentId, sourceFoodId, targetFoodId);
      setState(nextState);
      try {
        await saveDay(nextState, getDb);
      } catch (err) {
        setState(prevState);
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    },
    [state, getDb]
  );

  const changeDate = useCallback((newDateKey: string) => {
    setIsLoading(true);
    setDateKey(newDateKey);
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const persisted = await loadDay(dateKey, getDb);
      setState(persisted ?? createInitialState(dateKey));
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [dateKey, getDb]);

  const completedMealsCount = useMemo(() => completedCount(state), [state]);
  const totalMealsCount = state.meals.length;
  const isAllCompleted = totalMealsCount > 0 && completedMealsCount === totalMealsCount;
  const adherenceRate = totalMealsCount > 0 ? completedMealsCount / totalMealsCount : 0;

  return {
    dateKey,
    state,
    meals: state.meals,
    dayType: state.dayType,
    isTraining: state.dayType === 'TRAINING',
    isManuallySet: state.isManuallySet,
    completedMealsCount,
    totalMealsCount,
    isAllCompleted,
    adherenceRate,
    isLoading,
    error,
    toggleMeal,
    changeDayType,
    substitute,
    changeDate,
    refresh,
  };
}
