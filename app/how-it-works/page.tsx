import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PublicNavbar } from "@/components/PublicNavbar";
import { HangingProcessCards } from "@/components/HangingProcessCards";
export default function HowItWorksPage() {
  return (
    <div className="tide-home">
      <PublicNavbar />
      <main id="main-content">
        <section className="information-intro tide-section">
          <span className="eyebrow">HOW BOTHWAY WORKS</span>
          <h1>
            A shared plan.
            <br />
            <em>A clear next step.</em>
          </h1>
          <p>
            Connect scope, milestone payments and deliverables, from the first
            conversation to the final review.
          </p>
        </section>
        <HangingProcessCards />
        <section className="planning-editorial tide-section">
          <div>
            <span className="eyebrow">KEEP THE TWO RECORDS CLEAR</span>
            <h2>
              A payment is a payment.
              <br />
              <em>Work still gets reviewed.</em>
            </h2>
            <p>
              A verified payment record is separate from submitting or accepting
              work. Bothway does not hold funds in escrow, promise refunds or
              automatically pay a provider after review.
            </p>
          </div>
          <div>
            <h3 className="information-subheading">
              The agreement stays shared.
            </h3>
            <p>
              AI proposes a schedule. Financial rules check totals and the
              constraints you provide. Both participants review and approve the
              same version; changes require a fresh review.
            </p>
            <Link href="/signup" className="tide-button">
              Create an agreement <ArrowUpRight size={18} />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
