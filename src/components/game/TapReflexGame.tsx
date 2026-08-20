"use client";

import { useState, useEffect } from "react";
import { Zap, Clock, Trophy } from "lucide-react";
import { formatTime } from "@/lib/utils";

interface TapReflexGameProps {
  postName: string;
  groupName: string;
  timeLimit: number; // e.g. 15s or 30s
  onSubmitReflexScore: (score: number) => void;
  isSubmitting: boolean;
}

export default function TapReflexGame({
  postName,
  groupName,
  timeLimit,
  onSubmitReflexScore,
  isSubmitting,
}: TapReflexGameProps) {
  const [gameState, setGameState] = useState<"IDLE" | "PLAYING" | "FINISHED">("IDLE");
  const [tapCount, setTapCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit || 15);

  useEffect(() => {
    if (gameState !== "PLAYING") return;

    if (timeLeft <= 0) {
      setGameState("FINISHED");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const handleStart = () => {
    setTapCount(0);
    setTimeLeft(timeLimit || 15);
    setGameState("PLAYING");
  };

  const handleTap = () => {
    if (gameState === "PLAYING") {
      setTapCount((prev) => prev + 1);
    }
  };

  const handleFinishSubmit = () => {
    // 2 points per tap, max 100 points
    const earnedPoints = Math.min(100, tapCount * 2);
    onSubmitReflexScore(earnedPoints);
  };

  return (
    <div className="w-full max-w-sm mx-auto p-4 sm:p-6 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-red-950/5 text-slate-900 flex flex-col items-center select-none">
      {/* Header */}
      <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
        <h2 className="text-xs font-bold tracking-wider text-slate-900 uppercase truncate">
          {postName} - {groupName}
        </h2>
        <Zap className="w-4 h-4 text-red-600" />
      </div>

      {gameState === "IDLE" && (
        <div className="text-center py-6 w-full flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mb-4">
            <Zap className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 uppercase mb-2">
            GAME KETANGKASAN REFLEX
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed mb-6 max-w-xs font-medium">
            Ketuk tombol secepat mungkin dalam waktu {timeLimit} detik untuk mengumpulkan poin tertinggi kelompok Anda!
          </p>

          <button
            type="button"
            onClick={handleStart}
            className="touch-btn w-full font-extrabold uppercase tracking-wider text-sm bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl shadow-lg shadow-red-600/20 transition-all"
          >
            MULAI GAME REFLEX
          </button>
        </div>
      )}

      {gameState === "PLAYING" && (
        <div className="w-full flex flex-col items-center">
          {/* Timer & Score counter */}
          <div className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl mb-4">
            <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-red-600">
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeLeft)}</span>
            </div>
            <div className="text-sm font-bold text-slate-800">
              TAP: <span className="text-red-600 font-mono text-lg font-black">{tapCount}</span>
            </div>
          </div>

          {/* Big Interactive Tap Button */}
          <button
            type="button"
            onClick={handleTap}
            className="w-48 h-48 rounded-full bg-gradient-to-tr from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 active:scale-95 text-white font-black text-2xl shadow-2xl shadow-red-600/30 flex flex-col items-center justify-center border-4 border-white transition-transform touch-manipulation my-4"
          >
            <Zap className="w-12 h-12 mb-1 animate-pulse fill-white" />
            <span>KETUK!</span>
          </button>
        </div>
      )}

      {gameState === "FINISHED" && (
        <div className="text-center py-6 w-full flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mb-4">
            <Trophy className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 uppercase mb-2">
            WAKTU HABIS!
          </h3>
          <p className="text-xs text-slate-600 mb-1">
            Jumlah Ketukan: <span className="font-bold text-slate-900">{tapCount} Kali</span>
          </p>
          <p className="text-sm font-black text-red-600 mb-6">
            Poin Diperoleh: +{Math.min(100, tapCount * 2)} PTS
          </p>

          <button
            type="button"
            onClick={handleFinishSubmit}
            disabled={isSubmitting}
            className="touch-btn w-full font-extrabold uppercase tracking-wider text-sm bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg transition-all"
          >
            {isSubmitting ? "MEMPROSES..." : "SUBMIT SKOR KE KELOMPOK"}
          </button>
        </div>
      )}
    </div>
  );
}
