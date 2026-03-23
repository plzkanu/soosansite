import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "soosansite-default-secret-change-in-production"
);

async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get("admin_session")?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login page and auth API
  if (pathname === "/admin/login" || pathname.startsWith("/api/auth")) {
    if (pathname === "/admin/login") {
      const auth = await isAuthenticated(request);
      if (auth) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }
    return NextResponse.next();
  }

  // Protect admin pages
  if (pathname.startsWith("/admin")) {
    const auth = await isAuthenticated(request);
    if (!auth) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  // 포털에서 카드 이미지로 쓰는 공개 경로 (startsWith("/api/upload")와 구분)
  if (pathname.startsWith("/api/uploads")) {
    return NextResponse.next();
  }

  // Protect admin API routes (/api/upload 만 — /api/uploads/* 는 위에서 통과)
  if (
    pathname.startsWith("/api/sites") ||
    pathname === "/api/upload" ||
    pathname === "/api/upload/"
  ) {
    const auth = await isAuthenticated(request);
    if (!auth) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/sites/:path*", "/api/upload", "/api/auth/:path*"],
};
