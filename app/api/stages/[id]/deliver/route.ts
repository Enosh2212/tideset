import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authorizeStage } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Strictly verify Provider role and ownership
    const auth = await authorizeStage(req, id, ["PROVIDER"]);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const stage = auth.context.stage;
    const body = await req.json();
    const { deliverablesNotes, repoUrl, previewUrl, artifactSummary } = body;

    if (
      stage.status !== "PAYMENT_VERIFIED" &&
      stage.status !== "IN_PROGRESS" &&
      stage.status !== "REVISION_REQUESTED"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot submit deliverables for stage in '${stage.status}' status. Stage must have verified payment first.`,
        },
        { status: 400 }
      );
    }

    // Build deliverable evidence payload
    const evidence = {
      notes: deliverablesNotes || "Work completed according to agreed specifications.",
      repoUrl: repoUrl || "",
      previewUrl: previewUrl || "",
      artifactSummary: artifactSummary || "",
      submittedAt: new Date().toISOString(),
    };

    const now = new Date();
    const reviewDeadline = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // 5-day review deadline

    // Maintain structured revision history
    let history: any[] = [];
    if (stage.revisionHistory) {
      try {
        history = JSON.parse(stage.revisionHistory);
      } catch {
        history = [];
      }
    }

    if (stage.status === "REVISION_REQUESTED" && stage.revisionNotes) {
      history.push({
        round: history.length + 1,
        clientFeedback: stage.revisionNotes,
        providerResubmissionNotes: deliverablesNotes,
        resubmittedAt: now.toISOString(),
      });
    }

    const updated = await prisma.stage.update({
      where: { id },
      data: {
        status: "SUBMITTED",
        deliverableEvidence: JSON.stringify(evidence),
        submittedAt: now,
        reviewDeadline,
        revisionHistory: JSON.stringify(history),
      },
    });

    await prisma.auditEvent.create({
      data: {
        agreementId: auth.context.agreement.id,
        stageId: stage.id,
        actorId: auth.context.user.id,
        eventType: "DELIVERABLES_SUBMITTED",
        details: `Provider delivered deliverables for ${stage.title} with evidence. 5-day client review deadline set: ${reviewDeadline.toLocaleDateString()}. Notes: "${
          deliverablesNotes || "Work submitted."
        }"`,
      },
    });

    return NextResponse.json({ success: true, stage: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
