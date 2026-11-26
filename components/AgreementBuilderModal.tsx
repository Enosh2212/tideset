"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Calendar,
  Cpu,
} from "lucide-react";

interface AgreementBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  agreementId: string;
  onVersionCreated: () => void;
}

export const AgreementBuilderModal: React.FC<AgreementBuilderModalProps> = ({
  isOpen,
  onClose,
  agreementId,
  onVersionCreated,
}) => {
  const [totalAmount, setTotalAmount] = useState(600);
  const [buyerLiquidity, setBuyerLiquidity] = useState(210);
  const [inflowDay, setInflowDay] = useState(14);
  const [inflowAmount, setInflowAmount] = useState(250);
  const [providerMinDeposit, setProviderMinDeposit] = useState(180);
  const [providerMaxExposure, setProviderMaxExposure] = useState(250);
  const [prompt, setPrompt] = useState(
    "Custom web storefront for boutique bakery, including shopping cart and menu system."
  );

  const [isLoading, setIsLoading] = useState(false);
  const [proposal, setProposal] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleSynthesize = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/agreements/${agreementId}/solve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tideset-role": "CUSTOMER",
        },
        body: JSON.stringify({
          totalAmountCents: totalAmount * 100,
          buyerLiquidityCents: buyerLiquidity * 100,
          buyerInflows: [
            { dayOffset: inflowDay, amountCents: inflowAmount * 100, source: "Paycheck" },
            { dayOffset: 28, amountCents: 20000, source: "Bakery Orders" },
          ],
          providerMinDepositCents: providerMinDeposit * 100,
          providerMaxExposureCents: providerMaxExposure * 100,
          naturalLanguagePrompt: prompt,
          createNewVersion: false,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProposal(data.proposal);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommitVersion = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/agreements/${agreementId}/solve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tideset-role": "CUSTOMER",
        },
        body: JSON.stringify({
          totalAmountCents: totalAmount * 100,
          buyerLiquidityCents: buyerLiquidity * 100,
          buyerInflows: [
            { dayOffset: inflowDay, amountCents: inflowAmount * 100, source: "Paycheck" },
            { dayOffset: 28, amountCents: 20000, source: "Bakery Orders" },
          ],
          providerMinDepositCents: providerMinDeposit * 100,
          providerMaxExposureCents: providerMaxExposure * 100,
          naturalLanguagePrompt: prompt,
          createNewVersion: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onVersionCreated();
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white max-w-3xl w-full rounded-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0052CC] flex items-center justify-center border border-blue-200 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">AI Agreement Builder</h3>
              <p className="text-xs text-slate-500">
                Natural-language requirement intake + Deterministic constraint engine.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Parameters Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-slate-700">Project Description / Scope</label>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC] shadow-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Total Project Price ($USD)</label>
            <input
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(parseFloat(e.target.value) || 0)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC] shadow-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Buyer Liquidity Today ($USD)</label>
            <input
              type="number"
              value={buyerLiquidity}
              onChange={(e) => setBuyerLiquidity(parseFloat(e.target.value) || 0)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC] shadow-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Scheduled Inflow ($USD on Day 14)</label>
            <input
              type="number"
              value={inflowAmount}
              onChange={(e) => setInflowAmount(parseFloat(e.target.value) || 0)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC] shadow-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Provider Minimum Deposit ($USD)</label>
            <input
              type="number"
              value={providerMinDeposit}
              onChange={(e) => setProviderMinDeposit(parseFloat(e.target.value) || 0)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC] shadow-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Provider Max Exposure Limit ($USD)</label>
            <input
              type="number"
              value={providerMaxExposure}
              onChange={(e) => setProviderMaxExposure(parseFloat(e.target.value) || 0)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC] shadow-xs"
            />
          </div>
        </div>

        <button
          onClick={handleSynthesize}
          disabled={isLoading}
          className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#0052CC] hover:bg-[#0047B3] text-white shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isLoading ? "Synthesizing Invariants..." : "Synthesize Survivable Schedule with AI"}</span>
        </button>

        {/* Proposal Results */}
        {proposal && (
          <div className="space-y-4 pt-4 border-t border-slate-200">
            {/* Real Engine Origin Pill */}
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between border ${
                proposal.isAiGenerated
                  ? "bg-purple-50 text-purple-900 border-purple-200"
                  : "bg-blue-50 text-blue-900 border-blue-200"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-[#0052CC]" />
                <span className="font-mono text-xs font-medium">{proposal.modelDetails}</span>
              </div>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-white border border-slate-200 shadow-xs">
                {proposal.isAiGenerated ? "OpenRouter AI (Live)" : "Deterministic Solver (Fallback)"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Generated Milestones:</span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Survivability Score: {proposal.survivabilityScore}/100
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {proposal.stages.map((stg: any, i: number) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-[11px] font-bold text-[#0052CC]">Stage {stg.sequenceIndex}</div>
                  <div className="text-sm font-semibold text-slate-900 truncate">{stg.title}</div>
                  <div className="font-mono text-base font-bold text-slate-900">
                    ${(stg.amountCents / 100).toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">Due: Day {stg.dueDayOffset}</div>
                </div>
              ))}
            </div>

            {/* Tradeoff Explanation */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700">
              <div>
                <strong className="text-slate-900 font-semibold">Customer Protection: </strong>
                {proposal.tradeoffs?.customerPerspective}
              </div>
              <div>
                <strong className="text-slate-900 font-semibold">Provider Protection: </strong>
                {proposal.tradeoffs?.providerPerspective}
              </div>
            </div>

            <button
              onClick={handleCommitVersion}
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Commit as Agreement Version 2 (Awaiting Bilateral Signatures)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
