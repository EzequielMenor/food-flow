# Modelo de Datos: Food Flow

## 1. Estrategia de Persistencia: Estado Dinámico en SQLite

La base de datos SQLite gestionada por `expo-sqlite` almacena exclusivamente el estado mutable generado por el usuario. Toda la información fija (definición de alimentos, recetas y menú semanal) reside en código TypeScript en `src/data/`.

---

## 2. Esquema Relacional Simplificado

```sql
-- Días abiertos o registrados por el usuario
CREATE TABLE IF NOT EXISTS day_records (
    date TEXT PRIMARY KEY,                       -- Formato YYYY-MM-DD
    day_type TEXT NOT NULL CHECK(day_type IN ('TRAINING', 'REST')),
    is_manually_set INTEGER NOT NULL DEFAULT 0,  -- 1 si el usuario forzó el tipo
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Estado de cada comida del día
CREATE TABLE IF NOT EXISTS meal_entries (
    id TEXT PRIMARY KEY,                         -- date || '_' || moment_id
    date TEXT NOT NULL REFERENCES day_records(date) ON DELETE CASCADE,
    moment_id TEXT NOT NULL CHECK(moment_id IN (
        'PRE_WORKOUT', 'ALMUERZO', 'COMIDA', 'MERIENDA', 'CENA'
    )),
    is_completed INTEGER NOT NULL DEFAULT 0,     -- 0 = pendiente, 1 = completada
    completed_at TEXT,                           -- Timestamp ISO
    UNIQUE(date, moment_id)
);

-- Alimentos consumidos en una comida (propuesta base o sustituciones)
CREATE TABLE IF NOT EXISTS meal_entry_items (
    id TEXT PRIMARY KEY,
    meal_entry_id TEXT NOT NULL REFERENCES meal_entries(id) ON DELETE CASCADE,
    food_id TEXT NOT NULL,
    food_name TEXT NOT NULL,
    food_group TEXT NOT NULL CHECK(food_group IN ('PROTEIN', 'CARBOHYDRATE', 'FAT')),
    portions REAL NOT NULL,
    quantity_display TEXT NOT NULL,              -- Ej. "90 g", "300 g", "50–55 g"
    is_substitution INTEGER NOT NULL DEFAULT 0
);

-- Checklist de la lista de la compra derivada
CREATE TABLE IF NOT EXISTS shopping_items (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,                      -- 'PROTEIN', 'FISH', 'DAIRY', 'CARBS', 'FATS', 'PRODUCE', 'PANTRY'
    product_name TEXT NOT NULL,
    quantity_display TEXT NOT NULL,              -- Ej. "~1,1 kg", "600 g"
    note TEXT,
    is_checked INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0
);
```

---

## 3. Generación y Persistencia de la Lista de Compra

1. El caso de uso `GenerateShoppingList` calcula los ítems agregados a partir del menú semanal y recetas.
2. Al sincronizar con SQLite:
   - Los ítems generados se insertan o actualizan.
   - Se preserva el valor de `is_checked` si el ítem ya existía en la semana activa.
3. El reinicio de la lista actualiza todos los registros a `is_checked = 0`.

---

## 4. Migraciones
Controladas con `PRAGMA user_version` de forma atómica en `src/infrastructure/migrations.ts`.
