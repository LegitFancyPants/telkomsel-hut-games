"use client";

import { useEffect, useState } from "react";
import PodiumTop3 from "@/components/leaderboard/PodiumTop3";
import { GroupData } from "@/lib/store";
import { Radio, Maximize2, Trophy } from "lucide-react";

export default function ProjectorPage() {
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [lastNotification, setLastNotification] = useState<string>("");
  const [isLive, setIsLive] = useState<boolean>(true);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch("/api/leaderboard");
      const data = await res.json();
      if (data.groups) {
        setGroups(data.groups);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLeaderboard();

    const eventSource = new EventSource("/api/leaderboard/stream");

    eventSource.onopen = () => setIsLive(true);
    eventSource.onerror = () => setIsLive(false);

    eventSource.addEventListener("update", (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "SCORE_UPDATED") {
          setLastNotification(
            `${payload.groupName} +${payload.pointsEarned} PTS dari ${payload.postName}`
          );
          setTimeout(() => setLastNotification(""), 6000);
        }
      } catch (e) {
        // ignore parse error
      }
      fetchLeaderboard();
    });

    return () => {
      eventSource.close();
    };
  }, []);

  const sortedGroups = [...groups].sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-10 flex flex-col justify-between select-none">
      {/* Top Banner Header */}
      <header className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-sky-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-sky-950">
            POS
          </div>
          <div>
            <h1 className="text-xl sm:text-3xl font-black uppercase tracking-wider text-slate-100">
              LEADERBOARD EVENT & RALLY GAMES
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              Live Real-Time Point Aggregation Screen
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {lastNotification && (
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-950/90 border border-emerald-700 text-emerald-300 font-bold text-xs animate-bounce">
              <span>{lastNotification}</span>
            </div>
          )}

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
            <Radio className={`w-3.5 h-3.5 ${isLive ? "text-emerald-400 animate-pulse" : "text-amber-400"}`} />
            <span>{isLive ? "LIVE REALTIME" : "POLLING"}</span>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
              } else {
                document.exitFullscreen();
              }
            }}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="my-auto py-8 max-w-6xl w-full mx-auto">
        {/* Top 3 Podium Animated Presentation */}
        <PodiumTop3 groups={groups} />

        {/* Remaining Ranks Grid */}
        {sortedGroups.length > 3 && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sortedGroups.slice(3).map((g, idx) => (
              <div
                key={g.id}
                className="px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800/80 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-slate-500 w-6">
                    #{idx + 4}
                  </span>
                  <span className="font-bold text-sm text-slate-200 truncate max-w-[160px]">
                    {g.name}
                  </span>
                </div>
                <span className="font-mono text-sm font-extrabold text-sky-400">
                  {g.totalScore} PTS
                </span>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer ticker */}
      <footer className="pt-4 border-t border-slate-900 text-center text-xs font-medium text-slate-500 flex items-center justify-between">
        <span>Web Game Pos-to-Pos Platform</span>
        <span>QR & PIN-Gated Event Scoreboard System</span>
      </footer>
    </div>
  );
}
