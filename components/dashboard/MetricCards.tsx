"use client";

import React from "react";

interface MetricCardsProps {
  activeCount: number;
  completedCount: number;
  awaitingActionCount: number;
  verifiedSettledCents: number;
  simulatedSettledCents?: number;
  pendingPipelineCents: number;
  upcomingStagesCount: number;
  onNavigateTab?: (tab: "agreements" | "payments" | "deliverables" | "activity") => void;
}

export function MetricCards({
  activeCount,
  completedCount,
  awaitingActionCount,
  verifiedSettledCents,
  simulatedSettledCents = 0,
  pendingPipelineCents,
  upcomingStagesCount,
  onNavigateTab,
}: MetricCardsProps) {
  const formattedSettled = (verifiedSettledCents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formattedPending = (pendingPipelineCents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formattedSimulated = (simulatedSettledCents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80 py-4 border-y border-slate-200/80">
      {/* 1. Active Agreements */}
      <button
        type="button"
        onClick={() => onNavigateTab?.("agreements")}
        className="px-4 py-2 sm:py-0 first:pl-0 text-left group transition-colors focus:outline-hidden"
      >
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Active agreements
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1 group-hover:text-blue-600 transition-colors">
          {activeCount}
        </div>
        <div className="text-xs text-slate-400 mt-0.5">
          {completedCount === 1 ? "1 completed agreement" : `${completedCount} completed agreements`}
        </div>
      </button>

      {/* 2. Needs Attention */}
      <div className="px-4 py-2 sm:py-0 text-left">
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Needs attention
        </div>
        <div
          className={`text-2xl sm:text-3xl font-bold tracking-tight mt-1 ${
            awaitingActionCount > 0 ? "text-amber-600" : "text-slate-900"
          }`}
        >
          {awaitingActionCount}
        </div>
        <div className="text-xs text-slate-400 mt-0.5">
          {awaitingActionCount === 0
            ? "All tasks up to date"
            : awaitingActionCount === 1
            ? "1 task requires response"
            : `${awaitingActionCount} tasks require response`}
        </div>
      </div>

      {/* 3. Verified Payments */}
      <button
        type="button"
        onClick={() => onNavigateTab?.("payments")}
        className="px-4 py-2 sm:py-0 text-left group transition-colors focus:outline-hidden"
      >
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <span>Verified payments</span>
          {verifiedSettledCents > 0 && (
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
          )}
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1 font-mono group-hover:text-blue-600 transition-colors">
          ${formattedSettled}
        </div>
        <div className="text-xs text-slate-400 mt-0.5">
          {verifiedSettledCents > 0 ? (
            <span className="text-emerald-700 font-medium">Live PayPal capture</span>
          ) : (
            "USD captured via PayPal"
          )}
          {simulatedSettledCents > 0 && (
            <span className="block text-[10px] text-slate-400 mt-0.5">
              (${formattedSimulated} local test fixtures)
            </span>
          )}
        </div>
      </button>

      {/* 4. Upcoming Milestones */}
      <div className="px-4 py-2 sm:py-0 text-left">
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Upcoming milestones
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1 font-mono">
          ${formattedPending}
        </div>
        <div className="text-xs text-slate-400 mt-0.5">
          {upcomingStagesCount === 1 ? "1 scheduled stage" : `${upcomingStagesCount} scheduled stages`}
        </div>
      </div>
    </div>
  );
}
