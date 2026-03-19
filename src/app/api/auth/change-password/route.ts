import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { updateAdminPassword } from "@/lib/admin";

export async function POST(request: Request) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "현재 비밀번호와 새 비밀번호를 입력하세요" },
        { status: 400 }
      );
    }

    const result = await updateAdminPassword(
      String(currentPassword),
      String(newPassword)
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "비밀번호 변경에 실패했습니다" },
      { status: 500 }
    );
  }
}
