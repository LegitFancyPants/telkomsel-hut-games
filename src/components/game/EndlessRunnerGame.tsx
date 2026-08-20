"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Trophy, RefreshCw, Activity, ArrowUp, ArrowDown, Zap, ShieldAlert, Sparkles } from "lucide-react";

interface EndlessRunnerGameProps {
  postName: string;
  groupName: string;
  timeLimit?: number;
  onSubmitRunnerScore: (score: number) => void;
  isSubmitting: boolean;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: "GROUND_SMALL" | "GROUND_TALL" | "GROUND_DOUBLE" | "GROUND_TRIPLE" | "FLYING_LOW" | "FLYING_HIGH";
}

export default function EndlessRunnerGame({
  postName,
  groupName,
  onSubmitRunnerScore,
  isSubmitting,
}: EndlessRunnerGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [gameState, setGameState] = useState<"IDLE" | "PLAYING" | "FINISHED">("IDLE");
  const [distanceMeters, setDistanceMeters] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(0);

  // Mutable Game Engine Refs for 60fps Loop
  const engineRef = useRef({
    isRunning: false,
    frameId: 0,
    speed: 6.0,
    distance: 0,
    // Runner Physics
    runnerX: 60,
    runnerY: 170, // Ground Y
    runnerVY: 0,
    isJumping: false,
    isDucking: false,
    groundY: 170,
    gravity: 0.68,
    jumpForce: -13.8,
    legFrame: 0,
    // Obstacles
    obstacles: [] as Obstacle[],
    nextObstacleTimer: 0,
    // Background
    clouds: [] as { x: number; y: number; speed: number }[],
  });

  const jump = useCallback(() => {
    const engine = engineRef.current;
    if (!engine.isRunning) return;
    if (!engine.isJumping) {
      engine.runnerVY = engine.jumpForce;
      engine.isJumping = true;
      engine.isDucking = false;
    }
  }, []);

  const setDucking = useCallback((ducking: boolean) => {
    const engine = engineRef.current;
    if (!engine.isRunning) return;
    if (!engine.isJumping) {
      engine.isDucking = ducking;
    }
  }, []);

  // Keyboard controls (Jump & Duck)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
        e.preventDefault();
        if (gameState === "PLAYING") {
          jump();
        } else if (gameState === "IDLE") {
          handleStart();
        }
      }
      if (e.code === "ArrowDown" || e.code === "KeyS") {
        e.preventDefault();
        if (gameState === "PLAYING") {
          setDucking(true);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "ArrowDown" || e.code === "KeyS") {
        setDucking(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState, jump, setDucking]);

  // Spawn initial background clouds
  const initClouds = () => {
    return [
      { x: 100, y: 30, speed: 0.8 },
      { x: 300, y: 50, speed: 0.5 },
      { x: 500, y: 25, speed: 0.7 },
    ];
  };

  const handleStart = () => {
    const engine = engineRef.current;
    engine.isRunning = true;
    engine.speed = 6.0;
    engine.distance = 0;
    engine.runnerY = 170;
    engine.runnerVY = 0;
    engine.isJumping = false;
    engine.isDucking = false;
    engine.obstacles = [];
    engine.nextObstacleTimer = 60;
    engine.clouds = initClouds();

    setDistanceMeters(0);
    setPointsEarned(0);
    setGameState("PLAYING");
  };

  // Main Render Loop (60 FPS)
  useEffect(() => {
    if (gameState !== "PLAYING") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const CANVAS_WIDTH = 600;
    const CANVAS_HEIGHT = 240;
    const GROUND_LEVEL = 210;
    const RUNNER_HEIGHT = 40;
    const RUNNER_WIDTH = 26;

    let animId: number;

    const gameLoop = () => {
      const engine = engineRef.current;
      if (!engine.isRunning) return;

      // 1. Dynamic Physics & Progressive Difficulty Speed Scaling
      engine.distance += engine.speed * 0.15;
      const currentDist = Math.floor(engine.distance);

      // Speed increases progressively over distance (up to 14.5x)
      engine.speed = 6.0 + Math.min(8.5, Math.floor(currentDist / 60) * 0.55);

      // Runner Jump & Gravity
      engine.runnerY += engine.runnerVY;
      engine.runnerVY += engine.gravity;

      if (engine.runnerY >= engine.groundY) {
        engine.runnerY = engine.groundY;
        engine.runnerVY = 0;
        engine.isJumping = false;
      }

      engine.legFrame = (engine.legFrame + (engine.speed / 6) * 0.25) % 4;

      // Move Clouds
      engine.clouds.forEach((cloud) => {
        cloud.x -= cloud.speed;
        if (cloud.x < -80) cloud.x = CANVAS_WIDTH + 40;
      });

      // Spawn Structured Combination Patterns & Clusters
      engine.nextObstacleTimer -= 1;
      if (engine.nextObstacleTimer <= 0) {
        const rand = Math.random();
        const spawnX = CANVAS_WIDTH + 20;

        if (currentDist < 70) {
          // Phase 1 (0-70m): Single Small & Tall Cacti
          const isTall = rand > 0.6;
          const obsW = isTall ? 24 : 22;
          const obsH = isTall ? 46 : 36;
          engine.obstacles.push({
            x: spawnX,
            y: GROUND_LEVEL - obsH,
            width: obsW,
            height: obsH,
            type: isTall ? "GROUND_TALL" : "GROUND_SMALL",
          });
          engine.nextObstacleTimer = Math.max(35, 110 - Math.floor(engine.speed * 5)) + Math.floor(Math.random() * 30);
        } else if (currentDist < 180) {
          // Phase 2 (70-180m): Introduces Double Hop Combos & Low Drones
          if (rand > 0.7) {
            // Pattern: Double Hop Combo (2 small cacti spaced for rhythm jump)
            const gap = Math.floor(engine.speed * 26);
            engine.obstacles.push({
              x: spawnX,
              y: GROUND_LEVEL - 36,
              width: 22,
              height: 36,
              type: "GROUND_SMALL",
            });
            engine.obstacles.push({
              x: spawnX + gap,
              y: GROUND_LEVEL - 36,
              width: 22,
              height: 36,
              type: "GROUND_SMALL",
            });
            engine.nextObstacleTimer = Math.max(40, 130 - Math.floor(engine.speed * 5)) + Math.floor(Math.random() * 25);
          } else if (rand > 0.4) {
            // Single Low Drone or Double Cactus
            const isLowDrone = rand > 0.55;
            engine.obstacles.push({
              x: spawnX,
              y: isLowDrone ? GROUND_LEVEL - 34 : GROUND_LEVEL - 36,
              width: isLowDrone ? 32 : 44,
              height: isLowDrone ? 20 : 36,
              type: isLowDrone ? "FLYING_LOW" : "GROUND_DOUBLE",
            });
            engine.nextObstacleTimer = Math.max(35, 105 - Math.floor(engine.speed * 5)) + Math.floor(Math.random() * 30);
          } else {
            engine.obstacles.push({
              x: spawnX,
              y: GROUND_LEVEL - 46,
              width: 24,
              height: 46,
              type: "GROUND_TALL",
            });
            engine.nextObstacleTimer = Math.max(35, 100 - Math.floor(engine.speed * 5)) + Math.floor(Math.random() * 30);
          }
        } else if (currentDist < 380) {
          // Phase 3 (180-380m): Combos Jump-then-Duck & Duck-then-Jump
          if (rand > 0.7) {
            // Combo Pattern: Jump over Cactus THEN Duck under High Drone
            const gap = Math.floor(engine.speed * 28);
            engine.obstacles.push({
              x: spawnX,
              y: GROUND_LEVEL - 36,
              width: 22,
              height: 36,
              type: "GROUND_SMALL",
            });
            engine.obstacles.push({
              x: spawnX + gap,
              y: GROUND_LEVEL - 58,
              width: 34,
              height: 22,
              type: "FLYING_HIGH",
            });
            engine.nextObstacleTimer = Math.max(45, 140 - Math.floor(engine.speed * 5)) + Math.floor(Math.random() * 25);
          } else if (rand > 0.4) {
            // Combo Pattern: Duck under High Drone THEN Jump over Low Drone
            const gap = Math.floor(engine.speed * 26);
            engine.obstacles.push({
              x: spawnX,
              y: GROUND_LEVEL - 58,
              width: 34,
              height: 22,
              type: "FLYING_HIGH",
            });
            engine.obstacles.push({
              x: spawnX + gap,
              y: GROUND_LEVEL - 34,
              width: 32,
              height: 20,
              type: "FLYING_LOW",
            });
            engine.nextObstacleTimer = Math.max(45, 135 - Math.floor(engine.speed * 5)) + Math.floor(Math.random() * 25);
          } else {
            engine.obstacles.push({
              x: spawnX,
              y: GROUND_LEVEL - 36,
              width: 44,
              height: 36,
              type: "GROUND_DOUBLE",
            });
            engine.nextObstacleTimer = Math.max(35, 95 - Math.floor(engine.speed * 5)) + Math.floor(Math.random() * 25);
          }
        } else {
          // Phase 4 (380m+ Extreme): Advanced Passable Combo Mixes
          if (rand > 0.75) {
            // Combo Pattern: Dual High Drones (Sustained Ducking)
            const gap = Math.floor(engine.speed * 14);
            engine.obstacles.push({
              x: spawnX,
              y: GROUND_LEVEL - 58,
              width: 34,
              height: 22,
              type: "FLYING_HIGH",
            });
            engine.obstacles.push({
              x: spawnX + gap,
              y: GROUND_LEVEL - 58,
              width: 34,
              height: 22,
              type: "FLYING_HIGH",
            });
            engine.nextObstacleTimer = Math.max(45, 125 - Math.floor(engine.speed * 5)) + Math.floor(Math.random() * 20);
          } else if (rand > 0.5) {
            // Combo Pattern: Jump Ground Double THEN Duck High Drone
            const gap = Math.floor(engine.speed * 30);
            engine.obstacles.push({
              x: spawnX,
              y: GROUND_LEVEL - 36,
              width: 44,
              height: 36,
              type: "GROUND_DOUBLE",
            });
            engine.obstacles.push({
              x: spawnX + gap,
              y: GROUND_LEVEL - 58,
              width: 34,
              height: 22,
              type: "FLYING_HIGH",
            });
            engine.nextObstacleTimer = Math.max(45, 145 - Math.floor(engine.speed * 5)) + Math.floor(Math.random() * 20);
          } else if (rand > 0.25) {
            // Triple Cactus Sprint
            engine.obstacles.push({
              x: spawnX,
              y: GROUND_LEVEL - 36,
              width: 62,
              height: 36,
              type: "GROUND_TRIPLE",
            });
            engine.nextObstacleTimer = Math.max(35, 90 - Math.floor(engine.speed * 5)) + Math.floor(Math.random() * 20);
          } else {
            // Fast Single Flying Low Drone
            engine.obstacles.push({
              x: spawnX,
              y: GROUND_LEVEL - 34,
              width: 34,
              height: 20,
              type: "FLYING_LOW",
            });
            engine.nextObstacleTimer = Math.max(30, 85 - Math.floor(engine.speed * 5)) + Math.floor(Math.random() * 20);
          }
        }
      }

      // Move & Filter Obstacles
      engine.obstacles.forEach((obs) => {
        obs.x -= engine.speed;
      });
      engine.obstacles = engine.obstacles.filter((obs) => obs.x + obs.width > -10);

      // Collision Detection Hitbox (Adjusted for Ducking vs Jumping stance)
      const currentHeight = engine.isDucking ? 20 : RUNNER_HEIGHT - 6;
      const currentY = engine.isDucking ? engine.runnerY + 18 : engine.runnerY + 4;

      const runnerBox = {
        x: engine.runnerX + 4,
        y: currentY,
        w: RUNNER_WIDTH - 6,
        h: currentHeight,
      };

      let hasCrashed = false;
      for (const obs of engine.obstacles) {
        const obsBox = {
          x: obs.x + 3,
          y: obs.y + 3,
          w: obs.width - 6,
          h: obs.height - 6,
        };

        if (
          runnerBox.x < obsBox.x + obsBox.w &&
          runnerBox.x + runnerBox.w > obsBox.x &&
          runnerBox.y < obsBox.y + obsBox.h &&
          runnerBox.y + runnerBox.h > obsBox.y
        ) {
          hasCrashed = true;
          break;
        }
      }

      if (hasCrashed) {
        engine.isRunning = false;
        const finalDist = Math.floor(engine.distance);
        const finalScore = finalDist * 10; // 1 meter = 10 PTS
        setDistanceMeters(finalDist);
        setPointsEarned(finalScore);
        setGameState("FINISHED");
        return;
      }

      // 2. Render Frame (Canvas Drawing)
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Sky Background Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      skyGrad.addColorStop(0, "#f8fafc");
      skyGrad.addColorStop(1, "#f1f5f9");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw Clouds
      ctx.fillStyle = "#cbd5e1";
      engine.clouds.forEach((cloud) => {
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, 14, 0, Math.PI * 2);
        ctx.arc(cloud.x + 15, cloud.y - 6, 18, 0, Math.PI * 2);
        ctx.arc(cloud.x + 32, cloud.y, 14, 0, Math.PI * 2);
        ctx.fill();
      });

      // Ground Line
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_LEVEL);
      ctx.lineTo(CANVAS_WIDTH, GROUND_LEVEL);
      ctx.stroke();

      // Moving Ground Dots/Grass
      ctx.fillStyle = "#cbd5e1";
      const groundOffset = (engine.distance * 10) % 40;
      for (let x = -groundOffset; x < CANVAS_WIDTH; x += 40) {
        ctx.fillRect(x, GROUND_LEVEL + 6, 12, 2);
        ctx.fillRect(x + 20, GROUND_LEVEL + 14, 8, 2);
      }

      // Draw Obstacles
      engine.obstacles.forEach((obs) => {
        if (obs.type === "FLYING_HIGH" || obs.type === "FLYING_LOW") {
          // Flying Bird / Drone
          ctx.fillStyle = obs.type === "FLYING_HIGH" ? "#9333ea" : "#dc2626"; // Purple for High Drone, Red for Low
          ctx.beginPath();
          ctx.ellipse(obs.x + obs.width / 2, obs.y + obs.height / 2, obs.width / 2, obs.height / 2 - 2, 0, 0, Math.PI * 2);
          ctx.fill();

          // Wing flapping
          const wingY = Math.sin(engine.distance * 0.6) * 7;
          ctx.fillStyle = obs.type === "FLYING_HIGH" ? "#6b21a8" : "#991b1b";
          ctx.beginPath();
          ctx.moveTo(obs.x + 10, obs.y + 10);
          ctx.lineTo(obs.x + 2, obs.y + 2 + wingY);
          ctx.lineTo(obs.x + 18, obs.y + 10);
          ctx.fill();
        } else {
          // Ground Cactus / Hurdle
          ctx.fillStyle = obs.type === "GROUND_TRIPLE" ? "#15803d" : "#16a34a"; // Darker green for Triple
          const radius = 4;
          ctx.beginPath();
          ctx.roundRect(obs.x, obs.y, obs.width, obs.height, radius);
          ctx.fill();

          // Cactus details (arms)
          ctx.fillStyle = "#14532d";
          ctx.fillRect(obs.x + 3, obs.y + 8, obs.width - 6, 4);

          // Red Flag top decoration
          ctx.fillStyle = "#dc2626";
          ctx.beginPath();
          ctx.moveTo(obs.x + obs.width / 2, obs.y - 6);
          ctx.lineTo(obs.x + obs.width / 2 + 8, obs.y - 2);
          ctx.lineTo(obs.x + obs.width / 2, obs.y + 2);
          ctx.fill();
        }
      });

      // Draw Runner Character (Vector Mascot)
      const rX = engine.runnerX;
      let rY = engine.runnerY;

      // Shadow on ground
      const shadowW = Math.max(10, RUNNER_WIDTH - (GROUND_LEVEL - 10 - rY) * 0.3);
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.beginPath();
      ctx.ellipse(rX + RUNNER_WIDTH / 2, GROUND_LEVEL + 2, shadowW / 2, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      if (engine.isDucking) {
        // Ducking / Crouching Stance
        ctx.fillStyle = "#dc2626"; // Red Shirt
        ctx.beginPath();
        ctx.roundRect(rX + 2, rY + 22, 28, 14, 4);
        ctx.fill();

        // Head lowered
        ctx.fillStyle = "#f87171";
        ctx.beginPath();
        ctx.arc(rX + 26, rY + 22, 7, 0, Math.PI * 2);
        ctx.fill();

        // Headband
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(rX + 22, rY + 18, 8, 3);

        // Eye
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(rX + 28, rY + 22, 2, 2);
      } else {
        // Normal Running / Jumping Stance
        // Body (Red Shirt)
        ctx.fillStyle = "#dc2626";
        ctx.beginPath();
        ctx.roundRect(rX + 4, rY + 12, 18, 16, 4);
        ctx.fill();

        // Head & Red Headband
        ctx.fillStyle = "#f87171";
        ctx.beginPath();
        ctx.arc(rX + 13, rY + 7, 8, 0, Math.PI * 2);
        ctx.fill();

        // Headband
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(rX + 5, rY + 4, 16, 3);
        ctx.fillStyle = "#dc2626";
        ctx.fillRect(rX + 3, rY + 4, 4, 3);

        // Eye
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(rX + 16, rY + 6, 2, 3);

        // Running Legs Animation
        ctx.strokeStyle = "#dc2626";
        ctx.lineWidth = 3.5;
        ctx.lineCap = "round";

        if (engine.isJumping) {
          // Legs tucked for jump
          ctx.beginPath();
          ctx.moveTo(rX + 8, rY + 28);
          ctx.lineTo(rX + 2, rY + 36);
          ctx.moveTo(rX + 18, rY + 28);
          ctx.lineTo(rX + 24, rY + 34);
          ctx.stroke();
        } else {
          // Alternating running legs
          const legPhase = Math.floor(engine.legFrame);
          const l1X = legPhase % 2 === 0 ? rX + 2 : rX + 22;
          const l2X = legPhase % 2 === 0 ? rX + 22 : rX + 2;

          ctx.beginPath();
          ctx.moveTo(rX + 8, rY + 28);
          ctx.lineTo(l1X, rY + 39);
          ctx.moveTo(rX + 18, rY + 28);
          ctx.lineTo(l2X, rY + 39);
          ctx.stroke();
        }
      }

      // HUD Overlay on Canvas
      ctx.fillStyle = "#0f172a";
      ctx.font = "900 14px monospace";
      ctx.textAlign = "right";
      ctx.fillText(`${currentDist} M`, CANVAS_WIDTH - 15, 25);
      ctx.fillStyle = "#dc2626";
      ctx.fillText(`+${currentDist * 10} PTS`, CANVAS_WIDTH - 15, 42);

      // Dynamic Speed Multiplier Badge
      const speedMult = (engine.speed / 6.0).toFixed(1);
      ctx.fillStyle = engine.speed > 11 ? "#dc2626" : engine.speed > 8.5 ? "#d97706" : "#475569";
      ctx.font = "700 11px monospace";
      ctx.textAlign = "left";
      ctx.fillText(`KECEPATAN: ${speedMult}x`, 15, 25);

      // Request next frame
      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [gameState]);

  const handleFinishSubmit = () => {
    onSubmitRunnerScore(pointsEarned);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-red-950/5 text-slate-900 flex flex-col items-center select-none">
      {/* Header */}
      <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
        <h2 className="text-xs font-bold tracking-wider text-slate-900 uppercase truncate">
          {postName} - {groupName}
        </h2>
        <Activity className="w-4 h-4 text-red-600" />
      </div>

      {gameState === "IDLE" && (
        <div className="text-center py-6 w-full flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mb-4 text-red-600 shadow-sm">
            <Zap className="w-8 h-8" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 uppercase mb-2">
            2D ENDLESS RUNNER (TANTANGAN LARI)
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed mb-4 max-w-xs font-medium">
            Berlari sejauh mungkin dan lewati setiap rintangan & kombinasi drone! Kecepatan & pola combo rintangan akan <span className="font-bold text-red-600">semakin beragam & menantang</span>.
          </p>

          <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 mb-6 text-xs text-slate-600 font-semibold space-y-1 text-left">
            <p>⌨️ <strong>Lompat:</strong> <span className="font-mono bg-white px-1.5 py-0.5 rounded border">SPACE</span> / <span className="font-mono bg-white px-1.5 py-0.5 rounded border">▲</span> / <span className="font-mono bg-white px-1.5 py-0.5 rounded border">W</span></p>
            <p>⌨️ <strong>Runduk:</strong> Tahan <span className="font-mono bg-white px-1.5 py-0.5 rounded border">▼</span> / <span className="font-mono bg-white px-1.5 py-0.5 rounded border">S</span> (untuk burung/drone tinggi)</p>
            <p>📱 <strong>Layar Sentuh:</strong> Gunakan tombol Lompat & Runduk di layar.</p>
          </div>

          <button
            type="button"
            onClick={handleStart}
            className="touch-btn w-full font-extrabold uppercase tracking-wider text-sm bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-600/20 transition-all py-3.5"
          >
            MULAI LARI SEKARANG
          </button>
        </div>
      )}

      {(gameState === "PLAYING" || gameState === "FINISHED") && (
        <div className="w-full flex flex-col items-center">
          {/* Interactive Canvas Viewport */}
          <div
            onClick={jump}
            className="w-full aspect-[5/2] bg-slate-100 border-2 border-slate-300 rounded-2xl relative overflow-hidden shadow-inner cursor-pointer touch-manipulation mb-3"
          >
            <canvas
              ref={canvasRef}
              width={600}
              height={240}
              className="w-full h-full object-cover block"
            />
          </div>

          {/* Dual Touch Controls for Mobile (Jump & Duck) */}
          {gameState === "PLAYING" && (
            <div className="w-full grid grid-cols-2 gap-3 mb-2">
              <button
                type="button"
                onMouseDown={() => setDucking(true)}
                onMouseUp={() => setDucking(false)}
                onTouchStart={(e) => {
                  e.preventDefault();
                  setDucking(true);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  setDucking(false);
                }}
                className="touch-btn py-3.5 font-black uppercase tracking-wider text-xs bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white rounded-xl shadow-md flex items-center justify-center gap-1.5 select-none touch-manipulation"
              >
                <ArrowDown className="w-5 h-5 stroke-[3]" />
                <span>RUNDUK (DUCK)</span>
              </button>

              <button
                type="button"
                onClick={jump}
                className="touch-btn py-3.5 font-black uppercase tracking-wider text-xs bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl shadow-md shadow-red-600/20 flex items-center justify-center gap-1.5 select-none touch-manipulation"
              >
                <ArrowUp className="w-5 h-5 stroke-[3]" />
                <span>LOMPAT (JUMP)</span>
              </button>
            </div>
          )}
        </div>
      )}

      {gameState === "FINISHED" && (
        <div className="text-center py-4 w-full flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-3 text-amber-600 shadow-sm">
            <Trophy className="w-7 h-7" />
          </div>

          <h3 className="text-base font-extrabold text-slate-900 uppercase mb-1">
            PERMAINAN SELESAI!
          </h3>

          <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 my-3 text-center">
            <p className="text-xs text-slate-500 font-semibold mb-0.5">Jarak Berhasil Ditempuh:</p>
            <p className="text-2xl font-black text-slate-900 font-mono">{distanceMeters} METER</p>
            <p className="text-sm font-black text-red-600 font-mono mt-1">+{pointsEarned} PTS</p>
          </div>

          <div className="w-full space-y-2">
            <button
              type="button"
              onClick={handleFinishSubmit}
              disabled={isSubmitting}
              className="touch-btn w-full font-extrabold uppercase tracking-wider text-sm bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg transition-all py-3"
            >
              {isSubmitting ? "MEMPROSES..." : `SUBMIT SKOR (+${pointsEarned} PTS)`}
            </button>

            <button
              type="button"
              onClick={handleStart}
              className="touch-btn w-full font-bold uppercase tracking-wider text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl py-2.5 transition-all flex items-center justify-center gap-1.5 border border-slate-300"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>COBA LARI LAGI</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
