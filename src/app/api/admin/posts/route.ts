import { NextRequest, NextResponse } from "next/server";
import { getPosts, createPost, updatePost, deletePost } from "@/lib/store";

export async function GET() {
  try {
    const posts = await getPosts();
    return NextResponse.json({ posts });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Gagal mengambil data pos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, slug, pinCode, gameType, timeLimit, isActive } = body;

    if (!name || !slug || !pinCode) {
      return NextResponse.json({ error: "Nama pos, slug, dan PIN wajib diisi" }, { status: 400 });
    }

    const created = await createPost({
      name,
      slug: slug.toLowerCase().replace(/\s+/g, "-"),
      pinCode,
      gameType: gameType || "quiz",
      timeLimit: Number(timeLimit) || 60,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    return NextResponse.json({ success: true, post: created });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Gagal membuat pos baru" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "ID pos wajib diisi" }, { status: 400 });
    }

    const updated = await updatePost(Number(id), data);
    return NextResponse.json({ success: true, post: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Gagal memperbarui pos" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID pos wajib diisi" }, { status: 400 });
    }

    await deletePost(Number(id));
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Gagal menghapus pos" }, { status: 500 });
  }
}
