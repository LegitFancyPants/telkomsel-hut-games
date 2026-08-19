"use client";

import { GroupData } from "@/lib/store";
import { Award, ShieldAlert } from "lucide-react";

interface LeaderboardTableProps {
  groups: GroupData[];
}

export default function LeaderboardTable({ groups }: LeaderboardTableProps) {
  const sortedGroups = [...groups].sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
          PERINGKAT KELOMPOK
        </h2>
        <span className="text-xs text-slate-400 font-medium">
          {groups.length} KELOMPOK TERDAFTAR
        </span>
      </div>

      <div className="divide-y divide-slate-800/60">
        {sortedGroups.map((group, index) => {
          const rank = index + 1;
          let rankBadge = (
            <span className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs font-bold text-slate-400 flex items-center justify-center">
              #{rank}
            </span>
          );

          if (rank === 1) {
            rankBadge = (
              <span className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/50 font-mono text-xs font-bold text-amber-400 flex items-center justify-center">
                1st
              </span>
            );
          } else if (rank === 2) {
            rankBadge = (
              <span className="w-7 h-7 rounded-lg bg-slate-300/20 border border-slate-300/40 font-mono text-xs font-bold text-slate-200 flex items-center justify-center">
                2nd
              </span>
            );
          } else if (rank === 3) {
            rankBadge = (
              <span className="w-7 h-7 rounded-lg bg-amber-700/20 border border-amber-700/40 font-mono text-xs font-bold text-amber-500 flex items-center justify-center">
                3rd
              </span>
            );
          }

          return (
            <div
              key={group.id}
              className={`px-5 py-3.5 flex items-center justify-between transition-colors ${
                rank === 1 ? "bg-amber-950/10" : "hover:bg-slate-950/40"
              }`}
            >
              <div className="flex items-center gap-3.5">
                {rankBadge}
                <span className="font-semibold text-sm text-slate-100 tracking-wide">
                  {group.name}
                </span>
              </div>

              <div className="flex items-center gap-1 font-mono font-bold text-base text-sky-400">
                <span>{group.totalScore}</span>
                <span className="text-xs text-slate-500 font-normal">PTS</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
