import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, checkRateLimit } from "@/lib/security";
import { createDatabaseSession } from "@/lib/session";
import { z } from "zod";

const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  role: z.enum(["CUSTOMER", "PROVIDER"]).optional().default("CUSTOMER"),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const rateLimit = checkRateLimit(`register:${ip}`, 5, 60000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many registration attempts. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password, role } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with this email address already exists." },
        { status: 409 }
      );
    }

    const passwordHash = hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role,
      },
    });

    // Check if there are any pending invitations for this email and automatically link them
    const pendingInvitations = await prisma.invitation.findMany({
      where: {
        invitedEmail: normalizedEmail,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    for (const inv of pendingInvitations) {
      await prisma.agreementParticipant.upsert({
        where: {
          agreementId_invitedEmail: {
            agreementId: inv.agreementId,
            invitedEmail: normalizedEmail,
          },
        },
        update: { userId: user.id, status: "ACTIVE" },
        create: {
          agreementId: inv.agreementId,
          userId: user.id,
          invitedEmail: normalizedEmail,
          role: inv.role,
          status: "ACTIVE",
        },
      });

      await prisma.invitation.update({
        where: { id: inv.id },
        data: { acceptedAt: new Date() },
      });
    }

    // Create session
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
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during registration." },
      { status: 500 }
    );
  }
}
