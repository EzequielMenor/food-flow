/**
 * Adaptador SQLite para tests y ejecución en Node.js sobre `node:sqlite` (Node 22+).
 * Implementa la interfaz `DbLike` sin dependencias de expo-sqlite, permitiendo
 * tests de integración reales contra SQLite en memoria con cero mocks.
 */

import { DatabaseSync } from 'node:sqlite';
import type { DbLike } from './database';
import { runMigrations } from './migrations';

export interface NodeSqliteOptions {
  readonly path?: string;
}

export function createNodeSqliteDb(options?: NodeSqliteOptions): DbLike {
  const db = new DatabaseSync(options?.path ?? ':memory:');
  db.exec('PRAGMA foreign_keys = ON;');

  const adapter: DbLike = {
    async execAsync(source: string): Promise<void> {
      db.exec(source);
    },
    async runAsync(source: string, params?: unknown): Promise<unknown> {
      const stmt = db.prepare(source);
      const paramArray = Array.isArray(params) ? params : params !== undefined ? [params] : [];
      return stmt.run(...paramArray);
    },
    async getAllAsync<T>(source: string, params?: unknown): Promise<T[]> {
      const stmt = db.prepare(source);
      const paramArray = Array.isArray(params) ? params : params !== undefined ? [params] : [];
      return stmt.all(...paramArray) as T[];
    },
    async getFirstAsync<T>(source: string, params?: unknown): Promise<T | null> {
      const stmt = db.prepare(source);
      const paramArray = Array.isArray(params) ? params : params !== undefined ? [params] : [];
      const row = stmt.get(...paramArray);
      return (row ?? null) as T | null;
    },
    async withTransactionAsync(task: () => Promise<void>): Promise<void> {
      db.exec('BEGIN');
      try {
        await task();
        db.exec('COMMIT');
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
    },
  };

  return adapter;
}

export async function createMigratedTestDb(options?: NodeSqliteOptions): Promise<DbLike> {
  const db = createNodeSqliteDb(options);
  await runMigrations(db);
  return db;
}
