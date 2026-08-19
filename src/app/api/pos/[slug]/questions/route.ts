import { NextRequest, NextResponse } from "next/server";
import { getPostBySlug, getQuestionsByPostId } from "@/lib/store";
import { verifyToken } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Sesi pos tidak ditemukan. Silakan masukkan PIN terlebih dahulu." },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = await verifyToken(token);

    if (!decoded || decoded.slug !== slug) {
      return NextResponse.json(
        { error: "Sesi pos tidak valid atau telah kadaluarsa." },
        { status: 401 }
      );
    }

    const post = await getPostBySlug(slug);
    if (!post) {
      return NextResponse.json({ error: "Pos tidak ditemukan" }, { status: 404 });
    }

    const questions = await getQuestionsByPostId(post.id);

    const sanitizedQuestions = questions.map((q) => ({
      id: q.id,
      promptText: q.promptText,
      imageUrl: q.imageUrl,
      options: q.options,
      points: q.points,
    }));

    return NextResponse.json({
      post: {
        id: post.id,
        name: post.name,
        slug: post.slug,
        gameType: post.gameType,
        timeLimit: post.timeLimit,
      },
      questions: sanitizedQuestions,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Gagal mengambil data pertanyaan" },
      { status: 500 }
    );
  }
}
