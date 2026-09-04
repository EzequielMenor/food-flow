# Modelo Nutricional: Pauta Bel·lan Farmacia

Este documento formaliza los conceptos clínicos de la pauta de Bel·lan Farmacia y establece una **separación estricta** entre la fuente de verdad nutricional y las adaptaciones prácticas operativas.

---

## 1. Separación Estricta: Fuente de Verdad vs Adaptación Práctica

Para evitar acoplamientos conceptuales erróneos, la arquitectura separa radicalmente las reglas nutricionales clínicas de los datos prácticos:

```
+-----------------------------------------------------------------------+
|              FUENTE DE VERDAD NUTRICIONAL (src/domain/nutrition/)     |
|                                                                       |
|  - Tipos de día (Entrenamiento vs Descanso)                           |
|  - Momentos del día y raciones objetivo (Proteína, HCC, Grasa)        |
|  - Requisitos complementarios (Fruta, Verdura libre, Yogur proteico)  |
|  - Equivalencias canónicas de ración (g, ml, unidades, rangos)        |
|  - Regla genérica de deducción de grasa:                              |
|      0,5R grasa por cada ración de proteína de:                       |
|      * Huevo con yema                                                 |
|      * Pescado azul (genérico: salmón, atún, caballa, etc.)           |
+-----------------------------------------------------------------------+
                                   ▲
                                   │ consume y respeta
+-----------------------------------------------------------------------+
|                    DATOS Y ADAPTACIONES PRÁCTICAS                     |
|                                                                       |
|  src/data/nutrition/   -> Catálogo concreto de alimentos de compra    |
|  src/data/recipes/     -> 8 recetas del PDF y 6 fórmulas de salsas    |
|  src/data/weekly-plan/ -> Distribución L-M-J-V y propuestas cerradas   |
+-----------------------------------------------------------------------+
```

---

## 2. Fuente de Verdad Nutricional (Clinical Core)

### 2.1. Tipos de Día (`DayType`)
- **ENTRENAMIENTO (`TRAINING`):** 5 momentos de comida. Mayor cuota de hidratos y presencia de Preentreno.
- **DESCANSO (`REST`):** 4 momentos de comida. Preentreno omitido y reducción de 6R de hidratos en el total del día.

### 2.2. Momentos del Día y Raciones Objetivo

| Momento | Día de ENTRENAMIENTO | Día de DESCANSO |
| :--- | :--- | :--- |
| **Preentreno** | Fruta + 15 g frutos secos/crema (1R Grasa) + 1R HCC | *No hace falta* (Omitido) |
| **Almuerzo** | Fruta + 6R proteína + 4R HCC + 1R grasa | Fruta + 6R proteína + 3R HCC + 1R grasa |
| **Comida** | Verdura libre + 4R proteína + 6R HCC + 1R grasa + yogur proteico | Verdura libre + 4R proteína + 4R HCC + 1R grasa + yogur proteico |
| **Merienda** | Fruta libre + 2R proteína + 3R HCC + 1R grasa | Fruta libre + 2R proteína + 2R HCC + 1R grasa |
| **Cena** | Verdura libre + 4R proteína + 3R HCC + 1R grasa + yogur proteico | Verdura libre + 4R proteína + 2R HCC + 1R grasa + yogur proteico |

#### Balance Diario Total de Raciones
- **Entrenamiento:** 16R Proteína (+ 2 yogures proteicos), 17R HCC, 5R Grasa, 3 frutas, 2 tomas de verdura libre.
- **Descanso:** 16R Proteína (+ 2 yogures proteicos), 11R HCC (-6R respecto a entreno), 4R Grasa (-1R por preentreno), 2 frutas, 2 tomas de verdura libre.

---

### 2.3. Tabla Canónica de Equivalencias de Alimentos

Una ración de intercambio ($1\text{R}$) equivale a:

#### Grupo: Proteína (`PROTEIN`)
| Alimento / Subtipo | Cantidad por 1R | Unidad | Deducción Grasa / 1R | Notas |
| :--- | :--- | :--- | :--- | :--- |
| Pollo / Pavo / Carne magra | 50 | g | 0,0 R | Carne magra |
| Pescado blanco (ej. merluza) | 75 | g | 0,0 R | Pescado magro |
| **Pescado azul (ej. salmón)** | 75 | g | **0,5 R** | Regla genérica de lípidos intrínsecos |
| **Huevo entero (con yema)** | 1 | unidad | **0,5 R** | Regla genérica de lípidos intrínsecos |
| Proteína en polvo | 10 | g | 0,0 R | Suplemento en polvo |
| Leche semidesnatada | 200 | ml | 0,0 R | Lácteo líquido |
| Queso fresco | 70 | g | 0,0 R | Lácteo magro |

#### Grupo: Hidratos de Carbono Complejos (`CARBOHYDRATE`)
| Alimento / Subtipo | Cantidad por 1R | Unidad | Notas |
| :--- | :--- | :--- | :--- |
| Arroz integral / blanco | 15 | g | Medido **en crudo** |
| Pasta integral | 15 | g | Medido **en crudo** |
| Avena (copos) | 15 | g | Medido **en crudo** |
| Pan integral | 20 | g | Pan de panadería |
| Patata / Boniato | 50 | g | Tubérculo en crudo |

#### Grupo: Grasa (`FAT`)
| Alimento / Subtipo | Cantidad por 1R | Unidad | Notas |
| :--- | :--- | :--- | :--- |
| Aceite de oliva virgen extra (AOVE) | 10 | g | Grasa líquida principal |
| Frutos secos o crema de frutos secos | 15 | g | 100% fruto seco |
| **Aguacate** | **50–55** | **g** | **Rango exacto de la pauta. Preservado como rango.** |

---

### 2.4. Regla Genérica de Deducción de Grasa
Cualquier fuente de proteína clasificada clínicamente como portadora de grasa intrínseca reduce la grasa añadida de la comida:
$$\text{Deducción de grasa} = 0,5\text{R por cada 1R de proteína que provenga de huevo con yema o pescado azul.}$$

- **No es una excepción ad-hoc para salmón:** Aplica a cualquier pescado azul (salmón, atún, caballa, sardina) y al huevo con yema.
- **Suelo no negativo:** La grasa añadida resultante tras aplicar las deducciones nunca puede ser menor que 0 gramos:
$$\text{Grasa añadida neta} = \max(0, \text{Grasa requerida} - \text{Deducciones})$$

---

## 3. Adaptaciones Prácticas y Datos Operativos

Estos elementos residen en la capa de datos (`src/data/`), nunca en el núcleo de dominio:
1. **Menú Semanal Cerrado (`src/data/weekly-plan/`):** Asignación por defecto L-M-J-V entrenamiento, X-S-D descanso y propuestas de platos diarios.
2. **Recetario Rápido (`src/data/recipes/`):** Las 8 recetas del PDF (Bowls de pollo fajita, pasta cremosa, loaded potato bowls, merluza, salmón, ternera, curry y tex-mex) y las 6 salsas.
3. **Pauta de Hidratación:** La recomendación general de 2 a 2,5 L diarios se documenta como guía de salud. Su registro interactivo queda planificado para v0.2.
