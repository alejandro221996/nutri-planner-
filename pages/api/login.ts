// Simple API route para validar la contraseña global
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { password } = req.body;
  // La contraseña real debe estar en variable de entorno
  const realPassword = process.env.NUTRI_APP_PASSWORD;
  if (password === realPassword) {
    return res.status(200).json({ ok: true });
  }
  return res.status(401).json({ error: "Contraseña incorrecta" });
}
