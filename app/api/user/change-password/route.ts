import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { verifyPassword, hashPassword, checkRateLimit } from "@/lib/security";
import { z } from "zod";

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
    }

    // Rate limiting: 5 password change attempts per 15 minutes per user
    const rateLimit = checkRateLimit(`change-pw:${user.id}`, 5, 15 * 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many password change attempts. Please wait 15 minutes before trying again." },
        { status: 429 }
      );
    }

    // Retrieve database user with passwordHash
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, passwordHash: true },
    });

    if (!dbUser) {
      return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    if (!dbUser.passwordHash) {
      return NextResponse.json(
        { success: false, error: "Your account is authenticated via Google. Password login is not enabled for OAuth accounts." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parsed = ChangePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = parsed.data;

    // Verify current password in constant time
    const isValid = verifyPassword(currentPassword, dbUser.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Current password is incorrect." },
        { status: 400 }
      );
    }

    // Hash and persist new password
    const newHash = hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    // Record audit event
    await prisma.auditEvent.create({
      data: {
        actorId: user.id,
        eventType: "PASSWORD_CHANGED",
        details: "User successfully changed account password via scrypt re-hash.",
        ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1",
      },
    });

    return NextResponse.json({ success: true, message: "Password updated successfully." });
  } catch (error: any) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while changing password." },
      { status: 500 }
    );
  }
}
