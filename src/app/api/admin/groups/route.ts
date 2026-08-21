import { NextRequest, NextResponse } from "next/server";
import { getGroups, createGroup, updateGroup, deleteGroup, resetAllScores } from "@/lib/store";

export async function GET() {
  try {
    const groups = await getGroups();
    return NextResponse.json({ groups });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Gagal mengambil data kelompok" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name } = body;

    const trimmedName = typeof name === "string" ? name.trim() : "";

    if (!trimmedName) {
      return NextResponse.json({ error: "Nama kelompok wajib diisi" }, { status: 400 });
    }

    const created = await createGroup(trimmedName);
    return NextResponse.json({ success: true, group: created });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Gagal membuat kelompok baru" }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, scoreOverride, isResetAll } = body;

    if (isResetAll) {
      await resetAllScores();
      return NextResponse.json({ success: true, message: "Seluruh skor kelompok berhasil di-reset ke 0" });
    }

    if (!id) {
      return NextResponse.json({ error: "ID kelompok wajib diisi" }, { status: 400 });
    }

    const updated = await updateGroup(Number(id), name, scoreOverride !== undefined ? Number(scoreOverride) : undefined);
    return NextResponse.json({ success: true, group: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Gagal memperbarui data kelompok" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID kelompok wajib diisi" }, { status: 400 });
    }

    await deleteGroup(Number(id));
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Gagal menghapus kelompok" }, { status: 500 });
  }
}
