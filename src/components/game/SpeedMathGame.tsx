"use client";

import { useState, useEffect } from "react";
import { Clock, Calculator, Trophy, Check, Delete } from "lucide-react";
import { formatTime } from "@/lib/utils";

interface SpeedMathGameProps {
  postName: string;
  groupName: string;
  timeLimit: number;
  onSubmitMathScore: (score: number) => void;
  isSubmitting: boolean;
}

interface MathProblem {
  num1: number;
  num2: number;
  op: "+" | "-";
  answer: number;
}

const PROBLEMS: MathProblem[] = [
  { num1: 15, num2: 27, op: "+", answer: 42 },
  { num1: 64, num2: 18, op: "-", answer: 46 },
  { num1: 32, num2: 45, op: "+", answer: 77 },
  { num1: 90, num2: 37, op: "-", answer: 53 },
  { num1: 28, num2: 34, op: "+", answer: 62 },
];

export default function SpeedMathGame({
  postName,
  groupName,
  timeLimit,
  onSubmitMathScore,
  isSubmitting,
}: SpeedMathGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [correctCount, setCorrectCount] = useState(0);
  const [gameState, setGameState] = useState<"IDLE" | "PLAYING" | "FINISHED">("IDLE");
  const [timeLeft, setTimeLeft] = useState<number>(timeLimit || 45);

  const currentProblem = PROBLEMS[currentIndex];

  const handleStart = () => {
    setCurrentIndex(0);
    setUserInput("");
    setCorrectCount(0);
    setTimeLeft(timeLimit || 45);
    setGameState("PLAYING");
  };

  useEffect(() => {
    if (gameState !== "PLAYING") return;

    if (timeLeft <= 0 || currentIndex >= PROBLEMS.length) {
      setGameState("FINISHED");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, timeLeft, currentIndex]);

  const handleNumClick = (val: string) => {
    if (userInput.length < 3) {
      setUserInput((prev) => prev + val);
    }
  };

  const handleBackspace = () => {
    setUserInput((prev) => prev.slice(0, -1));
  };

  const handleSubmitAnswer = () => {
    if (!currentProblem || !userInput) return;

    if (parseInt(userInput, 10) === currentProblem.answer) {
      setCorrectCount((prev) => prev + 1);
    }

    setUserInput("");
    if (currentIndex < PROBLEMS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setGameState("FINISHED");
    }
  };

  const calculateScore = () => {
    return Math.min(100, correctCount * 20);
  };

  return (
    <div className="w-full max-w-sm mx-auto p-4 sm:p-6 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-sm text-slate-100 flex flex-col items-center">
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
            SPEED MATH CHALLENGE
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-6 max-w-xs">
            Selesaikan soal matematika sederhana secepat mungkin dalam waktu {timeLimit} detik!
          </p>

          <button
            type="button"
            onClick={handleStart}
            className="touch-btn w-full font-bold uppercase tracking-wider text-sm bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg transition-all"
          >
            MULAI HITUNG CEPAT
          </button>
        </div>
      )}

      {gameState === "PLAYING" && currentProblem && (
        <div className="w-full flex flex-col items-center">
          {/* Header Bar */}
          <div className="w-full flex items-center justify-between px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl mb-4">
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-emerald-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(timeLeft)}</span>
            </div>
            <div className="text-xs font-bold text-slate-300">
              SOAL <span className="font-mono text-sky-400">{currentIndex + 1}/{PROBLEMS.length}</span>
            </div>
          </div>

          {/* Problem Display Card */}
          <div className="w-full py-5 px-4 bg-slate-950 border border-slate-800 rounded-2xl text-center mb-4 shadow-inner">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              BERAPAKAH HASIL DARI:
            </span>
            <h3 className="text-3xl font-black font-mono tracking-widest text-slate-100">
              {currentProblem.num1} {currentProblem.op} {currentProblem.num2} = ?
            </h3>
          </div>

          {/* Input Box */}
          <div className="w-full h-12 bg-slate-950 border-2 border-emerald-500/80 rounded-xl flex items-center justify-center mb-4">
            <span className="font-mono font-black text-2xl text-emerald-400 tracking-widest">
              {userInput || "_"}
            </span>
          </div>

          {/* Keypad */}
          <div className="w-full grid grid-cols-3 gap-2 mb-4">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleNumClick(num)}
                className="touch-btn text-lg font-bold bg-slate-950 border border-slate-800 hover:bg-slate-800 rounded-xl flex items-center justify-center transition-all"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleBackspace}
              className="touch-btn bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 rounded-xl flex items-center justify-center"
            >
              <Delete className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => handleNumClick("0")}
              className="touch-btn text-lg font-bold bg-slate-950 border border-slate-800 hover:bg-slate-800 rounded-xl flex items-center justify-center"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleSubmitAnswer}
              disabled={!userInput}
              className="touch-btn bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center justify-center disabled:opacity-40"
            >
              <Check className="w-6 h-6 stroke-[3]" />
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
            PERMAINAN SELESAI!
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Soal Benar: <span className="font-bold text-slate-200">{correctCount}/{PROBLEMS.length}</span> | Poin Diperoleh: <span className="font-bold text-emerald-400">{calculateScore()} Poin</span>
          </p>

          <button
            type="button"
            onClick={() => onSubmitMathScore(calculateScore())}
            disabled={isSubmitting}
            className="touch-btn w-full font-bold uppercase tracking-wider text-sm bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg transition-all"
          >
            {isSubmitting ? "MEMPROSES..." : "SUBMIT SKOR POS"}
          </button>
        </div>
      )}
    </div>
  );
}
