# Visión de Producto: Food Flow

## 1. Problema
Seguir una pauta nutricional pautada por un profesional suele fracasar por la fricción operativa de las herramientas tradicionales:
- **Sobrecarga cognitiva:** Aplicaciones como MyFitnessPal o FatSecret obligan a buscar entre decenas de miles de alimentos con información nutricional inconsistente, códigos de barras o marcas comerciales.
- **Micro-decisiones constantes:** Contar calorías y macronutrientes cada día genera fatiga de decisión y abandono.
- **Incompatibilidad de modelo mental:** Cuando un nutricionista pauta la dieta mediante **raciones de intercambio** (ej. 4 raciones de proteína, 6 de hidratos), las apps comerciales no entienden este concepto; obligan a traducir mentalmente raciones a macros, luego a calorías y luego a gramos de producto comercial.
- **Lentitud de registro:** Introducir una comida habitual puede requerir entre 10 y 20 pulsaciones de pantalla, escaneos y selecciones redundantes.

## 2. Usuario Objetivo
- **Perfil:** Deportista amateur / persona comprometida con su salud (ej. Ezequiel) que cuenta con una pauta nutricional clínica clara estructurada por raciones (pauta de Bel·lan Farmacia).
- **Hábito:** Entrena con regularidad (ej. 4 días semanales de fuerza/entrenamiento y 3 días de descanso).
- **Necesidad:** Desea adherirse estrictamente a su pauta nutricional sin perder tiempo, sin pesar ingredientes desde cero cada día si ya sabe lo que come, y pudiendo sustituir alimentos sobre la marcha sin desajustar sus raciones.
- **Contexto de uso:** En la cocina preparando la comida, en el supermercado o comiendo fuera; necesita abrir la app, ver qué le toca, confirmar o sustituir en segundos y cerrar.

## 3. Objetivo del Producto
Convertir la pauta nutricional en un sistema operativo diario de **cero fricción**:
1. **Automatizar la estructura:** Mostrar al instante los objetivos nutricionales del día según si se entrena o se descansa.
2. **Registro de 1 solo toque (1-tap logging):** Si el usuario come la combinación habitual o propuesta, confirmarla con un solo gesto (`[ He comido esto ]`).
3. **Sustitución matemática sin esfuerzo:** Si el usuario no tiene arroz y quiere patata, o prefiere ternera en vez de pollo, la app recalcula al instante los gramos equivalentes exactos respetando las reglas de la pauta.
4. **Local-first y privacidad absoluta:** Funcionar al 100% offline, sin login, sin servidores y sin latencia de red.

## 4. Filosofía Central
> **"La estructura de mi dieta es fija, pero los alimentos que utilizo para cumplirla son flexibles."**

Tres pilares irrenunciables:
- **Estructura fija:** Los momentos del día (Preentreno, Almuerzo, Comida, Merienda, Cena) y los requisitos de raciones están predeterminados por el nutricionista. El usuario no tiene que inventar qué necesita cada día.
- **Alimentos flexibles:** Los ingredientes son piezas intercambiables dentro de su grupo respetando las equivalencias clínicas (1R arroz = 15g crudo; 1R patata = 50g).
- **Velocidad extrema de registro:** Abrir → Ver propuesta → Confirmar (o cambiar en 2 toques) → Cerrar. Menos de 5 segundos por comida.

## 5. Qué hace diferente a Food Flow
| Enfoque Tradicional (MyFitnessPal, LoseIt) | Enfoque Food Flow |
| :--- | :--- |
| Basado en calorías y macros totales aislados. | Basado en **raciones de intercambio clínicas** por comida. |
| Búsqueda en bases de datos abiertas de 500k alimentos. | Catálogo cerrado y verificado con los alimentos de tu pauta. |
| Requiere configurar manualmente cada comida desde cero. | Sugiere automáticamente la comida base según el día. |
| Registro manual paso a paso de cada ingrediente. | Confirmación en 1 toque de la comida propuesta. |
| Requiere login, sync en la nube y monetización invasiva. | 100% local en tu dispositivo con SQLite, privado y ultrarrápido. |

## 6. Qué NO pretende resolver (Anti-visión)
- **NO es un contador de calorías libre:** No calcula calorías quemadas ni balance calórico dinámico.
- **NO es una red social de fitness:** No hay perfiles públicos, amigos, muros ni feeds.
- **NO es un generador autónomo de dietas:** No utiliza IA ni algoritmos para "diseñar dietas" ni reemplaza el criterio del nutricionista clínico.
- **NO es un escáner de códigos de barras / OCR:** No analiza envases de ultraprocesados; trabaja con alimentos reales y equivalencias pautadas.
