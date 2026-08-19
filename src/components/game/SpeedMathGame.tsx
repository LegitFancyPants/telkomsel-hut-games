"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, Trophy, Calculator, CheckCircle2, Delete, Zap } from "lucide-react";
import { formatTime } from "@/lib/utils";

interface SpeedMathGameProps {
  postName: string;
  groupName: string;
  timeLimit: number; // 120 seconds (2 minutes)
  onSubmitMathScore: (score: number) => void;
  isSubmitting: boolean;
}

interface GeneratedMathProblem {
  expression: string;
  answer: number;
  level: number;
}

export default function SpeedMathGame({
  postName,
  groupName,
  timeLimit,
  onSubmitMathScore,
  isSubmitting,
}: SpeedMathGameProps) {
  const [solvedCount, setSolvedCount] = useState<number>(0);
  const [streakCount, setStreakCount] = useState<number>(0);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [problem, setProblem] = useState<GeneratedMathProblem | null>(null);
  const [gameState, setGameState] = useState<"IDLE" | "PLAYING" | "FINISHED">("IDLE");
  const [timeLeft, setTimeLeft] = useState<number>(timeLimit || 120); // Default 2 Menit (120s)
  const [feedback, setFeedback] = useState<"CORRECT" | "WRONG" | null>(null);

  // Dynamic Math Problem Generator with Bulletproof Precision
  const generateProblem = useCallback((currentSolved: number): GeneratedMathProblem => {
    let level = 1;
    let numOperands = 2;

    if (currentSolved >= 13) {
      level = 3;
      numOperands = 4;
    } else if (currentSolved >= 6) {
      level = 2;
      numOperands = 3;
    }

    if (numOperands === 2) {
      // Level 1: 2 operands
      const op = ["+", "-", "×"][Math.floor(Math.random() * 3)];
      if (op === "+") {
        const a = Math.floor(Math.random() * 15) + 2;
        const b = Math.floor(Math.random() * 15) + 2;
        return { expression: `${a} + ${b}`, answer: a + b, level };
      } else if (op === "-") {
        const b = Math.floor(Math.random() * 12) + 2;
        const a = b + Math.floor(Math.random() * 15) + 1; // a > b guaranteed!
        return { expression: `${a} - ${b}`, answer: a - b, level };
      } else {
        const a = Math.floor(Math.random() * 9) + 2;
        const b = Math.floor(Math.random() * 9) + 2;
        return { expression: `${a} × ${b}`, answer: a * b, level };
      }
    } else if (numOperands === 3) {
      // Level 2: 3 operands (e.g. 5 + 8 - 4 or 3 x 4 + 5)
      const type = Math.floor(Math.random() * 3);
      if (type === 0) {
        // a + b - c
        const a = Math.floor(Math.random() * 10) + 2;
        const b = Math.floor(Math.random() * 10) + 2;
        const c = Math.floor(Math.random() * (a + b - 1)) + 1; // c < (a + b)
        return { expression: `${a} + ${b} - ${c}`, answer: a + b - c, level };
      } else if (type === 1) {
        // a × b + c
        const a = Math.floor(Math.random() * 6) + 2;
        const b = Math.floor(Math.random() * 6) + 2;
        const c = Math.floor(Math.random() * 10) + 1;
        return { expression: `${a} × ${b} + ${c}`, answer: a * b + c, level };
      } else {
        // a + b + c
        const a = Math.floor(Math.random() * 10) + 2;
        const b = Math.floor(Math.random() * 10) + 2;
        const c = Math.floor(Math.random() * 10) + 2;
        return { expression: `${a} + ${b} + ${c}`, answer: a + b + c, level };
      }
    } else {
      // Level 3: 4 operands (e.g. 4 + 6 + 5 - 3 or 2 x 4 + 6 - 3)
      const type = Math.floor(Math.random() * 3);
      if (type === 0) {
        // a + b + c - d
        const a = Math.floor(Math.random() * 8) + 2;
        const b = Math.floor(Math.random() * 8) + 2;
        const c = Math.floor(Math.random() * 8) + 2;
        const d = Math.floor(Math.random() * (a + b + c - 1)) + 1;
        return { expression: `${a} + ${b} + ${c} - ${d}`, answer: a + b + c - d, level };
      } else if (type === 1) {
        // a × b + c - d
        const a = Math.floor(Math.random() * 5) + 2;
        const b = Math.floor(Math.random() * 5) + 2;
        const c = Math.floor(Math.random() * 8) + 2;
        const d = Math.floor(Math.random() * (a * b + c - 1)) + 1;
        return { expression: `${a} × ${b} + ${c} - ${d}`, answer: a * b + c - d, level };
      } else {
        // a + b + c + d
        const a = Math.floor(Math.random() * 8) + 2;
        const b = Math.floor(Math.random() * 8) + 2;
        const c = Math.floor(Math.random() * 8) + 2;
        const d = Math.floor(Math.random() * 8) + 2;
        return { expression: `${a} + ${b} + ${c} + ${d}`, answer: a + b + c + d, level };
      }
    }
  }, []);

  const handleStart = () => {
    setSolvedCount(0);
    setStreakCount(0);
    setTotalScore(0);
    setUserAnswer("");
    setTimeLeft(timeLimit || 120);
    setProblem(generateProblem(0));
    setGameState("PLAYING");
  };

  // Timer Effect (2 Minutes = 120 Seconds)
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

  // Keypad press handler
  const handleKeyClick = (numStr: string) => {
    if (gameState !== "PLAYING") return;
    if (userAnswer.length >= 5) return;
    setUserAnswer((prev) => prev + numStr);
  };

  const handleBackspace = () => {
    setUserAnswer((prev) => prev.slice(0, -1));
  };

  const handleCheckAnswer = () => {
    if (!problem || !userAnswer || gameState !== "PLAYING") return;

    const numericAnswer = Number(userAnswer);

    if (numericAnswer === problem.answer) {
      // Correct!
      const newSolved = solvedCount + 1;
      const newStreak = streakCount + 1;
      const basePoints = 20; // 20 PTS per correct math
      const streakBonus = newStreak % 5 === 0 ? 50 : 0; // Bonus +50 PTS every 5 streak!

      setSolvedCount(newSolved);
      setStreakCount(newStreak);
      setTotalScore((prev) => prev + basePoints + streakBonus);

      setFeedback("CORRECT");
      setTimeout(() => setFeedback(null), 300);

      setUserAnswer("");
      setProblem(generateProblem(newSolved));
    } else {
      // Wrong
      setStreakCount(0);
      setFeedback("WRONG");
      setTimeout(() => setFeedback(null), 300);
      setUserAnswer("");
    }
  };

  const handleFinishSubmit = () => {
    onSubmitMathScore(totalScore);
  };

  return (
    <div className="w-full max-w-sm mx-auto p-4 sm:p-6 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-sm text-slate-100 flex flex-col items-center select-none">
      {/* Header */}
      <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <h2 className="text-xs font-bold tracking-wider text-slate-200 uppercase truncate">
          {postName} - {groupName}
        </h2>
        <Calculator className="w-4 h-4 text-emerald-400" />
      </div>

      {gameState === "IDLE" && (
        <div className="text-center py-6 w-full flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-950/60 border border-emerald-800 flex items-center justify-center mb-4">
            <Calculator className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-base font-bold text-slate-100 uppercase mb-2">
            SPEED MATH CHALLENGE (2 MENIT)
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-4 max-w-xs">
            Kerjakan soal aritmatika sebanyak-banyaknya dalam waktu <span className="font-bold text-sky-400">2 Menit</span>! Soal akan terus bertambah panjang seiring banyaknya soal yang berhasil diselesaikan.
          </p>

          <button
            type="button"
            onClick={handleStart}
            className="touch-btn w-full font-bold uppercase tracking-wider text-sm bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg transition-all"
          >
            MULAI HITUNG CEPAT (2 MENIT)
          </button>
        </div>
      )}

      {gameState === "PLAYING" && problem && (
        <div className="w-full flex flex-col items-center">
          {/* Header Bar */}
          <div className="w-full flex items-center justify-between px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl mb-3">
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-sky-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(timeLeft)}</span>
            </div>

            <div className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300">
              TINGKAT {problem.level} ({problem.level === 1 ? "2 Angka" : problem.level === 2 ? "3 Angka" : "4 Angka"})
            </div>

            <div className="text-xs font-mono font-bold text-amber-400">
              {totalScore} PTS
            </div>
          </div>

          {/* Stats Bar */}
          <div className="w-full flex items-center justify-between px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg mb-3 text-xs">
            <span className="text-slate-400">Terjawab: <strong className="text-slate-200 font-mono">{solvedCount} Soal</strong></span>
            <span className="text-slate-400 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
              Streak: <strong className="text-amber-400 font-mono">{streakCount}x</strong>
            </span>
          </div>

          {/* Math Problem Card Display */}
          <div
            className={`w-full p-6 mb-4 bg-slate-950 border-2 rounded-2xl text-center shadow-inner flex flex-col items-center transition-all ${
              feedback === "CORRECT"
                ? "border-emerald-500 bg-emerald-950/40"
                : feedback === "WRONG"
                ? "border-red-500 bg-red-950/40"
                : "border-slate-800"
            }`}
          >
            <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-wider text-slate-100 mb-3">
              {problem.expression} = ?
            </div>

            <div className="w-full max-w-[180px] h-11 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center font-mono font-black text-xl text-emerald-400 tracking-widest shadow-inner">
              {userAnswer || <span className="text-slate-700 text-sm font-sans font-normal">Input Jawaban</span>}
            </div>
          </div>

          {/* Numeric Keypad (0-9, Backspace, Submit) */}
          <div className="w-full grid grid-cols-3 gap-2 mb-4">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyClick(num)}
                className="h-12 rounded-xl bg-slate-950 border border-slate-800 active:bg-slate-800 text-slate-100 font-mono font-bold text-lg flex items-center justify-center touch-manipulation shadow-md"
              >
                {num}
              </button>
            ))}

            <button
              type="button"
              onClick={handleBackspace}
              className="h-12 rounded-xl bg-slate-950 border border-slate-800 active:bg-slate-800 text-red-400 font-bold flex items-center justify-center touch-manipulation shadow-md"
              title="Hapus"
            >
              <Delete className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => handleKeyClick("0")}
              className="h-12 rounded-xl bg-slate-950 border border-slate-800 active:bg-slate-800 text-slate-100 font-mono font-bold text-lg flex items-center justify-center touch-manipulation shadow-md"
            >
              0
            </button>

            <button
              type="button"
              onClick={handleCheckAnswer}
              disabled={!userAnswer}
              className="h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-40 text-white font-extrabold text-xs uppercase flex items-center justify-center touch-manipulation shadow-lg tracking-wider"
            >
              JAWAB
            </button>
          </div>
        </div>
      )}

      {gameState === "FINISHED" && (
        <div className="text-center py-4 w-full flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-950 border border-emerald-800 flex items-center justify-center mb-3">
            <Trophy className="w-7 h-7 text-emerald-400" />
          </div>
          <h3 className="text-base font-bold text-slate-100 uppercase mb-1">
            WAKTU 2 MENIT HABIS!
          </h3>
          <p className="text-xs text-slate-400 mb-1">
            Soal Terjawab: <span className="font-bold text-slate-200">{solvedCount} Soal</span>
          </p>
          <p className="text-sm font-extrabold text-amber-400 mb-4">
            Total Poin Diperoleh: +{totalScore} PTS
          </p>
          <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
            Poin ini akan otomatis diakumulasikan ke total skor {groupName}.
          </p>

          <button
            type="button"
            onClick={handleFinishSubmit}
            disabled={isSubmitting}
            className="touch-btn w-full font-bold uppercase tracking-wider text-sm bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg transition-all"
          >
            {isSubmitting ? "MEMPROSES..." : "SUBMIT SKOR KE KELOMPOK"}
          </button>
        </div>
      )}
    </div>
  );
}
