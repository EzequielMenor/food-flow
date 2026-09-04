import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { parseDateKey, type FoodItem } from '@/application/dailyFlow';
import type { MomentId } from '@/domain/nutrition/types';
import { DayTypeSelector } from '@/presentation/components/daily/DayTypeSelector';
import { MealCard } from '@/presentation/components/daily/MealCard';
import { SubstitutionModal } from '@/presentation/components/meal/SubstitutionModal';
import { useDailyFlow } from '@/presentation/hooks/useDailyFlow';
import {
  borderRadius,
  spacing,
  typography,
  useTheme,
  type ThemeColors,
} from '@/presentation/theme';

function formatDisplayDate(dateKey: string): string {
  try {
    const d = parseDateKey(dateKey);
    const raw = d.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  } catch {
    return dateKey;
  }
}

export default function TodayScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const {
    dateKey,
    state,
    meals,
    dayType,
    isManuallySet,
    completedMealsCount,
    totalMealsCount,
    isAllCompleted,
    adherenceRate,
    isLoading,
    error,
    toggleMeal,
    changeDayType,
    substitute,
    refresh,
  } = useDailyFlow();

  const [activeSubstitution, setActiveSubstitution] = useState<{
    readonly item: FoodItem;
    readonly momentId: MomentId;
    readonly momentLabel: string;
  } | null>(null);

  const formattedDate = formatDisplayDate(dateKey);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refresh} />
        }
      >
        {/* Cabecera del día */}
        <View style={styles.headerContainer}>
          <Text style={styles.dateSubtitle}>{formattedDate}</Text>
          <Text style={styles.screenTitle}>Hoy</Text>
        </View>

        {/* Selector de tipo de día */}
        <DayTypeSelector
          dayType={dayType}
          isManuallySet={isManuallySet}
          onChangeDayType={changeDayType}
        />

        {/* Barra de progreso diario */}
        <View style={styles.progressCard}>
          <View style={styles.progressTextRow}>
            <Text style={styles.progressLabel}>Progreso del día</Text>
            <Text style={styles.progressCounter}>
              {completedMealsCount} de {totalMealsCount} comidas completadas
            </Text>
          </View>

          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.min(100, Math.round(adherenceRate * 100))}%` },
              ]}
            />
          </View>

          {isAllCompleted && (
            <Text style={styles.allDoneBanner}>
              ✓ ¡Objetivo cumplido! Has completado todas las comidas de hoy.
            </Text>
          )}
        </View>

        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>
              Error al guardar: {error.message}
            </Text>
          </View>
        )}

        {/* Lista de comidas */}
        {isLoading && meals.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <View style={styles.mealsList}>
            {meals.map((meal) => (
              <MealCard
                key={meal.momentId}
                meal={meal}
                isCompleted={Boolean(state.completed[meal.momentId])}
                onToggleCompleted={() => void toggleMeal(meal.momentId)}
                onPressCard={() =>
                  router.push({
                    pathname: '/meal/[id]',
                    params: { id: meal.momentId.toLowerCase() },
                  })
                }
                onOpenSubstitution={(item) =>
                  setActiveSubstitution({
                    item,
                    momentId: meal.momentId,
                    momentLabel: meal.label,
                  })
                }
              />
            ))}
          </View>
        )}

        <SubstitutionModal
          visible={activeSubstitution !== null}
          item={activeSubstitution?.item ?? null}
          momentLabel={activeSubstitution?.momentLabel}
          onClose={() => setActiveSubstitution(null)}
          onSelectAlternative={(sourceFoodId, targetFoodId) => {
            if (activeSubstitution) {
              void substitute(activeSubstitution.momentId, sourceFoodId, targetFoodId);
            }
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xxxl,
    },
    headerContainer: {
      marginTop: spacing.sm,
      marginBottom: spacing.xs,
    },
    dateSubtitle: {
      ...typography.caption,
      color: colors.textMuted,
      textTransform: 'capitalize',
    },
    screenTitle: {
      ...typography.titleLarge,
      color: colors.textPrimary,
    },
    progressCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginVertical: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    progressTextRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: spacing.xs,
      marginBottom: spacing.xs,
    },
    progressLabel: {
      ...typography.labelBold,
      color: colors.textPrimary,
      flexShrink: 1,
    },
    progressCounter: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    progressBarBackground: {
      height: 8,
      backgroundColor: colors.surfaceSubtle,
      borderRadius: borderRadius.full,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: borderRadius.full,
    },
    allDoneBanner: {
      ...typography.caption,
      color: colors.successDark,
      fontWeight: '600',
      marginTop: spacing.xs,
    },
    errorCard: {
      backgroundColor: colors.errorLight,
      padding: spacing.sm,
      borderRadius: borderRadius.md,
      marginVertical: spacing.xs,
    },
    errorText: {
      ...typography.caption,
      color: colors.error,
    },
    loadingContainer: {
      paddingVertical: spacing.xxxl,
      alignItems: 'center',
    },
    mealsList: {
      marginTop: spacing.xs,
    },
  });

