import Head from "next/head";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Head>
        <title>Dashboard | NutriPlanner</title>
        <meta name="description" content="Panel principal de NutriPlanner" />
      </Head>
      <main className="min-h-screen bg-gray-50 w-full px-2 sm:px-4 md:px-8 lg:px-16 xl:px-32 py-6 flex flex-col">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 gap-y-8 w-full">
          <Link
            href="/config"
            className="bg-white border border-green-200 rounded-lg shadow hover:shadow-lg p-6 sm:p-8 flex flex-col items-center transition"
          >
            <span className="text-green-600 text-2xl mb-2">⚙️</span>
            <span className="font-semibold mb-1">
              Configuración física y objetivo
            </span>
            <span className="text-gray-500 text-sm text-center">
              Edita tus datos físicos, objetivo y número de comidas.
            </span>
          </Link>
          <Link
            href="/ingredients"
            className="bg-white border border-green-200 rounded-lg shadow hover:shadow-lg p-6 sm:p-8 flex flex-col items-center transition"
          >
            <span className="text-green-600 text-2xl mb-2">🥦</span>
            <span className="font-semibold mb-1">Ingredientes</span>
            <span className="text-gray-500 text-sm text-center">
              Selecciona alimentos permitidos y excluidos.
            </span>
          </Link>
          <Link
            href="/menu"
            className="bg-white border border-green-200 rounded-lg shadow hover:shadow-lg p-6 sm:p-8 flex flex-col items-center transition"
          >
            <span className="text-green-600 text-2xl mb-2">🍽️</span>
            <span className="font-semibold mb-1">Generar Menú</span>
            <span className="text-gray-500 text-sm text-center">
              Visualiza o regenera tu menú personalizado.
            </span>
          </Link>
        </div>
      </main>
    </>
  );
}
