# Plan de Implementación Detallado: Food Flow

Este documento contiene el desglose de tareas ejecutables para la construcción de Food Flow v0.1. Sigue una filosofía pragmática: tareas pequeñas y bien delimitadas, evitando clases o abstracciones innecesarias cuando un módulo o función pura es suficiente.

---

## Resumen de Tareas por Hito (22 tareas)
- **M0: Foundation** (`TASK-M0-001` a `TASK-M0-003` - 3 tareas)
- **M1: Nutrition Engine (TDD)** (`TASK-M1-001` a `TASK-M1-003` - 3 tareas)
- **M2: First Usable Daily Flow** (`TASK-M2-001` a `TASK-M2-003` - 3 tareas)
- **M3: Persistence (SQLite)** (`TASK-M3-001` a `TASK-M3-003` - 3 tareas)
- **M4: Food Substitution** (`TASK-M4-001` a `TASK-M4-002` - 2 tareas)
- **M5: Plan & Recipes** (`TASK-M5-001` a `TASK-M5-002` - 2 tareas)
- **M6: Shopping Generation** (`TASK-M6-001` a `TASK-M6-002` - 2 tareas)
- **M7: Progress** (`TASK-M7-001` a `TASK-M7-002` - 2 tareas)
- **M8: Release Polish** (`TASK-M8-001` a `TASK-M8-002` - 2 tareas)

---

## Milestone M0: Foundation

### TASK-M0-001: Inicializar Proyecto Expo con TypeScript Estricto y Expo Router
- **Objetivo:** Configurar el proyecto Expo SDK 52+, TypeScript estricto y enrutamiento base.
- **Archivos:** `package.json`, `tsconfig.json`, `app.json`, `app/_layout.tsx`.
- **Dependencias:** Ninguna.
- **Tests:** Verificación de compilación sin errores con `npx tsc --noEmit`.
- **Criterio de Aceptación:**
  - `tsconfig.json` con `strict: true`, `noImplicitAny: true`, `strictNullChecks: true`.
  - El proyecto arranca limpiamente en Expo.
- **DoD:** Proyecto inicializado y compilando en TypeScript estricto.

---

### TASK-M0-002: Configurar Entorno de Tests con `jest-expo`
- **Objetivo:** Configurar una suite de pruebas unificada compatible con Expo y TypeScript.
- **Archivos:** `jest.config.js`, `package.json`, `src/domain/nutrition/__tests__/smoke.test.ts`.
- **Dependencias:** `TASK-M0-001`.
- **Tests:** Smoke test comprobando ejecución limpia.
- **Criterio de Aceptación:**
  - `npm test` ejecuta los tests de TypeScript sin errores.
  - Compatible con módulos nativos de Expo y código puro de dominio.
- **DoD:** Comando `npm test` en verde.

---

### TASK-M0-003: Configurar Shell de Navegación y Componentes Base
- **Objetivo:** Crear la barra de pestañas (Hoy, Plan, Compra, Progreso) y componentes visuales base (Botón accesible con área mínima de 48 dp, Tarjeta).
- **Archivos:** `app/(tabs)/_layout.tsx`, `app/(tabs)/index.tsx`, `app/(tabs)/plan.tsx`, `app/(tabs)/shopping.tsx`, `app/(tabs)/progress.tsx`, `src/presentation/components/ui/Button.tsx`.
- **Dependencias:** `TASK-M0-001`.
- **Tests:** Test de renderizado del componente `Button` y verificación de `onPress`.
- **Criterio de Aceptación:**
  - Navegación fluida entre las 4 pestañas.
  - Botón táctil ergonómico con padding accesible.
- **DoD:** Pestañas navegables en simulador con componentes base exportados.

---

## Milestone M1: Nutrition Engine (TDD)

### TASK-M1-001: Modelar Catálogo de Alimentos con Rango de Aguacate
- **Objetivo:** Definir tipos de alimentos y el catálogo canónico en `src/data/nutrition/canonicalFoods.ts`, preservando el rango exacto de 50–55 g para el aguacate.
- **Archivos:** `src/domain/nutrition/types.ts`, `src/data/nutrition/canonicalFoods.ts`, `src/data/nutrition/__tests__/canonicalFoods.test.ts`.
- **Dependencias:** `TASK-M0-002`.
- **Tests:** Comprobar que todos los alimentos de la pauta están definidos con sus gramos base exactos y que el aguacate define `{ value: 50, maxValue: 55, unit: 'g' }`.
- **Criterio de Aceptación:**
  - Alimentos inmutables y tipados.
  - Pescado azul y huevo con yema marcados como categorías con deducción de grasa.
- **DoD:** Tipos y catálogo implementados con tests unitarios verdes.

---

### TASK-M1-002: Implementar PortionEngine con Deducción Genérica de Grasa
- **Objetivo:** Implementar las funciones puras de conversión `portionsToQuantity`, `substituteFood` y `calculateNetFat` mediante TDD.
- **Archivos:** `src/domain/nutrition/PortionEngine.ts`, `src/domain/nutrition/__tests__/PortionEngine.test.ts`.
- **Dependencias:** `TASK-M1-001`.
- **Tests:**
  - 6R arroz $\implies$ 90g; 4R pollo $\implies$ 200g; 1R aguacate $\implies$ 50–55g; 2R aguacate $\implies$ 100–110g.
  - Sustituir arroz por patata (6R) $\implies$ 300g; sustituir arroz por pollo lanza error de grupo incompatible.
  - Huevo con yema descuenta 0,5R de grasa (10g AOVE $\to$ 5g AOVE).
  - Pescado azul (salmón 150g = 2R) descuenta 1,0R de grasa (10g AOVE $\to$ 0g AOVE).
  - Pescado blanco (merluza 300g) no descuenta grasa (10g AOVE).
  - Suelo de grasa: deducciones superiores al objetivo devuelven 0g (no negativo).
- **Criterio de Aceptación:**
  - 100% de tests unitarios pasando.
  - Funciones puras sin efectos secundarios.
- **DoD:** `PortionEngine.ts` probado y validado con todos los casos clínicos del PDF.

---

### TASK-M1-003: Modelar Reglas Clínicas de Momentos y Estructura Diaria
- **Objetivo:** Función pura que genera la estructura y objetivos de raciones de un día según si es `TRAINING` o `REST`.
- **Archivos:** `src/domain/nutrition/dailyStructure.ts`, `src/domain/nutrition/__tests__/dailyStructure.test.ts`.
- **Dependencias:** `TASK-M1-001`.
- **Tests:**
  - `getDayStructure('TRAINING')`: 5 comidas (Preentreno incluido), 17R HCC, 16R Prot, 5R Grasa.
  - `getDayStructure('REST')`: 4 comidas (Preentreno omitido), 11R HCC, 16R Prot, 4R Grasa.
- **Criterio de Aceptación:**
  - Cumplimiento estricto de las reglas BR-001 a BR-005.
- **DoD:** Función de estructura diaria implementada y testeada.

---

## Milestone M2: First Usable Daily Flow (Dogfooding Inmediato)

### TASK-M2-001: Cargar Menú Semanal y Recetas Prácticas
- **Objetivo:** Definir como datos estructurados las 8 recetas del PDF, las 6 salsas y el menú semanal cerrado en `src/data/`.
- **Archivos:** `src/data/recipes/recipes.ts`, `src/data/weekly-plan/weeklyMenu.ts`.
- **Dependencias:** `TASK-M1-001`.
- **Tests:** Test de integridad que valide que cada día de la semana tiene comidas asignadas con ingredientes que coinciden con las recetas.
- **Criterio de Aceptación:**
  - Separación clara: son datos prácticos en `src/data/`, no reglas clínicas en `domain`.
- **DoD:** Menú semanal y recetas exportados y validados por test.

---

### TASK-M2-002: Implementar Lógica de Estado Diario (`useDailyFlow`)
- **Objetivo:** Hook o módulo de estado en memoria para gestionar el día actual, permitir cambiar tipo de día y registrar comidas completadas.
- **Archivos:** `src/presentation/hooks/useDailyFlow.ts`, `src/application/dailyFlow.ts`.
- **Dependencias:** `TASK-M1-003`, `TASK-M2-001`.
- **Tests:** Test unitario/integración del hook: alternar entreno/descanso cambia las comidas; confirmar comida incrementa el contador de completadas.
- **Criterio de Aceptación:**
  - Estado reactivo fluido en memoria.
- **DoD:** Hook probado y listo para conectar a la UI.

---

### TASK-M2-003: Construir Pantalla "Hoy" con Registro 1-Tap
- **Objetivo:** Montar la pantalla principal "Hoy" con el selector superior Entreno/Descanso, tarjetas de comida con su propuesta y el botón `[ He comido esto ]`.
- **Archivos:** `app/(tabs)/index.tsx`, `src/presentation/components/daily/MealCard.tsx`, `src/presentation/components/daily/DayTypeSelector.tsx`.
- **Dependencias:** `TASK-M2-002`, `TASK-M0-003`.
- **Tests:** Verificación interactiva del flujo en simulador o dispositivo.
- **Criterio de Aceptación:**
  - El usuario puede abrir la app, elegir entreno o descanso, ver las comidas propuestas, tocar `[ He comido esto ]` y ver la barra de progreso avanzar (ej. `1/5`).
- **DoD:** ¡Hito de dogfooding alcanzado! La app ya es usable para el seguimiento diario en memoria.

---

## Milestone M3: Persistence (SQLite Local-First)

### TASK-M3-001: Configurar Conexión SQLite y Migraciones con `expo-sqlite`
- **Objetivo:** Inicializar la base de datos local y crear las tablas relacionales (`day_records`, `meal_entries`, `meal_entry_items`, `shopping_items`).
- **Archivos:** `src/infrastructure/database.ts`, `src/infrastructure/schema.ts`.
- **Dependencias:** `TASK-M0-001`.
- **Tests:** Test de apertura de base de datos y creación de tablas.
- **Criterio de Aceptación:**
  - Tablas creadas con `PRAGMA user_version = 1`.
- **DoD:** Módulo de base de datos operativo.

---

### TASK-M3-002: Implementar Almacenamiento y Lectura de Días y Comidas
- **Objetivo:** Funciones simples para guardar el estado del día (`saveDayRecord`), marcar comida (`setMealCompleted`) y recuperar historial (`getDayRecord`).
- **Archivos:** `src/infrastructure/dayRepository.ts`.
- **Dependencias:** `TASK-M3-001`.
- **Tests:** Test de integración guardando un día con 3 comidas completadas y recuperándolo.
- **Criterio de Aceptación:**
  - Transacciones seguras y persistencia inmediata.
- **DoD:** Funciones de persistencia implementadas y probadas.

---

### TASK-M3-003: Conectar Pantalla "Hoy" a Persistencia SQLite
- **Objetivo:** Conectar el hook `useDailyFlow` con `dayRepository` para cargar el día guardado al arrancar y persistir cada confirmación.
- **Archivos:** `src/presentation/hooks/useDailyFlow.ts`.
- **Dependencias:** `TASK-M3-002`, `TASK-M2-003`.
- **Tests:** Marcar una comida, forzar reinicio de la app y verificar que la comida sigue marcada.
- **Criterio de Aceptación:**
  - Persistencia transparente sin latencia perceptible.
- **DoD:** Pantalla "Hoy" respaldada al 100% por SQLite.

---

## Milestone M4: Food Substitution

### TASK-M4-001: Construir Pantalla de Detalle de Comida y Selector de Sustitución
- **Objetivo:** Pantalla navegable `app/meal/[id].tsx` con desglose de raciones y modal para cambiar un ingrediente por otro del mismo grupo.
- **Archivos:** `app/meal/[id].tsx`, `src/presentation/components/meal/SubstitutionModal.tsx`.
- **Dependencias:** `TASK-M2-003`.
- **Tests:** Al pulsar cambiar en un cereal, el modal solo muestra hidratos (arroz, pasta, avena, pan, patata).
- **Criterio de Aceptación:**
  - Interfaz limpia con áreas táctiles cómodas.
- **DoD:** Pantalla de detalle y modal de selección navegables.

---

### TASK-M4-002: Integrar Recálculo Dinámico y Persistencia de Sustituciones
- **Objetivo:** Conectar `PortionEngine` en la vista de detalle para actualizar los gramos en tiempo real al seleccionar un sustituto, ajustar la grasa automáticamente y persistir en SQLite.
- **Archivos:** `app/meal/[id].tsx`, `src/infrastructure/dayRepository.ts`.
- **Dependencias:** `TASK-M4-001`, `TASK-M1-002`, `TASK-M3-002`.
- **Tests:**
  - Seleccionar patata en lugar de 90g de arroz muestra 300g y guarda 300g.
  - Seleccionar salmón o huevo reduce el aceite visible a 0g o 5g.
- **Criterio de Aceptación:**
  - Los datos sustituidos se guardan en `meal_entry_items` con `is_substitution = 1`.
- **DoD:** Sustitución completa y duradera en la app.

---

## Milestone M5: Plan & Recipes

### TASK-M5-001: Construir Tablas de Raciones y Equivalencias
- **Objetivo:** Pantalla `app/(tabs)/plan.tsx` con vista de solo-lectura de momentos/raciones y tabla de equivalencias clínicas (aguacate 50–55 g).
- **Archivos:** `app/(tabs)/plan.tsx`, `src/presentation/components/plan/EquivalenceTable.tsx`.
- **Dependencias:** `TASK-M1-001`, `TASK-M0-003`.
- **Tests:** Renderizado correcto de todos los alimentos de la pauta.
- **Criterio de Aceptación:**
  - Visualización limpia y de consulta rápida sin conexión.
- **DoD:** Tablas de consulta clínica completadas.

---

### TASK-M5-002: Construir Catálogo de Recetas y Salsas
- **Objetivo:** Listar las 8 recetas del PDF con toggle Entreno/Descanso para mostrar los gramos adecuados (ej. 90g vs 60g) y sección de salsas rápidas.
- **Archivos:** `src/presentation/components/plan/RecipeCard.tsx`, `src/presentation/components/plan/SauceList.tsx`.
- **Dependencias:** `TASK-M2-001`, `TASK-M5-001`.
- **Tests:** Al alternar a "Descanso", las recetas de comida muestran 60g de arroz/pasta.
- **Criterio de Aceptación:**
  - Instrucciones breves de cocción (10-15 min).
- **DoD:** Recetario interactivo disponible en la pestaña Plan.

---

## Milestone M6: Shopping Generation

### TASK-M6-001: Implementar Caso de Uso `GenerateShoppingList`
- **Objetivo:** Función pura que genera la lista de compra consolidada sumando ingredientes a partir del menú semanal y las recetas:
  $$\text{Plan Semanal} \to \text{Recetas} \to \text{Agregación de Ingredientes} \to \text{Lista de Compra}$$
- **Archivos:** `src/application/generateShoppingList.ts`, `src/application/__tests__/generateShoppingList.test.ts`.
- **Dependencias:** `TASK-M2-001`.
- **Tests:** Comprobar que la suma semanal de 4 días de entreno y 3 de descanso para pollo, arroz, avena y leche coincide con las cantidades globales del PDF (pág. 11).
- **Criterio de Aceptación:**
  - Agrupación por categorías de supermercado (`PROTEIN`, `FISH`, `DAIRY`, `CARBS`, `FATS`, `PRODUCE`, `PANTRY`).
- **DoD:** Función de generación testeada y desacoplada de la UI.

---

### TASK-M6-002: Construir UI de Checklist con Persistencia y Reinicio
- **Objetivo:** Pantalla `app/(tabs)/shopping.tsx` con checklist agrupada por secciones, tachado de ítems, persistencia en SQLite y botón de reinicio.
- **Archivos:** `app/(tabs)/shopping.tsx`, `src/infrastructure/shoppingRepository.ts`.
- **Dependencias:** `TASK-M6-001`, `TASK-M3-001`.
- **Tests:** Marcar un producto actualiza `is_checked = 1`; reiniciar desmarca todos los productos tras confirmación.
- **Criterio de Aceptación:**
  - Uso cómodo con una sola mano en el supermercado.
- **DoD:** Pestaña de compra 100% funcional.

---

## Milestone M7: Progress

### TASK-M7-001: Implementar Cálculo de Adherencia Diaria y Semanal
- **Objetivo:** Funciones puras para calcular el porcentaje de comidas completadas sobre el total del día y el promedio de los últimos 7 días.
- **Archivos:** `src/domain/nutrition/adherence.ts`, `src/domain/nutrition/__tests__/adherence.test.ts`.
- **Dependencias:** `TASK-M1-003`.
- **Tests:** 5/5 en entreno = 100%; 3/4 en descanso = 75%; histórico semanal promedio.
- **Criterio de Aceptación:**
  - Funciones matemáticas puras sin librerías externas.
- **DoD:** Lógica de adherencia testeada.

---

### TASK-M7-002: Construir Pantalla de Progreso y Calendario Simple
- **Objetivo:** Pantalla `app/(tabs)/progress.tsx` con tarjeta de adherencia semanal y cuadrícula mensual marcando días completados.
- **Archivos:** `app/(tabs)/progress.tsx`, `src/presentation/components/progress/CalendarGrid.tsx`.
- **Dependencias:** `TASK-M7-001`, `TASK-M3-002`.
- **Tests:** Renderizado del calendario con los días registrados en SQLite.
- **Criterio de Aceptación:**
  - Visualización sin calorías, sin peso corporal y sin gráficos recargados.
- **DoD:** Pestaña Progreso completada.

---

## Milestone M8: Release Polish

### TASK-M8-001: Auditoría de Ergonomía Táctil y Ausencia de Latencia Perceptible
- **Objetivo:** Validar que todos los botones principales cumplen con el tamaño táctil accesible (mínimo 48x48 dp) y que la app reacciona de forma fluida sin tirones en cocina.
- **Archivos:** Componentes en `src/presentation/components/`.
- **Dependencias:** M2, M4, M6, M7.
- **Tests:** Inspección visual y táctil en dispositivo real.
- **Criterio de Aceptación:**
  - Navegación cómoda con una sola mano en los flujos principales.
- **DoD:** Auditoría ergonómica aprobada.

---

### TASK-M8-002: Verificación End-to-End Offline y Checklist de Aceptación
- **Objetivo:** Recorrer todos los flujos de usuario en modo avión sin conexión y verificar la checklist de Definition of Done del MVP.
- **Archivos:** `docs/product/mvp.md`.
- **Dependencias:** Todas las tareas anteriores.
- **Tests:** Ejecución completa de la suite de tests (`npm test`) y prueba manual de los 9 flujos de usuario.
- **Criterio de Aceptación:**
  - 100% de tests unitarios verdes.
  - Cero llamadas a internet, cero errores en consola.
- **DoD:** Aplicación lista para su uso personal diario.
