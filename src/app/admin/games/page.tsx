"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { PostData, QuestionData } from "@/lib/store";
import { Plus, Edit2, Trash2, ArrowLeft, FileText, CheckCircle2, HelpCircle, Eye, Calculator, Zap, Activity, Upload, Image as ImageIcon, Music, Volume2, X } from "lucide-react";
import Link from "next/link";

export default function AdminGamesPage() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [notification, setNotification] = useState<string>("");

  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [promptText, setPromptText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);

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
        if (!selectedPostId) {
          setSelectedPostId(data.posts[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchQuestions = async (postId: number) => {
    try {
      const res = await fetch(`/api/admin/questions?postId=${postId}`);
      const data = await res.json();
      setQuestions(data.questions || []);
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
      resetForm();
    }
  }, [selectedPostId]);

  const selectedPost = posts.find((p) => p.id === selectedPostId);

  const resetForm = () => {
    setEditingQuestionId(null);
    setPromptText("");
    setImageUrl("");
    setAudioUrl("");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setCorrectOpt("A");
    setPoints(20);
  };

  const handleStartEdit = (q: QuestionData) => {
    setEditingQuestionId(q.id);
    setPromptText(q.promptText);
    setImageUrl(q.imageUrl || "");
    setAudioUrl(q.audioUrl || "");
    setOptionA(q.options[0] || "");
    setOptionB(q.options[1] || "");
    setOptionC(q.options[2] || "");
    setOptionD(q.options[3] || "");
    setCorrectOpt(q.correctOpt || "A");
    setPoints(q.points || 20);
  };

  // Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const inputElement = e.target;
    setIsUploadingImage(true);

    // FileReader local Data URL fallback for instant preview & guaranteed upload
    let localDataUrl = "";
    try {
      localDataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    } catch (readErr) {
      console.warn("FileReader error:", readErr);
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        if (localDataUrl) {
          // Use local Data URL if server endpoint returns non-200
          setImageUrl(localDataUrl);
          setNotification("Gambar berhasil dipasang (Base64 Mode)");
          setTimeout(() => setNotification(""), 3000);
        } else {
          alert(data.error || "Gagal mengunggah gambar");
        }
        return;
      }

      const finalUrl = data.imageUrl || data.fileUrl || data.dataUrl || localDataUrl;
      setImageUrl(finalUrl);
      setNotification("File gambar berhasil diunggah");
      setTimeout(() => setNotification(""), 3000);
    } catch (err) {
      if (localDataUrl) {
        setImageUrl(localDataUrl);
        setNotification("Gambar berhasil dipasang (Base64 Mode)");
        setTimeout(() => setNotification(""), 3000);
      } else {
        alert("Terjadi kesalahan koneksi saat mengunggah gambar");
      }
    } finally {
      setIsUploadingImage(false);
      inputElement.value = "";
    }
  };

  // Audio Upload Handler
  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const inputElement = e.target;
    setIsUploadingAudio(true);

    let localDataUrl = "";
    try {
      localDataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    } catch (readErr) {
      console.warn("FileReader audio error:", readErr);
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        if (localDataUrl) {
          setAudioUrl(localDataUrl);
          setNotification("File audio berhasil dipasang (Base64 Mode)");
          setTimeout(() => setNotification(""), 3000);
        } else {
          alert(data.error || "Gagal mengunggah file audio");
        }
        return;
      }

      const finalUrl = data.audioUrl || data.fileUrl || data.dataUrl || localDataUrl;
      setAudioUrl(finalUrl);
      setNotification("File audio potongan lagu berhasil diunggah (terpotong otomatis max 10s)");
      setTimeout(() => setNotification(""), 3000);
    } catch (err) {
      if (localDataUrl) {
        setAudioUrl(localDataUrl);
        setNotification("File audio berhasil dipasang (Base64 Mode)");
        setTimeout(() => setNotification(""), 3000);
      } else {
        alert("Terjadi kesalahan koneksi saat mengunggah file audio");
      }
    } finally {
      setIsUploadingAudio(false);
      inputElement.value = "";
    }
  };

  const handleAudioTimeUpdate = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const audio = e.currentTarget;
    if (audio.currentTime >= 10) {
      audio.pause();
      audio.currentTime = 0;
    }
  };

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPostId || !promptText || !optionA || !optionB || !optionC || !optionD) return;

    try {
      if (editingQuestionId) {
        // Edit existing question
        const res = await fetch("/api/admin/questions", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingQuestionId,
            promptText,
            imageUrl: imageUrl.trim() || null,
            audioUrl: audioUrl.trim() || null,
            options: [optionA, optionB, optionC, optionD],
            correctOpt,
            points,
          }),
        });

        if (res.ok) {
          setNotification(`Soal #${editingQuestionId} berhasil diperbarui`);
          resetForm();
          fetchQuestions(selectedPostId);
          setTimeout(() => setNotification(""), 3000);
        }
      } else {
        // Create new question
        const res = await fetch("/api/admin/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            postId: selectedPostId,
            promptText,
            imageUrl: imageUrl.trim() || null,
            audioUrl: audioUrl.trim() || null,
            options: [optionA, optionB, optionC, optionD],
            correctOpt,
            points,
          }),
        });

        if (res.ok) {
          setNotification("Pertanyaan kuis baru berhasil ditambahkan");
          resetForm();
          fetchQuestions(selectedPostId);
          setTimeout(() => setNotification(""), 3000);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus soal #${id}?`)) return;

    try {
      const res = await fetch(`/api/admin/questions?id=${id}`, { method: "DELETE" });
      if (res.ok && selectedPostId) {
        setNotification(`Soal #${id} berhasil dihapus`);
        if (editingQuestionId === id) resetForm();
        fetchQuestions(selectedPostId);
        setTimeout(() => setNotification(""), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAllQuestions = async () => {
    if (!selectedPostId) return;
    if (!confirm(`Apakah Anda YAKIN ingin menghapus SEMUA SOAL pada ${selectedPost?.name}? Tindakan ini tidak dapat dibatalkan.`)) return;

    try {
      const res = await fetch(`/api/admin/questions?postId=${selectedPostId}&all=true`, { method: "DELETE" });
      if (res.ok) {
        setNotification(`Seluruh soal pada ${selectedPost?.name} berhasil dihapus`);
        resetForm();
        fetchQuestions(selectedPostId);
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
              PENGATURAN KONTEN & BANK SOAL GAME
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              Kelola soal kuis, upload gambar Tebak Gambar, upload file audio Tebak Lagu (auto 10 detik), atau hapus semua soal
            </p>
          </div>
        </div>

        {notification && (
          <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 flex items-center gap-2">
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
                    ? "bg-red-600 border-red-600 text-white shadow-md shadow-red-600/20"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
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
            {/* Left Column (Form) */}
            <div className="lg:col-span-1 space-y-4">
              <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
                  MODE GAME AKTIF POS INI
                </h3>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                  {selectedPost.gameType === "quiz" && <FileText className="w-5 h-5 text-red-600" />}
                  {selectedPost.gameType === "tap_reflex" && <Zap className="w-5 h-5 text-red-600" />}
                  {selectedPost.gameType === "memory_match" && <Eye className="w-5 h-5 text-red-600" />}
                  {selectedPost.gameType === "speed_math" && <Calculator className="w-5 h-5 text-red-600" />}
                  {selectedPost.gameType === "word_scramble" && <HelpCircle className="w-5 h-5 text-red-600" />}
                  {selectedPost.gameType === "snake" && <Activity className="w-5 h-5 text-red-600" />}
                  {selectedPost.gameType === "endless_runner" && <Zap className="w-5 h-5 text-red-600" />}
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 uppercase">{selectedPost.gameType}</h4>
                    <p className="text-[11px] text-slate-500 font-mono">Batas Waktu: {selectedPost.timeLimit}s</p>
                  </div>
                </div>
              </div>

              {selectedPost.gameType === "quiz" && (
                <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold uppercase text-slate-900 tracking-wider">
                      {editingQuestionId ? `EDIT SOAL #${editingQuestionId}` : "TAMBAH SOAL KUIS BARU"}
                    </h3>
                    {editingQuestionId && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="text-[11px] font-bold text-red-600 hover:underline flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>BATAL EDIT</span>
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleSubmitQuestion} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                        Teks Pertanyaan
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={promptText}
                        onChange={(e) => setPromptText(e.target.value)}
                        placeholder="Misal: TEBAK LAGU: Dengarkan potongan lagu berikut!"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-red-600 focus:outline-none rounded-xl text-xs text-slate-900 font-medium"
                      />
                    </div>

                    {/* Image Upload Field (Tebak Gambar) */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1 flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5 text-red-600" />
                        <span>Upload File Gambar (Opsional - Tebak Gambar)</span>
                      </label>

                      {imageUrl ? (
                        <div className="relative w-full h-28 rounded-xl overflow-hidden border border-red-500 bg-slate-50 p-1 group">
                          <img src={imageUrl} alt="Uploaded Preview" className="w-full h-full object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={() => setImageUrl("")}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-white border border-slate-200 text-red-600 hover:bg-red-50 transition-all shadow-md"
                            title="Hapus Gambar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="relative border-2 border-dashed border-slate-200 hover:border-red-500 rounded-xl p-3 text-center transition-colors bg-slate-50">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={isUploadingImage}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                          <p className="text-xs font-semibold text-slate-700">
                            {isUploadingImage ? "Mengunggah gambar..." : "Pilih File Gambar"}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Audio Upload Field (Tebak Lagu - Auto 10 Seconds) */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1 flex items-center gap-1">
                        <Music className="w-3.5 h-3.5 text-red-600" />
                        <span>Upload File Suara (Opsional - Auto Potong Max 10 Detik)</span>
                      </label>

                      {audioUrl ? (
                        <div className="p-3 rounded-xl border border-red-200 bg-red-50 flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-red-700 flex items-center gap-1">
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Klip Audio Terpasang (Max 10s)</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setAudioUrl("")}
                              className="text-red-600 hover:text-red-700 text-xs font-bold flex items-center gap-1"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Hapus Audio</span>
                            </button>
                          </div>
                          <audio
                            src={audioUrl}
                            onTimeUpdate={handleAudioTimeUpdate}
                            controls
                            className="w-full h-8 rounded"
                          />
                          <p className="text-[10px] text-slate-500 italic">
                            *Audio otomatis berhenti pada detik ke-10 saat diputar oleh peserta.
                          </p>
                        </div>
                      ) : (
                        <div className="relative border-2 border-dashed border-slate-200 hover:border-red-500 rounded-xl p-3 text-center transition-colors bg-slate-50">
                          <input
                            type="file"
                            accept="audio/*,.mp3,.wav,.m4a,.ogg"
                            onChange={handleAudioUpload}
                            disabled={isUploadingAudio}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <Music className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                          <p className="text-xs font-semibold text-slate-700">
                            {isUploadingAudio ? "Mengunggah audio..." : "Pilih File Audio (.mp3, .wav, .m4a)"}
                          </p>
                          <p className="text-[10px] text-red-600 font-mono mt-0.5">Otomatis terpotong 10 detik pertama</p>
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
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-red-600 text-xs text-slate-900 rounded-lg font-medium"
                      />
                      <input
                        type="text"
                        required
                        value={optionB}
                        onChange={(e) => setOptionB(e.target.value)}
                        placeholder="Opsi B"
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-red-600 text-xs text-slate-900 rounded-lg font-medium"
                      />
                      <input
                        type="text"
                        required
                        value={optionC}
                        onChange={(e) => setOptionC(e.target.value)}
                        placeholder="Opsi C"
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-red-600 text-xs text-slate-900 rounded-lg font-medium"
                      />
                      <input
                        type="text"
                        required
                        value={optionD}
                        onChange={(e) => setOptionD(e.target.value)}
                        placeholder="Opsi D"
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-red-600 text-xs text-slate-900 rounded-lg font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">
                          Kunci Jawaban
                        </label>
                        <select
                          value={correctOpt}
                          onChange={(e) => setCorrectOpt(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 text-xs text-red-600 font-black rounded-lg"
                        >
                          <option value="A">Opsi A</option>
                          <option value="B">Opsi B</option>
                          <option value="C">Opsi C</option>
                          <option value="D">Opsi D</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">
                          Bobot Poin
                        </label>
                        <input
                          type="number"
                          value={points}
                          onChange={(e) => setPoints(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 text-xs text-slate-900 font-black font-mono rounded-lg"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isUploadingImage || isUploadingAudio}
                      className="w-full mt-2 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 font-extrabold text-xs text-white uppercase shadow-md shadow-red-600/20 disabled:opacity-40"
                    >
                      {editingQuestionId ? "SIMPAN PERUBAHAN SOAL" : "SIMPAN SOAL BARU"}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Right Column (List) */}
            <div className="lg:col-span-2">
              {selectedPost.gameType === "quiz" ? (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl shadow-red-950/5">
                  <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      BANK SOAL KUIS - {selectedPost.name} ({questions.length} SOAL)
                    </h2>

                    {questions.length > 0 && (
                      <button
                        type="button"
                        onClick={handleDeleteAllQuestions}
                        className="px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>HAPUS SEMUA SOAL</span>
                      </button>
                    )}
                  </div>

                  <div className="divide-y divide-slate-100">
                    {questions.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-500">
                        Belum ada soal kuis terdaftar untuk pos ini. Tambahkan di form sebelah kiri.
                      </div>
                    ) : (
                      questions.map((q, idx) => (
                        <div key={q.id} className="p-5 flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs font-bold text-red-600 px-2 py-0.5 rounded bg-red-50 border border-red-200">#{idx + 1}</span>
                              <h4 className="font-bold text-sm text-slate-900">{q.promptText}</h4>
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                {q.points} PTS
                              </span>
                            </div>

                            {/* Media Previews (Image / Audio) */}
                            <div className="flex flex-wrap items-center gap-3">
                              {q.imageUrl && (
                                <div className="w-24 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                                  <img src={q.imageUrl} alt="Thumbnail Gambar" className="w-full h-full object-cover" />
                                </div>
                              )}

                              {q.audioUrl && (
                                <div className="p-2 rounded-lg border border-red-200 bg-red-50 flex items-center gap-2">
                                  <Music className="w-4 h-4 text-red-600 shrink-0" />
                                  <audio
                                    src={q.audioUrl}
                                    onTimeUpdate={handleAudioTimeUpdate}
                                    controls
                                    className="h-7 w-48"
                                  />
                                  <span className="text-[10px] font-bold text-red-600 font-mono">(Max 10s)</span>
                                </div>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                              {q.options.map((opt, oIdx) => {
                                const letters = ["A", "B", "C", "D"];
                                const isCorrect = letters[oIdx] === q.correctOpt;
                                return (
                                  <div
                                    key={oIdx}
                                    className={`px-2.5 py-1.5 rounded-lg border text-[11px] ${
                                      isCorrect
                                        ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold"
                                        : "bg-slate-50 border-slate-200 text-slate-600"
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

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(q)}
                              className="p-2 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 transition-all"
                              title="Edit Soal Ini"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="p-2 rounded-xl bg-slate-100 border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-500 hover:text-red-600 transition-all"
                              title="Hapus Soal Ini"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-700 shadow-sm">
                  <h3 className="text-base font-extrabold uppercase text-slate-900 mb-2">
                    KONFIGURASI MODE GAME: {selectedPost.gameType}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed font-medium">
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
