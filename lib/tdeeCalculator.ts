// Función para calcular TDEE usando Mifflin-St Jeor
export interface TDEEInput {
  sexo: "masculino" | "femenino";
  edad: number;
  peso: number; // kg
  estatura: number; // cm
  actividad: number; // factor multiplicador
  objetivo:
    | "mantener"
    | "perder_grasa_mantener_musculo"
    | "perder_grasa"
    | "ganar_musculo_perder_grasa"
    | "ganar_musculo";
}

export function calculateTDEE({
  sexo,
  edad,
  peso,
  estatura,
  actividad,
  objetivo,
}: TDEEInput): number {
  // Fórmula Mifflin-St Jeor
  const base =
    sexo === "masculino"
      ? 10 * peso + 6.25 * estatura - 5 * edad + 5
      : 10 * peso + 6.25 * estatura - 5 * edad - 161;
  let tdee = base * actividad;
  // Ajuste según objetivo avanzado
  switch (objetivo) {
    case "mantener":
      // Sin ajuste
      break;
    case "perder_grasa_mantener_musculo":
      tdee -= 400; // déficit moderado
      break;
    case "perder_grasa":
      tdee -= 600; // déficit alto
      break;
    case "ganar_musculo_perder_grasa":
      tdee -= 100; // recomposición, déficit leve
      break;
    case "ganar_musculo":
      tdee += 400; // superávit moderado
      break;
    default:
      break;
  }
  return Math.round(tdee);
}
