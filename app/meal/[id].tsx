/**
 * Pantalla de detalle de comida (TASK-M4-001 / UX Impeccable).
 * Jerarquía de lectura y acción:
 * 1. Nombre de comida
 * 2. Objetivo nutricional e información clínica
 * 3. Propuesta actual (ingredientes + cantidades en crudo)
 * 4. Cambiar alimentos (sustitución modal por ingrediente)
 * 5. CTA principal ergonómico: "He comido esto"
 */

import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { FoodItem } from '@/application/dailyFlow';
import { formatItemLine } from '@/application/dailyFlow';
import type { MomentId } from '@/domain/nutrition/types';
import { SubstitutionModal } from '@/presentation/components/meal/SubstitutionModal';
import { Button } from '@/presentation/components/ui/Button';
import { useDailyFlow } from '@/presentation/hooks/useDailyFlow';
import {
  borderRadius,
  spacing,
  touchTarget,
  typography,
  useTheme,
  type ThemeColors,
} from '@/presentation/theme';

export default function MealDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const momentId = (id?.toUpperCase() ?? 'COMIDA') as MomentId;

  const { state, meals, toggleMeal, substitute } = useDailyFlow();
  const meal = meals.find((m) => m.momentId === momentId);

  const [activeItem, setActiveItem] = useState<FoodItem | null>(null);

  if (!meal) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.container}>
          <Text style={styles.errorTitle}>Comida no encontrada</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Volver"
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={20} color={colors.primary} />
            <Text style={styles.backButtonText}>Volver</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const isCompleted = Boolean(state.completed[meal.momentId]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Barra superior de navegación */}
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver a Hoy"
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
          <Text style={styles.backButtonText}>Hoy</Text>
        </Pressable>

        <Text style={styles.topBarTitle}>{meal.label}</Text>
        <View style={styles.backPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 1. Nombre de comida */}
        <View style={styles.heroSection}>
          <View style={styles.momentRow}>
            <Text style={styles.momentLabel}>{meal.label.toUpperCase()}</Text>
            {meal.variantName && (
              <Text style={styles.variantBadge}>{meal.variantName}</Text>
            )}
            <View style={[styles.statusBadge, isCompleted ? styles.statusDone : styles.statusPending]}>
              <Text style={[styles.statusText, isCompleted ? styles.statusDoneText : styles.statusPendingText]}>
                {isCompleted ? '✓ Completada' : 'Pendiente'}
              </Text>
            </View>
          </View>

          <Text style={styles.mealTitle}>{meal.title}</Text>
        </View>

        {/* 2. Objetivo nutricional e información secundaria */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Objetivo nutricional</Text>
          <View style={styles.nutritionCard}>
            <Text style={styles.targetSummaryText}>{meal.targetSummary}</Text>
            {meal.fatNote && (
              <View style={styles.fatNoteCallout}>
                <Ionicons name="information-circle-outline" size={16} color={colors.warningDark} />
                <Text style={styles.fatNoteText}>{meal.fatNote}</Text>
              </View>
            )}
          </View>
        </View>

        {/* 3. Propuesta actual: ingredientes + cantidades + cambiar alimentos */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Propuesta actual (en crudo)</Text>
          <View style={styles.ingredientsCard}>
            {meal.items.map((item, index) => {
              const isSubstituted = item.isSubstitution;
              return (
                <View
                  key={item.foodId}
                  style={[
                    styles.ingredientRow,
                    index < meal.items.length - 1 && styles.ingredientRowDivider,
                  ]}
                >
                  <View style={styles.ingredientInfo}>
                    <Text style={styles.ingredientName}>
                      {formatItemLine(item)}
                    </Text>
                    {isSubstituted && (
                      <Text style={styles.substitutedBadge}>Alimento sustituido</Text>
                    )}
                  </View>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Cambiar ${item.name}`}
                    onPress={() => setActiveItem(item)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={styles.swapButton}
                  >
                    <Text style={styles.swapButtonText}>Cambiar</Text>
                  </Pressable>
                </View>
              );
            })}

            {meal.extras.map((extra, idx) => (
              <View key={`extra-${idx}`} style={styles.extraRow}>
                <Text style={styles.extraBullet}>+</Text>
                <Text style={styles.extraText}>{extra}</Text>
              </View>
            ))}
          </View>

          {meal.note ? (
            <Text style={styles.recipeNote}>{meal.note}</Text>
          ) : null}
        </View>

        {/* 4. Normas clínicas de sustitución (secundario) */}
        <View style={styles.clinicalNotesCard}>
          <Text style={styles.clinicalNotesTitle}>Reglas de la pauta</Text>
          <Text style={styles.clinicalNotesText}>
            • Las sustituciones recalculan al gramo exacto respetando las raciones clínicas.
          </Text>
          <Text style={styles.clinicalNotesText}>
            • El pescado azul y el huevo entero ajustan automáticamente la grasa de la comida.
          </Text>
        </View>

        {/* 5. CTA Principal: He comido esto */}
        <View style={styles.ctaContainer}>
          <Button
            title={isCompleted ? '✓ Completada · Toca para desmarcar' : 'He comido esto'}
            variant={isCompleted ? 'completed' : 'primary'}
            onPress={() => void toggleMeal(meal.momentId)}
            accessibilityLabel={
              isCompleted
                ? `Comida ${meal.title} completada. Toca para desmarcar.`
                : `Marcar comida ${meal.title} como completada.`
            }
          />
        </View>
      </ScrollView>

      {/* Modal de sustitución */}
      <SubstitutionModal
        visible={activeItem !== null}
        item={activeItem}
        momentLabel={meal.label}
        onClose={() => setActiveItem(null)}
        onSelectAlternative={(sourceFoodId, targetFoodId) => {
          void substitute(meal.momentId, sourceFoodId, targetFoodId);
        }}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: touchTarget.minHeight,
      minWidth: touchTarget.minWidth,
      paddingRight: spacing.sm,
    },
    backButtonText: {
      ...typography.bodyMedium,
      color: colors.primary,
      fontWeight: '600',
      marginLeft: 2,
    },
    topBarTitle: {
      ...typography.labelBold,
      color: colors.textPrimary,
      flexShrink: 1,
    },
    backPlaceholder: {
      width: touchTarget.minWidth,
    },
    scrollContent: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.xxxl,
    },
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.lg,
    },
    errorTitle: {
      ...typography.titleMedium,
      color: colors.textPrimary,
      marginBottom: spacing.md,
    },
    heroSection: {
      marginBottom: spacing.lg,
    },
    momentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: spacing.xs,
      marginBottom: spacing.xs,
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
    statusBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: borderRadius.full,
      marginLeft: 'auto',
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
    mealTitle: {
      ...typography.titleLarge,
      color: colors.textPrimary,
      marginTop: 2,
    },
    section: {
      marginBottom: spacing.lg,
    },
    sectionHeading: {
      ...typography.caption,
      color: colors.textMuted,
      fontWeight: '700',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      marginBottom: spacing.xs,
      paddingLeft: spacing.xs,
    },
    nutritionCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    targetSummaryText: {
      ...typography.bodyMedium,
      color: colors.textPrimary,
      lineHeight: 22,
      fontWeight: '500',
    },
    fatNoteCallout: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: colors.warningLight,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.md,
      marginTop: spacing.sm,
    },
    fatNoteText: {
      ...typography.caption,
      color: colors.warningDark,
      flex: 1,
    },
    ingredientsCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderWidth: 1,
      borderColor: colors.border,
    },
    ingredientRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      minHeight: touchTarget.minHeight,
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    ingredientRowDivider: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    ingredientInfo: {
      flex: 1,
      marginRight: spacing.sm,
    },
    ingredientName: {
      ...typography.bodyMedium,
      color: colors.textPrimary,
      fontWeight: '500',
    },
    substitutedBadge: {
      ...typography.caption,
      color: colors.training,
      fontWeight: '600',
      marginTop: 2,
    },
    swapButton: {
      minHeight: 36,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surfaceSubtle,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    swapButtonText: {
      ...typography.caption,
      color: colors.training,
      fontWeight: '700',
    },
    extraRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.surfaceSubtle,
    },
    extraBullet: {
      ...typography.bodyMedium,
      color: colors.textMuted,
      marginRight: spacing.sm,
    },
    extraText: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      fontStyle: 'italic',
    },
    recipeNote: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: spacing.xs,
      paddingLeft: spacing.xs,
    },
    clinicalNotesCard: {
      backgroundColor: colors.surfaceSubtle,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.xl,
    },
    clinicalNotesTitle: {
      ...typography.caption,
      color: colors.textSecondary,
      fontWeight: '700',
      marginBottom: spacing.xs,
      textTransform: 'uppercase',
    },
    clinicalNotesText: {
      ...typography.caption,
      color: colors.textMuted,
      lineHeight: 18,
      marginBottom: 2,
    },
    ctaContainer: {
      marginTop: spacing.xs,
      marginBottom: spacing.lg,
    },
  });

