"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { PostData, GroupData } from "@/lib/store";
import { Shield, QrCode, Lock, Users, FileText, ChevronRight, Settings, Award } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [resPosts, resGroups] = await Promise.all([
        fetch("/api/admin/posts"),
        fetch("/api/admin/groups"),
      ]);
      const pData = await resPosts.json();
      const gData = await resGroups.json();
      if (pData.posts) setPosts(pData.posts);
      if (gData.groups) setGroups(gData.groups);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                SUPER ADMIN PANEL CONTROL
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Pusat Kontrol Event & Pos Permainan
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/qr-code"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 rounded-xl font-bold text-xs text-white flex items-center gap-2 shadow-lg shadow-sky-950 transition-all"
            >
              <QrCode className="w-4 h-4" />
              <span>CETAK QR CODE</span>
            </Link>
          </div>
        </div>

        {/* 4 Admin Quick Management Modules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {/* Module 1: Pos CRUD */}
          <Link
            href="/admin/posts"
            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-500/60 hover:bg-slate-900/90 transition-all group shadow-xl flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform">
                <Lock className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono font-bold text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                {posts.length} POS AKTIF
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-100 group-hover:text-sky-300 transition-colors uppercase tracking-wide mb-1 flex items-center justify-between">
                <span>MANAJEMEN POS (FULL CRUD)</span>
                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-sky-400 transition-colors" />
              </h3>
              <p className="text-xs text-slate-400">
                Tambah pos baru, ubah nama, slug URL, PIN 4-digit, ganti mode game aktif, dan toggle OPEN/PAUSED.
              </p>
            </div>
          </Link>

          {/* Module 2: Groups CRUD */}
          <Link
            href="/admin/groups"
            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/60 hover:bg-slate-900/90 transition-all group shadow-xl flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono font-bold text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                {groups.length} KELOMPOK
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors uppercase tracking-wide mb-1 flex items-center justify-between">
                <span>MANAJEMEN KELOMPOK & SKOR</span>
                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-indigo-400 transition-colors" />
              </h3>
              <p className="text-xs text-slate-400">
                Tambah kelompok baru, edit nama, koreksi skor manual (*Score Override*), dan reset sesi.
              </p>
            </div>
          </Link>

          {/* Module 3: Game Content Editor */}
          <Link
            href="/admin/games"
            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/60 hover:bg-slate-900/90 transition-all group shadow-xl flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                5 MODE GAME
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-100 group-hover:text-emerald-300 transition-colors uppercase tracking-wide mb-1 flex items-center justify-between">
                <span>PENGATURAN KONTEN & BANK SOAL</span>
                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-400 transition-colors" />
              </h3>
              <p className="text-xs text-slate-400">
                Kelola pertanyaan kuis, kunci jawaban A-D, bobot poin, dan konfigurasi mode mini-game.
              </p>
            </div>
          </Link>

          {/* Module 4: QR Code Generator */}
          <Link
            href="/admin/qr-code"
            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/60 hover:bg-slate-900/90 transition-all group shadow-xl flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                <QrCode className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono font-bold text-amber-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                PRINTABLE
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-100 group-hover:text-amber-300 transition-colors uppercase tracking-wide mb-1 flex items-center justify-between">
                <span>GENERATOR & CETAK QR CODE</span>
                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-amber-400 transition-colors" />
              </h3>
              <p className="text-xs text-slate-400">
                Generate dan cetak stiker/banner QR Code resmi per pos untuk dipasang di lokasi fisik.
              </p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
