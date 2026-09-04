/**
 * Tipos de datos prácticos (recetas y salsas del PDF). Son ADAPTACIÓN PRÁCTICA:
 * la clínica de raciones vive en src/domain/nutrition. Las cantidades reales se
 * re-calculan con el PortionEngine; estos datos solo dicen QUÉ alimentos usar.
 */

export type MealSlot = 'COMIDA' | 'CENA';

export interface RecipeComponent {
  /** id del catálogo canónico (ej. 'pollo'). */
  readonly foodId: string;
  /** raciones de proteína que aporta (invariante entreno/descanso, BR-004). */
  readonly proteinPortions: number;
}

export interface Recipe {
  readonly id: string;
  readonly name: string;
  readonly slot: MealSlot;
  /** Minutos estimados de cocción (las recetas del PDF son de 10-15 min). */
  readonly minutes: number;
  /**
   * Proteínas de la receta. Deben sumar la cuota del momento (4R comida/cena)
   * según la pauta; la proporción entreno/descanso es un dato práctico del día,
   * no una regla clínica.
   */
  readonly proteins: readonly RecipeComponent[];
  /** alimento de hidrato: arroz/pasta para comida, patata para cena. */
  readonly carbFoodId: string;
  /** alimento de grasa por defecto (AOVE salvo variantes "sin aceite"). */
  readonly fatFoodId: string;
  readonly steps: readonly string[];
  readonly tips: readonly string[];
  /** Nota clínica explicativa del PDF, cuando la receta la trae. */
  readonly clinicalNote?: string;
  /** salsas recomendadas (ids de ./sauces). */
  readonly sauceIds: readonly string[];
}

export interface Sauce {
  readonly id: string;
  readonly name: string;
  readonly how: string;
  readonly pairs: string;
}
