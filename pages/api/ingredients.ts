// Guarda/carga ingredientes permitidos
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const personId =
    req.method === "GET" ? req.query.personId : req.body.personId;
  if (!personId) {
    return res.status(400).json({ error: "Falta personId" });
  }
  const id = typeof personId === "string" ? parseInt(personId, 10) : personId;

  if (req.method === "GET") {
    const person = await prisma.person.findUnique({ where: { id } });
    if (!person)
      return res.status(404).json({ error: "Persona no encontrada" });
    // Soportar permitidos y excluidos
    return res.status(200).json({
      permitidos: person.ingredientes || [],
      excluidos: person.excluidos || [],
    });
  }
  if (req.method === "POST") {
    const { permitidos, excluidos } = req.body;
    if (!Array.isArray(permitidos) || !Array.isArray(excluidos)) {
      return res.status(400).json({ error: "Formato inválido" });
    }
    await prisma.person.update({
      where: { id },
      data: { ingredientes: permitidos, excluidos },
    });
    return res.status(200).json({ ok: true });
  }
  return res.status(405).json({ error: "Método no permitido" });
}
