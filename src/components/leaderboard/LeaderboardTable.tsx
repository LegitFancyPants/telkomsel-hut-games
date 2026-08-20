"use client";

import { GroupData } from "@/lib/store";

interface LeaderboardTableProps {
  groups: GroupData[];
}

export default function LeaderboardTable({ groups }: LeaderboardTableProps) {
  const sortedGroups = [...groups].sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return timeA - timeB;
  });
  // Filter out Top 3 (ranks 1-3) since they are already displayed in PodiumTop3
  const remainingGroups = sortedGroups.slice(3);

  if (remainingGroups.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl shadow-red-950/5">
      <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          PERINGKAT KELOMPOK (RANK 4+)
        </h2>
        <span className="text-xs text-slate-500 font-semibold">
          {remainingGroups.length} KELOMPOK LAINNYA
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {remainingGroups.map((group, index) => {
          const rank = index + 4; // Starts from Rank 4

          return (
            <div
              key={group.id}
              className="px-5 py-3.5 flex items-center justify-between transition-colors hover:bg-slate-50"
            >
              <div className="flex items-center gap-3.5">
                <span className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 font-mono text-xs font-bold text-slate-600 flex items-center justify-center">
                  #{rank}
                </span>
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
