import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
    }

    const currentCookie = req.cookies.get("tideset_session")?.value;

    const sessions = await prisma.session.findMany({
      where: {
        userId: user.id,
        expires: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedSessions = sessions.map((s) => ({
      id: s.id,
      isCurrent: s.sessionToken === currentCookie,
      createdAt: s.createdAt,
      expiresAt: s.expires,
      ipAddress: s.ipAddress || "Local / Private Network",
      userAgent: s.userAgent || "Desktop Browser",
    }));

    return NextResponse.json({
      success: true,
      sessions: formattedSessions,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
    }

    // Delete all sessions for user
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    const res = NextResponse.json({
      success: true,
      message: "All active sessions have been terminated.",
    });

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
