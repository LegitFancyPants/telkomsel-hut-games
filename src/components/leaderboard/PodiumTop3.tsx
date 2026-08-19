"use client";

import { GroupData } from "@/lib/store";
import { Award, Trophy, Medal } from "lucide-react";

interface PodiumTop3Props {
  groups: GroupData[];
}

export default function PodiumTop3({ groups }: PodiumTop3Props) {
  const sorted = [...groups].sort((a, b) => b.totalScore - a.totalScore);
  const first = sorted[0];
  const second = sorted[1];
  const third = sorted[2];

  return (
    <div className="w-full grid grid-cols-3 gap-3 sm:gap-6 items-end my-6 px-2">
      {/* 2nd Place Podium */}
      {second ? (
        <div className="flex flex-col items-center">
          <div className="text-center mb-2">
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase block">
              PERINGKAT 2
            </span>
            <h4 className="text-xs sm:text-sm font-bold text-slate-200 truncate max-w-[110px] sm:max-w-none">
              {second.name}
            </h4>
            <p className="font-mono text-sm sm:text-base font-black text-slate-300">
              {second.totalScore} <span className="text-[10px] text-slate-500 font-normal">PTS</span>
            </p>
          </div>
          <div className="w-full h-24 sm:h-32 bg-slate-900 border-2 border-slate-400/40 rounded-t-2xl shadow-xl flex flex-col items-center justify-center relative overflow-hidden">
            <Medal className="w-8 h-8 text-slate-300 stroke-[1.5]" />
            <span className="text-lg font-black text-slate-300 mt-1 font-mono">2</span>
          </div>
        </div>
      ) : (
        <div className="h-24" />
      )}

      {/* 1st Place Podium (Tallest & Central) */}
      {first ? (
        <div className="flex flex-col items-center">
          <div className="text-center mb-2">
            <span className="text-[10px] font-extrabold tracking-widest text-amber-400 uppercase block">
              JUARA 1
            </span>
            <h4 className="text-sm sm:text-base font-bold text-amber-200 truncate max-w-[130px] sm:max-w-none">
              {first.name}
            </h4>
            <p className="font-mono text-lg sm:text-xl font-black text-amber-400">
              {first.totalScore} <span className="text-[10px] text-amber-600 font-normal">PTS</span>
            </p>
          </div>
          <div className="w-full h-32 sm:h-44 bg-gradient-to-b from-amber-950/80 to-slate-900 border-2 border-amber-500 rounded-t-2xl shadow-2xl shadow-amber-950/50 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-amber-500/10 blur-xl pointer-events-none" />
            <Trophy className="w-10 h-10 text-amber-400 stroke-[1.5] drop-shadow-md" />
            <span className="text-2xl font-black text-amber-400 mt-1 font-mono">1</span>
          </div>
        </div>
      ) : (
        <div className="h-32" />
      )}

      {/* 3rd Place Podium */}
      {third ? (
        <div className="flex flex-col items-center">
          <div className="text-center mb-2">
            <span className="text-[10px] font-bold tracking-widest text-amber-600 uppercase block">
              PERINGKAT 3
            </span>
            <h4 className="text-xs sm:text-sm font-bold text-slate-200 truncate max-w-[110px] sm:max-w-none">
              {third.name}
            </h4>
            <p className="font-mono text-sm sm:text-base font-black text-amber-600">
              {third.totalScore} <span className="text-[10px] text-slate-500 font-normal">PTS</span>
            </p>
          </div>
          <div className="w-full h-20 sm:h-28 bg-slate-900 border-2 border-amber-700/40 rounded-t-2xl shadow-xl flex flex-col items-center justify-center relative overflow-hidden">
            <Award className="w-7 h-7 text-amber-600 stroke-[1.5]" />
            <span className="text-lg font-black text-amber-600 mt-1 font-mono">3</span>
          </div>
        </div>
      ) : (
        <div className="h-20" />
      )}
    </div>
  );
}
