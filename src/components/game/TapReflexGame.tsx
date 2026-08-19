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
    <div className="w-full max-w-sm mx-auto p-4 sm:p-6 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-sm text-slate-100 flex flex-col items-center">
      {/* Header */}
      <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <h2 className="text-xs font-bold tracking-wider text-slate-200 uppercase truncate">
          {postName} - {groupName}
        </h2>
        <Zap className="w-4 h-4 text-amber-400" />
      </div>

      {gameState === "IDLE" && (
        <div className="text-center py-6 w-full flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-950/60 border border-amber-800/80 flex items-center justify-center mb-4">
            <Zap className="w-8 h-8 text-amber-400" />
          </div>
          <h3 className="text-base font-bold text-slate-100 uppercase mb-2">
            GAME KETANGKASAN REFLEX
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-6 max-w-xs">
            Ketuk tombol secepat mungkin dalam waktu {timeLimit} detik untuk mengumpulkan poin tertinggi kelompok Anda!
          </p>

          <button
            type="button"
            onClick={handleStart}
            className="touch-btn w-full font-bold uppercase tracking-wider text-sm bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-slate-950 rounded-xl shadow-lg transition-all"
          >
            MULAI GAME REFLEX
          </button>
        </div>
      )}

      {gameState === "PLAYING" && (
        <div className="w-full flex flex-col items-center">
          {/* Timer & Score counter */}
          <div className="w-full flex items-center justify-between px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl mb-4">
            <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-amber-400">
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeLeft)}</span>
            </div>
            <div className="text-sm font-bold text-slate-200">
              TAP: <span className="text-sky-400 font-mono text-lg">{tapCount}</span>
            </div>
          </div>

          {/* Huge Tap Target Button */}
          <button
            type="button"
            onClick={handleTap}
            className="w-full h-48 bg-gradient-to-b from-sky-600 to-sky-700 active:from-sky-500 active:to-sky-600 border-2 border-sky-400 rounded-2xl shadow-xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform select-none touch-manipulation"
          >
            <span className="text-2xl font-black tracking-widest text-white uppercase">
              TAP SECEPATNYA!
            </span>
            <span className="text-xs font-semibold text-sky-200">
              Jumlah Tap: {tapCount}
            </span>
          </button>
        </div>
      )}

      {gameState === "FINISHED" && (
        <div className="text-center py-4 w-full flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-sky-950 border border-sky-800 flex items-center justify-center mb-3">
            <Trophy className="w-7 h-7 text-sky-400" />
          </div>
          <h3 className="text-base font-bold text-slate-100 uppercase mb-1">
            WAKTU HABIS!
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Total Tap: <span className="font-bold text-slate-200">{tapCount}x</span> | Poin Diperoleh: <span className="font-bold text-sky-400">{Math.min(100, tapCount * 2)} Poin</span>
          </p>

          <button
            type="button"
            onClick={handleFinishSubmit}
            disabled={isSubmitting}
            className="touch-btn w-full font-bold uppercase tracking-wider text-sm bg-sky-600 hover:bg-sky-500 text-white rounded-xl shadow-lg transition-all"
          >
            {isSubmitting ? "MEMPROSES..." : "SUBMIT SKOR POS"}
          </button>
        </div>
      )}
    </div>
  );
}
