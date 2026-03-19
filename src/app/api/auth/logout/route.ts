import { NextResponse } from "next/server";
import { getCookieConfig } from "@/lib/auth";

export async function POST() {
  const config = getCookieConfig();
  const res = NextResponse.json({ success: true });
  res.cookies.set(config.name, "", {
    httpOnly: config.httpOnly,
    secure: config.secure,
    sameSite: config.sameSite,
    maxAge: 0,
    path: config.path,
  });
  return res;
}
