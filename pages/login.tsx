import { useState } from "react";
import { useRouter } from "next/router";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    // Llama al endpoint de login
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      // Guarda el token en localStorage
      localStorage.setItem("nutri_token", "1");
      router.push("/");
    } else {
      setError("Contraseña incorrecta");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-200 via-green-100 to-white">
      <form
        onSubmit={handleLogin}
        className="bg-white/90 p-8 rounded-2xl shadow-2xl flex flex-col gap-6 w-full max-w-sm border border-green-100 animate-fadein"
      >
        <h1 className="text-3xl font-extrabold text-green-700 mb-2 text-center tracking-tight">
          Acceso
        </h1>
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border-2 border-green-300 rounded-lg p-4 w-full text-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition"
        />
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg text-lg transition-all duration-150"
        >
          Entrar
        </button>
        {error && (
          <div className="text-red-600 text-center font-semibold animate-pulse">
            {error}
          </div>
        )}
      </form>
      <style jsx>{`
        .animate-fadein {
          animation: fadein 0.7s;
        }
        @keyframes fadein {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
