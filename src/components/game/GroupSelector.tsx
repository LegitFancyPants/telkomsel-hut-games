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
    <div className="w-full max-w-sm mx-auto p-4 sm:p-6 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-red-950/5 text-slate-900 flex flex-col">
      {/* Header Info */}
      <div className="w-full flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
        <h2 className="text-sm font-bold tracking-wide text-slate-900 uppercase">
          {postName} - KELOMPOK
        </h2>
        <Users className="w-5 h-5 text-red-600" />
      </div>

      {/* Subtitle */}
      <div className="mb-4">
        <h3 className="text-xs font-bold tracking-wider text-red-600 uppercase">
          PILIH KELOMPOK ANDA
        </h3>
        <p className="text-[11px] text-slate-500 font-normal">
          (Pilih satu kelompok peserta yang Anda wakili)
        </p>
      </div>

      {/* Group List Cards */}
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
                  ? "bg-red-50 border-red-600 text-red-700 shadow-md ring-1 ring-red-600/30"
                  : "bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? "border-red-600 bg-red-600 text-white"
                      : "border-slate-300 bg-transparent"
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <span className="font-bold text-sm tracking-wide">
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
        className="touch-btn w-full font-extrabold uppercase tracking-wider text-sm bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <span>MULAI PERMAINAN</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
