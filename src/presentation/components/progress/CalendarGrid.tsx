/**
 * Cuadrícula de calendario de adherencia clínica (M7 / TASK-M7-001).
 * Representa visualmente los días cumplidos al 100%, parciales o vacíos.
 */

import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { DayRecordSummary } from '@/infrastructure/dayRepository';
import { dateKeyOf } from '@/application/dailyFlow';
import {
  borderRadius,
  spacing,
  typography,
  useTheme,
  type ThemeColors,
} from '@/presentation/theme';

export interface CalendarGridProps {
  readonly month: Date;
  readonly daySummaries: readonly DayRecordSummary[];
  readonly onSelectDate?: (dateKey: string) => void;
}

const WEEKDAY_HEADERS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  month,
  daySummaries,
  onSelectDate,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const summaryByDate = React.useMemo(() => {
    const map = new Map<string, DayRecordSummary>();
    for (const s of daySummaries) {
      map.set(s.dateKey, s);
    }
    return map;
  }, [daySummaries]);

  // Días del mes
  const year = month.getFullYear();
  const monthIdx = month.getMonth();
  const firstDay = new Date(year, monthIdx, 1);
  const lastDay = new Date(year, monthIdx + 1, 0);
  const daysInMonth = lastDay.getDate();

  // Offset del primer día (0 = lunes ... 6 = domingo)
  const firstDayOffset = (firstDay.getDay() + 6) % 7;

  const todayKey = dateKeyOf(new Date());

  const gridCells: ({ dayNumber: number; dateKey: string } | null)[] = [];
  for (let i = 0; i < firstDayOffset; i++) {
    gridCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, monthIdx, d);
    gridCells.push({ dayNumber: d, dateKey: dateKeyOf(dateObj) });
  }

  return (
    <View style={styles.container}>
      {/* Cabecera de días de la semana */}
      <View style={styles.weekdayRow}>
        {WEEKDAY_HEADERS.map((dayLabel, idx) => (
          <Text
            key={`header-${idx}`}
            maxFontSizeMultiplier={1.3}
            style={styles.weekdayHeader}
          >
            {dayLabel}
          </Text>
        ))}
      </View>

      {/* Celdas del calendario */}
      <View style={styles.grid}>
        {gridCells.map((cell, idx) => {
          if (!cell) {
            return <View key={`empty-${idx}`} style={styles.emptyCell} />;
          }

          const summary = summaryByDate.get(cell.dateKey);
          const isToday = cell.dateKey === todayKey;
          const isComplete =
            summary &&
            summary.totalPlannedMeals > 0 &&
            summary.completedMeals >= summary.totalPlannedMeals;
          const isPartial =
            summary &&
            summary.completedMeals > 0 &&
            summary.completedMeals < summary.totalPlannedMeals;

          const a11yLabel = summary
            ? `Día ${cell.dayNumber}, ${summary.completedMeals} de ${summary.totalPlannedMeals} comidas`
            : `Día ${cell.dayNumber}, sin registro`;

          return (
            <Pressable
              key={cell.dateKey}
              accessibilityRole="button"
              accessibilityLabel={a11yLabel}
              onPress={() => onSelectDate?.(cell.dateKey)}
              style={({ pressed }) => [
                styles.dayCell,
                isToday && styles.todayCell,
                isComplete && styles.completeCell,
                isPartial && styles.partialCell,
                pressed && styles.cellPressed,
              ]}
            >
              <Text
                maxFontSizeMultiplier={1.3}
                style={[
                  styles.dayNumberText,
                  isToday && styles.todayText,
                  isComplete && styles.completeText,
                ]}
              >
                {cell.dayNumber}
              </Text>
              {isComplete && (
                <Text maxFontSizeMultiplier={1.3} style={styles.checkMark}>
                  ✓
                </Text>
              )}
              {isPartial && <View style={styles.partialDot} />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    weekdayRow: {
      flexDirection: 'row',
      width: '100%',
      paddingBottom: spacing.xs,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginBottom: spacing.xs,
    },
    weekdayHeader: {
      ...typography.caption,
      color: colors.textMuted,
      fontWeight: '700',
      textAlign: 'center',
      width: `${100 / 7}%`,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      width: '100%',
    },
    emptyCell: {
      width: `${100 / 7}%`,
      height: 42,
    },
    dayCell: {
      width: `${100 / 7}%`,
      height: 42,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: borderRadius.sm,
      marginVertical: 1,
    },
    cellPressed: {
      opacity: 0.7,
    },
    todayCell: {
      borderWidth: 1.5,
      borderColor: colors.primary,
    },
    completeCell: {
      backgroundColor: colors.successLight,
    },
    partialCell: {
      backgroundColor: colors.warningLight,
    },
    dayNumberText: {
      ...typography.caption,
      color: colors.textPrimary,
      fontWeight: '500',
      fontSize: 12,
    },
    todayText: {
      fontWeight: '700',
      color: colors.primaryDark,
    },
    completeText: {
      color: colors.successDark,
      fontWeight: '700',
    },
    checkMark: {
      fontSize: 9,
      color: colors.successDark,
      fontWeight: '900',
      lineHeight: 10,
    },
    partialDot: {
      width: 4,
      height: 4,
      borderRadius: borderRadius.full,
      backgroundColor: colors.warning,
      marginTop: 2,
    },
  });
