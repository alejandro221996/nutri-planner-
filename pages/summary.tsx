import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { PersonConfig } from "../components/PeopleConfigurator";

export default function SummaryPage() {
  const router = useRouter();
  const [people, setPeople] = useState<PersonConfig[]>([]);
  const [personIngredients, setPersonIngredients] = useState<
    Record<number, { permitidos: string[]; excluidos: string[] }>
  >({});
  const [meals, setMeals] = useState<number>(3);

  useEffect(() => {
    // Cargar personas desde la base de datos
    const fetchPeople = async () => {
      const res = await fetch("/api/config");
      const data = await res.json();
      setPeople(data.people || []);
      // Por cada persona, cargar sus ingredientes permitidos/excluidos
      const ingredientsMap: Record<
        number,
        { permitidos: string[]; excluidos: string[] }
      > = {};
      await Promise.all(
        (data.people || []).map(async (p: any) => {
          const resIng = await fetch(`/api/ingredients?personId=${p.id}`);
          const dataIng = await resIng.json();
          ingredientsMap[p.id] = {
            permitidos: dataIng.permitidos || [],
            excluidos: dataIng.excluidos || [],
          };
        })
      );
      setPersonIngredients(ingredientsMap);
    };
    fetchPeople();
    // Cargar número de comidas desde localStorage (opcional)
    const storedMeals = localStorage.getItem("meals");
    if (storedMeals) setMeals(Number(storedMeals));
  }, []);

  const handleGenerateMenu = () => {
    router.push("/menu");
  };

  return (
    <div className="w-full px-2 sm:px-4 md:px-8 lg:px-16 xl:px-32 py-4">
      <h1 className="text-3xl font-extrabold mb-8 text-green-700 flex items-center gap-2">
        <span>📋</span> Resumen de configuración
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 gap-y-8">
        {people.map((p, idx) => (
          <div
            key={p.id}
            className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col gap-2 border-t-4 border-green-400"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">👤</span>
              <span className="font-bold text-lg text-green-800">
                {p.nombre}
              </span>
              <span className="ml-auto text-xs text-gray-400">
                Persona {idx + 1}
              </span>
            </div>
            <div className="text-gray-700 text-sm mb-1">
              <span className="font-semibold">Edad:</span> {p.edad} años
              &nbsp;|&nbsp;
              <span className="font-semibold">Sexo:</span> {p.sexo}{" "}
              &nbsp;|&nbsp;
              <span className="font-semibold">Peso:</span> {p.peso} kg
              &nbsp;|&nbsp;
              <span className="font-semibold">Estatura:</span> {p.estatura} cm
            </div>
            <div className="text-gray-700 text-sm mb-1">
              <span className="font-semibold">Actividad:</span> {p.actividad}{" "}
              &nbsp;|&nbsp;
              <span className="font-semibold">Objetivo:</span> {p.objetivo}
            </div>
            <div className="text-gray-700 text-sm mb-1">
              <span className="font-semibold">TDEE estimado:</span>{" "}
              {p.tdee ? Math.round(p.tdee) : "-"} kcal
            </div>
            <div className="text-gray-700 text-sm mb-2">
              <span className="font-semibold">Comidas:</span> {meals}
            </div>
            <div className="mt-2">
              <h3 className="font-semibold text-green-700 mb-1 flex items-center gap-1">
                <span>✔️</span> Ingredientes permitidos
              </h3>
              <div className="flex flex-wrap gap-2 mb-2">
                {personIngredients[p.id]?.permitidos?.length > 0 ? (
                  personIngredients[p.id].permitidos.map((ing) => (
                    <span
                      key={ing}
                      className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium shadow-sm border border-green-200"
                    >
                      <span className="text-base">✔️</span> {ing}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 italic">No seleccionado</span>
                )}
              </div>
              <h3 className="font-semibold text-red-700 mb-1 flex items-center gap-1">
                <span>❌</span> Ingredientes excluidos
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {personIngredients[p.id]?.excluidos?.length > 0 ? (
                  personIngredients[p.id].excluidos.map((ing) => (
                    <span
                      key={ing}
                      className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium shadow-sm border border-red-200"
                    >
                      <span className="text-base">❌</span> {ing}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 italic">Ninguno</span>
                )}
              </div>
              <div className="flex gap-2 mt-2">
                <Link
                  href={{ pathname: "/config", query: { personId: p.id } }}
                  className="px-4 py-2 bg-gray-100 rounded-xl shadow hover:bg-gray-200 font-semibold text-gray-700 transition-all text-xs"
                >
                  Editar configuración
                </Link>
                <Link
                  href={{ pathname: "/ingredients", query: { personId: p.id } }}
                  className="px-4 py-2 bg-green-100 rounded-xl shadow hover:bg-green-200 font-semibold text-green-700 transition-all text-xs"
                >
                  Editar ingredientes
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-4 mt-10 justify-center">
        <button
          onClick={handleGenerateMenu}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 font-bold transition-all"
        >
          Generar menú
        </button>
      </div>
    </div>
  );
}
