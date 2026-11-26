import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authorizeStage } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await authorizeStage(req, id, ["CUSTOMER"]);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const stage = auth.context.stage;
    const body = await req.json();
    const { revisionNotes } = body;

    if (stage.status !== "SUBMITTED") {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot request revision for stage in '${stage.status}' status. Stage deliverables must be submitted first.`,
        },
        { status: 400 }
      );
    }

    let history: any[] = [];
    if (stage.revisionHistory) {
      try {
        history = JSON.parse(stage.revisionHistory);
      } catch {
        history = [];
      }
    }

    history.push({
      round: history.length + 1,
      requestedAt: new Date().toISOString(),
      revisionNotes: revisionNotes || "Deliverables require adjustment according to agreed criteria.",
    });

    const updated = await prisma.stage.update({
      where: { id },
      data: {
        status: "REVISION_REQUESTED",
        revisionNotes: revisionNotes || "Deliverables require adjustment according to agreed criteria.",
        revisionHistory: JSON.stringify(history),
      },
    });

    await prisma.auditEvent.create({
      data: {
        agreementId: auth.context.agreement.id,
        stageId: stage.id,
        actorId: auth.context.user.id,
        eventType: "REVISION_REQUESTED",
        details: `Customer requested revision round #${history.length} for ${stage.title}: "${
          revisionNotes || "Changes requested."
        }"`,
      },
    });

    return NextResponse.json({ success: true, stage: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
