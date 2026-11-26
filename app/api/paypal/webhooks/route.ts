import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/paypal";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const event = JSON.parse(rawBody);

    const transmissionId = req.headers.get("paypal-transmission-id") || "";
    const transmissionTime = req.headers.get("paypal-transmission-time") || "";
    const certUrl = req.headers.get("paypal-cert-url") || "";
    const authAlgo = req.headers.get("paypal-auth-algo") || "";
    const transmissionSig = req.headers.get("paypal-transmission-sig") || "";
    const webhookId = process.env.PAYPAL_WEBHOOK_ID || "test_webhook_id";

    // 1. Signature Verification
    const isValid = await verifyWebhookSignature({
      transmissionId,
      transmissionTime,
      certUrl,
      authAlgo,
      transmissionSig,
      webhookId,
      webhookEvent: event,
    });

    if (!isValid) {
      console.warn(`[PayPal Webhook] Rejected invalid or unverified webhook signature for transmission ID: ${transmissionId}`);
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
    }

    const eventId = event.id || transmissionId || `EVENT-${Date.now()}`;
    const eventType = event.event_type;

    // Deduplicate webhook events via WebhookEvent table
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { paypalEventId: eventId },
    });

    if (existingEvent) {
      return NextResponse.json(
        { status: "ALREADY_PROCESSED", eventId, duplicate: true },
        { status: 200 }
      );
    }

    // Persist incoming webhook event
    await prisma.webhookEvent.create({
      data: {
        paypalEventId: eventId,
        eventType,
        resourceType: event.resource_type || "UNKNOWN",
        summary: event.summary || "",
        payloadJson: rawBody,
        verified: true,
        status: "PROCESSED",
      },
    });

    // 2. Handle PAYMENT.CAPTURE.COMPLETED
    if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
      const resource = event.resource;
      const captureId = resource.id;
      const stageId = resource.custom_id || resource.supplementary_data?.related_ids?.custom_id;

      // Idempotency check: Has this capture already been processed?
      const existing = await prisma.paymentRecord.findUnique({
        where: { paypalCaptureId: captureId },
      });

      if (existing) {
        return NextResponse.json({ status: "ALREADY_PROCESSED", captureId }, { status: 200 });
      }

      if (stageId) {
        const stage = await prisma.stage.findUnique({
          where: { id: stageId },
          include: { version: { include: { agreement: true } } },
        });

        if (stage) {
          const capturedCents = Math.round(parseFloat(resource.amount.value) * 100);

          await prisma.paymentRecord.create({
            data: {
              stageId: stage.id,
              paypalCaptureId: captureId,
              amountCapturedCents: capturedCents,
              currency: resource.amount.currency_code,
              payerEmail: resource.payer?.email_address || "webhook-buyer@paypal.com",
              status: "COMPLETED",
              settlementType: "REAL_SANDBOX_PAYPAL",
              rawPayload: JSON.stringify(resource),
            },
          });

          await prisma.stage.update({
            where: { id: stage.id },
            data: {
              status: "PAYMENT_VERIFIED",
              paymentStatus: "PAID",
              deliveryStatus: "IN_PROGRESS",
            },
          });

          await prisma.auditEvent.create({
            data: {
              agreementId: stage.version.agreement.id,
              stageId: stage.id,
              eventType: "WEBHOOK_PAYMENT_VERIFIED",
              details: `Asynchronous PayPal Webhook processed [REAL SANDBOX PAYMENT VERIFIED]: ${captureId} for $${(
                capturedCents / 100
              ).toFixed(2)}. Stage marked PAYMENT_VERIFIED.`,
            },
          });
        }
      }
    }

    // 3. Handle INVOICING.INVOICE.PAID
    if (eventType === "INVOICING.INVOICE.PAID") {
      const invoice = event.resource?.invoice || event.resource;
      const invoiceId = invoice.id;

      const stage = await prisma.stage.findFirst({
        where: { paypalInvoiceId: invoiceId },
        include: { version: { include: { agreement: true } } },
      });

      if (stage && stage.status !== "PAYMENT_VERIFIED") {
        const invoiceCaptureId = `INV-PAID-${invoiceId}`;

        // Idempotency
        const existing = await prisma.paymentRecord.findUnique({
          where: { paypalCaptureId: invoiceCaptureId },
        });

        if (!existing) {
          const amountCents = Math.round(parseFloat(invoice.amount.value) * 100);

          await prisma.paymentRecord.create({
            data: {
              stageId: stage.id,
              paypalCaptureId: invoiceCaptureId,
              amountCapturedCents: amountCents,
              currency: invoice.amount.currency_code || "USD",
              payerEmail: invoice.primary_recipients?.[0]?.billing_info?.email_address,
              status: "COMPLETED",
              settlementType: "REAL_SANDBOX_PAYPAL",
              rawPayload: JSON.stringify(invoice),
            },
          });

          await prisma.stage.update({
            where: { id: stage.id },
            data: {
              status: "PAYMENT_VERIFIED",
              paymentStatus: "PAID",
              deliveryStatus: "IN_PROGRESS",
            },
          });

          await prisma.auditEvent.create({
            data: {
              agreementId: stage.version.agreement.id,
              stageId: stage.id,
              eventType: "WEBHOOK_INVOICE_PAID",
              details: `Official PayPal Invoice ${invoiceId} marked PAID via Webhook [REAL SANDBOX PAYMENT VERIFIED]. Stage authorized to begin.`,
            },
          });
        }
      }
    }

    return NextResponse.json({ status: "SUCCESS", received: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
