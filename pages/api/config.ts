// Guarda/carga configuración del usuario

import { prisma } from "../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const people = await prisma.person.findMany();
    return res.status(200).json({ people });
  }
  if (req.method === "POST") {
    if (!Array.isArray(req.body)) {
      return res.status(400).json({ error: "Se espera un array de personas" });
    }
    // Para cada persona, si ya existe (por nombre), actualizar, si no, crear
    interface Persona {
      id?: number;
      nombre: string;
      sexo: string;
      edad: number | string;
      peso: number | string;
      estatura: number | string;
      actividad: number | string;
      objetivo: string;
      tdee?: number | string;
    }
    // Obtener todos los ids actuales en la base de datos
    const existingPeople = await prisma.person.findMany();
    const incoming = req.body as Persona[];
    const incomingIds = incoming
      .map((p) => p.id)
      .filter((id) => typeof id === "number");

    // Eliminar personas que ya no están en el array recibido
    for (const dbPerson of existingPeople) {
      if (!incomingIds.includes(dbPerson.id)) {
        await prisma.person.delete({ where: { id: dbPerson.id } });
      }
    }

    // Actualizar o crear personas según id
    for (const p of incoming) {
      // No incluir 'id' en el objeto de actualización para evitar que Prisma intente cambiar el id primario
      const { id, tdee, ...rest } = p;
      const obj: any = {
        ...rest,
        edad: Number(p.edad),
        peso: Number(p.peso),
        estatura: Number(p.estatura),
        actividad: Number(p.actividad),
      };
      if (typeof tdee !== "undefined" && tdee !== null && tdee !== "") {
        obj.tdee = Number(tdee);
      }
      if (typeof p.id === "number") {
        const existing = await prisma.person.findUnique({
          where: { id: p.id },
        });
        if (existing) {
          // Solo actualizar si hay cambios reales
          const keys = Object.keys(obj);
          let changed = false;
          for (const key of keys) {
            if (existing[key as keyof typeof existing] !== obj[key]) {
              changed = true;
              break;
            }
          }
          if (changed) {
            await prisma.person.update({ where: { id: p.id }, data: obj });
          }
        } else {
          // Eliminar id si existe antes de crear
          const { id, ...objWithoutId } = obj;
          await prisma.person.create({ data: objWithoutId });
        }
      } else {
        // Eliminar id si existe antes de crear
        const { id, ...objWithoutId } = obj;
        await prisma.person.create({ data: objWithoutId });
      }
    }
    return res.status(200).json({ ok: true });
  }
  return res.status(405).json({ error: "Método no permitido" });
  // (llave extra eliminada)
}
