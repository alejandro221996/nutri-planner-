import { useEffect, useState, useCallback } from "react";
// import { macrosToKcal, macrosPercent } from "../utils/macrosUtils";
import { RECETAS, EQUIVALENCIAS } from "../lib/data";
import { useRouter } from "next/router";
import { MenuItem } from "../types/MenuItem";

interface MenuCardProps {
  menu: MenuItem[];
  onRegenerarComida?: (idx: number) => void;
  regenerandoIdx?: number | null;
}

export default function MenuCard({
  menu,
  onRegenerarComida,
  regenerandoIdx,
}: MenuCardProps) {
  const [swapIdx, setSwapIdx] = useState<number | null>(null);
  const [recetasCompatibles, setRecetasCompatibles] = useState<typeof RECETAS>(
    []
  );
  const [menuEdit, setMenuEdit] = useState<MenuItem[]>(menu);
  const totalCalorias = menuEdit.reduce((acc, item) => acc + item.calorias, 0);
  const totalMacros = menuEdit.reduce(
    (acc: { proteina: number; carbohidrato: number; grasa: number }, item) => {
      if (item.macros) {
        acc.proteina += item.macros.proteina || 0;
        acc.carbohidrato += item.macros.carbohidrato || 0;
        acc.grasa += item.macros.grasa || 0;
      }
      return acc;
    },
    { proteina: 0, carbohidrato: 0, grasa: 0 }
  );
  //   const macrosPorcentaje = macrosPercent(totalMacros);
  //   const kcalMacros = macrosToKcal(totalMacros);
  const router = useRouter();
  const [ajustando, setAjustando] = useState(false);
  const objetivoKcal = menu.reduce((acc, item) => acc + item.calorias, 0);
  const desviacion =
    objetivoKcal > 0
      ? ((totalCalorias - objetivoKcal) / objetivoKcal) * 100
      : 0;
  const ajustarMenu = useCallback(async () => {
    setAjustando(true);
    try {
      await router.replace(router.asPath);
    } finally {
      setAjustando(false);
    }
  }, [router]);
  const [historial, setHistorial] = useState<MenuItem[][]>(() => {
    if (typeof window !== "undefined") {
      const hist = localStorage.getItem("historialMenus");
      return hist ? JSON.parse(hist) : [];
    }
    return [];
  });
  const [feedback, setFeedback] = useState<
    Record<string, "like" | "dislike" | undefined>
  >(() => {
    if (typeof window !== "undefined") {
      const fb = localStorage.getItem("feedbackMenus");
      return fb ? JSON.parse(fb) : {};
    }
    return {};
  });
  // Usar identificador único para favoritos, bloqueados y feedback: receta + comida
  const [favoritos, setFavoritos] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const fav = localStorage.getItem("favoritos");
      return fav ? JSON.parse(fav) : [];
    }
    return [];
  });
  const [bloqueados, setBloqueados] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const bloq = localStorage.getItem("bloqueados");
      return bloq ? JSON.parse(bloq) : [];
    }
    return [];
  });
  useEffect(() => {
    setMenuEdit(menu);
    if (menu && menu.length > 0) {
      setHistorial((prev) => {
        const igual =
          prev.length > 0 &&
          JSON.stringify(prev[prev.length - 1]) === JSON.stringify(menu);
        if (!igual) {
          const nuevo = [...prev, menu];
          if (typeof window !== "undefined") {
            localStorage.setItem("historialMenus", JSON.stringify(nuevo));
          }
          return nuevo;
        }
        return prev;
      });
    }
  }, [menu]);
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("feedbackMenus", JSON.stringify(feedback));
    }
  }, [feedback]);
  const exportarPDF = async () => {
    const mod = await import("jspdf");
    const doc = new mod.jsPDF();
    doc.setFontSize(16);
    doc.text("Menú Nutricional", 10, 15);
    let y = 25;
    menuEdit.forEach((item) => {
      doc.setFontSize(12);
      doc.text(
        `${item.comida}: ${item.receta} (${Math.round(item.calorias)} kcal)`,
        10,
        y
      );
      y += 7;
      if (item.macros) {
        doc.text(
          `Proteína: ${item.macros.proteina}g | Carbs: ${item.macros.carbohidrato}g | Grasa: ${item.macros.grasa}g`,
          12,
          y
        );
        y += 6;
      }
      if (item.ingredientes && item.ingredientes.length > 0) {
        doc.setFontSize(10);
        doc.text(`Ingredientes: ${item.ingredientes.join(", ")}`, 14, y);
        y += 6;
      }
    });
    y += 5;
    doc.setFontSize(11);
    doc.text(
      `Totales: ${Math.round(totalCalorias)} kcal | Proteína: ${
        totalMacros.proteina
      }g | Carbs: ${totalMacros.carbohidrato}g | Grasa: ${totalMacros.grasa}g`,
      10,
      y
    );
    doc.save("menu_nutricional.pdf");
  };
  const imprimirMenu = () => {
    window.print();
  };
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("favoritos", JSON.stringify(favoritos));
    }
  }, [favoritos]);
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("bloqueados", JSON.stringify(bloqueados));
    }
  }, [bloqueados]);
  const getMenuItemId = (receta: string, comida: string) =>
    `${receta}__${comida}`;
  const toggleFavorito = (receta: string, comida: string) => {
    const id = getMenuItemId(receta, comida);
    setFavoritos((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };
  const toggleBloqueado = (receta: string, comida: string) => {
    const id = getMenuItemId(receta, comida);
    setBloqueados((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };
  const buscarCompatibles = (item: MenuItem) => {
    setRecetasCompatibles(
      RECETAS.filter(
        (receta) =>
          receta.nombre !== item.receta && !bloqueados.includes(receta.nombre)
      )
    );
  };
  const recomendaciones: Record<string, string> = {
    mantener:
      "¡Buen trabajo! Mantén tu ingesta y actividad para conservar tu composición corporal.",
    perder_grasa_mantener_musculo:
      "Déficit moderado y proteína alta ayudan a perder grasa sin sacrificar músculo.",
    perder_grasa:
      "Déficit alto: prioriza saciedad y micronutrientes. No prolongar por mucho tiempo.",
    ganar_musculo_perder_grasa:
      "Recomposición: combina fuerza y proteína, progreso más lento pero sostenible.",
    ganar_musculo:
      "Superávit y proteína suficiente favorecen el crecimiento muscular. Prioriza entrenamiento de fuerza.",
  };
  const objetivo = (menu.length > 0 && menu[0].objetivo) || undefined;

  // Render funcional del menú
  return (
    <div className="w-full bg-white rounded shadow p-4 mt-4">
      <h3 className="text-xl font-bold mb-2 text-green-700">Tu menú</h3>
      <div className="flex gap-2 mb-2">
        <button
          className="text-xs px-3 py-1 rounded-lg bg-gradient-to-r from-green-100 to-green-200 border border-green-300 shadow-sm hover:from-green-200 hover:to-green-300 hover:shadow-md transition-all font-semibold text-green-800"
          onClick={exportarPDF}
        >
          Exportar PDF
        </button>
        <button
          className="text-xs px-3 py-1 rounded-lg bg-gradient-to-r from-blue-100 to-blue-200 border border-blue-300 shadow-sm hover:from-blue-200 hover:to-blue-300 hover:shadow-md transition-all font-semibold text-blue-800"
          onClick={imprimirMenu}
        >
          Imprimir
        </button>
        <details className="ml-auto">
          <summary className="cursor-pointer text-xs text-blue-600">
            Historial
          </summary>
          <ul className="bg-white border border-gray-200 rounded mt-1 max-h-40 overflow-y-auto text-xs">
            {historial.length === 0 && (
              <li className="p-2 text-gray-400">Sin historial</li>
            )}
            {historial.map((h, i) => (
              <li
                key={i}
                className="p-2 border-b last:border-b-0 flex items-center gap-2"
              >
                <span>Menú #{i + 1}</span>
                <button
                  className="text-blue-500 underline"
                  onClick={() => setMenuEdit(h)}
                >
                  Ver
                </button>
                <button
                  className="text-green-500 underline"
                  onClick={() => {
                    setMenuEdit(h);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Repetir
                </button>
                <button
                  className="text-red-400 ml-2"
                  onClick={() => {
                    setHistorial(historial.filter((_, j) => j !== i));
                    if (typeof window !== "undefined")
                      localStorage.setItem(
                        "historialMenus",
                        JSON.stringify(historial.filter((_, j) => j !== i))
                      );
                  }}
                >
                  🗑️
                </button>
              </li>
            ))}
          </ul>
        </details>
      </div>
      <ul className="divide-y divide-gray-200">
        {menuEdit.map((item, idx) => (
          <li key={idx} className="py-2 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-800">{item.comida}</span>
              <div className="flex gap-1 items-center">
                <button
                  className={`text-yellow-500 text-lg focus:outline-none ${
                    favoritos.includes(getMenuItemId(item.receta, item.comida))
                      ? ""
                      : "opacity-40"
                  }`}
                  title={
                    favoritos.includes(getMenuItemId(item.receta, item.comida))
                      ? "Quitar de favoritos"
                      : "Marcar como favorito"
                  }
                  onClick={() => toggleFavorito(item.receta, item.comida)}
                  aria-label="Favorito"
                >
                  ★
                </button>
                <button
                  className={`text-red-500 text-lg focus:outline-none ${
                    bloqueados.includes(getMenuItemId(item.receta, item.comida))
                      ? ""
                      : "opacity-40"
                  }`}
                  title={
                    bloqueados.includes(getMenuItemId(item.receta, item.comida))
                      ? "Desbloquear"
                      : "Bloquear este platillo"
                  }
                  onClick={() => toggleBloqueado(item.receta, item.comida)}
                  aria-label="Bloquear"
                >
                  ⛔
                </button>
                <button
                  className={`text-green-500 text-lg focus:outline-none ${
                    feedback[getMenuItemId(item.receta, item.comida)] === "like"
                      ? ""
                      : "opacity-40"
                  }`}
                  title={
                    feedback[getMenuItemId(item.receta, item.comida)] === "like"
                      ? "Te gusta"
                      : "Me gusta"
                  }
                  onClick={() =>
                    setFeedback((fb) => {
                      const id = getMenuItemId(item.receta, item.comida);
                      return {
                        ...fb,
                        [id]: fb[id] === "like" ? undefined : "like",
                      };
                    })
                  }
                  aria-label="Me gusta"
                >
                  👍
                </button>
                <button
                  className={`text-pink-500 text-lg focus:outline-none ${
                    feedback[getMenuItemId(item.receta, item.comida)] ===
                    "dislike"
                      ? ""
                      : "opacity-40"
                  }`}
                  title={
                    feedback[getMenuItemId(item.receta, item.comida)] ===
                    "dislike"
                      ? "No te gusta"
                      : "No me gusta"
                  }
                  onClick={() =>
                    setFeedback((fb) => {
                      const id = getMenuItemId(item.receta, item.comida);
                      return {
                        ...fb,
                        [id]: fb[id] === "dislike" ? undefined : "dislike",
                      };
                    })
                  }
                  aria-label="No me gusta"
                >
                  👎
                </button>
                <button
                  className="text-xs px-3 py-1 rounded-lg bg-gradient-to-r from-blue-100 to-blue-200 border border-blue-300 shadow-sm hover:from-blue-200 hover:to-blue-300 hover:shadow-md transition-all font-semibold text-blue-700"
                  title="Intercambiar por otro platillo compatible"
                  onClick={() => {
                    setSwapIdx(idx);
                    buscarCompatibles(item);
                  }}
                >
                  Intercambiar
                </button>
                {onRegenerarComida && (
                  <button
                    className={`ml-2 text-xs px-3 py-1 rounded-lg bg-gradient-to-r from-green-100 to-green-200 border border-green-300 shadow-sm hover:from-green-200 hover:to-green-300 hover:shadow-md transition-all font-semibold text-green-700 ${
                      regenerandoIdx === idx ? "opacity-60 cursor-wait" : ""
                    }`}
                    onClick={() => onRegenerarComida(idx)}
                    disabled={regenerandoIdx === idx}
                    title="Regenerar solo esta comida"
                  >
                    {regenerandoIdx === idx ? "Regenerando..." : "Regenerar"}
                  </button>
                )}
              </div>
            </div>
            <span className="text-gray-600">{item.receta}</span>
            <span className="text-sm text-green-700">
              {Math.round(item.calorias)} kcal
            </span>
            {item.macros && (
              <span className="text-xs text-gray-600 mt-1">
                Proteína: <b>{item.macros.proteina}g</b> | Carbs:{" "}
                <b>{item.macros.carbohidrato}g</b> | Grasa:{" "}
                <b>{item.macros.grasa}g</b>
              </span>
            )}
            {item.ingredientes && item.ingredientes.length > 0 && (
              <details className="text-xs mt-1">
                <summary className="cursor-pointer text-blue-600">
                  Ver ingredientes y equivalencias
                </summary>
                <ul className="ml-4 list-disc">
                  {item.ingredientes.map((ing: string, i: number) => (
                    <li key={i}>
                      {ing}
                      {EQUIVALENCIAS &&
                        EQUIVALENCIAS[ing] &&
                        EQUIVALENCIAS[ing].length > 0 && (
                          <span className="ml-2 text-gray-500">
                            (Equiv: {EQUIVALENCIAS[ing].join(", ")})
                          </span>
                        )}
                    </li>
                  ))}
                </ul>
              </details>
            )}
            {swapIdx === idx && (
              <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                <div className="bg-white rounded shadow-lg p-4 max-w-xs w-full relative">
                  <div className="font-bold mb-2">
                    Elige un platillo compatible
                  </div>
                  <button
                    className="absolute top-2 right-4 text-gray-500"
                    onClick={() => setSwapIdx(null)}
                  >
                    ✕
                  </button>
                  <ul className="max-h-60 overflow-y-auto">
                    {recetasCompatibles.length === 0 && (
                      <li className="text-gray-500">No hay compatibles</li>
                    )}
                    {recetasCompatibles.map(
                      (r: (typeof RECETAS)[number], i: number) => (
                        <li
                          key={r.nombre}
                          className="py-1 flex justify-between items-center border-b last:border-b-0"
                        >
                          <span>{r.nombre}</span>
                          <button
                            className="ml-2 text-xs px-2 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300"
                            onClick={() => {
                              const nuevoMenu = [...menuEdit];
                              nuevoMenu[idx] = {
                                ...nuevoMenu[idx],
                                receta: r.nombre,
                                calorias: r.calorias,
                                macros: r.macros,
                                ingredientes: r.ingredientes,
                              };
                              setMenuEdit(nuevoMenu);
                              setSwapIdx(null);
                            }}
                          >
                            Seleccionar
                          </button>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      {desviacion !== 0 && (
        <div className="mt-2 p-2 rounded bg-yellow-100 border border-yellow-300 text-yellow-800 text-sm flex items-center gap-2">
          ⚠️ El menú se desvía {desviacion > 0 ? "por arriba" : "por abajo"} del
          objetivo calórico en {desviacion.toFixed(1)}%.
          <button
            className="ml-2 px-2 py-1 rounded bg-yellow-200 border border-yellow-400 text-yellow-900 text-xs hover:bg-yellow-300 disabled:opacity-60"
            onClick={ajustarMenu}
            disabled={ajustando}
          >
            {ajustando ? "Ajustando..." : "Ajustar menú"}
          </button>
        </div>
      )}
      {objetivo && recomendaciones[objetivo] && (
        <div className="mt-3 text-sm text-green-700 border-t pt-2">
          <b>Recomendación:</b> {recomendaciones[objetivo]}
        </div>
      )}
    </div>
  );
}
