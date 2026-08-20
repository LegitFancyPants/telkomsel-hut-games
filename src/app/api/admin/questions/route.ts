import { NextRequest, NextResponse } from "next/server";
import { getQuestionsByPostId, createQuestion, updateQuestion, deleteQuestion, deleteAllQuestions } from "@/lib/store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json({ error: "postId wajib diisi" }, { status: 400 });
    }

    const questions = await getQuestionsByPostId(Number(postId));
    return NextResponse.json({ questions });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Gagal mengambil data soal" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { postId, promptText, imageUrl, audioUrl, options, correctOpt, points } = body;

    if (!postId || !promptText || !options || !correctOpt) {
      return NextResponse.json({ error: "Post ID, pertanyaan, opsi, dan kunci jawaban wajib diisi" }, { status: 400 });
    }

    const created = await createQuestion({
      postId: Number(postId),
      promptText,
      imageUrl: imageUrl || null,
      audioUrl: audioUrl || null,
      options: Array.isArray(options) ? options : JSON.parse(options),
      correctOpt: String(correctOpt).toUpperCase(),
      points: Number(points) || 20,
    });

    return NextResponse.json({ success: true, question: created });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Gagal menambah soal" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, promptText, imageUrl, audioUrl, options, correctOpt, points } = body;

    if (!id) {
      return NextResponse.json({ error: "ID soal wajib diisi" }, { status: 400 });
    }

    const updated = await updateQuestion(Number(id), {
      promptText,
      imageUrl: imageUrl !== undefined ? imageUrl : undefined,
      audioUrl: audioUrl !== undefined ? audioUrl : undefined,
      options: options ? (Array.isArray(options) ? options : JSON.parse(options)) : undefined,
      correctOpt: correctOpt ? String(correctOpt).toUpperCase() : undefined,
      points: points ? Number(points) : undefined,
    });

    return NextResponse.json({ success: true, question: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Gagal memperbarui soal" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const postId = searchParams.get("postId");
    const deleteAll = searchParams.get("all");

    if (deleteAll === "true" && postId) {
      await deleteAllQuestions(Number(postId));
      return NextResponse.json({ success: true, message: "Semua soal berhasil dihapus" });
    }

    if (!id) {
      return NextResponse.json({ error: "ID soal wajib diisi" }, { status: 400 });
    }

    await deleteQuestion(Number(id));
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Gagal menghapus soal" }, { status: 500 });
  }
}
