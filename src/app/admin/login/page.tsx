"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Shield, Lock, ArrowRight } from "lucide-react";

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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-sm w-full mx-auto px-4 py-12 flex flex-col justify-center">
        <div className="p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-red-950/5">
          <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mx-auto mb-4 shadow-sm">
            <Shield className="w-6 h-6" />
          </div>

          <h1 className="text-lg font-black text-center text-slate-900 uppercase tracking-wide mb-1">
            LOGIN SUPER ADMIN
          </h1>
          <p className="text-xs text-slate-500 text-center mb-6">
            Akses terproteksi manajemen pos & bank soal
          </p>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 text-center font-bold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Username Admin
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-red-600 focus:outline-none rounded-xl text-sm text-slate-900 placeholder:text-slate-400 font-medium transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Kata Sandi (Password)
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-red-600 focus:outline-none rounded-xl text-sm text-slate-900 placeholder:text-slate-400 font-medium transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="touch-btn w-full font-extrabold uppercase tracking-wider text-xs bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 transition-all disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                "MEMPROSES..."
              ) : (
                <>
                  <span>MASUK DASHBOARD</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-[11px] text-slate-400 text-center mt-6">
            Default credentials: <strong className="text-slate-700 font-mono">admin / admin123</strong>
          </p>
        </div>
      </main>
    </div>
  );
}
