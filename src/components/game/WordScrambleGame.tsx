"use client";

import { useState, useEffect } from "react";
import { Clock, HelpCircle, Trophy, Check, RotateCcw } from "lucide-react";
import { formatTime } from "@/lib/utils";

interface WordScrambleProps {
  postName: string;
  groupName: string;
  timeLimit: number;
  onSubmitWordScore: (score: number) => void;
  isSubmitting: boolean;
}

interface ScrambleItem {
  id: number;
  scrambled: string;
  original: string;
  clue: string;
}

const WORDS: ScrambleItem[] = [
  { id: 1, scrambled: "P A N C A S I L A", original: "PANCASILA", clue: "Dasar negara Republik Indonesia" },
  { id: 2, scrambled: "N U S A N T A R A", original: "NUSANTARA", clue: "Nama ibu kota negara baru Indonesia" },
  { id: 3, scrambled: "M O N U M E N", original: "MONUMEN", clue: "Bangunan bersejarah seperti Monas" },
];

export default function WordScrambleGame({
  postName,
  groupName,
  timeLimit,
  onSubmitWordScore,
  isSubmitting,
}: WordScrambleProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userGuess, setUserGuess] = useState("");
  const [solvedCount, setSolvedCount] = useState(0);
  const [gameState, setGameState] = useState<"IDLE" | "PLAYING" | "FINISHED">("IDLE");
  const [timeLeft, setTimeLeft] = useState<number>(timeLimit || 45);

  const currentItem = WORDS[currentIndex];

  const handleStart = () => {
    setCurrentIndex(0);
    setUserGuess("");
    setSolvedCount(0);
    setTimeLeft(timeLimit || 45);
    setGameState("PLAYING");
  };

  useEffect(() => {
    if (gameState !== "PLAYING") return;

    if (timeLeft <= 0 || currentIndex >= WORDS.length) {
      setGameState("FINISHED");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, timeLeft, currentIndex]);

  const handleCheck = () => {
    if (!currentItem || !userGuess) return;

    if (userGuess.trim().toUpperCase() === currentItem.original.toUpperCase()) {
      setSolvedCount((prev) => prev + 1);
    }

    setUserGuess("");
    if (currentIndex < WORDS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setGameState("FINISHED");
    }
  };

  const calculateScore = () => {
    return Math.min(100, solvedCount * 33);
  };

  return (
    <div className="w-full max-w-sm mx-auto p-4 sm:p-6 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-red-950/5 text-slate-900 flex flex-col items-center select-none">
      {/* Header */}
      <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
        <h2 className="text-xs font-bold tracking-wider text-slate-900 uppercase truncate">
          {postName} - {groupName}
        </h2>
        <HelpCircle className="w-4 h-4 text-red-600" />
      </div>

      {gameState === "IDLE" && (
        <div className="text-center py-6 w-full flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mb-4">
            <HelpCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 uppercase mb-2">
            ACAK KATA (WORD SCRAMBLE)
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed mb-6 max-w-xs font-medium">
            Susun susunan huruf yang teracak menjadi kata yang tepat sesuai petunjuk dalam batas waktu {timeLimit} detik!
          </p>

          <button
            type="button"
            onClick={handleStart}
            className="touch-btn w-full font-extrabold uppercase tracking-wider text-sm bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-600/20 transition-all"
          >
            MULAI ACAK KATA
          </button>
        </div>
      )}

      {gameState === "PLAYING" && currentItem && (
        <div className="w-full flex flex-col items-center">
          {/* Header Bar */}
          <div className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl mb-4">
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-red-600">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(timeLeft)}</span>
            </div>

            <div className="text-xs font-semibold text-slate-600">
              Soal <strong className="text-slate-900 font-mono">{currentIndex + 1}</strong> dari {WORDS.length}
            </div>
          </div>

          {/* Scramble Display Card */}
          <div className="w-full p-5 mb-4 bg-slate-50 border border-slate-200 rounded-2xl text-center shadow-inner">
            <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest block mb-1">
              SUSUNAN HURUF TERACAK:
            </span>
            <h3 className="text-xl sm:text-2xl font-black font-mono tracking-widest text-slate-900 mb-3">
              {currentItem.scrambled}
            </h3>
            <p className="text-xs text-slate-600 italic bg-white p-2 rounded-lg border border-slate-200">
              Clue: "{currentItem.clue}"
            </p>
          </div>

          {/* Guess Input */}
          <div className="w-full space-y-3 mb-6">
            <input
              type="text"
              value={userGuess}
              onChange={(e) => setUserGuess(e.target.value.toUpperCase())}
              placeholder="KETIK KATA JAWABAN..."
              className="w-full text-center px-4 py-3 bg-slate-50 border border-slate-300 focus:border-red-600 focus:outline-none rounded-xl text-base font-black font-mono tracking-widest uppercase text-slate-900"
            />

            <button
              type="button"
              onClick={handleCheck}
              disabled={!userGuess.trim()}
              className="touch-btn w-full font-extrabold uppercase tracking-wider text-xs bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-40 text-white rounded-xl shadow-md flex items-center justify-center gap-2"
            >
              <span>SUBMIT KATA</span>
              <Check className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {gameState === "FINISHED" && (
        <div className="text-center py-4 w-full flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mb-3">
            <Trophy className="w-7 h-7 text-red-600" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 uppercase mb-1">
            PERMAINAN SELESAI!
          </h3>
          <p className="text-xs text-slate-600 mb-1">
            Kata Tepat Terjawab: <span className="font-bold text-slate-900">{solvedCount} dari {WORDS.length}</span>
          </p>
          <p className="text-sm font-black text-red-600 mb-4">
            Total Poin Diperoleh: +{calculateScore()} PTS
          </p>

          <button
            type="button"
            onClick={() => onSubmitWordScore(calculateScore())}
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
