import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { isReplit, replitUploadFromBytes } from "@/lib/replit-storage";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "파일이 없습니다" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "이미지 파일만 업로드 가능합니다 (jpg, png, gif, webp)" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "파일 크기는 5MB 이하여야 합니다" },
        { status: 400 }
      );
    }

    const ext = (MIME_TO_EXT[file.type] ?? path.extname(file.name)) || ".jpg";
    const filename = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}${ext}`;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (isReplit) {
      const objectName = `uploads/${filename}`;
      const result = await replitUploadFromBytes(objectName, buffer);
      if (!result.ok) {
        console.error("Replit Object Storage upload error:", result.error);
        return NextResponse.json(
          { error: "업로드에 실패했습니다" },
          { status: 500 }
        );
      }
      return NextResponse.json({ url: `/api/uploads/${filename}` });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const filepath = path.join(uploadDir, filename);
    await mkdir(uploadDir, { recursive: true });
    await writeFile(filepath, buffer);
    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "업로드에 실패했습니다" },
      { status: 500 }
    );
  }
}
