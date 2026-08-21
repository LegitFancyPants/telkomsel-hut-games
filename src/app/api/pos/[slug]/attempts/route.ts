import { NextRequest, NextResponse } from "next/server";
import { getPostBySlug, getPosGroupReplayMap } from "@/lib/store";
import { verifyToken } from "@/lib/auth";

export async function GET(
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

    const post = await getPostBySlug(slug);
    if (!post) {
      return NextResponse.json({ error: "Pos tidak ditemukan" }, { status: 404 });
    }

    const replayMap = await getPosGroupReplayMap(post.id);

    return NextResponse.json({
      success: true,
      maxReplays: 10,
      replayMap,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Gagal mengambil data jatah mengulang pos" },
      { status: 500 }
    );
  }
}
