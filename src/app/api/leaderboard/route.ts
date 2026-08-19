import { NextResponse } from "next/server";
import { getGroups } from "@/lib/store";

export async function GET() {
  try {
    const groups = await getGroups();
    return NextResponse.json({
      groups,
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Gagal mengambil data leaderboard" },
      { status: 500 }
    );
  }
}
