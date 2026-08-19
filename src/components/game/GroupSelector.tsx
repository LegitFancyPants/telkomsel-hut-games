"use client";

import { useState } from "react";
import { Users, Check, ArrowRight } from "lucide-react";
import { GroupData } from "@/lib/store";

interface GroupSelectorProps {
  postName: string;
  groups: GroupData[];
  onSelectGroup: (group: GroupData) => void;
}

export default function GroupSelector({ postName, groups, onSelectGroup }: GroupSelectorProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);

  const handleConfirm = () => {
    if (selectedGroup) {
      onSelectGroup(selectedGroup);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto p-4 sm:p-6 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-sm text-slate-100 flex flex-col">
      {/* Header Info (Wireframe 2) */}
      <div className="w-full flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
        <h2 className="text-sm font-bold tracking-wide text-slate-200 uppercase">
          {postName} - KELOMPOK
        </h2>
        <Users className="w-5 h-5 text-sky-400" />
      </div>

      {/* Subtitle */}
      <div className="mb-4">
        <h3 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
          PILIH KELOMPOK ANDA
        </h3>
        <p className="text-[11px] text-slate-500 font-normal">
          (Pilih satu kelompok peserta yang Anda wakili)
        </p>
      </div>

      {/* Group List Cards (Wireframe 2) */}
      <div className="space-y-2.5 mb-6 max-h-[320px] overflow-y-auto pr-1">
        {groups.map((group) => {
          const isSelected = selectedGroupId === group.id;
          return (
            <button
              key={group.id}
              type="button"
              onClick={() => setSelectedGroupId(group.id)}
              className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all touch-btn ${
                isSelected
                  ? "bg-sky-950/60 border-sky-500 text-sky-200 shadow-md ring-1 ring-sky-500/50"
                  : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900/80"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? "border-sky-500 bg-sky-500 text-slate-950"
                      : "border-slate-600 bg-transparent"
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <span className="font-semibold text-sm tracking-wide">
                  {group.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Start Button */}
      <button
        type="button"
        onClick={handleConfirm}
        disabled={!selectedGroupId}
        className="touch-btn w-full font-bold uppercase tracking-wider text-sm bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-sky-950/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <span>MULAI PERMAINAN</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
