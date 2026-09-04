import {
  getDayMoments,
  getMomentTargets,
  requireMomentTargets,
  getDayTotals,
  MOMENT_ORDER,
  type MomentId,
} from '../dailyStructure';

/**
 * BR-001 a BR-005, BR-010: estructura diaria y cuotas por momento.
 */
describe('Estructura diaria (BR-001)', () => {
  it('entrenamiento tiene 5 momentos, preentreno en cabeza', () => {
    const moments = getDayMoments('TRAINING');
    expect(moments).toHaveLength(5);
    expect(moments[0]).toBe('PRE_WORKOUT');
    expect(moments).toContain('ALMUERZO');
    expect(moments).toContain('CENA');
  });

  it('descanso tiene exactamente 4 momentos y ninguno es preentreno', () => {
    const moments = getDayMoments('REST');
    expect(moments).toHaveLength(4);
    expect(moments).not.toContain('PRE_WORKOUT');
    expect(moments).toEqual(['ALMUERZO', 'COMIDA', 'MERIENDA', 'CENA']);
  });

  it('MOMENT_ORDER sigue el orden cronológico de la pauta', () => {
    expect(MOMENT_ORDER).toEqual(['PRE_WORKOUT', 'ALMUERZO', 'COMIDA', 'MERIENDA', 'CENA']);
  });
});

describe('Objetivos del preentreno (BR-002)', () => {
  it('preentreno: 1 fruta + 1R HCC + 1R grasa, 0R proteína', () => {
    const targets = requireMomentTargets('PRE_WORKOUT', 'TRAINING');
    expect(targets.proteinPortions).toBe(0);
    expect(targets.carbPortions).toBe(1);
    expect(targets.fatPortions).toBe(1);
    expect(targets.fruitCount).toBe(1);
    expect(targets.fatAppliesDeduction).toBe(true);
  });

  it('preentreno no existe en descanso (getMomentTargets devuelve null)', () => {
    expect(getMomentTargets('PRE_WORKOUT', 'REST')).toBeNull();
  });
});

describe('Matriz de cuotas HCC por momento y tipo de día (BR-003)', () => {
  const cases: [MomentId, number, number][] = [
    ['ALMUERZO', 4, 3],
    ['COMIDA', 6, 4],
    ['MERIENDA', 3, 2],
    ['CENA', 3, 2],
  ];

  it.each(cases)('%s: entreno %iR / descanso %iR', (moment, training, rest) => {
    expect(requireMomentTargets(moment, 'TRAINING').carbPortions).toBe(training);
    expect(requireMomentTargets(moment, 'REST').carbPortions).toBe(rest);
  });

  it('en descanso se restan 6R de HCC respecto a entrenamiento (17 -> 11)', () => {
    const t = getDayTotals('TRAINING');
    const r = getDayTotals('REST');
    expect(t.carbohydrates).toBe(17);
    expect(r.carbohydrates).toBe(11);
    expect(t.carbohydrates - r.carbohydrates).toBe(6);
  });
});

describe('Invarianza de proteína (BR-004)', () => {
  it.each(['ALMUERZO', 'COMIDA', 'MERIENDA', 'CENA'] as const)(
    '%s: proteína idéntica en entreno y descanso',
    (moment) => {
      expect(requireMomentTargets(moment, 'TRAINING').proteinPortions).toBe(
        requireMomentTargets(moment, 'REST').proteinPortions
      );
    }
  );

  it('cuotas exactas: almuerzo 6R, comida 4R, merienda 2R, cena 4R', () => {
    expect(requireMomentTargets('ALMUERZO', 'TRAINING').proteinPortions).toBe(6);
    expect(requireMomentTargets('COMIDA', 'TRAINING').proteinPortions).toBe(4);
    expect(requireMomentTargets('MERIENDA', 'TRAINING').proteinPortions).toBe(2);
    expect(requireMomentTargets('CENA', 'TRAINING').proteinPortions).toBe(4);
  });
});

describe('Grasa base por momento (BR-005)', () => {
  it.each(['PRE_WORKOUT', 'ALMUERZO', 'COMIDA', 'MERIENDA', 'CENA'] as const)(
    '%s tiene cuota base de 1R de grasa añadida',
    (moment) => {
      expect(requireMomentTargets(moment, 'TRAINING').fatPortions).toBe(1);
    }
  );
});

describe('Complementos cualitativos (BR-010)', () => {
  it('comida y cena llevan verdura libre + yogur proteico; almuerzo y preentreno fruta', () => {
    expect(requireMomentTargets('COMIDA', 'TRAINING').freeVegetables).toBe(true);
    expect(requireMomentTargets('COMIDA', 'TRAINING').proteinYogurt).toBe(true);
    expect(requireMomentTargets('CENA', 'REST').freeVegetables).toBe(true);
    expect(requireMomentTargets('CENA', 'REST').proteinYogurt).toBe(true);
    expect(requireMomentTargets('ALMUERZO', 'TRAINING').fruitCount).toBe(1);
    expect(requireMomentTargets('PRE_WORKOUT', 'TRAINING').fruitCount).toBe(1);
    expect(requireMomentTargets('MERIENDA', 'TRAINING').freeFruitNote).toBe(true);
  });

  it('los complementos no alteran el cómputo de raciones contables', () => {
    expect(getDayTotals('TRAINING')).toEqual({ protein: 16, carbohydrates: 17, fat: 5 });
  });
});

describe('Balances diarios totales (pauta Bel·lan)', () => {
  it('entrenamiento: 16R prot, 17R HCC, 5R grasa', () => {
    expect(getDayTotals('TRAINING')).toEqual({ protein: 16, carbohydrates: 17, fat: 5 });
  });

  it('descanso: 16R prot, 11R HCC, 4R grasa (-6R HCC, -1R grasa)', () => {
    expect(getDayTotals('REST')).toEqual({ protein: 16, carbohydrates: 11, fat: 4 });
  });
});
