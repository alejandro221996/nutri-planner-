import { useState } from "react";
import GramajeMenuCard from "../components/GramajeMenuCard";

export default function GramajeMenuPage() {
  const [menu, setMenu] = useState([]);
  const [tdee, setTdee] = useState(2000);
  const [comidas, setComidas] = useState(3);
  const [ingredientes, setIngredientes] = useState<string[]>([]);
  const [objetivo, setObjetivo] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerar = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/gramajeMenu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tdee, comidas, ingredientes, objetivo }),
      });
      const data = await res.json();
      if (res.ok) {
        setMenu(data.menu);
      } else {
        setError(data.error || "Error al generar menú");
      }
    } catch {
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center">
      <h1 className="text-2xl font-bold text-green-700 mb-4">
        Menú por gramaje de ingredientes
      </h1>
      <div className="bg-white rounded shadow p-4 mb-6 flex flex-col gap-4 w-full max-w-md">
        <label className="flex flex-col gap-1">
          Calorías objetivo (TDEE):
          <input
            type="number"
            value={tdee}
            onChange={(e) => setTdee(Number(e.target.value))}
            className="border rounded p-3 w-full min-h-[44px] text-base"
          />
        </label>
        <label className="flex flex-col gap-1">
          Número de comidas:
          <select
            value={comidas}
            onChange={(e) => setComidas(Number(e.target.value))}
            className="border rounded p-3 w-full min-h-[44px] text-base"
          >
            <option value={3}>3</option>
            <option value={5}>5</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          Ingredientes permitidos (separa por coma):
          <input
            type="text"
            value={ingredientes.join(", ")}
            onChange={(e) =>
              setIngredientes(
                e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
              )
            }
            className="border rounded p-3 w-full min-h-[44px] text-base"
          />
        </label>
        <label className="flex flex-col gap-1">
          Objetivo:
          <select
            value={objetivo}
            onChange={(e) => setObjetivo(e.target.value)}
            className="border rounded p-3 w-full min-h-[44px] text-base"
          >
            <option value="">Mantener</option>
            <option value="perder_grasa_mantener_musculo">
              Perder grasa mantener músculo
            </option>
            <option value="perder_grasa">Perder grasa</option>
            <option value="ganar_musculo_perder_grasa">
              Ganar músculo y perder grasa
            </option>
            <option value="ganar_musculo">Ganar músculo</option>
          </select>
        </label>
        <button
          onClick={handleGenerar}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-2xl shadow-xl text-lg transition-all mt-4 w-full min-h-[48px]"
          disabled={loading}
        >
          {loading ? "Generando..." : "Generar menú"}
        </button>
      </div>
      {!loading && menu.length > 0 && <GramajeMenuCard menu={menu} />}
      {error && <div className="text-red-600 mt-4">{error}</div>}
    </div>
  );
}
