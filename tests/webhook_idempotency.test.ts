import { test } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../lib/db";
import { verifyWebhookSignature } from "../lib/paypal";

test("Webhook Idempotency 1: WebhookEvent table enforces unique constraint on paypalEventId", async () => {
  const uniqueEventId = `WH-TEST-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  // 1. Initial ingestion
  const event1 = await prisma.webhookEvent.create({
    data: {
      paypalEventId: uniqueEventId,
      eventType: "PAYMENT.CAPTURE.COMPLETED",
      resourceType: "capture",
      summary: "First delivery of test event",
      payloadJson: JSON.stringify({ id: uniqueEventId }),
      verified: true,
      status: "PROCESSED",
    },
  });
  assert.equal(event1.paypalEventId, uniqueEventId);
  assert.equal(event1.status, "PROCESSED");

  // 2. Duplicate ingestion attempt with identical paypalEventId MUST fail unique constraint
  await assert.rejects(async () => {
    await prisma.webhookEvent.create({
      data: {
        paypalEventId: uniqueEventId,
        eventType: "PAYMENT.CAPTURE.COMPLETED",
        resourceType: "capture",
        summary: "Replayed delivery of same test event",
        payloadJson: JSON.stringify({ id: uniqueEventId }),
        verified: true,
        status: "PROCESSED",
      },
    });
  }, (err: any) => {
    return err.code === "P2002" || err.message?.includes("Unique constraint failed");
  });

  // 3. Duplicate lookup query correctly identifies already-processed events
  const existing = await prisma.webhookEvent.findUnique({
    where: { paypalEventId: uniqueEventId },
  });
  assert.notEqual(existing, null);
  assert.equal(existing?.paypalEventId, uniqueEventId);
});

test("Webhook Idempotency 2: PaymentRecord unique constraint prevents double credit from replayed webhooks", async () => {
  const uniqueCaptureId = `CAP-WH-TEST-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  // Use existing stage to test PaymentRecord unique constraint
  const stage = await prisma.stage.findFirst();
  assert(stage, "A stage must exist in the database for payment record test");

  // 1. Initial capture record creation
  const record1 = await prisma.paymentRecord.create({
    data: {
      stageId: stage.id,
      paypalCaptureId: uniqueCaptureId,
      amountCapturedCents: 5000,
      currency: "USD",
      payerEmail: "wh-buyer@example.com",
      status: "COMPLETED",
      settlementType: "REAL_SANDBOX_PAYPAL",
      rawPayload: JSON.stringify({ id: uniqueCaptureId }),
    },
  });
  assert.equal(record1.paypalCaptureId, uniqueCaptureId);

  // 2. Second webhook replay with same captureId MUST be rejected by SQLite unique constraint
  await assert.rejects(async () => {
    await prisma.paymentRecord.create({
      data: {
        stageId: stage.id,
        paypalCaptureId: uniqueCaptureId,
        amountCapturedCents: 5000,
        currency: "USD",
        payerEmail: "wh-buyer@example.com",
        status: "COMPLETED",
        settlementType: "REAL_SANDBOX_PAYPAL",
        rawPayload: JSON.stringify({ id: uniqueCaptureId }),
      },
    });
  }, (err: any) => {
    return err.code === "P2002" || err.message?.includes("Unique constraint failed");
  });

  // 3. Confirm count of records with this captureId is exactly 1 (zero double counting)
  const count = await prisma.paymentRecord.count({
    where: { paypalCaptureId: uniqueCaptureId },
  });
  assert.equal(count, 1);

  // Clean up test capture record so we don't pollute future tests
  await prisma.paymentRecord.delete({
    where: { paypalCaptureId: uniqueCaptureId },
  });
});

test("Webhook Idempotency 3: Webhook signature verification distinguishes simulated vs missing headers", async () => {
  const origClientId = process.env.PAYPAL_CLIENT_ID;
  const origSecret = process.env.PAYPAL_CLIENT_SECRET;

  try {
    // In simulated environment (credentials not configured)
    process.env.PAYPAL_CLIENT_ID = "sb";
    process.env.PAYPAL_CLIENT_SECRET = "sandbox_secret";

    const simResult = await verifyWebhookSignature({
      transmissionId: "TEST-TRANS-SIMULATED",
      transmissionTime: new Date().toISOString(),
      certUrl: "https://api.sandbox.paypal.com/v1/notifications/certs/CERT-360-12345",
      authAlgo: "SHA256withRSA",
      transmissionSig: "test_sig",
      webhookId: "test_webhook_id",
      webhookEvent: { id: "EVT-SIMULATED", event_type: "CHECKOUT.ORDER.APPROVED" },
    });

    assert.equal(simResult, true);

    const invalidSimResult = await verifyWebhookSignature({
      transmissionId: "FORGED-LIVE-HEADER",
      transmissionTime: new Date().toISOString(),
      certUrl: "https://api.sandbox.paypal.com/v1/notifications/certs/CERT-360-12345",
      authAlgo: "SHA256withRSA",
      transmissionSig: "test_sig",
      webhookId: "test_webhook_id",
      webhookEvent: { id: "EVT-FORGED" },
    });

    assert.equal(invalidSimResult, false);
  } finally {
    process.env.PAYPAL_CLIENT_ID = origClientId;
    process.env.PAYPAL_CLIENT_SECRET = origSecret;
  }
});
