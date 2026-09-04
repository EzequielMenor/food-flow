/**
 * Tarjeta de comida individual (M2 / UX Impeccable).
 * Comunica con claridad y rapidez: nombre, propuesta resumida, estado y acción.
 * Optimizado para el principio: abrir → entender → marcar → cerrar.
 */

import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { FoodItem, PlannedMeal } from '@/application/dailyFlow';
import { formatQuantity } from '@/domain/nutrition/quantities';
import { Button } from '@/presentation/components/ui/Button';
import {
  borderRadius,
  spacing,
  typography,
  useTheme,
  type ThemeColors,
} from '@/presentation/theme';

export interface MealCardProps {
  readonly meal: PlannedMeal;
  readonly isCompleted: boolean;
  readonly onToggleCompleted: () => void;
  readonly onOpenSubstitution?: (item: FoodItem) => void;
  readonly onPressCard?: () => void;
  readonly testID?: string;
}

export const MealCard: React.FC<MealCardProps> = ({
  meal,
  isCompleted,
  onToggleCompleted,
  onOpenSubstitution,
  onPressCard,
  testID,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Resumen legible de la propuesta para escaneo instantáneo
  const summaryLine = meal.items
    .map((item) => {
      const q = formatQuantity({
        value: item.value,
        ...(item.maxValue !== undefined ? { maxValue: item.maxValue } : {}),
        unit: item.unit,
      });
      return `${item.name} (${q})${item.isSubstitution ? ' •' : ''}`;
    })
    .join('  ·  ');

  return (
    <View
      testID={testID}
      style={[styles.card, isCompleted && styles.cardCompleted]}
      accessible={true}
      accessibilityRole="none"
    >
      {/* Cuerpo pulsable para ver detalle de comida */}
      <Pressable
        onPress={onPressCard}
        disabled={!onPressCard}
        accessibilityRole={onPressCard ? 'button' : 'none'}
        accessibilityLabel={onPressCard ? `Ver detalle de ${meal.title}` : undefined}
        style={styles.cardHeaderPressable}
      >
        {/* Cabecera: momento, título e indicador de estado */}
        <View style={styles.header}>
          <View style={styles.headerTitles}>
            <View style={styles.momentRow}>
              <Text style={styles.momentLabel}>{meal.label.toUpperCase()}</Text>
              {meal.variantName && (
                <Text style={styles.variantBadge}>{meal.variantName}</Text>
              )}
            </View>
            <Text style={[styles.mealTitle, isCompleted && styles.mealTitleCompleted]}>
              {meal.title}
            </Text>
          </View>

          <View style={[styles.statusBadge, isCompleted ? styles.statusDone : styles.statusPending]}>
            <Text style={[styles.statusText, isCompleted ? styles.statusDoneText : styles.statusPendingText]}>
              {isCompleted ? '✓ Hecha' : 'Pendiente'}
            </Text>
          </View>
        </View>

        {/* Propuesta resumida sin saturación de números */}
        {summaryLine.length > 0 && (
          <Text style={[styles.summaryText, isCompleted && styles.summaryTextCompleted]}>
            {summaryLine}
          </Text>
        )}

        {meal.extras.length > 0 && (
          <Text style={styles.extrasText}>
            + {meal.extras.join(', ')}
          </Text>
        )}
      </Pressable>

      {/* Enlaces secundarios: sustituir o ver detalle */}
      <View style={styles.metaRow}>
        {onOpenSubstitution && meal.items.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Sustituir ingredientes en ${meal.title}`}
            onPress={() => onOpenSubstitution(meal.items[0]!)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.actionLink}
          >
            <Text style={styles.actionLinkText}>Sustituir ingredientes ›</Text>
          </Pressable>
        ) : (
          <View />
        )}

        {onPressCard && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Ver detalle de ${meal.title}`}
            onPress={onPressCard}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.actionLink}
          >
            <Text style={styles.detailLinkText}>Detalle ›</Text>
          </Pressable>
        )}
      </View>

      {/* Acción 1-tap: confirmar o desmarcar */}
      <View style={styles.actionContainer}>
        <Button
          title={isCompleted ? '✓ Completada' : 'He comido esto'}
          variant={isCompleted ? 'completed' : 'primary'}
          onPress={onToggleCompleted}
          accessibilityLabel={
            isCompleted
              ? `Comida ${meal.title} completada. Toca para desmarcar.`
              : `Marcar comida ${meal.title} como comida.`
          }
        />
      </View>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginVertical: spacing.xs + 2,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOpacity: 0.03,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    },
    cardCompleted: {
      borderColor: colors.border,
      backgroundColor: colors.surfaceCompleted,
      opacity: 0.8,
    },
    cardHeaderPressable: {
      paddingBottom: spacing.xs,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.xs,
    },
    headerTitles: {
      flex: 1,
      marginRight: spacing.sm,
    },
    momentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: spacing.xs,
      marginBottom: 2,
    },
    momentLabel: {
      ...typography.caption,
      color: colors.textMuted,
      fontWeight: '700',
      letterSpacing: 0.6,
    },
    variantBadge: {
      ...typography.caption,
      backgroundColor: colors.surfaceSubtle,
      color: colors.textSecondary,
      paddingHorizontal: spacing.xs,
      paddingVertical: 1,
      borderRadius: borderRadius.sm,
      fontSize: 10,
    },
    mealTitle: {
      ...typography.titleSmall,
      color: colors.textPrimary,
      fontWeight: '700',
    },
    mealTitleCompleted: {
      color: colors.textSecondary,
    },
    statusBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      borderRadius: borderRadius.full,
      flexShrink: 0,
    },
    statusPending: {
      backgroundColor: colors.surfaceSubtle,
    },
    statusDone: {
      backgroundColor: colors.successLight,
    },
    statusText: {
      ...typography.caption,
      fontSize: 11,
      fontWeight: '600',
    },
    statusPendingText: {
      color: colors.textMuted,
    },
    statusDoneText: {
      color: colors.successDark,
    },
    summaryText: {
      ...typography.bodyMedium,
      color: colors.textSecondary,
      lineHeight: 20,
      marginTop: 2,
    },
    summaryTextCompleted: {
      color: colors.textMuted,
    },
    extrasText: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: 3,
    },
    metaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: spacing.xs,
      marginTop: spacing.xs,
      marginBottom: spacing.xs,
    },
    actionLink: {
      paddingVertical: 4,
    },
    actionLinkText: {
      ...typography.caption,
      color: colors.training,
      fontWeight: '600',
    },
    detailLinkText: {
      ...typography.caption,
      color: colors.textMuted,
      fontWeight: '600',
    },
    actionContainer: {
      marginTop: spacing.xs,
    },
  });

