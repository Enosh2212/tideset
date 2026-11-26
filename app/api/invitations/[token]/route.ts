import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: {
      agreement: {
        select: {
          id: true,
          title: true,
          description: true,
          totalAmountCents: true,
          currency: true,
          status: true,
        },
      },
      createdBy: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!invitation) {
    return NextResponse.json({ success: false, error: "Invitation not found." }, { status: 404 });
  }

  const isExpired = new Date() > invitation.expiresAt;
  const isAccepted = !!invitation.acceptedAt;

  return NextResponse.json({
    success: true,
    invitation: {
      id: invitation.id,
      agreement: invitation.agreement,
      inviterName: invitation.createdBy.name,
      role: invitation.role,
      invitedEmail: invitation.invitedEmail,
      expiresAt: invitation.expiresAt,
      isExpired,
      isAccepted,
    },
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Authentication required to accept an invitation. Please log in first." },
      { status: 401 }
    );
  }

  const { token } = await params;

  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { agreement: true },
  });

  if (!invitation) {
    return NextResponse.json({ success: false, error: "Invitation not found." }, { status: 404 });
  }

  if (invitation.acceptedAt) {
    return NextResponse.json(
      { success: false, error: "This invitation has already been accepted." },
      { status: 400 }
    );
  }

  if (new Date() > invitation.expiresAt) {
    return NextResponse.json(
      { success: false, error: "This invitation link has expired." },
      { status: 400 }
    );
  }

  try {
    // Transactionally activate participant and record audit event
    await prisma.$transaction(async (tx) => {
      // 1. Mark invitation accepted
      await tx.invitation.update({
        where: { id: invitation.id },
        data: { acceptedAt: new Date() },
      });

      // 2. Upsert AgreementParticipant record
      await tx.agreementParticipant.upsert({
        where: {
          agreementId_invitedEmail: {
            agreementId: invitation.agreementId,
            invitedEmail: invitation.invitedEmail,
          },
        },
        update: {
          userId: user.id,
          role: invitation.role,
          status: "ACTIVE",
          joinedAt: new Date(),
        },
        create: {
          agreementId: invitation.agreementId,
          userId: user.id,
          invitedEmail: invitation.invitedEmail,
          role: invitation.role,
          status: "ACTIVE",
        },
      });

      // 3. Update legacy agreement customerId/providerId if not already set
      if (invitation.role === "CUSTOMER" && !invitation.agreement.customerId) {
        await tx.agreement.update({
          where: { id: invitation.agreementId },
          data: { customerId: user.id },
        });
      } else if (invitation.role === "PROVIDER" && !invitation.agreement.providerId) {
        await tx.agreement.update({
          where: { id: invitation.agreementId },
          data: { providerId: user.id },
        });
      }

      // 4. Record audit event
      await tx.auditEvent.create({
        data: {
          agreementId: invitation.agreementId,
          actorId: user.id,
          eventType: "PARTICIPANT_JOINED",
          details: `${user.name} (${user.email}) accepted invitation and joined agreement as ${invitation.role}.`,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Invitation accepted successfully.",
      agreementId: invitation.agreementId,
    });
  } catch (error: any) {
    console.error("Accept invitation error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
