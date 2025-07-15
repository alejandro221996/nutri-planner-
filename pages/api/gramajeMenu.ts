import type { NextApiRequest, NextApiResponse } from "next";
import { generateGramajeMenu } from "../../lib/gramajeGenerator";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }
  const { tdee, ingredientes, comidas, objetivo } = req.body;
  if (!tdee || !Array.isArray(ingredientes) || !comidas) {
    return res.status(400).json({ error: "Faltan datos" });
  }
  try {
    const menu = generateGramajeMenu({ tdee, ingredientes, comidas, objetivo });
    return res.status(200).json({ menu });
  } catch (e) {
    return res.status(500).json({ error: "Error al generar menú por gramaje" });
  }
}
