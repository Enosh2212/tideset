"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppNavbar } from "@/components/AppNavbar";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  User,
  Mail,
  Cpu,
  Layers,
  Copy,
  ExternalLink,
  AlertCircle,
} from "lucide-react";

export default function NewAgreementPage() {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);

  // Form inputs
  const [title, setTitle] = useState("Custom Web Storefront & Brand Identity");
  const [description, setDescription] = useState(
    "Full-stack e-commerce store with mobile responsive checkout and product catalog."
  );
  const [creatorRole, setCreatorRole] = useState<"CUSTOMER" | "PROVIDER">("CUSTOMER");
  const [counterpartyEmail, setCounterpartyEmail] = useState("");
  const [totalAmount, setTotalAmount] = useState(600);
  const [buyerLiquidity, setBuyerLiquidity] = useState(210);
  const [inflowDay, setInflowDay] = useState(14);
  const [inflowAmount, setInflowAmount] = useState(250);
  const [providerMinDeposit, setProviderMinDeposit] = useState(180);
  const [providerMaxExposure, setProviderMaxExposure] = useState(250);

  // Synthesis state
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [proposal, setProposal] = useState<any | null>(null);
  const [createdResult, setCreatedResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedInvite, setCopiedInvite] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push("/login");
        } else {
          setUser(data.user);
        }
      })
      .catch(() => router.push("/login"));
  }, [router]);

  const handleSynthesizeAI = async () => {
    setIsSynthesizing(true);
    setError(null);

    try {
      const res = await fetch("/api/agreements/agree_web_storefront_600/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          naturalLanguagePrompt: `${title}. ${description}`,
          totalAmountCents: totalAmount * 100,
          buyerLiquidityCents: buyerLiquidity * 100,
          buyerInflows: [
            { dayOffset: inflowDay, amountCents: inflowAmount * 100, source: "Paycheck" },
            { dayOffset: 28, amountCents: 20000, source: "Secondary Inflow" },
          ],
          providerMinDepositCents: providerMinDeposit * 100,
          providerMaxExposureCents: providerMaxExposure * 100,
          createNewVersion: false,
        }),
      });

      const data = await res.json();
      if (data.success && data.proposal) {
        setProposal(data.proposal);
      } else {
        setError(data.error || "Failed to synthesize proposal.");
      }
    } catch {
      setError("An unexpected error occurred while contacting AI solver.");
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleCreateAgreement = async () => {
    setIsCreating(true);
    setError(null);

    const stagesToCreate = proposal?.stages || [
      { sequenceIndex: 1, title: "Stage 1: Architecture & Setup", amountCents: 20000, dueDayOffset: 0, deliveryDayOffset: 7 },
      { sequenceIndex: 2, title: "Stage 2: Core Development", amountCents: 25000, dueDayOffset: 14, deliveryDayOffset: 21 },
      { sequenceIndex: 3, title: "Stage 3: QA & Final Launch", amountCents: 15000, dueDayOffset: 28, deliveryDayOffset: 35 },
    ];

    try {
      const res = await fetch("/api/agreements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          totalAmountCents: totalAmount * 100,
          creatorRole,
          counterpartyEmail: counterpartyEmail.trim() || undefined,
          stages: stagesToCreate,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCreatedResult(data);
      } else {
        setError(data.error || "Failed to create agreement.");
      }
    } catch {
      setError("An unexpected error occurred during agreement creation.");
    } finally {
      setIsCreating(false);
    }
  };

  const copyInvite = () => {
    if (createdResult?.inviteUrl) {
      navigator.clipboard.writeText(createdResult.inviteUrl);
      setCopiedInvite(true);
      setTimeout(() => setCopiedInvite(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <AppNavbar user={user} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 md:px-8 py-8 space-y-8">
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create New Agreement</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Define project scope, synthesize survivable milestones, and invite your counterparty.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-2 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {!createdResult ? (
          <div className="space-y-6">
            {/* Agreement Scope Form */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5">
                1. Project Definition
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Project Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC]"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Scope Description</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Your Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCreatorRole("CUSTOMER")}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                        creatorRole === "CUSTOMER"
                          ? "border-[#0052CC] bg-blue-50 text-[#0052CC]"
                          : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      Client / Buyer
                    </button>
                    <button
                      type="button"
                      onClick={() => setCreatorRole("PROVIDER")}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                        creatorRole === "PROVIDER"
                          ? "border-[#0052CC] bg-blue-50 text-[#0052CC]"
                          : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      Service Provider
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Invite Counterparty Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={counterpartyEmail}
                    onChange={(e) => setCounterpartyEmail(e.target.value)}
                    placeholder="counterparty@example.com"
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC]"
                  />
                </div>
              </div>
            </div>

            {/* Financial Parameters */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5">
                2. Financial Feasibility Constraints
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Total Price ($USD)</label>
                  <input
                    type="number"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Client Initial Liquidity ($USD)</label>
                  <input
                    type="number"
                    value={buyerLiquidity}
                    onChange={(e) => setBuyerLiquidity(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Client Inflow on Day 14 ($USD)</label>
                  <input
                    type="number"
                    value={inflowAmount}
                    onChange={(e) => setInflowAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Provider Min Deposit ($USD)</label>
                  <input
                    type="number"
                    value={providerMinDeposit}
                    onChange={(e) => setProviderMinDeposit(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Provider Max Exposure ($USD)</label>
                  <input
                    type="number"
                    value={providerMaxExposure}
                    onChange={(e) => setProviderMaxExposure(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC]"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSynthesizeAI}
                disabled={isSynthesizing}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#0052CC] hover:bg-[#0047B3] text-white shadow-xs transition-all flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {isSynthesizing
                    ? "Synthesizing with OpenRouter & Solver..."
                    : "Synthesize Survivable Schedule with AI"}
                </span>
              </button>
            </div>

            {/* Proposal Preview */}
            {proposal && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <Cpu className="w-4 h-4 text-[#0052CC]" />
                    <span className="text-xs font-bold text-slate-900">
                      Engine Origin: {proposal.modelDetails}
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Survivability Score: {proposal.survivabilityScore}/100
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {proposal.stages.map((stg: any, i: number) => (
                    <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="text-[11px] font-bold text-[#0052CC]">Stage {stg.sequenceIndex}</div>
                      <div className="text-xs font-bold text-slate-900 truncate">{stg.title}</div>
                      <div className="font-mono text-sm font-bold text-slate-800">
                        ${(stg.amountCents / 100).toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-500">Due: Day {stg.dueDayOffset}</div>
                    </div>
                  ))}
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
                  <div>
                    <strong className="text-slate-900">Client Protection: </strong>
                    {proposal.tradeoffs?.customerPerspective}
                  </div>
                  <div>
                    <strong className="text-slate-900">Provider Protection: </strong>
                    {proposal.tradeoffs?.providerPerspective}
                  </div>
                </div>
              </div>
            )}

            {/* Final Action Button */}
            <button
              type="button"
              onClick={handleCreateAgreement}
              disabled={isCreating}
              className="w-full py-3 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isCreating ? "Creating Agreement..." : "Create Agreement & Lock Version 1"}</span>
            </button>
          </div>
        ) : (
          /* Agreement Created Success View */
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs text-center space-y-5">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">Agreement Created Successfully!</h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Your milestone agreement has been initialized in draft status.
              </p>
            </div>

            {createdResult.inviteUrl && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2">
                <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>Single-Use Invitation Link for Counterparty:</span>
                  {copiedInvite && <span className="text-emerald-600 font-bold text-[10px]">Copied!</span>}
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={createdResult.inviteUrl}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-700"
                  />
                  <button
                    onClick={copyInvite}
                    className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 shadow-xs shrink-0"
                    title="Copy invitation link"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  Share this link with your counterparty so they can accept their role and join the agreement.
                </p>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={`/agreements/${createdResult.agreement.id}`}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold bg-[#0052CC] text-white hover:bg-[#0047B3] shadow-xs flex items-center justify-center space-x-1.5"
              >
                <span>Go to Agreement Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-white text-slate-700 hover:bg-slate-50 border border-slate-300"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
