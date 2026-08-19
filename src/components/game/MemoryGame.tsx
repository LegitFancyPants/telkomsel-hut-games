"use client";

import { useState, useEffect } from "react";
import { Clock, Trophy, ShieldCheck, Star, Sparkles, Flame, Eye, Zap, Award, Compass, Heart, Crown, Gem, Sun, Target, CheckCircle2, ChevronRight } from "lucide-react";
import { formatTime } from "@/lib/utils";

interface MemoryGameProps {
  postName: string;
  groupName: string;
  timeLimit: number; // 300 seconds (5 minutes)
  onSubmitMemoryScore: (score: number) => void;
  isSubmitting: boolean;
}

interface CardItem {
  id: number;
  symbolId: number;
  symbolName: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const ALL_SYMBOLS = [
  { id: 1, name: "Star", Icon: Star },
  { id: 2, name: "Shield", Icon: ShieldCheck },
  { id: 3, name: "Sparkles", Icon: Sparkles },
  { id: 4, name: "Flame", Icon: Flame },
  { id: 5, name: "Zap", Icon: Zap },
  { id: 6, name: "Award", Icon: Award },
  { id: 7, name: "Compass", Icon: Compass },
  { id: 8, name: "Heart", Icon: Heart },
  { id: 9, name: "Crown", Icon: Crown },
  { id: 10, name: "Gem", Icon: Gem },
  { id: 11, name: "Sun", Icon: Sun },
  { id: 12, name: "Target", Icon: Target },
];

export default function MemoryGame({
  postName,
  groupName,
  timeLimit,
  onSubmitMemoryScore,
  isSubmitting,
}: MemoryGameProps) {
  // Stage state: 1, 2, 3, 4, 5
  const [currentStage, setCurrentStage] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedPairsCount, setMatchedPairsCount] = useState<number>(0);
  const [accumulatedPoints, setAccumulatedPoints] = useState<number>(0);
  const [gameState, setGameState] = useState<"IDLE" | "PLAYING" | "STAGE_CLEAR" | "FINISHED">("IDLE");
  const [timeLeft, setTimeLeft] = useState<number>(timeLimit || 300); // 5 Menit (300 Detik)

  // Initialize cards for a given stage
  const setupStage = (stage: 1 | 2 | 3 | 4 | 5) => {
    let pairCount = 2;
    if (stage === 1) pairCount = 2; // Stage 1: 2x2 = 4 cards (2 pairs)
    if (stage === 2) pairCount = 4; // Stage 2: 2x4 = 8 cards (4 pairs)
    if (stage === 3) pairCount = 8; // Stage 3: 4x4 = 16 cards (8 pairs)
    if (stage === 4) pairCount = 10; // Stage 4: 4x5 = 20 cards (10 pairs)
    if (stage === 5) pairCount = 12; // Stage 5: 4x6 = 24 cards (12 pairs)

    const selectedSymbols = ALL_SYMBOLS.slice(0, pairCount);
    const cardDeck: CardItem[] = [];

    selectedSymbols.forEach((sym) => {
      cardDeck.push({ id: cardDeck.length, symbolId: sym.id, symbolName: sym.name, isFlipped: false, isMatched: false });
      cardDeck.push({ id: cardDeck.length, symbolId: sym.id, symbolName: sym.name, isFlipped: false, isMatched: false });
    });

    const shuffled = cardDeck.sort(() => Math.random() - 0.5).map((card, idx) => ({ ...card, id: idx }));
    setCards(shuffled);
    setFlippedIndices([]);
    setMatchedPairsCount(0);
  };

  const handleStartGame = () => {
    setCurrentStage(1);
    setAccumulatedPoints(0);
    setTimeLeft(timeLimit || 300);
    setupStage(1);
    setGameState("PLAYING");
  };

  const handleNextStage = () => {
    if (currentStage === 1) {
      setCurrentStage(2);
      setupStage(2);
      setGameState("PLAYING");
    } else if (currentStage === 2) {
      setCurrentStage(3);
      setupStage(3);
      setGameState("PLAYING");
    } else if (currentStage === 3) {
      setCurrentStage(4);
      setupStage(4);
      setGameState("PLAYING");
    } else if (currentStage === 4) {
      setCurrentStage(5);
      setupStage(5);
      setGameState("PLAYING");
    } else {
      setGameState("FINISHED");
    }
  };

  // Timer Effect (5 Minutes Total)
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

  // Card Flip Logic
  const handleCardClick = (index: number) => {
    if (gameState !== "PLAYING") return;
    if (flippedIndices.length >= 2) return;
    if (cards[index].isFlipped || cards[index].isMatched) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      const [firstIdx, secondIdx] = newFlipped;
      if (cards[firstIdx].symbolId === cards[secondIdx].symbolId) {
        // Match found!
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c, i) =>
              i === firstIdx || i === secondIdx ? { ...c, isMatched: true } : c
            )
          );
          setFlippedIndices([]);
          setMatchedPairsCount((prevCount) => {
            const nextCount = prevCount + 1;
            const requiredPairs =
              currentStage === 1
                ? 2
                : currentStage === 2
                ? 4
                : currentStage === 3
                ? 8
                : currentStage === 4
                ? 10
                : 12;

            if (nextCount === requiredPairs) {
              // Stage Completed!
              const stagePoints =
                currentStage === 1
                  ? 100
                  : currentStage === 2
                  ? 200
                  : currentStage === 3
                  ? 300
                  : currentStage === 4
                  ? 400
                  : 500;

              setAccumulatedPoints((prev) => prev + stagePoints);

              if (currentStage === 5) {
                setGameState("FINISHED");
              } else {
                setGameState("STAGE_CLEAR");
              }
            }
            return nextCount;
          });
        }, 400);
      } else {
        // Flip back
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c, i) =>
              i === firstIdx || i === secondIdx ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedIndices([]);
        }, 800);
      }
    }
  };

  const handleFinishSubmit = () => {
    onSubmitMemoryScore(accumulatedPoints);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-sm text-slate-100 flex flex-col items-center select-none">
      {/* Header */}
      <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <h2 className="text-xs font-bold tracking-wider text-slate-200 uppercase truncate">
          {postName} - {groupName}
        </h2>
        <Eye className="w-4 h-4 text-sky-400" />
      </div>

      {gameState === "IDLE" && (
        <div className="text-center py-6 w-full flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-sky-950/60 border border-sky-800 flex items-center justify-center mb-4">
            <Eye className="w-8 h-8 text-sky-400" />
          </div>
          <h3 className="text-base font-bold text-slate-100 uppercase mb-2">
            GAME MEMORY MATCH (5 STAGE)
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-4 max-w-xs">
            Waktu: <span className="font-bold text-sky-400">5 Menit</span> | Selesaikan hingga <span className="font-bold text-amber-400">Stage 5 (Grid 4x6)</span>!
          </p>
          <div className="flex flex-wrap justify-center gap-1.5 text-[10px] text-slate-400 mb-6 font-mono">
            <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">S1: 2x2</span>
            <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-sky-300 font-bold">S2: 2x4</span>
            <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">S3: 4x4</span>
            <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">S4: 4x5</span>
            <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-amber-400 font-bold">S5: 4x6</span>
          </div>

          <button
            type="button"
            onClick={handleStartGame}
            className="touch-btn w-full font-bold uppercase tracking-wider text-sm bg-sky-600 hover:bg-sky-500 text-white rounded-xl shadow-lg transition-all"
          >
            MULAI GAME MEMORI (STAGE 1)
          </button>
        </div>
      )}

      {(gameState === "PLAYING" || gameState === "STAGE_CLEAR") && (
        <div className="w-full flex flex-col items-center">
          {/* Header Bar */}
          <div className="w-full flex items-center justify-between px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl mb-3">
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-sky-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(timeLeft)}</span>
            </div>

            <div className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-sky-950 border border-sky-800 text-sky-300">
              STAGE {currentStage} / 5
            </div>

            <div className="text-xs font-mono font-bold text-amber-400">
              {accumulatedPoints} PTS
            </div>
          </div>

          {/* Grid Layouts depending on Stage */}
          {gameState === "STAGE_CLEAR" ? (
            <div className="w-full py-8 px-4 bg-slate-950 border border-slate-800 rounded-2xl text-center mb-4 flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black uppercase text-emerald-400 mb-1">
                STAGE {currentStage} SELESAI!
              </h3>
              <p className="text-xs text-slate-300 mb-4">
                Poin Terkumpul: <span className="font-bold text-amber-400">+{accumulatedPoints} PTS</span>
              </p>
              <button
                type="button"
                onClick={handleNextStage}
                className="touch-btn w-full font-bold uppercase text-xs bg-sky-600 hover:bg-sky-500 text-white rounded-xl flex items-center justify-center gap-2 shadow-lg"
              >
                <span>
                  LANJUT KE STAGE {currentStage + 1} (
                  {currentStage + 1 === 2
                    ? "2x4 GRID"
                    : currentStage + 1 === 3
                    ? "4x4 GRID"
                    : currentStage + 1 === 4
                    ? "4x5 GRID"
                    : "4x6 GRID"}
                  )
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              className={`w-full grid gap-2 mb-4 p-2 bg-slate-950 border border-slate-800 rounded-2xl ${
                currentStage === 1
                  ? "grid-cols-2 max-w-[200px]"
                  : currentStage === 2
                  ? "grid-cols-4 max-w-[340px]"
                  : currentStage === 3
                  ? "grid-cols-4 max-w-[340px]"
                  : currentStage === 4
                  ? "grid-cols-5 max-w-[380px]"
                  : "grid-cols-6 max-w-[420px]"
              }`}
            >
              {cards.map((card, idx) => {
                const SymbolIcon = ALL_SYMBOLS.find((s) => s.id === card.symbolId)?.Icon || Star;
                const isShow = card.isFlipped || card.isMatched;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleCardClick(idx)}
                    disabled={card.isMatched}
                    className={`h-16 sm:h-20 rounded-xl border-2 font-bold flex flex-col items-center justify-center transition-all duration-300 select-none ${
                      card.isMatched
                        ? "bg-emerald-950/60 border-emerald-500 text-emerald-300 opacity-80"
                        : isShow
                        ? "bg-sky-950 border-sky-400 text-sky-200 shadow-md scale-95"
                        : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-600"
                    }`}
                  >
                    {isShow ? (
                      <SymbolIcon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
                    ) : (
                      <span className="text-xs font-black font-mono text-slate-700">?</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {gameState === "FINISHED" && (
        <div className="text-center py-4 w-full flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-sky-950 border border-sky-800 flex items-center justify-center mb-3">
            <Trophy className="w-7 h-7 text-sky-400" />
          </div>
          <h3 className="text-base font-bold text-slate-100 uppercase mb-1">
            PERMAINAN SELESAI!
          </h3>
          <p className="text-xs text-slate-400 mb-1">
            Stage Dicapai: <span className="font-bold text-slate-200">{currentStage} / 5 Stage</span>
          </p>
          <p className="text-sm font-extrabold text-amber-400 mb-4">
            Total Poin Diperoleh: +{accumulatedPoints} PTS
          </p>
          <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
            Poin ini akan otomatis diakumulasikan ke total skor {groupName}.
          </p>

          <button
            type="button"
            onClick={handleFinishSubmit}
            disabled={isSubmitting}
            className="touch-btn w-full font-bold uppercase tracking-wider text-sm bg-sky-600 hover:bg-sky-500 text-white rounded-xl shadow-lg transition-all"
          >
            {isSubmitting ? "MEMPROSES..." : "SUBMIT SKOR KE KELOMPOK"}
          </button>
        </div>
      )}
    </div>
  );
}
