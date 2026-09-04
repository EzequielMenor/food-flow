# Definición del MVP: Food Flow v0.1

## 1. Alcance Incluido en v0.1 (In Scope)

### A. Motor de Raciones y Dominio Clínico (`src/domain/nutrition/`)
- Tipos de día: Entrenamiento (5 comidas) vs Descanso (4 comidas).
- Raciones por momento según pauta de Bel·lan Farmacia.
- Equivalencias canónicas de alimentos con soporte de rangos (aguacate 50–55 g).
- Deducción genérica de grasa: -0,5R de grasa por cada ración de proteína de huevo con yema o de pescado azul.
- Suelo de grasa no negativo ($\ge 0\text{g}$).

### B. Datos Prácticos (`src/data/`)
- Catálogo de alimentos habituales.
- Las 8 recetas del PDF y 6 salsas rápidas.
- Menú semanal cerrado L-M-J-V entrenamiento, X-S-D descanso.

### C. Área 1: Pantalla "Hoy" (Daily Tracking)
- Selector de tipo de día: `Entrenamiento` / `Descanso` (adaptación inmediata de comidas).
- Lista de comidas con propuesta sugerida.
- Registro en 1 toque: `[ He comido esto ]`.
- Detalle de comida con selector de sustitución entre alimentos del mismo grupo.
- Barra de progreso diario (`X / Y completadas`).

### D. Área 2: Pantalla "Plan" (Reference)
- Consulta de raciones por momento.
- Tabla de equivalencias clínicas (aguacate 50–55 g).
- Recetario con selector de cantidades para Entreno vs Descanso y salsas.

### E. Área 3: Pantalla "Compra" (Smart Shopping List)
- Generación algorítmica de la lista semanal mediante agregación de ingredientes a partir del menú y recetas propuestas.
- Checklist interactiva por categorías con tachado visual persistido en SQLite.
- Acción de reinicio de lista para la siguiente semana.

### F. Área 4: Pantalla "Progreso" (Adherence)
- Porcentaje de adherencia diaria.
- Promedio de adherencia semanal (últimos 7 días).
- Vista de calendario simple de consistencia.

---

## 2. Fuera de Alcance v0.1 (Out of Scope)
- **Registro de hidratación interactivo (candidato para v0.2).**
- Contador de calorías o macros en gramos totales.
- Sincronización en la nube, autenticación o perfiles de usuario.
- Editor visual de la pauta clínica base.
- Búsqueda en bases de datos abiertas externas.

---

## 3. Criterios de Aceptación para Considerar el MVP Terminado

1. **100% de tests unitarios de dominio y cálculo en verde.**
2. **Flujo de registro en 1 toque funcional:** marcar una comida actualiza el estado y el progreso inmediatamente.
3. **Sustitución de alimentos exacta:** cambiar un alimento recalcula las cantidades al instante respetando el grupo y deducciones de grasa.
4. **Generación y persistencia de lista de compra:** la lista de la compra se deriva de las recetas de la semana y los checks persisten tras reiniciar la app.
5. **Persistencia local verificada:** matar y reabrir la app conserva días, comidas e historial.
6. **Ergonomía táctil accesible:** zonas de pulsación de botones principales de al menos 48x48 dp para uso cómodo con una sola mano.
