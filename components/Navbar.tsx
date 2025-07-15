import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="bg-gradient-to-r from-green-700 via-green-600 to-green-500 text-white px-4 py-3 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-2xl tracking-tight"
        >
          <span className="bg-white rounded-full p-1 text-green-600 text-2xl">
            🥗
          </span>
          NutriPlanner
        </Link>
        <button
          className="md:hidden flex items-center px-2 py-1 border border-white rounded hover:bg-green-800"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menú"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <div
          className={`flex-col md:flex-row md:flex gap-2 md:gap-6 items-center font-medium ${
            open
              ? "flex absolute top-16 left-0 w-full bg-gradient-to-r from-green-700 via-green-600 to-green-500 p-4"
              : "hidden md:flex"
          }`}
        >
          <Link
            href="/"
            className="px-3 py-2 rounded hover:bg-white/10 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/profile"
            className="px-3 py-2 rounded hover:bg-white/10 transition-colors"
          >
            Resumen
          </Link>
          <Link
            href="/config"
            className="px-3 py-2 rounded hover:bg-white/10 transition-colors"
          >
            Configuración
          </Link>
          <Link
            href="/ingredients"
            className="px-3 py-2 rounded hover:bg-white/10 transition-colors"
          >
            Ingredientes
          </Link>
          <Link
            href="/menu"
            className="px-3 py-2 rounded bg-white text-green-700 font-semibold shadow hover:bg-green-100 transition-colors"
          >
            Menú
          </Link>
        </div>
      </div>
    </nav>
  );
}
