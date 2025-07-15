// Calcula el TDEE para una persona
import type { NextApiRequest, NextApiResponse } from "next";
import { calculateTDEE } from "../../lib/tdeeCalculator";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }
  const { sexo, edad, peso, estatura, actividad, objetivo } = req.body;
  if (!sexo || !edad || !peso || !estatura || !actividad || !objetivo) {
    return res.status(400).json({ error: "Faltan datos" });
  }
  try {
    const tdee = calculateTDEE({
      sexo,
      edad,
      peso,
      estatura,
      actividad,
      objetivo,
    });
    return res.status(200).json({ tdee });
  } catch {
    return res.status(500).json({ error: "Error al calcular TDEE" });
  }
}
