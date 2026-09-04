/**
 * Hook de theming reactivo para Food Flow.
 * Detecta automáticamente la preferencia del sistema operativo (useColorScheme)
 * y suministra la paleta semántica de Light o Dark mode.
 */

import { useColorScheme } from 'react-native';
import {
  borderRadius,
  darkColors,
  lightColors,
  spacing,
  touchTarget,
  typography,
  type ThemeColors,
} from './tokens';

export interface Theme {
  readonly isDark: boolean;
  readonly colorScheme: 'light' | 'dark';
  readonly colors: ThemeColors;
  readonly spacing: typeof spacing;
  readonly borderRadius: typeof borderRadius;
  readonly typography: typeof typography;
  readonly touchTarget: typeof touchTarget;
}

export function useTheme(): Theme {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const activeColors = isDark ? darkColors : lightColors;

  return {
    isDark,
    colorScheme: isDark ? 'dark' : 'light',
    colors: activeColors,
    spacing,
    borderRadius,
    typography,
    touchTarget,
  };
}
