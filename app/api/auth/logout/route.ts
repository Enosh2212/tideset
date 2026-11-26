import { NextRequest, NextResponse } from "next/server";
import { destroyDatabaseSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const cookie = req.cookies.get("tideset_session");
    if (cookie?.value) {
      await destroyDatabaseSession(cookie.value);
    }

    const res = NextResponse.json({ success: true, message: "Logged out successfully." });

    // Clear session cookie
    res.cookies.set("tideset_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return res;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
