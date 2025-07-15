import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import PeopleConfigurator, {
  PersonConfig,
} from "../components/PeopleConfigurator";

export default function Config() {
  const [people, setPeople] = useState<PersonConfig[]>([]);
  // const [saved, setSaved] = useState(false); // eliminado, no se usa
  const [showModal, setShowModal] = useState(false);
  // Cargar personas desde el backend
  // Cargar personas desde el backend y mantener sincronizado
  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const res = await fetch("/api/config");
        const data = await res.json();
        setPeople(data.people || []);
      } catch {
        setPeople([]);
      }
    };
    fetchPeople();
  }, []);

  // Función para guardar personas, siempre enviando todas las existentes
  interface SavePeopleResponse {
    people?: PersonConfig[];
  }

  const handleSavePeople = async (newPeople: PersonConfig[]): Promise<void> => {
    // Mezclar las personas ya guardadas (people) con las nuevas (newPeople), evitando duplicados por nombre
    const merged: PersonConfig[] = [...people];
    newPeople.forEach((p: PersonConfig) => {
      const idx = merged.findIndex((x: PersonConfig) => x.nombre === p.nombre);
      if (idx !== -1) {
        merged[idx] = p;
      } else {
        merged.push(p);
      }
    });
    setPeople(merged);
    if (typeof window !== "undefined") {
      localStorage.setItem("personasConfig", JSON.stringify(merged));
    }
    await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(merged),
    });
    setShowModal(true);
    // Recargar personas desde backend para mantener sincronía
    const res = await fetch("/api/config");
    const data: SavePeopleResponse = await res.json();
    setPeople(data.people || []);
  };
  return (
    <>
      <Head>
        <title>Configuración | NutriPlanner</title>
      </Head>
      <main className="min-h-screen w-full flex flex-col bg-gray-50 px-2 sm:px-4 md:px-8 lg:px-16 xl:px-32 py-6">
        <h2 className="text-2xl font-bold mb-4 text-green-700">
          Configuración de personas
        </h2>
        <div className="w-full max-w-3xl mx-auto px-0 sm:px-4">
          <PeopleConfigurator
            initialPeople={people}
            onSave={handleSavePeople}
          />
        </div>
        {/* Se eliminó la sección de 'Personas configuradas' para mejor UX */}
        {/* Modal de confirmación */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 max-w-sm w-full text-center relative animate-fade-in">
              <h3 className="text-xl font-bold text-green-700 mb-4">
                ¡Personas guardadas!
              </h3>
              <p className="mb-6 text-green-800">
                La configuración se guardó correctamente.
              </p>
              <Link
                href="/ingredients"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded text-center inline-block"
                onClick={() => setShowModal(false)}
              >
                Siguiente: Ingredientes
              </Link>
              <button
                className="absolute top-2 right-4 text-2xl text-green-700 hover:text-green-900"
                onClick={() => setShowModal(false)}
                aria-label="Cerrar confirmación"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
// (llave extra eliminada)
