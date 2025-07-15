import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import GramajeMenuCard from "../components/GramajeMenuCard";
import type { GramajeMenuItem } from "../lib/gramajeGenerator";
import type { PersonConfig } from "../components/PeopleConfigurator";

export default function Menu() {
  // Declarar todos los estados primero
  const [menu, setMenu] = useState<GramajeMenuItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [people, setPeople] = useState<PersonConfig[]>([]);
  const [regenerandoIdx, setRegenerandoIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ingredientes, setIngredientes] = useState<string[]>([]);
  const [excluidos, setExcluidos] = useState<string[]>([]);
  const [comidas, setComidas] = useState<number>(3);

  // Cargar personas y config inicial
  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      setError("");
      try {
        const configRes = await fetch("/api/config");
        const config = await configRes.json();
        setPeople(config.people || []);
        setComidas(config.comidas || 3);
        setSelectedId((config.people && config.people[0]?.id) || null);
      } catch {
        setError("Error de red al cargar configuración");
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  // Cargar ingredientes permitidos y excluidos de la persona seleccionada
  useEffect(() => {
    if (!selectedId) {
      setIngredientes([]);
      setExcluidos([]);
      setMenu([]);
      return;
    }
    setLoading(true);
    setError("");
    const fetchIngredientes = async () => {
      try {
        const ingrRes = await fetch(`/api/ingredients?personId=${selectedId}`);
        const ingrData = await ingrRes.json();
        setIngredientes(ingrData.permitidos || ingrData.ingredientes || []);
        setExcluidos(ingrData.excluidos || []);
        // Si no hay ingredientes, limpiar menú
        if (
          !(
            ingrData.permitidos?.length > 0 || ingrData.ingredientes?.length > 0
          )
        ) {
          setMenu([]);
        }
      } catch {
        setError("Error al cargar ingredientes de la persona");
        setMenu([]);
      } finally {
        setLoading(false);
      }
    };
    fetchIngredientes();
  }, [selectedId]);
  // Cargar/generar menú al seleccionar persona
  useEffect(() => {
    const fetchMenu = async () => {
      if (!selectedId || ingredientes.length === 0) return;
      setLoading(true);
      setError("");
      try {
        // Buscar menú existente para la persona
        const res = await fetch(`/api/person/${selectedId}/menu`);
        if (res.ok) {
          const data = await res.json();
          if (data.menu && data.menu.length > 0) {
            setMenu(data.menu);
            setLoading(false);
            return;
          }
        }
        // Si no hay menú, generarlo
        const person = people.find((p) => p.id === selectedId);
        if (!person || !person.tdee) {
          setError("No se encontró la persona o su TDEE");
          setLoading(false);
          return;
        }
        const genRes = await fetch("/api/gramajeMenu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            personId: selectedId,
            tdee: person.tdee,
            ingredientes,
            excluidos,
            comidas,
          }),
        });
        const genData = await genRes.json();
        if (genRes.ok) {
          setMenu(genData.menu);
        } else {
          setError(genData.error || "Error al generar menú");
        }
      } catch {
        setError("Error de red al obtener menú");
      } finally {
        setLoading(false);
      }
    };
    if (selectedId && ingredientes.length > 0) {
      fetchMenu();
    }
  }, [selectedId, ingredientes, excluidos, comidas, people]);

  // Regenerar solo una comida
  const handleRegenerarComida = async (idx: number) => {
    if (!selectedId) return;
    setRegenerandoIdx(idx);
    setError("");
    try {
      const person = people.find((p) => p.id === selectedId);
      if (!person || !person.tdee) {
        setError("No se encontró la persona o su TDEE");
        setRegenerandoIdx(null);
        return;
      }
      const res = await fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personId: selectedId,
          tdee: person.tdee,
          ingredientes,
          excluidos,
          comidas,
          soloComida: idx,
        }),
      });
      const data = await res.json();
      if (res.ok && data.menu && data.menu.length > 0) {
        setMenu((prev) =>
          prev.map((item, i) => (i === idx ? data.menu[idx] : item))
        );
      } else {
        setError(data.error || "Error al regenerar comida");
      }
    } catch {
      setError("Error de red al regenerar comida");
    } finally {
      setRegenerandoIdx(null);
    }
  };

  // Regenerar todo el menú
  const handleRegenerar = async () => {
    if (!selectedId) return;
    setLoading(true);
    setError("");
    try {
      const person = people.find((p) => p.id === selectedId);
      if (!person || !person.tdee) {
        setError("No se encontró la persona o su TDEE");
        setLoading(false);
        return;
      }
      const res = await fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personId: selectedId,
          tdee: person.tdee,
          ingredientes,
          excluidos,
          comidas,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMenu(data.menu);
      } else {
        setError(data.error || "Error al regenerar menú");
      }
    } catch {
      setError("Error de red al regenerar menú");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Menú generado | NutriPlanner</title>
      </Head>
      <main className="min-h-screen w-full bg-gradient-to-b from-green-50 to-white px-2 sm:px-4 md:px-8 lg:px-16 xl:px-32 py-4">
        <div className="max-w-4xl mx-auto w-full flex flex-col gap-6 items-center justify-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-2 text-green-700 text-center flex items-center justify-center gap-2 w-full">
            <span className="text-3xl sm:text-4xl">🍽️</span>
            <span className="w-full text-center">
              Menú diario generado para:{" "}
              {people.find((p) => p.id === selectedId)?.nombre}
            </span>
          </h2>
          {/* Selector de persona */}
          <div className="mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2 w-full items-center">
            <label className="block font-medium text-green-800 text-base sm:text-lg text-center sm:text-left w-full sm:w-auto">
              Selecciona persona:
            </label>
            <select
              className="border rounded-xl p-3 shadow w-full sm:w-auto min-h-[44px] text-base focus:ring-2 focus:ring-green-400"
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
          {/* Ingredientes permitidos/excluidos */}
          {selectedId && (
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4 w-full items-center">
              <div className="text-xs sm:text-sm text-green-700 bg-green-100 rounded-xl px-3 py-2 shadow-sm text-center w-full sm:w-auto">
                <b>Permitidos:</b>{" "}
                {ingredientes.length > 0 ? (
                  <span className="break-words">{ingredientes.join(", ")}</span>
                ) : (
                  <span className="text-gray-400">Ninguno</span>
                )}
              </div>
              <div className="text-xs sm:text-sm text-red-700 bg-red-100 rounded-xl px-3 py-2 shadow-sm text-center w-full sm:w-auto">
                <b>Excluidos:</b>{" "}
                {excluidos.length > 0 ? (
                  <span className="break-words">{excluidos.join(", ")}</span>
                ) : (
                  <span className="text-gray-400">Ninguno</span>
                )}
              </div>
            </div>
          )}
          {loading && (
            <div className="text-gray-600 text-center text-lg py-8 animate-pulse">
              Generando menú...
            </div>
          )}
          {error && (
            <div className="text-red-600 mb-4 text-center text-lg font-semibold">
              {error}
            </div>
          )}
          {!loading && !error && menu.length > 0 && (
            <div className="flex w-full flex-col gap-6">
              {menu.map((item, idx) => (
                <div
                  key={idx}
                  className="mb-2 bg-white rounded-2xl shadow-xl p-4 flex flex-col gap-2 border border-green-100"
                >
                  <GramajeMenuCard menu={[item]} />
                  <button
                    onClick={() => handleRegenerarComida(idx)}
                    className={`mt-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-xl shadow text-base transition-all w-full sm:w-auto ${
                      regenerandoIdx === idx
                        ? "opacity-60 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={regenerandoIdx === idx || loading}
                  >
                    {regenerandoIdx === idx
                      ? "Regenerando..."
                      : `🔄 Regenerar esta comida`}
                  </button>
                </div>
              ))}
            </div>
          )}
          {!loading && !error && menu.length === 0 && (
            <div className="text-red-600 font-semibold mt-6 text-center">
              No hay suficientes ingredientes permitidos para generar un menú.
              <br />
              Ajusta tu selección de ingredientes.
            </div>
          )}
          <div className="flex flex-col gap-4 w-full max-w-xs mx-auto mt-10 mb-4">
            <button
              onClick={handleRegenerar}
              className={`bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-2xl shadow-xl text-lg transition-all w-full min-h-[48px] ${
                loading ? "opacity-60 cursor-not-allowed" : ""
              }`}
              disabled={loading || !selectedId}
            >
              {loading ? "Regenerando..." : "Regenerar menú completo"}
            </button>
            <Link
              href="/config"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 px-8 rounded-2xl shadow text-center transition-all w-full min-h-[48px]"
            >
              Ajustar configuración
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
