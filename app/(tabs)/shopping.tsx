/**
 * Pantalla de Lista de la Compra (M6 / TASK-M6-001).
 * Checklist interactiva agrupada por secciones de supermercado, con persistencia
 * atómica en SQLite, preservación de checks al regenerar y reseteo semanal.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  generateShoppingList,
  shoppingCategoryLabel,
  weekKey,
  type ShoppingCategory,
} from '@/application/generateShoppingList';
import { parseDateKey } from '@/application/dailyFlow';
import {
  ensureShoppingList,
  resetShoppingList,
  syncShoppingList,
  toggleShoppingItem,
  type ShoppingItemRow,
} from '@/infrastructure/shoppingRepository';
import { Button } from '@/presentation/components/ui/Button';
import { borderRadius, colors, spacing, touchTarget, typography } from '@/presentation/theme/tokens';

const CATEGORY_ORDER: readonly ShoppingCategory[] = [
  'PROTEIN',
  'FISH',
  'DAIRY',
  'CARBS',
  'FATS',
  'PRODUCE',
  'PANTRY',
];

export default function ShoppingScreen() {
  const currentWeekKey = useMemo(() => weekKey(new Date()), []);
  const [items, setItems] = useState<readonly ShoppingItemRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ensureShoppingList(currentWeekKey);
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [currentWeekKey]);

  useEffect(() => {
    let isCancelled = false;

    async function fetchShopping() {
      try {
        const data = await ensureShoppingList(currentWeekKey);
        if (!isCancelled) {
          setItems(data);
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

    void fetchShopping();

    return () => {
      isCancelled = true;
    };
  }, [currentWeekKey]);

  const handleToggle = useCallback(
    async (item: ShoppingItemRow) => {
      const nextChecked = !item.isChecked;
      // Actualización optimista en React
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isChecked: nextChecked } : i))
      );

      try {
        await toggleShoppingItem(item.id, nextChecked);
      } catch (err) {
        // Reversión
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, isChecked: item.isChecked } : i))
        );
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    },
    []
  );

  const handleReset = useCallback(async () => {
    Alert.alert(
      'Reiniciar lista',
      '¿Quieres desmarcar todos los productos de la compra de esta semana?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desmarcar todo',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await resetShoppingList(currentWeekKey);
              setItems((prev) => prev.map((i) => ({ ...i, isChecked: false })));
            } catch (err) {
              setError(err instanceof Error ? err : new Error(String(err)));
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  }, [currentWeekKey]);

  const handleRegenerate = useCallback(async () => {
    setIsLoading(true);
    try {
      const lines = generateShoppingList(parseDateKey(currentWeekKey));
      const updated = await syncShoppingList(currentWeekKey, lines);
      setItems(updated);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [currentWeekKey]);

  const checkedCount = useMemo(() => items.filter((i) => i.isChecked).length, [items]);
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  // Agrupación de ítems por categoría
  const groupedItems = useMemo(() => {
    const map = new Map<ShoppingCategory, ShoppingItemRow[]>();
    for (const cat of CATEGORY_ORDER) {
      map.set(cat, []);
    }
    for (const item of items) {
      const list = map.get(item.category);
      if (list) {
        list.push(item);
      }
    }
    return map;
  }, [items]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadItems} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Lista de la Compra</Text>
          <Text style={styles.screenSubtitle}>
            Semana del {currentWeekKey} · Ingredientes consolidados al gramo.
          </Text>
        </View>

        {/* Tarjeta de progreso de compra */}
        <View style={styles.progressCard}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Progreso de compra</Text>
            <Text style={styles.progressCounter}>
              {checkedCount} / {totalCount} comprados ({progressPercent}%)
            </Text>
          </View>

          <View style={styles.progressBarBackground}>
            <View
              style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
            />
          </View>

          {checkedCount > 0 && (
            <View style={styles.resetRow}>
              <Button
                title="Desmarcar todo"
                variant="outline"
                onPress={() => void handleReset()}
                style={styles.resetBtn}
              />
            </View>
          )}
        </View>

        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>Error: {error.message}</Text>
          </View>
        )}

        {isLoading && items.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <View style={styles.sectionsList}>
            {CATEGORY_ORDER.map((category) => {
              const categoryItems = groupedItems.get(category) ?? [];
              if (categoryItems.length === 0) {
                return null;
              }

              return (
                <View key={category} style={styles.categorySection}>
                  <Text style={styles.categoryTitle}>
                    {shoppingCategoryLabel[category].toUpperCase()}
                  </Text>

                  <View style={styles.categoryCard}>
                    {categoryItems.map((item) => {
                      return (
                        <Pressable
                          key={item.id}
                          accessibilityRole="checkbox"
                          accessibilityLabel={`${item.productName}, ${item.quantityDisplay}${item.isChecked ? ', comprado' : ''}`}
                          accessibilityState={{ checked: item.isChecked }}
                          onPress={() => void handleToggle(item)}
                          style={({ pressed }) => [
                            styles.itemRow,
                            pressed && styles.itemRowPressed,
                          ]}
                        >
                          <View
                            style={[
                              styles.checkbox,
                              item.isChecked && styles.checkboxChecked,
                            ]}
                          >
                            {item.isChecked && (
                              <Text style={styles.checkIcon}>✓</Text>
                            )}
                          </View>

                          <View style={styles.itemInfo}>
                            <Text
                              style={[
                                styles.itemName,
                                item.isChecked && styles.itemNameChecked,
                              ]}
                            >
                              {item.productName}
                            </Text>
                            {item.note ? (
                              <Text
                                style={[
                                  styles.itemNote,
                                  item.isChecked && styles.itemNoteChecked,
                                ]}
                              >
                                {item.note}
                              </Text>
                            ) : null}
                          </View>

                          <Text
                            style={[
                              styles.itemQuantity,
                              item.isChecked && styles.itemQuantityChecked,
                            ]}
                          >
                            {item.quantityDisplay}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              );
            })}

            {/* Acción de regenerar */}
            <View style={styles.regenerateContainer}>
              <Button
                title="Regenerar lista desde el menú"
                variant="secondary"
                onPress={() => void handleRegenerate()}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  progressCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  progressLabel: {
    ...typography.labelBold,
    color: colors.textPrimary,
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
  resetRow: {
    marginTop: spacing.sm,
  },
  resetBtn: {
    minHeight: 40,
    paddingVertical: spacing.xs,
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
  loadingContainer: {
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
  },
  sectionsList: {
    gap: spacing.md,
  },
  categorySection: {
    marginBottom: spacing.xs,
  },
  categoryTitle: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
    paddingLeft: spacing.xs,
  },
  categoryCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  itemRow: {
    minHeight: touchTarget.minHeight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  itemRowPressed: {
    backgroundColor: colors.surfaceSubtle,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkIcon: {
    color: colors.textInverse,
    fontSize: 14,
    fontWeight: '700',
  },
  itemInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  itemName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  itemNameChecked: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  itemNote: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  itemNoteChecked: {
    textDecorationLine: 'line-through',
    color: colors.borderStrong,
  },
  itemQuantity: {
    ...typography.labelBold,
    color: colors.textPrimary,
  },
  itemQuantityChecked: {
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  regenerateContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.xxl,
  },
});
