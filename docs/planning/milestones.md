# Hitos de Desarrollo (Milestones): Food Flow

El desarrollo se organiza para alcanzar una **versión usable para dogfooding lo antes posible (en M2)**, desacoplando la experiencia de usuario del backend de persistencia permanente.

```
  [M0: Foundation]
         │
         ▼
  [M1: Nutrition Engine (TDD)]
         │
         ▼
  [M2: First Usable Daily Flow]  <-- ¡Dogfooding inmediato en memoria!
         │
         ▼
  [M3: Persistence (SQLite)]
         │
         ▼
  [M4: Food Substitution]
         │
         ▼
  [M5: Plan & Recipes]
         │
         ▼
  [M6: Shopping Generation]
         │
         ▼
  [M7: Progress]
         │
         ▼
  [M8: Release Polish]
```

---

### M0: Foundation
- **Objetivo:** Inicializar el proyecto Expo con TypeScript estricto, Expo Router y suite de tests con `jest-expo`.
- **Entregable Verificable:** Aplicación Expo ejecutable con estructura de navegación base y comando `npm test` funcionando.
- **Dependencias:** Ninguna.
- **Criterio de Paso:** El proyecto compila limpiamente y ejecuta un smoke test unitario.

---

### M1: Nutrition Engine (TDD)
- **Objetivo:** Construir el motor de raciones y reglas clínicas en `src/domain/nutrition/` junto con el catálogo de datos de referencia en `src/data/` mediante TDD.
- **Entregable Verificable:** Funciones de conversión, sustitución y deducción genérica de grasa (huevo con yema y pescado azul), soportando el rango de aguacate (50–55 g) con 100% de tests unitarios verdes.
- **Dependencias:** M0.
- **Criterio de Paso:** Todos los casos de prueba de raciones y deducciones del PDF pasan en verde.

---

### M2: First Usable Daily Flow (¡Dogfooding Inmediato!)
- **Objetivo:** Construir la pantalla principal "Hoy" con estado en memoria/local para permitir el uso real de la app desde el primer momento.
- **Entregable Verificable:**
  - Abrir la pestaña "Hoy".
  - Alternar entre Entrenamiento y Descanso (actualización instantánea a 5 o 4 comidas).
  - Visualizar la propuesta de alimentos predeterminada de cada comida según el menú semanal.
  - Marcar una comida con 1 toque (`[ He comido esto ]`).
  - Ver el progreso diario (`X / Y completadas`).
- **Dependencias:** M1.
- **Criterio de Paso:** El usuario puede usar la app durante el día para seguir y marcar sus comidas en la sesión activa.

---

### M3: Persistence (SQLite Local-First)
- **Objetivo:** Conectar el flujo diario a `expo-sqlite` para garantizar la durabilidad de los datos entre sesiones.
- **Entregable Verificable:** Módulo de base de datos SQLite con esquema relacional, migraciones y funciones de almacenamiento/recuperación de días y comidas.
- **Dependencias:** M2.
- **Criterio de Paso:** Matar la app y volver a abrirla conserva intactas las comidas marcadas y el tipo de día seleccionado.

---

### M4: Food Substitution
- **Objetivo:** Implementar la pantalla de detalle de comida y el selector de sustitución con recálculo dinámico.
- **Entregable Verificable:**
  - Selección de ingrediente alternativo dentro del mismo grupo.
  - Recálculo en tiempo real de los gramos requeridos.
  - Aplicación automática de la deducción genérica de grasa en pantalla si se añade huevo con yema o pescado azul.
  - Persistencia de los alimentos sustituidos en la comida.
- **Dependencias:** M3.
- **Criterio de Paso:** Sustituir arroz por patata o añadir un huevo muestra y guarda las cantidades recalculadas exactas.

---

### M5: Plan & Recipes
- **Objetivo:** Construir la pestaña "Plan" para consulta rápida de la pauta clínica y el recetario.
- **Entregable Verificable:**
  - Tabla de equivalencias clínicas (con aguacate 50–55 g).
  - Tabla de momentos y raciones para entreno vs descanso.
  - Fichas de las 8 recetas del PDF con cantidades escaladas para entreno/descanso y sección de salsas.
- **Dependencias:** M1.
- **Criterio de Paso:** Consulta inmediata de cualquier receta y equivalencia sin conexión.

---

### M6: Shopping Generation
- **Objetivo:** Implementar la generación algorítmica de la lista de compra y la checklist interactiva.
- **Entregable Verificable:**
  - Caso de uso `GenerateShoppingList`: recorre el plan semanal, agrega ingredientes y consolida cantidades por categoría.
  - Checklist interactiva con tachado visual y persistencia de checks en SQLite.
  - Acción de reinicio de lista semanal.
- **Dependencias:** M3, M5.
- **Criterio de Paso:** La lista generada refleja los ingredientes del menú y los checks persisten tras reiniciar la app.

---

### M7: Progress
- **Objetivo:** Construir la pestaña "Progreso" con métricas de consistencia.
- **Entregable Verificable:**
  - Porcentaje de adherencia diaria y semanal.
  - Calendario mensual con visualización clara de días cumplidos.
- **Dependencias:** M3.
- **Criterio de Paso:** Los días con 100% de comidas completadas se reflejan visualmente en el historial.

---

### M8: Release Polish
- **Objetivo:** Verificación final de calidad, ergonomía móvil y empaquetado para distribución personal.
- **Entregable Verificable:**
  - Ergonomía táctil verificada (zonas de pulsación de 48x48 dp para uso en cocina).
  - Ausencia de latencia perceptible en todas las interacciones.
  - Comprobación de funcionamiento 100% offline.
- **Dependencias:** M4, M6, M7.
- **Criterio de Paso:** Checklist de aceptación del MVP superada sin errores.

---

## Estado de Verificación M0–M8 (Completado)

- **M0**: Scaffold Expo SDK 57, TypeScript estricto, Router, Jest.
- **M1**: Motor de raciones con TDD, catálogo canónico y deducciones de grasa.
- **M2**: Flujo diario "Hoy" con tarjetas de comida y confirmación en 1 toque.
- **M3**: Persistencia SQLite local-first, migraciones y adaptador `node:sqlite`.
- **M4**: Modal de sustitución por grupo exacto con recálculo dinámico y pantalla de detalle.
- **M5**: Pestaña "Plan" con equivalencias, 8 recetas y 6 salsas.
- **M6**: Pestaña "Compra" con checklist interactiva persistida y regeneración semanal.
- **M7**: Pestaña "Progreso" con KPIs de adherencia media, días 100% y calendario mensual.
- **M8**: Pulido ergonómico (48 dp WCAG 2.5.5), smoke check de empaquetado de producción (`npx expo export` limpio para iOS y Android), 124/124 tests verdes, TypeScript estricto y Expo lint en 0.
