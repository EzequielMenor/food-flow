/**
 * Tests para SubstitutionModal (TASK-M4-001).
 * Valida la regla clínica de exclusividad de grupo (BR-009) y el recálculo
 * exacto al gramo preservando las raciones de la pauta.
 */

import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { SubstitutionModal } from '../SubstitutionModal';
import type { FoodItem } from '@/application/dailyFlow';

describe('SubstitutionModal component', () => {
  const carbItem: FoodItem = {
    foodId: 'food:arroz',
    name: 'Arroz integral o blanco',
    group: 'CARBOHYDRATE',
    portions: 4,
    value: 60,
    unit: 'g',
    isSubstitution: false,
  };

  const proteinItem: FoodItem = {
    foodId: 'food:pollo',
    name: 'Pechuga de pollo',
    group: 'PROTEIN',
    portions: 3,
    value: 150,
    unit: 'g',
    isSubstitution: false,
  };

  it('lists exclusively foods from the same group (carbohydrates)', () => {
    const { getByText, getAllByText, queryByText } = render(
      <SubstitutionModal
        visible={true}
        item={carbItem}
        momentLabel="Comida"
        onClose={jest.fn()}
        onSelectAlternative={jest.fn()}
      />
    );

    // Hidratos presentes
    expect(getAllByText(/Arroz integral o blanco/).length).toBeGreaterThanOrEqual(1);
    expect(getByText(/Pasta integral/)).toBeTruthy();
    expect(getByText(/Avena/)).toBeTruthy();
    expect(getByText(/Pan integral/)).toBeTruthy();
    expect(getByText(/Patata \/ Boniato/)).toBeTruthy();

    // Raciones recalculadas al gramo: 4R patata = 200 g
    expect(getByText('200 g')).toBeTruthy();
    // 4R pan = 80 g
    expect(getByText('80 g')).toBeTruthy();

    // Proteínas y grasas NO deben aparecer
    expect(queryByText(/Pechuga de pollo/)).toBeNull();
    expect(queryByText(/Salmón/)).toBeNull();
    expect(queryByText(/AOVE/)).toBeNull();
    expect(queryByText(/Aguacate/)).toBeNull();
  });

  it('selects alternative food and triggers onSelectAlternative with correct foodIds', () => {
    const handleSelect = jest.fn();
    const handleClose = jest.fn();

    const { getByRole } = render(
      <SubstitutionModal
        visible={true}
        item={carbItem}
        momentLabel="Comida"
        onClose={handleClose}
        onSelectAlternative={handleSelect}
      />
    );

    // Pulsamos sobre patata
    const patataButton = getByRole('button', { name: /Patata \/ Boniato/i });
    fireEvent.press(patataButton);

    expect(handleSelect).toHaveBeenCalledWith('food:arroz', 'food:patata');
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('shows fat deduction hint when candidate is fatty fish or egg', () => {
    const { getByText, getAllByText } = render(
      <SubstitutionModal
        visible={true}
        item={proteinItem}
        momentLabel="Cena"
        onClose={jest.fn()}
        onSelectAlternative={jest.fn()}
      />
    );

    expect(getByText(/Salmón/)).toBeTruthy();
    expect(getByText(/Huevo entero/)).toBeTruthy();
    expect(getAllByText(/Ajusta grasa \(-5 g por ración\)/).length).toBe(2);
  });

  it('closes on close button press', () => {
    const handleClose = jest.fn();
    const { getByRole } = render(
      <SubstitutionModal
        visible={true}
        item={carbItem}
        onClose={handleClose}
        onSelectAlternative={jest.fn()}
      />
    );

    fireEvent.press(getByRole('button', { name: 'Cerrar' }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
