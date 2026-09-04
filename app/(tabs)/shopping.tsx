/**
 * Pantalla de Lista de la Compra (M6 / TASK-M6-001).
 * Checklist interactiva agrupada por secciones de supermercado, con persistencia
 * atómica en SQLite, preservación de checks al regenerar y reseteo semanal.
 * Virtualizada mediante FlatList para escalabilidad y fluidez nativa.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
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
import {
  borderRadius,
  spacing,
  typography,
  useTheme,
  type ThemeColors,
} from '@/presentation/theme';

const CATEGORY_ORDER: readonly ShoppingCategory[] = [
  'PROTEIN',
  'FISH',
  'DAIRY',
  'CARBS',
  'FATS',
  'PRODUCE',
  'PANTRY',
];

interface CategoryGroup {
  readonly category: ShoppingCategory;
  readonly label: string;
  readonly items: readonly ShoppingItemRow[];
}

export default function ShoppingScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

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

  const activeCategorySections = useMemo<readonly CategoryGroup[]>(() => {
    return CATEGORY_ORDER.map((category) => ({
      category,
      label: shoppingCategoryLabel[category],
      items: groupedItems.get(category) ?? [],
    })).filter((group) => group.items.length > 0);
  }, [groupedItems]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <FlatList
        data={activeCategorySections}
        keyExtractor={(item) => item.category}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadItems} />
        }
        ListHeaderComponent={
          <>
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
                  {checkedCount} de {totalCount} comprados ({progressPercent}%)
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

            {isLoading && items.length === 0 && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            )}
          </>
        }
        renderItem={({ item: group }) => (
          <View style={styles.categorySection}>
            <Text style={styles.categoryTitle}>
              {group.label.toUpperCase()}
            </Text>

            <View style={styles.categoryCard}>
              {group.items.map((item) => (
                <Pressable
                  key={item.id}
                  accessibilityRole="checkbox"
                  accessibilityLabel={`${item.productName}, ${item.quantityDisplay}${item.isChecked ? ', comprado' : ''}`}
                  accessibilityState={{ checked: item.isChecked }}
                  onPress={() => void handleToggle(item)}
                  style={({ pressed }) => [
                    styles.itemRow,
                    item.isChecked && styles.itemRowChecked,
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
              ))}
            </View>
          </View>
        )}
        ListFooterComponent={
          items.length > 0 ? (
            <View style={styles.regenerateContainer}>
              <Button
                title="Regenerar lista desde el menú"
                variant="secondary"
                onPress={() => void handleRegenerate()}
              />
            </View>
          ) : null
        }
      />
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
      flexWrap: 'wrap',
      gap: spacing.xs,
      marginBottom: spacing.xs,
    },
    progressLabel: {
      ...typography.labelBold,
      color: colors.textPrimary,
      flex: 1,
      marginRight: spacing.sm,
    },
    progressCounter: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      fontWeight: '600',
      flexShrink: 0,
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
    categorySection: {
      marginBottom: spacing.md,
    },
    categoryTitle: {
      ...typography.caption,
      color: colors.textMuted,
      fontWeight: '700',
      letterSpacing: 0.6,
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
      minHeight: 52,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 0.5,
      borderBottomColor: colors.border,
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    itemRowChecked: {
      backgroundColor: colors.surfaceCompleted,
      opacity: 0.6,
    },
    itemRowPressed: {
      backgroundColor: colors.surfaceSubtle,
    },
    checkbox: {
      width: 26,
      height: 26,
      borderRadius: borderRadius.sm + 1,
      borderWidth: 1.5,
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
      fontSize: 15,
      fontWeight: '800',
    },
    itemInfo: {
      flex: 1,
      minWidth: 140,
      marginRight: spacing.sm,
    },
    itemName: {
      ...typography.bodyMedium,
      color: colors.textPrimary,
      fontWeight: '500',
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
      flexShrink: 0,
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

