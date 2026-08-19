"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { PostData, QuestionData } from "@/lib/store";
import { Plus, Trash2, ArrowLeft, FileText, CheckCircle2, HelpCircle, Eye, Calculator, Zap, Activity, Upload, Image as ImageIcon, X } from "lucide-react";
import Link from "next/link";

export default function AdminGamesPage() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [notification, setNotification] = useState<string>("");

  const [promptText, setPromptText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctOpt, setCorrectOpt] = useState("A");
  const [points, setPoints] = useState(20);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/admin/posts");
      const data = await res.json();
      if (data.posts && data.posts.length > 0) {
        setPosts(data.posts);
        setSelectedPostId(data.posts[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchQuestions = async (postId: number) => {
    try {
      const res = await fetch(`/api/admin/questions?postId=${postId}`);
      const data = await res.json();
      if (data.questions) {
        setQuestions(data.questions);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (selectedPostId) {
      fetchQuestions(selectedPostId);
    }
  }, [selectedPostId]);

  const selectedPost = posts.find((p) => p.id === selectedPostId);

  // File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Gagal mengunggah gambar");
        setIsUploading(false);
        return;
      }

      setImageUrl(data.imageUrl);
      setNotification("File gambar berhasil diunggah");
      setTimeout(() => setNotification(""), 3000);
    } catch (err) {
      alert("Terjadi kesalahan koneksi saat mengunggah file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPostId || !promptText || !optionA || !optionB || !optionC || !optionD) return;

    try {
      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: selectedPostId,
          promptText,
          imageUrl: imageUrl.trim() || null,
          options: [optionA, optionB, optionC, optionD],
          correctOpt,
          points,
        }),
      });

      if (res.ok) {
        setNotification("Pertanyaan kuis / Tebak Gambar baru berhasil ditambahkan");
        setPromptText("");
        setImageUrl("");
        setOptionA("");
        setOptionB("");
        setOptionC("");
        setOptionD("");
        fetchQuestions(selectedPostId);
        setTimeout(() => setNotification(""), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/questions?id=${id}`, { method: "DELETE" });
      if (res.ok && selectedPostId) {
        setNotification(`Soal #${id} berhasil dihapus`);
        fetchQuestions(selectedPostId);
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
              PENGATURAN KONTEN & BANK SOAL GAME
            </h1>
            <p className="text-xs text-slate-400">
              Upload file gambar untuk soal Tebak Gambar, kelola pertanyaan kuis, dan kunci jawaban per pos
            </p>
          </div>
        </div>

        {notification && (
          <div className="mb-6 p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-xs font-bold text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{notification}</span>
          </div>
        )}

        {/* Pos Selection Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {posts.map((p) => {
            const isSelected = p.id === selectedPostId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPostId(p.id)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all flex items-center gap-2 border ${
                  isSelected
                    ? "bg-sky-600 border-sky-500 text-white shadow-lg shadow-sky-950"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>#{p.id} {p.name}</span>
                <span className="text-[10px] font-mono opacity-80 uppercase">({p.gameType})</span>
              </button>
            );
          })}
        </div>

        {selectedPost && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-1 space-y-4">
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                  MODE GAME AKTIF POS INI
                </h3>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-3">
                  {selectedPost.gameType === "quiz" && <FileText className="w-5 h-5 text-sky-400" />}
                  {selectedPost.gameType === "tap_reflex" && <Zap className="w-5 h-5 text-amber-400" />}
                  {selectedPost.gameType === "memory_match" && <Eye className="w-5 h-5 text-sky-400" />}
                  {selectedPost.gameType === "speed_math" && <Calculator className="w-5 h-5 text-emerald-400" />}
                  {selectedPost.gameType === "word_scramble" && <HelpCircle className="w-5 h-5 text-indigo-400" />}
                  {selectedPost.gameType === "snake" && <Activity className="w-5 h-5 text-sky-400" />}
                  <div>
                    <h4 className="font-bold text-sm text-slate-100 uppercase">{selectedPost.gameType}</h4>
                    <p className="text-[11px] text-slate-500 font-mono">Batas Waktu: {selectedPost.timeLimit}s</p>
                  </div>
                </div>
              </div>

              {selectedPost.gameType === "quiz" && (
                <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
                  <h3 className="text-xs font-bold uppercase text-slate-200 tracking-wider mb-4">
                    TAMBAH SOAL KUIS / TEBAK GAMBAR
                  </h3>

                  <form onSubmit={handleAddQuestion} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                        Teks Pertanyaan
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={promptText}
                        onChange={(e) => setPromptText(e.target.value)}
                        placeholder="Misal: TEBAK GAMBAR: Gambar manakah ini?"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded-xl text-xs text-slate-100"
                      />
                    </div>

                    {/* File Upload Component */}
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1 flex items-center gap-1">
                        <Upload className="w-3.5 h-3.5 text-sky-400" />
                        <span>Upload File Gambar Soal (Opsional)</span>
                      </label>

                      {imageUrl ? (
                        <div className="relative w-full h-32 rounded-xl overflow-hidden border border-sky-500 bg-slate-950 p-1 group">
                          <img src={imageUrl} alt="Uploaded Preview" className="w-full h-full object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={() => setImageUrl("")}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-950/90 border border-red-800 text-red-300 hover:text-white transition-all shadow-md"
                            title="Hapus Gambar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="relative border-2 border-dashed border-slate-800 hover:border-sky-500 rounded-xl p-4 text-center transition-colors bg-slate-950/60">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            disabled={isUploading}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <Upload className="w-6 h-6 text-slate-500 mx-auto mb-1" />
                          <p className="text-xs font-semibold text-slate-300">
                            {isUploading ? "Mengunggah file..." : "Pilih / Drag File Gambar Di Sini"}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">PNG, JPG, WEBP (Max 5MB)</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 pt-1">
                      <input
                        type="text"
                        required
                        value={optionA}
                        onChange={(e) => setOptionA(e.target.value)}
                        placeholder="Opsi A"
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 focus:border-sky-500 text-xs text-slate-100 rounded-lg"
                      />
                      <input
                        type="text"
                        required
                        value={optionB}
                        onChange={(e) => setOptionB(e.target.value)}
                        placeholder="Opsi B"
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 focus:border-sky-500 text-xs text-slate-100 rounded-lg"
                      />
                      <input
                        type="text"
                        required
                        value={optionC}
                        onChange={(e) => setOptionC(e.target.value)}
                        placeholder="Opsi C"
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 focus:border-sky-500 text-xs text-slate-100 rounded-lg"
                      />
                      <input
                        type="text"
                        required
                        value={optionD}
                        onChange={(e) => setOptionD(e.target.value)}
                        placeholder="Opsi D"
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 focus:border-sky-500 text-xs text-slate-100 rounded-lg"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="block text-[10px] font-semibold uppercase text-slate-400 mb-1">
                          Kunci Jawaban
                        </label>
                        <select
                          value={correctOpt}
                          onChange={(e) => setCorrectOpt(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 text-xs text-sky-400 font-bold rounded-lg"
                        >
                          <option value="A">Opsi A</option>
                          <option value="B">Opsi B</option>
                          <option value="C">Opsi C</option>
                          <option value="D">Opsi D</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold uppercase text-slate-400 mb-1">
                          Bobot Poin
                        </label>
                        <input
                          type="number"
                          value={points}
                          onChange={(e) => setPoints(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 text-xs text-slate-100 font-bold font-mono rounded-lg"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isUploading}
                      className="w-full mt-2 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 font-bold text-xs text-white uppercase shadow-lg shadow-sky-950 disabled:opacity-40"
                    >
                      SIMPAN PERTANYAAN
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2">
              {selectedPost.gameType === "quiz" ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                  <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                      BANK SOAL KUIS - {selectedPost.name} ({questions.length} SOAL)
                    </h2>
                  </div>

                  <div className="divide-y divide-slate-800">
                    {questions.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-500">
                        Belum ada soal kuis terdaftar untuk pos ini. Tambahkan di form sebelah kiri.
                      </div>
                    ) : (
                      questions.map((q, idx) => (
                        <div key={q.id} className="p-5 flex items-start justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-sky-400">#{idx + 1}</span>
                              <h4 className="font-bold text-sm text-slate-100">{q.promptText}</h4>
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                                {q.points} PTS
                              </span>
                            </div>

                            {/* Image Thumbnail Preview if present */}
                            {q.imageUrl && (
                              <div className="w-24 h-16 rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                                <img src={q.imageUrl} alt="Thumbnail Gambar" className="w-full h-full object-cover" />
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {q.options.map((opt, oIdx) => {
                                const letters = ["A", "B", "C", "D"];
                                const isCorrect = letters[oIdx] === q.correctOpt;
                                return (
                                  <div
                                    key={oIdx}
                                    className={`px-2.5 py-1.5 rounded-lg border text-[11px] ${
                                      isCorrect
                                        ? "bg-emerald-950/80 border-emerald-700 text-emerald-300 font-bold"
                                        : "bg-slate-950 border-slate-800 text-slate-400"
                                    }`}
                                  >
                                    <span className="font-bold mr-1.5">{letters[oIdx]}.</span>
                                    <span>{opt}</span>
                                    {isCorrect && <span className="ml-1 text-[10px] font-mono">(Kunci)</span>}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-red-500 text-slate-400 hover:text-red-400 transition-all shrink-0"
                            title="Hapus Soal"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-300">
                  <h3 className="text-base font-bold uppercase text-slate-100 mb-2">
                    KONFIGURASI MODE GAME: {selectedPost.gameType}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                    Mode game ini menggunakan generator sistem otomatis yang dikonfigurasi berdasarkan batas waktu ({selectedPost.timeLimit} detik) dan algoritma tingkat kesulitan pos.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
