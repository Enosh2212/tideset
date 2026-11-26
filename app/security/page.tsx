import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PublicNavbar } from "@/components/PublicNavbar";
const topics = [
  [
    "Access belongs to the participants.",
    "Agreement access is checked on the server. A customer or provider role applies to that agreement, so it is possible to work on different sides of different projects.",
  ],
  [
    "Your session is checked, not assumed.",
    "Passwords are hashed. Sign-in creates a database-backed session in an HTTP-only cookie. Protected actions verify the session and agreement permissions. Sign out revokes the session.",
  ],
  [
    "A shared version, approved by both sides.",
    "Each participant reviews the scope, amounts and terms. If the agreement changes, both sides must review the updated version.",
  ],
  [
    "Payment and delivery are separate.",
    "PayPal is used for supported checkout flows. Bothway records verified payment information separately from work submission, revision requests and acceptance.",
  ],
  [
    "Know the limits.",
    "Bothway is not an escrow service. It does not guarantee refunds, automatically release funds after work review, or guarantee financial safety. AI suggestions remain subject to rules and human approval.",
  ],
];
export default function SecurityPage() {
  return (
    <div className="tide-home">
      <PublicNavbar />
      <main id="main-content">
        <section className="information-intro tide-section">
          <span className="eyebrow">SECURITY & PRODUCT BOUNDARIES</span>
          <h1>
            Clear terms.
            <br />
            <em>Clear responsibilities.</em>
          </h1>
          <p>
            Understand how access, agreement approvals and payment records
            work—and what Bothway does not promise.
          </p>
        </section>
        <section className="information-topics tide-section">
          {topics.map(([title, text], i) => (
            <article key={title}>
              <span className="eyebrow">0{i + 1}</span>
              <h2>{title}</h2>
              <p>{text}</p>
            </article>
          ))}
          <Link href="/how-it-works" className="text-link">
            Explore the process <ArrowUpRight size={18} />
          </Link>
        </section>
      </main>
    </div>
  );
}
