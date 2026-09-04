# Flujos de Usuario: Food Flow

## Flujo 1: Primer Inicio (First Launch & Setup)
1. El usuario abre la aplicación por primera vez.
2. El sistema inicializa la base de datos local SQLite y siembra la pauta nutricional clínica base (alimentos, equivalencias, momentos, recetas del PDF).
3. Se muestra una pantalla de bienvenida limpia con un único mensaje explicativo:
   > "Estructura fija, alimentos flexibles. Tu pauta de Bel·lan Farmacia lista para registrar en 1 toque."
4. Se configuran los días de entrenamiento predeterminados (Lunes, Martes, Jueves y Viernes; Miércoles, Sábado y Domingo descanso).
5. El usuario pulsa `[ Empezar ]` y aterriza directamente en la pestaña **Hoy**.
*Resultado:* Cero formularios, cero registros, listo para usar en menos de 3 segundos.

---

## Flujo 2: Abrir Aplicación durante el Día (Daily Overview)
1. El usuario abre la aplicación.
2. La app detecta la fecha actual (ej. Viernes 4 de septiembre).
3. Determina el tipo de día según la configuración (ej. "Día de Entrenamiento").
4. Muestra la cabecera:
   - Día de la semana y selector rápido de tipo de día: `[ Entrenamiento | Descanso ]`.
   - Barra de progreso diario: `2 / 5 completadas (40%)`.
5. Lista las comidas del día con su estado actual:
   - Preentreno `[✓]` (Completado)
   - Almuerzo `[✓]` (Completado)
   - Comida `[ > ]` (Siguiente pendiente, resaltada)
   - Merienda `[ · ]` (Pendiente)
   - Cena `[ · ]` (Pendiente)
6. El usuario toca sobre la tarjeta de la comida activa (ej. "Comida").
*Resultado:* En 1 segundo el usuario sabe qué le toca y cuánto lleva del día.

---

## Flujo 3: Marcar Comida Propuesta (1-Tap Logging)
1. El usuario está en la vista de detalle de "Comida".
2. La pantalla muestra el desglose del objetivo:
   - **Objetivo:** 4R Proteína · 6R Hidratos · 1R Grasa · Verdura libre · Yogur proteico.
   - **Propuesta de hoy:**
     - 200 g Pechuga de pollo (4R Proteína)
     - 90 g Arroz integral en crudo (6R HCC)
     - 10 g AOVE (1R Grasa)
     - Ensalada / Verduras (Verdura libre)
     - 1 Yogur rico en proteínas (Postre / salsa)
3. El usuario ha preparado exactamente esa comida.
4. Pulsa el botón principal: `[ He comido esto ]`.
5. El sistema:
   - Registra la comida como `completed = true`.
   - Guarda los ingredientes y gramos consumidos en el historial SQLite.
   - Aplica una micro-animación de confirmación (checkmark).
   - Vuelve a la pantalla principal "Hoy" mostrando `3 / 5 completadas`.
*Resultado:* Registro completado con exactamente 1 pulsación táctil.

---

## Flujo 4: Cambiar Alimento (Simple Food Substitution)
1. El usuario entra en "Comida", pero no tiene arroz; prefiere cocinar patata.
2. En la fila de "Arroz integral (90 g - 6R HCC)", pulsa el icono de intercambio o `[ Cambiar ]`.
3. Se despliega un selector modal/sheet filtrado **exclusivamente** por alimentos del grupo de **Hidratos (HCC)**:
   - Arroz integral (1R = 15g) - *Seleccionado*
   - Pasta integral (1R = 15g)
   - Avena en copos (1R = 15g)
   - Pan integral (1R = 20g)
   - Patata / Boniato (1R = 50g)
4. El usuario selecciona `Patata / Boniato`.
5. El motor de raciones calcula inmediatamente:
   - $6\text{R} \times 50\text{ g} = 300\text{ g de patata}$.
6. La propuesta en pantalla se actualiza en tiempo real:
   - `300 g Patata / Boniato (6R HCC)`.
7. El usuario pulsa `[ He comido esto ]`.
8. Se persiste el log con los 300 g de patata.
*Resultado:* Sustitución matemáticamente exacta en 2 toques sin calcular nada mentalmente.

---

## Flujo 5: Crear una Combinación Válida (Split Portions & Reglas Especiales)
1. El usuario prepara la "Cena" (Objetivo: 4R Proteína, 3R HCC, 1R Grasa, Verdura libre, Yogur proteico).
2. Desea cenar el "Bowl fresco de salmón y queso" del recetario:
   - 150 g de salmón (2R Proteína)
   - 140 g de queso fresco (2R Proteína)
   - 150 g de patata (3R HCC)
3. Al seleccionar Salmón (2R de pescado azul), el motor detecta la regla clínica **BR-004**:
   - $2\text{R Proteína de pescado azul} \implies \text{resta } 2 \times 0.5\text{R} = 1.0\text{R de grasa}$.
4. Grasa añadida restante: $1\text{R} - 1\text{R} = 0\text{R}$ ($0\text{ g de aceite/AOVE}$).
5. La pantalla refleja automáticamente:
   - 150 g Salmón (2R Prot)
   - 140 g Queso fresco (2R Prot)
   - 150 g Patata (3R HCC)
   - 0 g AOVE (Grasa cubierta por el salmón)
   - Tomate / pepino (Verdura libre)
   - 1 Yogur proteico
6. El usuario pulsa `[ He comido esto ]`.
*Resultado:* La aplicación previene un exceso de grasa sin que el usuario tenga que recordar la regla clínica.

---

## Flujo 6: Corregir una Comida Registrada (Correction & Reopen)
1. El usuario marcó por error la Comida a las 14:00 pero finalmente no comió el yogur o cambió de planes.
2. Abre la app, toca la comida completada `Comida [✓]`.
3. La pantalla muestra los datos registrados y la opción `[ Modificar comida ]` o `[ Desmarcar comida ]`.
4. Si pulsa `[ Desmarcar comida ]`:
   - El estado pasa a pendiente.
   - El contador diario se actualiza a `2 / 5`.
5. Si pulsa `[ Modificar ]`:
   - Ajusta los ingredientes o cantidades y pulsa `[ Guardar cambios ]`.
*Resultado:* Corrección ágil sin fricción ni bloqueos.

---

## Flujo 7: Consultar Histórico y Adherencia (Progress View)
1. El usuario navega a la pestaña **Progreso**.
2. Observa:
   - Adherencia semanal: `91% de comidas cumplidas esta semana`.
   - Racha actual: `5 días consecutivos con 100% de comidas`.
   - Calendario mensual: Cuadrícula limpia donde cada día tiene un indicador:
     - Verde sólido: 100% de comidas del día completadas.
     - Naranja / punto parcial: Comidas parciales registradas.
     - Gris: Día sin registrar o descanso futuro.
3. Al pulsar sobre cualquier día pasado, se visualiza en modo resumen qué comidas se registraron y qué alimentos se consumieron.
*Resultado:* Refuerzo positivo y visibilidad de consistencia sin métricas de peso ni calorías.

---

## Flujo 8: Consultar Receta y Equivalencias (Plan Reference)
1. El usuario navega a la pestaña **Plan**.
2. Tiene dos secciones principales:
   - **Estructura y Equivalencias:** Visualiza la tabla de momentos y qué equivale a 1R de cada grupo.
   - **Recetario Rápido:** Lista de 8 recetas prácticas del PDF (Bowls de pollo fajita, pasta cremosa, bowls de patata, merluza, salmón, salsas).
3. Selecciona una receta (ej. "Loaded potato bowl de pollo y huevo").
4. Visualiza:
   - Tiempo estimado: 10-15 min.
   - Ingredientes con desglose para Entreno vs Descanso.
   - Paso a paso numerado de preparación rápida.
   - Nota clínica explicativa ("Por qué solo 5g de aceite: el huevo con yema ya aporta 0,5R de grasa").
*Resultado:* Consulta inmediata sin necesidad de abrir el PDF en el móvil.

---

## Flujo 9: Generar y Gestionar Lista de Compra (Shopping List)
1. El usuario navega a la pestaña **Compra**.
2. La app genera y presenta la lista consolidada de 7 días agregando los ingredientes de las recetas del menú semanal:
   - Categorías colapsables: Proteína (~1,1kg pollo, 600g pavo, etc.), Pescado, Lácteos, Carbohidratos, Grasas, Fruta/Verdura y Despensa.
3. El usuario está en el supermercado ALDI/Consum:
   - Al introducir un artículo en el carro, toca el checkbox.
   - El artículo se tacha y se mueve suavemente al fondo de su categoría.
4. Al terminar la compra, dispone de una opción `[ Reiniciar lista ]` para el siguiente ciclo semanal.
*Resultado:* Compra rápida y eficiente que asegura tener exactamente los alimentos necesarios para la semana.
