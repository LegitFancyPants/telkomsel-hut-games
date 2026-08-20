import Link from "next/link";
import Navbar from "@/components/Navbar";
import { QrCode, Trophy, Shield, ChevronRight } from "lucide-react";

export const revalidate = 0;

export default async function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-16 flex flex-col items-center justify-center text-center">
        {/* Banner Section */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold uppercase tracking-wider mb-6">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          RALLY GAME QR-GATED SYSTEM
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 mb-4 max-w-2xl leading-tight">
          SCAN QR CODE DI BANNER POS UNTUK MEMULAI GAME
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed mb-8">
          Akses setiap pos permainan hanya dapat dibuka melalui scan <strong className="text-red-600 font-bold">QR Code fisik</strong> di masing-masing lokasi pos atau mengetikkan URL spesifik pos tersebut.
        </p>

        {/* QR Code Instruction Box */}
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 mb-10 shadow-xl shadow-red-950/5 flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mb-4 shadow-md">
            <QrCode className="w-10 h-10" />
          </div>
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide mb-2">
            CARA MEMULAI PERMAINAN
          </h3>
          <ol className="text-xs text-slate-600 text-left space-y-2 max-w-xs mb-2 list-decimal list-inside font-medium">
            <li>Kunjungi Pos Fisik di lapangan.</li>
            <li>Scan QR Code pada Banner / Standee Pos.</li>
            <li>Masukkan <strong className="text-slate-900">PIN 4-Digit</strong> dari Panitia Pos.</li>
            <li>Pilih Kelompok & mainkan game!</li>
          </ol>
        </div>

        {/* Public Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
          <Link
            href="/leaderboard"
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-red-500 transition-all flex items-center justify-between group shadow-sm hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5 text-red-600" />
              <span className="text-xs font-bold text-slate-900 group-hover:text-red-600">
                LIVE LEADERBOARD
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-red-600" />
          </Link>

          <Link
            href="/admin/login"
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-400 transition-all flex items-center justify-between group shadow-sm hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-slate-600" />
              <span className="text-xs font-bold text-slate-800 group-hover:text-slate-900">
                PORTAL ADMIN POS
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
          </Link>
        </div>
      </main>

      <footer className="py-6 border-t border-slate-200 text-center text-xs text-slate-500">
        Platform Web Game Pos-to-Pos &copy; 2026. Zero-Login Mobile Scanning.
      </footer>
    </div>
  );
}
