/**
 * Tests para ShoppingScreen (app/(tabs)/shopping.tsx).
 */

import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import ShoppingScreen from '../shopping';
import { setDatabaseProvider, type DbLike } from '@/infrastructure/database';
import { createMigratedTestDb } from '@/infrastructure/nodeSqliteAdapter';

describe('ShoppingScreen (app/(tabs)/shopping.tsx)', () => {
  let db: DbLike;

  beforeEach(async () => {
    db = await createMigratedTestDb();
    setDatabaseProvider(() => Promise.resolve(db));
  });

  afterEach(() => {
    setDatabaseProvider(null);
  });

  it('renders shopping list with categories and items', async () => {
    const { getByText, getAllByRole } = render(<ShoppingScreen />);

    await waitFor(() => {
      expect(getByText('Lista de la Compra')).toBeTruthy();
      expect(getByText(/Progreso de compra/)).toBeTruthy();
    });

    // Categorías visibles
    expect(getByText('PROTEÍNA')).toBeTruthy();
    expect(getByText('FRUTA Y VERDURA')).toBeTruthy();

    const checkboxes = getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);
  });

  it('toggles a shopping item checkbox', async () => {
    const { getAllByRole, getByText } = render(<ShoppingScreen />);

    await waitFor(() => {
      expect(getAllByRole('checkbox').length).toBeGreaterThan(0);
    });

    const firstCheckbox = getAllByRole('checkbox')[0]!;
    expect(firstCheckbox.props.accessibilityState.checked).toBe(false);

    fireEvent.press(firstCheckbox);

    await waitFor(() => {
      expect(firstCheckbox.props.accessibilityState.checked).toBe(true);
      expect(getByText(/1 \/ \d+ comprados/)).toBeTruthy();
    });
  });
});
