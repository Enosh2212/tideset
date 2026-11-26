import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, checkRateLimit } from "@/lib/security";
import { createDatabaseSession } from "@/lib/session";
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";

  // 1. IP-level rate limiting: 10 attempts per minute
  const ipRateLimit = checkRateLimit(`login:ip:${ip}`, 10, 60000);
  if (!ipRateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many login attempts from this network. Please wait 1 minute before trying again." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();

    // 2. Account-level rate limiting: 5 failed attempts per 15 minutes per email
    const accountRateLimit = checkRateLimit(`login:acc:${normalizedEmail}`, 6, 15 * 60000);
    if (!accountRateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many failed login attempts for this account. Please wait 15 minutes before trying again.",
        },
        { status: 429 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Constant-time check / generic message to prevent user enumeration
    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Create database-backed session
    const userAgent = req.headers.get("user-agent") || undefined;
    const { sessionToken, expires } = await createDatabaseSession(user.id, ip, userAgent);

    const res = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    res.cookies.set("tideset_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires,
    });

    return res;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during login." },
      { status: 500 }
    );
  }
}
