import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { capturePayPalOrder } from "@/lib/paypal";
import { authorizeStage } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, stageId } = body;

    const auth = await authorizeStage(req, stageId, ["CUSTOMER"]);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const stage = auth.context.stage;

    // Check if stage is already verified
    if (stage.status === "PAYMENT_VERIFIED" || stage.status === "ACCEPTED") {
      return NextResponse.json(
        { success: false, error: "Stage payment has already been verified and processed." },
        { status: 400 }
      );
    }

    // Authoritative Server-Side Settlement Capture
    const captureResult = await capturePayPalOrder(orderId, stage.amountCents, true);

    // Exact monetary verification invariant
    if (captureResult.amountCapturedCents !== stage.amountCents) {
      return NextResponse.json(
        {
          success: false,
          error: `Amount mismatch: Captured $${(captureResult.amountCapturedCents / 100).toFixed(
            2
          )} does not match expected stage amount $${(stage.amountCents / 100).toFixed(2)}`,
        },
        { status: 400 }
      );
    }

    // Atomic database update with idempotency key on captureId
    const payment = await prisma.paymentRecord.create({
      data: {
        stageId: stage.id,
        paypalCaptureId: captureResult.captureId,
        amountCapturedCents: captureResult.amountCapturedCents,
        currency: captureResult.currency,
        payerEmail: captureResult.payerEmail || auth.context.user.email,
        status: "COMPLETED",
        settlementType: captureResult.settlementType,
        rawPayload: JSON.stringify(captureResult.raw),
      },
    });

    const updatedStage = await prisma.stage.update({
      where: { id: stageId },
      data: { status: "PAYMENT_VERIFIED" },
    });

    // Update matching payment attempt status to CAPTURED
    await prisma.paymentAttempt.updateMany({
      where: { paypalOrderId: orderId },
      data: { status: "CAPTURED" },
    });

    await prisma.auditEvent.create({
      data: {
        agreementId: auth.context.agreement.id,
        stageId: stage.id,
        actorId: auth.context.user.id,
        eventType: "PAYMENT_VERIFIED",
        details: `PayPal Settlement Verified [${captureResult.settlementType}]: $${(
          captureResult.amountCapturedCents / 100
        ).toFixed(2)} captured (Capture ID: ${captureResult.captureId}). Stage status: PAYMENT_VERIFIED. Provider cleared to begin work.`,
      },
    });

    return NextResponse.json({
      success: true,
      stage: updatedStage,
      payment,
      systemStatus: captureResult.systemStatus,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
