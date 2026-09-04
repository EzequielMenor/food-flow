/**
 * Tests para DayTypeSelector component.
 */

import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { DayTypeSelector } from '../DayTypeSelector';

describe('DayTypeSelector component', () => {
  it('renders both segments and shows training as selected', () => {
    const { getAllByRole, getByText } = render(
      <DayTypeSelector
        dayType="TRAINING"
        isManuallySet={false}
        onChangeDayType={jest.fn()}
      />
    );

    expect(getByText('Entrenamiento')).toBeTruthy();
    expect(getByText('Descanso')).toBeTruthy();

    const radios = getAllByRole('radio');
    expect(radios).toHaveLength(2);
    expect(radios[0]?.props.accessibilityState.selected).toBe(true);
    expect(radios[1]?.props.accessibilityState.selected).toBe(false);
  });

  it('triggers onChangeDayType when clicking rest segment', () => {
    const handleChange = jest.fn();
    const { getAllByRole } = render(
      <DayTypeSelector
        dayType="TRAINING"
        isManuallySet={false}
        onChangeDayType={handleChange}
      />
    );

    const radios = getAllByRole('radio');
    fireEvent.press(radios[1]!);
    expect(handleChange).toHaveBeenCalledWith('REST');
  });

  it('shows notice when manually set', () => {
    const { getByText } = render(
      <DayTypeSelector
        dayType="REST"
        isManuallySet={true}
        onChangeDayType={jest.fn()}
      />
    );

    expect(getByText('Tipo de día personalizado para hoy')).toBeTruthy();
  });
});
