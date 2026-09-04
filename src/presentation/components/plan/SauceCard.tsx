/**
 * Ficha de salsa ligera del PDF (M5).
 * Explica cómo preparar la salsa sin añadir raciones extra de grasa.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Sauce } from '@/data/recipes/types';
import { borderRadius, colors, spacing, typography } from '@/presentation/theme/tokens';

export interface SauceCardProps {
  readonly sauce: Sauce;
}

export const SauceCard: React.FC<SauceCardProps> = ({ sauce }) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{sauce.name}</Text>
        <Text style={styles.badge}>Salsa ligera</Text>
      </View>

      <Text style={styles.how}>{sauce.how}</Text>

      <View style={styles.pairsRow}>
        <Text style={styles.pairsLabel}>Combina con: </Text>
        <Text style={styles.pairsValue}>{sauce.pairs}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  name: {
    ...typography.titleSmall,
    color: colors.textPrimary,
  },
  badge: {
    ...typography.caption,
    color: colors.primary,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: borderRadius.sm,
    fontWeight: '600',
  },
  how: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  pairsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  pairsLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  pairsValue: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '500',
  },
});
