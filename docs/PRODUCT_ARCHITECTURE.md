# TIDESET — Complete Product Architecture

**Project:** TIDESET — AI Agreement Intelligence & Milestone Settlements  
**Hackathon:** Build What's Next with PayPal & AI Hackathon 2026  
**Stack:** Next.js 15.1.7 (App Router), React 19, TypeScript 5.7, Tailwind CSS 3.4, Prisma ORM 6.3, SQLite/PostgreSQL, OpenRouter Free AI API, PayPal REST APIs v2 (Orders v2, Invoicing v2, Webhooks v1).

---

## 1. System Architecture Overview

TIDESET solves contract and payment uncertainty in professional service delivery by pairing generative artificial intelligence with mathematical constraints and authoritative PayPal Sandbox execution.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TIDESET CLIENT LAYER                            │
│  Public Marketing:  /  |  /how-it-works  |  /security  |  /login       │
│  User Workspace:    /dashboard  |  /agreements  |  /agreements/new     │
│  Agreement Hub:     /agreements/:id  |  payments  |  deliverables      │
│  Sample Walkthrough: /demo (Isolated sandbox environment)               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS (Encrypted Cookies & Session)
┌───────────────────────────────────▼────────────────────────────────────┐
│                       NEXT.JS APP ROUTER CORE                          │
│                                                                        │
│  [Middleware & Security Guard]                                         │
│  - CSP, HSTS, X-Frame-Options, CSRF, Route Authentication              │
│  - Sliding Window Rate Limiting (lib/security.ts)                      │
│                                                                        │
│  [API Endpoints]                                                       │
│  - /api/auth/*       (register, login, logout, google, me, demo-switch)│
│  - /api/agreements/* (list, create, detail, solve, simulate, approve)  │
│  - /api/stages/*     (deliver, accept, revision, dispute, pause)       │
│  - /api/invitations/*(create, validate, accept single-use token)       │
│  - /api/paypal/*     (orders create/capture, invoices, webhooks)       │
└───────────────────┬───────────────────────────────┬────────────────────┘
                    │                               │
        ┌───────────▼──────────┐         ┌──────────▼──────────┐
        │  AI & SOLVER ENGINE  │         │ PAYPAL SANDBOX V2   │
        │ - OpenRouter API     │         │ - Orders v2 API     │
        │ - Zod Schema Guard   │         │ - Invoicing v2 API  │
        │ - Deterministic      │         │ - Webhooks (HMAC)   │
        │   Linear Invariants  │         │ - Capture & Refund  │
        └───────────┬──────────┘         └──────────┬──────────┘
                    │                               │
┌───────────────────▼───────────────────────────────▼────────────────────┐
│                         PRISMA DATABASE LAYER                          │
│  Models: User, Account, Session, Agreement, AgreementParticipant,      │
│          Invitation, AgreementVersion, Stage, PaymentRecord,           │
│          PaymentAttempt, Deliverable, DeliverableReview,               │
│          AgreementDecision, DisputeRecord, WebhookEvent, AuditEvent    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Structure

```
tideset/
├── app/
│   ├── (public pages)
│   │   ├── page.tsx                    # Landing page (7-step narrative)
│   │   ├── how-it-works/page.tsx       # Comprehensive journey breakdown
│   │   ├── security/page.tsx           # Security, non-escrow disclosures
│   │   ├── login/page.tsx              # User authentication & demo fills
│   │   ├── signup/page.tsx             # Registration & first-time onboarding
│   │   └── invite/[token]/page.tsx     # Single-use counterparty invitation
│   ├── (authenticated workspace)
│   │   ├── dashboard/page.tsx          # Workspace overview & metric cards
│   │   ├── agreements/
│   │   │   ├── page.tsx                # Filterable agreements catalog
│   │   │   ├── new/page.tsx            # AI builder & agreement creator
│   │   │   └── [id]/
│   │   │       ├── page.tsx            # Agreement overview & stages
│   │   │       ├── payments/page.tsx   # Detailed PayPal settlement ledger
│   │   │       └── deliverables/page.tsx # Work submission & 5-day review
│   │   ├── settings/page.tsx           # Profile, sessions, gateway health
│   │   └── demo/page.tsx               # Isolated interactive sample sandbox
│   ├── api/                            # 28 REST API endpoints
│   ├── globals.css                     # Light theme design tokens
│   └── layout.tsx                      # Root layout
├── components/
│   ├── PublicNavbar.tsx                # Marketing navigation
│   ├── AppNavbar.tsx                   # Authenticated workspace navigation
│   ├── Navbar.tsx                      # Interactive demo navbar
│   ├── CustomerDashboard.tsx           # Customer decision hero & pipeline
│   ├── ProviderDashboard.tsx           # Provider delivery & invoice hub
│   ├── PayPalCheckoutModal.tsx         # Authoritative checkout modal
│   ├── StressSimulatorModal.tsx        # Counterfactual financial shock simulator
│   └── AgreementBuilderModal.tsx       # AI requirement intake modal
├── lib/
│   ├── ai.ts                           # OpenRouter API client & schema validator
│   ├── auth.ts                         # Server-side authentication & IDOR authorization
│   ├── db.ts                           # Prisma database singleton
│   ├── paypal.ts                       # Authoritative PayPal REST API v2 orchestrator
│   ├── security.ts                     # Scrypt hashing, rate limiting, tokens
│   ├── session.ts                      # Database session management & token verification
│   └── solver.ts                       # Deterministic financial constraint engine
├── middleware.ts                       # Next.js route protection & security headers
├── prisma/
│   ├── schema.prisma                   # Normalized relational database schema
│   └── dev.db                          # SQLite local database
├── tests/
│   ├── e2e.spec.ts                     # 5 Playwright E2E browser tests
│   ├── financial_invariants.test.ts    # Mathematical constraint tests
│   ├── multi_user_auth_and_invitations.test.ts # Auth, sessions & invitation tests
│   ├── negative_security_and_payments.test.ts # Replay, forgery, and IDOR tests
│   ├── openrouter_ai_and_paypal_modes.test.ts # AI & PayPal mode tests
│   └── security_and_disputes.test.ts   # Dispute governance tests
└── docs/                               # Complete architecture documentation
```

---

## 3. Core Subsystems

### 3.1. AI Agreement Builder & Deterministic Solver
- **AI Model:** OpenRouter API (`openrouter/free` or configured free tier model).
- **Gatekeeper Pattern:** Output from the LLM is parsed, cleaned from markdown wrappers, and strictly validated against `ProposalOutputSchema` using Zod.
- **Deterministic Validation:** The plan is evaluated by `FinancialConstraintEngine.validateSchedule()`. If any financial rule fails (sum $\neq$ total, buffer $< 0$, exposure $>$ ceiling), the application triggers fallback adjustment rather than committing unverified numbers.

### 3.2. Authoritative PayPal Sandbox Orchestrator
- **Official Endpoints:** Direct HTTPS integration with PayPal Orders v2 (`/v2/checkout/orders`), Invoicing v2 (`/v2/invoicing/invoices`), and Webhooks v1 (`/v1/notifications/verify-webhook-signature`).
- **No Client Spoofing:** Capture execution is performed strictly server-side upon receiving buyer authorization. The capture response is checked for `status === "COMPLETED"`, currency matching, and exact integer cents matching.
- **Idempotency:** Unique constraints on `PaymentRecord.paypalCaptureId` guarantee that network retries or duplicate webhook events cannot credit a stage twice.

### 3.3. Multi-User Ownership & Single-Use Invitations
- Agreements maintain a normalized `AgreementParticipant` relationship where a user is identified as either `CUSTOMER` or `PROVIDER`.
- Counterparties are invited via cryptographically secure single-use tokens (`Invitation` model) with 7-day expiration dates.
- Upon acceptance, the user account is bound to the agreement, unlocking role-specific capabilities.
