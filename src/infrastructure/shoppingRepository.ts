/**
 * M3/M6: persistencia de la lista de la compra en SQLite local-first.
 * Almacena los ítems derivados de la semana actual y preserva los checks del
 * usuario al regenerar o actualizar el menú semanal (data-model.md §3).
 */

import type { ShoppingCategory, ShoppingLine } from '@/application/generateShoppingList';
import { generateShoppingList } from '@/application/generateShoppingList';
import { parseDateKey } from '@/application/dailyFlow';
import { getDatabase, type DbLike } from './database';

export interface ShoppingItemRow {
  readonly id: string;
  readonly weekKey: string;
  readonly category: ShoppingCategory;
  readonly productName: string;
  readonly quantityDisplay: string;
  readonly note?: string;
  readonly isChecked: boolean;
  readonly sortOrder: number;
}

interface RawShoppingRow {
  id: string;
  week_key: string;
  category: string;
  product_name: string;
  quantity_display: string;
  note: string | null;
  is_checked: number;
  sort_order: number;
}

function mapRow(row: RawShoppingRow): ShoppingItemRow {
  return Object.freeze({
    id: row.id,
    weekKey: row.week_key,
    category: row.category as ShoppingCategory,
    productName: row.product_name,
    quantityDisplay: row.quantity_display,
    ...(row.note !== null ? { note: row.note } : {}),
    isChecked: row.is_checked === 1,
    sortOrder: row.sort_order,
  });
}

export function shoppingItemId(weekKey: string, lineId: string): string {
  return `${weekKey}:${lineId}`;
}

export async function loadShoppingList(
  weekKey: string,
  getDb: () => Promise<DbLike> = getDatabase
): Promise<ShoppingItemRow[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<RawShoppingRow>(
    `SELECT id, week_key, category, product_name, quantity_display, note, is_checked, sort_order
       FROM shopping_items
      WHERE week_key = ?
      ORDER BY sort_order ASC, id ASC`,
    [weekKey]
  );
  return rows.map(mapRow);
}

export async function syncShoppingList(
  weekKey: string,
  lines: readonly ShoppingLine[],
  getDb: () => Promise<DbLike> = getDatabase
): Promise<ShoppingItemRow[]> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    const existing = await db.getAllAsync<{ id: string; is_checked: number }>(
      'SELECT id, is_checked FROM shopping_items WHERE week_key = ?',
      [weekKey]
    );
    const checkedMap = new Map<string, number>();
    for (const row of existing) {
      checkedMap.set(row.id, row.is_checked);
    }

    const activeGeneratedIds = new Set<string>();
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index]!;
      const id = shoppingItemId(weekKey, line.id);
      activeGeneratedIds.add(id);
      const isChecked = checkedMap.get(id) ?? 0;

      await db.runAsync(
        `INSERT INTO shopping_items
           (id, week_key, category, product_name, quantity_display, note, is_checked, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           category = excluded.category,
           product_name = excluded.product_name,
           quantity_display = excluded.quantity_display,
           note = excluded.note,
           sort_order = excluded.sort_order`,
        [
          id,
          weekKey,
          line.category,
          line.name,
          line.quantityDisplay,
          line.note ?? null,
          isChecked,
          index,
        ]
      );
    }

    // Retira ítems generados previos que ya no existen en el plan actual
    for (const row of existing) {
      if (!activeGeneratedIds.has(row.id) && !row.id.startsWith(`${weekKey}:custom:`)) {
        await db.runAsync('DELETE FROM shopping_items WHERE id = ?', [row.id]);
      }
    }
  });

  return loadShoppingList(weekKey, getDb);
}

export async function ensureShoppingList(
  weekKey: string,
  fallbackLines?: () => readonly ShoppingLine[],
  getDb: () => Promise<DbLike> = getDatabase
): Promise<ShoppingItemRow[]> {
  const existing = await loadShoppingList(weekKey, getDb);
  if (existing.length > 0) {
    return existing;
  }
  const lines = fallbackLines ? fallbackLines() : generateShoppingList(parseDateKey(weekKey));
  return syncShoppingList(weekKey, lines, getDb);
}

export async function toggleShoppingItem(
  id: string,
  isChecked: boolean,
  getDb: () => Promise<DbLike> = getDatabase
): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE shopping_items SET is_checked = ? WHERE id = ?', [
    isChecked ? 1 : 0,
    id,
  ]);
}

export async function resetShoppingList(
  weekKey: string,
  getDb: () => Promise<DbLike> = getDatabase
): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE shopping_items SET is_checked = 0 WHERE week_key = ?', [weekKey]);
}

export async function addCustomShoppingItem(
  weekKey: string,
  item: {
    category: ShoppingCategory;
    productName: string;
    quantityDisplay: string;
    note?: string;
  },
  getDb: () => Promise<DbLike> = getDatabase
): Promise<ShoppingItemRow> {
  const db = await getDb();
  const id = `${weekKey}:custom:${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const maxOrderRow = await db.getFirstAsync<{ max_order: number | null }>(
    'SELECT MAX(sort_order) as max_order FROM shopping_items WHERE week_key = ?',
    [weekKey]
  );
  const nextOrder = (maxOrderRow?.max_order ?? 0) + 1;

  await db.runAsync(
    `INSERT INTO shopping_items
       (id, week_key, category, product_name, quantity_display, note, is_checked, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
    [
      id,
      weekKey,
      item.category,
      item.productName,
      item.quantityDisplay,
      item.note ?? null,
      nextOrder,
    ]
  );

  return Object.freeze({
    id,
    weekKey,
    category: item.category,
    productName: item.productName,
    quantityDisplay: item.quantityDisplay,
    ...(item.note !== undefined ? { note: item.note } : {}),
    isChecked: false,
    sortOrder: nextOrder,
  });
}

export async function deleteShoppingItem(
  id: string,
  getDb: () => Promise<DbLike> = getDatabase
): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM shopping_items WHERE id = ?', [id]);
}
