import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { isReplit } from "@/lib/replit-storage";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

/**
 * 로컬에서 저장된 /uploads/파일명 링크 호환.
 * Replit에서는 Object Storage가 /api/uploads 만 쓰므로 그쪽으로 넘김.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  if (!filename || filename.includes("..")) {
    return new NextResponse("Not Found", { status: 404 });
  }

  if (isReplit) {
    const url = new URL(request.url);
    return NextResponse.redirect(
      `${url.origin}/api/uploads/${encodeURIComponent(filename)}`,
      307
    );
  }

  try {
    const filepath = path.join(process.cwd(), "public", "uploads", filename);
    const buffer = await readFile(filepath);
    const ext = path.extname(filename).toLowerCase();
    const contentType = MIME_TYPES[ext] ?? "application/octet-stream";
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }
}
