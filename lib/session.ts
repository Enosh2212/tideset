import crypto from "crypto";
import { prisma } from "./db";
import { generateSecureToken } from "./security";

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set in production.");
  }
  return "tideset-local-development-only";
}

export interface SessionPayload {
  userId: string;
  role: "CUSTOMER" | "PROVIDER";
  email: string;
  issuedAt: number;
  expiresAt: number;
}

/**
 * Creates an HMAC-SHA256 signature for a session string.
 */
function signPayload(data: string): string {
  return crypto.createHmac("sha256", getSessionSecret()).update(data).digest("hex");
}

/**
 * Encodes and signs a session payload into a secure token string.
 */
export function createSessionToken(payload: Omit<SessionPayload, "issuedAt" | "expiresAt">): string {
  const now = Date.now();
  const fullPayload: SessionPayload = {
    ...payload,
    issuedAt: now,
    expiresAt: now + 7 * 24 * 60 * 60 * 1000, // 7 days validity
  };

  const jsonStr = JSON.stringify(fullPayload);
  const base64Data = Buffer.from(jsonStr).toString("base64url");
  const signature = signPayload(base64Data);

  return `${base64Data}.${signature}`;
}

/**
 * Verifies and decodes a signed HMAC session token. Returns null if forged, tampered, or expired.
 */
export function verifySessionToken(token: string): SessionPayload | null {
  if (!token || !token.includes(".")) return null;

  const [base64Data, signature] = token.split(".");
  if (!base64Data || !signature) return null;

  // Constant-time signature comparison to prevent timing attacks
  const expectedSig = signPayload(base64Data);
  try {
    const sigBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedSig, "hex");
    if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
      return null;
    }
  } catch {
    return null;
  }

  try {
    const jsonStr = Buffer.from(base64Data, "base64url").toString("utf-8");
    const payload: SessionPayload = JSON.parse(jsonStr);

    if (Date.now() > payload.expiresAt) {
      return null; // Expired session
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Creates a database-backed session for a user.
 */
export async function createDatabaseSession(
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ sessionToken: string; expires: Date }> {
  const sessionToken = generateSecureToken(32);
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await prisma.session.create({
    data: {
      sessionToken,
      userId,
      expires,
      ipAddress,
      userAgent,
    },
  });

  return { sessionToken, expires };
}

/**
 * Verifies a database-backed session token. Returns User or null.
 */
export async function verifyDatabaseSession(sessionToken: string) {
  if (!sessionToken || sessionToken.length < 20) return null;

  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: { user: true },
  });

  if (!session) return null;

  if (session.expires < new Date()) {
    // Delete expired session
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  return session.user;
}

/**
 * Revokes / deletes a database session.
 */
export async function destroyDatabaseSession(sessionToken: string) {
  try {
    await prisma.session.delete({ where: { sessionToken } });
  } catch {
    // Ignore if already deleted
  }
}
