import type { GramajeMenuItem } from "../lib/gramajeGenerator";

interface GramajeMenuCardProps {
  menu: GramajeMenuItem[];
}

export default function GramajeMenuCard({ menu }: GramajeMenuCardProps) {
  if (!menu || menu.length === 0) {
    return (
      <div className="text-red-600 font-semibold">
        No se pudo generar menú por gramaje.
      </div>
    );
  }
  return (
    <div className="w-full bg-white rounded-2xl shadow-xl p-4 sm:p-6 mt-4">
      <h3 className="text-2xl font-bold mb-4 text-green-700 flex items-center gap-2">
        <span role="img" aria-label="ingredientes">
          🥗
        </span>
        Menú por gramaje de ingredientes
      </h3>
      <ul className="flex flex-col gap-6">
        {menu.map((item, idx) => (
          <li
            key={idx}
            className="relative bg-green-50 rounded-xl p-4 flex flex-col gap-2 border-l-4 border-green-400 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-bold text-green-800 flex items-center gap-2">
                🍽️ {item.comida}
              </span>
              <span className="ml-auto bg-green-600 text-white text-xs font-bold rounded-full px-3 py-1 shadow">
                {item.calorias} kcal
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mb-1">
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                Proteína: <b>{item.macros.proteina}g</b>
              </span>
              <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">
                Carbs: <b>{item.macros.carbohidrato}g</b>
              </span>
              <span className="bg-pink-100 text-pink-800 text-xs font-semibold px-2 py-1 rounded-full">
                Grasa: <b>{item.macros.grasa}g</b>
              </span>
            </div>
            <div className="overflow-x-auto">
              <ul className="list-disc pl-5 text-xs mt-1 flex flex-col gap-1">
                {item.ingredientes.map((ing, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="font-semibold text-green-900">
                      {ing.nombre}:
                    </span>
                    <span className="font-bold text-gray-700">
                      {ing.gramos}g
                    </span>
                    <span className="text-gray-500">
                      (100g: P {ing.macros.proteina}g, C{" "}
                      {ing.macros.carbohidrato}g, G {ing.macros.grasa}g,{" "}
                      {ing.macros.kcal} kcal)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
