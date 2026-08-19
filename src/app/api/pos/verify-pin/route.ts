import { NextRequest, NextResponse } from "next/server";
import { getPostBySlug } from "@/lib/store";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, pin } = body;

    if (!slug || !pin) {
      return NextResponse.json(
        { error: "Slug dan PIN pos wajib diisi" },
        { status: 400 }
      );
    }

    const post = await getPostBySlug(slug);

    if (!post) {
      return NextResponse.json(
        { error: "Pos tidak ditemukan" },
        { status: 404 }
      );
    }

    if (!post.isActive) {
      return NextResponse.json(
        { error: "Akses pos ini sedang ditutup atau dinonaktifkan oleh panitia" },
        { status: 403 }
      );
    }

    // Verify PIN
    if (post.pinCode.trim() !== String(pin).trim()) {
      return NextResponse.json(
        { error: "PIN pos tidak valid. Silakan minta PIN resmi kepada petugas pos." },
        { status: 401 }
      );
    }

    // Sign session token for player
    const token = await signToken({
      postId: post.id,
      slug: post.slug,
      postName: post.name,
      gameType: post.gameType,
    }, "2h");

    return NextResponse.json({
      token,
      post: {
        id: post.id,
        name: post.name,
        slug: post.slug,
        gameType: post.gameType,
        timeLimit: post.timeLimit,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
