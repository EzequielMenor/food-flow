/**
 * Pantalla de detalle de comida (TASK-M4-001).
 * Permite ver la composición detallada de la comida y cambiar ingredientes
 * manteniendo las cuotas clínicas del grupo.
 */

import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { FoodItem } from '@/application/dailyFlow';
import type { MomentId } from '@/domain/nutrition/types';
import { MealCard } from '@/presentation/components/daily/MealCard';
import { SubstitutionModal } from '@/presentation/components/meal/SubstitutionModal';
import { useDailyFlow } from '@/presentation/hooks/useDailyFlow';
import { borderRadius, colors, spacing, touchTarget, typography } from '@/presentation/theme/tokens';

export default function MealDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const momentId = (id?.toUpperCase() ?? 'COMIDA') as MomentId;

  const { state, meals, toggleMeal, substitute } = useDailyFlow();
  const meal = meals.find((m) => m.momentId === momentId);

  const [activeItem, setActiveItem] = useState<FoodItem | null>(null);

  if (!meal) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.errorTitle}>Comida no encontrada</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>‹ Volver</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const isCompleted = Boolean(state.completed[meal.momentId]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver a Hoy"
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>‹ Volver</Text>
        </Pressable>
        <Text style={styles.topBarTitle}>{meal.label}</Text>
        <View style={styles.backPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <MealCard
          meal={meal}
          isCompleted={isCompleted}
          onToggleCompleted={() => void toggleMeal(meal.momentId)}
          onOpenSubstitution={(item) => setActiveItem(item)}
        />

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Normas clínicas de sustitución</Text>
          <Text style={styles.infoText}>
            • Solo se permite sustituir ingredientes por otros del mismo grupo (BR-009).
          </Text>
          <Text style={styles.infoText}>
            • Las cantidades se recalculan automáticamente para mantener las raciones fijadas.
          </Text>
          <Text style={styles.infoText}>
            • Si incorporas huevo con yema o salmón, se descontarán 5 g de grasa automáticamente.
          </Text>
        </View>
      </ScrollView>

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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backButton: {
    minHeight: touchTarget.minHeight,
    minWidth: touchTarget.minWidth,
    justifyContent: 'center',
  },
  backButtonText: {
    ...typography.titleMedium,
    color: colors.primary,
  },
  topBarTitle: {
    ...typography.titleSmall,
    color: colors.textPrimary,
  },
  backPlaceholder: {
    width: touchTarget.minWidth,
  },
  scrollContent: {
    padding: spacing.lg,
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
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoTitle: {
    ...typography.labelBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
});
