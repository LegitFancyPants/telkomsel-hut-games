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
            dark: "#000000", // Standard classic black QR code
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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 print:bg-white print:text-slate-950">
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        {/* Header (Hidden on Print) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200 print:hidden">
          <div>
            <Link href="/admin/dashboard" className="text-xs font-bold text-red-600 flex items-center gap-1 mb-2 hover:underline">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Dashboard Admin</span>
            </Link>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-wide">
              GENERATOR & CETAK QR CODE POS AKTIF ({qrItems.length} POS)
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              Cetak stiker / banner QR code resmi secara otomatis sesuai jumlah pos aktif di manajemen pos
            </p>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            disabled={isLoading || qrItems.length === 0}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 font-extrabold text-xs text-white flex items-center gap-2 shadow-lg shadow-red-600/20 transition-all disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            <span>CETAK DOKUMEN / BANNER ({qrItems.length} POS)</span>
          </button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="p-12 text-center text-xs font-bold text-slate-500 animate-pulse print:hidden">
            Mengambil data pos aktif & meng-generate QR Code...
          </div>
        ) : qrItems.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-2xl shadow-sm">
            Tidak ada pos aktif yang ditemukan. Silakan aktifkan pos terlebih dahulu pada halaman Manajemen Pos.
          </div>
        ) : (
          /* Printable Cards Container - 1 QR Code per printed page */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 print:block print:w-full">
            {qrItems.map((item) => (
              <div
                key={item.id}
                style={{ pageBreakAfter: "always", breakAfter: "page" }}
                className="p-6 bg-white border-2 border-red-600/20 rounded-3xl flex flex-col items-center text-center shadow-xl shadow-red-950/5 print:bg-white print:border-4 print:border-red-600 print:shadow-none print:min-h-[88vh] print:justify-between print:p-8 print:mb-0 print:rounded-3xl"
              >
                <div className="w-full pb-3 mb-4 border-b border-slate-200 print:border-slate-300">
                  <span className="text-[11px] font-black tracking-widest text-red-600 uppercase print:text-red-600 print:text-sm">
                    POS PERMAINAN FISIK #{item.id}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 uppercase print:text-3xl print:text-slate-950 print:mt-1">
                    {item.name}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500 font-bold uppercase print:text-slate-700 print:text-xs">
                    Mode: {item.gameType} ({item.timeLimit}s)
                  </span>
                </div>

                {/* QR Image - Enlarged on Print */}
                {item.qrDataUrl && (
                  <div className="p-3 bg-white border-2 border-slate-200 rounded-2xl mb-4 shadow-sm print:border-4 print:border-slate-300 print:p-6 print:my-4">
                    <img
                      src={item.qrDataUrl}
                      alt={`QR Code ${item.name}`}
                      className="w-48 h-48 sm:w-56 sm:h-56 object-contain print:w-72 print:h-72"
                    />
                  </div>
                )}

                <p className="text-xs font-mono font-medium text-slate-600 mb-3 print:text-slate-800 print:text-sm">
                  URL: {originUrl}/pos/{item.slug}
                </p>

                <div className="w-full py-3 bg-red-50 border border-red-200 rounded-2xl print:bg-slate-100 print:border-2 print:border-slate-300">
                  <p className="text-sm font-black text-slate-900 uppercase tracking-wider print:text-slate-950 print:text-base">
                    PIN POS: <span className="font-mono text-red-600 text-base print:text-red-600 print:text-lg font-black">{item.pinCode}</span>
                  </p>
                  <p className="text-[10px] text-slate-500 print:text-slate-600 print:text-xs">
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
