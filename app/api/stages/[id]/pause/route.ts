import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authorizeStage } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await authorizeStage(req, id, ["PROVIDER"]);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const stage = auth.context.stage;
    const body = await req.json();
    const { pausedReason } = body;

    const updated = await prisma.stage.update({
      where: { id },
      data: {
        status: "PAUSED",
        pausedReason: pausedReason || "Work paused pending client clarification or external assets.",
      },
    });

    await prisma.auditEvent.create({
      data: {
        agreementId: auth.context.agreement.id,
        stageId: stage.id,
        actorId: auth.context.user.id,
        eventType: "STAGE_PAUSED",
        details: `Provider paused work on ${stage.title}: "${
          pausedReason || "Temporary operational pause."
        }"`,
      },
    });

    return NextResponse.json({ success: true, stage: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
