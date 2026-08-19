"use client";

import { useState, useEffect } from "react";
import { Clock, Trophy, ShieldCheck, Star, Sparkles, Flame, Eye, Zap, Award, Compass, Heart, CheckCircle2, ChevronRight, Gift } from "lucide-react";
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
  isBonusCard?: boolean; // Special bonus card for 3x3 Stage 2 (9th card)
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
];

export default function MemoryGame({
  postName,
  groupName,
  timeLimit,
  onSubmitMemoryScore,
  isSubmitting,
}: MemoryGameProps) {
  // Stage state: 1, 2, 3
  const [currentStage, setCurrentStage] = useState<1 | 2 | 3>(1);
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedPairsCount, setMatchedPairsCount] = useState<number>(0);
  const [accumulatedPoints, setAccumulatedPoints] = useState<number>(0);
  const [gameState, setGameState] = useState<"IDLE" | "PLAYING" | "STAGE_CLEAR" | "FINISHED">("IDLE");
  const [timeLeft, setTimeLeft] = useState<number>(timeLimit || 300); // 5 Menit (300 Detik)

  // Initialize cards for a given stage
  const setupStage = (stage: 1 | 2 | 3) => {
    if (stage === 1) {
      // Stage 1: 2x2 Grid (4 Cards = 2 Pairs)
      const selectedSymbols = ALL_SYMBOLS.slice(0, 2);
      const cardDeck: CardItem[] = [];
      selectedSymbols.forEach((sym) => {
        cardDeck.push({ id: cardDeck.length, symbolId: sym.id, symbolName: sym.name, isFlipped: false, isMatched: false });
        cardDeck.push({ id: cardDeck.length, symbolId: sym.id, symbolName: sym.name, isFlipped: false, isMatched: false });
      });
      const shuffled = cardDeck.sort(() => Math.random() - 0.5).map((card, idx) => ({ ...card, id: idx }));
      setCards(shuffled);
    } else if (stage === 2) {
      // Stage 2: 3x3 Full Grid (9 Cards = 8 Cards/4 Pairs + 1 Special Bonus Card in Center!)
      const selectedSymbols = ALL_SYMBOLS.slice(0, 4);
      const cardDeck: CardItem[] = [];
      selectedSymbols.forEach((sym) => {
        cardDeck.push({ id: cardDeck.length, symbolId: sym.id, symbolName: sym.name, isFlipped: false, isMatched: false });
        cardDeck.push({ id: cardDeck.length, symbolId: sym.id, symbolName: sym.name, isFlipped: false, isMatched: false });
      });
      const shuffled8 = cardDeck.sort(() => Math.random() - 0.5);
      
      // Insert Bonus Card in the middle (index 4 of 9 slots)
      const bonusCard: CardItem = {
        id: 999,
        symbolId: 999,
        symbolName: "Bonus",
        isFlipped: false,
        isMatched: false,
        isBonusCard: true,
      };

      // Exactly 9 cards in 3x3 layout
      const grid9: CardItem[] = [
        ...shuffled8.slice(0, 4),
        bonusCard,
        ...shuffled8.slice(4, 8),
      ].map((card, idx) => ({ ...card, id: idx }));

      setCards(grid9);
    } else if (stage === 3) {
      // Stage 3: 4x4 Grid (16 Cards = 8 Pairs)
      const selectedSymbols = ALL_SYMBOLS.slice(0, 8);
      const cardDeck: CardItem[] = [];
      selectedSymbols.forEach((sym) => {
        cardDeck.push({ id: cardDeck.length, symbolId: sym.id, symbolName: sym.name, isFlipped: false, isMatched: false });
        cardDeck.push({ id: cardDeck.length, symbolId: sym.id, symbolName: sym.name, isFlipped: false, isMatched: false });
      });
      const shuffled = cardDeck.sort(() => Math.random() - 0.5).map((card, idx) => ({ ...card, id: idx }));
      setCards(shuffled);
    }

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

    const clickedCard = cards[index];

    // Special Bonus Card handling in Stage 2 (3x3 grid middle slot)
    if (clickedCard.isBonusCard && !clickedCard.isMatched) {
      setCards((prev) =>
        prev.map((c, i) => (i === index ? { ...c, isFlipped: true, isMatched: true } : c))
      );
      setAccumulatedPoints((prev) => prev + 50); // Bonus 50 PTS!
      return;
    }

    if (flippedIndices.length >= 2) return;
    if (clickedCard.isFlipped || clickedCard.isMatched) return;

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
            const requiredPairs = currentStage === 1 ? 2 : currentStage === 2 ? 4 : 8;

            if (nextCount === requiredPairs) {
              // Stage Completed!
              const stagePoints = currentStage === 1 ? 100 : currentStage === 2 ? 200 : 300;
              setAccumulatedPoints((prev) => prev + stagePoints);

              if (currentStage === 3) {
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
    <div className="w-full max-w-sm mx-auto p-4 sm:p-6 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-sm text-slate-100 flex flex-col items-center select-none">
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
            GAME MEMORY MATCH (3 STAGE)
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-4 max-w-xs">
            Waktu: <span className="font-bold text-sky-400">5 Menit</span> | <span className="font-bold text-emerald-400">Stage 1 (2x2)</span> &rarr; <span className="font-bold text-sky-400">Stage 2 (3x3 Grid)</span> &rarr; <span className="font-bold text-amber-400">Stage 3 (4x4)</span>
          </p>

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
              STAGE {currentStage} / 3
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
                <span>LANJUT KE STAGE {currentStage + 1} ({currentStage + 1 === 2 ? "3x3 GRID" : "4x4 GRID"})</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              className={`w-full grid gap-2.5 mb-4 p-2.5 bg-slate-950 border border-slate-800 rounded-2xl ${
                currentStage === 1
                  ? "grid-cols-2 max-w-[200px]"
                  : currentStage === 2
                  ? "grid-cols-3 max-w-[280px]"
                  : "grid-cols-4 max-w-[340px]"
              }`}
            >
              {cards.map((card, idx) => {
                const SymbolIcon = ALL_SYMBOLS.find((s) => s.id === card.symbolId)?.Icon || Star;
                const isShow = card.isFlipped || card.isMatched;

                if (card.isBonusCard) {
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleCardClick(idx)}
                      disabled={card.isMatched}
                      className={`h-20 rounded-xl border-2 font-bold flex flex-col items-center justify-center transition-all duration-300 select-none ${
                        card.isMatched
                          ? "bg-amber-950/80 border-amber-500 text-amber-300 opacity-90 shadow-md"
                          : "bg-amber-950/40 border-amber-600/80 hover:border-amber-400 text-amber-400 animate-pulse-subtle"
                      }`}
                    >
                      {card.isMatched ? (
                        <div className="flex flex-col items-center">
                          <Gift className="w-6 h-6 text-amber-400" />
                          <span className="text-[10px] font-mono font-bold text-amber-300">+50 PTS</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-0.5">
                          <Gift className="w-5 h-5 text-amber-400" />
                          <span className="text-[9px] font-bold text-amber-300 uppercase">BONUS</span>
                        </div>
                      )}
                    </button>
                  );
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleCardClick(idx)}
                    disabled={card.isMatched}
                    className={`h-20 rounded-xl border-2 font-bold flex flex-col items-center justify-center transition-all duration-300 select-none ${
                      card.isMatched
                        ? "bg-emerald-950/60 border-emerald-500 text-emerald-300 opacity-80"
                        : isShow
                        ? "bg-sky-950 border-sky-400 text-sky-200 shadow-md scale-95"
                        : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-600"
                    }`}
                  >
                    {isShow ? (
                      <SymbolIcon className="w-6 h-6 stroke-[2]" />
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
            Stage Dicapai: <span className="font-bold text-slate-200">{currentStage} / 3 Stage</span>
          </p>
          <p className="text-sm font-extrabold text-amber-400 mb-4">
            Total Poin Diperoleh: +{accumulatedPoints} PTS
          </p>
          <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
            Poin ini akan otomatis diakumulasikan ke skor total {groupName}.
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
