import { useState, useEffect } from "react";
import type { PersonConfig } from "./PeopleConfigurator";

interface UserFormProps {
  onTDEECalculated: (tdee: number) => void;
  initialValues?: Partial<PersonConfig>;
  onChange?: (data: Partial<PersonConfig>) => void;
}

export default function UserForm({
  onTDEECalculated,
  initialValues,
  onChange,
}: UserFormProps) {
  const [form, setForm] = useState({
    sexo: initialValues?.sexo || "",
    edad: initialValues?.edad || "",
    peso: initialValues?.peso || "",
    estatura: initialValues?.estatura || "",
    actividad: initialValues?.actividad || "",
    objetivo: initialValues?.objetivo || "",
  });
  // loading eliminado: cálculo automático, no se usa loading
  const [error, setError] = useState("");

  const objetivosAvanzados = [
    {
      value: "mantener",
      label: "Mantener peso y masa muscular",
      desc: "Sin déficit ni superávit. Mantener composición actual.",
    },
    {
      value: "perder_grasa_mantener_musculo",
      label: "Perder grasa y mantener músculo",
      desc: "Déficit calórico moderado, alto consumo de proteína.",
    },
    {
      value: "perder_grasa",
      label: "Perder solo grasa",
      desc: "Déficit calórico alto, enfoque en reducción de grasa.",
    },
    {
      value: "ganar_musculo_perder_grasa",
      label: "Ganar músculo y perder grasa (recomposición)",
      desc: "Déficit/superávit leve, enfoque en recomposición corporal.",
    },
    {
      value: "ganar_musculo",
      label: "Ganar músculo",
      desc: "Superávit calórico moderado, alto consumo de proteína.",
    },
  ];

  const actividadOptions = [
    { label: "Sedentario", value: 1.2 },
    { label: "Ligera (1-3 días/semana)", value: 1.375 },
    { label: "Moderada (3-5 días/semana)", value: 1.55 },
    { label: "Intensa (6-7 días/semana)", value: 1.725 },
    { label: "Muy intensa (atleta)", value: 1.9 },
  ];

  // Cálculo automático de TDEE
  useEffect(() => {
    const camposCompletos = [
      form.sexo,
      form.edad,
      form.peso,
      form.estatura,
      form.actividad,
      form.objetivo,
    ].every((v) => v !== "" && v !== undefined);
    if (!camposCompletos) return;
    let cancelado = false;
    // setLoading(true); // eliminado
    setError("");
    fetch("/api/tdee", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sexo: form.sexo,
        edad: Number(form.edad),
        peso: Number(form.peso),
        estatura: Number(form.estatura),
        actividad: Number(form.actividad),
        objetivo: form.objetivo,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!cancelado) {
          if (res.ok) {
            onTDEECalculated(data.tdee);
          } else {
            setError(data.error || "Error al calcular TDEE");
          }
        }
      })
      .catch(() => {
        if (!cancelado) setError("Error de red");
      })
      .finally(() => {
        // if (!cancelado) setLoading(false); // eliminado
      });
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    form.sexo,
    form.edad,
    form.peso,
    form.estatura,
    form.actividad,
    form.objetivo,
  ]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const updated = { ...form, [e.target.name]: e.target.value };
    setForm(updated);
    if (onChange) onChange(updated);
  };

  return (
    <form className="space-y-4 w-full max-w-lg mx-auto bg-white rounded-xl shadow p-3 sm:p-4 md:p-6 border border-green-100">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        <div>
          <label
            htmlFor="sexo"
            className="block mb-1 font-semibold text-green-800"
          >
            Sexo
          </label>
          <select
            id="sexo"
            name="sexo"
            value={form.sexo}
            onChange={handleChange}
            required
            className="w-full border-2 border-green-200 rounded p-2 text-sm md:p-3 md:text-base focus:outline-green-700 bg-gray-50"
            aria-required="true"
          >
            <option value="">Selecciona</option>
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="edad"
            className="block mb-1 font-semibold text-green-800"
          >
            Edad
          </label>
          <input
            id="edad"
            name="edad"
            type="number"
            min="10"
            max="100"
            value={form.edad}
            onChange={handleChange}
            required
            className="w-full border-2 border-green-200 rounded p-2 text-sm md:p-3 md:text-base focus:outline-green-700 bg-gray-50"
            aria-required="true"
          />
        </div>
        <div>
          <label
            htmlFor="peso"
            className="block mb-1 font-semibold text-green-800"
          >
            Peso (kg)
          </label>
          <input
            id="peso"
            name="peso"
            type="number"
            min="20"
            max="250"
            value={form.peso}
            onChange={handleChange}
            required
            className="w-full border-2 border-green-200 rounded p-2 text-sm md:p-3 md:text-base focus:outline-green-700 bg-gray-50"
            aria-required="true"
          />
        </div>
        <div>
          <label
            htmlFor="estatura"
            className="block mb-1 font-semibold text-green-800"
          >
            Estatura (cm)
          </label>
          <input
            id="estatura"
            name="estatura"
            type="number"
            min="100"
            max="250"
            value={form.estatura}
            onChange={handleChange}
            required
            className="w-full border-2 border-green-200 rounded p-2 text-sm md:p-3 md:text-base focus:outline-green-700 bg-gray-50"
            aria-required="true"
          />
        </div>
        <div>
          <label
            htmlFor="actividad"
            className="block mb-1 font-semibold text-green-800"
          >
            Nivel de actividad
          </label>
          <select
            id="actividad"
            name="actividad"
            value={form.actividad}
            onChange={handleChange}
            required
            className="w-full border-2 border-green-200 rounded p-2 text-sm md:p-3 md:text-base focus:outline-green-700 bg-gray-50"
            aria-required="true"
          >
            <option value="">Selecciona</option>
            {actividadOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="objetivo"
            className="block mb-1 font-semibold text-green-800"
          >
            Objetivo
          </label>
          <select
            id="objetivo"
            name="objetivo"
            value={form.objetivo}
            onChange={handleChange}
            required
            className="w-full border-2 border-green-200 rounded p-2 text-sm md:p-3 md:text-base focus:outline-green-700 bg-gray-50 mb-1"
            aria-required="true"
          >
            <option value="">Selecciona</option>
            {objetivosAvanzados.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {form.objetivo && (
            <div className="text-xs text-gray-600 mt-1">
              {objetivosAvanzados.find((o) => o.value === form.objetivo)?.desc}
            </div>
          )}
        </div>
      </div>
      <div className="mt-2">
        {error && (
          <div className="text-red-600 mt-2 text-center font-semibold">
            {error}
          </div>
        )}
      </div>
    </form>
  );
}
