"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import PinPad from "@/components/game/PinPad";
import GroupSelector from "@/components/game/GroupSelector";
import QuizEngine from "@/components/game/QuizEngine";
import TapReflexGame from "@/components/game/TapReflexGame";
import MemoryGame from "@/components/game/MemoryGame";
import SpeedMathGame from "@/components/game/SpeedMathGame";
import WordScrambleGame from "@/components/game/WordScrambleGame";
import SnakeGame from "@/components/game/SnakeGame";
import { GroupData, PostData } from "@/lib/store";
import { CheckCircle2, Trophy, RefreshCw, AlertCircle } from "lucide-react";

export default function PosPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  // Step state: "PIN_GATE" -> "GROUP_SELECT" -> "GAMEPLAY" -> "SUMMARY"
  const [step, setStep] = useState<"PIN_GATE" | "GROUP_SELECT" | "GAMEPLAY" | "SUMMARY">("PIN_GATE");

  const [postData, setPostData] = useState<PostData | null>(null);
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<GroupData | null>(null);
  const [posToken, setPosToken] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [resultSummary, setResultSummary] = useState<{
    pointsEarned: number;
    newTotalScore: number;
    groupName: string;
  } | null>(null);

  // Load session from sessionStorage if already unlocked
  useEffect(() => {
    const savedToken = sessionStorage.getItem(`pos_token_${slug}`);
    const savedPost = sessionStorage.getItem(`pos_data_${slug}`);
    if (savedToken && savedPost) {
      try {
        setPosToken(savedToken);
        setPostData(JSON.parse(savedPost));
        fetchGroups();
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
        });

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
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
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
            onSelectGroup={handleSelectGroup}
          />
        )}

        {/* State 3: Gameplay for 6 Modes */}
        {step === "GAMEPLAY" && postData && selectedGroup && (
          <>
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-800 text-xs text-red-300 text-center flex items-center justify-center gap-2">
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
          <div className="w-full max-w-sm mx-auto p-6 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl text-center text-slate-100 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400 mb-4 shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h2 className="text-lg font-extrabold uppercase tracking-wide text-slate-100 mb-1">
              POS SELESAI
            </h2>
            <p className="text-xs text-slate-400 font-semibold mb-6">
              {resultSummary.groupName}
            </p>

            <div className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl mb-6 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Poin Didapat:</span>
                <span className="font-mono text-base font-bold text-sky-400">
                  +{resultSummary.pointsEarned} PTS
                </span>
              </div>
              <div className="h-px bg-slate-800" />
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Skor Kelompok:</span>
                <span className="font-mono text-base font-bold text-amber-400">
                  {resultSummary.newTotalScore} PTS
                </span>
              </div>
            </div>

            <div className="w-full space-y-2.5">
              <button
                type="button"
                onClick={() => router.push("/leaderboard")}
                className="touch-btn w-full font-bold uppercase tracking-wider text-xs bg-sky-600 hover:bg-sky-500 text-white rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <Trophy className="w-4 h-4" />
                <span>LIHAT LIVE LEADERBOARD</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sessionStorage.removeItem(`pos_token_${slug}`);
                  sessionStorage.removeItem(`pos_data_${slug}`);
                  setStep("PIN_GATE");
                }}
                className="touch-btn w-full font-semibold uppercase tracking-wider text-xs bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-xl flex items-center justify-center gap-2 border border-slate-800 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>KEMBALI KE INPUT PIN</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
