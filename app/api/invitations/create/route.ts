import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { generateSecureToken } from "@/lib/security";
import { z } from "zod";

const InviteSchema = z.object({
  agreementId: z.string().min(1),
  invitedEmail: z.string().email(),
  role: z.enum(["CUSTOMER", "PROVIDER"]),
});

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = InviteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { agreementId, invitedEmail, role } = parsed.data;
    const normalizedEmail = invitedEmail.trim().toLowerCase();

    // Check if agreement exists and user is participant or creator
    const agreement = await prisma.agreement.findUnique({
      where: { id: agreementId },
      include: { participants: true },
    });

    if (!agreement) {
      return NextResponse.json({ success: false, error: "Agreement not found." }, { status: 404 });
    }

    // Check authorization: user must be participant or owner
    const isOwnerOrParticipant =
      agreement.createdById === user.id ||
      agreement.customerId === user.id ||
      agreement.providerId === user.id ||
      agreement.participants.some((p) => p.userId === user.id);

    if (!isOwnerOrParticipant) {
      return NextResponse.json(
        { success: false, error: "Access denied: You are not authorized to invite participants to this agreement." },
        { status: 403 }
      );
    }

    // Prevent inviting oneself as counterparty
    if (user.email.toLowerCase() === normalizedEmail) {
      return NextResponse.json(
        { success: false, error: "You cannot invite yourself as the counterparty." },
        { status: 400 }
      );
    }

    const token = generateSecureToken(32);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await prisma.invitation.create({
      data: {
        agreementId,
        invitedEmail: normalizedEmail,
        role,
        token,
        expiresAt,
        createdById: user.id,
      },
    });

    // Also register or update AgreementParticipant in INVITED state
    await prisma.agreementParticipant.upsert({
      where: {
        agreementId_invitedEmail: {
          agreementId,
          invitedEmail: normalizedEmail,
        },
      },
      update: {
        role,
        status: "INVITED",
      },
      create: {
        agreementId,
        invitedEmail: normalizedEmail,
        role,
        status: "INVITED",
      },
    });

    // Record audit event
    await prisma.auditEvent.create({
      data: {
        agreementId,
        actorId: user.id,
        eventType: "PARTICIPANT_INVITED",
        details: `${user.name} invited ${normalizedEmail} to participate as ${role}.`,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const inviteUrl = `${appUrl}/invite/${token}`;

    return NextResponse.json({
      success: true,
      invitationId: invitation.id,
      token,
      inviteUrl,
      expiresAt: invitation.expiresAt,
    });
  } catch (error: any) {
    console.error("Invitation creation error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
