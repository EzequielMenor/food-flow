import {
  FOODS,
  getFoodsByGroup,
  foodById,
} from '../canonicalFoods';
import type { Food } from '@/domain/nutrition/types';

/**
 * BR-008: Equivalencias canónicas de intercambio.
 */
describe('Catálogo canónico de alimentos (BR-008)', () => {
  it('define las equivalencias exactas del grupo Proteína', () => {
    expect(foodById('food:pollo')?.baseQuantity).toEqual({ value: 50, unit: 'g' });
    expect(foodById('food:pavo')?.baseQuantity).toEqual({ value: 50, unit: 'g' });
    expect(foodById('food:ternera-magra')?.baseQuantity).toEqual({ value: 50, unit: 'g' });
    expect(foodById('food:merluza')?.baseQuantity).toEqual({ value: 75, unit: 'g' });
    expect(foodById('food:salmon')?.baseQuantity).toEqual({ value: 75, unit: 'g' });
    expect(foodById('food:huevo')?.baseQuantity).toEqual({ value: 1, unit: 'unit' });
    expect(foodById('food:proteina-polvo')?.baseQuantity).toEqual({ value: 10, unit: 'g' });
    expect(foodById('food:leche-semidesnatada')?.baseQuantity).toEqual({ value: 200, unit: 'ml' });
    expect(foodById('food:queso-fresco')?.baseQuantity).toEqual({ value: 70, unit: 'g' });
  });

  it('define las equivalencias exactas del grupo Hidratos', () => {
    expect(foodById('food:arroz')?.baseQuantity).toEqual({ value: 15, unit: 'g' });
    expect(foodById('food:pasta-integral')?.baseQuantity).toEqual({ value: 15, unit: 'g' });
    expect(foodById('food:avena')?.baseQuantity).toEqual({ value: 15, unit: 'g' });
    expect(foodById('food:pan-integral')?.baseQuantity).toEqual({ value: 20, unit: 'g' });
    expect(foodById('food:patata')?.baseQuantity).toEqual({ value: 50, unit: 'g' });
  });

  it('define las equivalencias exactas del grupo Grasa', () => {
    expect(foodById('food:aove')?.baseQuantity).toEqual({ value: 10, unit: 'g' });
    expect(foodById('food:crema-frutos-secos')?.baseQuantity).toEqual({ value: 15, unit: 'g' });
  });

  it('preserva el rango estricto de la pauta para el aguacate: 1R = 50–55 g', () => {
    expect(foodById('food:aguacate')?.baseQuantity).toEqual({
      value: 50,
      maxValue: 55,
      unit: 'g',
    });
  });

  it('marca pescado azul y huevo con yema como categorías con deducción de grasa', () => {
    expect(foodById('food:salmon')?.proteinCategory).toBe('FATTY_FISH');
    expect(foodById('food:huevo')?.proteinCategory).toBe('EGG_WITH_YOLK');
    expect(foodById('food:merluza')?.proteinCategory).toBe('WHITE_FISH');
    expect(foodById('food:pollo')?.proteinCategory).toBe('LEAN_MEAT');
  });

  it('anota el estado en crudo de los cereales', () => {
    expect(foodById('food:arroz')?.rawStateNote).toBe('en crudo');
    expect(foodById('food:avena')?.rawStateNote).toBe('en crudo');
  });

  it('todos los alimentos son inmutables, están tipados y sin duplicados', () => {
    const ids = FOODS.map((f: Food) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const food of FOODS) {
      expect(['PROTEIN', 'CARBOHYDRATE', 'FAT']).toContain(food.group);
      expect(food.baseQuantity.value).toBeGreaterThan(0);
      if (food.group === 'PROTEIN') {
        expect(food.proteinCategory).toBeDefined();
      }
    }
    expect(Object.isFrozen(FOODS[0])).toBe(true);
  });

  it('getFoodsByGroup filtra por grupo exacto (requisito del modal de sustitución)', () => {
    const carbs = getFoodsByGroup('CARBOHYDRATE');
    expect(carbs.map((f: Food) => f.id)).toEqual([
      'food:arroz',
      'food:pasta-integral',
      'food:avena',
      'food:pan-integral',
      'food:patata',
    ]);
    expect(getFoodsByGroup('FAT').every((f: Food) => f.group === 'FAT')).toBe(true);
  });
});
