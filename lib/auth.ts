import { NextRequest } from "next/server";
import { prisma } from "./db";
import { verifySessionToken, verifyDatabaseSession, SessionPayload } from "./session";

export interface AuthContext {
  user: {
    id: string;
    email: string;
    name: string;
    role: "CUSTOMER" | "PROVIDER";
  };
  agreement?: any;
  stage?: any;
  participantRole?: "CUSTOMER" | "PROVIDER";
}

export type AuthResult =
  | { authorized: true; context: AuthContext }
  | { authorized: false; status: number; error: string };

/**
 * Resolves the authenticated user via verified database session or signed token.
 * Raw client-controlled identity headers are strictly rejected.
 */
export async function getAuthenticatedUser(req: NextRequest) {
  let token: string | undefined;

  // 1. Check HTTP-only session cookie
  const cookie = req.cookies.get("tideset_session");
  if (cookie?.value) {
    token = cookie.value;
  }

  // 2. Check Bearer authorization header with signed token
  if (!token) {
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    }
  }

  if (!token) {
    return null;
  }

  // 3. Try database-backed session first
  const dbUser = await verifyDatabaseSession(token);
  if (dbUser) {
    return dbUser;
  }

  // 4. Fallback to cryptographically signed HMAC token (for test suite compatibility)
  const session: SessionPayload | null = verifySessionToken(token);
  if (!session) {
    return null;
  }

  // Fetch user from DB to confirm account still exists
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  return user;
}

/**
 * Enforces role-based authorization and cross-account data isolation on an agreement.
 * Checks AgreementParticipant records first, with fallback to legacy agreement fields.
 */
export async function authorizeAgreement(
  req: NextRequest,
  agreementId: string,
  allowedRoles: ("CUSTOMER" | "PROVIDER")[]
): Promise<AuthResult> {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return {
      authorized: false,
      status: 401,
      error: "Authentication required: Missing or invalid server-verified session.",
    };
  }

  const agreement = await prisma.agreement.findUnique({
    where: { id: agreementId },
    include: {
      provider: true,
      customer: true,
      participants: true,
    },
  });

  if (!agreement) {
    return {
      authorized: false,
      status: 404,
      error: "Agreement not found.",
    };
  }

  // Determine user's effective role on THIS agreement
  let userAgreementRole: "CUSTOMER" | "PROVIDER" | null = null;

  // Check explicit AgreementParticipant table
  const participant = agreement.participants.find(
    (p) => p.userId === user.id || p.invitedEmail.toLowerCase() === user.email.toLowerCase()
  );

  if (participant && (participant.role === "CUSTOMER" || participant.role === "PROVIDER")) {
    userAgreementRole = participant.role as "CUSTOMER" | "PROVIDER";
  } else if (agreement.customerId === user.id) {
    userAgreementRole = "CUSTOMER";
  } else if (agreement.providerId === user.id) {
    userAgreementRole = "PROVIDER";
  } else if (user.role === "CUSTOMER" && agreement.customerId === user.id) {
    userAgreementRole = "CUSTOMER";
  } else if (user.role === "PROVIDER" && agreement.providerId === user.id) {
    userAgreementRole = "PROVIDER";
  }

  // If user is not associated with this agreement at all: IDOR/BOLA Protection!
  if (!userAgreementRole) {
    return {
      authorized: false,
      status: 403,
      error: "Access denied: Cross-account violation. You are not a registered participant on this agreement.",
    };
  }

  // Check if user's role on this agreement is in allowedRoles
  if (!allowedRoles.includes(userAgreementRole)) {
    return {
      authorized: false,
      status: 403,
      error: `Access denied: Role '${userAgreementRole}' is not authorized for this action. Required: ${allowedRoles.join(
        ", "
      )}`,
    };
  }

  return {
    authorized: true,
    context: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: userAgreementRole, // Effective role on this agreement
      },
      agreement,
      participantRole: userAgreementRole,
    },
  };
}

/**
 * Enforces role-based authorization on a stage action.
 */
export async function authorizeStage(
  req: NextRequest,
  stageId: string,
  allowedRoles: ("CUSTOMER" | "PROVIDER")[]
): Promise<AuthResult> {
  const stage = await prisma.stage.findUnique({
    where: { id: stageId },
    include: {
      version: {
        include: {
          agreement: {
            include: { provider: true, customer: true, participants: true },
          },
        },
      },
    },
  });

  if (!stage) {
    return {
      authorized: false,
      status: 404,
      error: "Stage not found.",
    };
  }

  const agreementAuth = await authorizeAgreement(
    req,
    stage.version.agreement.id,
    allowedRoles
  );

  if (!agreementAuth.authorized) {
    return agreementAuth;
  }

  return {
    authorized: true,
    context: {
      user: agreementAuth.context.user,
      agreement: agreementAuth.context.agreement,
      stage,
      participantRole: agreementAuth.context.participantRole,
    },
  };
}
