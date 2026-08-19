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
    <div className="w-full max-w-sm mx-auto p-4 sm:p-6 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-sm text-slate-100 flex flex-col items-center">
      {/* Header */}
      <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <h2 className="text-xs font-bold tracking-wider text-slate-200 uppercase truncate">
          {postName} - {groupName}
        </h2>
        <HelpCircle className="w-4 h-4 text-indigo-400" />
      </div>

      {gameState === "IDLE" && (
        <div className="text-center py-6 w-full flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-950/60 border border-indigo-800 flex items-center justify-center mb-4">
            <HelpCircle className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-base font-bold text-slate-100 uppercase mb-2">
            GAME TEBAK KATA ACAK
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-6 max-w-xs">
            Susun kata yang diacak menjadi kata yang tepat berdasarkan petunjuk dalam waktu {timeLimit} detik!
          </p>

          <button
            type="button"
            onClick={handleStart}
            className="touch-btn w-full font-bold uppercase tracking-wider text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg transition-all"
          >
            MULAI TEBAK KATA
          </button>
        </div>
      )}

      {gameState === "PLAYING" && currentItem && (
        <div className="w-full flex flex-col items-center">
          {/* Header Bar */}
          <div className="w-full flex items-center justify-between px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl mb-4">
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-indigo-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(timeLeft)}</span>
            </div>
            <div className="text-xs font-bold text-slate-300">
              KATA <span className="font-mono text-sky-400">{currentIndex + 1}/{WORDS.length}</span>
            </div>
          </div>

          {/* Clue Card */}
          <div className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-center mb-3">
            <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">
              PETUNJUK / CLUE:
            </span>
            <p className="text-xs font-medium text-slate-200">
              "{currentItem.clue}"
            </p>
          </div>

          {/* Scrambled Word Tile Display */}
          <div className="w-full py-4 px-3 bg-indigo-950/40 border border-indigo-800/80 rounded-2xl text-center mb-4">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-1">
              KATA ACAK:
            </span>
            <span className="font-mono font-black text-xl text-indigo-200 tracking-widest uppercase">
              {currentItem.scrambled}
            </span>
          </div>

          {/* Guess Input */}
          <div className="w-full mb-4">
            <input
              type="text"
              value={userGuess}
              onChange={(e) => setUserGuess(e.target.value.toUpperCase())}
              placeholder="Ketik jawaban Anda..."
              className="w-full px-4 py-3 bg-slate-950 border-2 border-indigo-500/80 focus:border-indigo-400 focus:outline-none rounded-xl text-center font-mono font-bold text-lg uppercase tracking-wider text-slate-100 placeholder:text-slate-600 placeholder:font-sans placeholder:text-xs"
            />
          </div>

          {/* Buttons */}
          <div className="w-full grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setUserGuess("")}
              className="touch-btn bg-slate-950 border border-slate-800 hover:bg-slate-800 text-xs font-bold text-slate-400 uppercase rounded-xl flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESET</span>
            </button>

            <button
              type="button"
              onClick={handleCheck}
              disabled={!userGuess}
              className="touch-btn bg-indigo-600 hover:bg-indigo-500 text-xs font-bold uppercase text-white rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              <span>SUBMIT</span>
              <Check className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      )}

      {gameState === "FINISHED" && (
        <div className="text-center py-4 w-full flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-950 border border-indigo-800 flex items-center justify-center mb-3">
            <Trophy className="w-7 h-7 text-indigo-400" />
          </div>
          <h3 className="text-base font-bold text-slate-100 uppercase mb-1">
            PERMAINAN SELESAI!
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Kata Benar: <span className="font-bold text-slate-200">{solvedCount}/{WORDS.length}</span> | Poin Diperoleh: <span className="font-bold text-indigo-400">{calculateScore()} Poin</span>
          </p>

          <button
            type="button"
            onClick={() => onSubmitWordScore(calculateScore())}
            disabled={isSubmitting}
            className="touch-btn w-full font-bold uppercase tracking-wider text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg transition-all"
          >
            {isSubmitting ? "MEMPROSES..." : "SUBMIT SKOR POS"}
          </button>
        </div>
      )}
    </div>
  );
}
