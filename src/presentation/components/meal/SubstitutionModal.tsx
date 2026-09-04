/**
 * Modal de sustitución de alimentos (M4 / TASK-M4-001 / BR-009).
 * Permite cambiar un alimento exclusivamente por otro del mismo grupo
 * clínico (PROTEIN, CARBOHYDRATE, FAT) recalculando los gramos equivalentes
 * en tiempo real para preservar las raciones de la pauta.
 */

import React, { useMemo } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { FoodItem } from '@/application/dailyFlow';
import { getFoodsByGroup } from '@/data/nutrition/canonicalFoods';
import { portionsToQuantity } from '@/domain/nutrition/PortionEngine';
import { formatQuantity } from '@/domain/nutrition/quantities';
import type { Food, FoodGroupId } from '@/domain/nutrition/types';
import {
  borderRadius,
  spacing,
  touchTarget,
  typography,
  useTheme,
  type ThemeColors,
} from '@/presentation/theme';

export interface SubstitutionModalProps {
  readonly visible: boolean;
  readonly item: FoodItem | null;
  readonly momentLabel?: string;
  readonly onClose: () => void;
  readonly onSelectAlternative: (sourceFoodId: string, targetFoodId: string) => void;
}

const GROUP_LABELS: Record<FoodGroupId, string> = {
  PROTEIN: 'Proteína',
  CARBOHYDRATE: 'Carbohidratos',
  FAT: 'Grasas',
};

export const SubstitutionModal: React.FC<SubstitutionModalProps> = ({
  visible,
  item,
  momentLabel,
  onClose,
  onSelectAlternative,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (!item) {
    return null;
  }

  // Regla clínica BR-009: solo alimentos del mismo grupo exacto
  const alternatives = getFoodsByGroup(item.group);
  const groupName = GROUP_LABELS[item.group];
  const currentQuantityDisplay = formatQuantity({
    value: item.value,
    ...(item.maxValue !== undefined ? { maxValue: item.maxValue } : {}),
    unit: item.unit,
  });

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Cerrar modal" />

        <View style={styles.modalContent} accessible={true} accessibilityViewIsModal={true}>
          {/* Cabecera del modal */}
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.categoryBadge}>{groupName.toUpperCase()}</Text>
              <Text style={styles.title}>Sustituir alimento</Text>
              <Text style={styles.subtitle}>
                Equivalencia para {momentLabel ?? 'esta comida'}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Bloque: qué alimento hay ahora */}
          <View style={styles.currentFoodCard}>
            <View style={styles.currentFoodHeader}>
              <Text style={styles.currentFoodLabel}>Alimento actual</Text>
              <Text style={styles.currentFoodQuantity}>{currentQuantityDisplay}</Text>
            </View>
            <Text style={styles.currentFoodName}>{item.name}</Text>
          </View>

          {/* Separador de flujo */}
          <Text style={styles.changeForLabel}>Cambiar por</Text>

          {/* Lista de alternativas del mismo grupo: qué alimento puedo elegir → qué cantidad resulta */}
          <ScrollView
            style={styles.optionsList}
            contentContainerStyle={styles.optionsContainer}
            showsVerticalScrollIndicator={true}
          >
            {alternatives.map((candidate: Food) => {
              const isCurrent = candidate.id === item.foodId;
              const calculated = portionsToQuantity(candidate, item.portions);
              const quantityDisplay = formatQuantity(calculated);
              const isEggOrFattyFish =
                candidate.proteinCategory === 'EGG_WITH_YOLK' ||
                candidate.proteinCategory === 'FATTY_FISH';

              return (
                <Pressable
                  key={candidate.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${candidate.name}, ${quantityDisplay}${isCurrent ? ', seleccionado actualmente' : ''}`}
                  onPress={() => {
                    onSelectAlternative(item.foodId, candidate.id);
                    onClose();
                  }}
                  style={({ pressed }) => [
                    styles.optionRow,
                    isCurrent && styles.optionRowCurrent,
                    pressed && styles.optionRowPressed,
                  ]}
                >
                  <View style={styles.optionInfo}>
                    <Text style={[styles.optionName, isCurrent && styles.optionNameCurrent]}>
                      {candidate.name}
                      {candidate.rawStateNote ? ` (${candidate.rawStateNote})` : ''}
                    </Text>

                    {isEggOrFattyFish && (
                      <Text style={styles.fatDeductionHint}>
                        ⚡ Ajusta grasa (-5 g por ración)
                      </Text>
                    )}
                  </View>

                  <View style={styles.quantityContainer}>
                    <Text style={[styles.quantityText, isCurrent && styles.quantityTextCurrent]}>
                      {quantityDisplay}
                    </Text>
                    {isCurrent && (
                      <Text style={styles.currentTag}>Actual</Text>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.55)',
      justifyContent: 'flex-end',
    },
    backdrop: {
      ...StyleSheet.absoluteFill,
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
      maxHeight: '85%',
      paddingTop: spacing.lg,
      paddingBottom: spacing.xxxl,
      paddingHorizontal: spacing.lg,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.xs,
    },
    headerText: {
      flex: 1,
      marginRight: spacing.sm,
    },
    categoryBadge: {
      ...typography.caption,
      color: colors.training,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    title: {
      ...typography.titleLarge,
      color: colors.textPrimary,
    },
    subtitle: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      marginTop: 2,
    },
    closeButton: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: borderRadius.full,
      backgroundColor: colors.surfaceSubtle,
    },
    currentFoodCard: {
      backgroundColor: colors.surfaceSubtle,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginTop: spacing.sm,
      marginBottom: spacing.xs,
      borderWidth: 1,
      borderColor: colors.border,
    },
    currentFoodHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: spacing.xs,
      marginBottom: 2,
    },
    currentFoodLabel: {
      ...typography.caption,
      color: colors.textMuted,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    currentFoodQuantity: {
      ...typography.labelBold,
      color: colors.primaryDark,
      fontSize: 14,
    },
    currentFoodName: {
      ...typography.bodyLarge,
      color: colors.textPrimary,
      fontWeight: '600',
    },
    changeForLabel: {
      ...typography.caption,
      color: colors.textMuted,
      fontWeight: '700',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      marginTop: spacing.sm,
      marginBottom: spacing.xs,
      paddingLeft: spacing.xs,
    },
    optionsList: {
      maxHeight: 380,
    },
    optionsContainer: {
      gap: spacing.sm,
      paddingBottom: spacing.lg,
    },
    optionRow: {
      minHeight: touchTarget.minHeight,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surfaceSubtle,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1.5,
      borderColor: 'transparent',
    },
    optionRowCurrent: {
      backgroundColor: colors.primaryLight,
      borderColor: colors.primary,
    },
    optionRowPressed: {
      opacity: 0.8,
    },
    optionInfo: {
      flex: 1,
      marginRight: spacing.sm,
    },
    optionName: {
      ...typography.bodyMedium,
      color: colors.textPrimary,
      fontWeight: '500',
    },
    optionNameCurrent: {
      color: colors.primaryDark,
      fontWeight: '700',
    },
    fatDeductionHint: {
      ...typography.caption,
      color: colors.warningDark,
      marginTop: 2,
    },
    quantityContainer: {
      alignItems: 'flex-end',
      flexShrink: 0,
    },
    quantityText: {
      ...typography.labelBold,
      color: colors.textPrimary,
      fontSize: 15,
    },
    quantityTextCurrent: {
      color: colors.primaryDark,
    },
    currentTag: {
      ...typography.caption,
      color: colors.primaryDark,
      fontWeight: '700',
      fontSize: 10,
      marginTop: 2,
    },
  });

