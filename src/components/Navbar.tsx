"use client";

import Link from "next/link";
import { Home, Trophy, User } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-wide">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-600/20">
            <Home className="w-4 h-4" />
          </div>
          <span className="text-sm font-extrabold tracking-tight text-slate-900">HUT RI</span>
        </Link>

        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <Link
            href="/leaderboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-800 hover:text-red-600"
          >
            <Trophy className="w-3.5 h-3.5 text-red-600" />
            <span>Leaderboard</span>
          </Link>
          <Link
            href="/admin/login"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-800 transition-all"
          >
            <User className="w-3.5 h-3.5 text-slate-600" />
            <span>Admin</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
