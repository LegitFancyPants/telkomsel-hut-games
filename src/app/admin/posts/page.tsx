"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { PostData } from "@/lib/store";
import { Plus, Edit2, Trash2, Key, ToggleLeft, ToggleRight, ArrowLeft, Shield, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<string>("");

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingPost, setEditingPost] = useState<PostData | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    pinCode: "",
    gameType: "quiz",
    timeLimit: 60,
    isActive: true,
  });

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/posts");
      const data = await res.json();
      if (data.posts) {
        setPosts(data.posts);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const openCreateModal = () => {
    setEditingPost(null);
    setFormData({
      name: "",
      slug: "",
      pinCode: "1234",
      gameType: "quiz",
      timeLimit: 60,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (post: PostData) => {
    setEditingPost(post);
    setFormData({
      name: post.name,
      slug: post.slug,
      pinCode: post.pinCode,
      gameType: post.gameType,
      timeLimit: post.timeLimit,
      isActive: post.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPost) {
        const res = await fetch("/api/admin/posts", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingPost.id, ...formData }),
        });
        if (res.ok) {
          setNotification(`Pos #${editingPost.id} berhasil diperbarui`);
        }
      } else {
        const res = await fetch("/api/admin/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          setNotification("Pos baru berhasil dibuat");
        }
      }
      setIsModalOpen(false);
      fetchPosts();
      setTimeout(() => setNotification(""), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus ${name}?`)) return;
    try {
      const res = await fetch(`/api/admin/posts?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setNotification(`Pos #${id} berhasil dihapus`);
        fetchPosts();
        setTimeout(() => setNotification(""), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleStatus = async (post: PostData) => {
    try {
      const res = await fetch("/api/admin/posts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: post.id, isActive: !post.isActive }),
      });
      if (res.ok) {
        fetchPosts();
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
              MANAJEMEN POS PERMAINAN (FULL CRUD)
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              Tambah, ubah nama pos, slug URL, PIN 4-digit, batas waktu, dan mode game aktif
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 font-bold text-xs text-white flex items-center gap-2 shadow-lg shadow-red-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>TAMBAH POS BARU</span>
          </button>
        </div>

        {notification && (
          <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{notification}</span>
          </div>
        )}

        {/* Posts Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl shadow-red-950/5">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              DAFTAR POS PERMAINAN ({posts.length})
            </h2>
          </div>

          <div className="divide-y divide-slate-100">
            {posts.map((post) => (
              <div key={post.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-red-600 px-2 py-0.5 rounded bg-red-50 border border-red-200">
                      #{post.id}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{post.name}</h3>
                    <span className="text-xs text-slate-500 font-mono">(/pos/{post.slug})</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Mode Game: <span className="text-red-600 font-bold uppercase">{post.gameType}</span> | Batas Waktu: <span className="text-slate-900 font-bold">{post.timeLimit}s</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 font-mono text-xs font-bold text-red-600">
                    <Key className="w-3.5 h-3.5 text-slate-400" />
                    <span>{post.pinCode}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleStatus(post)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                      post.isActive
                        ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                        : "bg-red-50 border border-red-200 text-red-700"
                    }`}
                  >
                    {post.isActive ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4 text-red-600" />}
                    <span>{post.isActive ? "OPEN" : "PAUSED"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditModal(post)}
                    className="p-2 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 transition-all"
                    title="Edit Pos"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(post.id, post.name)}
                    className="p-2 rounded-xl bg-slate-100 border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-500 hover:text-red-600 transition-all"
                    title="Hapus Pos"
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-base font-black text-slate-900 uppercase tracking-wide mb-4">
              {editingPost ? `EDIT POS #${editingPost.id}` : "TAMBAH POS BARU"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Nama Pos
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Misal: POS 6: ULAR KETANGKASAN"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:border-red-600 focus:outline-none rounded-xl text-sm text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Slug URL (misal: pos-6)
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="pos-6"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:border-red-600 focus:outline-none rounded-xl text-sm font-mono text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    PIN Pos (4-6 Digit)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.pinCode}
                    onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                    placeholder="4829"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:border-red-600 focus:outline-none rounded-xl text-sm font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Batas Waktu (Detik)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.timeLimit}
                    onChange={(e) => setFormData({ ...formData, timeLimit: Number(e.target.value) })}
                    placeholder="60"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:border-red-600 focus:outline-none rounded-xl text-sm font-mono text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Mode Game Aktif
                </label>
                <select
                  value={formData.gameType}
                  onChange={(e) => setFormData({ ...formData, gameType: e.target.value as any })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:border-red-600 focus:outline-none rounded-xl text-sm text-slate-900 font-bold"
                >
                  <option value="quiz">Quiz Pilihan Ganda (quiz)</option>
                  <option value="tap_reflex">Reflex Tap Challenge (tap_reflex)</option>
                  <option value="memory_match">Memory Card Match (memory_match)</option>
                  <option value="speed_math">Speed Math Challenge (speed_math)</option>
                  <option value="word_scramble">Word Unscramble (word_scramble)</option>
                  <option value="snake">Classic Snake Challenge (snake)</option>
                </select>
              </div>

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
                  SIMPAN POS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
