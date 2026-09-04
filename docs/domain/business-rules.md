# Catálogo de Reglas de Negocio (Business Rules)

Este catálogo define formalmente las reglas del dominio nutricional de Food Flow.

---

### BR-001: Estructura Diaria por Tipo de Día
- **Descripción:** Un día `ENTRENAMIENTO` consta de 5 momentos de comida (Preentreno, Almuerzo, Comida, Merienda, Cena). Un día `DESCANSO` consta de 4 momentos (Almuerzo, Comida, Merienda, Cena; Preentreno omitido).
- **Origen:** Pauta Nutricional Clínica (PDF pág. 2).
- **Ejemplo:** En día de descanso no se muestra ni se planifica el Preentreno.
- **Estrategia de Test:** Verificar que `getDayMoments('REST')` devuelve exactamente 4 momentos y ninguno es Preentreno.

---

### BR-002: Preentreno Exclusivo de Entrenamiento
- **Descripción:** El Preentreno solo se activa en días de entrenamiento con la cuota fija: 1 fruta + 1R HCC (20g pan integral) + 1R Grasa (15g crema de frutos secos).
- **Origen:** Pauta Nutricional Clínica (PDF pág. 2).
- **Ejemplo:** 20g pan + 15g crema de cacahuete + 1 plátano.
- **Estrategia de Test:** Test de plantilla de Preentreno comprobando 0R Proteína, 1R HCC, 1R Grasa.

---

### BR-003: Cuotas de Hidratos de Carbono Complejos (HCC)
- **Descripción:** Las raciones de HCC se reducen en días de descanso:
  - Almuerzo: 4R (Entreno) / 3R (Descanso).
  - Comida: 6R (Entreno) / 4R (Descanso).
  - Merienda: 3R (Entreno) / 2R (Descanso).
  - Cena: 3R (Entreno) / 2R (Descanso).
- **Origen:** Pauta Nutricional Clínica (PDF pág. 2).
- **Ejemplo:** En comida se pasa de 90g de arroz (6R * 15g) a 60g (4R * 15g).
- **Estrategia de Test:** Test parametrizado comprobando la matriz de raciones de HCC para cada momento y tipo de día.

---

### BR-004: Invarianza de Cuotas de Proteína
- **Descripción:** Las raciones de proteína son invariantes entre entrenamiento y descanso:
  - Almuerzo: 6R.
  - Comida: 4R.
  - Merienda: 2R.
  - Cena: 4R.
- **Origen:** Pauta Nutricional Clínica (PDF pág. 2).
- **Ejemplo:** En comida siempre se prescriben 4R de proteína (ej. 200g de pollo).
- **Estrategia de Test:** Comprobar que `getProteinPortions(moment, 'TRAINING') === getProteinPortions(moment, 'REST')`.

---

### BR-005: Cuota Base de Grasa Añadida
- **Descripción:** Cada momento activo de comida tiene una cuota base de 1R de grasa añadida (10g de aceite o 15g de crema de frutos secos), antes de aplicar deducciones clínicas.
- **Origen:** Pauta Nutricional Clínica (PDF pág. 2).
- **Ejemplo:** Comida con pollo magro mantiene 1R (10g de AOVE).
- **Estrategia de Test:** Verificar que la grasa base requerida es 1R en ausencia de alimentos con lípidos intrínsecos.

---

### BR-006: Deducción Genérica de Grasa por Huevo con Yema y Pescado Azul
- **Descripción:** Por cada ración de proteína que provenga de **huevo con yema** o de **pescado azul** (genérico: salmón, atún, caballa, etc.), se debe restar **0,5R de grasa añadida** a la comida.
- **Origen:** Pauta Nutricional Clínica (PDF pág. 2: *"Tu pauta indica restar 0,5R de grasa por cada ración de proteína que venga de huevo con yema o pescado azul"*).
- **Ejemplos:**
  - 1 huevo con yema (1R proteína): resta 0,5R grasa $\implies$ quedan 5g AOVE.
  - 150g salmón (2R proteína de pescado azul): resta $2 \times 0,5\text{R} = 1,0\text{R}$ grasa $\implies$ quedan 0g AOVE.
  - 300g merluza (pescado blanco): no deduce grasa $\implies$ se mantienen 10g AOVE.
- **Estrategia de Test:** Test parametrizado con alimentos clasificados como `EGG_WITH_YOLK`, `FATTY_FISH` y `WHITE_FISH`.

---

### BR-007: Suelo No Negativo de Grasa Añadida
- **Descripción:** La grasa añadida resultante tras deducciones nunca puede ser menor que 0 gramos.
- **Origen:** Invariante Físico de Dominio.
- **Ejemplo:** Si una comida incluye 3 huevos con yema (deducción 1,5R) y el objetivo base es 1R, la grasa neta es $\max(0, 1 - 1,5) = 0\text{R}$.
- **Estrategia de Test:** Comprobar que deducciones superiores a la cuota base devuelven 0g de grasa y no valores negativos ni excepciones.

---

### BR-008: Equivalencias Canónicas de Intercambio
- **Descripción:** 1 Ración ($1\text{R}$) equivale exactamente a:
  - Pollo / Pavo / Carne magra: 50 g
  - Pescado (blanco o azul): 75 g
  - Huevo entero: 1 unidad
  - Proteína en polvo: 10 g
  - Leche semidesnatada: 200 ml
  - Queso fresco: 70 g
  - Arroz / Pasta / Avena (en crudo): 15 g
  - Pan integral: 20 g
  - Patata / Boniato: 50 g
  - AOVE: 10 g
  - Frutos secos o crema 100%: 15 g
  - **Aguacate: 50–55 g (rango estricto de la pauta preservado)**
- **Origen:** Pauta Nutricional Clínica (PDF pág. 2).
- **Ejemplo:** 1R de aguacate es 50–55 g; 2R de aguacate son 100–110 g.
- **Estrategia de Test:** Suite unitaria validando cada alimento y el manejo del rango en el aguacate.

---

### BR-009: Restricción de Sustitución Intra-Grupo
- **Descripción:** Solo se permite sustituir alimentos que pertenezcan exactamente al mismo grupo (`PROTEIN`, `CARBOHYDRATE`, `FAT`).
- **Origen:** Principio Clínico de Raciones de Intercambio.
- **Ejemplo:** Arroz solo puede sustituirse por pasta, avena, pan o patata/boniato.
- **Estrategia de Test:** Verificar que sustituir entre grupos distintos lanza `IncompatibleFoodGroupError`.

---

### BR-010: Yogur Proteico y Verdura Libre como Complementos Cualitativos
- **Descripción:** El yogur proteico (en comida y cena) y la verdura libre son prescripciones de calidad nutricional que no restan ni suman gramos a las raciones contables de la pauta.
- **Origen:** Pauta Nutricional Clínica (PDF pág. 2 y 4).
- **Ejemplo:** Una comida lleva 200g de pollo (4R completas) + 1 yogur proteico + verduras al gusto.
- **Estrategia de Test:** Comprobar que las plantillas de comida contienen estos ítems como complementos cualitativos sin alterar el cómputo de raciones.

---

### BR-011: Adherencia Diaria y Semanal
- **Descripción:**
  - Diaria: $\frac{\text{comidas completadas}}{\text{total comidas del día}} \times 100$.
  - Semanal: Promedio de los porcentajes diarios de los últimos 7 días.
- **Origen:** Métrica de Adherencia del Producto.
- **Ejemplo:** 5 de 5 comidas en entreno = 100%. 3 de 4 en descanso = 75%.
- **Estrategia de Test:** Tests unitarios de cálculo de adherencia con días completos y parciales.
