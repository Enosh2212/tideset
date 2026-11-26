"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Waves,
  Plus,
  Minus,
} from "lucide-react";
import { PublicNavbar } from "@/components/PublicNavbar";
import { IllustratedStory } from "@/components/IllustratedStory";
import { HangingProcessCards } from "@/components/HangingProcessCards";
import { InteractiveAgreementExplorer } from "@/components/InteractiveAgreementExplorer";
import { BothwayLogo } from "@/components/brand/BothwayLogo";
export default function LandingPage() {
  const [side, setSide] = useState<"customer" | "provider">("customer");
  useEffect(() => {
    const sync = () => {
      if (location.hash === "#for-providers") setSide("provider");
      if (location.hash === "#for-customers") setSide("customer");
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  const [faq, setFaq] = useState<number | null>(0);
  const questions = [
    [
      "Does Bothway hold the money?",
      "No. Bothway is not an escrow service. Supported payments go through PayPal checkout. Bothway tracks payment records separately from deliverable review.",
    ],
    [
      "Who decides the payment plan?",
      "You do. AI suggests a milestone plan, and the rules check amounts and the constraints you provide. Both parties review and approve the same terms.",
    ],
    [
      "Can I be a customer and a provider?",
      "Yes. Your role belongs to each agreement. One account can commission work in one project and provide services in another.",
    ],
    [
      "What happens if the work needs changes?",
      "The customer can review submitted work and request revisions. Work acceptance and payment status remain separate records.",
    ],
  ];
  return (
    <div className="tide-home">
      <PublicNavbar />
      <main id="main-content">
        <section className="tide-hero tide-section">
          <div className="hero-layout">
            <div className="hero-editorial">
              <span className="eyebrow">
                <span className="tiny-wave" /> AGREEMENTS & MILESTONE PAYMENTS
              </span>
              <h1>
                Clear agreements.
                <br />
                Smarter stages.
                <br />
                <em>Better work.</em>
              </h1>
              <p>
                Agree on the work. Pay one milestone at a time.
                <br />
                Keep payments, deliverables and decisions in one shared plan.
              </p>
              <div className="hero-actions">
                <Link href="/signup" className="tide-button">
                  Create an agreement <ArrowUpRight size={18} />
                </Link>
                <a href="#how-it-works" className="text-link">
                  See how it works <ArrowRight size={17} />
                </a>
              </div>
              <div className="hero-proof">
                <span>A plan both sides approve</span>
                <i />
                <span>Payments through PayPal</span>
              </div>
            </div>
            <div className="hero-product">
              <div className="hero-orbit" aria-hidden="true" />
              <div className="hero-product-caption">
                <span>THE BIG PICTURE</span>
                <span>Made manageable ↘</span>
              </div>
              <div className="hero-agreement">
                <div className="hero-doc-top">
                  <span className="flex items-center gap-1.5 font-bold">
                    <BothwayLogo size={20} />
                    <span>BOTHWAY</span>
                  </span>
                  <span>ILLUSTRATIVE PLAN</span>
                </div>
                <h2>
                  Your project.
                  <br />
                  One clear plan.
                </h2>
                <p>Brand redesign & marketing site</p>
                <div className="hero-total">
                  <strong>
                    $600<span>.00</span>
                  </strong>
                  <span>
                    USD
                    <br />
                    Project total
                  </span>
                </div>
                <div className="hero-stage-list">
                  {[
                    "Planning & Architecture",
                    "Design & Development",
                    "Final Delivery",
                  ].map((s, i) => (
                    <div key={s}>
                      <span>0{i + 1}</span>
                      <b>{s}</b>
                      <strong>$200</strong>
                    </div>
                  ))}
                </div>
                <div className="hero-doc-foot">
                  <span>One plan. Both sides approve.</span>
                  <span>01 — 03</span>
                </div>
              </div>
              <div className="hero-note">
                <span className="note-pin" />
                <strong>
                  Three milestones.
                  <br />
                  One shared plan.
                </strong>
                <span>Scope · stages · expectations</span>
              </div>
            </div>
          </div>
        </section>
        <IllustratedStory />
        <HangingProcessCards />
        <section className="planning-editorial tide-section">
          <div>
            <span className="eyebrow">A THOUGHTFUL HEAD START</span>
            <h2>
              A useful suggestion.
              <br />
              <em>Still your decision.</em>
            </h2>
            <p>
              Describe the project in your own words. AI suggests a plan; the
              rules check the totals and constraints. Both sides review what
              works.
            </p>
          </div>
          <div className="planning-math">
            <span className="eyebrow">AN EXAMPLE, NOT A PAYMENT</span>
            <div>
              <span>$200</span>
              <i>+</i>
              <span>$200</span>
              <i>+</i>
              <span>$200</span>
            </div>
            <hr />
            <p>
              A project total that adds up.<strong>$600 USD</strong>
            </p>
            <span className="math-footer">
              <Check size={16} /> Changes go back to both sides for approval.
            </span>
          </div>
        </section>
        <InteractiveAgreementExplorer />
        <section className="two-sides tide-section" id="for-customers">
          <div className="section-heading">
            <div>
              <span className="eyebrow">TWO PERSPECTIVES. COMMON GROUND.</span>
              <h2>
                A good agreement
                <br />
                <em>works both ways.</em>
              </h2>
            </div>
            <div
              className="perspective-switch"
              aria-label="Choose your perspective"
            >
              <button
                aria-pressed={side === "customer"}
                onClick={() => setSide("customer")}
              >
                For customers
              </button>
              <button
                id="for-providers"
                aria-pressed={side === "provider"}
                onClick={() => setSide("provider")}
              >
                For providers
              </button>
            </div>
          </div>
          <div className="audience-content" key={side}>
            <span className="audience-mark">
              {side === "customer" ? "C" : "P"}
            </span>
            <div>
              <h3>
                {side === "customer"
                  ? "Know what you’re paying for."
                  : "Know what you’re working toward."}
              </h3>
              <p>
                {side === "customer"
                  ? "See the scope and amount for every stage. Review submissions against an agreed plan, with decisions kept in one place."
                  : "Set expectations before the work begins. Keep deliverables, payment records and feedback connected to the agreement."}
              </p>
              <Link href="/signup" className="text-link">
                Make room for better work <ArrowRight size={18} />
              </Link>
            </div>
            <div className="audience-principles">
              {(side === "customer"
                ? ["A clear scope", "Manageable stages", "Room to review"]
                : [
                    "Agreed expectations",
                    "Documented decisions",
                    "A visible next step",
                  ]
              ).map((s, i) => (
                <span key={s}>
                  <small>0{i + 1}</small>
                  {s}
                  <Check size={18} />
                </span>
              ))}
            </div>
          </div>
        </section>
        <section className="tide-faq tide-section">
          <div>
            <span className="eyebrow">GOOD QUESTIONS</span>
            <h2>
              Before we
              <br />
              <em>get started.</em>
            </h2>
          </div>
          <div>
            {questions.map(([q, a], i) => (
              <article key={q}>
                <h3>
                  <button
                    aria-expanded={faq === i}
                    aria-controls={"faq-" + i}
                    onClick={() => setFaq(faq === i ? null : i)}
                  >
                    {q}
                    {faq === i ? <Minus size={19} /> : <Plus size={19} />}
                  </button>
                </h3>
                <p id={"faq-" + i} hidden={faq !== i}>
                  {a}
                </p>
              </article>
            ))}
          </div>
        </section>
        <section className="closing-cta tide-section">
          <span className="eyebrow">LET’S PUT IT IN WRITING.</span>
          <h2>
            Your next great project
            <br />
            starts with <em>a shared plan.</em>
          </h2>
          <Link href="/signup" className="tide-button">
            Get started <ArrowUpRight size={19} />
          </Link>
          <span>No guesswork about the next step.</span>
        </section>
      </main>
      <footer className="tide-footer">
        <Link href="/" className="wordmark flex items-center">
          <BothwayLogo size={28} showWordmark />
        </Link>
        <span>Clear agreements. Better working relationships.</span>
        <div>
          <Link href="/security">Security</Link>
          <Link href="/how-it-works">How it works</Link>
          <span>© {new Date().getFullYear()} Bothway</span>
        </div>
      </footer>
    </div>
  );
}
