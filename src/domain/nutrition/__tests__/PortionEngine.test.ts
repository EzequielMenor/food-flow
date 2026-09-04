import {
  portionsToQuantity,
  substituteFood,
  isFatDeductingProtein,
  calculateFatDeduction,
  calculateNetFat,
  portionsFromQuantity,
  buildSelection,
} from '../PortionEngine';
import {
  InvalidPortionError,
  IncompatibleFoodGroupError,
  type Food,
  type FoodItemSelection,
} from '../types';
import {
  AOVE,
  ARROZ,
  HUEVO,
  MERLUZA,
  PATATA,
  POLLO,
  SALMON,
  AGUACATE,
} from '@/data/nutrition/canonicalFoods';

/**
 * TASK-M1-002: TDD del PortionEngine.
 * Casos extraídos literalmente de docs/domain/portion-engine.md y business-rules.md.
 */

const sel = (food: Food, portions: number): FoodItemSelection => buildSelection(food, portions);

describe('portionsToQuantity (conversión raciones → cantidad)', () => {
  it('6R de arroz (15 g) => 90 g', () => {
    expect(portionsToQuantity(ARROZ, 6)).toEqual({ value: 90, unit: 'g' });
  });

  it('4R de pollo (50 g) => 200 g', () => {
    expect(portionsToQuantity(POLLO, 4)).toEqual({ value: 200, unit: 'g' });
  });

  it('2R de pescado blanco (75 g) => 150 g', () => {
    expect(portionsToQuantity(MERLUZA, 2)).toEqual({ value: 150, unit: 'g' });
  });

  it('1R de aguacate preserva el rango 50–55 g; 2R => 100–110 g (BR-008)', () => {
    expect(portionsToQuantity(AGUACATE, 1)).toEqual({ value: 50, maxValue: 55, unit: 'g' });
    expect(portionsToQuantity(AGUACATE, 2)).toEqual({ value: 100, maxValue: 110, unit: 'g' });
  });

  it('raciones fraccionadas: 0.5R de AOVE => 5 g', () => {
    expect(portionsToQuantity(AOVE, 0.5)).toEqual({ value: 5, unit: 'g' });
  });

  it('rechaza raciones <= 0 o NaN con InvalidPortionError', () => {
    expect(() => portionsToQuantity(ARROZ, 0)).toThrow(InvalidPortionError);
    expect(() => portionsToQuantity(ARROZ, -1)).toThrow(InvalidPortionError);
    expect(() => portionsToQuantity(ARROZ, NaN)).toThrow(InvalidPortionError);
  });
});

describe('substituteFood (invariante de grupo, BR-009)', () => {
  it('arroz 90 g (6R) -> patata = 300 g manteniendo 6R', () => {
    const result = substituteFood(sel(ARROZ, 6), PATATA);
    expect(result.food.id).toBe(PATATA.id);
    expect(result.portions).toBe(6);
    expect(result.calculatedQuantity).toEqual({ value: 300, unit: 'g' });
  });

  it('pollo 200 g (4R) -> salmón = 300 g manteniendo 4R', () => {
    const result = substituteFood(sel(POLLO, 4), SALMON);
    expect(result.calculatedQuantity).toEqual({ value: 300, unit: 'g' });
    expect(result.portions).toBe(4);
  });

  it('sustituir entre grupos distintos lanza IncompatibleFoodGroupError', () => {
    expect(() => substituteFood(sel(ARROZ, 6), POLLO)).toThrow(IncompatibleFoodGroupError);
    expect(() => substituteFood(sel(POLLO, 4), AOVE)).toThrow(IncompatibleFoodGroupError);
  });
});

describe('cantidad inversa: portionsFromQuantity', () => {
  it('90 g de arroz (crudo) equivalen a 6R', () => {
    expect(portionsFromQuantity(ARROZ, 90)).toBe(6);
  });

  it('300 g de patata equivalen a 6R', () => {
    expect(portionsFromQuantity(PATATA, 300)).toBe(6);
  });

  it('una cantidad intermedia devuelve las raciones equivalentes exactas', () => {
    expect(portionsFromQuantity(POLLO, 125)).toBe(2.5);
  });
});

describe('deducción genérica de grasa (BR-006)', () => {
  it('isFatDeductingProtein solo para huevo con yema y pescado azul', () => {
    expect(isFatDeductingProtein(HUEVO)).toBe(true);
    expect(isFatDeductingProtein(SALMON)).toBe(true);
    expect(isFatDeductingProtein(MERLUZA)).toBe(false);
    expect(isFatDeductingProtein(POLLO)).toBe(false);
  });

  it('es genérica: cualquier alimento marcado FATTY_FISH deduce, no solo el salmón', () => {
    const caballa: Food = Object.freeze({
      id: 'food:caballa',
      name: 'Caballa',
      group: 'PROTEIN' as const,
      baseQuantity: Object.freeze({ value: 75, unit: 'g' as const }),
      proteinCategory: 'FATTY_FISH' as const,
    });
    expect(calculateFatDeduction([sel(caballa, 2)])).toBe(1);
  });

  it('1 huevo con yema (1R) descuenta 0.5R => 10g AOVE pasan a 5g (BR-006)', () => {
    expect(calculateFatDeduction([sel(HUEVO, 1)])).toBe(0.5);
    const net = calculateNetFat({
      requiredFatPortions: 1,
      proteinItems: [sel(POLLO, 3), sel(HUEVO, 1)],
      fatFood: AOVE,
    });
    expect(net.deductionPortions).toBe(0.5);
    expect(net.netPortions).toBeCloseTo(0.5);
    expect(net.fatSelection?.calculatedQuantity.value).toBeCloseTo(5);
  });

  it('salmón 150 g (2R pescado azul) descuenta 1R => 0 g de grasa añadida (fatSelection null)', () => {
    const net = calculateNetFat({
      requiredFatPortions: 1,
      proteinItems: [sel(SALMON, 2)],
      fatFood: AOVE,
    });
    expect(net.deductionPortions).toBe(1);
    expect(net.netPortions).toBe(0);
    expect(net.fatSelection).toBeNull();
  });

  it('merluza (pescado blanco) no descuenta grasa => se mantienen 10 g', () => {
    const net = calculateNetFat({
      requiredFatPortions: 1,
      proteinItems: [sel(MERLUZA, 4)],
      fatFood: AOVE,
    });
    expect(net.deductionPortions).toBe(0);
    expect(net.netPortions).toBe(1);
    expect(net.fatSelection?.calculatedQuantity.value).toBe(10);
  });

  it('suelo no negativo (BR-007): 3 huevos con objetivo 1R => 0R/0 g, nunca negativo ni excepción', () => {
    const net = calculateNetFat({
      requiredFatPortions: 1,
      proteinItems: [sel(HUEVO, 3)],
      fatFood: AOVE,
    });
    expect(net.deductionPortions).toBe(1.5);
    expect(net.netPortions).toBe(0);
    expect(net.fatSelection).toBeNull();
  });

  it('combinación 150 g pollo + 1 huevo = 4R proteína con grasa neta 5 g', () => {
    const chicken = sel(POLLO, 3); // 150 g
    const egg = sel(HUEVO, 1); // 1 unidad
    expect(chicken.portions + egg.portions).toBe(4);
    const net = calculateNetFat({
      requiredFatPortions: 1,
      proteinItems: [chicken, egg],
      fatFood: AOVE,
    });
    expect(net.fatSelection?.calculatedQuantity.value).toBeCloseTo(5);
  });
});
