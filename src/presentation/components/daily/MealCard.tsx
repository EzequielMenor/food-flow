/**
 * Tarjeta de comida individual (M2/TASK-M2-003).
 * Muestra la propuesta de la pauta, el desglose de ingredientes en crudo y
 * el botón de confirmación en 1 toque `[ He comido esto ]`.
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { FoodItem, PlannedMeal } from '@/application/dailyFlow';
import { formatItemLine } from '@/application/dailyFlow';
import { Button } from '@/presentation/components/ui/Button';
import { borderRadius, colors, spacing, typography } from '@/presentation/theme/tokens';

export interface MealCardProps {
  readonly meal: PlannedMeal;
  readonly isCompleted: boolean;
  readonly onToggleCompleted: () => void;
  readonly onOpenSubstitution?: (item: FoodItem) => void;
  readonly testID?: string;
}

export const MealCard: React.FC<MealCardProps> = ({
  meal,
  isCompleted,
  onToggleCompleted,
  onOpenSubstitution,
  testID,
}) => {
  return (
    <View
      testID={testID}
      style={[styles.card, isCompleted && styles.cardCompleted]}
      accessible={true}
      accessibilityRole="none"
    >
      {/* Cabecera: momento y título */}
      <View style={styles.header}>
        <View style={styles.headerTitles}>
          <View style={styles.momentRow}>
            <Text style={styles.momentLabel}>{meal.label.toUpperCase()}</Text>
            {meal.variantName && (
              <Text style={styles.variantBadge}>{meal.variantName}</Text>
            )}
          </View>
          <Text style={styles.mealTitle}>{meal.title}</Text>
        </View>

        <View style={[styles.statusBadge, isCompleted ? styles.statusDone : styles.statusPending]}>
          <Text style={[styles.statusText, isCompleted ? styles.statusDoneText : styles.statusPendingText]}>
            {isCompleted ? '✓ Hecha' : 'Pendiente'}
          </Text>
        </View>
      </View>

      {/* Raciones objetivo y notas clínicas */}
      <View style={styles.metaRow}>
        <Text style={styles.targetSummary}>{meal.targetSummary}</Text>
        {onOpenSubstitution && meal.items.length > 0 && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Sustituir ingredientes en ${meal.title}`}
            onPress={() => onOpenSubstitution(meal.items[0]!)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.substitutionLink}>Sustituir ›</Text>
          </Pressable>
        )}
      </View>

      {meal.fatNote && (
        <View style={styles.fatNoteContainer}>
          <Text style={styles.fatNoteText}>ℹ {meal.fatNote}</Text>
        </View>
      )}

      {/* Lista de ingredientes con opción de cambio */}
      <View style={styles.itemsList}>
        {meal.items.map((item) => (
          <View key={item.foodId} style={styles.itemRow}>
            <Text style={styles.itemBullet}>•</Text>
            <Text style={styles.itemText}>
              {formatItemLine(item)}
              {item.isSubstitution && (
                <Text style={styles.substitutionTag}> (Sustituido)</Text>
              )}
            </Text>
            {onOpenSubstitution && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Sustituir ${item.name}`}
                onPress={() => onOpenSubstitution(item)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.swapButton}
              >
                <Text style={styles.swapButtonText}>Cambiar</Text>
              </Pressable>
            )}
          </View>
        ))}

        {meal.extras.map((extra, idx) => (
          <View key={`extra-${idx}`} style={styles.itemRow}>
            <Text style={styles.extraBullet}>+</Text>
            <Text style={styles.extraText}>{extra}</Text>
          </View>
        ))}
      </View>

      {meal.note ? (
        <Text style={styles.recipeNote}>{meal.note}</Text>
      ) : null}

      {/* Acción 1-tap: confirmar o desmarcar */}
      <View style={styles.actionContainer}>
        <Button
          title={isCompleted ? '✓ Completada' : '[ He comido esto ]'}
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardCompleted: {
    borderColor: colors.success,
    backgroundColor: '#FAFDFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitles: {
    flex: 1,
    marginRight: spacing.sm,
  },
  momentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 2,
  },
  momentLabel: {
    ...typography.caption,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  variantBadge: {
    ...typography.caption,
    backgroundColor: colors.surfaceSubtle,
    color: colors.textSecondary,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: borderRadius.sm,
  },
  mealTitle: {
    ...typography.titleMedium,
    color: colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusPending: {
    backgroundColor: colors.surfaceSubtle,
  },
  statusDone: {
    backgroundColor: colors.successLight,
  },
  statusText: {
    ...typography.caption,
  },
  statusPendingText: {
    color: colors.textSecondary,
  },
  statusDoneText: {
    color: colors.successDark,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  targetSummary: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  substitutionLink: {
    ...typography.bodySmall,
    color: colors.training,
    fontWeight: '600',
  },
  fatNoteContainer: {
    backgroundColor: colors.warningLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  fatNoteText: {
    ...typography.caption,
    color: '#92400E',
  },
  itemsList: {
    marginVertical: spacing.xs,
    gap: spacing.xs,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  itemBullet: {
    ...typography.bodyMedium,
    color: colors.primary,
    marginRight: spacing.sm,
    lineHeight: 20,
  },
  itemText: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    flex: 1,
  },
  substitutionTag: {
    ...typography.caption,
    color: colors.training,
    fontWeight: '600',
  },
  extraBullet: {
    ...typography.bodyMedium,
    color: colors.textMuted,
    marginRight: spacing.sm,
    lineHeight: 20,
  },
  extraText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontStyle: 'italic',
    flex: 1,
  },
  recipeNote: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  actionContainer: {
    marginTop: spacing.md,
  },
  swapButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceSubtle,
    marginLeft: spacing.xs,
    alignSelf: 'center',
  },
  swapButtonText: {
    ...typography.caption,
    color: colors.training,
    fontWeight: '600',
  },
});
