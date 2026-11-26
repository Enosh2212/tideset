"use client";

import React, { useState } from "react";
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Lock,
  ArrowRight,
  Sliders,
  ExternalLink,
  Sparkles,
  AlertCircle,
  FileText,
  ThumbsUp,
  Receipt,
  RotateCcw,
  AlertTriangle,
  CheckSquare,
  Globe,
  GitBranch,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react";

interface CustomerDashboardProps {
  agreement: any;
  onPayStage: (stage: any) => void;
  onAcceptStage: (stageId: string) => void;
  onRequestRevision: (stageId: string, notes: string) => void;
  onRaiseDispute: (stageId: string, reason: string, resolution?: string) => void;
  onResolveDispute: (stageId: string, choice: string) => void;
  onApproveVersion: (versionNumber: number) => void;
  onOpenSimulator: () => void;
  onOpenBuilder: () => void;
  isProcessing: boolean;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  agreement,
  onPayStage,
  onAcceptStage,
  onRequestRevision,
  onRaiseDispute,
  onResolveDispute,
  onApproveVersion,
  onOpenSimulator,
  onOpenBuilder,
  isProcessing,
}) => {
  const [selectedRevisionStage, setSelectedRevisionStage] = useState<any | null>(null);
  const [revisionNotes, setRevisionNotes] = useState("");
  const [selectedDisputeStage, setSelectedDisputeStage] = useState<any | null>(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeResolution, setDisputeResolution] = useState("REVISE_WITHOUT_CHARGE");
  const [isAuditOpen, setIsAuditOpen] = useState(false);

  const currentVersion = agreement?.versions?.[0];
  const stages = currentVersion?.stages || [];

  const totalCents = agreement?.totalAmountCents || 60000;
  const paidCents = stages
    .filter((s: any) =>
      ["PAYMENT_VERIFIED", "IN_PROGRESS", "SUBMITTED", "REVISION_REQUESTED", "ACCEPTED"].includes(
        s.status
      )
    )
    .reduce((acc: number, s: any) => acc + s.amountCents, 0);

  const pendingPayableStage = stages.find((s: any) => s.status === "PAYMENT_PENDING");
  const submittedStage = stages.find((s: any) => s.status === "SUBMITTED");

  const isCustomerApprovalPending = currentVersion?.customerApprovalState === "PENDING";

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Version Approval Alert (if new version drafted) */}
      {isCustomerApprovalPending && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                Action Required
              </span>
              <h3 className="font-semibold text-slate-900 text-sm">
                Agreement Version {currentVersion?.versionNumber} Awaiting Your Approval
              </h3>
            </div>
            <p className="text-xs text-slate-600">
              {currentVersion?.proposalSummary ||
                "A revised payment & delivery schedule has been prepared. Review terms before signing."}
            </p>
          </div>
          <button
            onClick={() => onApproveVersion(currentVersion.versionNumber)}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#0052CC] hover:bg-[#003D99] text-white shadow-sm transition-all flex items-center space-x-1.5 whitespace-nowrap"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>Approve Version {currentVersion?.versionNumber}</span>
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 1: CURRENT ACTION (Payment-First Focus) */}
      {/* ======================================================== */}
      <section className="bg-white border-2 border-[#0052CC]/20 rounded-2xl p-6 sm:p-7 shadow-sm relative overflow-hidden">
        {/* Subtle accent highlight bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0052CC] to-[#0070BA]" />

        <div className="max-w-3xl space-y-4">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0052CC] animate-pulse" />
            <span className="text-xs uppercase font-bold tracking-wider text-[#0052CC]">
              Your Next Action
            </span>
          </div>

          {submittedStage ? (
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200">
                  Deliverables Awaiting Review
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Review Deliverables for {submittedStage.title}
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                Marcus has submitted milestone work. Inspect the deliverable evidence against agreed criteria below.
                {submittedStage.reviewDeadline && (
                  <span className="text-amber-800 block font-medium mt-1">
                    Review Deadline: {new Date(submittedStage.reviewDeadline).toLocaleDateString()}
                  </span>
                )}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onAcceptStage(submittedStage.id)}
                  disabled={isProcessing}
                  className="px-6 py-3 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Accept Milestone Deliverables</span>
                </button>
                <button
                  onClick={() => setSelectedRevisionStage(submittedStage)}
                  disabled={isProcessing}
                  className="px-4 py-3 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-all flex items-center space-x-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                  <span>Request Revisions</span>
                </button>
                <button
                  onClick={() => setSelectedDisputeStage(submittedStage)}
                  disabled={isProcessing}
                  className="px-3.5 py-3 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-all flex items-center space-x-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Raise Dispute</span>
                </button>
              </div>
            </div>
          ) : pendingPayableStage ? (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  Pay Stage 1: ${(pendingPayableStage.amountCents / 100).toFixed(2)} USD
                </h2>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#0052CC] border border-blue-200 flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Ready for Payment</span>
                </span>
              </div>

              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Pay <strong className="text-slate-900 font-semibold">{pendingPayableStage.title}</strong> through PayPal Sandbox. Payment verification and deliverable review are tracked separately.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onPayStage(pendingPayableStage)}
                  disabled={isProcessing}
                  className="px-7 py-3.5 rounded-xl text-sm font-bold bg-[#0070BA] hover:bg-[#005ea6] text-white shadow-md hover:shadow-lg transition-all flex items-center space-x-2.5"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Pay ${(pendingPayableStage.amountCents / 100).toFixed(2)} with PayPal Sandbox</span>
                </button>

                {pendingPayableStage.paypalInvoiceUrl && (
                  <a
                    href={pendingPayableStage.paypalInvoiceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-3 rounded-xl text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-all flex items-center space-x-2 shadow-sm"
                  >
                    <Receipt className="w-4 h-4 text-slate-500" />
                    <span>View Official PayPal Invoice</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                )}

                {/* Secondary non-competing action */}
                <button
                  onClick={onOpenSimulator}
                  className="px-4 py-3 rounded-xl text-xs font-medium bg-transparent hover:bg-slate-100 text-slate-600 border border-slate-300 transition-all flex items-center space-x-1.5"
                  title="Simulate cash-flow changes without altering real contracts"
                >
                  <Sliders className="w-3.5 h-3.5 text-slate-500" />
                  <span>Simulate Income Delay</span>
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  All Milestones Current
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                All Current Milestones Up To Date!
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                Marcus is currently actively working on the cleared milestones. You will be notified as soon as deliverables are ready for your review.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 2: AGREEMENT SUMMARY (Clear Metric Cards) */}
      {/* ======================================================== */}
      <section className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
          Agreement Summary
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-medium text-slate-500">Total Agreement Price</span>
            <div className="text-2xl font-bold text-slate-900">
              ${(totalCents / 100).toFixed(2)}
            </div>
            <span className="text-xs text-slate-500 block">Fixed contract sum (0% hidden fees)</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-medium text-slate-500">Paid So Far</span>
            <div className="text-2xl font-bold text-[#0052CC]">
              ${(paidCents / 100).toFixed(2)}
            </div>
            <span className="text-xs text-blue-700 font-medium block">
              {totalCents > 0
                ? `${Math.round((paidCents / totalCents) * 100)}% Settled via PayPal`
                : "0% Settled"}
            </span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-medium text-slate-500">Money Left After Payment</span>
            <div className="text-2xl font-bold text-emerald-600">+$10.00</div>
            <span className="text-xs text-slate-500 block">Liquid reserves never dip below zero</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-medium text-slate-500">Budget Safety Score</span>
            <div className="text-2xl font-bold text-emerald-600 flex items-center space-x-1.5">
              <span>98 / 100</span>
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="text-xs text-slate-500 block">Optimized against Day 14 paycheck</span>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 3: MILESTONES (Clean Stacked Pipeline) */}
      {/* ======================================================== */}
      <section className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Agreement Milestone Pipeline & Two-Way Protection
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Each stage is strictly gated: work begins only after PayPal settlement is verified. Deliverables are inspected against agreed criteria.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-auto">
            Version {currentVersion?.versionNumber || 1} Active
          </span>
        </div>

        <div className="space-y-4">
          {stages.map((stage: any, index: number) => {
            const isPaid = [
              "PAYMENT_VERIFIED",
              "IN_PROGRESS",
              "SUBMITTED",
              "REVISION_REQUESTED",
              "ACCEPTED",
            ].includes(stage.status);
            const isPayable = stage.status === "PAYMENT_PENDING";
            const isLocked = stage.status === "LOCKED";
            const isSubmitted = stage.status === "SUBMITTED";
            const isAccepted = stage.status === "ACCEPTED";
            const isRevision = stage.status === "REVISION_REQUESTED";
            const isDisputed = stage.status === "DISPUTED";
            const isPaused = stage.status === "PAUSED";

            let criteriaList: string[] = [];
            if (stage.acceptanceCriteria) {
              try {
                criteriaList = JSON.parse(stage.acceptanceCriteria);
              } catch {
                criteriaList = [];
              }
            }

            let evidenceObj: any = null;
            if (stage.deliverableEvidence) {
              try {
                evidenceObj = JSON.parse(stage.deliverableEvidence);
              } catch {
                evidenceObj = null;
              }
            }

            return (
              <div
                key={stage.id}
                className={`p-5 rounded-2xl transition-all border ${
                  isPayable
                    ? "bg-blue-50/40 border-[#0052CC]/40 shadow-sm"
                    : isPaid
                    ? "bg-slate-50/60 border-slate-200"
                    : "bg-slate-50/30 border-slate-200 opacity-60"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2.5 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                        {index + 1}
                      </span>
                      <h4 className="font-bold text-slate-900 text-base">{stage.title}</h4>

                      {isAccepted && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Delivered & Accepted</span>
                        </span>
                      )}
                      {isSubmitted && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 flex items-center space-x-1">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Deliverables Submitted</span>
                        </span>
                      )}
                      {isRevision && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 flex items-center space-x-1">
                          <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                          <span>Revision Requested</span>
                        </span>
                      )}
                      {isDisputed && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 flex items-center space-x-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Milestone Disputed</span>
                        </span>
                      )}
                      {isPaused && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200">
                          Work Paused
                        </span>
                      )}
                      {isPaid && !isSubmitted && !isAccepted && !isRevision && !isDisputed && !isPaused && (
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border flex items-center space-x-1 ${
                            stage.paymentRecords?.[0]?.settlementType === "REAL_SANDBOX_PAYPAL"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-blue-50 text-blue-800 border-blue-200"
                          }`}
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>
                            {stage.paymentRecords?.[0]?.settlementType === "REAL_SANDBOX_PAYPAL"
                              ? "REAL SANDBOX PAYMENT VERIFIED"
                              : "SIMULATED LOCAL TEST"}
                          </span>
                        </span>
                      )}
                      {isPayable && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#0052CC] border border-blue-200 flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Ready for Payment</span>
                        </span>
                      )}
                      {isLocked && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200 flex items-center space-x-1">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Locked</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{stage.description}</p>

                    {/* Agreed Acceptance Criteria */}
                    {criteriaList.length > 0 && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                        <span className="text-[11px] uppercase font-bold tracking-wider text-slate-700 flex items-center space-x-1.5">
                          <CheckSquare className="w-3.5 h-3.5 text-[#0052CC]" />
                          <span>Agreed Acceptance Criteria:</span>
                        </span>
                        <ul className="text-xs text-slate-600 list-disc list-inside space-y-0.5">
                          {criteriaList.map((crit: string, i: number) => (
                            <li key={i}>{crit}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Deliverable Evidence */}
                    {evidenceObj && (
                      <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 space-y-1 text-xs">
                        <span className="font-semibold text-blue-900">Deliverable Evidence:</span>
                        <p className="text-slate-700 text-xs">{evidenceObj.notes}</p>
                        <div className="flex flex-wrap gap-3 pt-1 text-xs">
                          {evidenceObj.repoUrl && (
                            <a
                              href={evidenceObj.repoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#0052CC] font-medium hover:underline flex items-center space-x-1"
                            >
                              <GitBranch className="w-3.5 h-3.5" />
                              <span>View Code Repository</span>
                            </a>
                          )}
                          {evidenceObj.previewUrl && (
                            <a
                              href={evidenceObj.previewUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-700 font-medium hover:underline flex items-center space-x-1"
                            >
                              <Globe className="w-3.5 h-3.5" />
                              <span>Live Preview Link</span>
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {stage.revisionNotes && (
                      <div className="text-xs bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-amber-900">
                        <strong>Revision Request:</strong> {stage.revisionNotes}
                      </div>
                    )}

                    {stage.disputeReason && (
                      <div className="text-xs bg-rose-50 border border-rose-200 p-3 rounded-xl text-rose-900 space-y-1">
                        <div><strong>Formal Dispute:</strong> {stage.disputeReason}</div>
                        <p className="text-[11px] text-slate-500">
                          Notice: TIDESET facilitates bilateral dispute resolution and does not unilaterally judge creative quality.
                        </p>
                        {isDisputed && (
                          <div className="pt-1.5 flex gap-2">
                            <button
                              onClick={() => onResolveDispute(stage.id, "RESUME_WORK")}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs"
                            >
                              Resolve & Resume Work
                            </button>
                            <button
                              onClick={() => onResolveDispute(stage.id, "MUTUAL_CANCELLATION")}
                              className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-xs"
                            >
                              Mutual Cancellation
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center space-x-4 text-xs text-slate-500 pt-1">
                      <span>Due: {new Date(stage.dueDate).toLocaleDateString()}</span>
                      <span>Target Delivery: {new Date(stage.deliveryDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center space-y-2">
                    <span className="text-2xl font-bold text-slate-900">
                      ${(stage.amountCents / 100).toFixed(2)}
                    </span>

                    {isPayable && (
                      <button
                        onClick={() => onPayStage(stage)}
                        disabled={isProcessing}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0070BA] hover:bg-[#005ea6] text-white shadow-sm flex items-center space-x-2 transition-all"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Pay with PayPal</span>
                      </button>
                    )}

                    {isSubmitted && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => onAcceptStage(stage.id)}
                          disabled={isProcessing}
                          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center space-x-1"
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => setSelectedRevisionStage(stage)}
                          disabled={isProcessing}
                          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
                        >
                          Revise
                        </button>
                      </div>
                    )}

                    {isPaid && !isSubmitted && !isAccepted && !isRevision && !isDisputed && (
                      <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        Provider Working
                      </span>
                    )}

                    {isLocked && (
                      <span className="text-xs text-slate-400">Locked until Stage {index} complete</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 4: PROTECTION / TRUST (Paytm-style Assurance) */}
      {/* ======================================================== */}
      <section className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-4">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-[#0052CC]" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            TIDESET 100% Protection & Trust Guarantee
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1.5">
            <div className="flex items-center space-x-1.5 font-bold text-xs text-slate-900">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Zero-Exposure Escrow</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your money is locked safely per milestone. Provider starts work immediately, but funds are only disbursed after you inspect and accept deliverables.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1.5">
            <div className="flex items-center space-x-1.5 font-bold text-xs text-slate-900">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Fair Review & Revisions</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every stage includes a 5-day inspection window. Request revisions directly against agreed criteria without surprise billing or scope arguments.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1.5">
            <div className="flex items-center space-x-1.5 font-bold text-xs text-slate-900">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Provider Payment Guarantee</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Providers are guaranteed verified funding before investing hours of design or coding. Milestone criteria cannot be altered without mutual approval.
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 5: AUDIT / HISTORY (Collapsed Timeline) */}
      {/* ======================================================== */}
      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <button
          onClick={() => setIsAuditOpen(!isAuditOpen)}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center space-x-2.5">
            <FileText className="w-4 h-4 text-[#0052CC]" />
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Audit Trail & Milestone Activity History
              </h4>
              <p className="text-xs text-slate-500">
                Immutable record of contract versioning, PayPal settlements, and milestone submissions
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs font-medium text-[#0052CC]">
            <span>{isAuditOpen ? "Hide History" : "View History"}</span>
            {isAuditOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {isAuditOpen && (
          <div className="p-5 border-t border-slate-200 bg-slate-50/50 space-y-3">
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900">Contract Version 1 Activated</span>
                  <p className="text-slate-500 text-[11px]">3 milestones initialized with PayPal Orders v2 integration.</p>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">11/02/2026</span>
              </div>
              {stages.some((s: any) => s.status === "ACCEPTED") && (
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-emerald-700">Stage 1 Accepted & Completed</span>
                    <p className="text-slate-500 text-[11px]">Elena accepted deliverables after responsive contrast adjustments.</p>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">11/02/2026</span>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Modal: Request Revision */}
      {selectedRevisionStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Request Revision for {selectedRevisionStage.title}
            </h3>
            <p className="text-xs text-slate-600">
              Explain clearly what needs adjustment against the agreed criteria. Marcus will be notified and can update deliverables without resetting contract terms.
            </p>
            <textarea
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              placeholder="e.g. Please update the hero CTA button contrast ratio to 7:1..."
              rows={4}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-[#0052CC] focus:ring-2 focus:ring-blue-100"
            />
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setSelectedRevisionStage(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onRequestRevision(selectedRevisionStage.id, revisionNotes);
                  setSelectedRevisionStage(null);
                  setRevisionNotes("");
                }}
                disabled={isProcessing}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0052CC] hover:bg-[#003D99] text-white shadow-sm"
              >
                Submit Revision Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Raise Dispute */}
      {selectedDisputeStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-rose-600">
              Raise Milestone Dispute for {selectedDisputeStage.title}
            </h3>
            <p className="text-xs text-slate-600">
              Opening a formal dispute freezes further work and triggers resolution protocols. TIDESET facilitates mutual bilateral resolution and does not unilaterally judge creative quality.
            </p>
            <textarea
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="Describe the reason for dispute..."
              rows={3}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
            />
            <div className="space-y-1">
              <label className="text-xs text-slate-700 font-medium">Proposed Resolution:</label>
              <select
                value={disputeResolution}
                onChange={(e) => setDisputeResolution(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
              >
                <option value="REVISE_WITHOUT_CHARGE">Provider revises work without additional charges</option>
                <option value="MUTUAL_CANCELLATION">Mutual cancellation and project closure</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setSelectedDisputeStage(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onRaiseDispute(selectedDisputeStage.id, disputeReason, disputeResolution);
                  setSelectedDisputeStage(null);
                  setDisputeReason("");
                }}
                disabled={isProcessing}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
              >
                Confirm Open Dispute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
