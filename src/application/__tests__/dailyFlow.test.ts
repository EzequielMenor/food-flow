import {
  applySubstitution,
  buildDay,
  completedCount,
  createInitialState,
  setDayType,
  suggestedDayType,
  toggleMealCompleted,
  weekdayIndexOf,
  type DailyFlowState,
 FoodItem } from '../dailyFlow';

/** Fechas de ejemplo: lunes 7 / martes 8 / miércoles 9 de septiembre de 2026. */
const MON = '2026-09-07';
const TUE = '2026-09-08';
const WED = '2026-09-09';

function mealOf(state: DailyFlowState, momentId: DailyFlowState['meals'][number]['momentId']) {
  const meal = state.meals.find((m) => m.momentId === momentId);
  if (!meal) {
    throw new Error(`momento ${momentId} no presente`);
  }
  return meal;
}

function itemOf(meal: ReturnType<typeof mealOf>, foodId: string): FoodItem {
  const item = meal.items.find((i) => i.foodId === foodId);
  if (!item) {
    throw new Error(`alimento ${foodId} no presente en ${meal.title}`);
  }
  return item;
}

describe('Sugerencia por días de la semana (FR-001, semana cerrada)', () => {
  it('lunes, martes, jueves y viernes entrenan; miércoles, sábado y domingo descansan', () => {
    const map = [MON /* lun */, TUE, '2026-09-09', '2026-09-10', '2026-09-11', '2026-09-12', '2026-09-13'];
    const expected = ['TRAINING', 'TRAINING', 'REST', 'TRAINING', 'TRAINING', 'REST', 'REST'];
    expect(map.map((d) => suggestedDayType(d))).toEqual(expected);
    expect(weekdayIndexOf(MON)).toBe(0);
  });
});

describe('Pantalla Hoy — contenido de las propuestas (FR-002, FR-003, FR-004)', () => {
  it('lunes entreno: 5 momentos; comida con pollo 4R (200 g) + arroz 6R (90 g) + AOVE 10 g', () => {
    const state = buildDay(MON, 'TRAINING');
    expect(state.meals).toHaveLength(5);
    const comida = mealOf(state, 'COMIDA');
    expect(itemOf(comida, 'food:pollo').value).toBe(200);
    expect(itemOf(comida, 'food:arroz').value).toBe(90);
    expect(itemOf(comida, 'food:aove').value).toBe(10);
    expect(comida.targetSummary).toContain('4R proteína');
    expect(comida.targetSummary).toContain('6R HCC');
    expect(comida.targetSummary).toContain('verdura libre');
    expect(comida.targetSummary).toContain('yogur proteico');
  });

  it('miércoles descanso: 4 momentos sin preentreno y con arroz 4R (60 g) en comida', () => {
    const state = buildDay(WED, 'REST');
    expect(state.meals).toHaveLength(4);
    expect(state.meals.some((m) => m.momentId === 'PRE_WORKOUT')).toBe(false);
    const comida = mealOf(state, 'COMIDA');
    expect(itemOf(comida, 'food:arroz').value).toBe(60);
  });

  it('martes cena loaded bowl: 150 g pollo + huevo => grasa recortada a 5 g (BR-006)', () => {
    const state = buildDay(TUE, 'TRAINING');
    const cena = mealOf(state, 'CENA');
    const egg = itemOf(cena, 'food:huevo');
    expect(egg.value).toBe(1);
    expect(egg.unit).toBe('unit');
    expect(itemOf(cena, 'food:patata').value).toBe(150);
    expect(itemOf(cena, 'food:aove').value).toBe(5);
    expect(cena.fatNote).toContain('recortada');
  });

  it('miércoles cena salmón: 2R pescado azul + 2R queso => sin AOVE añadido (BR-007)', () => {
    const state = buildDay(WED, 'REST');
    const cena = mealOf(state, 'CENA');
    expect(itemOf(cena, 'food:salmon').value).toBe(150);
    expect(itemOf(cena, 'food:queso-fresco').value).toBe(140);
    expect(itemOf(cena, 'food:patata').value).toBe(100);
    expect(cena.items.some((i) => i.foodId === 'food:aove')).toBe(false);
    expect(cena.fatNote).toContain('cubierta');
  });

  it('preentreno entreno: 20 g pan + 15 g crema + 1 fruta (BR-002)', () => {
    const state = buildDay(MON, 'TRAINING');
    const pre = mealOf(state, 'PRE_WORKOUT');
    expect(itemOf(pre, 'food:pan-integral').value).toBe(20);
    expect(itemOf(pre, 'food:crema-frutos-secos').value).toBe(15);
    expect(pre.extras.join(' ')).toContain('fruta');
  });

  it('almuerzo postentreno: 6R proteína repartidas en avena/leche/polvo y grasa fija de crema', () => {
    const state = buildDay(MON, 'TRAINING');
    const alm = mealOf(state, 'ALMUERZO');
    expect(itemOf(alm, 'food:avena').value).toBe(60);
    expect(itemOf(alm, 'food:proteina-polvo').value).toBe(50);
    expect(itemOf(alm, 'food:leche-semidesnatada').value).toBe(200);
    expect(alm.targetSummary).toContain('6R proteína');
    expect(alm.targetSummary).toContain('4R HCC');
  });
});

describe('Registro 1-tap y progreso (FR-005, FR-008)', () => {
  it('completar comida sube contador y descompletar baja (40/100% en entreno)', () => {
    let state = createInitialState(MON);
    expect(completedCount(state)).toBe(0);
    state = toggleMealCompleted(state, 'PRE_WORKOUT');
    state = toggleMealCompleted(state, 'ALMUERZO');
    expect(completedCount(state)).toBe(2);
    expect(state.completed['PRE_WORKOUT']).toBe(true);
    state = toggleMealCompleted(state, 'ALMUERZO'); // desmarcar
    expect(completedCount(state)).toBe(1);
  });

  it('cambiar entreno -> descanso reconstruye comidas y mantiene solo lo que aún existe', () => {
    let state = toggleMealCompleted(createInitialState(MON), 'PRE_WORKOUT');
    state = toggleMealCompleted(state, 'COMIDA');
    const rest = setDayType(state, 'REST');
    expect(rest.meals).toHaveLength(4);
    // el preentreno ya no es un momento del día: su check se descarta al reconstruir
    expect(rest.completed['PRE_WORKOUT']).toBeUndefined();
    expect(rest.completed['COMIDA']).toBe(true);
    expect(completedCount(rest)).toBe(1);
    expect(rest.isManuallySet).toBe(true);
  });
});

describe('Sustitución intra-grupo desde el builder (M4, BR-009)', () => {
  it('arroz 90 g (6R) -> patata = 300 g y queda marcada como sustitución', () => {
    const withSwap = applySubstitution(createInitialState(MON), 'COMIDA', 'food:arroz', 'food:patata');
    const comida = mealOf(withSwap, 'COMIDA');
    const carb = comida.items.find((i) => i.foodId === 'food:arroz') ?? itemOf(comida, 'food:patata');
    expect(carb.foodId).toBe('food:patata');
    expect(carb.value).toBe(300);
    expect(carb.portions).toBe(6);
    expect(carb.isSubstitution).toBe(true);
  });

  it('al sustituir proteína, la grasa se recalcula al instante', () => {
    // Lunes comida con fajita: cambiar pollo por salmón (4R azul) cubre la grasa (1 - 2 → 0)
    const swapped = applySubstitution(createInitialState(MON), 'COMIDA', 'food:pollo', 'food:salmon');
    const comida = mealOf(swapped, 'COMIDA');
    expect(itemOf(comida, 'food:salmon').portions).toBe(4);
    expect(comida.items.some((i) => i.foodId === 'food:aove')).toBe(false);
    expect(comida.fatNote).toContain('cubierta');
  });

  it('sustituir huevo en loaded bowl elimina la deducción: AOVE vuelve a 10 g', () => {
    let state = applySubstitution(createInitialState(TUE), 'CENA', 'food:huevo', 'food:pollo');
    // +1R pollo para mantener 4R: el builder preserva raciones de la fuente
    const cena = mealOf(state, 'CENA');
    expect(cena.items.reduce((a, i) => a + i.portions, 0) > 0).toBe(true);
    // huevo sustituido por pollo => proteína total 4R sigue, sin deducción
    expect(itemOf(cena, 'food:pollo').portions).toBe(4);
    expect(itemOf(cena, 'food:aove').value).toBe(10);
  });

  it('deshacer la sustitución restaura el alimento original', () => {
    const original = createInitialState(MON);
    const withSwap = applySubstitution(original, 'COMIDA', 'food:arroz', 'food:patata');
    const undone = applySubstitution(withSwap, 'COMIDA', 'food:arroz', 'food:patata');
    expect(itemOf(mealOf(undone, 'COMIDA'), 'food:arroz').value).toBe(90);
  });
});
