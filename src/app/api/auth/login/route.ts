import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin";
import { createSession, getCookieConfig } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "아이디와 비밀번호를 입력하세요" },
        { status: 400 }
      );
    }

    const valid = await verifyAdmin(String(username).trim(), String(password));
    if (!valid) {
      return NextResponse.json(
        { error: "아이디 또는 비밀번호가 올바르지 않습니다" },
        { status: 401 }
      );
    }

    const token = await createSession(String(username).trim());
    const config = getCookieConfig();

    const res = NextResponse.json({ success: true });
    res.cookies.set(config.name, token, {
      httpOnly: config.httpOnly,
      secure: config.secure,
      sameSite: config.sameSite,
      maxAge: config.maxAge,
      path: config.path,
    });
    return res;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "로그인에 실패했습니다" },
      { status: 500 }
    );
  }
}
