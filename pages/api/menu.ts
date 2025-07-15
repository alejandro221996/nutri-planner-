// Genera un menú diario según configuraciones

import type { NextApiRequest, NextApiResponse } from "next";
import { generateMenu } from "../../lib/menuGenerator";
import { prisma } from "../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }
  const { personId, tdee, ingredientes, excluidos, comidas, soloComida } =
    req.body;
  if (
    !personId ||
    !tdee ||
    !Array.isArray(ingredientes) ||
    !Array.isArray(excluidos) ||
    !comidas
  ) {
    return res.status(400).json({ error: "Faltan datos" });
  }
  try {
    // Si soloComida está definido, regenerar solo esa comida
    if (typeof soloComida === "number") {
      const menuCompleto = generateMenu({
        tdee,
        ingredientes,
        excluidos,
        comidas,
      });
      const menu = [];
      menu[soloComida] = menuCompleto[soloComida];
      return res.status(200).json({ menu });
    }
    // Si no, generar menú completo
    const menu = generateMenu({ tdee, ingredientes, excluidos, comidas });
    // Guardar menú en la base de datos
    await prisma.menu.create({
      data: {
        personId,
        data: menu,
      },
    });
    return res.status(200).json({ menu });
  } catch {
    return res.status(500).json({ error: "Error al generar menú" });
  }
}
