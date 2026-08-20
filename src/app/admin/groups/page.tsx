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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200">
          <div>
            <Link href="/admin/dashboard" className="text-xs font-bold text-red-600 flex items-center gap-1 mb-2 hover:underline">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Dashboard Admin</span>
            </Link>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-wide">
              MANAJEMEN KELOMPOK & SKOR (FULL CRUD)
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              Tambah kelompok baru, edit nama, koreksi skor manual (*Score Override*), dan reset sesi
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetAll}
              className="px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-200 hover:bg-red-100 font-bold text-xs text-red-600 flex items-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>RESET SEMUA SKOR</span>
            </button>

            <button
              type="button"
              onClick={openCreateModal}
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 font-extrabold text-xs text-white flex items-center gap-2 shadow-lg shadow-red-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>TAMBAH KELOMPOK</span>
            </button>
          </div>
        </div>

        {notification && (
          <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{notification}</span>
          </div>
        )}

        {/* Groups Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl shadow-red-950/5">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              DAFTAR KELOMPOK PESERTA ({groups.length})
            </h2>
          </div>

          <div className="divide-y divide-slate-100">
            {groups.map((group, idx) => (
              <div key={group.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-red-600 px-2 py-0.5 rounded bg-red-50 border border-red-200">
                    #{idx + 1}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">{group.name}</h3>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200 font-mono text-sm font-black text-red-600">
                    <Award className="w-4 h-4 text-red-600" />
                    <span>{group.totalScore} PTS</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(group)}
                      className="p-2 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 transition-all"
                      title="Edit Kelompok / Override Skor"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(group.id, group.name)}
                      className="p-2 rounded-xl bg-slate-100 border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-500 hover:text-red-600 transition-all"
                      title="Hapus Kelompok"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-base font-black text-slate-900 uppercase tracking-wide mb-4">
              {editingGroup ? `EDIT KELOMPOK #${editingGroup.id}` : "TAMBAH KELOMPOK BARU"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Nama Kelompok
                </label>
                <input
                  type="text"
                  required
                  value={groupNameInput}
                  onChange={(e) => setGroupNameInput(e.target.value)}
                  placeholder="Misal: Kelompok 6 - Cendrawasih"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:border-red-600 focus:outline-none rounded-xl text-sm text-slate-900 font-medium"
                />
              </div>

              {editingGroup && (
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Koreksi Total Skor (Score Override)
                  </label>
                  <input
                    type="number"
                    value={scoreInput}
                    onChange={(e) => setScoreInput(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:border-red-600 focus:outline-none rounded-xl text-sm font-mono text-slate-900 font-bold"
                  />
                  <p className="text-[10px] text-slate-500 font-normal mt-1">
                    *Mengubah nilai ini akan langsung memperbarui total skor kelompok di Live Leaderboard.
                  </p>
                </div>
              )}

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 font-bold text-xs text-slate-700 uppercase"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 font-extrabold text-xs text-white uppercase shadow-md shadow-red-600/20"
                >
                  SIMPAN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
