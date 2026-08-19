"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import Navbar from "@/components/Navbar";
import { Printer, ArrowLeft, QrCode as QrIcon } from "lucide-react";
import Link from "next/link";
import { PostData } from "@/lib/store";

interface PosQrItem {
  id: number;
  name: string;
  slug: string;
  pinCode: string;
  gameType: string;
  timeLimit: number;
  qrDataUrl: string;
}

export default function QrGeneratorPage() {
  const [qrItems, setQrItems] = useState<PosQrItem[]>([]);
  const [originUrl, setOriginUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchActivePostsAndGenerateQrs = async () => {
    setIsLoading(true);
    const currentOrigin = window.location.origin;
    setOriginUrl(currentOrigin);

    try {
      const res = await fetch("/api/admin/posts");
      const data = await res.json();
      
      const allPosts: PostData[] = data.posts || [];
      // Filter for active posts (pos aktif)
      const activePosts = allPosts.filter((p) => p.isActive);

      const items: PosQrItem[] = [];
      for (const p of activePosts) {
        const fullUrl = `${currentOrigin}/pos/${p.slug}`;
        const url = await QRCode.toDataURL(fullUrl, {
          width: 300,
          margin: 2,
          color: {
            dark: "#0f172a",
            light: "#ffffff",
          },
        });
        items.push({
          id: p.id,
          name: p.name,
          slug: p.slug,
          pinCode: p.pinCode,
          gameType: p.gameType,
          timeLimit: p.timeLimit,
          qrDataUrl: url,
        });
      }
      setQrItems(items);
    } catch (e) {
      console.error("Gagal mengambil data pos untuk QR code:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivePostsAndGenerateQrs();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 print:bg-white print:text-slate-950">
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        {/* Header (Hidden on Print) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800 print:hidden">
          <div>
            <Link href="/admin/dashboard" className="text-xs font-semibold text-sky-400 flex items-center gap-1 mb-2 hover:underline">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Dashboard Admin</span>
            </Link>
            <h1 className="text-2xl font-extrabold text-slate-100 uppercase tracking-wide">
              GENERATOR & CETAK QR CODE POS AKTIF ({qrItems.length} POS)
            </h1>
            <p className="text-xs text-slate-400">
              Cetak stiker / banner QR code resmi secara otomatis sesuai jumlah pos aktif di manajemen pos
            </p>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            disabled={isLoading || qrItems.length === 0}
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 font-bold text-xs text-white flex items-center gap-2 shadow-lg shadow-sky-950 transition-all disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            <span>CETAK DOKUMEN / BANNER ({qrItems.length} POS)</span>
          </button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="p-12 text-center text-xs font-semibold text-slate-400 animate-pulse print:hidden">
            Mengambil data pos aktif & meng-generate QR Code...
          </div>
        ) : qrItems.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
            Tidak ada pos aktif yang ditemukan. Silakan aktifkan pos terlebih dahulu pada halaman Manajemen Pos.
          </div>
        ) : (
          /* Printable Grid Cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 print:grid-cols-2 print:gap-8">
            {qrItems.map((item) => (
              <div
                key={item.id}
                className="p-6 bg-slate-900 border-2 border-slate-800 rounded-3xl flex flex-col items-center text-center shadow-2xl print:bg-white print:border-4 print:border-slate-900 print:shadow-none print:break-inside-avoid"
              >
                <div className="w-full pb-3 mb-4 border-b border-slate-800 print:border-slate-300">
                  <span className="text-[11px] font-extrabold tracking-widest text-sky-400 uppercase print:text-slate-700">
                    POS PERMAINAN FISIK #{item.id}
                  </span>
                  <h3 className="text-lg font-black text-slate-100 uppercase print:text-slate-950">
                    {item.name}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400 uppercase print:text-slate-600">
                    Mode: {item.gameType} ({item.timeLimit}s)
                  </span>
                </div>

                {/* QR Image */}
                {item.qrDataUrl && (
                  <div className="p-3 bg-white border-2 border-slate-200 rounded-2xl mb-4 shadow-md">
                    <img
                      src={item.qrDataUrl}
                      alt={`QR Code ${item.name}`}
                      className="w-48 h-48 object-contain"
                    />
                  </div>
                )}

                <p className="text-xs font-mono text-slate-400 mb-2 print:text-slate-700">
                  URL: {originUrl}/pos/{item.slug}
                </p>

                <div className="w-full py-2.5 bg-slate-950 border border-slate-800 rounded-xl print:bg-slate-100 print:border-slate-300">
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-wider print:text-slate-900">
                    PIN POS: <span className="font-mono text-sky-400 text-sm print:text-slate-950 font-black">{item.pinCode}</span>
                  </p>
                  <p className="text-[10px] text-slate-500 print:text-slate-600">
                    (Diberikan oleh penjaga pos fisik kepada kelompok peserta)
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
