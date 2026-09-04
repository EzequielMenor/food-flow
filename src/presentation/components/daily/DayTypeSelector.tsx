/**
 * Selector superior de tipo de día (Entrenamiento vs Descanso).
 * Cambia instantáneamente la estructura entre 5 y 4 comidas (TASK-M2-003).
 */

import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { DayType } from '@/domain/nutrition/types';
import {
  borderRadius,
  spacing,
  touchTarget,
  typography,
  useTheme,
  type ThemeColors,
} from '@/presentation/theme';

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
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
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

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      marginVertical: spacing.xs,
    },
    selectorWrapper: {
      flexDirection: 'row',
      backgroundColor: colors.surfaceSubtle,
      borderRadius: borderRadius.lg,
      padding: 3,
    },
    segment: {
      flex: 1,
      minHeight: touchTarget.minHeight,
      paddingVertical: spacing.xs + 2,
      paddingHorizontal: spacing.sm,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
    },
    segmentPressed: {
      opacity: 0.75,
    },
    segmentTrainingActive: {
      backgroundColor: colors.surface,
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 1 },
      elevation: 2,
    },
    segmentRestActive: {
      backgroundColor: colors.surface,
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 1 },
      elevation: 2,
    },
    segmentLabel: {
      ...typography.labelBold,
      color: colors.textSecondary,
      fontSize: 14,
      textAlign: 'center',
      flexShrink: 1,
    },
    segmentLabelActive: {
      color: colors.textPrimary,
      fontWeight: '700',
    },
    segmentBadge: {
      ...typography.caption,
      color: colors.textMuted,
      fontSize: 11,
      marginTop: 1,
      textAlign: 'center',
    },
    segmentBadgeActive: {
      color: colors.textSecondary,
      fontWeight: '500',
    },
    manualNotice: {
      ...typography.caption,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: spacing.xs,
    },
  });

