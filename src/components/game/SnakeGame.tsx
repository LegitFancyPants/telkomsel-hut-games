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
  const [lives, setLives] = useState(3); // 3 Kesempatan / Nyawa
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
    setLives(3);
    setSpeedMs(200);
    setTimeLeft(timeLimit || 300);
    setGameState("PLAYING");
  };

  // Respawn snake for Next Life (Resets current score to 0 for the new attempt)
  const handleUseNextLife = () => {
    const respawnSnake = [
      { x: 6, y: 7 },
      { x: 6, y: 8 },
    ];
    setSnake(respawnSnake);
    setDirection("UP");
    setFood(spawnFood(respawnSnake));
    setFoodsEaten(0); // Reset score to 0
    setSpeedMs(200);  // Reset speed
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

  // Overall Session Countdown Timer (5 Minutes Total)
  useEffect(() => {
    if (gameState !== "PLAYING" && gameState !== "LIFE_LOST") return;

    if (timeLeft <= 0) {
      setGameState("FINISHED");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  // Game Movement Loop
  useEffect(() => {
    if (gameState !== "PLAYING") return;

    const gameInterval = setInterval(() => {
      setSnake((prevSnake) => {
        const head = { ...prevSnake[0] };
        const currentDir = directionRef.current;

        if (currentDir === "UP") head.y -= 1;
        if (currentDir === "DOWN") head.y += 1;
        if (currentDir === "LEFT") head.x -= 1;
        if (currentDir === "RIGHT") head.x += 1;

        // Collision Check: Wall / Boundaries
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          handleCollision();
          return prevSnake;
        }

        // Collision Check: Self Body
        const hitSelf = prevSnake.some((segment) => segment.x === head.x && segment.y === head.y);
        if (hitSelf) {
          handleCollision();
          return prevSnake;
        }

        // Food Eaten Check
        const newSnake = [head, ...prevSnake];
        if (head.x === food.x && head.y === food.y) {
          setFoodsEaten((prev) => prev + 1);
          setFood(spawnFood(newSnake));

          // Ramp up speed gently (-3ms per food down to min 110ms)
          setSpeedMs((prev) => Math.max(110, prev - 3));
        } else {
          newSnake.pop(); // Remove tail
        }

        return newSnake;
      });
    }, speedMs);

    return () => clearInterval(gameInterval);
  }, [gameState, food, speedMs]);

  // Collision Handler
  const handleCollision = () => {
    setLives((prevLives) => {
      const remainingLives = prevLives - 1;
      if (remainingLives > 0) {
        setGameState("LIFE_LOST");
      } else {
        setGameState("FINISHED");
      }
      return remainingLives;
    });
  };

  const totalScore = foodsEaten * 100; // +100 PTS per makanan yang dimakan

  const handleFinishSubmit = () => {
    onSubmitSnakeScore(totalScore);
  };

  return (
    <div className="w-full max-w-sm mx-auto p-4 sm:p-6 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-red-950/5 text-slate-900 flex flex-col items-center select-none">
      {/* Header */}
      <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
        <h2 className="text-xs font-bold tracking-wider text-slate-900 uppercase truncate">
          {postName} - {groupName}
        </h2>
        <Activity className="w-4 h-4 text-red-600" />
      </div>

      {gameState === "IDLE" && (
        <div className="text-center py-6 w-full flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mb-4">
            <Activity className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 uppercase mb-2">
            TANTANGAN ULAR (SNAKE GAME)
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed mb-4 max-w-xs font-medium">
            Kumpulkan poin makanan sebanyak-banyaknya dalam batas waktu <span className="font-bold text-red-600">5 Menit</span>! Anda memiliki <span className="font-bold text-red-600">3 Nyawa</span>. Jika lanjut ke nyawa berikutnya saat mati, skor di nyawa sebelumnya akan di-reset.
          </p>

          <button
            type="button"
            onClick={handleStart}
            className="touch-btn w-full font-extrabold uppercase tracking-wider text-sm bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-600/20 transition-all"
          >
            MULAI PERMAINAN ULAR
          </button>
        </div>
      )}

      {gameState === "LIFE_LOST" && (
        <div className="text-center py-4 w-full flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-3 text-amber-600 shadow-sm">
            <Heart className="w-7 h-7 fill-amber-500 text-amber-500" />
          </div>

          <h3 className="text-base font-extrabold text-slate-900 uppercase mb-1">
            {lives === 2 ? "NYAWA KE-1 HABIS!" : "NYAWA KE-2 HABIS!"}
          </h3>

          <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 my-3 text-center">
            <p className="text-xs text-slate-500 font-semibold mb-0.5">Skor Percobaan Ini:</p>
            <p className="text-xl font-black text-red-600">+{totalScore} PTS</p>
            <p className="text-[11px] text-slate-400 font-medium">({foodsEaten} Makanan Dikumpulkan)</p>
          </div>

          <div className="w-full bg-amber-50/80 border border-amber-200 rounded-xl p-2.5 mb-4 text-[11px] text-amber-800 text-left font-medium leading-tight">
            ⚠️ <strong>Perhatian:</strong> Jika memilih <strong>Lanjut Nyawa</strong>, skor <strong>+{totalScore} PTS</strong> ini akan <strong>hangus (di-reset ke 0)</strong> untuk mulai lagi dari awal.
          </div>

          <div className="w-full space-y-2">
            <button
              type="button"
              onClick={() => setGameState("FINISHED")}
              className="touch-btn w-full font-extrabold uppercase tracking-wider text-xs bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl py-3 shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
            >
              <span>SUBMIT SKOR SEKARANG (+{totalScore} PTS)</span>
            </button>

            <button
              type="button"
              onClick={handleUseNextLife}
              className="touch-btn w-full font-extrabold uppercase tracking-wider text-xs bg-slate-100 hover:bg-slate-200 active:bg-slate-300 border border-slate-300 text-slate-800 rounded-xl py-2.5 transition-all flex items-center justify-center gap-1.5"
            >
              <span>LANJUT NYAWA KE-{4 - lives} (RESET SKOR KE 0)</span>
            </button>
          </div>
        </div>
      )}

      {(gameState === "PLAYING" || gameState === "LIFE_LOST") && (
        <div className="w-full flex flex-col items-center">
          {/* Header Bar */}
          <div className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl mb-3">
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-red-600">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(timeLeft)}</span>
            </div>

            {/* Lives Indicator */}
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((l) => (
                <Heart
                  key={l}
                  className={`w-4 h-4 ${
                    l <= lives ? "text-red-600 fill-red-600" : "text-slate-300"
                  }`}
                />
              ))}
            </div>

            <div className="text-xs font-mono font-black text-slate-900">
              {totalScore} PTS
            </div>
          </div>

          {/* Snake Arena (14x14 Grid) */}
          <div
            className="w-full aspect-square max-w-[280px] bg-slate-900 border-2 border-slate-800 rounded-2xl relative overflow-hidden mb-4 grid p-1"
            style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
              const x = index % GRID_SIZE;
              const y = Math.floor(index / GRID_SIZE);

              const isHead = snake[0].x === x && snake[0].y === y;
              const isBody = snake.slice(1).some((seg) => seg.x === x && seg.y === y);
              const isFoodItem = food.x === x && food.y === y;

              return (
                <div
                  key={index}
                  className={`rounded-sm transition-all duration-75 ${
                    isHead
                      ? "bg-red-500 scale-95 border border-red-300 shadow-md"
                      : isBody
                      ? "bg-red-600/80 scale-90"
                      : isFoodItem
                      ? "bg-amber-400 rounded-full scale-90 animate-pulse"
                      : "bg-slate-950/20"
                  }`}
                />
              );
            })}
          </div>

          {/* Touch D-Pad Controls */}
          <div className="w-48 h-36 relative mb-2">
            {/* UP */}
            <button
              type="button"
              onClick={() => changeDirection("UP")}
              className="absolute top-0 left-16 w-16 h-12 bg-slate-100 border border-slate-300 active:bg-red-600 active:text-white text-slate-800 rounded-xl flex items-center justify-center shadow-md touch-manipulation"
            >
              <ArrowUp className="w-6 h-6 stroke-[3]" />
            </button>

            {/* LEFT */}
            <button
              type="button"
              onClick={() => changeDirection("LEFT")}
              className="absolute top-12 left-0 w-16 h-12 bg-slate-100 border border-slate-300 active:bg-red-600 active:text-white text-slate-800 rounded-xl flex items-center justify-center shadow-md touch-manipulation"
            >
              <ArrowLeft className="w-6 h-6 stroke-[3]" />
            </button>

            {/* RIGHT */}
            <button
              type="button"
              onClick={() => changeDirection("RIGHT")}
              className="absolute top-12 right-0 w-16 h-12 bg-slate-100 border border-slate-300 active:bg-red-600 active:text-white text-slate-800 rounded-xl flex items-center justify-center shadow-md touch-manipulation"
            >
              <ArrowRight className="w-6 h-6 stroke-[3]" />
            </button>

            {/* DOWN */}
            <button
              type="button"
              onClick={() => changeDirection("DOWN")}
              className="absolute bottom-0 left-16 w-16 h-12 bg-slate-100 border border-slate-300 active:bg-red-600 active:text-white text-slate-800 rounded-xl flex items-center justify-center shadow-md touch-manipulation"
            >
              <ArrowDown className="w-6 h-6 stroke-[3]" />
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
            Makanan Dikumpulkan: <span className="font-bold text-slate-900">{foodsEaten} Buah</span>
          </p>
          <p className="text-sm font-black text-red-600 mb-4">
            Total Poin Diperoleh: +{totalScore} PTS
          </p>
          <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
            Poin ini akan otomatis diakumulasikan ke total skor {groupName}.
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
