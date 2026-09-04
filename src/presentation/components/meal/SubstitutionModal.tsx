/**
 * Modal de sustitución de alimentos (M4 / TASK-M4-001 / BR-009).
 * Permite cambiar un alimento exclusivamente por otro del mismo grupo
 * clínico (PROTEIN, CARBOHYDRATE, FAT) recalculando los gramos equivalentes
 * en tiempo real para preservar las raciones de la pauta.
 */

import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { FoodItem } from '@/application/dailyFlow';
import { getFoodsByGroup } from '@/data/nutrition/canonicalFoods';
import { portionsToQuantity } from '@/domain/nutrition/PortionEngine';
import { formatQuantity } from '@/domain/nutrition/quantities';
import type { Food, FoodGroupId } from '@/domain/nutrition/types';
import { borderRadius, colors, spacing, touchTarget, typography } from '@/presentation/theme/tokens';

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
  if (!item) {
    return null;
  }

  // Regla clínica BR-009: solo alimentos del mismo grupo exacto
  const alternatives = getFoodsByGroup(item.group);
  const groupName = GROUP_LABELS[item.group];

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
                Preservando {item.portions} {item.portions === 1 ? 'ración' : 'raciones'} en {momentLabel ?? 'la comida'}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
              onPress={onClose}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
          </View>

          <Text style={styles.currentFoodHint}>
            Original: <Text style={styles.currentFoodName}>{item.name}</Text>
          </Text>

          {/* Lista de alternativas del mismo grupo */}
          <ScrollView style={styles.optionsList} contentContainerStyle={styles.optionsContainer}>
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '80%',
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
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
    width: touchTarget.minWidth,
    height: touchTarget.minHeight,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceSubtle,
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  currentFoodHint: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  currentFoodName: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  optionsList: {
    maxHeight: 420,
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
    color: '#92400E',
    marginTop: 2,
  },
  quantityContainer: {
    alignItems: 'flex-end',
  },
  quantityText: {
    ...typography.labelBold,
    color: colors.textPrimary,
  },
  quantityTextCurrent: {
    color: colors.primaryDark,
  },
  currentTag: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
  },
});
