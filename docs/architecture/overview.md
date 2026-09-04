# Arquitectura del Sistema: Food Flow

## 1. Principios de Diseño y Filosofía Pragmática

Food Flow sigue una arquitectura limpia orientada a la simplicidad y al desarrollo ágil, evitando la sobreingeniería y la fragmentación ceremonial:

1. **Dominio Nutricional Puro (`src/domain/nutrition/`):** La lógica matemática de raciones, conversiones y deducciones clínicas es código TypeScript puro sin dependencias externas. Se prueba con TDD en milisegundos.
2. **Separación de Datos de Referencia (`src/data/`):** Los alimentos de la despensa, las recetas prácticas y la propuesta del menú semanal no son lógica de dominio; son datos estructurados estáticos que alimentan a la aplicación.
3. **Casos de Uso Funcionales (`src/application/`):** Se prefieren funciones y módulos cohesivos antes que crear clases, interfaces y repositorios abstractos para operaciones sencillas.
4. **Local-First con SQLite (`src/infrastructure/`):** Almacenamiento local para el estado mutable del usuario (días registrados, comidas completadas y checks de compra).
5. **Estado Ligero y Pragmático (`src/presentation/`):** La UI utiliza estado local de componentes y custom hooks, reservando React Context únicamente para los datos compartidos que realmente lo justifiquen. Sin librerías de estado global externas.
6. **Rendimiento Práctico:** El criterio de rendimiento es la **ausencia de latencia perceptible** para el usuario (reacciones fluidas en pulsaciones y transiciones), descartando métricas arbitrarias o fases prematuras de profiling.

---

## 2. Estructura de Carpetas

```
src/
├── domain/
│   └── nutrition/          # Núcleo clínico: PortionEngine, reglas de raciones y deducción genérica
│
├── data/
│   ├── nutrition/          # Catálogo de alimentos y equivalencias (ej. aguacate 50–55 g)
│   ├── recipes/            # 8 recetas rápidas del PDF y 6 fórmulas de salsas
│   └── weekly-plan/        # Propuesta de menú semanal L-M-J-V entreno / X-S-D descanso
│
├── application/            # Orquestación funcional:
│                           # - GenerateShoppingList (plan semanal -> recetas -> agregación)
│                           # - DailyFlow (consulta y confirmación de comidas)
│                           # - FoodSubstitution (reemplazo de alimentos en comida)
│
├── infrastructure/         # Persistencia local con expo-sqlite:
│                           # - Conexión SQLite, esquema y migraciones simples
│                           # - Funciones de lectura/escritura de días y checks de compra
│
└── presentation/           # Capa visual (Expo Router + React Native):
    ├── components/         # UI atómica (MealCard, Toggle, ChecklistItem)
    ├── hooks/              # Custom hooks (useToday, useShoppingList)
    └── theme/              # Tokens de diseño (colores, espaciados, accesibilidad)

app/                        # Rutas de Expo Router (tabs: index, plan, shopping, progress)
```

---

## 3. Flujo de Datos y Dependencias

```
[ UI / Expo Router (app/ & presentation/) ]
                     │
                     ▼ invoca funciones de
[ Application (src/application/) ]
         │                   │
         ▼ lee datos de      ▼ ejecuta cálculos en
[ Data (src/data/) ]     [ Domain (src/domain/nutrition/) ]
         │
         ▼ persiste estado en
[ Infrastructure (src/infrastructure/ SQLite) ]
```

### Reglas de Dependencias
- `src/domain/nutrition/`: No importa de ninguna otra carpeta. Es autosuficiente.
- `src/data/`: Solo importa tipos definidos en `domain`.
- `src/application/`: Orquesta funciones combinando `domain`, `data` e `infrastructure`.
- `src/presentation/`: Consume `application` y `data` para renderizar vistas interactivas.

---

## 4. Pipeline de la Lista de Compra

La lista de compra no es una tabla estática; se deriva algorítmicamente mediante una función pura antes de persistir los checks del usuario:

$$\text{Plan Semanal} \xrightarrow{\text{recetas sugeridas}} \text{Ingredientes individuales} \xrightarrow{\text{agregación de cantidades}} \text{Lista de Compra Consolidada}$$

1. **Entrada:** Días asignados a entrenamiento/descanso y recetas propuestas para cada comida (`src/data/weekly-plan/` + `src/data/recipes/`).
2. **Transformación (`GenerateShoppingList`):** Recorre la semana, escala ingredientes según entreno/descanso, suma cantidades por producto y clasifica por categoría de supermercado.
3. **Persistencia:** Guarda la lista resultante en SQLite para mantener los checks tachados durante la compra.
