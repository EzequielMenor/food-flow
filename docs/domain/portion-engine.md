# Motor de Raciones (Portion Engine)

El **Portion Engine** (`src/domain/nutrition/PortionEngine.ts`) es el núcleo puro de cálculo de Food Flow. Es una librería funcional sin dependencias de frameworks ni I/O, determinista y testeada mediante TDD.

---

## 1. Tipos de Dominio

```typescript
export type FoodGroupId = 'PROTEIN' | 'CARBOHYDRATE' | 'FAT';

export type MeasurementUnit = 'g' | 'ml' | 'unit';

export type ProteinCategory = 'LEAN_MEAT' | 'WHITE_FISH' | 'FATTY_FISH' | 'EGG_WITH_YOLK' | 'POWDER' | 'DAIRY';

export interface QuantitySpec {
  readonly value: number;
  readonly maxValue?: number; // Permite modelar rangos exactos como 50–55 g en aguacate
  readonly unit: MeasurementUnit;
}

export interface Food {
  readonly id: string;
  readonly name: string;
  readonly group: FoodGroupId;
  readonly baseQuantity: QuantitySpec;
  readonly proteinCategory?: ProteinCategory;
  readonly rawStateNote?: string; // Ej. "en crudo"
}

export interface FoodItemSelection {
  readonly food: Food;
  readonly portions: number;
  readonly calculatedQuantity: QuantitySpec;
}
```

---

## 2. Operaciones Matemáticas y Algoritmos

### 2.1. Conversión Raciones → Cantidad
Calcula la cantidad de alimento multiplicando las raciones por la base canónica:

```typescript
export function portionsToQuantity(food: Food, portions: number): QuantitySpec {
  if (portions <= 0 || Number.isNaN(portions)) {
    throw new InvalidPortionError(`Las raciones deben ser mayores que 0. Recibido: ${portions}`);
  }

  const base = food.baseQuantity;
  return {
    value: portions * base.value,
    maxValue: base.maxValue !== undefined ? portions * base.maxValue : undefined,
    unit: base.unit,
  };
}
```

- **Ejemplo estándar:** 6R de arroz ($15\text{ g}) \implies \mathbf{90\text{ g}}$.
- **Ejemplo con rango (Aguacate):** 1R de aguacate ($50\text{--}55\text{ g}) \implies \mathbf{50\text{--}55\text{ g}}$. Si fueran 2R: $\mathbf{100\text{--}110\text{ g}}$.

### 2.2. Sustitución de Alimentos con Invariante de Grupo
Sustituye un alimento por otro manteniendo estrictamente el número de raciones:

```typescript
export function substituteFood(
  current: FoodItemSelection,
  targetFood: Food
): FoodItemSelection {
  if (current.food.group !== targetFood.group) {
    throw new IncompatibleFoodGroupError(
      `No se puede sustituir alimento del grupo ${current.food.group} por ${targetFood.group}`
    );
  }

  return {
    food: targetFood,
    portions: current.portions,
    calculatedQuantity: portionsToQuantity(targetFood, current.portions),
  };
}
```

### 2.3. Deducción Genérica de Grasa (Huevo con Yema y Pescado Azul)
La deducción de grasa es un comportamiento genérico del grupo Proteína:
$$\text{Deducción} = 0,5\text{R por cada ración de proteína de huevo con yema o pescado azul.}$$

```typescript
export function isFatDeductingProtein(food: Food): boolean {
  return food.proteinCategory === 'EGG_WITH_YOLK' || food.proteinCategory === 'FATTY_FISH';
}

export function calculateFatDeduction(proteinItems: readonly FoodItemSelection[]): number {
  let deduction = 0;
  for (const item of proteinItems) {
    if (isFatDeductingProtein(item.food)) {
      deduction += item.portions * 0.5;
    }
  }
  return deduction;
}

export function calculateNetFat({
  requiredFatPortions,
  proteinItems,
  fatFood,
}: {
  requiredFatPortions: number;
  proteinItems: readonly FoodItemSelection[];
  fatFood: Food;
}): {
  deductionPortions: number;
  netPortions: number;
  fatSelection: FoodItemSelection;
} {
  const deductionPortions = calculateFatDeduction(proteinItems);
  const netPortions = Math.max(0, requiredFatPortions - deductionPortions);

  return {
    deductionPortions,
    netPortions,
    fatSelection: {
      food: fatFood,
      portions: netPortions,
      calculatedQuantity: portionsToQuantity(fatFood, netPortions),
    },
  };
}
```

---

## 3. Invariantes del Motor

1. **Seguridad de Grupo:** Prohibido el intercambio entre grupos de macronutrientes distintos.
2. **Suelo No Negativo de Grasa:** La grasa neta añadida nunca puede ser negativa.
3. **Preservación de Rango:** Si un alimento define un rango (ej. aguacate 50–55 g), el cálculo escala el rango proporcionalmente.
4. **Ausencia de Latencia Perceptible:** Operaciones puramente aritméticas en memoria, instantáneas y sin bloqueos de interfaz.
