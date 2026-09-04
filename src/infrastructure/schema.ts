/**
 * Esquema relacional (docs/architecture/data-model.md §2) y versión actual.
 * Migraciones controladas con PRAGMA user_version.
 */

export const CURRENT_SCHEMA_VERSION = 1;

export const SCHEMA_V1 = `
CREATE TABLE IF NOT EXISTS day_records (
    date TEXT PRIMARY KEY,
    day_type TEXT NOT NULL CHECK(day_type IN ('TRAINING', 'REST')),
    is_manually_set INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS meal_entries (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL REFERENCES day_records(date) ON DELETE CASCADE,
    moment_id TEXT NOT NULL CHECK(moment_id IN (
        'PRE_WORKOUT', 'ALMUERZO', 'COMIDA', 'MERIENDA', 'CENA'
    )),
    is_completed INTEGER NOT NULL DEFAULT 0,
    completed_at TEXT,
    substitutions TEXT NOT NULL DEFAULT '{}',
    item_overrides TEXT,
    UNIQUE(date, moment_id)
);

CREATE TABLE IF NOT EXISTS meal_entry_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    meal_entry_id TEXT NOT NULL REFERENCES meal_entries(id) ON DELETE CASCADE,
    food_id TEXT NOT NULL,
    food_name TEXT NOT NULL,
    food_group TEXT NOT NULL CHECK(food_group IN ('PROTEIN', 'CARBOHYDRATE', 'FAT')),
    portions REAL NOT NULL,
    quantity_display TEXT NOT NULL,
    is_substitution INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS shopping_items (
    id TEXT PRIMARY KEY,
    week_key TEXT NOT NULL,
    category TEXT NOT NULL,
    product_name TEXT NOT NULL,
    quantity_display TEXT NOT NULL,
    note TEXT,
    is_checked INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS app_state (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
`;
