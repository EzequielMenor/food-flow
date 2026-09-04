/**
 * Pantalla de Progreso y Adherencia Clínica (M7 / TASK-M7-001).
 * Muestra el porcentaje de cumplimiento semanal, racha de días al 100%
 * y cuadrícula mensual interactiva con persistencia en SQLite.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { weeklyAdherence } from '@/domain/nutrition/adherence';
import {
  listDaySummaries,
  type DayRecordSummary,
} from '@/infrastructure/dayRepository';
import { CalendarGrid } from '@/presentation/components/progress/CalendarGrid';
import {
  borderRadius,
  spacing,
  typography,
  useTheme,
  type ThemeColors,
} from '@/presentation/theme';

function formatMonthTitle(date: Date): string {
  try {
    const raw = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  } catch {
    return `${date.getMonth() + 1}/${date.getFullYear()}`;
  }
}

export default function ProgressScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [currentDate] = useState<Date>(() => new Date());
  const [summaries, setSummaries] = useState<readonly DayRecordSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const loadProgress = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const year = currentDate.getFullYear();
      const monthIdx = currentDate.getMonth();
      const start = new Date(year, monthIdx, 1);
      const end = new Date(year, monthIdx + 1, 0);

      const data = await listDaySummaries(start, end);
      setSummaries(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    let isCancelled = false;

    async function fetchProgress() {
      try {
        const year = currentDate.getFullYear();
        const monthIdx = currentDate.getMonth();
        const start = new Date(year, monthIdx, 1);
        const end = new Date(year, monthIdx + 1, 0);

        const data = await listDaySummaries(start, end);
        if (!isCancelled) {
          setSummaries(data);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void fetchProgress();

    return () => {
      isCancelled = true;
    };
  }, [currentDate]);

  // Cálculos funcionales e inmutables de adherencia
  const metrics = useMemo(() => {
    const initial = {
      perfectDays: 0,
      totalCompletedMeals: 0,
      dayAdherences: [] as { completedMeals: number; totalMeals: number }[],
    };

    const reduced = summaries.reduce((acc, s) => {
      const isPerfect = s.totalPlannedMeals > 0 && s.completedMeals >= s.totalPlannedMeals;
      return {
        perfectDays: acc.perfectDays + (isPerfect ? 1 : 0),
        totalCompletedMeals: acc.totalCompletedMeals + s.completedMeals,
        dayAdherences: [
          ...acc.dayAdherences,
          {
            completedMeals: s.completedMeals,
            totalMeals: s.totalPlannedMeals,
          },
        ],
      };
    }, initial);

    const averageRate = weeklyAdherence(reduced.dayAdherences);

    return {
      averageRate,
      perfectDays: reduced.perfectDays,
      totalCompletedMeals: reduced.totalCompletedMeals,
      registeredDaysCount: summaries.length,
    };
  }, [summaries]);

  const monthName = formatMonthTitle(currentDate);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadProgress} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Progreso y Adherencia</Text>
          <Text style={styles.screenSubtitle}>
            Métricas de consistencia clínica y seguimiento histórico.
          </Text>
        </View>

        {/* Tarjetas KPI principales */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Adherencia media</Text>
            <Text style={styles.kpiValue}>
              {metrics.averageRate > 0 ? `${metrics.averageRate}%` : '—'}
            </Text>
            <Text style={styles.kpiSub}>En días registrados</Text>
          </View>

          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Días al 100%</Text>
            <Text style={styles.kpiValueHighlight}>{metrics.perfectDays}</Text>
            <Text style={styles.kpiSub}>Completados</Text>
          </View>
        </View>

        {/* Tarjeta de comidas acumuladas */}
        <View style={styles.summaryBanner}>
          <Text style={styles.summaryBannerTitle}>
            Total de comidas registradas este mes:
          </Text>
          <Text style={styles.summaryBannerCount}>
            {metrics.totalCompletedMeals} comidas
          </Text>
        </View>

        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>Error al cargar: {error.message}</Text>
          </View>
        )}

        {/* Calendario mensual */}
        <View style={styles.calendarSection}>
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarTitle}>{monthName}</Text>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.legendDotComplete]} />
                <Text style={styles.legendText}>100%</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.legendDotPartial]} />
                <Text style={styles.legendText}>Parcial</Text>
              </View>
            </View>
          </View>

          {isLoading && summaries.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <CalendarGrid month={currentDate} daySummaries={summaries} />
          )}
        </View>

        {/* Consejo clínico */}
        <View style={styles.coachingCard}>
          <Text style={styles.coachingTitle}>{'🎯 Consistencia > Perfección'}</Text>
          <Text style={styles.coachingText}>
            La pauta nutricional no busca un día aislado perfecto, sino la regularidad
            semana a semana. Si un día no completas todas las comidas, no compenses:
            continúa normalmente con la estructura prevista.
          </Text>
        </View>
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
    header: {
      marginTop: spacing.sm,
      marginBottom: spacing.md,
    },
    screenTitle: {
      ...typography.titleLarge,
      color: colors.textPrimary,
    },
    screenSubtitle: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    kpiRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      flexWrap: 'wrap',
      marginBottom: spacing.sm,
    },
    kpiCard: {
      flex: 1,
      minWidth: 140,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.xl,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    kpiLabel: {
      ...typography.caption,
      color: colors.textMuted,
      fontWeight: '600',
      marginBottom: spacing.xs,
    },
    kpiValue: {
      ...typography.titleLarge,
      fontSize: 28,
      color: colors.textPrimary,
    },
    kpiValueHighlight: {
      ...typography.titleLarge,
      fontSize: 28,
      color: colors.primary,
    },
    kpiSub: {
      ...typography.caption,
      color: colors.textSecondary,
      marginTop: 2,
    },
    summaryBanner: {
      backgroundColor: colors.surfaceSubtle,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: spacing.xs,
      marginBottom: spacing.md,
    },
    summaryBannerTitle: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      fontWeight: '500',
      flex: 1,
      marginRight: spacing.sm,
    },
    summaryBannerCount: {
      ...typography.labelBold,
      color: colors.textPrimary,
      flexShrink: 0,
    },
    calendarSection: {
      marginBottom: spacing.md,
    },
    calendarHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: spacing.xs,
      marginBottom: spacing.sm,
      paddingHorizontal: spacing.xs,
    },
    calendarTitle: {
      ...typography.titleSmall,
      color: colors.textPrimary,
    },
    legendRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      flexWrap: 'wrap',
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    legendDot: {
      width: 8,
      height: 8,
      borderRadius: borderRadius.full,
    },
    legendDotComplete: {
      backgroundColor: colors.primary,
    },
    legendDotPartial: {
      backgroundColor: colors.warning,
    },
    legendText: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    loadingContainer: {
      paddingVertical: spacing.xxxl,
      alignItems: 'center',
    },
    errorCard: {
      backgroundColor: colors.errorLight,
      padding: spacing.sm,
      borderRadius: borderRadius.md,
      marginBottom: spacing.md,
    },
    errorText: {
      ...typography.caption,
      color: colors.error,
    },
    coachingCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.xl,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    coachingTitle: {
      ...typography.labelBold,
      color: colors.textPrimary,
      marginBottom: 4,
    },
    coachingText: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      lineHeight: 18,
    },
  });

