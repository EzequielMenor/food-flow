/**
 * Selector superior de tipo de día (Entrenamiento vs Descanso).
 * Cambia instantáneamente la estructura entre 5 y 4 comidas (TASK-M2-003).
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { DayType } from '@/domain/nutrition/types';
import { borderRadius, colors, spacing, touchTarget, typography } from '@/presentation/theme/tokens';

export interface DayTypeSelectorProps {
  readonly dayType: DayType;
  readonly isManuallySet: boolean;
  readonly onChangeDayType: (type: DayType) => void;
  readonly disabled?: boolean;
}

export const DayTypeSelector: React.FC<DayTypeSelectorProps> = ({
  dayType,
  isManuallySet,
  onChangeDayType,
  disabled = false,
}) => {
  const isTraining = dayType === 'TRAINING';

  return (
    <View style={styles.container} accessible={true} accessibilityRole="radiogroup">
      <View style={styles.selectorWrapper}>
        <Pressable
          accessibilityRole="radio"
          accessibilityLabel="Día de entrenamiento, 5 comidas"
          accessibilityState={{ selected: isTraining, disabled }}
          disabled={disabled}
          onPress={() => onChangeDayType('TRAINING')}
          style={({ pressed }) => [
            styles.segment,
            isTraining && styles.segmentTrainingActive,
            pressed && !disabled && styles.segmentPressed,
          ]}
        >
          <Text style={[styles.segmentLabel, isTraining && styles.segmentLabelActive]}>
            Entrenamiento
          </Text>
          <Text style={[styles.segmentBadge, isTraining && styles.segmentBadgeActive]}>
            5 comidas
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="radio"
          accessibilityLabel="Día de descanso, 4 comidas"
          accessibilityState={{ selected: !isTraining, disabled }}
          disabled={disabled}
          onPress={() => onChangeDayType('REST')}
          style={({ pressed }) => [
            styles.segment,
            !isTraining && styles.segmentRestActive,
            pressed && !disabled && styles.segmentPressed,
          ]}
        >
          <Text style={[styles.segmentLabel, !isTraining && styles.segmentLabelActive]}>
            Descanso
          </Text>
          <Text style={[styles.segmentBadge, !isTraining && styles.segmentBadgeActive]}>
            4 comidas
          </Text>
        </Pressable>
      </View>

      {isManuallySet && (
        <Text style={styles.manualNotice}>
          Tipo de día personalizado para hoy
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  selectorWrapper: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
  },
  segment: {
    flex: 1,
    minHeight: touchTarget.minHeight,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentPressed: {
    opacity: 0.8,
  },
  segmentTrainingActive: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.training,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  segmentRestActive: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.rest,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  segmentLabel: {
    ...typography.labelBold,
    color: colors.textSecondary,
  },
  segmentLabelActive: {
    color: colors.textPrimary,
  },
  segmentBadge: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  segmentBadgeActive: {
    color: colors.textSecondary,
  },
  manualNotice: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
