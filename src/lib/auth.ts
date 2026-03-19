import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "soosansite-default-secret-change-in-production"
);
const COOKIE_NAME = "admin_session";
const TOKEN_MAX_AGE = 60 * 60 * 24; // 24 hours

export async function createSession(username: string): Promise<string> {
  const token = await new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${TOKEN_MAX_AGE}s`)
    .setIssuedAt()
    .sign(SECRET);
  return token;
}

export async function verifySession(): Promise<{ username: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET);
    const username = payload.username as string;
    if (!username) return null;
    return { username };
  } catch {
    return null;
  }
}

export function getCookieConfig() {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: TOKEN_MAX_AGE,
    path: "/",
  };
}
