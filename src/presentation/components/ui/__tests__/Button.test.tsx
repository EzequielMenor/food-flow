/**
 * Tests unitarios de accesibilidad y ergonomía táctil para Button.
 */

import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Button } from '../Button';
import { touchTarget } from '@/presentation/theme/tokens';

describe('Button component', () => {
  it('renders title correctly and has button accessibility role', () => {
    const { getByRole, getByText } = render(
      <Button title="He comido esto" onPress={jest.fn()} />
    );

    expect(getByText('He comido esto')).toBeTruthy();
    const btn = getByRole('button');
    expect(btn).toBeTruthy();
  });

  it('triggers onPress when clicked', () => {
    const handlePress = jest.fn();
    const { getByRole } = render(
      <Button title="Guardar" onPress={handlePress} />
    );

    fireEvent.press(getByRole('button'));
    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  it('does not fire onPress when disabled', () => {
    const handlePress = jest.fn();
    const { getByRole } = render(
      <Button title="Bloqueado" onPress={handlePress} disabled={true} />
    );

    const btn = getByRole('button');
    fireEvent.press(btn);
    expect(handlePress).not.toHaveBeenCalled();
    expect(btn.props.accessibilityState.disabled).toBe(true);
  });

  it('satisfies the 48 dp minimum touch target height', () => {
    const { getByRole } = render(
      <Button title="Ergonómico" onPress={jest.fn()} />
    );

    const btn = getByRole('button');
    const flatStyle = Array.isArray(btn.props.style)
      ? Object.assign({}, ...btn.props.style)
      : btn.props.style;

    expect(flatStyle.minHeight).toBeGreaterThanOrEqual(touchTarget.minHeight);
    expect(flatStyle.minHeight).toBe(48);
  });

  it('renders loading state without calling onPress', () => {
    const handlePress = jest.fn();
    const { getByRole, queryByText } = render(
      <Button title="Cargando..." onPress={handlePress} loading={true} />
    );

    const btn = getByRole('button');
    expect(btn.props.accessibilityState.busy).toBe(true);
    expect(queryByText('Cargando...')).toBeNull();
    fireEvent.press(btn);
    expect(handlePress).not.toHaveBeenCalled();
  });
});
