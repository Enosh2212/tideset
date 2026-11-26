import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSessionToken } from "@/lib/session";

export async function POST(req: NextRequest) {
  // Demo switching is restricted to development or explicitly permitted demo environments
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_DEMO_SWITCH !== "true") {
    return NextResponse.json(
      { success: false, error: "Demo persona switching is disabled in strict production mode." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { role } = body;

    const email = role === "PROVIDER" ? "marcus@example.com" : "elena@example.com";
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "Demo user not found" }, { status: 404 });
    }

    const sessionToken = createSessionToken({
      userId: user.id,
      role: user.role as "CUSTOMER" | "PROVIDER",
      email: user.email,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      sessionToken,
    });

    // Set secure HTTP-only cookie
    response.cookies.set("tideset_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
