/**
 * Tokens de diseño para Food Flow (docs/architecture/overview.md §2).
 * Ergonomía móvil con contraste accesible y áreas mínimas de pulsación (48 dp).
 */

export const colors = Object.freeze({
  background: '#F7F6F2',
  surface: '#FFFFFF',
  surfaceSubtle: '#F1F3F5',
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

  warning: '#F59E0B',
  warningLight: '#FEF3C7',

  error: '#EF4444',
  errorLight: '#FEE2E2',
});

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
