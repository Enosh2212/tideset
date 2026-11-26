import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authorizeStage } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Strictly verify Customer role and ownership
    const auth = await authorizeStage(req, id, ["CUSTOMER"]);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const stage = auth.context.stage;

    if (stage.status !== "SUBMITTED") {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot accept stage in '${stage.status}' status. Stage deliverables must be submitted first.`,
        },
        { status: 400 }
      );
    }

    // 1. Mark this stage ACCEPTED
    const updatedStage = await prisma.stage.update({
      where: { id },
      data: { status: "ACCEPTED" },
    });

    // 2. Fetch all stages of this version to find the next sequential milestone
    const allStages = await prisma.stage.findMany({
      where: { versionId: stage.versionId },
      orderBy: { sequenceIndex: "asc" },
    });

    const nextStage = allStages.find((s: any) => s.sequenceIndex === stage.sequenceIndex + 1);

    if (nextStage) {
      await prisma.stage.update({
        where: { id: nextStage.id },
        data: { status: "PAYMENT_PENDING" },
      });
    } else {
      // All stages accepted -> Complete agreement
      await prisma.agreement.update({
        where: { id: auth.context.agreement.id },
        data: { status: "COMPLETED" },
      });
    }

    await prisma.auditEvent.create({
      data: {
        agreementId: auth.context.agreement.id,
        stageId: stage.id,
        actorId: auth.context.user.id,
        eventType: "DELIVERABLES_ACCEPTED",
        details: `Customer accepted deliverables for ${stage.title}.${
          nextStage
            ? ` Unlocked ${nextStage.title} for payment.`
            : " All milestones fulfilled! Project marked COMPLETED."
        }`,
      },
    });

    return NextResponse.json({
      success: true,
      stage: updatedStage,
      nextStageUnlocked: !!nextStage,
      isProjectCompleted: !nextStage,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
