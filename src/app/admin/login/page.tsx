"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Shield, Lock, ArrowRight, KeyRound } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Login gagal");
        setIsLoading(false);
        return;
      }

      // Successful login -> Redirect to admin dashboard
      router.push("/admin/dashboard");
    } catch (err: any) {
      setErrorMsg("Terjadi kesalahan server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-sm w-full mx-auto px-4 py-12 flex flex-col justify-center">
        <div className="p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-sky-400 mx-auto mb-4">
            <Shield className="w-6 h-6" />
          </div>

          <h1 className="text-lg font-bold text-center text-slate-100 uppercase tracking-wide mb-1">
            LOGIN SUPER ADMIN
          </h1>
          <p className="text-xs text-slate-500 text-center mb-6">
            Akses terproteksi manajemen pos & bank soal
          </p>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-800 text-xs text-red-300 text-center font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Username Admin
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded-xl text-sm text-slate-100 placeholder:text-slate-600 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Kata Sandi (Password)
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded-xl text-sm text-slate-100 placeholder:text-slate-600 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="touch-btn w-full font-bold uppercase tracking-wider text-xs bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                "MEMERIKSA KREDENSIAL..."
              ) : (
                <>
                  <span>MASUK DASHBOARD</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
