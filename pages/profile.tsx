import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";

interface Person {
  id: number;
  nombre: string;
  sexo: string;
  edad: number;
  peso: number;
  estatura: number;
  actividad: number;
  objetivo: string;
  tdee?: number;
}

export default function Profile() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPeople = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/config");
        const data = await res.json();
        setPeople(data.people || []);
      } catch {
        setError("Error al cargar personas");
      } finally {
        setLoading(false);
      }
    };
    fetchPeople();
  }, []);

  return (
    <>
      <Head>
        <title>Resumen de Personas | NutriPlanner</title>
      </Head>
      <main className="min-h-screen bg-gray-50 w-full px-2 sm:px-4 md:px-8 lg:px-16 xl:px-32 py-6 flex flex-col">
        <h1 className="text-3xl font-bold text-green-700 mb-6">
          Resumen de Personas
        </h1>
        {loading ? (
          <div className="text-green-700 font-semibold">Cargando...</div>
        ) : error ? (
          <div className="text-red-600 font-semibold">{error}</div>
        ) : people.length === 0 ? (
          <div className="text-gray-600">No hay personas configuradas.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 gap-y-8 w-full max-w-4xl">
            {people.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl shadow p-6 sm:p-8 border border-green-100 flex flex-col gap-2"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">👤</span>
                  <span className="font-bold text-lg text-green-800">
                    {p.nombre}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-gray-700">
                  <span>
                    <b>Sexo:</b> {p.sexo}
                  </span>
                  <span>
                    <b>Edad:</b> {p.edad} años
                  </span>
                  <span>
                    <b>Peso:</b> {p.peso} kg
                  </span>
                  <span>
                    <b>Estatura:</b> {p.estatura} cm
                  </span>
                  <span>
                    <b>Actividad:</b> {p.actividad}
                  </span>
                </div>
                <div className="mt-2">
                  <span className="font-semibold text-green-700">
                    Objetivo:
                  </span>{" "}
                  {p.objetivo.replace(/_/g, " ")}
                </div>
                <div className="mt-2">
                  <span className="font-semibold text-green-700">TDEE:</span>{" "}
                  {p.tdee ? (
                    `${p.tdee} kcal`
                  ) : (
                    <span className="text-gray-400">No calculado</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <Link
          href="/config"
          className="mt-8 text-green-700 hover:underline font-semibold"
        >
          Editar personas
        </Link>
      </main>
    </>
  );
}
