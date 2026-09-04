/**
 * Tokens de diseño para Food Flow (docs/architecture/overview.md §2).
 * Ergonomía móvil con contraste accesible y áreas mínimas de pulsación (48 dp).
 */

export interface ThemeColors {
  readonly background: string;
  readonly surface: string;
  readonly surfaceSubtle: string;
  readonly surfaceCompleted: string;
  readonly border: string;
  readonly borderStrong: string;

  readonly textPrimary: string;
  readonly textSecondary: string;
  readonly textMuted: string;
  readonly textInverse: string;

  readonly primary: string;
  readonly primaryDark: string;
  readonly primaryLight: string;

  readonly training: string;
  readonly trainingLight: string;
  readonly rest: string;
  readonly restLight: string;

  readonly success: string;
  readonly successLight: string;
  readonly successDark: string;

  readonly warning: string;
  readonly warningLight: string;
  readonly warningDark: string;

  readonly error: string;
  readonly errorLight: string;
}

export const lightColors: ThemeColors = Object.freeze({
  background: '#F7F6F2',
  surface: '#FFFFFF',
  surfaceSubtle: '#F1F3F5',
  surfaceCompleted: '#FAFAF9',
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',

  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  primary: '#059669', // Esmeralda / nutrición clínica
  primaryDark: '#047857',
  primaryLight: '#D1FAE5',

  training: '#2563EB', // Azul entreno
  trainingLight: '#DBEAFE',
  rest: '#7C3AED', // Púrpura descanso
  restLight: '#EDE9FE',

  success: '#10B981',
  successLight: '#ECFDF5',
  successDark: '#047857',

  warning: '#D97706',
  warningLight: '#FEF3C7',
  warningDark: '#92400E',

  error: '#EF4444',
  errorLight: '#FEE2E2',
});

export const darkColors: ThemeColors = Object.freeze({
  background: '#121316',
  surface: '#1C1E24',
  surfaceSubtle: '#262932',
  surfaceCompleted: '#181A20',
  border: '#2E333D',
  borderStrong: '#424957',

  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#0F172A',

  primary: '#10B981',
  primaryDark: '#059669',
  primaryLight: '#064E3B',

  training: '#3B82F6',
  trainingLight: '#1E3A8A',
  rest: '#8B5CF6',
  restLight: '#4C1D95',

  success: '#34D399',
  successLight: '#064E3B',
  successDark: '#6EE7B7',

  warning: '#F59E0B',
  warningLight: '#451A03',
  warningDark: '#FCD34D',

  error: '#F87171',
  errorLight: '#450A0A',
});

/**
 * Fallback estático de colores (Light Mode) para retrocompatibilidad
 * y uso directo en contextos sin React hooks.
 */
export const colors: ThemeColors = lightColors;

export const spacing = Object.freeze({
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
});

export const borderRadius = Object.freeze({
  sm: 6,
  md: 10,
  lg: 16,
  xl: 20,
  full: 9999,
});

export const typography = Object.freeze({
  titleLarge: { fontSize: 24, fontWeight: '700' as const, lineHeight: 30 },
  titleMedium: { fontSize: 18, fontWeight: '700' as const, lineHeight: 24 },
  titleSmall: { fontSize: 16, fontWeight: '600' as const, lineHeight: 22 },
  bodyLarge: { fontSize: 16, fontWeight: '400' as const, lineHeight: 22 },
  bodyMedium: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  bodySmall: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  labelBold: { fontSize: 13, fontWeight: '600' as const, lineHeight: 18 },
  caption: { fontSize: 11, fontWeight: '500' as const, lineHeight: 14 },
});

export const touchTarget = Object.freeze({
  minHeight: 48,
  minWidth: 48,
});
