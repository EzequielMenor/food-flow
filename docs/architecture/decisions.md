# Registro de Decisiones de Arquitectura (ADRs)

---

### ADR-001: React Native + Expo con Expo Router
- **Contexto:** Se requiere una app móvil nativa en TypeScript con navegación limpia y bajo mantenimiento.
- **Decisión:** Utilizar Expo SDK 52+ con Expo Router (rutas basadas en archivos).
- **Consecuencias:** Enrutamiento tipado, prebuild ágil y compatibilidad total con librerías oficiales de Expo.

---

### ADR-002: TypeScript Estricto sin `any`
- **Contexto:** Los cálculos de raciones y deducciones clínicas no admiten imprecisiones.
- **Decisión:** `strict: true` obligatorio en todo el proyecto; `any` estrictamente prohibido.
- **Consecuencias:** Detección estricta de inconsistencias en compilación e invariantes seguros.

---

### ADR-003: Persistencia Local-First con `expo-sqlite`
- **Contexto:** La app debe ser 100% offline, privada y sin dependencias de backend.
- **Decisión:** Utilizar `expo-sqlite` con un esquema relacional minimalista.
- **Consecuencias:** Cero llamadas de red, persistencia robusta del historial y transacciones atómicas.

---

### ADR-004: Gestión de Estado Flexible y Descentralizada
- **Contexto:** Se debe evitar el boilerplate innecesario de stores globales como Redux o Zustand.
- **Decisión:** Emplear estado local de componentes y custom hooks como primera opción. React Context se utiliza puntualmente solo si varias pantallas requieren compartir estado mutable en tiempo real.
- **Consecuencias:** Menor complejidad, arquitectura directa y cero dependencias de estado externas.

---

### ADR-005: Separación de Reglas Clínicas vs Datos Prácticos
- **Contexto:** No confundir la pauta médica con recetas o asignación de días.
- **Decisión:** Reglas clínicas viven en `src/domain/nutrition/`. Recetas, menús y listas de supermercado viven en `src/data/`.
- **Consecuencias:** Dominio limpio, desacoplado y reutilizable ante posibles cambios de recetas o menús.

---

### ADR-006: Estrategia de Testing Unificada con `jest-expo`
- **Contexto:** Se requiere ejecutar pruebas unitarias de TypeScript rápido y pruebas de componentes sin stacks duplicados ni configuraciones frágiles de `ts-jest`.
- **Decisión:** Utilizar Jest configurado con el preset estándar de Expo (`jest-expo`).
- **Consecuencias:** Un único runner compatible tanto con la lógica pura de dominio como con módulos de React Native/Expo.

---

### ADR-007: Generación Algorítmica de la Lista de Compra
- **Contexto:** La lista de compra no debe ser una tabla estática fija; debe poder recalcularse si cambian las propuestas.
- **Decisión:** Implementar el caso de uso `GenerateShoppingList`:
  $$\text{Plan Semanal} \to \text{Recetas} \to \text{Agregación de Ingredientes} \to \text{Lista de Compra}$$
  La lista generada se persiste en SQLite para conservar los checkboxes del usuario.
- **Consecuencias:** Flexibilidad total para v0.1 y v0.2 manteniendo una única fuente de verdad para los ingredientes.

---

### ADR-008: Criterio Práctico de Rendimiento (Anti-Optimización Prematura)
- **Contexto:** En una app personal v0.1 con unos pocos cientos de filas en SQLite al año, benchmarks de microsegundos o planes de indexación masivos son sobreingeniería.
- **Decisión:** Guiar el rendimiento por la ausencia de latencia perceptible para el usuario. No dedicar tareas ni fases a profiling prematuro de base de datos.
- **Consecuencias:** Desarrollo centrado en la usabilidad real sin ceremonias innecesarias.
