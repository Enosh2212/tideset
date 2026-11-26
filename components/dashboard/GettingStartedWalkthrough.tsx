"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText,
  CreditCard,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface StepMeta {
  step: number;
  label: string;
  summary: string;
}

const STEPS: StepMeta[] = [
  { step: 1, label: "Define the agreement", summary: "Title, total budget & counterparties" },
  { step: 2, label: "Structure milestones", summary: "Deliverables, dates & staged amounts" },
  { step: 3, label: "Invite counterparty", summary: "Share secure review link" },
  { step: 4, label: "Mutual agreement", summary: "Cryptographic lock upon two-party sign-off" },
  { step: 5, label: "Deliver & settle", summary: "Inspect work, capture payment via PayPal" },
];

export function GettingStartedWalkthrough() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialStep = Math.min(Math.max(Number(searchParams.get("step")) || 1, 1), 5);
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const s = Number(searchParams.get("step"));
    if (s >= 1 && s <= 5 && s !== currentStep) {
      setCurrentStep(s);
    }
  }, [searchParams]);

  const selectStep = (stepNumber: number) => {
    setCurrentStep(stepNumber);
    const params = new URLSearchParams(window.location.search);
    params.set("step", stepNumber.toString());
    router.replace(`/dashboard/getting-started?${params.toString()}`);
  };

  const handleCopyInvite = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`${window.location.origin}/invite/demo-agreement-sample`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <span className="text-[11px] font-bold tracking-wider uppercase text-blue-600">
            Guided Onboarding
          </span>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight mt-1">
            How Bothway works
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            A bilateral framework connecting project scope, phased deliverables, and verified PayPal milestone settlements in one shared agreement.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/agreements/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
          >
            <span>Create agreement</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Low-Chrome Two-Column Flow */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
        {/* Left Step Rail: Open Vertical Nav with Hairline Progress Indicator */}
        <nav className="md:col-span-4 space-y-1 relative" aria-label="Walkthrough steps">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 pb-2">
            Phases
          </div>
          <div className="space-y-0.5">
            {STEPS.map((s) => {
              const isCurrent = currentStep === s.step;
              const isPast = currentStep > s.step;

              return (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => selectStep(s.step)}
                  className={`w-full text-left px-3 py-2.5 rounded-md transition-colors flex items-start gap-3 relative ${
                    isCurrent
                      ? "bg-blue-50/70 text-blue-900 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/80"
                  }`}
                >
                  {/* Subtle active left-indicator bar */}
                  {isCurrent && (
                    <span
                      className="absolute left-0 top-2 bottom-2 w-0.5 bg-blue-600 rounded-r"
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 mt-0.5 ${
                      isCurrent
                        ? "bg-blue-600 text-white"
                        : isPast
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {isPast ? <Check className="w-3 h-3" /> : s.step}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs tracking-tight truncate">{s.label}</div>
                    <div className="text-[11px] text-slate-400 font-normal truncate mt-0.5">
                      {s.summary}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Right Content Area: Open, Hairline-Divided Workspace Preview */}
        <div className="md:col-span-8 space-y-6">
          {/* STEP 1 */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-blue-600 uppercase">
                  Phase 1 &bull; Scope & Terms
                </span>
                <h2 className="text-xl font-semibold text-slate-900 mt-1">
                  Draft the bilateral scope
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                  Every agreement begins with a title, total budget, and plain-language scope. Either the customer or provider can initiate drafting.
                </p>
              </div>

              {/* Live Preview Sample */}
              <div className="border border-slate-200/90 rounded-lg p-5 bg-white space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-semibold text-slate-900">Brand Redesign & Marketing Site</span>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    Drafting
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                      Counterparties
                    </span>
                    <p className="text-slate-800 font-medium mt-1">Elena Rostova (Client)</p>
                    <p className="text-slate-500 text-[11px]">Marcus Vance (Provider)</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                      Budget Total
                    </span>
                    <p className="text-slate-900 font-bold text-sm mt-1">$600.00 USD</p>
                    <p className="text-slate-500 text-[11px]">Divided across 3 milestones</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-blue-600 uppercase">
                  Phase 2 &bull; Staged Execution
                </span>
                <h2 className="text-xl font-semibold text-slate-900 mt-1">
                  Break work into verifiable milestones
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                  Milestones link concrete deliverables to individual payment releases. Funds are settled through PayPal only after deliverables are inspected.
                </p>
              </div>

              <div className="border border-slate-200/90 rounded-lg divide-y divide-slate-100 bg-white">
                {[
                  { n: 1, title: "Wireframes & Information Architecture", amount: "$200.00", status: "Funded", date: "Nov 14" },
                  { n: 2, title: "Component Library & Visual Design", amount: "$200.00", status: "Upcoming", date: "Nov 21" },
                  { n: 3, title: "Production Deployment & Handoff", amount: "$200.00", status: "Upcoming", date: "Nov 28" },
                ].map((m) => (
                  <div key={m.n} className="p-3.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center">
                        {m.n}
                      </span>
                      <div>
                        <div className="font-medium text-slate-900">{m.title}</div>
                        <div className="text-[11px] text-slate-400">Target: {m.date}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-900">{m.amount}</div>
                      <span className="text-[10px] text-blue-600 font-medium">{m.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-blue-600 uppercase">
                  Phase 3 &bull; Invite Counterparty
                </span>
                <h2 className="text-xl font-semibold text-slate-900 mt-1">
                  Share the review link
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                  Bothway generates a secure bilateral invitation token. The other party can inspect all terms before creating or connecting their account.
                </p>
              </div>

              <div className="border border-slate-200/90 rounded-lg p-5 bg-white space-y-3">
                <span className="text-[11px] font-medium text-slate-500">
                  Bilateral Invitation Token Link
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value="https://bothway.app/invite/token_sample_8921df"
                    aria-label="Invitation Token Link"
                    className="flex-1 px-3 py-1.5 rounded border border-slate-200 text-xs font-mono text-slate-600 bg-slate-50"
                  />
                  <button
                    type="button"
                    onClick={handleCopyInvite}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Only the recipient can review and accept this agreement version.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-blue-600 uppercase">
                  Phase 4 &bull; Mutual Lock
                </span>
                <h2 className="text-xl font-semibold text-slate-900 mt-1">
                  Cryptographic term lock
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                  Once both parties sign off, the agreement enters Active status. Neither party can unilaterally change deliverables, dates, or payment terms.
                </p>
              </div>

              <div className="border border-slate-200/90 rounded-lg p-5 bg-white space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-semibold text-slate-900">Bilateral Signatures</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                    Active &bull; Locked
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-600">Elena Rostova (Client)</span>
                    <span className="text-emerald-600 font-medium inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-t border-slate-50">
                    <span className="text-slate-600">Marcus Vance (Provider)</span>
                    <span className="text-emerald-600 font-medium inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5 */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-blue-600 uppercase">
                  Phase 5 &bull; Deliverables & Payment
                </span>
                <h2 className="text-xl font-semibold text-slate-900 mt-1">
                  Inspect deliverables, release PayPal payment
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                  The provider uploads work files and preview links. The client inspects the deliverables and authorizes the milestone capture through PayPal.
                </p>
              </div>

              <div className="border border-slate-200/90 rounded-lg p-5 bg-white space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-semibold text-slate-900">Milestone 1 Settlement</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900">$200.00 USD</span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <p className="font-medium text-slate-800">Delivered: Figma wireframes & site map (v1.2)</p>
                  <p className="text-[11px] text-slate-400">Captured via PayPal Sandbox transaction #829140</p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-emerald-600 font-semibold inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Settled to Provider
                  </span>
                  <Link
                    href="/agreements/new"
                    className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    <span>Start real agreement</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Step Nav Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <button
              type="button"
              disabled={currentStep === 1}
              onClick={() => selectStep(currentStep - 1)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous phase</span>
            </button>

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={() => selectStep(currentStep + 1)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors"
              >
                <span>Next phase</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <Link
                href="/agreements/new"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                <span>Create your agreement</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
