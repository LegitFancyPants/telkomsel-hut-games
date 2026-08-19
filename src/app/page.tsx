import Link from "next/link";
import Navbar from "@/components/Navbar";
import { QrCode, Trophy, Shield, Lock, ChevronRight, Sparkles } from "lucide-react";

export const revalidate = 0;

export default async function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-16 flex flex-col items-center justify-center text-center">
        {/* Banner Section */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-950/80 border border-sky-800/80 text-sky-300 text-xs font-semibold uppercase tracking-wider mb-6">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
          RALLY GAME QR-GATED SYSTEM
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-100 mb-4 max-w-2xl leading-tight">
          SCAN QR CODE DI BANNER POS UNTUK MEMULAI GAME
        </h1>

        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed mb-8">
          Akses setiap pos permainan hanya dapat dibuka melalui scan **QR Code fisik** di masing-masing lokasi pos atau mengetikkan URL spesifik pos tersebut.
        </p>

        {/* QR Code Instruction Box */}
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 mb-10 shadow-2xl flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400 mb-4 shadow-lg">
            <QrCode className="w-10 h-10" />
          </div>
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide mb-2">
            CARA MEMULAI PERMAINAN
          </h3>
          <ol className="text-xs text-slate-400 text-left space-y-2 max-w-xs mb-2 list-decimal list-inside">
            <li>Kunjungi Pos Fisik di lapangan.</li>
            <li>Scan QR Code pada Banner / Standee Pos.</li>
            <li>Masukkan **PIN 4-Digit** dari Panitia Pos.</li>
            <li>Pilih Kelompok & mainkan game!</li>
          </ol>
        </div>

        {/* Public Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
          <Link
            href="/leaderboard"
            className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-sky-500 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5 text-sky-400" />
              <span className="text-xs font-bold text-slate-200 group-hover:text-sky-300">
                LIVE LEADERBOARD
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-sky-400" />
          </Link>

          <Link
            href="/admin/login"
            className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-slate-400" />
              <span className="text-xs font-bold text-slate-300 group-hover:text-white">
                PORTAL ADMIN POS
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300" />
          </Link>
        </div>
      </main>

      <footer className="py-6 border-t border-slate-900 text-center text-xs text-slate-600">
        Platform Web Game Pos-to-Pos &copy; 2026. Zero-Login Mobile Scanning.
      </footer>
    </div>
  );
}
