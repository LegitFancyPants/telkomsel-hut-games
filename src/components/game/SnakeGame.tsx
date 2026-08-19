"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Clock, Trophy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RefreshCw, Activity, Heart } from "lucide-react";
import { formatTime } from "@/lib/utils";

interface SnakeGameProps {
  postName: string;
  groupName: string;
  timeLimit: number; // e.g. 300 seconds (5 minutes)
  onSubmitSnakeScore: (score: number) => void;
  isSubmitting: boolean;
}

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Position = { x: number; y: number };

const GRID_SIZE = 14;

export default function SnakeGame({
  postName,
  groupName,
  timeLimit,
  onSubmitSnakeScore,
  isSubmitting,
}: SnakeGameProps) {
  const [snake, setSnake] = useState<Position[]>([
    { x: 6, y: 7 },
    { x: 6, y: 8 },
  ]);
  const [direction, setDirection] = useState<Direction>("UP");
  const [food, setFood] = useState<Position>({ x: 6, y: 3 });
  const [foodsEaten, setFoodsEaten] = useState(0);
  const [lives, setLives] = useState(2); // 2 Kesempatan / Nyawa
  const [gameState, setGameState] = useState<"IDLE" | "PLAYING" | "LIFE_LOST" | "FINISHED">("IDLE");
  const [timeLeft, setTimeLeft] = useState<number>(timeLimit || 300); // Default 5 Menit (300 Detik)
  const [speedMs, setSpeedMs] = useState(200); // Kecepatan awal lebih santai (200ms)

  const directionRef = useRef<Direction>("UP");
  directionRef.current = direction;

  // Generate random food position not on snake body
  const spawnFood = (currentSnake: Position[]) => {
    let newX: number, newY: number;
    while (true) {
      newX = Math.floor(Math.random() * GRID_SIZE);
      newY = Math.floor(Math.random() * GRID_SIZE);
      const onSnake = currentSnake.some((segment) => segment.x === newX && segment.y === newY);
      if (!onSnake) break;
    }
    return { x: newX, y: newY };
  };

  const handleStart = () => {
    const initialSnake = [
      { x: 6, y: 7 },
      { x: 6, y: 8 },
    ];
    setSnake(initialSnake);
    setDirection("UP");
    setFood(spawnFood(initialSnake));
    setFoodsEaten(0);
    setLives(2);
    setSpeedMs(200);
    setTimeLeft(timeLimit || 300);
    setGameState("PLAYING");
  };

  // Respawn snake for Life 2
  const handleUseSecondLife = () => {
    const respawnSnake = [
      { x: 6, y: 7 },
      { x: 6, y: 8 },
    ];
    setSnake(respawnSnake);
    setDirection("UP");
    setFood(spawnFood(respawnSnake));
    setGameState("PLAYING");
  };

  // Change direction with safety check against reversing directly
  const changeDirection = useCallback((newDir: Direction) => {
    const current = directionRef.current;
    if (newDir === "UP" && current !== "DOWN") setDirection("UP");
    if (newDir === "DOWN" && current !== "UP") setDirection("DOWN");
    if (newDir === "LEFT" && current !== "RIGHT") setDirection("LEFT");
    if (newDir === "RIGHT" && current !== "LEFT") setDirection("RIGHT");
  }, []);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== "PLAYING") return;
      if (e.key === "ArrowUp" || e.key === "w") changeDirection("UP");
      if (e.key === "ArrowDown" || e.key === "s") changeDirection("DOWN");
      if (e.key === "ArrowLeft" || e.key === "a") changeDirection("LEFT");
      if (e.key === "ArrowRight" || e.key === "d") changeDirection("RIGHT");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, changeDirection]);

  // Main Game Loop Effect
  useEffect(() => {
    if (gameState !== "PLAYING") return;

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const head = { ...prevSnake[0] };

        if (directionRef.current === "UP") head.y -= 1;
        if (directionRef.current === "DOWN") head.y += 1;
        if (directionRef.current === "LEFT") head.x -= 1;
        if (directionRef.current === "RIGHT") head.x += 1;

        // Collision Check: Wall or Self Collision
        const isWallHit = head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE;
        const isSelfHit = prevSnake.some((segment) => segment.x === head.x && segment.y === head.y);

        if (isWallHit || isSelfHit) {
          if (lives > 1) {
            setLives(1);
            setGameState("LIFE_LOST");
          } else {
            setLives(0);
            setGameState("FINISHED");
          }
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        // Eat Food Check
        if (head.x === food.x && head.y === food.y) {
          setFoodsEaten((prev) => prev + 1);
          setFood(spawnFood(newSnake));
          // Gentler speed ramp-up: decrease interval ms by 3ms per food (min limit 110ms for easy control)
          setSpeedMs((prevMs) => Math.max(110, prevMs - 3));
        } else {
          newSnake.pop(); // Remove tail
        }

        return newSnake;
      });
    };

    const interval = setInterval(moveSnake, speedMs);
    return () => clearInterval(interval);
  }, [gameState, food, speedMs, lives]);

  // Timer Countdown Effect (5 Minutes = 300s)
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

  // Uncapped score: 100 PTS per food eaten
  const calculateTotalScore = () => {
    return foodsEaten * 100;
  };

  return (
    <div className="w-full max-w-sm mx-auto p-4 sm:p-6 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-sm text-slate-100 flex flex-col items-center select-none">
      {/* Header */}
      <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <h2 className="text-xs font-bold tracking-wider text-slate-200 uppercase truncate">
          {postName} - {groupName}
        </h2>
        <Activity className="w-4 h-4 text-sky-400" />
      </div>

      {gameState === "IDLE" && (
        <div className="text-center py-6 w-full flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-sky-950/60 border border-sky-800 flex items-center justify-center mb-4">
            <Activity className="w-8 h-8 text-sky-400" />
          </div>
          <h3 className="text-base font-bold text-slate-100 uppercase mb-2">
            GAME ULAR KETANGKASAN
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-4 max-w-xs">
            Waktu: <span className="font-bold text-sky-400">5 Menit</span> | Kesempatan: <span className="font-bold text-emerald-400">2 Nyawa</span> | Poin: <span className="font-bold text-amber-400">+100 PTS / Makanan</span>
          </p>
          <p className="text-[11px] text-slate-500 mb-6">
            Seluruh poin individu yang Anda dapatkan akan langsung diakumulasikan ke total skor {groupName}!
          </p>

          <button
            type="button"
            onClick={handleStart}
            className="touch-btn w-full font-bold uppercase tracking-wider text-sm bg-sky-600 hover:bg-sky-500 text-white rounded-xl shadow-lg transition-all"
          >
            MULAI GAME ULAR (2 NYAWA)
          </button>
        </div>
      )}

      {(gameState === "PLAYING" || gameState === "LIFE_LOST") && (
        <div className="w-full flex flex-col items-center">
          {/* Status Header Bar */}
          <div className="w-full flex items-center justify-between px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl mb-3">
            {/* Timer */}
            <div className="flex items-center gap-1 font-mono text-xs font-bold text-sky-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(timeLeft)}</span>
            </div>

            {/* Lives / Kesempatan Indicator */}
            <div className="flex items-center gap-1 text-xs font-bold">
              <span className="text-slate-400">NYAWA:</span>
              <div className="flex gap-1">
                <Heart className={`w-3.5 h-3.5 ${lives >= 1 ? "fill-red-500 text-red-500" : "text-slate-700"}`} />
                <Heart className={`w-3.5 h-3.5 ${lives >= 2 ? "fill-red-500 text-red-500" : "text-slate-700"}`} />
              </div>
            </div>

            {/* Accumulated Score */}
            <div className="font-mono text-xs font-bold text-amber-400">
              {calculateTotalScore()} PTS
            </div>
          </div>

          {/* Grid Canvas Board (14x14) */}
          <div className="w-64 h-64 bg-slate-950 border-2 border-slate-800 rounded-xl grid grid-cols-14 grid-rows-14 gap-[1px] p-1 mb-4 shadow-inner relative overflow-hidden">
            {/* Life Lost Overlay (2nd Chance Prompt) */}
            {gameState === "LIFE_LOST" && (
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center z-10">
                <span className="text-xs font-extrabold text-amber-400 uppercase tracking-widest mb-1">
                  ULAR MENABRAK!
                </span>
                <p className="text-xs text-slate-300 font-semibold mb-1">
                  Sisa Kesempatan: <span className="text-red-400">1 Nyawa Lagi</span>
                </p>
                <p className="text-[11px] text-slate-400 mb-4">
                  Poin Anda saat ini: <span className="font-bold text-amber-400">{calculateTotalScore()} PTS</span>
                </p>
                <button
                  type="button"
                  onClick={handleUseSecondLife}
                  className="touch-btn w-full px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 font-bold text-xs text-slate-950 uppercase flex items-center justify-center gap-1.5 shadow-lg transition-all"
                >
                  <Heart className="w-4 h-4 fill-slate-950" />
                  <span>GUNAKAN KESEMPATAN KE-2</span>
                </button>
              </div>
            )}

            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
              const x = i % GRID_SIZE;
              const y = Math.floor(i / GRID_SIZE);

              const isHead = snake[0].x === x && snake[0].y === y;
              const isBody = !isHead && snake.some((s) => s.x === x && s.y === y);
              const isFood = food.x === x && food.y === y;

              let cellStyle = "bg-slate-900/40";
              if (isHead) cellStyle = "bg-sky-400 rounded-sm shadow-sm";
              else if (isBody) cellStyle = "bg-sky-600/80 rounded-xs";
              else if (isFood) cellStyle = "bg-emerald-400 rounded-full animate-pulse";

              return <div key={i} className={`w-full h-full ${cellStyle}`} />;
            })}
          </div>

          {/* D-Pad Touch Navigation Buttons */}
          <div className="w-full max-w-[200px] flex flex-col items-center gap-1.5 mb-4">
            <button
              type="button"
              onClick={() => changeDirection("UP")}
              className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 active:bg-sky-600 text-slate-200 flex items-center justify-center touch-manipulation shadow-md"
            >
              <ArrowUp className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => changeDirection("LEFT")}
                className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 active:bg-sky-600 text-slate-200 flex items-center justify-center touch-manipulation shadow-md"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>

              <button
                type="button"
                onClick={() => changeDirection("RIGHT")}
                className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 active:bg-sky-600 text-slate-200 flex items-center justify-center touch-manipulation shadow-md"
              >
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => changeDirection("DOWN")}
              className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 active:bg-sky-600 text-slate-200 flex items-center justify-center touch-manipulation shadow-md"
            >
              <ArrowDown className="w-6 h-6" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setGameState("FINISHED")}
            className="touch-btn w-full font-bold uppercase tracking-wider text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg transition-all"
          >
            SELESAIKAN & SUBMIT SKOR
          </button>
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
            Makanan Dimakan: <span className="font-bold text-slate-200">{foodsEaten}x</span>
          </p>
          <p className="text-sm font-extrabold text-amber-400 mb-4">
            Total Poin Diperoleh: +{calculateTotalScore()} PTS
          </p>
          <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
            Poin ini akan otomatis ditambahkan ke total akumulasi skor {groupName}.
          </p>

          <button
            type="button"
            onClick={() => onSubmitSnakeScore(calculateTotalScore())}
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
