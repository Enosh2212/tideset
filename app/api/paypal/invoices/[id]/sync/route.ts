import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPayPalInvoiceStatus } from "@/lib/paypal";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: invoiceId } = await params;

    const stage = await prisma.stage.findFirst({
      where: { paypalInvoiceId: invoiceId },
      include: { version: { include: { agreement: true } } },
    });

    if (!stage) {
      return NextResponse.json({ success: false, error: "Stage not found for this invoice" }, { status: 404 });
    }

    // Authoritative check with PayPal API
    const invoiceStatus = await verifyPayPalInvoiceStatus(invoiceId);

    if (invoiceStatus.isPaid && stage.status !== "PAYMENT_VERIFIED") {
      const captureId = `INV-SYNC-${invoiceId}`;
      const amountCents = invoiceStatus.paidAmountCents || stage.amountCents;

      // Idempotent upsert of payment record
      await prisma.paymentRecord.upsert({
        where: { paypalCaptureId: captureId },
        update: {},
        create: {
          stageId: stage.id,
          paypalCaptureId: captureId,
          amountCapturedCents: amountCents,
          currency: "USD",
          status: "COMPLETED",
          settlementType: invoiceStatus.settlementType,
        },
      });

      const updatedStage = await prisma.stage.update({
        where: { id: stage.id },
        data: { status: "PAYMENT_VERIFIED" },
      });

      await prisma.auditEvent.create({
        data: {
          agreementId: stage.version.agreement.id,
          stageId: stage.id,
          eventType: "INVOICE_RECONCILED_PAID",
          details: `Polled PayPal Sandbox: Invoice ${invoiceId} confirmed PAID [${invoiceStatus.settlementType}]. Status: ${invoiceStatus.systemStatus}. Stage transitioned to PAYMENT_VERIFIED.`,
        },
      });

      return NextResponse.json({
        success: true,
        isPaid: true,
        paypalStatus: invoiceStatus.status,
        stage: updatedStage,
      });
    }

    return NextResponse.json({
      success: true,
      isPaid: false,
      paypalStatus: invoiceStatus.status,
      message: `Invoice status is '${invoiceStatus.status}'. Work is not cleared until payment is settled.`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
