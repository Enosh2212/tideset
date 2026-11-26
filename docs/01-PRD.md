# TIDESET — AI Agreement Intelligence
## 01 — Product Requirements Document (PRD)

**Version:** 1.0.0  
**Status:** Approved Architecture Draft  
**Target Event:** Build What's Next with PayPal and AI Hackathon 2026  
**Product Tagline:** *Don't just split payments. Make the agreement survivable.*  

---

## 1. Executive Summary & Product Vision

### 1.1 The Core Problem
Modern service agreements and high-trust milestone transactions fail at the intersection of cash flow and milestone delivery. 

- **The Customer Dilemma:** Freelancers, agencies, and contractors frequently demand large upfront deposits (e.g., 50% or \$300 on a \$600 contract) before beginning work. Everyday consumers and early-stage entrepreneurs experience lumpy income (bi-weekly paychecks, gig payouts, client receivables). They cannot afford large lump-sum deposits today, but they can afford predictable smaller disbursements aligned with their verified or planned cash inflows. When forced into rigid deposits, they either abandon projects or default.
- **The Service Provider Dilemma:** Providers cannot work on spec or deliver expensive creative/development effort without financial protection. If a customer defaults halfway through a project, the provider absorbs unrecoverable labor losses. Standard Buy-Now-Pay-Later (BNPL) loans are rigid consumer debt obligations that ignore service delivery milestones, charge merchant fees, and do not protect against delivery dispute risks.
- **The Market Void:** Existing tools either provide static milestone escrow without intelligent scheduling, or offer rigid installment loans disconnected from delivery progress.

### 1.2 The TIDESET Solution
**TIDESET** is an AI Agreement Intelligence platform that bridges the trust and cash-flow gap between customers and service providers. 

TIDESET couples:
1. **An AI Agreement Reasoner:** Ingests unstructured requirements, analyzes declared financial constraints, identifies structural risk points, and drafts mutually acceptable multi-stage agreements.
2. **A Deterministic Financial Constraint Engine:** Enforces mathematical invariants (exact decimal summation, non-negative cash reserves, milestone exposure limits, chronological validity) so generative AI never acts as the authoritative calculator for money.
3. **An Agreement Stress-Test Simulator:** Evaluates counterfactual shocks (income delays, missed payments, scope changes) before either party signs, generating pre-negotiated survivability paths.
4. **Authoritative PayPal Sandbox Integration:** Direct execution and verification through official PayPal Invoicing v2 and Orders v2 APIs, ensuring work stages are unlocked only upon authoritative settlement proof.

---

## 2. Target Personas & Real-World Problem Scenarios

### 2.1 Persona A: The Bootstrapping Client ("Elena")
- **Profile:** 24-year-old creator/founder launching a boutique bakery. Needs a high-converting web storefront costing \$600.
- **Financial Reality:** Has \$210 in liquidity today. Expects a \$250 consulting payout in 14 days and \$200 from bakery pre-orders in 28 days.
- **Pain Point:** Traditional agency asks for \$300 upfront. Elena cannot pay \$300 right now without risking rent, so she stalls the project or uses predatory credit.
- **TIDESET Benefit:** Synthesizes an agreement: \$200 Stage 1 (Discovery & Architecture), \$250 Stage 2 (Design & Core Development), \$150 Stage 3 (Final Deployment). Both Elena's cash reserve remains non-negative and the agency's exposure is capped.

### 2.2 Persona B: The Independent Service Provider ("Marcus")
- **Profile:** Solo full-stack developer and UI designer.
- **Operational Reality:** Has been burned twice by clients who ghosted after receiving 80% of project deliverables with only 25% paid. Refuses to write code without verified funds.
- **Pain Point:** Spending days negotiating payment terms back-and-forth over email; managing manual invoices; tracking which stage is cleared to begin.
- **TIDESET Benefit:** Sets his hard operational guardrails: Maximum uncollateralized labor exposure (\$200), minimum initial stage funding (\$150), and sequential milestone gating. Work stages transition to "Cleared to Begin" only when PayPal verifies settlement.

### 2.3 The Core Scenario: \$600 Web Development Project
```
[Total Contract: $600.00 USD]
- Buyer Liquidity Today: $210.00
- Buyer Expected Inflows: $250.00 on Day 14, $200.00 on Day 28
- Seller Exposure Limit: Max $250 unbilled labor per stage
- Seller Minimum Start Deposit: $180.00

Traditional Approach:
  50% Upfront ($300) -> Fails immediately (Buyer only has $210) -> Deal lost.

TIDESET AI + Constraint Engine Solution:
  Stage 1 (Discovery & Architecture):   $200.00  (Due: Day 0)   -> Buyer Reserve: $10.00   -> Seller Risk: $0
  Stage 2 (Development & Content):      $250.00  (Due: Day 14)  -> Buyer Inflow covers it -> Seller Risk: $0
  Stage 3 (Launch & Asset Handoff):     $150.00  (Due: Day 28)  -> Buyer Final payment   -> Complete
```

---

## 3. Product Positioning & Competitive Differentiation

| Capability | Generic BNPL (Klarna / Affirm) | Traditional Milestone Escrow (Upwork / Escrow.com) | Generic AI Chatbot / Wrapper | TIDESET AI Agreement Intelligence |
| :--- | :--- | :--- | :--- | :--- |
| **Milestone-Coupled Payments** | ❌ No (Blind bi-weekly debit) | ⚠️ Partial (Manual dispute/escrow) | ❌ No | ✅ **Yes — Payment unlocks specific deliverables** |
| **Credit Incurrence** | ❌ Hard/Soft Debt Obligation | ❌ No | ❌ No | ✅ **Zero Debt — Cash-flow synchronization** |
| **Mathematical Correctness Guarantee**| ⚠️ Black-box credit rules | N/A | ❌ Hallucinates math | ✅ **Deterministic constraint engine gates all AI** |
| **Counterfactual Stress Testing** | ❌ None | ❌ None | ⚠️ Unreliable hallucinated advice | ✅ **Interactive mathematical simulation** |
| **Bilateral Versioned Consent** | ❌ Unilateral adhesion contract | ⚠️ Basic contract signing | ❌ None | ✅ **Cryptographic-style versioned mutual acceptance** |
| **Authoritative PayPal Settlement** | ❌ Proprietary rail | ❌ Proprietary lock-in | ❌ None | ✅ **PayPal Invoicing v2 + Orders v2 authoritative verification** |

---

## 4. Scope & Functional Requirements

### 4.1 In Scope (MVP)
1. **Dual-Role Experience:** Seamless toggle or dedicated views for Service Provider and Customer with isolated data scoping.
2. **AI Agreement Intake:** Natural language conversation extracting scope, deliverables, deadlines, payment capabilities, and exposure constraints.
3. **Deterministic Constraint Engine:** Strict validation of monetary conservation ($\sum \text{stages} = \text{total}$), positive buyer liquidity curves, valid calendar dates, and deposit thresholds.
4. **Stress-Test Simulation Sandbox:** Interactive sliders simulating late income (+7d, +14d), cost variations ($\pm 20\%$), delivery delays, and generating mathematically survivable adjustment terms.
5. **Bilateral Mutual Approval Engine:** Stale-approval prevention, version tracking (v1, v2, v3), and mutual signing verification before agreement activation.
6. **Authoritative PayPal Sandbox Integration:**
   - Server-side token generation and client credential isolation.
   - Generation and sending of PayPal Invoices (v2 API).
   - In-app PayPal Smart Buttons (Orders v2 API) for instant stage capture and testing.
   - Authoritative verification: Orders capture verification, invoice status polling, and webhook event processing.
   - Separation of "Payment Verified" from "Work Stage In-Progress" and "Work Stage Delivered".
7. **Agreement Execution Timeline:** Visual audit log tracking invoice generation, settlement verification, work stage authorization, delivery submission, and client acceptance.

### 4.2 Out of Scope (Future Roadmap)
- Automatic bank account direct debiting without buyer action (prohibited for safety).
- Custodial money transmission or unregulated pseudo-escrow.
- Cross-border multi-currency FX hedge contracts.
- Automated legal arbitration or small claims court filings.

---

## 5. Non-Functional Requirements

### 5.1 Financial Correctness & Arithmetic Precision
- All monetary fields stored in minor currency units (cents as integers) or evaluated using exact decimal arithmetic (`Decimal.js` / integer cents). Floating-point round-off errors are strictly prohibited.
- Total contract value must equal the sum of stage amounts down to the exact cent:
  $$\sum_{i=1}^{n} \text{StageAmount}_i \equiv \text{ContractTotal}$$

### 5.2 Security & Credential Protection
- Zero client-side leakage of PayPal Client Secret or AI API credentials.
- All PayPal API interactions must occur exclusively in server-side Next.js route handlers.
- Input sanitization on all natural-language prompts to prevent prompt injection or constraint override attacks.
- Role-based authorization verifying that the calling user is the legitimate customer or merchant for that specific agreement ID before returning or modifying state.

### 5.3 Performance & Responsiveness
- Constraint evaluation executed in under 15ms.
- AI agreement synthesis and structuring completed in under 3.5 seconds with visual streaming/skeleton indicators.
- Responsive layout supporting viewports from 375px (mobile) to 2560px (ultra-wide desktop) with full touch, mouse, and keyboard compliance.

### 5.4 Accessibility (WCAG 2.2 AA)
- Minimum color contrast ratio of 4.5:1 for standard text and 3:1 for large text / interactive UI controls against liquid glass translucent surfaces.
- Accessible ARIA announcements for stage status changes and payment transitions.
- Full keyboard focusability with visible focus rings (`ring-2 ring-primary`).

---

## 6. AI Responsibilities vs. Deterministic Logic

| Responsibility | AI Engine (Gemini / LLM) | Deterministic Constraint Engine |
| :--- | :---: | :---: |
| Extracting unstructured user intent and milestone descriptions | ✅ | ❌ |
| Formulating creative milestone division strategies | ✅ | ❌ |
| Translating business terminology into plain English | ✅ | ❌ |
| Explaining trade-offs and financial risks to non-experts | ✅ | ❌ |
| Verifying that Stage Amounts sum to the Total Price | ❌ **PROHIBITED** | ✅ **MANDATORY** |
| Verifying that Buyer Cash Reserve stays $\ge 0$ | ❌ **PROHIBITED** | ✅ **MANDATORY** |
| Validating that Stage Due Date $\le$ Delivery Date | ❌ **PROHIBITED** | ✅ **MANDATORY** |
| Checking PayPal Settlement Webhook Signature | ❌ **PROHIBITED** | ✅ **MANDATORY** |
| Authorizing Work Stage State Transitions | ❌ **PROHIBITED** | ✅ **MANDATORY** |

---

## 7. PayPal Sandbox Integration Requirements

1. **Authentication:** Server-side OAuth2 client credentials grant via `https://api-m.sandbox.paypal.com/v1/oauth2/token`. Cached in-memory with automatic renewal on expiration.
2. **Invoicing v2 API:**
   - Draft creation: `POST /v2/invoicing/invoices`
   - Invoice dispatch: `POST /v2/invoicing/invoices/{invoice_id}/send`
   - Fetching invoice: `GET /v2/invoicing/invoices/{invoice_id}`
3. **Orders v2 API (Direct Stage Capture):**
   - Order creation: `POST /v2/checkout/orders` with intent `CAPTURE`
   - Order capture: `POST /v2/checkout/orders/{id}/capture`
4. **Authoritative Evidence Requirement:**
   - A stage status will NEVER transition to `PAYMENT_VERIFIED` on UI request or offline record.
   - Transition occurs ONLY when `order.status === 'COMPLETED'` or `invoice.status === 'PAID'` validated server-side against PayPal.

---

## 8. Hackathon Judging Criteria Alignment

- **Innovation & Originality:** TIDESET pioneers "Survivable Agreements" by combining cash-flow synchronization with milestone delivery, introducing counterfactual stress-testing to fintech contracts.
- **PayPal Integration Quality:** Dual integration of PayPal Invoicing v2 and Orders v2 Sandbox APIs with real webhooks, idempotent reconciliation, and zero mock settlement.
- **AI Sophistication:** Structured output extraction, multi-party trade-off reasoning, and natural language explanation tightly decoupled from a zero-tolerance deterministic financial solver.
- **Design & User Experience:** Bespoke Apple-inspired Liquid Glass aesthetic, translucent physical depth, micro-interactions, complete absence of dead-end buttons, and radical non-technical clarity.
- **Technical Rigor & Completeness:** Full-stack TypeScript architecture, comprehensive test suite, atomic versioning, and zero floating-point math errors.

---

## 9. Success Metrics & Testable Outcomes
- **100% Mathematical Conservation:** Zero rounding drift across any stage calculation.
- **Zero Hallucinated Approvals:** Agreement activation impossible without matching version signatures from both buyer and seller.
- **100% Verified PayPal Settlement:** Every stage activation backed by a genuine PayPal Sandbox Transaction ID / Capture ID.
- **Sub-3 Minute Judge Onboarding:** Out-of-the-box demo mode allowing judges to experience the entire lifecycle in under 180 seconds.
