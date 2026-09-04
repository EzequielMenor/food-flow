/**
 * Pantalla "Plan": consulta clínica de equivalencias, 8 recetas y 6 salsas (M5).
 */

import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RECIPES } from '@/data/recipes/recipes';
import { SAUCES, SAUCE_RULE_OF_THUMB } from '@/data/recipes/sauces';
import { EquivalenceTable } from '@/presentation/components/plan/EquivalenceTable';
import { RecipeCard } from '@/presentation/components/plan/RecipeCard';
import { SauceCard } from '@/presentation/components/plan/SauceCard';
import {
  borderRadius,
  spacing,
  touchTarget,
  typography,
  useTheme,
  type ThemeColors,
} from '@/presentation/theme';

type PlanSection = 'EQUIVALENCES' | 'RECIPES' | 'SAUCES';

export default function PlanScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [activeSection, setActiveSection] = useState<PlanSection>('EQUIVALENCES');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Plan y Recetas</Text>
          <Text style={styles.screenSubtitle}>
            Pauta clínica de Bel·lan Farmacia, recetario rápido y fórmulas de sabor.
          </Text>
        </View>

        {/* Selector de sección principal */}
        <View style={styles.segmentedControl} accessible={true} accessibilityRole="tablist">
          <Pressable
            accessibilityRole="tab"
            accessibilityLabel="Sección de equivalencias y raciones"
            accessibilityState={{ selected: activeSection === 'EQUIVALENCES' }}
            onPress={() => setActiveSection('EQUIVALENCES')}
            style={({ pressed }) => [
              styles.segmentBtn,
              activeSection === 'EQUIVALENCES' && styles.segmentBtnActive,
              pressed && styles.segmentPressed,
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                activeSection === 'EQUIVALENCES' && styles.segmentTextActive,
              ]}
            >
              Equivalencias
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="tab"
            accessibilityLabel="Sección de 8 recetas del PDF"
            accessibilityState={{ selected: activeSection === 'RECIPES' }}
            onPress={() => setActiveSection('RECIPES')}
            style={({ pressed }) => [
              styles.segmentBtn,
              activeSection === 'RECIPES' && styles.segmentBtnActive,
              pressed && styles.segmentPressed,
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                activeSection === 'RECIPES' && styles.segmentTextActive,
              ]}
            >
              Recetas (8)
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="tab"
            accessibilityLabel="Sección de 6 salsas ligeras"
            accessibilityState={{ selected: activeSection === 'SAUCES' }}
            onPress={() => setActiveSection('SAUCES')}
            style={({ pressed }) => [
              styles.segmentBtn,
              activeSection === 'SAUCES' && styles.segmentBtnActive,
              pressed && styles.segmentPressed,
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                activeSection === 'SAUCES' && styles.segmentTextActive,
              ]}
            >
              Salsas (6)
            </Text>
          </Pressable>
        </View>

        {/* Contenido según sección activa */}
        {activeSection === 'EQUIVALENCES' && <EquivalenceTable />}

        {activeSection === 'RECIPES' && (
          <View style={styles.listContainer}>
            <Text style={styles.sectionIntro}>
              Las 8 recetas rápidas de la pauta. Cantidades preparadas para 12-15 minutos.
            </Text>
            {RECIPES.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </View>
        )}

        {activeSection === 'SAUCES' && (
          <View style={styles.listContainer}>
            <View style={styles.ruleCard}>
              <Text style={styles.ruleTitle}>Regla de oro:</Text>
              <Text style={styles.ruleText}>{SAUCE_RULE_OF_THUMB}</Text>
            </View>
            {SAUCES.map((sauce) => (
              <SauceCard key={sauce.id} sauce={sauce} />
            ))}
          </View>
        )}
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
    segmentedControl: {
      flexDirection: 'row',
      backgroundColor: colors.surfaceSubtle,
      borderRadius: borderRadius.lg,
      padding: spacing.xs,
      marginBottom: spacing.md,
    },
    segmentBtn: {
      flex: 1,
      minHeight: touchTarget.minHeight,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: borderRadius.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: 2,
    },
    segmentBtnActive: {
      backgroundColor: colors.surface,
      elevation: 2,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    segmentPressed: {
      opacity: 0.8,
    },
    segmentText: {
      ...typography.labelBold,
      color: colors.textSecondary,
      textAlign: 'center',
      flexShrink: 1,
    },
    segmentTextActive: {
      color: colors.primary,
    },
    listContainer: {
      marginVertical: spacing.xs,
    },
    sectionIntro: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      marginBottom: spacing.sm,
    },
    ruleCard: {
      backgroundColor: colors.primaryLight,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    ruleTitle: {
      ...typography.labelBold,
      color: colors.primaryDark,
      marginBottom: 2,
    },
    ruleText: {
      ...typography.bodySmall,
      color: colors.textPrimary,
    },
  });

