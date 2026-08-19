"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { GroupData } from "@/lib/store";
import { Plus, Edit2, Trash2, RotateCcw, ArrowLeft, Users, CheckCircle2, Award } from "lucide-react";
import Link from "next/link";

export default function AdminGroupsPage() {
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<string>("");

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingGroup, setEditingGroup] = useState<GroupData | null>(null);
  const [groupNameInput, setGroupNameInput] = useState<string>("");
  const [scoreInput, setScoreInput] = useState<number>(0);

  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/groups");
      const data = await res.json();
      if (data.groups) {
        setGroups(data.groups);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const openCreateModal = () => {
    setEditingGroup(null);
    setGroupNameInput("");
    setScoreInput(0);
    setIsModalOpen(true);
  };

  const openEditModal = (group: GroupData) => {
    setEditingGroup(group);
    setGroupNameInput(group.name);
    setScoreInput(group.totalScore);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGroup) {
        // Edit group / score override
        const res = await fetch("/api/admin/groups", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingGroup.id,
            name: groupNameInput,
            scoreOverride: scoreInput,
          }),
        });
        if (res.ok) {
          setNotification(`Kelompok #${editingGroup.id} berhasil diperbarui`);
        }
      } else {
        // Create new group
        const res = await fetch("/api/admin/groups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: groupNameInput }),
        });
        if (res.ok) {
          setNotification("Kelompok baru berhasil ditambahkan");
        }
      }
      setIsModalOpen(false);
      fetchGroups();
      setTimeout(() => setNotification(""), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus ${name}?`)) return;
    try {
      const res = await fetch(`/api/admin/groups?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setNotification(`Kelompok #${id} berhasil dihapus`);
        fetchGroups();
        setTimeout(() => setNotification(""), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetAll = async () => {
    if (!confirm("PERINGATAN: Apakah Anda yakin ingin MENG-RESET SELURUH SKOR KELOMPOK KE 0?")) return;
    try {
      const res = await fetch("/api/admin/groups", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isResetAll: true }),
      });
      if (res.ok) {
        setNotification("Seluruh skor kelompok berhasil di-reset ke 0");
        fetchGroups();
        setTimeout(() => setNotification(""), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
          <div>
            <Link href="/admin/dashboard" className="text-xs font-semibold text-sky-400 flex items-center gap-1 mb-2 hover:underline">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Dashboard Admin</span>
            </Link>
            <h1 className="text-2xl font-extrabold text-slate-100 uppercase tracking-wide">
              MANAJEMEN KELOMPOK & SKOR (FULL CRUD)
            </h1>
            <p className="text-xs text-slate-400">
              Tambah kelompok baru, edit nama, koreksi skor manual (*Score Override*), dan reset sesi
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetAll}
              className="px-3.5 py-2.5 rounded-xl bg-red-950/80 border border-red-800 hover:bg-red-900 font-bold text-xs text-red-300 flex items-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>RESET SEMUA SKOR</span>
            </button>

            <button
              type="button"
              onClick={openCreateModal}
              className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 font-bold text-xs text-white flex items-center gap-2 shadow-lg shadow-sky-950 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>TAMBAH KELOMPOK</span>
            </button>
          </div>
        </div>

        {notification && (
          <div className="mb-6 p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-xs font-bold text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{notification}</span>
          </div>
        )}

        {/* Groups Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              DAFTAR KELOMPOK PESERTA ({groups.length})
            </h2>
          </div>

          <div className="divide-y divide-slate-800">
            {groups.map((group) => (
              <div key={group.id} className="p-5 flex items-center justify-between hover:bg-slate-950/40 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800">
                    #{group.id}
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">{group.name}</h3>
                    <p className="text-[11px] text-slate-500">
                      ID Unik: {group.id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 font-mono font-black text-base text-amber-400">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>{group.totalScore}</span>
                    <span className="text-xs text-slate-500 font-normal">PTS</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => openEditModal(group)}
                    className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500 text-slate-300 hover:text-white transition-all"
                    title="Edit Nama / Skor"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(group.id, group.name)}
                    className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-red-500 text-slate-400 hover:text-red-400 transition-all"
                    title="Hapus Kelompok"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-base font-bold text-slate-100 uppercase tracking-wide mb-4">
              {editingGroup ? `EDIT KELOMPOK #${editingGroup.id}` : "TAMBAH KELOMPOK BARU"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Nama Kelompok
                </label>
                <input
                  type="text"
                  required
                  value={groupNameInput}
                  onChange={(e) => setGroupNameInput(e.target.value)}
                  placeholder="Misal: Kelompok 6 - Rajawali"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded-xl text-sm text-slate-100"
                />
              </div>

              {editingGroup && (
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                    Total Skor (Score Override Manual)
                  </label>
                  <input
                    type="number"
                    value={scoreInput}
                    onChange={(e) => setScoreInput(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded-xl text-sm font-mono text-amber-400 font-bold"
                  />
                </div>
              )}

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 font-bold text-xs text-slate-400 uppercase"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 font-bold text-xs text-white uppercase shadow-lg shadow-sky-950"
                >
                  SIMPAN KELOMPOK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
