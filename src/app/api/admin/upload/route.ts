import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Tidak ada file yang diunggah" }, { status: 400 });
    }

    const fileName = (file.name || "").toLowerCase();
    const fileType = (file.type || "").toLowerCase();

    // Comprehensive Image format detection (MIME type or extension)
    const isImage =
      fileType.startsWith("image/") ||
      fileName.endsWith(".png") ||
      fileName.endsWith(".jpg") ||
      fileName.endsWith(".jpeg") ||
      fileName.endsWith(".webp") ||
      fileName.endsWith(".gif") ||
      fileName.endsWith(".svg") ||
      fileName.endsWith(".bmp") ||
      fileName.endsWith(".ico") ||
      fileName.endsWith(".jfif");

    // Comprehensive Audio format detection (MIME type or extension)
    const isAudio =
      fileType.startsWith("audio/") ||
      fileName.endsWith(".mp3") ||
      fileName.endsWith(".wav") ||
      fileName.endsWith(".m4a") ||
      fileName.endsWith(".ogg") ||
      fileName.endsWith(".aac") ||
      fileName.endsWith(".flac") ||
      fileName.endsWith(".wma");

    if (!isImage && !isAudio) {
      return NextResponse.json(
        { error: "Format file tidak didukung. Harap unggah berkas Gambar (PNG, JPG, WEBP) atau File Suara (MP3, WAV, M4A, OGG)" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let publicUrl = "";

    // 1. Try saving to public/uploads
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });

      const sanitizedFilename = (file.name || "upload").replace(/[^a-zA-Z0-9.-]/g, "_");
      const uniqueFilename = `${Date.now()}_${sanitizedFilename}`;
      const filePath = path.join(uploadDir, uniqueFilename);

      await writeFile(filePath, buffer);
      publicUrl = `/uploads/${uniqueFilename}`;
    } catch (fsErr) {
      console.warn("Could not save to disk, using data URL fallback:", fsErr);
    }

    // 2. Base64 Data URL generation for 100% reliable fallback
    let dataUrl = "";
    if (isImage) {
      const ext = fileName.split(".").pop() || "png";
      const mime = fileType || (ext === "jpg" || ext === "jpeg" ? "image/jpeg" : `image/${ext}`);
      dataUrl = `data:${mime};base64,${buffer.toString("base64")}`;
    } else if (isAudio) {
      const ext = fileName.split(".").pop() || "mp3";
      const mime = fileType || `audio/${ext}`;
      dataUrl = `data:${mime};base64,${buffer.toString("base64")}`;
    }

    // Prefer publicUrl if available, otherwise use dataUrl
    const finalUrl = publicUrl || dataUrl;

    return NextResponse.json({
      success: true,
      imageUrl: isImage ? finalUrl : null,
      audioUrl: isAudio ? finalUrl : null,
      fileUrl: finalUrl,
      dataUrl: dataUrl,
      fileType: isImage ? "image" : "audio",
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal mengunggah berkas media" },
      { status: 500 }
    );
  }
}

