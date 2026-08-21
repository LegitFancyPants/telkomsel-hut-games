"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import PinPad from "@/components/game/PinPad";
import GroupSelector, { ReplayStatusInfo } from "@/components/game/GroupSelector";
import QuizEngine from "@/components/game/QuizEngine";
import TapReflexGame from "@/components/game/TapReflexGame";
import MemoryGame from "@/components/game/MemoryGame";
import SpeedMathGame from "@/components/game/SpeedMathGame";
import WordScrambleGame from "@/components/game/WordScrambleGame";
import SnakeGame from "@/components/game/SnakeGame";
import EndlessRunnerGame from "@/components/game/EndlessRunnerGame";
import { GroupData, PostData } from "@/lib/store";
import { CheckCircle2, Trophy, AlertCircle, RotateCcw, Users } from "lucide-react";

export default function PosPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  // Step state: "PIN_GATE" -> "GROUP_SELECT" -> "GAMEPLAY" -> "SUMMARY"
  const [step, setStep] = useState<"PIN_GATE" | "GROUP_SELECT" | "GAMEPLAY" | "SUMMARY">("PIN_GATE");

  const [postData, setPostData] = useState<PostData | null>(null);
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [replayMap, setReplayMap] = useState<Record<number, ReplayStatusInfo>>({});
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<GroupData | null>(null);
  const [posToken, setPosToken] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [resultSummary, setResultSummary] = useState<{
    pointsEarned: number;
    newTotalScore: number;
    groupName: string;
    totalSubmissions?: number;
    replaysUsed?: number;
    replaysLeft?: number;
  } | null>(null);

  const fetchAttempts = async (overrideToken?: string) => {
    const t = overrideToken || posToken;
    if (!t) return;
    try {
      const res = await fetch(`/api/pos/${slug}/attempts`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      const data = await res.json();
      if (data.replayMap) {
        setReplayMap(data.replayMap);
      }
    } catch (e) {
      console.error("fetchAttempts Error:", e);
    }
  };

  // Load session from sessionStorage if already unlocked
  useEffect(() => {
    const savedToken = sessionStorage.getItem(`pos_token_${slug}`);
    const savedPost = sessionStorage.getItem(`pos_data_${slug}`);
    if (savedToken && savedPost) {
      try {
        setPosToken(savedToken);
        setPostData(JSON.parse(savedPost));
        fetchGroups();
        fetchAttempts(savedToken);
        setStep("GROUP_SELECT");
      } catch (e) {
        sessionStorage.removeItem(`pos_token_${slug}`);
      }
    }
  }, [slug]);

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/leaderboard");
      const data = await res.json();
      if (data.groups) {
        setGroups(data.groups);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Step 1: Verify PIN
  const handleVerifyPin = async (pin: string) => {
    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/pos/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, pin }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "PIN pos tidak valid");
        setIsLoading(false);
        return;
      }

      setPosToken(data.token);
      setPostData(data.post);
      sessionStorage.setItem(`pos_token_${slug}`, data.token);
      sessionStorage.setItem(`pos_data_${slug}`, JSON.stringify(data.post));

      await fetchGroups();
      await fetchAttempts(data.token);
      setStep("GROUP_SELECT");
    } catch (err: any) {
      setErrorMsg("Terjadi kesalahan koneksi. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Select Group & Fetch Questions/Config
  const handleSelectGroup = async (group: GroupData) => {
    setSelectedGroup(group);
    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/pos/${slug}/questions`, {
        headers: {
          Authorization: `Bearer ${posToken}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Gagal memuat permainan pos");
        setIsLoading(false);
        return;
      }

      setQuestions(data.questions || []);
      setStep("GAMEPLAY");
    } catch (e) {
      setErrorMsg("Gagal mengambil data game pos");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Submit Answers / Score
  const handleSubmitGame = useCallback(
    async (payloadData: { userAnswers?: any; scoreOverride?: number }) => {
      if (!selectedGroup) return;
      setIsLoading(true);
      setErrorMsg("");

      const deviceToken = `dev_${window.navigator.userAgent.replace(/\D/g, "").slice(0, 16)}_${window.screen.width}`;

      try {
        const res = await fetch(`/api/pos/${slug}/submit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${posToken}`,
          },
          body: JSON.stringify({
            groupId: selectedGroup.id,
            userAnswers: payloadData.userAnswers,
            scoreOverride: payloadData.scoreOverride,
            deviceToken,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setErrorMsg(data.error || "Gagal melakukan submit nilai pos");
          setIsLoading(false);
          return;
        }

        setResultSummary({
          pointsEarned: data.pointsEarned,
          newTotalScore: data.newTotalScore,
          groupName: data.groupName,
          totalSubmissions: data.totalSubmissions,
          replaysUsed: data.replaysUsed,
          replaysLeft: data.replaysLeft,
        });

        fetchAttempts(posToken);
        setStep("SUMMARY");
      } catch (e: any) {
        setErrorMsg(e.message || "Gagal mengirim nilai pos");
      } finally {
        setIsLoading(false);
      }
    },
    [selectedGroup, slug, posToken]
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-6 sm:py-10 flex flex-col justify-center">
        {/* State 1: Input PIN Gate */}
        {step === "PIN_GATE" && (
          <PinPad
            postName={slug.toUpperCase().replace("-", " ")}
            onVerify={handleVerifyPin}
            isLoading={isLoading}
            errorMsg={errorMsg}
          />
        )}

        {/* State 2: Select Group */}
        {step === "GROUP_SELECT" && postData && (
          <GroupSelector
            postName={postData.name}
            groups={groups}
            replayMap={replayMap}
            onSelectGroup={handleSelectGroup}
          />
        )}

        {/* State 3: Gameplay for 6 Modes */}
        {step === "GAMEPLAY" && postData && selectedGroup && (
          <>
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 text-center flex items-center justify-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {postData.gameType === "tap_reflex" ? (
              <TapReflexGame
                postName={postData.name}
                groupName={selectedGroup.name}
                timeLimit={postData.timeLimit}
                onSubmitReflexScore={(score) => handleSubmitGame({ scoreOverride: score })}
                isSubmitting={isLoading}
              />
            ) : postData.gameType === "memory_match" ? (
              <MemoryGame
                postName={postData.name}
                groupName={selectedGroup.name}
                timeLimit={postData.timeLimit}
                onSubmitMemoryScore={(score) => handleSubmitGame({ scoreOverride: score })}
                isSubmitting={isLoading}
              />
            ) : postData.gameType === "speed_math" ? (
              <SpeedMathGame
                postName={postData.name}
                groupName={selectedGroup.name}
                timeLimit={postData.timeLimit}
                onSubmitMathScore={(score) => handleSubmitGame({ scoreOverride: score })}
                isSubmitting={isLoading}
              />
            ) : postData.gameType === "word_scramble" ? (
              <WordScrambleGame
                postName={postData.name}
                groupName={selectedGroup.name}
                timeLimit={postData.timeLimit}
                onSubmitWordScore={(score) => handleSubmitGame({ scoreOverride: score })}
                isSubmitting={isLoading}
              />
            ) : postData.gameType === "snake" ? (
              <SnakeGame
                postName={postData.name}
                groupName={selectedGroup.name}
                timeLimit={postData.timeLimit}
                onSubmitSnakeScore={(score) => handleSubmitGame({ scoreOverride: score })}
                isSubmitting={isLoading}
              />
            ) : postData.gameType === "endless_runner" ? (
              <EndlessRunnerGame
                postName={postData.name}
                groupName={selectedGroup.name}
                timeLimit={postData.timeLimit}
                onSubmitRunnerScore={(score) => handleSubmitGame({ scoreOverride: score })}
                isSubmitting={isLoading}
              />
            ) : (
              <QuizEngine
                postName={postData.name}
                groupName={selectedGroup.name}
                timeLimit={postData.timeLimit}
                questions={questions}
                onSubmitAnswers={(answers) => handleSubmitGame({ userAnswers: answers })}
                isSubmitting={isLoading}
              />
            )}
          </>
        )}

        {/* State 4: Score Summary Screen */}
        {step === "SUMMARY" && resultSummary && (
          <div className="w-full max-w-sm mx-auto p-6 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-red-950/5 text-center text-slate-900 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-4 shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h2 className="text-lg font-black uppercase tracking-wide text-slate-900 mb-1">
              POS SELESAI
            </h2>
            <p className="text-xs text-slate-500 font-bold mb-6">
              {resultSummary.groupName}
            </p>

            <div className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl mb-6 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Poin Didapat:</span>
                <span className="font-mono text-base font-black text-red-600">
                  +{resultSummary.pointsEarned} PTS
                </span>
              </div>
              <div className="h-px bg-slate-200" />
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Total Skor Kelompok:</span>
                <span className="font-mono text-base font-black text-slate-900">
                  {resultSummary.newTotalScore} PTS
                </span>
              </div>

              {resultSummary.replaysUsed !== undefined && (
                <>
                  <div className="h-px bg-slate-200" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Status Jatah Mengulang:</span>
                    <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {resultSummary.replaysUsed === 0
                        ? "Submit Awal (10x Mengulang Tersisa)"
                        : `Mengulang Ke-${resultSummary.replaysUsed} / 10 (Sisa ${resultSummary.replaysLeft}x)`}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="w-full space-y-2.5">
              {resultSummary.replaysLeft === undefined || resultSummary.replaysLeft > 0 ? (
                <button
                  type="button"
                  onClick={() => selectedGroup && handleSelectGroup(selectedGroup)}
                  className="touch-btn w-full font-extrabold uppercase tracking-wider text-xs bg-red-600 hover:bg-red-700 active:bg-red-800 text-white py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>
                    MAIN LAGI ({resultSummary.replaysLeft !== undefined ? `${resultSummary.replaysLeft}x Mengulang Tersisa` : "Gunakan Jatah"})
                  </span>
                </button>
              ) : (
                <div className="w-full p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-600">
                  Jatah 10x Mengulang Kelompok Ini Sudah Habis
                </div>
              )}

              <button
                type="button"
                onClick={() => router.push("/leaderboard")}
                className="touch-btn w-full font-extrabold uppercase tracking-wider text-xs bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <Trophy className="w-4 h-4" />
                <span>LIHAT LIVE LEADERBOARD</span>
              </button>

              <button
                type="button"
                onClick={() => setStep("GROUP_SELECT")}
                className="touch-btn w-full font-bold uppercase tracking-wider text-[11px] bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <Users className="w-3.5 h-3.5" />
                <span>PILIH KELOMPOK LAIN</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
