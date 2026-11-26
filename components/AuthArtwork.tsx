import { Check, FileText, ArrowUpRight, Waves } from "lucide-react";
import { BothwayLogo } from "@/components/brand/BothwayLogo";
export function AuthArtwork({ mode }: { mode: "login" | "signup" }) {
  return (
    <aside
      className={"auth-art-panel " + mode}
      aria-label="Illustration of two parties forming a milestone agreement"
    >
      <div className="auth-art-heading">
        <span className="eyebrow">ON THE SAME PAGE, FROM DAY ONE.</span>
        <h2>
          {mode === "signup" ? "Great things start" : "Pick up where"}
          <br />
          <em>
            {mode === "signup" ? "with clear terms." : "good work left off."}
          </em>
        </h2>
        <p>
          {mode === "signup"
            ? "One plan that makes sense to both sides."
            : "Your agreements. Your milestones. Your next step."}
        </p>
      </div>
      <div className="auth-product-art" aria-hidden="true">
        <svg className="auth-connection" viewBox="0 0 600 500" fill="none">
          <path d="M60 105 C60 205 170 130 185 225" />
          <path d="M540 145 C540 230 440 160 420 275" />
          <path
            className="connection-progress"
            d="M100 400 C190 475 430 470 505 380"
          />
        </svg>
        <div className="party-token customer-token">
          <span>C</span>
          <div>
            <b>Customer</b>
            <small>A clear scope</small>
          </div>
          <Check size={15} />
        </div>
        <div className="party-token provider-token">
          <span>P</span>
          <div>
            <b>Provider</b>
            <small>A clear next step</small>
          </div>
          <Check size={15} />
        </div>
        <div className="auth-agreement-object">
          <div className="auth-document-brand">
            <BothwayLogo size={20} />
            <span>BOTHWAY / EXAMPLE</span>
            <ArrowUpRight size={16} />
          </div>
          <span className="eyebrow">A SHARED AGREEMENT</span>
          <h3>
            Something good,
            <br />
            taking shape.
          </h3>
          <div className="auth-doc-summary">
            <span>Project total</span>
            <b>$600 USD</b>
          </div>
          <div className="auth-milestones">
            {["Plan", "Build", "Deliver"].map((s, i) => (
              <div key={s}>
                <i>0{i + 1}</i>
                <span>
                  {s}
                  <small>
                    {i === 0
                      ? "Define the direction"
                      : i === 1
                        ? "Bring it to life"
                        : "Make the handoff"}
                  </small>
                </span>
                <b>$200</b>
              </div>
            ))}
          </div>
          <div className="auth-approval">
            <span>
              <Check size={12} /> Customer review
            </span>
            <span>
              <Check size={12} /> Provider review
            </span>
          </div>
        </div>
        <div className="auth-payment-note">
          <FileText size={23} />
          <div>
            <b>Every step connected.</b>
            <span>Scope, payment records & deliverables</span>
          </div>
        </div>
      </div>
      <div className="auth-art-foot">
        <span>Two perspectives. One shared direction.</span>
        <span>01 — 03</span>
      </div>
    </aside>
  );
}
