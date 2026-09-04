/**
 * Tarjeta de receta rápida del recetario (M5).
 * Despliega pasos de preparación paso a paso, trucos de meal-prep y salsas asociadas.
 */

import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { Recipe } from '@/data/recipes/types';
import {
  borderRadius,
  spacing,
  touchTarget,
  typography,
  useTheme,
  type ThemeColors,
} from '@/presentation/theme';

export interface RecipeCardProps {
  readonly recipe: Recipe;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${recipe.name}, ${recipe.minutes} minutos. Toca para ${isExpanded ? 'cerrar' : 'abrir'} receta`}
        accessibilityState={{ expanded: isExpanded }}
        onPress={() => setIsExpanded((prev) => !prev)}
        style={styles.headerPressable}
      >
        <View style={styles.headerInfo}>
          <View style={styles.tagRow}>
            <Text style={styles.slotTag}>{recipe.slot}</Text>
            <Text style={styles.timeTag}>⏱ {recipe.minutes} min</Text>
          </View>
          <Text style={styles.recipeName}>{recipe.name}</Text>
        </View>

        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.textMuted}
        />
      </Pressable>

      {isExpanded && (
        <View style={styles.content}>
          {/* Pasos de elaboración */}
          <Text style={styles.sectionHeader}>Elaboración:</Text>
          {recipe.steps.map((step, idx) => (
            <View key={`step-${idx}`} style={styles.stepRow}>
              <Text style={styles.stepNumber}>{idx + 1}.</Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}

          {/* Consejos y meal prep */}
          {recipe.tips.length > 0 && (
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsHeader}>💡 Trucos y meal-prep:</Text>
              {recipe.tips.map((tip, idx) => (
                <Text key={`tip-${idx}`} style={styles.tipText}>
                  • {tip}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      marginVertical: spacing.xs,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    headerPressable: {
      minHeight: touchTarget.minHeight,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerInfo: {
      flex: 1,
      marginRight: spacing.sm,
    },
    tagRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginBottom: spacing.xs,
    },
    slotTag: {
      ...typography.caption,
      backgroundColor: colors.surfaceSubtle,
      color: colors.textSecondary,
      fontWeight: '700',
      paddingHorizontal: spacing.xs,
      paddingVertical: 1,
      borderRadius: borderRadius.sm,
    },
    timeTag: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: '600',
    },
    recipeName: {
      ...typography.titleSmall,
      color: colors.textPrimary,
    },
    expandIcon: {
      fontSize: 12,
      color: colors.textMuted,
      paddingHorizontal: spacing.xs,
    },
    content: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.surfaceSubtle,
    },
    sectionHeader: {
      ...typography.labelBold,
      color: colors.textPrimary,
      marginTop: spacing.sm,
      marginBottom: spacing.xs,
    },
    stepRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: spacing.xs,
    },
    stepNumber: {
      ...typography.bodySmall,
      color: colors.primary,
      fontWeight: '700',
      marginRight: spacing.xs,
      width: 18,
    },
    stepText: {
      ...typography.bodySmall,
      color: colors.textPrimary,
      flex: 1,
      lineHeight: 18,
    },
    tipsContainer: {
      backgroundColor: colors.surfaceSubtle,
      borderRadius: borderRadius.md,
      padding: spacing.sm,
      marginTop: spacing.sm,
    },
    tipsHeader: {
      ...typography.caption,
      color: colors.textPrimary,
      fontWeight: '700',
      marginBottom: spacing.xs,
    },
    tipText: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      marginBottom: 2,
      lineHeight: 16,
    },
  });

