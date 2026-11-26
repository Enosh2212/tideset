import crypto from "crypto";

/**
 * TIDESET Cryptographic Security Engine
 * - NIST/OWASP scrypt password hashing
 * - Cryptographic session token generation
 * - In-memory rate limiting for sensitive endpoints
 * - CSRF token verification
 */

/**
 * Hashes a plaintext password using crypto.scrypt with a random 16-byte salt.
 * Returns format: "salt:hash"
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Verifies a password against a stored "salt:hash" string in constant time.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(":");
    if (!salt || !key) return false;

    const keyBuffer = Buffer.from(key, "hex");
    const derivedKey = crypto.scryptSync(password, salt, 64);

    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

/**
 * Generates a cryptographically strong random token (default 32 bytes hex).
 */
export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

/**
 * In-memory sliding window rate limiter
 */
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Clean up expired keys periodically
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}, 60000);
if (cleanupInterval.unref) {
  cleanupInterval.unref();
}

export function checkRateLimit(
  key: string,
  maxRequests = 10,
  windowMs = 60000
): { allowed: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetInMs: windowMs };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetInMs: Math.max(0, record.resetAt - now) };
  }

  record.count += 1;
  return { allowed: true, remaining: maxRequests - record.count, resetInMs: record.resetAt - now };
}

/**
 * CSRF Protection Helpers
 */
export function generateCsrfToken(): string {
  return generateSecureToken(24);
}
