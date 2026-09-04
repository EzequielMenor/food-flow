/**
 * Tests para ProgressScreen (app/(tabs)/progress.tsx).
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import ProgressScreen from '../progress';
import { setDatabaseProvider, type DbLike } from '@/infrastructure/database';
import { createMigratedTestDb } from '@/infrastructure/nodeSqliteAdapter';
import { saveDay } from '@/infrastructure/dayRepository';
import { buildDay, toggleMealCompleted } from '@/application/dailyFlow';

describe('ProgressScreen (app/(tabs)/progress.tsx)', () => {
  let db: DbLike;

  beforeEach(async () => {
    db = await createMigratedTestDb();
    setDatabaseProvider(() => Promise.resolve(db));
  });

  afterEach(() => {
    setDatabaseProvider(null);
  });

  it('renders progress screen with KPIs and monthly calendar', async () => {
    // Guardamos un día completado para el mes actual
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const dateKey = `${y}-${m}-15`;

    let day = buildDay(dateKey, 'TRAINING');
    // Completamos todas las comidas
    for (const meal of day.meals) {
      day = toggleMealCompleted(day, meal.momentId);
    }
    await saveDay(day, () => Promise.resolve(db));

    const { getByText, getAllByText } = render(<ProgressScreen />);

    await waitFor(() => {
      expect(getByText('Progreso y Adherencia')).toBeTruthy();
      expect(getByText('Adherencia media')).toBeTruthy();
      expect(getByText('Días al 100%')).toBeTruthy();
    });

    // Verificamos que el día 100% se contabiliza
    expect(getAllByText('1').length).toBeGreaterThanOrEqual(1);
    expect(getAllByText('✓').length).toBeGreaterThan(0);
  });
});
