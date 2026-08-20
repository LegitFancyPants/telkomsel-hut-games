"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import LeaderboardTable from "@/components/leaderboard/LeaderboardTable";
import PodiumTop3 from "@/components/leaderboard/PodiumTop3";
import { GroupData } from "@/lib/store";
import { RefreshCw, Radio } from "lucide-react";

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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-red-600">
                POS-TO-POS RALLY GAMES
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Leaderboard Real-Time
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchLeaderboard}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-800 flex items-center gap-1.5 transition-all shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Podium Top 3 */}
        <PodiumTop3 groups={groups} />

        {/* Full Ranking Table */}
        <LeaderboardTable groups={groups} />

        {lastUpdated && (
          <p className="text-[11px] text-slate-500 text-center mt-6">
            Terakhir diperbarui pukul {lastUpdated}. Poin otomatis ter-update via SSE stream.
          </p>
        )}
      </main>
    </div>
  );
}
