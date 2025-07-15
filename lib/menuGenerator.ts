// Algoritmo para generar menú con macros (borrador base)
export interface MenuInput {
  tdee: number;
  ingredientes: string[];
  comidas: number;
  objetivo?: string; // objetivo avanzado opcional
}

import { RECETAS } from "./data";
import { sumarMacrosArray } from "../utils/macrosUtils";

// Usar sumarMacrosArray de utils/macrosUtils

// Proporciones de macros según objetivo avanzado
const MACROS_OBJETIVO: Record<
  string,
  { proteina: number; carbohidrato: number; grasa: number }
> = {
  mantener: { proteina: 0.25, carbohidrato: 0.5, grasa: 0.25 },
  perder_grasa_mantener_musculo: {
    proteina: 0.3,
    carbohidrato: 0.4,
    grasa: 0.3,
  },
  perder_grasa: { proteina: 0.3, carbohidrato: 0.35, grasa: 0.35 },
  ganar_musculo_perder_grasa: {
    proteina: 0.28,
    carbohidrato: 0.42,
    grasa: 0.3,
  },
  ganar_musculo: { proteina: 0.25, carbohidrato: 0.55, grasa: 0.2 },
};

export function generateMenu({
  tdee,
  ingredientes,
  comidas,
  objetivo,
  excluidos = [],
}: MenuInput & { excluidos?: string[] }) {
  // Filtrar recetas que solo usen ingredientes permitidos y NO usen excluidos
  const recetasValidas = RECETAS.filter(
    (r) =>
      r.ingredientes.every((i) => ingredientes.includes(i)) &&
      r.ingredientes.every((i) => !excluidos.includes(i))
  );
  const pool = recetasValidas.length > 0 ? recetasValidas : RECETAS;
  const comidasLabels =
    comidas === 5
      ? ["Desayuno", "Colación 1", "Comida", "Colación 2", "Cena"]
      : ["Desayuno", "Comida", "Cena"];

  // Elegir proporciones de macros según objetivo avanzado
  const macrosPorc =
    (objetivo && MACROS_OBJETIVO[objetivo]) || MACROS_OBJETIVO["mantener"];
  // Objetivo de macros diarios
  const objetivoMacros = {
    proteina: Math.round((tdee * macrosPorc.proteina) / 4),
    carbohidrato: Math.round((tdee * macrosPorc.carbohidrato) / 4),
    grasa: Math.round((tdee * macrosPorc.grasa) / 9),
  };

  // Algoritmo: buscar combinaciones que se acerquen a los objetivos
  // Si no hay recetas válidas, devolver array vacío
  if (recetasValidas.length === 0) return [];
  // Simple: intentar sin repeticiones, luego permitir si faltan recetas
  let mejorMenu = null;
  let mejorScore = Infinity;
  const intentos = 1000;
  for (let i = 0; i < intentos; i++) {
    const seleccion: typeof RECETAS = [];
    const usadas = new Set<number>();
    let sinSuficientes = false;
    for (let j = 0; j < comidasLabels.length; j++) {
      // Evitar repeticiones SIEMPRE: si no hay suficientes, poner null
      const disponibles = pool.filter((_, idx) => !usadas.has(idx));
      if (disponibles.length > 0) {
        const idx = Math.floor(Math.random() * disponibles.length);
        const receta = disponibles[idx];
        usadas.add(pool.indexOf(receta));
        seleccion.push(receta);
      } else {
        // No hay suficientes recetas únicas
        sinSuficientes = true;
        seleccion.push(null as any); // placeholder para menú incompleto
      }
    }
    // Si hay nulls, saltar este intento
    if (sinSuficientes) continue;
    // Sumar macros
    const macrosTotales = sumarMacrosArray(seleccion.map((r) => r.macros));
    // Score: suma de diferencias absolutas respecto a objetivo
    const score =
      Math.abs(macrosTotales.proteina - objetivoMacros.proteina) +
      Math.abs(macrosTotales.carbohidrato - objetivoMacros.carbohidrato) +
      Math.abs(macrosTotales.grasa - objetivoMacros.grasa);
    if (score < mejorScore) {
      mejorScore = score;
      mejorMenu = seleccion;
    }
    if (score === 0) break; // Perfecto
  }

  // Armar menú final
  // Si no se pudo armar menú sin duplicados, devolver array vacío
  if (!mejorMenu || mejorMenu.includes(null as any)) {
    return [];
  }
  const menu = comidasLabels.map((comida, idx) => {
    const receta = mejorMenu[idx];
    const calorias = tdee / comidas;
    return {
      comida,
      receta: receta.nombre,
      calorias,
      macros: receta.macros,
      ingredientes: receta.ingredientes,
    };
  });
  return menu;
}
