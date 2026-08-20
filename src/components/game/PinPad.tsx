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
    <div className="w-full max-w-sm mx-auto p-4 sm:p-6 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-red-950/5 text-slate-900 flex flex-col items-center">
      {/* Header Info */}
      <div className="w-full flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
        <h2 className="text-base font-bold tracking-wide text-slate-900 uppercase">
          {postName || "POS GAME"}
        </h2>
        <Lock className="w-5 h-5 text-red-600" />
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <p className="text-xs font-bold tracking-wider text-red-600 uppercase mb-1">
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
                ? "border-red-600 bg-red-50 text-red-600 shadow-sm"
                : "border-slate-200 bg-slate-50 text-slate-400"
            }`}
          >
            {pin[idx] ? "•" : ""}
          </div>
        ))}
      </div>

      {/* Error Feedback */}
      {errorMsg && (
        <div className="w-full mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-center">
          <p className="text-xs font-bold text-red-600">{errorMsg}</p>
        </div>
      )}

      {/* On-Screen Numeric Keypad */}
      <div className="w-full grid grid-cols-3 gap-2.5 mb-6">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => handleKeyPress(num)}
            disabled={isLoading || pin.length >= 4}
            className="touch-btn text-xl font-black bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 active:scale-95 text-slate-900 rounded-xl flex items-center justify-center transition-all disabled:opacity-50"
          >
            {num}
          </button>
        ))}

        {/* Backspace Button */}
        <button
          type="button"
          onClick={handleBackspace}
          disabled={isLoading || pin.length === 0}
          className="touch-btn bg-slate-50 border border-slate-200 hover:bg-slate-100 active:scale-95 text-red-600 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
          title="Hapus"
        >
          <Delete className="w-5 h-5" />
        </button>

        {/* Zero Button */}
        <button
          type="button"
          onClick={() => handleKeyPress("0")}
          disabled={isLoading || pin.length >= 4}
          className="touch-btn text-xl font-black bg-slate-50 border border-slate-200 hover:bg-slate-100 active:scale-95 text-slate-900 rounded-xl flex items-center justify-center transition-all disabled:opacity-50"
        >
          0
        </button>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || pin.length < 4}
          className="touch-btn bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold rounded-xl flex items-center justify-center transition-all disabled:opacity-40 shadow-md"
          title="Submit PIN"
        >
          <CheckCircle2 className="w-5 h-5" />
        </button>
      </div>

      <p className="text-[11px] text-slate-400 text-center">
        Dapatkan PIN 4-Digit dari Panitia di lokasi Pos
      </p>
    </div>
  );
}
