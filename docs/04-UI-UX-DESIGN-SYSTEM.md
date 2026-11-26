# TIDESET — AI Agreement Intelligence
## 04 — UI/UX Design System: Liquid Glass Financial Experience

**Version:** 1.0.0  
**Design Philosophy:** Apple Liquid Glass Aesthetics meets High-Integrity Fintech  
**Status:** Approved Architecture Draft  

---

## 1. Design Vision & Brand Identity

TIDESET rejects the sterile, clinical grey grids of legacy banking and the toy-like neon gradients of crypto wrappers. 

Instead, TIDESET embodies **"Liquid Glass"**:
- **Tactile Depth:** Translucent planes floating over deep optical gradients.
- **Specular Highlights:** Subtle 1px translucent borders (`rgba(255, 255, 255, 0.12)`) that catch light like precision chamfered sapphire crystal.
- **Controlled Refraction:** Subtle backdrop blur (`backdrop-blur-md` to `backdrop-blur-xl`) providing separation without degrading legibility.
- **Human-Centric Typography:** High-contrast sans-serif pairing with generous tracking and mathematical tabular figures for financial numbers.
- **Radical Plain-English Clarity:** Zero obfuscating financial acronyms; every state communicates exactly what is happening and what action to take next.

---

## 2. Color Palette & Semantic Tokens

### 2.1 Core Palette Tokens
| Token Name | Hex Code | HSL Equivalent | Role & Application |
| :--- | :--- | :--- | :--- |
| `midnight-950` | `#0B1220` | `219, 49%, 8%` | Primary background canvas (Dark Theme foundation) |
| `midnight-900` | `#0F172A` | `222, 47%, 11%`| Secondary container background |
| `slate-500` | `#64748B` | `215, 16%, 47%`| Secondary labels, helper text, and subtle icons |
| `ice-blue-100` | `#DCEAF7` | `208, 64%, 91%`| High-contrast subtle accents, pill tags, hover fills |
| `periwinkle-400`| `#7C8FCB`| `225, 43%, 64%`| Primary brand highlights, active stepper links, charts |
| `teal-500` | `#26A69A` | `174, 63%, 40%`| Success states, verified payments, approved milestones |
| `amber-500` | `#F59E0B` | `38, 92%, 50%` | Warning states, counter-proposals, stress alerts |
| `rose-500` | `#F43F5E` | `350, 89%, 60%`| Payment failed, mathematically unfeasible alerts |
| `off-white-50` | `#F8FAFC` | `210, 40%, 98%`| Primary text in dark mode / Background canvas in light mode |

### 2.2 Liquid Glass Material Tokens
```css
/* Glass Card Primary */
.glass-panel {
  background: rgba(15, 23, 42, 0.72);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.36), inset 0 1px 0 0 rgba(255, 255, 255, 0.12);
}

/* Glass Card Interactive (Elevated on Hover) */
.glass-panel-interactive {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.glass-panel-interactive:hover {
  background: rgba(30, 41, 59, 0.82);
  border-color: rgba(220, 234, 247, 0.24);
  transform: translateY(-2px);
  box-shadow: 0 16px 40px -8px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.2);
}

/* Glass Pill / Badge */
.glass-pill {
  background: rgba(124, 143, 203, 0.12);
  border: 1px solid rgba(124, 143, 203, 0.28);
  backdrop-filter: blur(8px);
}
```

---

## 3. Typography & Hierarchy

- **Font Family:** `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, sans-serif.
- **Monetary Figures:** `font-mono tracking-tight font-semibold` using tabular figures (`tabular-nums`) to prevent jittering during animated transitions.

| Style Name | Size / Line-Height | Weight | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- |
| `Display Title` | 36px / 44px | Bold (700) | -0.025em | Main dashboard headers, hero value prop |
| `Section Header` | 24px / 32px | SemiBold (600) | -0.015em | Milestone title, agreement overview |
| `Card Title` | 18px / 26px | SemiBold (600) | -0.01em | Stage card, simulator summary |
| `Body Large` | 16px / 24px | Regular (400) | 0.00em | Financial explanations, solver insights |
| `Body Regular` | 14px / 20px | Regular (400) | 0.00em | Form inputs, status metadata, tables |
| `Microcopy / Tag`| 12px / 16px | Medium (500) | +0.02em | Currency codes, badges, dates |

---

## 4. Navigation & Layout Architecture

### 4.1 Shell Navigation
A responsive, floating glass header and role-context switcher:
- **Left:** TIDESET Brand Mark (Cyan/Periwinkle wave logo) + Version indicator (`v1.0 Hackathon Release`).
- **Center:** Navigation Tabs:
  - `Overview`
  - `Agreements`
  - `Payments`
  - `Stress Simulator`
  - `Audit Timeline`
- **Right:**
  - **Judge / Demo Persona Switcher:** Instant 1-click toggle between `Elena (Customer)` and `Marcus (Provider)`.
  - **Live PayPal Sandbox Indicator:** Green pulsing dot indicating Sandbox REST connection active.

### 4.2 Customer Dashboard Information Architecture
```
+------------------------------------------------------------------------------------+
|  [TIDESET Logo]     Overview   Agreements   Payments   Simulator   [Elena (Customer)]  |
+------------------------------------------------------------------------------------+
|                                                                                    |
|  +------------------------------------------------------------------------------+  |
|  |  NEXT ACTION HERO CARD                                                       |  |
|  |  "Stage 1 Ready for Settlement: $200.00 to unlock Discovery & Architecture"  |  |
|  |  [Pay with PayPal Sandbox Button]       [Review Scope Details]               |  |
|  +------------------------------------------------------------------------------+  |
|                                                                                    |
|  +-------------------------------------+  +-------------------------------------+  |
|  |  AGREEMENT OVERVIEW CARD            |  |  SURVIVABILITY & HEALTH CARD        |  |
|  |  Total: $600.00 | Paid: $0.00       |  |  Health Score: 98% (Optimal)        |  |
|  |  Stages: 1 of 3 Active              |  |  Cash Reserve Buffer: +$10.00       |  |
|  |  Status: Dual-Approved (v1)         |  |  [Launch Stress Simulator ->]       |  |
|  +-------------------------------------+  +-------------------------------------+  |
|                                                                                    |
|  +------------------------------------------------------------------------------+  |
|  |  INTERACTIVE MILESTONE TIMELINE (CARDS)                                      |  |
|  |  Stage 1: $200 [Payable Now]  ->  Stage 2: $250 [Locked]  ->  Stage 3: $150  |  |
|  +------------------------------------------------------------------------------+  |
+------------------------------------------------------------------------------------+
```

### 4.3 Service Provider Dashboard Information Architecture
```
+------------------------------------------------------------------------------------+
|  [TIDESET Logo]     Overview   Agreements   Payments   Simulator   [Marcus (Provider)] |
+------------------------------------------------------------------------------------+
|                                                                                    |
|  +------------------------------------------------------------------------------+  |
|  |  OPERATIONAL SUMMARY BANNER                                                  |  |
|  |  Active Agreements: 1 | Cleared to Work: 0 | Verified In Bank: $0.00         |  |
|  |  [+ Create New Proposal]               [Send Stage Invoice via PayPal]       |  |
|  +------------------------------------------------------------------------------+  |
|                                                                                    |
|  +------------------------------------------------------------------------------+  |
|  |  WORK PIPELINE & DELIVERY GATES                                              |  |
|  |  • Web Storefront Development ($600 Total)                                   |  |
|  |    - Stage 1: Waiting for Customer Settlement ($200.00)                      |  |
|  |    - Stage 2: Locked ($250.00)                                               |  |
|  |    - Stage 3: Locked ($150.00)                                               |  |
|  +------------------------------------------------------------------------------+  |
+------------------------------------------------------------------------------------+
```

---

## 5. Screen-by-Screen Layout Specifications

1. **Screen 1: Landing Page & Live Showcase**
   - High-impact value proposition: *"Don't just split payments. Make the agreement survivable."*
   - Live interactive mini-calculator demonstrating how a \$600 project survives with \$210 cash today.
   - Judge fast-start button to launch the pre-configured Demo Scenario directly.
2. **Screen 2: Agreement Builder & AI Intake**
   - Left pane: Step-by-step guided input (Total price, customer liquidity profile, provider exposure ceiling).
   - Right pane: Real-time solver canvas showing milestone cards, liquidity trajectory graphs, and trade-off balances.
3. **Screen 3: Bilateral Review & Signing Ceremony**
   - Side-by-side comparison of customer protections vs. provider protections.
   - Version badge (`v1`).
   - Dual signature status pills (`Customer: Signed` / `Provider: Pending`).
4. **Screen 4: PayPal Payment & Invoice Hub**
   - Active stage invoice with direct PayPal Sandbox Checkout button.
   - Option to generate and dispatch official PayPal Invoicing v2 link.
   - Real-time transaction reconciliation receipt display with PayPal Capture ID.
5. **Screen 5: Counterfactual Stress-Test Simulator**
   - Interactive timeline scrubber: *"What if client income arrives 10 days late?"*
   - Immediate mathematical recalculation showing projected deficit (-\$40) and AI-generated repair schedule.

---

## 6. Plain-Language Translation Dictionary

| Technical / Financial Jargon | TIDESET Plain-English Equivalent |
| :--- | :--- |
| "Receivable Obligation" | **"Your next payment"** |
| "Liquidity Feasibility Analysis" | **"Can I afford this payment?"** |
| "Uncollateralized Merchant Exposure" | **"Work done before payment is verified"** |
| "Arbitration & Escrow Settlement" | **"Agreement Milestones & Approvals"** |
| "Adhesion Contract Invalidation" | **"Both parties must sign the same changes"** |
| "Idempotent Webhook Acknowledgment" | **"Payment confirmed by PayPal"** |

---

## 7. Accessibility, Motion & Usability Rules

- **Reduced Motion:** If `prefers-reduced-motion: reduce` is detected, all transitions become instant zero-duration opacity changes.
- **Focus Rings:** High-visibility outline `outline-2 outline-offset-2 outline-periwinkle-400` on all interactive triggers.
- **Color Independence:** No status is communicated solely by color; every status badge pairs a distinct icon and descriptive text (e.g. `CheckCircle` + `"Payment Verified"`, `Clock` + `"Payment Pending"`, `Lock` + `"Locked until Stage 1 completes"`).
- **Responsive Breakpoints:**
  - `sm: 640px`: Single-column cards, mobile-friendly bottom action sheets.
  - `md: 768px`: Dual-column dashboard layout.
  - `lg: 1024px`: Full split-screen builder with persistent solver visualization.
