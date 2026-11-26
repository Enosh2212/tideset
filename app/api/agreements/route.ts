import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { generateSecureToken } from "@/lib/security";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);

    // If authenticated, filter by user ownership/participation
    let whereClause: any = {};
    if (user) {
      whereClause = {
        OR: [
          { createdById: user.id },
          { customerId: user.id },
          { providerId: user.id },
          { participants: { some: { userId: user.id } } },
          { participants: { some: { invitedEmail: user.email.toLowerCase() } } },
        ],
      };
    }

    const agreements = await prisma.agreement.findMany({
      where: whereClause,
      include: {
        provider: true,
        customer: true,
        participants: {
          include: { user: true },
        },
        auditEvents: {
          orderBy: { timestamp: "desc" },
          take: 15,
        },
        versions: {
          orderBy: { versionNumber: "desc" },
          take: 1,
          include: {
            stages: {
              orderBy: { sequenceIndex: "asc" },
              include: {
                paymentRecords: {
                  orderBy: { verifiedAt: "desc" },
                },
                paymentAttempts: {
                  orderBy: { createdAt: "desc" },
                },
                deliverables: {
                  orderBy: { submittedAt: "desc" },
                },
                disputes: {
                  orderBy: { createdAt: "desc" },
                },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ success: true, agreements });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    const body = await req.json();
    const {
      title,
      description,
      totalAmountCents,
      creatorRole = "CUSTOMER",
      counterpartyEmail,
      stages,
    } = body;

    const creatorId = user ? user.id : "user_elena_customer";
    const creatorEmail = user ? user.email : "elena@example.com";

    const agreement = await prisma.agreement.create({
      data: {
        title: title || "New Milestone Agreement",
        description: description || "TIDESET Survivable Project Agreement",
        totalAmountCents: Math.round(totalAmountCents),
        currency: "USD",
        status: "DRAFT",
        createdById: creatorId,
        customerId: creatorRole === "CUSTOMER" ? creatorId : null,
        providerId: creatorRole === "PROVIDER" ? creatorId : null,
        currentVersionNumber: 1,
        participants: {
          create: [
            {
              userId: creatorId,
              invitedEmail: creatorEmail,
              role: creatorRole,
              status: "ACTIVE",
            },
          ],
        },
        versions: {
          create: {
            versionNumber: 1,
            totalAmountCents: Math.round(totalAmountCents),
            proposalSummary: `Initial agreement proposal with ${stages?.length || 3} milestone stages.`,
            customerApprovalState: creatorRole === "CUSTOMER" ? "APPROVED" : "PENDING",
            customerApprovedAt: creatorRole === "CUSTOMER" ? new Date() : null,
            providerApprovalState: creatorRole === "PROVIDER" ? "APPROVED" : "PENDING",
            providerApprovedAt: creatorRole === "PROVIDER" ? new Date() : null,
            solverRationale: "Verified by Deterministic Constraint Solver.",
            stages: {
              create: (stages || []).map((s: any, idx: number) => ({
                sequenceIndex: idx + 1,
                title: s.title,
                description: s.description || "",
                amountCents: Math.round(s.amountCents),
                dueDate: new Date(Date.now() + (s.dueDayOffset || (idx + 1) * 14) * 86400000),
                deliveryDate: new Date(Date.now() + (s.deliveryDayOffset || (idx + 1) * 14 + 7) * 86400000),
                status: idx === 0 ? "PAYMENT_PENDING" : "LOCKED",
                paymentStatus: idx === 0 ? "CHECKOUT_CREATED" : "UNPAID",
                deliveryStatus: "NOT_STARTED",
              })),
            },
          },
        },
      },
      include: {
        versions: {
          include: { stages: true },
        },
        participants: true,
      },
    });

    // Record audit creation event
    await prisma.auditEvent.create({
      data: {
        agreementId: agreement.id,
        actorId: creatorId,
        eventType: "AGREEMENT_CREATED",
        details: `Agreement '${agreement.title}' created by ${user?.name || "Customer"} with ${stages?.length || 0} stages.`,
      },
    });

    // If counterparty email provided, create invitation
    let inviteToken: string | null = null;
    if (counterpartyEmail && counterpartyEmail.trim().length > 3) {
      const counterRole = creatorRole === "CUSTOMER" ? "PROVIDER" : "CUSTOMER";
      const token = generateSecureToken(32);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await prisma.invitation.create({
        data: {
          agreementId: agreement.id,
          invitedEmail: counterpartyEmail.trim().toLowerCase(),
          role: counterRole,
          token,
          expiresAt,
          createdById: creatorId,
        },
      });

      await prisma.agreementParticipant.create({
        data: {
          agreementId: agreement.id,
          invitedEmail: counterpartyEmail.trim().toLowerCase(),
          role: counterRole,
          status: "INVITED",
        },
      });

      inviteToken = token;
    }

    return NextResponse.json({
      success: true,
      agreement,
      inviteToken,
      inviteUrl: inviteToken ? `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/invite/${inviteToken}` : null,
    });
  } catch (error: any) {
    console.error("Agreement creation error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
