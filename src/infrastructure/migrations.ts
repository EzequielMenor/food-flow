/**
 * Migraciones sencillas y versionadas con PRAGMA user_version (data-model §4),
 * en transacción: o aplica la versión completa o no aplica nada.
 */

import type { SQLiteDatabase } from 'expo-sqlite';
import { CURRENT_SCHEMA_VERSION, SCHEMA_V1 } from './schema';

interface Migration {
  readonly version: number;
  up(db: SQLiteDatabase): Promise<void>;
}

const MIGRATIONS: readonly Migration[] = [
  {
    version: 1,
    async up(db) {
      await db.execAsync(SCHEMA_V1);
    },
  },
];

export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let current = row?.user_version ?? 0;
  if (current >= CURRENT_SCHEMA_VERSION) {
    return;
  }
  await db.withTransactionAsync(async () => {
    for (const migration of MIGRATIONS) {
      if (migration.version > current) {
        await migration.up(db);
        await db.execAsync(`PRAGMA user_version = ${migration.version}`);
        current = migration.version;
      }
    }
  });
}
