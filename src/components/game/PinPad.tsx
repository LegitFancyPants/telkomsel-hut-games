"use client";

import { useState } from "react";
import { Lock, Delete, CheckCircle2 } from "lucide-react";

interface PinPadProps {
  postName: string;
  onVerify: (pin: string) => void;
  isLoading: boolean;
  errorMsg?: string;
}

export default function PinPad({ postName, onVerify, isLoading, errorMsg }: PinPadProps) {
  const [pin, setPin] = useState<string>("");

  const handleKeyPress = (val: string) => {
    if (pin.length < 4) {
      setPin((prev) => prev + val);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (pin.length === 4) {
      onVerify(pin);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto p-4 sm:p-6 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-sm text-slate-100 flex flex-col items-center">
      {/* Header Info (Wireframe 1) */}
      <div className="w-full flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
        <h2 className="text-base font-bold tracking-wide text-slate-100 uppercase">
          {postName || "POS GAME"}
        </h2>
        <Lock className="w-5 h-5 text-slate-400" />
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-1">
          MASUKKAN PIN POS
        </p>
        <p className="text-xs text-slate-500 font-normal">
          (4 DIGIT PIN PANITIA)
        </p>
      </div>

      {/* PIN Digit Indicators (4 Boxes) */}
      <div className="flex gap-3 mb-6">
        {[0, 1, 2, 3].map((idx) => (
          <div
            key={idx}
            className={`pin-box border-2 ${
              pin[idx]
                ? "border-sky-500 bg-sky-950/40 text-sky-400 shadow-sm"
                : "border-slate-800 bg-slate-950/60 text-slate-600"
            }`}
          >
            {pin[idx] ? "•" : ""}
          </div>
        ))}
      </div>

      {/* Error Feedback */}
      {errorMsg && (
        <div className="w-full mb-4 px-3 py-2 bg-red-950/60 border border-red-800/80 rounded-lg text-center">
          <p className="text-xs font-medium text-red-300">{errorMsg}</p>
        </div>
      )}

      {/* On-Screen Numeric Keypad (Wireframe 1 Layout) */}
      <div className="w-full grid grid-cols-3 gap-2.5 mb-6">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => handleKeyPress(num)}
            disabled={isLoading || pin.length >= 4}
            className="touch-btn text-xl font-bold bg-slate-950 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 active:scale-95 text-slate-100 rounded-xl flex items-center justify-center transition-all disabled:opacity-50"
          >
            {num}
          </button>
        ))}

        {/* Backspace Button */}
        <button
          type="button"
          onClick={handleBackspace}
          disabled={isLoading || pin.length === 0}
          className="touch-btn bg-slate-950 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 active:scale-95 text-slate-400 hover:text-slate-200 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
          title="Hapus"
        >
          <Delete className="w-5 h-5" />
        </button>

        {/* Zero Button */}
        <button
          type="button"
          onClick={() => handleKeyPress("0")}
          disabled={isLoading || pin.length >= 4}
          className="touch-btn text-xl font-bold bg-slate-950 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 active:scale-95 text-slate-100 rounded-xl flex items-center justify-center transition-all disabled:opacity-50"
        >
          0
        </button>

        {/* Done / Clear Button */}
        <button
          type="button"
          onClick={() => setPin("")}
          disabled={isLoading || pin.length === 0}
          className="touch-btn text-xs font-bold uppercase tracking-wider bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
        >
          Clear
        </button>
      </div>

      {/* Primary Submit Button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading || pin.length !== 4}
        className="touch-btn w-full font-bold uppercase tracking-wider text-sm bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-sky-950/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="inline-block animate-pulse-subtle">MEMVERIFIKASI...</span>
        ) : (
          <>
            <span>VERIFIKASI PIN POS</span>
            <CheckCircle2 className="w-4 h-4" />
          </>
        )}
      </button>

      {/* Footer Instructions */}
      <p className="text-[11px] text-slate-500 text-center mt-4">
        Minta PIN 4-digit kepada panitia penjaga pos yang bertugas.
      </p>
    </div>
  );
}
