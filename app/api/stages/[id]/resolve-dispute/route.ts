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
    const { resolutionChoice, resolutionNotes } = body;

    const openDispute = await prisma.disputeRecord.findFirst({
      where: { stageId: id, status: "OPEN" },
      orderBy: { createdAt: "desc" },
    });

    if (!openDispute) {
      return NextResponse.json({ success: false, error: "No open dispute found for this stage." }, { status: 404 });
    }

    const now = new Date();

    // 1. Update dispute record
    await prisma.disputeRecord.update({
      where: { id: openDispute.id },
      data: {
        status: "RESOLVED_MUTUAL_AGREEMENT",
        resolutionNotes: resolutionNotes || `Resolved via bilateral agreement: ${resolutionChoice}`,
        resolvedAt: now,
      },
    });

    // 2. Transition stage based on resolution choice
    let newStageStatus = "PAYMENT_VERIFIED";
    let newAgreementStatus = "ACTIVE";

    if (resolutionChoice === "MUTUAL_CANCELLATION") {
      newStageStatus = "LOCKED";
      newAgreementStatus = "COMPLETED";
    }

    const updatedStage = await prisma.stage.update({
      where: { id },
      data: {
        status: newStageStatus,
        disputeStatus: "RESOLVED",
      },
    });

    await prisma.agreement.update({
      where: { id: auth.context.agreement.id },
      data: { status: newAgreementStatus },
    });

    await prisma.auditEvent.create({
      data: {
        agreementId: auth.context.agreement.id,
        stageId: stage.id,
        actorId: auth.context.user.id,
        eventType: "DISPUTE_RESOLVED",
        details: `Dispute #${openDispute.id.substring(
          0,
          8
        )} resolved by mutual bilateral agreement: ${resolutionChoice}. Agreement status restored to ${newAgreementStatus}.`,
      },
    });

    return NextResponse.json({
      success: true,
      stage: updatedStage,
      agreementStatus: newAgreementStatus,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
