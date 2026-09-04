/**
 * Tests para PlanScreen (app/(tabs)/plan.tsx).
 */

import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import PlanScreen from '../plan';

describe('PlanScreen (app/(tabs)/plan.tsx)', () => {
  it('renders title and defaults to Equivalencias section', () => {
    const { getByText } = render(<PlanScreen />);

    expect(getByText('Plan y Recetas')).toBeTruthy();
    expect(getByText('Estructura Diaria de Raciones')).toBeTruthy();
  });

  it('switches to Recetas and displays recipe cards', () => {
    const { getByRole, getByText } = render(<PlanScreen />);

    fireEvent.press(getByRole('tab', { name: /8 recetas/i }));

    expect(getByText('Bowl de pollo fajita con arroz')).toBeTruthy();
    expect(getByText('Pasta cremosa de pavo y tomate')).toBeTruthy();
  });

  it('switches to Salsas and displays sauce recipes', () => {
    const { getByRole, getByText } = render(<PlanScreen />);

    fireEvent.press(getByRole('tab', { name: /6 salsas/i }));

    expect(getByText('Yogur ajo-limón')).toBeTruthy();
    expect(getByText('BBQ rápida sin aceite')).toBeTruthy();
  });
});
