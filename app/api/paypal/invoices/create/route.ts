import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createAndSendInvoice } from "@/lib/paypal";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { stageId } = body;

    const stage = await prisma.stage.findUnique({
      where: { id: stageId },
      include: {
        version: {
          include: {
            agreement: {
              include: { customer: true, provider: true },
            },
          },
        },
      },
    });

    if (!stage) {
      return NextResponse.json({ success: false, error: "Stage not found" }, { status: 404 });
    }

    // Duplicate billing guard: Never issue an invoice for an already settled stage
    if (stage.status === "PAYMENT_VERIFIED" || stage.status === "ACCEPTED") {
      return NextResponse.json(
        { success: false, error: "Milestone has already been paid and settled. Cannot issue duplicate invoice." },
        { status: 400 }
      );
    }

    // Single active invoice guard: Prevent generating multiple concurrent invoices for the same milestone
    if (stage.paypalInvoiceId) {
      return NextResponse.json(
        {
          success: false,
          error: `An invoice has already been issued for this milestone (Invoice ID: ${stage.paypalInvoiceId}). Sync invoice status or view existing invoice.`,
        },
        { status: 400 }
      );
    }

    const { agreement } = stage.version;

    const customerEmail = agreement.customer?.email || "customer@example.com";
    const customerName = agreement.customer?.name || "Customer";
    const providerEmail = agreement.provider?.email || "provider@example.com";
    const providerName = agreement.provider?.name || "Provider";

    const invoiceResult = await createAndSendInvoice({
      stageId: stage.id,
      stageTitle: stage.title,
      amountCents: stage.amountCents,
      currency: "USD",
      customerEmail,
      customerName,
      providerEmail,
      providerName,
    });

    const updatedStage = await prisma.stage.update({
      where: { id: stageId },
      data: {
        paypalInvoiceId: invoiceResult.invoiceId,
        paypalInvoiceUrl: invoiceResult.payerViewUrl,
        status: stage.status === "LOCKED" ? "PAYMENT_PENDING" : stage.status,
      },
    });

    await prisma.auditEvent.create({
      data: {
        agreementId: agreement.id,
        stageId: stage.id,
        actorId: agreement.providerId,
        eventType: "INVOICE_SENT",
        details: `Official PayPal Invoice created & sent: ${invoiceResult.invoiceNumber} (${invoiceResult.invoiceId}) for $${(
          stage.amountCents / 100
        ).toFixed(2)}. Payer view URL generated.`,
      },
    });

    return NextResponse.json({
      success: true,
      stage: updatedStage,
      invoice: invoiceResult,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
