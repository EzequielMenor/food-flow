/**
 * Conexión única SQLite local-first (ADR-003). Abre la base de forma perezosa,
 * aplica migraciones y expone un interfaz mínimo (`DbLike`) que los repositorios
 * consumen. En tests se inyecta un adaptador sobre node:sqlite sin tocar UI.
 */

import { runMigrations } from './migrations';

export const DATABASE_NAME = 'food-flow.db';

export interface DbLike {
  execAsync(source: string): Promise<void>;
  runAsync(source: string, params?: unknown): Promise<unknown>;
  getAllAsync<T>(source: string, params?: unknown): Promise<T[]>;
  getFirstAsync<T>(source: string, params?: unknown): Promise<T | null>;
  withTransactionAsync(task: () => Promise<void>): Promise<void>;
}

let dbPromise: Promise<DbLike> | null = null;
let providerOverride: (() => Promise<DbLike>) | null = null;

export function setDatabaseProvider(provider: (() => Promise<DbLike>) | null): void {
  providerOverride = provider;
  dbPromise = null;
}

export function getDatabase(): Promise<DbLike> {
  if (providerOverride !== null) {
    return providerOverride();
  }
  if (dbPromise === null) {
    dbPromise = (async () => {
      const SQLite = await import('expo-sqlite');
      const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
      await db.execAsync('PRAGMA journal_mode = WAL;');
      await db.execAsync('PRAGMA foreign_keys = ON;');
      const wrapper: DbLike = {
        execAsync: async (sql: string) => db.execAsync(sql),
        runAsync: async (sql: string, params?: unknown) =>
          db.runAsync(sql, (params ?? []) as never),
        getAllAsync: async <T>(sql: string, params?: unknown): Promise<T[]> =>
          db.getAllAsync<T>(sql, (params ?? []) as never),
        getFirstAsync: async <T>(sql: string, params?: unknown): Promise<T | null> =>
          db.getFirstAsync<T>(sql, (params ?? []) as never),
        withTransactionAsync: async (task: () => Promise<void>) => db.withTransactionAsync(task),
      };
      await runMigrations(wrapper);
      return wrapper;
    })().catch((error: unknown) => {
      dbPromise = null;
      throw error;
    });
  }
  return dbPromise;
}
