"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { PostData, GroupData } from "@/lib/store";
import { Shield, QrCode, Lock, Users, FileText, ChevronRight } from "lucide-react";
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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-red-600" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-red-600">
                ADMIN PANEL
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Pusat Kontrol Event & Pos Permainan
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/qr-code"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl font-bold text-xs text-white flex items-center gap-2 shadow-lg shadow-red-600/20 transition-all"
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
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-red-500 hover:bg-slate-50 transition-all group shadow-xl shadow-red-950/5 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 group-hover:scale-105 transition-transform">
                <Lock className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                {posts.length} POS AKTIF
              </span>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900 group-hover:text-red-600 transition-colors uppercase tracking-wide mb-1 flex items-center justify-between">
                <span>MANAJEMEN POS (FULL CRUD)</span>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-red-600 transition-colors" />
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                Tambah pos baru, ubah nama, slug URL, PIN 4-digit, ganti mode game aktif, dan toggle OPEN/PAUSED.
              </p>
            </div>
          </Link>

          {/* Module 2: Groups CRUD */}
          <Link
            href="/admin/groups"
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-red-500 hover:bg-slate-50 transition-all group shadow-xl shadow-red-950/5 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                {groups.length} KELOMPOK
              </span>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900 group-hover:text-red-600 transition-colors uppercase tracking-wide mb-1 flex items-center justify-between">
                <span>MANAJEMEN KELOMPOK & SKOR</span>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-red-600 transition-colors" />
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                Tambah kelompok baru, edit nama, koreksi skor manual (*Score Override*), dan reset sesi.
              </p>
            </div>
          </Link>

          {/* Module 3: Game Content Editor */}
          <Link
            href="/admin/games"
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-red-500 hover:bg-slate-50 transition-all group shadow-xl shadow-red-950/5 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 group-hover:scale-105 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
                5 MODE GAME
              </span>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900 group-hover:text-red-600 transition-colors uppercase tracking-wide mb-1 flex items-center justify-between">
                <span>PENGATURAN KONTEN & BANK SOAL</span>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-red-600 transition-colors" />
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                Kelola pertanyaan kuis, gambar Tebak Gambar, audio Tebak Lagu, kunci jawaban A-D, dan bobot poin.
              </p>
            </div>
          </Link>

          {/* Module 4: QR Code Generator */}
          <Link
            href="/admin/qr-code"
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-red-500 hover:bg-slate-50 transition-all group shadow-xl shadow-red-950/5 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 group-hover:scale-105 transition-transform">
                <QrCode className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                SIAP CETAK
              </span>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900 group-hover:text-red-600 transition-colors uppercase tracking-wide mb-1 flex items-center justify-between">
                <span>GENERATOR BANNER QR CODE</span>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-red-600 transition-colors" />
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                Generate QR Code banner per pos aktif yang siap dicetak untuk papan fisik permainan di lapangan.
              </p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
