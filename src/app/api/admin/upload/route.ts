import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File gambar tidak ditemukan" }, { status: 400 });
    }

    // Read file buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure public/uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    // Clean filename
    const safeFilename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = path.join(uploadsDir, safeFilename);

    // Save file
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${safeFilename}`;

    return NextResponse.json({
      success: true,
      imageUrl: publicUrl,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Gagal mengunggah file gambar" },
      { status: 500 }
    );
  }
}
