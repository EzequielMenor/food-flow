# Food Flow

Sistema operativo móvil para el seguimiento de pautas nutricionales clínicas basadas en **raciones de intercambio**. Diseñado con una filosofía **local-first**, velocidad extrema de registro en cocina y cero fricción operativa.

Construido con **React Native (0.86)**, **Expo SDK 57** (`expo-router`, `expo-sqlite`) y **TypeScript**.

---

## 1. Problema y Filosofía

Las aplicaciones comerciales de nutrición (MyFitnessPal, FatSecret) imponen una sobrecarga cognitiva excesiva: buscar entre cientos de miles de alimentos con información inconsistente, contar calorías diarias y lidiar con decenas de pulsaciones para registrar una comida.

Cuando un nutricionista clínico pauta la dieta mediante **raciones de intercambio** (ej. 4 raciones de hidratos, 3 de proteína), esas herramientas no encajan con el modelo mental.

> **"La estructura de mi dieta es fija, pero los alimentos que utilizo para cumplirla son flexibles."**

### Pilares del producto
- **Estructura fija:** Momentos del día y raciones objetivo predeterminados según el tipo de día (Entrenamiento vs. Descanso).
- **Alimentos flexibles:** Ingredientes intercambiables respetando equivalencias clínicas exactas (1R arroz = 15 g crudo; 1R patata = 50 g).
- **Registro en 1 toque (1-tap logging):** Abrir, ver propuesta del día, confirmar en menos de 5 segundos y cerrar.
- **Local-First & Privacidad:** 100% offline en el dispositivo mediante SQLite, sin cuentas, sin servidores y sin latencia.

---

## 2. Funcionalidades Principales

- **Hoy (Pantalla Principal):**
  - Selector de día: **Entrenamiento** vs. **Descanso** con adaptación automática de las raciones objetivo.
  - Indicador de progreso diario sobrio (`X de Y comidas completadas`).
  - Tarjetas de comida ultra-escaneables con confirmación en un toque (`He comido esto`).
- **Detalle de Comida & Motor de Sustitución:**
  - Desglose de raciones e ingredientes propuestos en crudo.
  - Sustitución matemática inmediata: recalcula al gramo la cantidad equivalente al cambiar de ingrediente dentro del mismo grupo clínico.
  - Reglas de deducción y ajuste de grasas (ej. al seleccionar pescado azul o huevo entero).
- **Plan y Recetas:**
  - Catálogo de raciones (1R) por grupo de alimentos.
  - 8 recetas prácticas pautadas con preparación paso a paso.
  - 6 fórmulas de salsas ligeras sin aporte graso excesivo.
- **Lista de la Compra:**
  - Generación agregada a partir del plan semanal y recetas.
  - Agrupada por categorías del supermercado con checkboxes táctiles cómodos (≥52 dp) y persistencia offline.
- **Historial y Adherencia:**
  - Calendario mensual con visualización de días completados y cálculo de adherencia media sin gamificación ruidosa.

---

## 3. Arquitectura del Sistema

El proyecto implementa una arquitectura limpia y pragmática orientada a desacoplar la lógica clínica de la infraestructura y la interfaz de usuario:

```
src/
├── domain/
│   └── nutrition/          # Núcleo clínico puro: PortionEngine, reglas de raciones y deducciones (TypeScript puro, TDD)
├── data/
│   ├── nutrition/          # Catálogo de alimentos de referencia y equivalencias 1R
│   ├── recipes/            # Recetas pautadas y fórmulas de salsas
│   └── weekly-plan/        # Menú semanal base (días de entreno vs. descanso)
├── application/            # Casos de uso funcionales:
│                           # - DailyFlow (consulta y confirmación de comidas)
│                           # - FoodSubstitution (reemplazo al gramo exacto)
│                           # - GenerateShoppingList (agregación para la compra)
├── infrastructure/         # Persistencia local (expo-sqlite, migraciones y repositorios locales)
└── presentation/           # Capa visual (React Native + Expo Router):
    ├── components/         # Componentes atómicos (MealCard, CalendarGrid, ChecklistItem)
    ├── hooks/              # Custom hooks (useToday, useShoppingList, etc.)
    └── theme/              # Tokens de diseño semánticos (Light / Dark mode, Dynamic Type)

app/                        # Rutas y navegación de Expo Router (tabs: index, plan, shopping, progress)
```

### Principios de UI/UX (Design System)
- **Modo OPERATE:** Ergonomía táctil pensada para uso en cocina (targets táctiles ≥48 dp).
- **Paleta Semántica:** Soporte automático para temas Claro (`#F7F6F2`) y Oscuro (`#121316`) respetando `useColorScheme`.
- **Accesibilidad:** Layouts fluidos con `flexWrap` y compatibilidad con Dynamic Type.

---

## 4. Stack Tecnológico

| Capa | Tecnología |
| :--- | :--- |
| **Framework** | [React Native 0.86](https://reactnative.dev/) / [Expo SDK 57](https://expo.dev/) |
| **Enrutamiento** | [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing) |
| **Persistencia** | [`expo-sqlite`](https://docs.expo.dev/versions/v57.0.0/sdk/sqlite/) (Local-First) |
| **Lenguaje** | [TypeScript 6](https://www.typescriptlang.org/) (Strict Mode) |
| **Testing** | [Jest](https://jestjs.io/) + [React Native Testing Library](https://callstack.github.io/react-native-testing-library/) |
| **Linter & Formato** | ESLint (`eslint-config-expo`) |

---

## 5. Puesta en Marcha

### Prerrequisitos
- [Node.js](https://nodejs.org/) (versión 20 o superior recomendada)
- Gestor de paquetes `npm`
- Para probar en dispositivo móvil: app **Expo Go** ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)) o simuladores locales (Xcode / Android Studio).

### Instalación

1. Clonar el repositorio:
   ```bash
   git clone <url-del-repositorio>
   cd food-flow
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Iniciar el servidor de desarrollo de Expo:
   ```bash
   npm start
   ```

### Scripts Disponibles

```bash
# Servidor de desarrollo interactivo
npm start

# Ejecución en plataformas específicas
npm run ios
npm run android
npm run web

# Suite de pruebas unitarias y de integración
npm test

# Verificación de tipos TypeScript
npm run typecheck

# Análisis estático de código
npm run lint
```

---

## 6. Documentación Adicional

Para profundizar en las decisiones técnicas y de diseño del proyecto, consulta la carpeta `docs/`:

- [Design System & Decisiones Visuales](DESIGN.md)
- [Visión de Producto y Filosofía](docs/product/vision.md)
- [Requisitos Funcionales](docs/product/requirements.md)
- [Flujos de Usuario](docs/product/user-flows.md)
- [Arquitectura del Sistema y Flujo de Datos](docs/architecture/overview.md)
- [Modelo de Datos y Persistencia](docs/architecture/data-model.md)
- [Registro de Decisiones Técnicas](docs/architecture/decisions.md)
