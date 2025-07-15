import { useEffect, useState } from "react";
import { ALIMENTOS } from "../lib/data";

const CATEGORIAS = [
  { key: "proteína", label: "Proteínas", color: "bg-green-100", icon: "🍗" },
  {
    key: "carbohidrato",
    label: "Carbohidratos",
    color: "bg-yellow-100",
    icon: "🍞",
  },
  {
    key: "grasa",
    label: "Grasas saludables",
    color: "bg-orange-100",
    icon: "🥑",
  },
  { key: "fruta", label: "Frutas", color: "bg-pink-100", icon: "🍎" },
  { key: "verdura", label: "Verduras", color: "bg-lime-100", icon: "🥦" },
  { key: "lácteo", label: "Lácteos", color: "bg-blue-100", icon: "🥛" },
];

interface IngredientSelectorProps {
  personId: number;
  onSave?: (permitidos: string[], excluidos: string[]) => void;
  initialSelected?: string[];
  initialExcluded?: string[];
}

export default function IngredientSelector({
  personId,
  onSave,
  initialSelected = [],
  initialExcluded = [],
}: IngredientSelectorProps) {
  const [permitidos, setPermitidos] = useState<string[]>(initialSelected);
  const [excluidos, setExcluidos] = useState<string[]>(initialExcluded);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Inicializar permitidos/excluidos desde props (base de datos)
  useEffect(() => {
    setPermitidos(initialSelected);
    setExcluidos(initialExcluded);
  }, [initialSelected, initialExcluded, personId]);

  // Guardar cambios por persona
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        `permitidos_${personId}`,
        JSON.stringify(permitidos)
      );
      localStorage.setItem(`excluidos_${personId}`, JSON.stringify(excluidos));
    }
  }, [permitidos, excluidos, personId]);

  const togglePermitido = (ing: string) => {
    setPermitidos((prev) =>
      prev.includes(ing) ? prev.filter((i) => i !== ing) : [...prev, ing]
    );
    // Si se marca como permitido, se quita de excluidos
    setExcluidos((prev) => prev.filter((i) => i !== ing));
  };
  const toggleExcluido = (ing: string) => {
    setExcluidos((prev) =>
      prev.includes(ing) ? prev.filter((i) => i !== ing) : [...prev, ing]
    );
    // Si se marca como excluido, se quita de permitidos
    setPermitidos((prev) => prev.filter((i) => i !== ing));
  };

  const handleSave = async () => {
    if (permitidos.length === 0) {
      setError("Selecciona al menos un ingrediente permitido");
      return;
    }
    setError("");
    setSaving(true);
    await fetch("/api/ingredients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ personId, permitidos, excluidos }),
    });
    setSaving(false);
    if (onSave) onSave(permitidos, excluidos);
    // Navegación eliminada: usar Link o props para avanzar
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-6 text-green-700 text-center">
        Configura tus ingredientes permitidos y excluidos
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {CATEGORIAS.map((cat) => {
          // Filtrar ingredientes por tipo de categoría
          const ingredientesCat = ALIMENTOS.filter((a) => a.tipo === cat.key);
          if (ingredientesCat.length === 0) return null;
          return (
            <div
              key={cat.key}
              className={`rounded-2xl p-6 shadow-lg ${cat.color} mb-6 transition-all`}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{cat.icon}</span>
                <span className="font-bold text-green-800 text-lg">
                  {cat.label}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {ingredientesCat.map((ingObj) => {
                  const ing = ingObj.nombre;
                  const isPermitido = permitidos.includes(ing);
                  const isExcluido = excluidos.includes(ing);
                  return (
                    <button
                      key={ing}
                      type="button"
                      className={`flex items-center gap-2 px-4 py-1 rounded-full border text-sm font-semibold transition-all focus:outline-green-700 shadow-md
                        ${
                          isPermitido
                            ? "bg-green-600 text-white border-green-600 scale-105"
                            : isExcluido
                            ? "bg-red-200 text-red-700 border-red-300 line-through opacity-60"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-green-100"
                        }
                      `}
                      onClick={() => {
                        if (isPermitido) togglePermitido(ing);
                        else if (isExcluido) toggleExcluido(ing);
                        else togglePermitido(ing);
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        if (isExcluido) toggleExcluido(ing);
                        else toggleExcluido(ing);
                      }}
                      aria-label={
                        isPermitido
                          ? `Quitar ${ing} de permitidos`
                          : isExcluido
                          ? `Quitar ${ing} de excluidos`
                          : `Agregar ${ing} a permitidos`
                      }
                    >
                      <span className="inline-block w-5 text-lg">
                        {isPermitido ? (
                          <span title="Permitido" className="align-middle">
                            ✔️
                          </span>
                        ) : isExcluido ? (
                          <span title="Excluido" className="align-middle">
                            ❌
                          </span>
                        ) : (
                          <span className="opacity-30 align-middle">○</span>
                        )}
                      </span>
                      <span>{ing}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <div className="flex justify-center mt-10">
        <button
          type="button"
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-2xl shadow-xl focus:outline-green-700 text-lg transition-all"
          disabled={saving}
          onClick={handleSave}
          aria-label="Guardar selección de ingredientes"
        >
          {saving ? "Guardando..." : "Guardar ingredientes"}
        </button>
      </div>
      <div className="mt-6 text-xs text-gray-500 text-center">
        Los ingredientes excluidos no aparecerán en tus menús.
        <br />
        Los permitidos serán priorizados en la generación.
      </div>
    </div>
  );
}
