"use client";

import { GroupData } from "@/lib/store";
import { Award, ShieldAlert } from "lucide-react";

interface LeaderboardTableProps {
  groups: GroupData[];
}

export default function LeaderboardTable({ groups }: LeaderboardTableProps) {
  const sortedGroups = [...groups].sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl shadow-red-950/5">
      <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          PERINGKAT KELOMPOK
        </h2>
        <span className="text-xs text-slate-500 font-semibold">
          {groups.length} KELOMPOK TERDAFTAR
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {sortedGroups.map((group, index) => {
          const rank = index + 1;
          let rankBadge = (
            <span className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 font-mono text-xs font-bold text-slate-600 flex items-center justify-center">
              #{rank}
            </span>
          );

          if (rank === 1) {
            rankBadge = (
              <span className="w-7 h-7 rounded-lg bg-red-600 font-mono text-xs font-bold text-white flex items-center justify-center shadow-sm">
                1st
              </span>
            );
          } else if (rank === 2) {
            rankBadge = (
              <span className="w-7 h-7 rounded-lg bg-slate-800 font-mono text-xs font-bold text-white flex items-center justify-center">
                2nd
              </span>
            );
          } else if (rank === 3) {
            rankBadge = (
              <span className="w-7 h-7 rounded-lg bg-amber-600 font-mono text-xs font-bold text-white flex items-center justify-center">
                3rd
              </span>
            );
          }

          return (
            <div
              key={group.id}
              className={`px-5 py-3.5 flex items-center justify-between transition-colors ${
                rank === 1 ? "bg-red-50/50" : "hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3.5">
                {rankBadge}
                <span className="font-bold text-sm text-slate-900 tracking-wide">
                  {group.name}
                </span>
              </div>

              <div className="flex items-center gap-1 font-mono font-black text-base text-red-600">
                <span>{group.totalScore}</span>
                <span className="text-xs text-slate-400 font-normal">PTS</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
