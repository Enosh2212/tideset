import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authorizeStage } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await authorizeStage(req, id, ["CUSTOMER", "PROVIDER"]);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const stage = auth.context.stage;
    const body = await req.json();
    const { disputeReason, proposedResolution, proposedRefundCents } = body;

    // Create formal DisputeRecord
    const dispute = await prisma.disputeRecord.create({
      data: {
        agreementId: auth.context.agreement.id,
        stageId: stage.id,
        openedById: auth.context.user.id,
        reason: disputeReason || "Dispute raised regarding agreed acceptance criteria.",
        proposedResolution: proposedResolution || "REVISE_WITHOUT_CHARGE",
        proposedRefundCents: proposedRefundCents || null,
        status: "OPEN",
      },
    });

    const updated = await prisma.stage.update({
      where: { id },
      data: {
        status: "DISPUTED",
        disputeReason: disputeReason || "Dispute raised regarding agreed acceptance criteria.",
        disputeStatus: "OPEN",
      },
    });

    await prisma.agreement.update({
      where: { id: auth.context.agreement.id },
      data: { status: "DISPUTED" },
    });

    await prisma.auditEvent.create({
      data: {
        agreementId: auth.context.agreement.id,
        stageId: stage.id,
        actorId: auth.context.user.id,
        eventType: "MILESTONE_DISPUTED",
        details: `${auth.context.user.role} opened formal dispute #${dispute.id.substring(
          0,
          8
        )}: "${disputeReason}". Proposed resolution: ${
          proposedResolution || "Revision"
        }. Note: TIDESET facilitates bilateral dispute resolution and does not unilaterally judge subjective creative quality.`,
      },
    });

    return NextResponse.json({ success: true, stage: updated, dispute });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
