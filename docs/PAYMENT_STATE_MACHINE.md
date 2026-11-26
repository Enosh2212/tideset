# TIDESET — Payment & Milestone State Machine Specification

**Domain:** Fintech Settlement Orchestration & Milestone Governance  
**Gateway:** PayPal REST APIs v2 (Orders v2, Invoicing v2, Webhooks v1)  
**Monetary Representation:** Integer Minor Units (Cents). Zero Floating-Point Rounding.

---

## 1. Dual Independent State Tracking

TIDESET decouples **Payment Status** from **Delivery Status** to maintain an accurate financial ledger while tracking physical/digital deliverable progress.

```
Stage Lifecycle:
┌────────────────────────────────────────────────────────┐
│ Payment Status:                                        │
│   UNPAID ──> CHECKOUT_CREATED ──> APPROVED ──> PAID    │
└───────────────────────────┬────────────────────────────┘
                            │ (Only after PAID)
┌───────────────────────────▼────────────────────────────┐
│ Delivery Status:                                       │
│   NOT_STARTED ──> IN_PROGRESS ──> SUBMITTED ──>        │
│                   ACCEPTED (or REVISION_REQUESTED)     │
└────────────────────────────────────────────────────────┘
```

---

## 2. Finite State Machine Transitions

### 2.1 Agreement Status (`Agreement.status`)

| Current State | Transition Event | Next State | Permitted Actors / Triggers |
|---|---|---|---|
| `DRAFT` | Terms created with initial version | `DRAFT` | Creator |
| `DRAFT` | Counterparty invited and terms proposed | `PROPOSED` | Creator |
| `PROPOSED` | Both Client and Provider approve version | `ACTIVE` | Bilateral Signatures |
| `ACTIVE` | Stage 1 authorized and paid | `ACTIVE` | Client via PayPal |
| `ACTIVE` | Unreconciled dispute raised | `DISPUTED` | Client or Provider |
| `DISPUTED` | Disagreement resolved mutually | `ACTIVE` | Mutual Resolution |
| `ACTIVE` | Final milestone accepted | `COMPLETED` | Client Acceptance |
| `ACTIVE` | Mutual cancellation agreed | `CANCELLED` | Bilateral Agreement |

### 2.2 Stage Financial Status (`Stage.paymentStatus` / `Stage.status`)

| Current Status | Event / Trigger | Target Status | Validation Invariants |
|---|---|---|---|
| `LOCKED` | Preceding stage deliverables accepted | `PAYMENT_PENDING` | Preceding stage must be `ACCEPTED` |
| `PAYMENT_PENDING` | Client clicks "Pay with PayPal" | `CHECKOUT_CREATED` | Order created on PayPal server; `paypalOrderId` stored |
| `CHECKOUT_CREATED` | Buyer approves in PayPal window | `APPROVED` | Authoritative check on PayPal returns `status: "APPROVED"` |
| `APPROVED` | Server executes `/orders/:id/capture` | `PAYMENT_VERIFIED` (`PAID`) | Exact monetary match, capture status `COMPLETED`, unique `paypalCaptureId` |
| `PAYMENT_VERIFIED` | Provider starts work | `IN_PROGRESS` | Payment record must exist in database |
| `IN_PROGRESS` | Provider submits deliverables with evidence | `SUBMITTED` | Review deadline calculated (+5 days) |
| `SUBMITTED` | Client requests adjustments | `REVISION_REQUESTED` | Structured notes recorded, round added to revision history |
| `REVISION_REQUESTED` | Provider resubmits corrected work | `SUBMITTED` | Revision history updated |
| `SUBMITTED` | Client accepts deliverables | `ACCEPTED` | Next sequential stage transitions to `PAYMENT_PENDING` |

---

## 3. Financial Invariants & Incorruptibility Rules

1. **Exact Minor Unit Representation:**  
   All monetary amounts are strictly handled as integer cents (`amountCents`). E.g., $\$200.00 \rightarrow 20,000$.
2. **Conservation of Money Invariant:**  
   $$\sum_{i=1}^n \text{stage}_i.\text{amountCents} \equiv \text{agreement}.\text{totalAmountCents}$$
3. **Capture Pre-Condition:**  
   A capture request is never initiated based solely on client-side redirect query strings. The server queries PayPal directly to confirm `APPROVED` status before triggering capture.
4. **Single Active Collection Path:**  
   A stage cannot have both an active Checkout Order and an active PayPal Invoice. If an invoice is issued, Checkout is locked to prevent double billing. If an invoice is cancelled, Checkout becomes available.
5. **Idempotency on Capture:**  
   `PaymentRecord.paypalCaptureId` has a unique database constraint. Concurrent duplicate capture attempts throw unique constraint errors, preventing double crediting.
6. **Webhook Reconciliation:**  
   Incoming `PAYMENT.CAPTURE.COMPLETED` webhooks verify signature and reconcile against existing records. If already captured via direct API, the event is marked `ALREADY_PROCESSED` without mutation.
