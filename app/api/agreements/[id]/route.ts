import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser(req);

    const agreement = await prisma.agreement.findUnique({
      where: { id },
      include: {
        provider: true,
        customer: true,
        createdBy: true,
        participants: {
          include: { user: true },
        },
        invitations: {
          where: { acceptedAt: null, expiresAt: { gt: new Date() } },
        },
        versions: {
          orderBy: { versionNumber: "desc" },
          include: {
            stages: {
              orderBy: { sequenceIndex: "asc" },
              include: {
                paymentRecords: true,
                deliverables: {
                  include: { reviews: true },
                },
              },
            },
            decisions: {
              include: { actor: true },
            },
          },
        },
        disputes: {
          orderBy: { createdAt: "desc" },
          include: { openedBy: true },
        },
        auditEvents: {
          orderBy: { timestamp: "desc" },
          include: { actor: true },
        },
      },
    });

    if (!agreement) {
      return NextResponse.json({ success: false, error: "Agreement not found" }, { status: 404 });
    }

    // Permission check: if it's not the public demo agreement, verify user has access
    if (id !== "agree_web_storefront_600") {
      if (!user) {
        return NextResponse.json(
          { success: false, error: "Authentication required to access this agreement." },
          { status: 401 }
        );
      }

      const isParticipant =
        agreement.createdById === user.id ||
        agreement.customerId === user.id ||
        agreement.providerId === user.id ||
        agreement.participants.some(
          (p) => p.userId === user.id || p.invitedEmail.toLowerCase() === user.email.toLowerCase()
        );

      if (!isParticipant) {
        return NextResponse.json(
          { success: false, error: "Access denied: You are not a participant in this agreement." },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ success: true, agreement });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
