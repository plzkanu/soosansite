import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { isReplit, replitDownloadAsBytes } from "@/lib/replit-storage";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    if (!filename || filename.includes("..")) {
      return new NextResponse("Not Found", { status: 404 });
    }

    if (isReplit) {
      const objectName = `uploads/${filename}`;
      const result = await replitDownloadAsBytes(objectName);
      if (!result.ok || !result.value) {
        return new NextResponse("Not Found", { status: 404 });
      }
      const ext = path.extname(filename).toLowerCase();
      const contentType = MIME_TYPES[ext] ?? "application/octet-stream";
      return new NextResponse(new Uint8Array(result.value), {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

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
