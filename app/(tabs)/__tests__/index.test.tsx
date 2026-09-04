/**
 * Test de renderizado e integración para la pantalla principal "Hoy" (TASK-M2-003).
 */

import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import TodayScreen from '../index';
import { setDatabaseProvider, type DbLike } from '@/infrastructure/database';
import { createMigratedTestDb } from '@/infrastructure/nodeSqliteAdapter';

describe('TodayScreen (app/(tabs)/index.tsx)', () => {
  let db: DbLike;

  beforeEach(async () => {
    db = await createMigratedTestDb();
    setDatabaseProvider(() => Promise.resolve(db));
  });

  afterEach(() => {
    setDatabaseProvider(null);
  });

  it('renders header, day selector, progress and meal cards', async () => {
    const { getByText, getAllByText } = render(<TodayScreen />);

    await waitFor(() => {
      expect(getByText('Hoy')).toBeTruthy();
      expect(getByText('Progreso del día')).toBeTruthy();
    });

    expect(getByText('Entrenamiento')).toBeTruthy();
    expect(getByText('Descanso')).toBeTruthy();

    // Comprobamos que hay botones de confirmación
    const buttons = getAllByText('[ He comido esto ]');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('allows marking a meal as completed from the screen', async () => {
    const { getAllByText, getByText } = render(<TodayScreen />);

    await waitFor(() => {
      expect(getAllByText('[ He comido esto ]').length).toBeGreaterThan(0);
    });

    const firstMealButton = getAllByText('[ He comido esto ]')[0]!;
    fireEvent.press(firstMealButton);

    await waitFor(() => {
      expect(getByText('✓ Completada')).toBeTruthy();
      expect(getByText(/1 de \d+ comidas/)).toBeTruthy();
    });
  });

  it('allows opening substitution modal and interacting from TodayScreen', async () => {
    const { getAllByRole, getByText, getByRole } = render(<TodayScreen />);

    await waitFor(() => {
      expect(getAllByRole('button', { name: /^Sustituir /i }).length).toBeGreaterThan(0);
    });

    const firstSwapButton = getAllByRole('button', { name: /^Sustituir /i })[0]!;
    fireEvent.press(firstSwapButton);

    await waitFor(() => {
      expect(getByText('Sustituir alimento')).toBeTruthy();
    });

    fireEvent.press(getByRole('button', { name: 'Cerrar' }));
  });
});
