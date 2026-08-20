"use client";

import { useState, useEffect, useRef } from "react";
import { Clock, User, ArrowRight, CheckCircle2, Image as ImageIcon, Music, Volume2, Play, Pause } from "lucide-react";
import { formatTime } from "@/lib/utils";

interface Question {
  id: number;
  promptText: string;
  imageUrl?: string | null;
  audioUrl?: string | null;
  options: string[];
  points: number;
}

interface QuizEngineProps {
  postName: string;
  groupName: string;
  timeLimit: number;
  questions: Question[];
  onSubmitAnswers: (userAnswers: { [questionId: number]: string }) => void;
  isSubmitting: boolean;
}

export default function QuizEngine({
  postName,
  groupName,
  timeLimit,
  questions,
  onSubmitAnswers,
  isSubmitting,
}: QuizEngineProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [questionId: number]: string }>({});
  const [timeLeft, setTimeLeft] = useState(timeLimit || 60);

  // Audio Player State (Enforced 10-second snippet limit)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgressSec, setAudioProgressSec] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentQ = questions[currentIndex];
  const optionLabels = ["A", "B", "C", "D"];

  // Reset audio state when switching questions
  useEffect(() => {
    setIsPlayingAudio(false);
    setAudioProgressSec(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [currentIndex]);

  // Countdown Timer Effect
  useEffect(() => {
    if (timeLeft <= 0) {
      onSubmitAnswers(userAnswers);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onSubmitAnswers, userAnswers]);

  const handleToggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      if (audioRef.current.currentTime >= 10) {
        audioRef.current.currentTime = 0;
      }
      audioRef.current
        .play()
        .then(() => setIsPlayingAudio(true))
        .catch((e) => console.error("Audio playback error:", e));
    }
  };

  // Enforce strict 10-second max limit
  const handleAudioTimeUpdate = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const audio = e.currentTarget;
    const currentSec = Math.min(10, Math.floor(audio.currentTime));
    setAudioProgressSec(currentSec);

    if (audio.currentTime >= 10) {
      audio.pause();
      audio.currentTime = 0;
      setIsPlayingAudio(false);
      setAudioProgressSec(0);
    }
  };

  const handleSelectOption = (optionLetter: string) => {
    if (currentQ) {
      setUserAnswers((prev) => ({
        ...prev,
        [currentQ.id]: optionLetter,
      }));
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onSubmitAnswers(userAnswers);
    }
  };

  if (!currentQ) return null;

  const selectedForCurrent = userAnswers[currentQ.id];
  const isLastQuestion = currentIndex === questions.length - 1;
  const timerPercentage = Math.max(0, (timeLeft / (timeLimit || 60)) * 100);

  return (
    <div className="w-full max-w-sm mx-auto p-4 sm:p-6 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-red-950/5 text-slate-900 flex flex-col select-none">
      {/* Header Info */}
      <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
        <h2 className="text-xs font-bold tracking-wider text-slate-900 uppercase truncate">
          {postName} - {groupName}
        </h2>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <User className="w-4 h-4 text-slate-500" />
        </div>
      </div>

      {/* Progress & Countdown Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
          <span>Pertanyaan {currentIndex + 1} dari {questions.length}</span>
          <div className={`flex items-center gap-1 font-mono font-bold ${timeLeft <= 10 ? "text-red-600 animate-pulse-subtle" : "text-red-600"}`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div
            className={`h-full transition-all duration-1000 ${
              timeLeft <= 10 ? "bg-red-600" : "bg-red-600"
            }`}
            style={{ width: `${timerPercentage}%` }}
          />
        </div>
      </div>

      {/* Question Card with Image or Audio Player (Tebak Gambar / Tebak Lagu) */}
      <div className="w-full p-4 mb-4 bg-slate-50 border border-slate-200 rounded-xl text-center shadow-inner flex flex-col items-center">
        {/* Optional Image for Tebak Gambar */}
        {currentQ.imageUrl && (
          <div className="w-full h-44 mb-3 rounded-lg overflow-hidden border border-slate-200 bg-white relative flex items-center justify-center">
            <img
              src={currentQ.imageUrl}
              alt="Gambar Pertanyaan Kuis"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          </div>
        )}

        {/* Optional 10-Second Trimming Audio Player for Tebak Lagu */}
        {currentQ.audioUrl && (
          <div className="w-full p-3.5 mb-3 bg-white border border-red-200 rounded-xl flex flex-col items-center gap-2.5 shadow-sm">
            <audio
              ref={audioRef}
              src={currentQ.audioUrl}
              onTimeUpdate={handleAudioTimeUpdate}
              onEnded={() => {
                setIsPlayingAudio(false);
                setAudioProgressSec(0);
              }}
              onPause={() => setIsPlayingAudio(false)}
              onPlay={() => setIsPlayingAudio(true)}
              preload="metadata"
            />

            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-red-600">
                <Music className="w-4 h-4 animate-bounce" />
                <span className="text-[11px] font-extrabold uppercase tracking-wider">TEBAK LAGU (10 DETIK)</span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-800">
                00:0{audioProgressSec} / 00:10
              </span>
            </div>

            {/* 10-Second Progress Bar */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-red-600 transition-all duration-300"
                style={{ width: `${(audioProgressSec / 10) * 100}%` }}
              />
            </div>

            <button
              type="button"
              onClick={handleToggleAudio}
              className={`touch-btn w-full py-2.5 px-4 rounded-lg font-extrabold text-xs flex items-center justify-center gap-2 transition-all border ${
                isPlayingAudio
                  ? "bg-slate-900 border-slate-900 text-white shadow-md"
                  : "bg-red-600 hover:bg-red-700 border-red-600 text-white shadow-md shadow-red-600/20"
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>JEDA AUDIO (KLIP 10s)</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>PUTAR KLIP (MAX 10 DETIK)</span>
                </>
              )}
            </button>
          </div>
        )}

        <p className="text-sm font-bold text-slate-900 leading-relaxed">
          {currentQ.promptText}
        </p>
      </div>

      {/* Options List A, B, C, D */}
      <div className="space-y-2.5 mb-6">
        {currentQ.options.map((optText, idx) => {
          const letter = optionLabels[idx] || String(idx + 1);
          const isSelected = selectedForCurrent === letter;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectOption(letter)}
              className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all touch-btn ${
                isSelected
                  ? "bg-red-50 border-red-600 text-red-700 shadow-md ring-1 ring-red-600/30"
                  : "bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-7 h-7 rounded-lg border font-bold text-xs flex items-center justify-center transition-all ${
                    isSelected
                      ? "border-red-600 bg-red-600 text-white"
                      : "border-slate-300 bg-white text-slate-700"
                  }`}
                >
                  {letter}
                </span>
                <span className="text-xs sm:text-sm font-bold tracking-wide">
                  {optText}
                </span>
              </div>

              {isSelected && (
                <span className="text-xs font-bold text-red-600 px-2 py-0.5 rounded bg-white border border-red-200">
                  Dipilih
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={handleNext}
        disabled={isSubmitting || !selectedForCurrent}
        className="touch-btn w-full font-extrabold uppercase tracking-wider text-sm bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <span className="inline-block animate-pulse-subtle">MEMPROSES...</span>
        ) : isLastQuestion ? (
          <>
            <span>KIRIM JAWABAN</span>
            <CheckCircle2 className="w-4 h-4" />
          </>
        ) : (
          <>
            <span>PERTANYAAN BERIKUTNYA</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}
