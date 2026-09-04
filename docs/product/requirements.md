# Requisitos del Sistema: Food Flow

## 1. Requisitos Funcionales (FR)

### Área 1: Hoy (Daily Tracking & Fast Logging)
- **FR-001: Selección del tipo de día:** El sistema debe permitir alternar entre "Día de Entrenamiento" y "Día de Descanso", sugiriendo por defecto el patrón semanal (L, M, J, V entreno; X, S, D descanso).
- **FR-002: Renderizado automático de la estructura:**
  - Entrenamiento: Preentreno, Almuerzo, Comida, Merienda, Cena (5 momentos).
  - Descanso: Almuerzo, Comida, Merienda, Cena (4 momentos, Preentreno omitido).
- **FR-003: Visualización de objetivos por comida:** Cada comida muestra sus raciones clínicas (Proteína, HCC, Grasa) y complementos (Verdura libre, Fruta, Yogur proteico).
- **FR-004: Propuesta inicial de alimentos:** Cada comida presenta una sugerencia de ingredientes y cantidades en gramos/unidades basada en el plan semanal y recetas prácticas.
- **FR-005: Registro rápido (1-tap):** El usuario debe poder confirmar la comida propuesta con un solo toque (`[ He comido esto ]`), marcándola como completada y guardando lo consumido.
- **FR-006: Sustitución simple de alimentos:** Sustituir un alimento por otro del mismo grupo recalculando automáticamente los gramos equivalentes según la pauta.
- **FR-007: Corrección y reapertura de comida:** El usuario puede desmarcar una comida o modificar los alimentos registrados.
- **FR-008: Progreso diario visual:** Resumen en tiempo real del día (ej. `3 / 5 completadas` o porcentaje).

### Área 2: Plan y Recetas (Reference & Knowledge)
- **FR-009: Consulta de estructura nutricional:** Vista solo-lectura de momentos y raciones para entrenamiento y descanso.
- **FR-010: Consulta de tabla de equivalencias:** Lista de alimentos y equivalencia por 1R (incluyendo el rango exacto de 50–55 g para aguacate).
- **FR-011: Catálogo de recetas rápidas:** Consulta de las 8 recetas del PDF y 6 salsas.
- **FR-012: Escalado de recetas según tipo de día:** Mostrar cantidades diferenciadas para día de entrenamiento vs descanso (ej. arroz 90g vs 60g).

### Área 3: Compra (Smart Shopping List)
- **FR-013: Generación algorítmica de lista de compra:** Derivar las cantidades necesarias a partir del plan semanal y las recetas (`weekly plan -> recipes -> ingredient aggregation -> shopping list`).
- **FR-014: Estado de items de compra (Checklist):** Marcar y desmarcar productos comprados con efecto visual de tachado.
- **FR-015: Reinicio de lista semanal:** Opción de reiniciar los checks para comenzar una nueva semana de compra.

### Área 4: Progreso y Adherencia (Adherence Tracking)
- **FR-016: Registro histórico de días:** Almacenar localmente las comidas completadas por fecha.
- **FR-017: Métrica de adherencia diaria:** Porcentaje de comidas completadas sobre el total del día.
- **FR-018: Métrica de adherencia semanal:** Promedio de adherencia de los últimos 7 días.
- **FR-019: Vista de calendario simple:** Visualización mensual simple indicando días completados al 100% y días parciales.

### Motor de Raciones y Reglas Clínicas
- **FR-021: Conversión raciones ↔ cantidades:** Conversión exacta raciones a gramos/unidades y soporte para rangos (aguacate 50–55 g).
- **FR-022: Deducción genérica de grasa:** Restar 0,5R de grasa añadida por cada ración de proteína proveniente de huevo con yema o de pescado azul.
- **FR-023: Suelo de grasa no negativo:** La grasa añadida resultante nunca puede ser inferior a 0 gramos.

---

## 2. Requisitos No Funcionales (NFR)

- **NFR-001: Local-first absoluto:** Funcionamiento 100% offline con SQLite local embebido (`expo-sqlite`).
- **NFR-002: Ausencia de latencia perceptible:** Respuesta inmediata al alternar días, marcar comidas y sustituir ingredientes.
- **NFR-003: Privacidad total:** Cero telemetría, cero analítica de terceros y sin recolección de datos personales.
- **NFR-004: Robustez de tipos:** TypeScript estricto al 100% (`strict: true`, sin `any`).
- **NFR-005: Testabilidad del Dominio:** Reglas clínicas y motor de raciones testeados con TDD sin dependencias de UI.
- **NFR-006: Ergonomía en cocina:** Diseñada para uso con una sola mano; zonas táctiles cómodas y accesibles (mínimo 48x48 dp).

---

## 3. Restricciones Técnicas (C)

- **C-001:** React Native + Expo (SDK 52+), Expo Router y TypeScript.
- **C-002:** Sin backend, sin login, sin nube y sin dependencias de estado global pesado.
- **C-003:** Inmutabilidad de la pauta clínica en v0.1.

---

## 4. Fuera de Alcance v0.1 (OOS)

- **OOS-001:** Contador o desglose de calorías totales (kcal) o macros en gramos.
- **OOS-002:** Búsquedas libres en bases de datos externas abiertas.
- **OOS-003:** Reconocimiento de imágenes mediante IA o escáner de códigos de barras.
- **OOS-004:** Registro de hidratación interactivo (pospuesto a v0.2).
- **OOS-005:** Registro de peso o medidas corporales.
- **OOS-006:** Sincronización en la nube o integración con Apple Health / Google Health Connect.
