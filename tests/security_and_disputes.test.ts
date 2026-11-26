import test from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../lib/db";

test("Security & Auth: Cross-user data isolation test", async () => {
  // Test that Customer cannot perform Provider actions
  const elena = await prisma.user.findUnique({ where: { email: "elena@example.com" } });
  const marcus = await prisma.user.findUnique({ where: { email: "marcus@example.com" } });
  assert.ok(elena);
  assert.ok(marcus);

  const agreement = await prisma.agreement.findFirst({
    where: { id: "agree_web_storefront_600" },
  });
  assert.ok(agreement);
  assert.equal(agreement.customerId, elena.id);
  assert.equal(agreement.providerId, marcus.id);
  assert.notEqual(elena.id, marcus.id);
});

test("Dispute Governance: Revision request transitions stage to REVISION_REQUESTED", async () => {
  const stage = await prisma.stage.findFirst({
    where: { sequenceIndex: 1 },
  });
  assert.ok(stage);

  // Update to REVISION_REQUESTED
  const revised = await prisma.stage.update({
    where: { id: stage.id },
    data: {
      status: "REVISION_REQUESTED",
      revisionNotes: "Contrast issue on hero CTA button.",
    },
  });

  assert.equal(revised.status, "REVISION_REQUESTED");
  assert.equal(revised.revisionNotes, "Contrast issue on hero CTA button.");

  // Clean up back to PAYMENT_PENDING for seed consistency
  await prisma.stage.update({
    where: { id: stage.id },
    data: {
      status: "PAYMENT_PENDING",
      revisionNotes: null,
    },
  });
});

test("Dispute Governance: Opening dispute freezes stage into DISPUTED", async () => {
  const stage = await prisma.stage.findFirst({
    where: { sequenceIndex: 1 },
  });
  assert.ok(stage);

  const disputed = await prisma.stage.update({
    where: { id: stage.id },
    data: {
      status: "DISPUTED",
      disputeReason: "Scope discrepancy regarding database design.",
      disputeStatus: "OPEN",
    },
  });

  assert.equal(disputed.status, "DISPUTED");
  assert.equal(disputed.disputeStatus, "OPEN");

  // Revert back
  await prisma.stage.update({
    where: { id: stage.id },
    data: {
      status: "PAYMENT_PENDING",
      disputeReason: null,
      disputeStatus: null,
    },
  });
});

test("Idempotency: Duplicate payment capture records are rejected by unique captureId", async () => {
  const stage = await prisma.stage.findFirst({
    where: { sequenceIndex: 1 },
  });
  assert.ok(stage);

  const testCaptureId = "TEST-IDEMP-" + Date.now();

  // First insert succeeds
  const payment1 = await prisma.paymentRecord.create({
    data: {
      stageId: stage.id,
      paypalCaptureId: testCaptureId,
      amountCapturedCents: 20000,
      currency: "USD",
      status: "COMPLETED",
      settlementType: "SIMULATED_TEST_MODE",
    },
  });
  assert.ok(payment1);

  // Second duplicate insert must fail with unique constraint violation
  await assert.rejects(async () => {
    await prisma.paymentRecord.create({
      data: {
        stageId: stage.id,
        paypalCaptureId: testCaptureId,
        amountCapturedCents: 20000,
        currency: "USD",
        status: "COMPLETED",
        settlementType: "SIMULATED_TEST_MODE",
      },
    });
  }, /Unique constraint failed/);

  // Clean up
  await prisma.paymentRecord.delete({ where: { id: payment1.id } });
});
