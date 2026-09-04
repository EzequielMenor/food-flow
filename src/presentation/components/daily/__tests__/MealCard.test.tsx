/**
 * Tests para MealCard component.
 */

import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { MealCard } from '../MealCard';
import { buildDay } from '@/application/dailyFlow';

describe('MealCard component', () => {
  const day = buildDay('2026-09-07', 'TRAINING');
  const meal = day.meals.find((m) => m.momentId === 'COMIDA')!;

  it('renders meal title, moment label and ingredients', () => {
    const { getByText } = render(
      <MealCard
        meal={meal}
        isCompleted={false}
        onToggleCompleted={jest.fn()}
      />
    );

    expect(getByText(meal.title)).toBeTruthy();
    expect(getByText('COMIDA')).toBeTruthy();
    expect(getByText('[ He comido esto ]')).toBeTruthy();
    expect(getByText('Pendiente')).toBeTruthy();
  });

  it('toggles completion status on button click', () => {
    const handleToggle = jest.fn();
    const { getByRole } = render(
      <MealCard
        meal={meal}
        isCompleted={false}
        onToggleCompleted={handleToggle}
      />
    );

    fireEvent.press(getByRole('button', { name: /Marcar comida/i }));
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it('displays completed state with success text', () => {
    const handleToggle = jest.fn();
    const { getByText, getByRole } = render(
      <MealCard
        meal={meal}
        isCompleted={true}
        onToggleCompleted={handleToggle}
      />
    );

    expect(getByText('✓ Completada')).toBeTruthy();
    expect(getByText('✓ Hecha')).toBeTruthy();

    fireEvent.press(getByRole('button', { name: /completada/i }));
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it('renders substitution button when onOpenSubstitution is provided', () => {
    const handleOpenSub = jest.fn();
    const { getByRole } = render(
      <MealCard
        meal={meal}
        isCompleted={false}
        onToggleCompleted={jest.fn()}
        onOpenSubstitution={handleOpenSub}
      />
    );

    const subBtn = getByRole('button', { name: /Sustituir ingredientes/i });
    fireEvent.press(subBtn);
    expect(handleOpenSub).toHaveBeenCalledWith(meal.items[0]);
  });
});
