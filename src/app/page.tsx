import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getPosts, getGroups } from "@/lib/store";
import { QrCode, Trophy, Shield, Play, Lock, ChevronRight } from "lucide-react";

export const revalidate = 0;

export default async function HomePage() {
  const posts = await getPosts();
  const groups = await getGroups();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12">
        {/* Banner Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-950/80 border border-sky-800/80 text-sky-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            PLATFORM PERMAINAN POS-TO-POS
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-100 mb-3">
            Rally Games & Interactive Pos Challenge
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            Scan QR Code di lokasi pos fisik, masukkan PIN 4-digit dari panitia, dan kumpulkan poin terbaik untuk kelompok Anda secara real-time.
          </p>
        </div>

        {/* Quick Links / Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <Link
            href="/leaderboard"
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-500/50 hover:bg-slate-900/80 transition-all flex items-center justify-between group shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-200 text-sm group-hover:text-sky-300 transition-colors">
                  LIVE LEADERBOARD
                </h3>
                <p className="text-xs text-slate-500 font-normal">
                  Peringkat skor kelompok real-time
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-sky-400 transition-colors" />
          </Link>

          <Link
            href="/projector"
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/80 transition-all flex items-center justify-between group shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-200 text-sm group-hover:text-indigo-300 transition-colors">
                  MODE PROYEKTOOR
                </h3>
                <p className="text-xs text-slate-500 font-normal">
                  Tampilan layar besar untuk panggung
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-indigo-400 transition-colors" />
          </Link>
        </div>

        {/* Pos List Selector (Simulasi Scan QR) */}
        <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-200 uppercase tracking-wide">
                DAFTAR POS PERMAINAN
              </h2>
              <p className="text-xs text-slate-500">
                Pilih pos fisik yang sedang Anda kunjungi di lapangan
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-400">
              {posts.length} POS AKTIF
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/pos/${post.slug}`}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500 hover:bg-slate-900 transition-all flex items-center justify-between group touch-btn"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-mono font-bold text-xs text-sky-400 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                    #{post.id}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-200 group-hover:text-sky-300 transition-colors">
                      {post.name}
                    </h4>
                    <span className="text-[11px] text-slate-500 font-mono">
                      /pos/{post.slug}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-600 group-hover:text-sky-400 transition-colors" />
                  <span className="text-xs font-bold text-sky-400 uppercase tracking-wider hidden sm:inline">
                    BUKA
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <footer className="py-6 border-t border-slate-900 text-center text-xs text-slate-600">
        Platform Web Game Pos-to-Pos &copy; 2026. Zero-Login Mobile Scanning.
      </footer>
    </div>
  );
}
