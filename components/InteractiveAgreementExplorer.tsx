"use client";
import { useState } from "react";
import {
  ArrowUpRight,
  Check,
  FileText,
  Layers,
  Package,
  ChevronRight,
} from "lucide-react";
const stages = [
  {
    title: "Planning & Architecture",
    short: "Plan",
    description: "Agree on the direction before the details.",
    items: [
      "Sitemap & content structure",
      "Wireframe prototype",
      "Creative direction",
    ],
    icon: FileText,
    note: "Review the proposed structure and confirm the direction together.",
  },
  {
    title: "Design & Development",
    short: "Build",
    description: "Turn an agreed direction into something tangible.",
    items: [
      "Responsive page designs",
      "Working website components",
      "Staging link for review",
    ],
    icon: Layers,
    note: "Review the designs and working pages against the agreed scope.",
  },
  {
    title: "Final Delivery",
    short: "Deliver",
    description: "Make the handoff as clear as the beginning.",
    items: [
      "Final website handoff",
      "Source files & assets",
      "Handover documentation",
    ],
    icon: Package,
    note: "Check the deliverables and request changes or accept the work.",
  },
];
export function InteractiveAgreementExplorer() {
  const [selected, setSelected] = useState(0);
  const stage = stages[selected];
  const Icon = stage.icon;
  return (
    <section
      className="agreement-explorer tide-section"
      id="agreement-preview"
      aria-labelledby="explorer-heading"
    >
      <div className="explorer-editorial">
        <span className="eyebrow">TAKE A CLOSER LOOK</span>
        <h2 id="explorer-heading">
          One agreement.
          <br />
          <em>
            Every step
            <br /> accounted for.
          </em>
        </h2>
        <p>
          Explore how project scope, payment stages and deliverables stay
          connected.
        </p>
        <div className="agreement-summary">
          <span>ILLUSTRATIVE AGREEMENT</span>
          <h3>
            Brand Redesign
            <br />& Marketing Site
          </h3>
          <strong>
            $600 <small>USD / 3 stages</small>
          </strong>
        </div>
        <div
          className="milestone-path"
          aria-label="Choose an example milestone"
        >
          {stages.map((s, i) => (
            <button
              key={s.title}
              type="button"
              aria-pressed={selected === i}
              onClick={() => setSelected(i)}
              aria-controls="milestone-detail"
            >
              <span className="path-node">0{i + 1}</span>
              <span>
                {s.short}
                <small>$200</small>
              </span>
              <ChevronRight size={16} />
            </button>
          ))}
        </div>
      </div>
      <div className="explorer-app">
        <div className="app-chrome">
          <div className="window-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <span>TIDESET / Agreement explorer</span>
          <span>EXAMPLE</span>
        </div>
        <div
          id="milestone-detail"
          className="milestone-detail"
          key={selected}
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="detail-identifier">
            <span>STAGE 0{selected + 1} / 03</span>
            <Icon size={22} />
          </div>
          <h3>{stage.title}</h3>
          <p>{stage.description}</p>
          <div className="milestone-amount">
            <strong>
              $200<small>.00</small>
            </strong>
            <span>
              USD
              <br />
              Stage amount
            </span>
          </div>
          <div className="deliverable-list">
            <span className="eyebrow">WHAT THIS STAGE INCLUDES</span>
            {stage.items.map((item) => (
              <div key={item}>
                <Check size={16} />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="review-note">
            <span>
              REVIEW TOGETHER <ArrowUpRight size={15} />
            </span>
            <p>{stage.note}</p>
          </div>
          <div className="payment-work-separation">
            <span>
              <i /> Payment record
            </span>
            <span>
              <i /> Work review
            </span>
            <small>
              Separate records. No payment has been made in this example.
            </small>
          </div>
        </div>
        <div className="explorer-app-bottom">
          <span>Scope → Payment → Deliverables</span>
          <span>0{selected + 1}</span>
        </div>
      </div>
    </section>
  );
}
