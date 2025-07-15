// Topes máximos realistas por ingrediente (puedes ajustar estos valores)
const MAX_GRAMOS_INGREDIENTE: Record<string, number> = {
  // Proteínas animales (por comida)
  Pollo: 250,
  Res: 250,
  Pescado: 250,
  Huevo: 240, // ~4 unidades
  "Pechuga de pavo": 250,
  Tofu: 250,
  "Yogur griego": 300,
  Queso: 80, // puede combinarse con otro

  // Grasas saludables
  "Aceite de oliva": 20,
  Nuez: 40,
  Almendra: 40,
  Chía: 25,
  Linaza: 25,

  // Carbohidratos complejos
  Arroz: 180, // cocido
  Pasta: 180, // cocido
  Papa: 250,
  Camote: 250,
  Avena: 100,
  Frijoles: 250,
  Lentejas: 250,
  Quinoa: 180,

  // Verduras (puedes combinarlas, muy bajas en kcal)
  Espinaca: 100,
  Brócoli: 150,
  Zanahoria: 150,
  Tomate: 150,
  Cebolla: 100,
  Lechuga: 100,
  Calabaza: 150,

  // Frutas (aumentadas)
  Manzana: 180,
  Plátano: 150,
  Fresa: 150,
  Mango: 150,
  Piña: 150,
  Durazno: 150,
  Sandía: 180,

  // Lácteos
  Leche: 250,
  Yogur: 300, // natural o light

  // Otros (si los usas en recetas)
  Aguacate: 80, // puede aportar buena grasa
  "Aceite de coco": 15,
  Pan: 60, // por rebanadas
};

import type { IngredientMacros } from "../types/IngredientMacros";
import { INGREDIENTES_MACROS } from "./data";

export interface GramajeMenuInput {
  tdee: number;
  comidas: number;
  ingredientes: string[];
  objetivo?: string;
}

// Proporciones de macros por objetivo
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

export interface GramajeMenuItem {
  comida: string;
  ingredientes: { nombre: string; gramos: number; macros: IngredientMacros }[];
  calorias: number;
  macros: { proteina: number; carbohidrato: number; grasa: number };
}

export function generateGramajeMenu({
  tdee,
  comidas,
  ingredientes,
  objetivo,
}: GramajeMenuInput): GramajeMenuItem[] {
  // Seleccionar solo los ingredientes permitidos
  const pool = INGREDIENTES_MACROS.filter((i) =>
    ingredientes.includes(i.nombre)
  );
  if (pool.length === 0) return [];

  const comidasLabels =
    comidas === 5
      ? ["Desayuno", "Colación 1", "Comida", "Colación 2", "Cena"]
      : ["Desayuno", "Comida", "Cena"];

  const macrosPorc =
    (objetivo && MACROS_OBJETIVO[objetivo]) || MACROS_OBJETIVO["mantener"];
  const objetivoMacros = {
    proteina: Math.floor((tdee * macrosPorc.proteina) / 4),
    carbohidrato: Math.floor((tdee * macrosPorc.carbohidrato) / 4),
    grasa: Math.floor((tdee * macrosPorc.grasa) / 9),
  };
  //   const kcalPorComida = tdee / comidasLabels.length;
  const macrosPorComida = {
    proteina: objetivoMacros.proteina / comidasLabels.length,
    carbohidrato: objetivoMacros.carbohidrato / comidasLabels.length,
    grasa: objetivoMacros.grasa / comidasLabels.length,
  };

  // Algoritmo simple: repartir macros entre ingredientes según su tipo

  // Separar ingredientes por tipo
  const protList = pool.filter(
    (i) => i.proteina > i.carbohidrato && i.proteina > i.grasa
  );
  const verdList = pool.filter((i) => {
    const nombre = i.nombre.toLowerCase();
    return (
      nombre.includes("espinaca") ||
      nombre.includes("brócoli") ||
      nombre.includes("zanahoria") ||
      nombre.includes("tomate") ||
      nombre.includes("calabaza") ||
      nombre.includes("pepino") ||
      nombre.includes("espárrago") ||
      nombre.includes("jitomate") ||
      nombre.includes("cebolla") ||
      nombre.includes("lechuga") ||
      nombre.includes("coliflor") ||
      nombre.includes("calabacita") ||
      nombre.includes("betabel") ||
      nombre.includes("champiñón") ||
      nombre.includes("apio")
    );
  });
  const frutaList = pool.filter((i) => {
    const nombre = i.nombre.toLowerCase();
    return (
      nombre.includes("manzana") ||
      nombre.includes("plátano") ||
      nombre.includes("fresa") ||
      nombre.includes("mango") ||
      nombre.includes("pera") ||
      nombre.includes("uva") ||
      nombre.includes("sandía") ||
      nombre.includes("melón") ||
      nombre.includes("piña") ||
      nombre.includes("durazno") ||
      nombre.includes("ciruela") ||
      nombre.includes("papaya") ||
      nombre.includes("kiwi") ||
      nombre.includes("mandarina") ||
      nombre.includes("naranja")
    );
  });
  const grasList = pool.filter(
    (i) => i.grasa > i.proteina && i.grasa > i.carbohidrato
  );

  // Si falta algún grupo, usar el pool completo
  const protUsar = protList.length ? protList : pool;
  const verdUsar = verdList.length ? verdList : pool;
  const frutaUsar = frutaList.length ? frutaList : pool;
  const grasUsar = grasList.length ? grasList : pool;

  // Para cada comida, asignar gramos de cada grupo para cubrir macros, eligiendo ingredientes aleatorios de cada grupo
  function randomFrom<T>(arr: T[], n: number): T[] {
    const copy = [...arr];
    const result: T[] = [];
    for (let i = 0; i < n && copy.length > 0; i++) {
      const idx = Math.floor(Math.random() * copy.length);
      result.push(copy.splice(idx, 1)[0]);
    }
    return result;
  }
  const menu: GramajeMenuItem[] = comidasLabels.map((comida) => {
    // 1 proteína, 2 verduras, 2 frutas, 2 grasas
    const protIngs = randomFrom(protUsar, 1);
    const verdIngs = randomFrom(verdUsar, 2);
    const frutaIngs = randomFrom(frutaUsar, 2);
    const grasIngs = randomFrom(grasUsar, 2);
    // Sumar todos los ingredientes de la comida
    const allIngs = [...protIngs, ...verdIngs, ...frutaIngs, ...grasIngs];
    // Repartir macros entre los ingredientes de cada grupo
    const gramosPorGrupo = {
      prot: macrosPorComida.proteina / protIngs.length,
      verd: verdIngs.length
        ? (macrosPorComida.carbohidrato * 0.2) / verdIngs.length
        : 0,
      fruta: frutaIngs.length
        ? (macrosPorComida.carbohidrato * 0.3) / frutaIngs.length
        : 0,
      gras: macrosPorComida.grasa / grasIngs.length,
    };
    // Calcular gramos y macros por ingrediente
    // Función para limitar gramos y repartir el faltante
    function limitarYRepartir(
      ings: IngredientMacros[],
      gramosPorIng: number,
      macroKey: keyof IngredientMacros,
      grupo: string
    ): { nombre: string; gramos: number; macros: IngredientMacros }[] {
      const result: {
        nombre: string;
        gramos: number;
        macros: IngredientMacros;
      }[] = [];
      // Primer pase: asignar hasta el tope
      for (const i of ings) {
        const macroVal = Number(i[macroKey]) || 1;
        const gramos = Math.min(
          Math.round((gramosPorIng / macroVal) * 100),
          MAX_GRAMOS_INGREDIENTE[i.nombre] || 300
        );
        result.push({ nombre: i.nombre, gramos, macros: i });
        // totalAsignado eliminado (no se usa)
      }
      // Si el total es menor al objetivo, repartir el faltante entre los que no llegaron al tope
      let sumaMacros = result.reduce(
        (acc, ing) =>
          acc + ((Number(ing.macros[macroKey]) || 0) * ing.gramos) / 100,
        0
      );
      const objetivoGrupo = gramosPorIng * ings.length;
      let iter = 0;
      while (sumaMacros < objetivoGrupo && iter < 5) {
        for (const ing of result) {
          const max = MAX_GRAMOS_INGREDIENTE[ing.nombre] || 300;
          if (ing.gramos + 10 <= max) {
            ing.gramos += 10;
            sumaMacros = result.reduce(
              (acc, ing) =>
                acc + ((Number(ing.macros[macroKey]) || 0) * ing.gramos) / 100,
              0
            );
            if (sumaMacros >= objetivoGrupo) break;
          }
        }
        iter++;
      }
      // Si aún así no se llega, dejar como está (mejor realista que forzado)
      return result;
    }

    const ingredientesFinal = [
      ...limitarYRepartir(
        protIngs,
        gramosPorGrupo.prot,
        "proteina",
        "proteína"
      ),
      ...limitarYRepartir(
        verdIngs,
        gramosPorGrupo.verd,
        "carbohidrato",
        "verdura"
      ),
      ...limitarYRepartir(
        frutaIngs,
        gramosPorGrupo.fruta,
        "carbohidrato",
        "fruta"
      ),
      ...limitarYRepartir(grasIngs, gramosPorGrupo.gras, "grasa", "grasa"),
    ];
    // Sumar macros y calorías totales
    let macros = ingredientesFinal.reduce(
      (acc, ing) => ({
        proteina: acc.proteina + (ing.macros.proteina * ing.gramos) / 100,
        carbohidrato:
          acc.carbohidrato + (ing.macros.carbohidrato * ing.gramos) / 100,
        grasa: acc.grasa + (ing.macros.grasa * ing.gramos) / 100,
      }),
      { proteina: 0, carbohidrato: 0, grasa: 0 }
    );
    let calorias = ingredientesFinal.reduce(
      (acc, ing) => acc + (ing.macros.kcal * ing.gramos) / 100,
      0
    );
    // Ajuste final: si la suma de calorías es menor al objetivo, repartir el faltante proporcionalmente
    const objetivoCalorias = tdee / comidasLabels.length;
    if (calorias < objetivoCalorias - 10) {
      const faltante = objetivoCalorias - calorias;
      const sumaKcal = ingredientesFinal.reduce(
        (acc, ing) => acc + (ing.macros.kcal * ing.gramos) / 100,
        0
      );
      ingredientesFinal.forEach((ing) => {
        const prop = (ing.macros.kcal * ing.gramos) / 100 / sumaKcal;
        const extra = Math.floor((faltante * prop) / (ing.macros.kcal / 100));
        const max = MAX_GRAMOS_INGREDIENTE[ing.nombre] || 300;
        ing.gramos = Math.min(ing.gramos + extra, max);
      });
      // Recalcular macros y calorías
      macros = ingredientesFinal.reduce(
        (acc, ing) => ({
          proteina: acc.proteina + (ing.macros.proteina * ing.gramos) / 100,
          carbohidrato:
            acc.carbohidrato + (ing.macros.carbohidrato * ing.gramos) / 100,
          grasa: acc.grasa + (ing.macros.grasa * ing.gramos) / 100,
        }),
        { proteina: 0, carbohidrato: 0, grasa: 0 }
      );
      calorias = ingredientesFinal.reduce(
        (acc, ing) => acc + (ing.macros.kcal * ing.gramos) / 100,
        0
      );
    }
    return {
      comida,
      ingredientes: ingredientesFinal,
      calorias: Math.round(calorias),
      macros: {
        proteina: Math.round(macros.proteina),
        carbohidrato: Math.round(macros.carbohidrato),
        grasa: Math.round(macros.grasa),
      },
    };
  });
  return menu;
}
