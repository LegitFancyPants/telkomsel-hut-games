"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import LeaderboardTable from "@/components/leaderboard/LeaderboardTable";
import PodiumTop3 from "@/components/leaderboard/PodiumTop3";
import { GroupData } from "@/lib/store";
import { RefreshCw, Radio, Tv } from "lucide-react";
import Link from "next/link";

export default function LeaderboardPage() {
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch("/api/leaderboard");
      const data = await res.json();
      if (data.groups) {
        setGroups(data.groups);
        setLastUpdated(new Date().toLocaleTimeString("id-ID"));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLeaderboard();

    // Subscribe to SSE Live Sync Stream
    const eventSource = new EventSource("/api/leaderboard/stream");

    eventSource.onopen = () => {
      setIsLiveConnected(true);
    };

    eventSource.addEventListener("update", (event: MessageEvent) => {
      // Re-fetch or update state directly
      fetchLeaderboard();
    });

    eventSource.onerror = () => {
      setIsLiveConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                POS-TO-POS RALLY GAMES
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                  isLiveConnected
                    ? "bg-emerald-950/80 border-emerald-800 text-emerald-400"
                    : "bg-amber-950/80 border-amber-800 text-amber-400"
                }`}
              >
                <Radio className="w-3 h-3 animate-pulse" />
                <span>{isLiveConnected ? "LIVE SYNC" : "OFFLINE POLLING"}</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">
              Leaderboard Real-Time
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchLeaderboard}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>

            <Link
              href="/projector"
              className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-sky-950 transition-all"
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Mode Proyektor</span>
            </Link>
          </div>
        </div>

        {/* Podium Top 3 */}
        <PodiumTop3 groups={groups} />

        {/* Full Ranking Table */}
        <LeaderboardTable groups={groups} />

        {lastUpdated && (
          <p className="text-[11px] text-slate-500 text-center mt-6">
            Terakhir diperbarui pukul {lastUpdated}. Poin otomatis ter-update via WebSocket / SSE.
          </p>
        )}
      </main>
    </div>
  );
}
