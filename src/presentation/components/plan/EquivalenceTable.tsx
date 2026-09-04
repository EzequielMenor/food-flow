/**
 * Tabla interactiva de equivalencias clínicas y momentos de la pauta (M5).
 * Muestra el catálogo 1R con el rango de aguacate 50–55 g y reglas de deducción.
 */

import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FOODS } from '@/data/nutrition/canonicalFoods';
import { formatQuantity } from '@/domain/nutrition/quantities';
import type { FoodGroupId } from '@/domain/nutrition/types';
import { borderRadius, colors, spacing, touchTarget, typography } from '@/presentation/theme/tokens';

const GROUPS: readonly { id: FoodGroupId; label: string }[] = [
  { id: 'PROTEIN', label: 'Proteína' },
  { id: 'CARBOHYDRATE', label: 'Carbohidratos' },
  { id: 'FAT', label: 'Grasas' },
];

export const EquivalenceTable: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState<FoodGroupId>('PROTEIN');

  const filteredFoods = FOODS.filter((f) => f.group === selectedGroup);

  return (
    <View style={styles.container}>
      {/* Selector de grupo */}
      <View style={styles.tabGroup} accessible={true} accessibilityRole="tablist">
        {GROUPS.map((g) => {
          const isSelected = selectedGroup === g.id;
          return (
            <Pressable
              key={g.id}
              accessibilityRole="tab"
              accessibilityLabel={`Grupo ${g.label}`}
              accessibilityState={{ selected: isSelected }}
              onPress={() => setSelectedGroup(g.id)}
              style={({ pressed }) => [
                styles.tab,
                isSelected && styles.tabSelected,
                pressed && styles.tabPressed,
              ]}
            >
              <Text style={[styles.tabText, isSelected && styles.tabTextSelected]}>
                {g.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Lista de alimentos de 1 Ración */}
      <View style={styles.tableCard}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderLabel}>Alimento</Text>
          <Text style={styles.tableHeaderValue}>1 Ración (1R)</Text>
        </View>

        {filteredFoods.map((food) => {
          const isAvocado = food.id === 'food:aguacate';
          const isDeducting =
            food.proteinCategory === 'EGG_WITH_YOLK' ||
            food.proteinCategory === 'FATTY_FISH';

          return (
            <View key={food.id} style={styles.tableRow}>
              <View style={styles.foodInfo}>
                <Text style={styles.foodName}>{food.name}</Text>
                {food.rawStateNote && (
                  <Text style={styles.foodNote}>({food.rawStateNote})</Text>
                )}
                {isDeducting && (
                  <Text style={styles.deductionTag}>-5 g grasa en comida</Text>
                )}
              </View>

              <Text style={[styles.foodQuantity, isAvocado && styles.avocadoHighlight]}>
                {formatQuantity(food.baseQuantity)}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Reglas clínicas específicas */}
      {selectedGroup === 'FAT' && (
        <View style={styles.calloutCard}>
          <Text style={styles.calloutTitle}>🥑 Rango clínico de Aguacate</Text>
          <Text style={styles.calloutText}>
            1R de grasa = 50–55 g de aguacate. Se preserva siempre el rango exacto de la pauta.
          </Text>
        </View>
      )}

      {selectedGroup === 'PROTEIN' && (
        <View style={styles.calloutCard}>
          <Text style={styles.calloutTitle}>🍳 Deducción genérica de grasa</Text>
          <Text style={styles.calloutText}>
            Por cada ración de huevo entero o pescado azul, se descuenta 0.5R de grasa (5 g).
            Suelo en 0 g (nunca raciones negativas).
          </Text>
        </View>
      )}

      {/* Cuadro comparativo Entreno vs Descanso */}
      <View style={styles.structureCard}>
        <Text style={styles.structureTitle}>Estructura Diaria de Raciones</Text>
        <View style={styles.structureRow}>
          <View style={styles.structureCol}>
            <Text style={styles.structureColHeader}>Entrenamiento (5 comidas)</Text>
            <Text style={styles.structureMacros}>16P · 17C · 5G</Text>
            <Text style={styles.structureDetail}>Pre: 1C + 1G</Text>
            <Text style={styles.structureDetail}>Almuerzo: 5P + 4C + 1G</Text>
            <Text style={styles.structureDetail}>Comida: 4P + 4C + 1G</Text>
            <Text style={styles.structureDetail}>Merienda: 2P + 4C + 1G</Text>
            <Text style={styles.structureDetail}>Cena: 4P + 4C + 1G</Text>
          </View>

          <View style={styles.dividerVertical} />

          <View style={styles.structureCol}>
            <Text style={styles.structureColHeader}>Descanso (4 comidas)</Text>
            <Text style={styles.structureMacros}>16P · 11C · 4G</Text>
            <Text style={styles.structureDetail}>Almuerzo: 5P + 3C + 1G</Text>
            <Text style={styles.structureDetail}>Comida: 4P + 4C + 1G</Text>
            <Text style={styles.structureDetail}>Merienda: 2P + 2C + 1G</Text>
            <Text style={styles.structureDetail}>Cena: 4P + 2C + 1G</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  tabGroup: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    minHeight: touchTarget.minHeight,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
  },
  tabSelected: {
    backgroundColor: colors.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tabPressed: {
    opacity: 0.8,
  },
  tabText: {
    ...typography.labelBold,
    color: colors.textSecondary,
  },
  tabTextSelected: {
    color: colors.primary,
  },
  tableCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.xs,
  },
  tableHeaderLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  tableHeaderValue: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  foodInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  foodName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  foodNote: {
    ...typography.caption,
    color: colors.textMuted,
  },
  deductionTag: {
    ...typography.caption,
    color: '#92400E',
    marginTop: 2,
  },
  foodQuantity: {
    ...typography.labelBold,
    color: colors.textPrimary,
  },
  avocadoHighlight: {
    color: colors.primary,
    fontWeight: '700',
  },
  calloutCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  calloutTitle: {
    ...typography.labelBold,
    color: colors.primaryDark,
    marginBottom: 2,
  },
  calloutText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  structureCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  structureTitle: {
    ...typography.titleSmall,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  structureRow: {
    flexDirection: 'row',
  },
  structureCol: {
    flex: 1,
  },
  structureColHeader: {
    ...typography.labelBold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  structureMacros: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  structureDetail: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  dividerVertical: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
});
