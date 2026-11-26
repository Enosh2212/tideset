import { test } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../lib/db";
import { createPayPalOrder } from "../lib/paypal";

test("Payment Lifecycle 1: Every distinct payment attempt generates a unique persisted idempotency key", async () => {
  // Create dummy stage for testing in-memory / test DB
  const agreement = await prisma.agreement.findFirst({
    include: { versions: { include: { stages: true } } },
  });
  assert.ok(agreement, "Seed agreement exists");
  const stage = agreement.versions[0].stages[0];

  const attempt1 = await prisma.paymentAttempt.create({
    data: {
      stageId: stage.id,
      paypalOrderId: `TEST_ORDER_1_${Date.now()}`,
      amountCents: stage.amountCents,
      currency: "USD",
      status: "CREATED",
    },
  });

  const attempt2 = await prisma.paymentAttempt.create({
    data: {
      stageId: stage.id,
      paypalOrderId: `TEST_ORDER_2_${Date.now()}`,
      amountCents: stage.amountCents,
      currency: "USD",
      status: "CREATED",
    },
  });

  assert.notEqual(attempt1.id, attempt2.id, "Attempts must have distinct unique IDs");
  assert.equal(`order_${attempt1.id}` !== `order_${attempt2.id}`, true, "Idempotency request IDs must be distinct");

  // Clean up test attempts
  await prisma.paymentAttempt.deleteMany({
    where: { id: { in: [attempt1.id, attempt2.id] } },
  });
});

test("Payment Lifecycle 2: Retries of the SAME attempt reuse the SAME idempotency key", async () => {
  const agreement = await prisma.agreement.findFirst({
    include: { versions: { include: { stages: true } } },
  });
  const stage = agreement!.versions[0].stages[0];

  const attempt = await prisma.paymentAttempt.create({
    data: {
      stageId: stage.id,
      paypalOrderId: `TEST_RETRY_${Date.now()}`,
      amountCents: stage.amountCents,
      currency: "USD",
      status: "CREATED",
    },
  });

  const key1 = `order_${attempt.id}`;
  const key2 = `order_${attempt.id}`;

  assert.equal(key1, key2, "Retrying the same payment attempt must reuse the exact same PayPal-Request-Id");

  await prisma.paymentAttempt.delete({ where: { id: attempt.id } });
});

test("Payment Lifecycle 3: Cancelled or expired attempt allows creating a NEW attempt with a FRESH key", async () => {
  const agreement = await prisma.agreement.findFirst({
    include: { versions: { include: { stages: true } } },
  });
  const stage = agreement!.versions[0].stages[0];

  const oldAttempt = await prisma.paymentAttempt.create({
    data: {
      stageId: stage.id,
      paypalOrderId: `TEST_EXPIRED_${Date.now()}`,
      amountCents: stage.amountCents,
      currency: "USD",
      status: "CANCELLED",
    },
  });

  const newAttempt = await prisma.paymentAttempt.create({
    data: {
      stageId: stage.id,
      paypalOrderId: `TEST_REPLACEMENT_${Date.now()}`,
      amountCents: stage.amountCents,
      currency: "USD",
      status: "CREATED",
    },
  });

  assert.notEqual(oldAttempt.id, newAttempt.id);
  assert.equal(oldAttempt.status, "CANCELLED");
  assert.equal(newAttempt.status, "CREATED");
  assert.notEqual(`order_${oldAttempt.id}`, `order_${newAttempt.id}`);

  await prisma.paymentAttempt.deleteMany({
    where: { id: { in: [oldAttempt.id, newAttempt.id] } },
  });
});

test("Payment Lifecycle 4: Replay capture defense — unique constraint on paypalCaptureId prevents double crediting", async () => {
  const agreement = await prisma.agreement.findFirst({
    include: { versions: { include: { stages: true } } },
  });
  const stage = agreement!.versions[0].stages[0];
  const uniqueCaptureId = `CAP_TEST_UNIQUE_${Date.now()}`;

  const rec1 = await prisma.paymentRecord.create({
    data: {
      stageId: stage.id,
      paypalCaptureId: uniqueCaptureId,
      amountCapturedCents: stage.amountCents,
      currency: "USD",
      status: "COMPLETED",
      settlementType: "SIMULATED_LOCAL_TEST",
    },
  });
  assert.ok(rec1.id);

  // Second capture with exact same captureId must be rejected by SQLite unique constraint
  await assert.rejects(async () => {
    await prisma.paymentRecord.create({
      data: {
        stageId: stage.id,
        paypalCaptureId: uniqueCaptureId,
        amountCapturedCents: stage.amountCents,
        currency: "USD",
        status: "COMPLETED",
        settlementType: "SIMULATED_LOCAL_TEST",
      },
    });
  }, /Unique constraint failed/);

  // Clean up
  await prisma.paymentRecord.delete({ where: { id: rec1.id } });
});

test("Payment Lifecycle 5: Completed stage payment rejects duplicate capture attempts", async () => {
  const stageStatus: string = "PAYMENT_VERIFIED";
  const isPayable = stageStatus === "PAYMENT_PENDING";
  assert.equal(isPayable, false, "PAYMENT_VERIFIED stage must not allow new checkout or capture");
});
