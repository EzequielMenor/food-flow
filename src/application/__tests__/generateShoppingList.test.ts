import {
  generateShoppingList,
  groupShoppingByCategory,
  weekDateKeys,
  weekKey,
  type ShoppingLine,
} from '../generateShoppingList';

/**
 * TASK-M6-001: la lista se DERIVA del menú semanal (plan -> recetas ->
 * agregación), y sus cantidades deben cuadrar con la hoja de compra del PDF.
 */

function lineOf(lines: readonly ShoppingLine[], namePart: string): ShoppingLine {
  const line = lines.find((l) =>
    l.name.toLowerCase().includes(namePart.toLowerCase())
  );
  if (line === undefined) {
    throw new Error(
      `producto "${namePart}" no presente: ${lines.map((l) => l.name).join(', ')}`
    );
  }
  return line;
}

describe('generateShoppingList (pipeline semanal -> agregación)', () => {
  it('construye exactamente 7 días que empiezan en lunes para el lunes del PDF', () => {
    const monday = new Date(2026, 8, 7); // 7 sept 2026 = lunes
    const keys = weekDateKeys(monday);
    expect(keys).toHaveLength(7);
    expect(keys[0]).toBe('2026-09-07');
    expect(keys[6]).toBe('2026-09-13');
    expect(weekKey(monday)).toBe('2026-09-07');
  });

  it('día intermedio de semana: la semana de referencia sigue en lunes correcto', () => {
    const wednesday = new Date(2026, 8, 9);
    const keys = weekDateKeys(wednesday);
    expect(keys[0]).toBe('2026-09-07');
  });

  it('agrega los gramajes de proteína de la semana cerrada (4 entreno + 3 descanso)', () => {
    const lines = generateShoppingList(new Date(2026, 8, 7));
    expect(lineOf(lines, 'pollo').name).toBe('Pechuga de pollo');
    expect(lineOf(lines, 'pavo').quantityDisplay).toBe('600 g');
    expect(lineOf(lines, 'ternera').quantityDisplay).toBe('150 g');
    expect(lineOf(lines, 'merluza').quantityDisplay).toBe('600 g');
    expect(lineOf(lines, 'salmón').quantityDisplay).toBe('300 g');
    expect(lineOf(lines, 'huevo').quantityDisplay).toBe('3 ud');
  });

  it('coincide con las cantidades globales de la página 11 del PDF', () => {
    const lines = generateShoppingList(new Date(2026, 8, 7));
    expect(lineOf(lines, 'Leche').quantityDisplay).toBe('4.2 L');
    expect(lineOf(lines, 'Avena').quantityDisplay).toBe('645 g');
    expect(lineOf(lines, 'arroz').quantityDisplay).toBe('300 g');
    expect(lineOf(lines, 'Pasta').quantityDisplay).toBe('240 g');
    expect(lineOf(lines, 'Patata').quantityDisplay).toBe('900 g');
    expect(lineOf(lines, 'Pan').quantityDisplay).toBe('80 g');
    expect(lineOf(lines, 'AOVE').quantityDisplay).toBe('105 g');
    expect(lineOf(lines, 'crema').quantityDisplay).toBe('270 g');
    expect(lineOf(lines, 'Proteína en polvo').quantityDisplay).toBe('350 g');
    expect(lineOf(lines, 'Queso fresco').quantityDisplay).toBe('280 g');
    expect(lineOf(lines, 'pollo').quantityDisplay).toBe('~1.1 kg');
  });

  it('agrupa por categorías de supermercado con pollo en PROTEIN y salmón en FISH', () => {
    const lines = generateShoppingList(new Date(2026, 8, 7));
    const grouped = groupShoppingByCategory(lines);
    expect(Object.keys(grouped).sort()).toEqual(
      ['CARBS', 'DAIRY', 'FATS', 'FISH', 'PANTRY', 'PRODUCE', 'PROTEIN'].sort()
    );
    expect(grouped.PROTEIN.some((l) => l.name === 'Pechuga de pollo')).toBe(true);
    expect(grouped.FISH.some((l) => l.name === 'Salmón')).toBe(true);
    expect(grouped.FISH.some((l) => l.name === 'Merluza')).toBe(true);
    // Huevos van con la proteína de carnicería, no con el pescado
    expect(grouped.PROTEIN.some((l) => l.name.includes('Huevo'))).toBe(true);
    // la fruta/verdura fresca va como su propia categoría
    expect(grouped.PRODUCE.some((l) => l.name.toLowerCase().includes('pl'))).toBe(true);
  });

  it('es determinista y no inventa productos: toda línea viene de alimentos reconocibles', () => {
    const a = generateShoppingList(new Date(2026, 8, 7));
    const b = generateShoppingList(new Date(2026, 8, 12));
    expect(a).toEqual(b);
    expect(a.length).toBeGreaterThan(14);
  });
});
