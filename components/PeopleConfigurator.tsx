import { useState } from "react";
import UserForm from "./UserForm";

export interface PersonConfig {
  id: number;
  nombre: string;
  sexo: string;
  edad: string;
  peso: string;
  estatura: string;
  actividad: string;
  objetivo: string; // objetivo avanzado
  tdee?: number;
}

interface PeopleConfiguratorProps {
  onSave: (people: PersonConfig[]) => void;
  initialPeople?: PersonConfig[];
}

export default function PeopleConfigurator({
  onSave,
  initialPeople = [],
}: PeopleConfiguratorProps) {
  const [people, setPeople] = useState<PersonConfig[]>(
    initialPeople.length > 0 ? initialPeople : [getEmptyPerson(1)]
  );
  const [editingIdx, setEditingIdx] = useState<number | null>(0);
  const [error, setError] = useState("");

  function getEmptyPerson(idx: number): PersonConfig {
    return {
      id: idx,
      nombre: `Persona ${idx}`,
      sexo: "",
      edad: "",
      peso: "",
      estatura: "",
      actividad: "",
      objetivo: "",
    };
  }

  const handleAdd = () => {
    setPeople((prev) => [...prev, getEmptyPerson(prev.length + 1)]);
    setEditingIdx(people.length);
  };

  const handleEdit = (idx: number) => setEditingIdx(idx);

  const handleDelete = (idx: number) => {
    setPeople((prev) => prev.filter((_, i) => i !== idx));
    setEditingIdx(null);
  };

  const handleForm = (idx: number, data: Partial<PersonConfig>) => {
    setPeople((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, ...data } : p))
    );
  };

  const handleTDEE = (idx: number, tdee: number) => {
    setPeople((prev) => prev.map((p, i) => (i === idx ? { ...p, tdee } : p)));
  };

  const handleSaveAll = () => {
    if (
      people.some(
        (p) =>
          !p.sexo ||
          !p.edad ||
          !p.peso ||
          !p.estatura ||
          !p.actividad ||
          !p.objetivo ||
          !p.tdee
      )
    ) {
      setError("Completa y calcula el TDEE de todas las personas");
      return;
    }
    setError("");
    onSave(people);
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-8 mb-8">
      <h3 className="text-2xl font-bold mb-6 text-green-700 text-center">
        Personas
      </h3>
      {/* Chips de personas configuradas */}
      <div className="flex flex-wrap gap-3 mb-8 justify-center">
        {people.map((p, idx) => (
          <button
            key={idx}
            type="button"
            className={`flex items-center gap-2 px-4 py-2 rounded-full shadow text-green-800 font-semibold border-2 border-green-300 bg-green-50 hover:bg-green-100 transition-all focus:outline-green-700 ${
              editingIdx === idx ? "ring-2 ring-green-500" : ""
            }`}
            onClick={() => handleEdit(idx)}
            aria-label={`Editar datos de ${p.nombre}`}
          >
            <span>{p.nombre}</span>
            {p.tdee && (
              <span className="text-xs text-green-600 font-bold">
                {p.tdee} kcal
              </span>
            )}
            {people.length > 1 && (
              <span
                className="ml-2 text-red-500 cursor-pointer hover:bg-red-100 rounded-full px-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(idx);
                }}
                aria-label={`Eliminar a ${p.nombre}`}
              >
                ×
              </span>
            )}
          </button>
        ))}
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 rounded-full shadow text-green-700 font-semibold border-2 border-green-200 bg-white hover:bg-green-50 transition-all focus:outline-green-700"
          onClick={handleAdd}
          aria-label="Agregar nueva persona"
        >
          + Agregar persona
        </button>
      </div>
      {/* Edición en tarjeta flotante */}
      {editingIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="w-full max-w-xl bg-white border-2 border-green-200 rounded-xl shadow-2xl p-8 relative animate-fade-in">
            <button
              type="button"
              className="absolute top-4 right-4 text-green-700 hover:text-green-900 text-2xl font-bold"
              onClick={() => setEditingIdx(null)}
              aria-label="Cerrar edición de persona"
            >
              ×
            </button>
            <label
              htmlFor="nombrePersona"
              className="block mb-2 font-medium text-green-800"
            >
              Nombre
            </label>
            <input
              id="nombrePersona"
              type="text"
              value={people[editingIdx].nombre}
              onChange={(e) =>
                handleForm(editingIdx, { nombre: e.target.value })
              }
              className="w-full border-2 border-green-200 rounded p-3 mb-4 focus:outline-green-700 bg-white"
              aria-required="true"
              aria-label="Nombre de la persona"
            />
            <UserForm
              key={editingIdx}
              onTDEECalculated={(tdee) => handleTDEE(editingIdx, tdee)}
              initialValues={people[editingIdx]}
              onChange={(data) => handleForm(editingIdx, data)}
            />
            {people[editingIdx].tdee && (
              <div className="text-green-700 font-semibold mt-2">
                TDEE: {people[editingIdx].tdee} kcal
              </div>
            )}
            <button
              type="button"
              className="mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded shadow focus:outline-green-700"
              onClick={() => setEditingIdx(null)}
              aria-label="Cerrar edición de persona"
            >
              Listo
            </button>
          </div>
        </div>
      )}
      {error && (
        <div className="text-red-600 mb-4 text-center font-semibold">
          {error}
        </div>
      )}
      <button
        type="button"
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl shadow focus:outline-green-700 text-lg mt-2"
        onClick={handleSaveAll}
        aria-label="Guardar personas y continuar"
      >
        Guardar personas y continuar
      </button>
    </div>
  );
}
