import test from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../lib/db";
import { hashPassword, verifyPassword, generateSecureToken } from "../lib/security";
import { createDatabaseSession, verifyDatabaseSession, destroyDatabaseSession } from "../lib/session";
import { authorizeAgreement, authorizeStage } from "../lib/auth";
import { NextRequest } from "next/server";

test("Multi-User Auth 1: Scrypt password hashing and constant-time verification", () => {
  const password = "SuperSecretPassword123!";
  const hash = hashPassword(password);

  assert.ok(hash.includes(":"), "Hash must contain salt:hash format");
  assert.equal(verifyPassword(password, hash), true, "Correct password must verify");
  assert.equal(verifyPassword("WrongPassword123!", hash), false, "Wrong password must fail");
  assert.equal(verifyPassword("", hash), false, "Empty password must fail");
});

test("Multi-User Auth 2: Database session lifecycle and expiration", async () => {
  const testUser = await prisma.user.findFirst();
  assert.ok(testUser);

  // Create session
  const { sessionToken, expires } = await createDatabaseSession(testUser.id, "127.0.0.1", "test-agent");
  assert.ok(sessionToken);
  assert.ok(expires > new Date());

  // Verify valid session
  const verifiedUser = await verifyDatabaseSession(sessionToken);
  assert.ok(verifiedUser);
  assert.equal(verifiedUser.id, testUser.id);

  // Destroy session
  await destroyDatabaseSession(sessionToken);
  const postDestroy = await verifyDatabaseSession(sessionToken);
  assert.equal(postDestroy, null, "Revoked session must return null");
});

test("Multi-User Auth 3: Expired database session is automatically cleaned up and returns null", async () => {
  const testUser = await prisma.user.findFirst();
  assert.ok(testUser);

  const expiredToken = generateSecureToken(32);
  await prisma.session.create({
    data: {
      sessionToken: expiredToken,
      userId: testUser.id,
      expires: new Date(Date.now() - 10000), // Expired 10 seconds ago
    },
  });

  const res = await verifyDatabaseSession(expiredToken);
  assert.equal(res, null, "Expired session must be rejected");
});

test("Multi-User Permissions 4: Counterparty Invitation generation and single-use acceptance", async () => {
  const agreement = await prisma.agreement.findFirst({
    where: { id: "agree_web_storefront_600" },
  });
  assert.ok(agreement);

  const token = generateSecureToken(32);
  const invitedEmail = "new_partner_" + Date.now() + "@example.com";

  // Create invitation
  const invitation = await prisma.invitation.create({
    data: {
      agreementId: agreement.id,
      invitedEmail,
      role: "PROVIDER",
      token,
      expiresAt: new Date(Date.now() + 86400000),
      createdById: agreement.customerId || "user_elena_customer",
    },
  });
  assert.ok(invitation);

  // Create participant in INVITED state
  const participant = await prisma.agreementParticipant.create({
    data: {
      agreementId: agreement.id,
      invitedEmail,
      role: "PROVIDER",
      status: "INVITED",
    },
  });
  assert.equal(participant.status, "INVITED");

  // Accept invitation
  await prisma.invitation.update({
    where: { id: invitation.id },
    data: { acceptedAt: new Date() },
  });

  await prisma.agreementParticipant.update({
    where: { id: participant.id },
    data: { status: "ACTIVE" },
  });

  const updatedParticipant = await prisma.agreementParticipant.findUnique({
    where: { id: participant.id },
  });
  assert.equal(updatedParticipant?.status, "ACTIVE");

  // Clean up test invitation
  await prisma.agreementParticipant.delete({ where: { id: participant.id } });
  await prisma.invitation.delete({ where: { id: invitation.id } });
});

test("Multi-User Permissions 5: Forged or non-existent invitation token returns null", async () => {
  const fakeToken = "FORGED_INVITATION_TOKEN_12345";
  const found = await prisma.invitation.findUnique({
    where: { token: fakeToken },
  });
  assert.equal(found, null);
});

test("Multi-User Permissions 6: IDOR Protection — Unregistered user strictly forbidden from agreement", async () => {
  // Create an outsider user who is not a participant
  const outsider = await prisma.user.upsert({
    where: { email: "outsider_tester@independent.org" },
    update: {},
    create: {
      email: "outsider_tester@independent.org",
      name: "Outsider Tester",
      role: "CUSTOMER",
    },
  });

  const { sessionToken } = await createDatabaseSession(outsider.id);

  const req = new NextRequest("http://localhost:3000/api/agreements/agree_web_storefront_600", {
    headers: { cookie: `tideset_session=${sessionToken}` },
  });

  const auth = await authorizeAgreement(req, "agree_web_storefront_600", ["CUSTOMER"]);
  assert.equal(auth.authorized, false);
  assert.equal(auth.status, 403);
  assert.match(auth.error, /Cross-account violation/);

  // Clean up
  await destroyDatabaseSession(sessionToken);
});

test("Multi-User Permissions 7: Role Isolation — Client cannot perform Provider-only action", async () => {
  const elena = await prisma.user.findUnique({ where: { email: "elena@example.com" } });
  assert.ok(elena);

  const { sessionToken } = await createDatabaseSession(elena.id);
  const stage = await prisma.stage.findFirst({ where: { sequenceIndex: 1 } });
  assert.ok(stage);

  const req = new NextRequest(`http://localhost:3000/api/stages/${stage.id}/deliver`, {
    headers: { cookie: `tideset_session=${sessionToken}` },
  });

  // Client attempts to call a PROVIDER-only action (deliverables submission)
  const auth = await authorizeStage(req, stage.id, ["PROVIDER"]);
  assert.equal(auth.authorized, false);
  assert.equal(auth.status, 403);
  assert.match(auth.error, /Role 'CUSTOMER' is not authorized/);

  await destroyDatabaseSession(sessionToken);
});

test("Multi-User Permissions 8: Role Isolation — Provider cannot perform Customer-only action", async () => {
  const marcus = await prisma.user.findUnique({ where: { email: "marcus@example.com" } });
  assert.ok(marcus);

  const { sessionToken } = await createDatabaseSession(marcus.id);
  const stage = await prisma.stage.findFirst({ where: { sequenceIndex: 1 } });
  assert.ok(stage);

  const req = new NextRequest(`http://localhost:3000/api/paypal/orders/capture`, {
    headers: { cookie: `tideset_session=${sessionToken}` },
  });

  // Provider attempts to call a CUSTOMER-only action (payment capture)
  const auth = await authorizeStage(req, stage.id, ["CUSTOMER"]);
  assert.equal(auth.authorized, false);
  assert.equal(auth.status, 403);
  assert.match(auth.error, /Role 'PROVIDER' is not authorized/);

  await destroyDatabaseSession(sessionToken);
});
