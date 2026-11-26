import {
  Check,
  ArrowUpRight,
  FileText,
  Paperclip,
  CreditCard,
} from "lucide-react";
export const processSteps = [
  {
    title: "Describe the project",
    short: "A shared starting point",
    detail:
      "Describe the scope, budget, dates and what a good result looks like. Bring both sides’ expectations into one brief.",
    tag: "PROJECT BRIEF",
    icon: FileText,
  },
  {
    title: "Build a milestone plan",
    short: "Make room for progress",
    detail:
      "AI proposes manageable stages. The rules check the amounts and constraints you provide. Both sides decide what works.",
    tag: "MILESTONE PLAN",
    icon: Paperclip,
  },
  {
    title: "Agree on terms",
    short: "The same plan. Two approvals.",
    detail:
      "Review scope, amounts and deadlines together. Each person approves the same agreement version before work begins.",
    tag: "SHARED AGREEMENT",
    icon: Check,
  },
  {
    title: "Pay by milestone",
    short: "One stage at a time",
    detail:
      "Use a supported PayPal checkout for each stage. A payment record confirms payment, not delivery or acceptance of the work.",
    tag: "PAYMENT CHECKOUT",
    icon: CreditCard,
  },
  {
    title: "Submit and review",
    short: "Give the work its own moment",
    detail:
      "The provider submits the agreed deliverables. The customer reviews the work and accepts it or requests changes.",
    tag: "WORK REVIEW",
    icon: ArrowUpRight,
  },
];
export function StageMiniature({ step }: { step: number }) {
  return (
    <div className={"stage-mini stage-mini-" + step} aria-hidden="true">
      {step === 0 ? (
        <>
          <i />
          <i />
          <i />
          <span className="mini-note">The brief</span>
          <b className="mini-seal">01</b>
        </>
      ) : step === 1 ? (
        <>
          <span>$200</span>
          <span>$200</span>
          <span>$200</span>
        </>
      ) : step === 2 ? (
        <>
          <b className="mini-person">C</b>
          <Check size={28} />
          <b className="mini-person">P</b>
          <span className="mini-note">Both sides approve</span>
        </>
      ) : step === 3 ? (
        <>
          <CreditCard size={42} strokeWidth={1.2} />
          <span className="mini-note">Pay for this stage</span>
          <b>$200</b>
        </>
      ) : (
        <>
          <FileText size={34} />
          <ArrowUpRight size={22} />
          <Check size={28} />
          <span className="mini-note">Submit → Review</span>
        </>
      )}
    </div>
  );
}
export function StagePreview({ step }: { step: number }) {
  return (
    <div className="process-specimen" key={step}>
      <div className="specimen-top">
        <span>{processSteps[step].tag}</span>
        <span>Illustrative example</span>
      </div>
      {step === 0 ? (
        <>
          <h4>A website that feels like us.</h4>
          <p>Brand redesign & marketing site</p>
          <div className="brief-line">
            <span>Budget</span>
            <b>$600 USD</b>
          </div>
          <div className="brief-line">
            <span>Deliverables</span>
            <b>Identity + website + handoff</b>
          </div>
          <div className="brief-note">
            A clear brief makes a useful plan possible.
          </div>
        </>
      ) : step === 1 ? (
        <>
          <h4>A plan with breathing room.</h4>
          <div className="proposal-stages">
            {["Plan", "Build", "Deliver"].map((s, i) => (
              <div key={s}>
                <span>0{i + 1}</span>
                <strong>$200</strong>
                <p>{s}</p>
              </div>
            ))}
          </div>
          <p>
            Proposed total <b className="float-right">$600 USD</b>
          </p>
          <small>AI suggests. Rules check. You decide.</small>
        </>
      ) : step === 2 ? (
        <>
          <h4>Ready for both approvals.</h4>
          <p>Scope, dates and amounts in one shared version.</p>
          <div className="signoff">
            <div>
              <span>Customer</span>
              <i>Review & approve</i>
            </div>
            <div>
              <span>Provider</span>
              <i>Review & approve</i>
            </div>
          </div>
          <small>
            Example of an approval step; no live agreement is being approved.
          </small>
        </>
      ) : step === 3 ? (
        <>
          <h4>Pay for the planning stage.</h4>
          <div className="checkout-total">
            <span>Stage 01 · Planning</span>
            <strong>
              $200.00 <small>USD</small>
            </strong>
          </div>
          <div className="paypal-illustration">
            <b>
              Pay<span>Pal</span>
            </b>
            <span>
              Checkout preview <ArrowUpRight size={16} />
            </span>
          </div>
          <small>Illustrative only. No payment is initiated here.</small>
        </>
      ) : (
        <>
          <h4>Give feedback, keep moving.</h4>
          <div className="deliverable-example">
            <FileText size={28} />
            <div>
              <b>Brand direction.pdf</b>
              <span>Example deliverable · ready to review</span>
            </div>
          </div>
          <div className="review-actions">
            <span>Review submission</span>
            <span>
              Accept or request changes <ArrowUpRight size={16} />
            </span>
          </div>
          <small>Work review is separate from payment status.</small>
        </>
      )}
    </div>
  );
}
