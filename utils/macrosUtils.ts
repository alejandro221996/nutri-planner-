// Utilidades para manejo de macronutrientes

export interface Macros {
  proteina: number;
  carbohidrato: number;
  grasa: number;
}

// Suma dos objetos de macros
export function sumarMacros(a: Macros, b: Macros): Macros {
  return {
    proteina: a.proteina + b.proteina,
    carbohidrato: a.carbohidrato + b.carbohidrato,
    grasa: a.grasa + b.grasa,
  };
}

// Suma un array de macros
export function sumarMacrosArray(arr: Macros[]): Macros {
  return arr.reduce((acc, m) => sumarMacros(acc, m), {
    proteina: 0,
    carbohidrato: 0,
    grasa: 0,
  });
}

// Convierte macros a calorías (aprox)
export function macrosToKcal(macros: Macros): number {
  return macros.proteina * 4 + macros.carbohidrato * 4 + macros.grasa * 9;
}

// Calcula el porcentaje de cada macro respecto al total de calorías
export function macrosPercent(macros: Macros): {
  proteina: number;
  carbohidrato: number;
  grasa: number;
} {
  const totalKcal = macrosToKcal(macros);
  return {
    proteina: totalKcal ? (macros.proteina * 4 * 100) / totalKcal : 0,
    carbohidrato: totalKcal ? (macros.carbohidrato * 4 * 100) / totalKcal : 0,
    grasa: totalKcal ? (macros.grasa * 9 * 100) / totalKcal : 0,
  };
}
