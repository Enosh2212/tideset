# TIDESET — Authentication, Authorization & Permissions Architecture

**Audience:** Security Engineers, Full-Stack Developers, Code Auditors  
**Standard Reference:** OWASP Application Security Verification Standard (ASVS 5.0) Level 2

---

## 1. Authentication Architecture

TIDESET implements a defense-in-depth authentication system combining **database-backed sessions**, **cryptographic scrypt password hashing**, **OAuth2 integration**, and **strict HTTP-only cookie security**.

### 1.1 Password Storage & Cryptography
- **Algorithm:** NIST-approved `crypto.scrypt` with a cryptographically random 16-byte salt generated via `crypto.randomBytes(16)`.
- **Derived Key Length:** 64 bytes.
- **Storage Format:** `salt:derivedKeyHex` in `User.passwordHash`.
- **Verification:** Constant-time comparison using `crypto.timingSafeEqual` to eliminate timing side-channel attacks.

### 1.2 Session Management
- **Model:** `Session` (id, sessionToken, userId, expires, ipAddress, userAgent, createdAt).
- **Token Generation:** 32-byte cryptographically random hex token generated via `crypto.randomBytes(32)`.
- **Cookie Attributes:**
  - `HttpOnly`: True (prevents XSS access to tokens).
  - `Secure`: True in production (enforced via HTTPS).
  - `SameSite`: `Lax` (protects against Cross-Site Request Forgery while allowing standard top-level navigation).
  - `Path`: `/`.
  - `Max-Age`: 7 days.
- **Session Revocation:** `/api/auth/logout` explicitly deletes the database session record and expires the cookie. The Settings page provides "Sign Out Everywhere" functionality to invalidate all active sessions for a user.

### 1.3 Google OAuth2 Flow
- **Initiation:** `/api/auth/google` generates an unguessable 16-byte `state` token stored in a short-lived (10 min) cookie, redirecting to `https://accounts.google.com/o/oauth2/v2/auth`.
- **Callback Verification:** `/api/auth/google/callback` validates the returned `state` parameter against the cookie to prevent OAuth login CSRF attacks.
- **Account Linking:** Matches the verified email from Google against existing user records or creates a new user, linking the credentials in the `Account` table.

---

## 2. Agreement-Level Multi-User Permissions Matrix

Rather than a simplistic global user role, permissions in TIDESET are evaluated **per agreement** based on the user's registered role in `AgreementParticipant`. A single person can act as a **Client (Customer)** on Agreement A and as a **Service Provider** on Agreement B.

### 2.1 Role Capabilities Matrix

| Action | Customer / Client | Service Provider | Uninvited User |
|---|:---:|:---:|:---:|
| **View Agreement & Stages** | Allowed | Allowed | **DENIED (403)** |
| **Approve Proposed Version** | Allowed (as Customer) | Allowed (as Provider) | **DENIED (403)** |
| **Initiate PayPal Order (Pay)** | **Allowed** | **DENIED (403)** | **DENIED (403)** |
| **Capture PayPal Order** | **Allowed** | **DENIED (403)** | **DENIED (403)** |
| **Issue PayPal Invoice** | **DENIED (403)** | **Allowed** | **DENIED (403)** |
| **Submit Work Deliverables** | **DENIED (403)** | **Allowed** | **DENIED (403)** |
| **Accept Deliverables** | **Allowed** | **DENIED (403)** | **DENIED (403)** |
| **Request Structured Revisions** | **Allowed** | **DENIED (403)** | **DENIED (403)** |
| **Pause / Resume Stage** | **DENIED (403)** | **Allowed** | **DENIED (403)** |
| **Open Internal Disagreement** | Allowed | Allowed | **DENIED (403)** |
| **Invite Counterparty** | Allowed | Allowed | **DENIED (403)** |

---

## 3. IDOR / BOLA Prevention Architecture

Every mutating and data-access API endpoint enforces server-side authorization through `authorizeAgreement()` or `authorizeStage()` in `lib/auth.ts`:

```typescript
// 1. Resolve authenticated user from verified database session
const user = await getAuthenticatedUser(req);
if (!user) return { authorized: false, status: 401, error: "Authentication required." };

// 2. Fetch agreement with participants
const agreement = await prisma.agreement.findUnique({
  where: { id: agreementId },
  include: { participants: true },
});

// 3. Resolve user's specific role on THIS agreement
const participant = agreement.participants.find(p => p.userId === user.id);
if (!participant) {
  // Reject outsider trying to access another user's agreement ID
  return { authorized: false, status: 403, error: "Access denied: Cross-account violation." };
}

// 4. Enforce required action role
if (!allowedRoles.includes(participant.role)) {
  return { authorized: false, status: 403, error: `Role '${participant.role}' is not authorized.` };
}
```

UI hiding is never relied upon as a security control. Every attempt to tamper with IDs via curl, Postman, or script execution is caught and denied at the API layer.

---

## 4. Counterparty Invitation Security

- **Cryptographic Token:** 32-byte hex string (`crypto.randomBytes(32)`).
- **Single-Use Constraint:** Upon acceptance, `Invitation.acceptedAt` is recorded in a database transaction, and the token cannot be reused.
- **Expiration:** Invitations expire automatically after 7 days (`expiresAt < new Date()`).
- **Participant Transition:** The counterparty's record in `AgreementParticipant` transitions from `INVITED` to `ACTIVE` upon authenticated acceptance.
