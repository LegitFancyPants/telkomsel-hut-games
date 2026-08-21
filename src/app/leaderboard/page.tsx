"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import LeaderboardTable from "@/components/leaderboard/LeaderboardTable";
import PodiumTop3 from "@/components/leaderboard/PodiumTop3";
import { GroupData } from "@/lib/store";
import { RefreshCw, Maximize, Minimize } from "lucide-react";

export default function LeaderboardPage() {
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error("Fullscreen Request Error:", err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        });
      }
    }
  };

  useEffect(() => {
    fetchLeaderboard();

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    // Subscribe to SSE Live Sync Stream
    const eventSource = new EventSource("/api/leaderboard/stream");

    eventSource.onopen = () => {
      setIsLiveConnected(true);
    };

    eventSource.addEventListener("update", () => {
      fetchLeaderboard();
    });

    eventSource.onerror = () => {
      setIsLiveConnected(false);
    };

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      eventSource.close();
    };
  }, []);

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50 text-slate-900 ${isFullscreen ? "bg-slate-950 text-slate-100" : ""}`}>
      {!isFullscreen && <Navbar />}

      <main className={`flex-1 w-full mx-auto px-4 transition-all duration-300 ${isFullscreen ? "max-w-6xl py-6" : "max-w-4xl py-8"}`}>
        {/* Title Header */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b ${isFullscreen ? "border-slate-800" : "border-slate-200"}`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-red-600">
                POS-TO-POS RALLY GAMES
              </span>
              {isLiveConnected && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700 animate-pulse">
                  ● LIVE STREAM
                </span>
              )}
            </div>
            <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isFullscreen ? "text-white" : "text-slate-900"}`}>
              Leaderboard Real-Time
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchLeaderboard}
              className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                isFullscreen
                  ? "bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800"
                  : "bg-white border-slate-200 hover:bg-slate-100 text-slate-800"
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              className={`px-3.5 py-2 rounded-xl border text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-sm ${
                isFullscreen
                  ? "bg-red-600 border-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/30"
                  : "bg-white border-slate-200 hover:bg-slate-100 text-slate-800"
              }`}
              title={isFullscreen ? "Keluar Mode Fullscreen" : "Mode Fullscreen / Presentasi Live"}
            >
              {isFullscreen ? (
                <>
                  <Minimize className="w-3.5 h-3.5" />
                  <span>Keluar Fullscreen</span>
                </>
              ) : (
                <>
                  <Maximize className="w-3.5 h-3.5 text-red-600" />
                  <span>Fullscreen</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Podium Top 3 */}
        <PodiumTop3 groups={groups} />

        {/* Full Ranking Table */}
        <LeaderboardTable groups={groups} />

        {lastUpdated && (
          <p className={`text-[11px] text-center mt-6 ${isFullscreen ? "text-slate-400" : "text-slate-500"}`}>
            Terakhir diperbarui pukul {lastUpdated}. Poin otomatis ter-update via SSE stream.
          </p>
        )}
      </main>
    </div>
  );
}
