/**
 * Tests para el hook useTheme y tokens semánticos (Light / Dark).
 */

import { renderHook } from '@testing-library/react-native';
import * as ReactNative from 'react-native';
import { useTheme } from '../useTheme';
import { darkColors, lightColors } from '../tokens';

describe('useTheme hook', () => {
  it('returns light theme by default when colorScheme is light', () => {
    jest.spyOn(ReactNative, 'useColorScheme').mockReturnValue('light');

    const { result } = renderHook(() => useTheme());

    expect(result.current.isDark).toBe(false);
    expect(result.current.colorScheme).toBe('light');
    expect(result.current.colors.background).toBe(lightColors.background);
    expect(result.current.colors.surface).toBe(lightColors.surface);
    expect(result.current.colors.surfaceCompleted).toBe(lightColors.surfaceCompleted);
    expect(result.current.colors.warningDark).toBe('#92400E');
    expect(result.current.colors.warning).toBe('#D97706');
  });

  it('returns dark theme when colorScheme is dark', () => {
    jest.spyOn(ReactNative, 'useColorScheme').mockReturnValue('dark');

    const { result } = renderHook(() => useTheme());

    expect(result.current.isDark).toBe(true);
    expect(result.current.colorScheme).toBe('dark');
    expect(result.current.colors.background).toBe(darkColors.background);
    expect(result.current.colors.surface).toBe(darkColors.surface);
    expect(result.current.colors.surfaceCompleted).toBe(darkColors.surfaceCompleted);
    expect(result.current.colors.warningDark).toBe('#FCD34D');
    expect(result.current.colors.warning).toBe('#F59E0B');
  });

  it('provides all typography, spacing and touchTarget tokens', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.touchTarget.minHeight).toBe(48);
    expect(result.current.touchTarget.minWidth).toBe(48);
    expect(result.current.spacing.md).toBe(12);
    expect(result.current.typography.titleLarge.fontSize).toBe(24);
  });
});
