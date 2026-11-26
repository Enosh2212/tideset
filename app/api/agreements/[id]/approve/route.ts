import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authorizeAgreement } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { versionNumber, actorRole } = body;

    const targetRole = actorRole as "CUSTOMER" | "PROVIDER";
    const auth = await authorizeAgreement(req, id, [targetRole]);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const agreement = await prisma.agreement.findUnique({
      where: { id },
      include: {
        versions: {
          where: { versionNumber },
          include: { stages: true },
        },
      },
    });

    if (!agreement || agreement.versions.length === 0) {
      return NextResponse.json(
        { success: false, error: "Specified agreement version not found" },
        { status: 404 }
      );
    }

    const version = agreement.versions[0];
    const updateData: any = {};

    if (targetRole === "CUSTOMER") {
      updateData.customerApprovalState = "APPROVED";
      updateData.customerApprovedAt = new Date();
    } else {
      updateData.providerApprovalState = "APPROVED";
      updateData.providerApprovedAt = new Date();
    }

    const updatedVersion = await prisma.agreementVersion.update({
      where: { id: version.id },
      data: updateData,
    });

    // Check if both approved
    const isCustomerApproved =
      updateData.customerApprovalState === "APPROVED" ||
      version.customerApprovalState === "APPROVED";
    const isProviderApproved =
      updateData.providerApprovalState === "APPROVED" ||
      version.providerApprovalState === "APPROVED";

    let agreementStatus = agreement.status;
    if (isCustomerApproved && isProviderApproved) {
      agreementStatus = "ACTIVE";
      await prisma.agreement.update({
        where: { id },
        data: { status: "ACTIVE" },
      });

      // Unlock stage 1 for payment if not already paid
      const stage1 = version.stages.find((s) => s.sequenceIndex === 1);
      if (stage1 && stage1.status === "LOCKED") {
        await prisma.stage.update({
          where: { id: stage1.id },
          data: { status: "PAYMENT_PENDING" },
        });
      }
    }

    await prisma.auditEvent.create({
      data: {
        agreementId: id,
        actorId: auth.context.user.id,
        eventType: "VERSION_RATIFIED",
        details: `${targetRole} ratified Version ${versionNumber}. (Agreement status: ${agreementStatus})`,
      },
    });

    return NextResponse.json({
      success: true,
      version: updatedVersion,
      agreementStatus,
      isFullyRatified: isCustomerApproved && isProviderApproved,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
