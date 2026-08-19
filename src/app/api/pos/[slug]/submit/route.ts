import { NextRequest, NextResponse } from "next/server";
import { getPostBySlug, getQuestionsByPostId, submitScore, getGroupById } from "@/lib/store";
import { verifyToken } from "@/lib/auth";
import { leaderboardEventEmitter } from "@/lib/events";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Otorisasi pos tidak ditemukan" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = await verifyToken(token);

    if (!decoded || decoded.slug !== slug) {
      return NextResponse.json({ error: "Sesi pos tidak valid" }, { status: 401 });
    }

    const body = await req.json();
    const { groupId, userAnswers, scoreOverride, deviceToken } = body;

    if (!groupId) {
      return NextResponse.json({ error: "Kelompok wajib dipilih" }, { status: 400 });
    }

    const group = await getGroupById(Number(groupId));
    if (!group) {
      return NextResponse.json({ error: "Kelompok tidak ditemukan" }, { status: 404 });
    }

    const post = await getPostBySlug(slug);
    if (!post) {
      return NextResponse.json({ error: "Pos tidak ditemukan" }, { status: 404 });
    }

    let calculatedPoints = 0;

    if (post.gameType === "tap_reflex") {
      calculatedPoints = Math.min(100, Math.max(0, Number(scoreOverride || 0)));
    } else {
      const questions = await getQuestionsByPostId(post.id);
      for (const q of questions) {
        const submittedAns = userAnswers?.[q.id];
        if (submittedAns && String(submittedAns).trim().toUpperCase() === q.correctOpt.trim().toUpperCase()) {
          calculatedPoints += q.points;
        }
      }
    }

    const deviceIdentifier = deviceToken || req.headers.get("x-forwarded-for") || "device_anon";

    const result = await submitScore(
      Number(groupId),
      post.id,
      calculatedPoints,
      deviceIdentifier
    );

    leaderboardEventEmitter.emit({
      type: "SCORE_UPDATED",
      groupId: Number(groupId),
      groupName: group.name,
      postName: post.name,
      pointsEarned: calculatedPoints,
      newTotalScore: result.newTotalScore,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      pointsEarned: calculatedPoints,
      newTotalScore: result.newTotalScore,
      groupName: group.name,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Gagal memproses submit jawaban" },
      { status: 500 }
    );
  }
}
