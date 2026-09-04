# Design System & Decisiones Visuales: Food Flow

## 1. Principio y Modo de Diseño
- **Modo:** OPERATE (abrir → entender → marcar → cerrar).
- **Enfoque:** Claridad móvil nativa, ergonomía táctil en cocina (≥48 dp), consistencia tipográfica y ausencia de sobrecarga decorativa (anti AI-slop).

## 2. Paleta de Color Semántica (Light / Dark Mode)
La aplicación implementa soporte semántico automático (`userInterfaceStyle: "automatic"`) respetando `useColorScheme`.
- **Lienzo base (`background`):** Light `#F7F6F2` (neutro avena cálido) / Dark `#121316` (slate oscuro profundo, no negro puro).
- **Superficie de tarjetas (`surface`):** Light `#FFFFFF` / Dark `#1C1E24` (superficie elevada suave).
- **Superficie secundaria (`surfaceSubtle`):** Light `#F1F3F5` / Dark `#262932`.
- **Superficie atenuada / completada (`surfaceCompleted`):** Light `#FAFAF9` / Dark `#181A20`.
- **Bordes (`border` / `borderStrong`):** Light `#E2E8F0` / `#CBD5E1`; Dark `#2E333D` / `#424957`.
- **Texto (`textPrimary` / `textSecondary` / `textMuted`):**
  - Light: `#0F172A` / `#475569` / `#94A3B8`.
  - Dark: `#F1F5F9` / `#94A3B8` / `#64748B`.
- **Acento primario (Nutrición clínica):** Light `#059669` / Dark `#10B981`.
- **Tipos de día:**
  - Entrenamiento (`training` / `trainingLight`): Light `#2563EB` sobre `#DBEAFE` / Dark `#3B82F6` sobre `#1E3A8A`.
  - Descanso (`rest` / `restLight`): Light `#7C3AED` sobre `#EDE9FE` / Dark `#8B5CF6` sobre `#4C1D95`.
- **Estados:**
  - Completado (`successDark` sobre `successLight`): Light `#047857` sobre `#ECFDF5` / Dark `#6EE7B7` sobre `#064E3B`.
  - Aviso clínico / Grasa (`warningDark` sobre `warningLight`): Light `#92400E` sobre `#FEF3C7` / Dark `#FCD34D` sobre `#451A03`.
  - Error (`error` sobre `errorLight`): Light `#EF4444` sobre `#FEE2E2` / Dark `#F87171` sobre `#450A0A`.

## 3. Tipografía y Jerarquía
- **Títulos:**
  - Pantalla: `titleLarge` (24px, 700, 30 line height).
  - Sección: `titleSmall` / `titleMedium` (16-18px, 600-700).
- **Cuerpo:**
  - Principal: `bodyMedium` (14px, 400, 20 line height).
  - Secundario: `bodySmall` (12px, 400, 16 line height).
- **Etiquetas y datos:**
  - Datos destacados / Gramajes: `labelBold` (13-15px, 600-700).
  - Momentos y metadatos: `caption` (10-11px, 700, letter-spacing 0.5-0.6, uppercase).

## 4. Componentes y Pantallas

### Hoy (Pantalla Principal)
- **Cabecera:** Fecha legible en formato natural pero secundaria; título claro "Hoy".
- **Selector de tipo de día:** Control segmentado nativo e integrado (Entrenamiento vs Descanso).
- **Progreso:** Texto en español natural (`X de Y comidas completadas`), barra sutil de 8px.
- **Tarjetas de Comida:**
  - Compactas y ultra-escaneables: momento, título, resumen de propuesta en una línea e indicador de estado.
  - Mayor protagonismo a lo que queda pendiente: las tarjetas completadas se atenúan con suavidad sin colores chillones.
  - Acción en un toque: `He comido esto` (sin corchetes) / `✓ Completada`.
  - Pulsar la tarjeta navega directamente al detalle completo de la comida.

### Detalle de Comida (`/meal/[id]`)
- **Jerarquía limpia:**
  1. Nombre de comida (hero title).
  2. Objetivo nutricional y notas clínicas de grasa.
  3. Propuesta actual de ingredientes en crudo con botón individual de "Cambiar".
  4. Normas clínicas de sustitución explicativas al pie.
  5. Botón principal CTA al fondo con margen seguro (`He comido esto`).

### Sustitución de Alimentos (`SubstitutionModal`)
- Flujo mental directo:
  - Alimento actual y cantidad de origen.
  - "Cambiar por".
  - Alimentos alternativos exclusivos del grupo con cantidad resultante recalculada al gramo.
  - Indicador claro de ajuste de grasa (pescado azul / huevo entero).

### Plan y Recetas
- Segmentado de 3 vistas: Equivalencias (catálogo 1R y estructura de entreno/descanso), Recetas (8 recetas expandibles) y Salsas (6 salsas ligeras).
- Estructura diaria de raciones apilada con ancho completo para evitar compresión y desbordamiento en pantallas estrechas.

### Lista de la Compra
- Agrupada por categorías del supermercado con `FlatList` virtualizada para fluidez nativa.
- Checkboxes grandes y cómodos (26x26 dp) con fila completa pulsable (≥52 dp).
- Ítems comprados se atenúan con superficie sutil y tachado de texto.
- Desmarcado masivo con diálogo nativo de confirmación.

### Progreso y Adherencia
- Cuadrícula de calendario mensual con encabezados de día (`L, M, X, J, V, S, D`) alineados al 100% con las columnas de celdas mediante proporciones idénticas (`100/7%`).
- KPIs de adherencia media y días completados al 100% de forma sobria y sin gamificación ruidosa.

## 5. Adaptabilidad, Dispositivos y Accesibilidad
- **Formato v0.1:** Phone-first, orientación vertical (portrait) fijada.
- **Rango de pantalla:** Diseñado y probado para un ancho efectivo de 320–430 dp con cero overflow horizontal.
- **Tablets y Landscape:** Planificados conscientemente como evolución futura (v0.2+). En v0.1 no se introducen layouts de dos columnas ni breakpoints para mantener el foco en la experiencia móvil esencial en cocina.
- **Dynamic Type:**
  - Layouts basados en `flexWrap`, `flexShrink`, `minHeight` (en lugar de `height` fija) y títulos multilínea.
  - La limitación de escala (`maxFontSizeMultiplier={1.3}`) se reserva de forma estrictamente puntual y justificada a la cuadrícula mensual de `CalendarGrid` (7 columnas físicas rígidas) para evitar el colapso de la celda en escalas extremas (200%+).

