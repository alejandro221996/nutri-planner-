export interface IngredientMacros {
  nombre: string;
  proteina: number; // gramos por 100g
  carbohidrato: number; // gramos por 100g
  grasa: number; // gramos por 100g
  kcal: number; // calorías por 100g
  tipo?: string;
}
