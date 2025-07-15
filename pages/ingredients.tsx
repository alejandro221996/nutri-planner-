import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import IngredientSelector from "../components/IngredientSelector";
import type { PersonConfig } from "../components/PeopleConfigurator";

export default function Ingredients() {
  const router = useRouter();
  const [people, setPeople] = useState<PersonConfig[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [excluded, setExcluded] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Cargar personas y selección inicial
  useEffect(() => {
    const fetchPeople = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/config");
        const data = await res.json();
        setPeople(data.people || []);
        setSelectedId((data.people && data.people[0]?.id) || null);
      } catch {
        setError("Error al cargar personas");
      } finally {
        setLoading(false);
      }
    };
    fetchPeople();
  }, []);

  // Limpiar saved al cambiar persona
  useEffect(() => {
    setSaved(false);
  }, [selectedId]);

  // Cargar ingredientes permitidos y excluidos de la persona seleccionada
  useEffect(() => {
    const fetchIngredientes = async () => {
      if (!selectedId) return;
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/ingredients?personId=${selectedId}`);
        const data = await res.json();
        setSelected(data.permitidos || data.ingredientes || []);
        setExcluded(data.excluidos || []);
      } catch {
        setError("Error al cargar ingredientes");
      } finally {
        setLoading(false);
      }
    };
    if (selectedId) fetchIngredientes();
  }, [selectedId]);

  return (
    <>
      <Head>
        <title>Ingredientes | NutriPlanner</title>
      </Head>
      <main className="min-h-screen w-full flex flex-col bg-gray-50 px-2 sm:px-4 md:px-8 lg:px-16 xl:px-32 py-6">
        <h2 className="text-2xl font-bold mb-4 text-green-700">
          Selecciona tus ingredientes
        </h2>
        {people.length > 1 && (
          <div className="mb-4">
            <label className="block mb-1 font-medium">
              Selecciona persona:
            </label>
            <select
              className="border rounded p-3 shadow w-full min-h-[44px] text-base"
              value={selectedId || ""}
              onChange={(e) => setSelectedId(Number(e.target.value))}
            >
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>
        )}
        {people.length === 0 && (
          <div className="mb-6 text-center text-red-600">
            No hay personas configuradas.{" "}
            <Link href="/config" className="underline text-green-700">
              Configura primero aquí
            </Link>
            .
          </div>
        )}
        {selectedId && (
          <div className="mb-2 text-green-700 font-semibold">
            Ingredientes para: {people.find((p) => p.id === selectedId)?.nombre}
          </div>
        )}
        {loading && <div className="text-gray-600">Cargando...</div>}
        {error && <div className="text-red-600 mb-4">{error}</div>}
        {!loading && selectedId && (
          <IngredientSelector
            personId={selectedId}
            onSave={async (permitidos, excluidos) => {
              setSelected(permitidos);
              setExcluded(excluidos);
              setSaved(true);
              // Refrescar datos tras guardar
              try {
                const res = await fetch(
                  `/api/ingredients?personId=${selectedId}`
                );
                const data = await res.json();
                setSelected(data.permitidos || data.ingredientes || []);
                setExcluded(data.excluidos || []);
              } catch {}
            }}
            initialSelected={selected}
            initialExcluded={excluded}
          />
        )}
        {/* Modal de confirmación bonito */}
        {saved && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full flex flex-col items-center animate-fade-in">
              <div className="text-green-600 text-4xl mb-2">✔️</div>
              <div className="text-xl font-bold mb-2 text-green-800 text-center">
                ¡Ingredientes guardados!
              </div>
              <div className="text-gray-600 mb-6 text-center">
                Tus ingredientes fueron guardados correctamente.
                <br />
                ¿Qué deseas hacer ahora?
              </div>
              <div className="flex flex-col gap-3 w-full">
                <button
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-2xl shadow-xl text-lg transition-all w-full min-h-[48px]"
                  onClick={() => router.push("/summary")}
                >
                  Ir al resumen
                </button>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl text-center transition-all"
                  onClick={() => router.push("/menu")}
                >
                  Generar menú
                </button>
                <button
                  className="mt-2 text-gray-400 hover:text-gray-600 text-xs underline"
                  onClick={() => setSaved(false)}
                >
                  Seguir editando ingredientes
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
