"use client";

import Link from "next/link";
import { Shield, Trophy, Tv } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-slate-100 font-bold tracking-wide">
          <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white text-xs font-black">
            POS
          </div>
          <span className="text-sm font-semibold tracking-tight text-slate-200">GAME POS-TO-POS</span>
        </Link>

        <nav className="flex items-center gap-2 text-xs font-medium text-slate-300">
          <Link
            href="/leaderboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
          >
            <Trophy className="w-3.5 h-3.5 text-sky-400" />
            <span>Leaderboard</span>
          </Link>
          <Link
            href="/projector"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
          >
            <Tv className="w-3.5 h-3.5 text-indigo-400" />
            <span>Proyektor</span>
          </Link>
          <Link
            href="/admin/login"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all"
          >
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span>Admin</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
