"use client";

import { GroupData } from "@/lib/store";
import { Award, Trophy, Medal } from "lucide-react";

interface PodiumTop3Props {
  groups: GroupData[];
}

export default function PodiumTop3({ groups }: PodiumTop3Props) {
  const sorted = [...groups].sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return timeA - timeB;
  });
  const first = sorted[0];
  const second = sorted[1];
  const third = sorted[2];

  return (
    <div className="w-full grid grid-cols-3 gap-3 sm:gap-6 items-end my-6 px-2">
      {/* 2nd Place Podium */}
      {second ? (
        <div className="flex flex-col items-center">
          <div className="text-center mb-2">
            <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase block">
              JUARA 2
            </span>
            <h4 className="text-xs sm:text-sm font-bold text-slate-800 truncate max-w-[110px] sm:max-w-none">
              {second.name}
            </h4>
            <p className="font-mono text-sm sm:text-base font-black text-slate-900">
              {second.totalScore} <span className="text-[10px] text-slate-500 font-normal">PTS</span>
            </p>
          </div>
          <div className="w-full h-24 sm:h-32 bg-white border-2 border-slate-300 rounded-t-2xl shadow-lg flex flex-col items-center justify-center relative overflow-hidden">
            <Medal className="w-8 h-8 text-slate-400 stroke-[1.5]" />
            <span className="text-lg font-black text-slate-600 mt-1 font-mono">2</span>
          </div>
        </div>
      ) : (
        <div className="h-24" />
      )}

      {/* 1st Place Podium (Tallest & Central) */}
      {first ? (
        <div className="flex flex-col items-center">
          <div className="text-center mb-2">
            <span className="text-[10px] font-extrabold tracking-widest text-red-600 uppercase block">
              JUARA 1
            </span>
            <h4 className="text-sm sm:text-base font-black text-slate-900 truncate max-w-[130px] sm:max-w-none">
              {first.name}
            </h4>
            <p className="font-mono text-lg sm:text-xl font-black text-red-600">
              {first.totalScore} <span className="text-[10px] text-red-400 font-normal">PTS</span>
            </p>
          </div>
          <div className="w-full h-32 sm:h-44 bg-gradient-to-b from-red-50 to-white border-2 border-red-500 rounded-t-2xl shadow-xl shadow-red-600/10 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-red-500/5 blur-xl pointer-events-none" />
            <Trophy className="w-10 h-10 text-red-600 stroke-[1.5] drop-shadow-md" />
            <span className="text-2xl font-black text-red-600 mt-1 font-mono">1</span>
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
              JUARA 3
            </span>
            <h4 className="text-xs sm:text-sm font-bold text-slate-800 truncate max-w-[110px] sm:max-w-none">
              {third.name}
            </h4>
            <p className="font-mono text-sm sm:text-base font-black text-amber-700">
              {third.totalScore} <span className="text-[10px] text-slate-500 font-normal">PTS</span>
            </p>
          </div>
          <div className="w-full h-20 sm:h-28 bg-white border-2 border-amber-500/50 rounded-t-2xl shadow-lg flex flex-col items-center justify-center relative overflow-hidden">
            <Award className="w-7 h-7 text-amber-600 stroke-[1.5]" />
            <span className="text-lg font-black text-amber-700 mt-1 font-mono">3</span>
          </div>
        </div>
      ) : (
        <div className="h-20" />
      )}
    </div>
  );
}
