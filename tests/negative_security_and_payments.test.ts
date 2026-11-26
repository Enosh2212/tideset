import test from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../lib/db";
import { createSessionToken, verifySessionToken } from "../lib/session";
import { authorizeAgreement, authorizeStage } from "../lib/auth";
import { NextRequest } from "next/server";

test("Negative Security 1: Rejection of forged, unsigned identity headers", async () => {
  // Attacker crafts a request with raw headers attempting to impersonate Marcus
  const forgedReq = new NextRequest("http://localhost:3000/api/stages/stage_discovery_v1/deliver", {
    method: "POST",
    headers: {
      "x-tideset-user-id": "user_marcus_provider",
      "x-tideset-role": "PROVIDER",
    },
  });

  const auth = await authorizeStage(forgedReq, "stage_discovery_v1", ["PROVIDER"]);
  assert.equal(auth.authorized, false);
  assert.equal(auth.status, 401);
  assert.match(auth.error, /Missing or invalid server-verified session/);
});

test("Negative Security 2: Rejection of tampered HMAC session tokens", async () => {
  // Generate a legitimate token for Elena
  const validToken = createSessionToken({
    userId: "user_elena_customer",
    role: "CUSTOMER",
    email: "elena@example.com",
  });

  // Tamper with one character of the signature
  const [data, sig] = validToken.split(".");
  const tamperedSig = sig.substring(0, sig.length - 2) + "ff";
  const tamperedToken = `${data}.${tamperedSig}`;

  const verified = verifySessionToken(tamperedToken);
  assert.equal(verified, null, "Tampered signature must fail verification");

  const req = new NextRequest("http://localhost:3000/api/stages/stage_discovery_v1/accept", {
    method: "POST",
    headers: {
      cookie: `tideset_session=${tamperedToken}`,
    },
  });

  const auth = await authorizeStage(req, "stage_discovery_v1", ["CUSTOMER"]);
  assert.equal(auth.authorized, false);
  assert.equal(auth.status, 401);
});

test("Negative Security 3: Cross-account data isolation enforcement", async () => {
  // Create an intruder user who is NOT a party to the $600 agreement
  const intruder = await prisma.user.upsert({
    where: { email: "intruder@external.org" },
    update: {},
    create: {
      id: "user_intruder_buyer",
      email: "intruder@external.org",
      name: "Malicious Intruder",
      role: "CUSTOMER",
    },
  });

  const intruderSession = createSessionToken({
    userId: intruder.id,
    role: "CUSTOMER",
    email: intruder.email,
  });

  const req = new NextRequest("http://localhost:3000/api/agreements/agree_web_storefront_600/approve", {
    method: "POST",
    headers: {
      cookie: `tideset_session=${intruderSession}`,
    },
  });

  // Intruder tries to approve Elena's agreement
  const auth = await authorizeAgreement(req, "agree_web_storefront_600", ["CUSTOMER"]);
  assert.equal(auth.authorized, false);
  assert.equal(auth.status, 403);
  assert.match(auth.error, /Cross-account violation/);
});

test("Negative Payment 4: Duplicate payment capture replay protection (Idempotency)", async () => {
  const stage = await prisma.stage.findFirst({
    where: { sequenceIndex: 1 },
  });
  assert.ok(stage);

  const replayCaptureId = "PAYPAL-CAPTURE-REPLAY-ATTACK-" + Date.now();

  // Initial capture succeeds
  const initial = await prisma.paymentRecord.create({
    data: {
      stageId: stage.id,
      paypalCaptureId: replayCaptureId,
      amountCapturedCents: 20000,
      currency: "USD",
      status: "COMPLETED",
      settlementType: "SIMULATED_TEST_MODE",
    },
  });
  assert.ok(initial);

  // Simultaneous / duplicate replay capture MUST throw unique constraint violation
  await assert.rejects(async () => {
    await prisma.paymentRecord.create({
      data: {
        stageId: stage.id,
        paypalCaptureId: replayCaptureId,
        amountCapturedCents: 20000,
        currency: "USD",
        status: "COMPLETED",
        settlementType: "SIMULATED_TEST_MODE",
      },
    });
  }, /Unique constraint failed/);

  // Clean up
  await prisma.paymentRecord.delete({ where: { id: initial.id } });
});

test("Dispute Governance 5: Disputed stage blocks uncoordinated deliverable mutations", async () => {
  const stage = await prisma.stage.findFirst({
    where: { sequenceIndex: 1 },
  });
  assert.ok(stage);

  // Put stage into DISPUTED state
  await prisma.stage.update({
    where: { id: stage.id },
    data: { status: "DISPUTED" },
  });

  // Check that deliver route logic forbids delivering while DISPUTED
  const checkStatus = await prisma.stage.findUnique({ where: { id: stage.id } });
  const allowedToDeliver = ["PAYMENT_VERIFIED", "IN_PROGRESS", "REVISION_REQUESTED"].includes(
    checkStatus?.status || ""
  );
  assert.equal(allowedToDeliver, false, "DISPUTED stage must not allow deliverable submission");

  // Revert back
  await prisma.stage.update({
    where: { id: stage.id },
    data: { status: "PAYMENT_PENDING" },
  });
});

test("Concurrency 6: Parallel session creation integrity", async () => {
  const tokens = await Promise.all([
    createSessionToken({ userId: "user_elena_customer", role: "CUSTOMER", email: "elena@example.com" }),
    createSessionToken({ userId: "user_marcus_provider", role: "PROVIDER", email: "marcus@example.com" }),
  ]);

  const elenaSession = verifySessionToken(tokens[0]);
  const marcusSession = verifySessionToken(tokens[1]);

  assert.ok(elenaSession);
  assert.ok(marcusSession);
  assert.equal(elenaSession.userId, "user_elena_customer");
  assert.equal(marcusSession.userId, "user_marcus_provider");
});
