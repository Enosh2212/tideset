"use client";

import React, { useState } from "react";
import {
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Lock,
  ArrowRight,
  Send,
  Sparkles,
  ExternalLink,
  ThumbsUp,
  Receipt,
  FileCheck2,
  DollarSign,
  AlertTriangle,
  Pause,
  Play,
  RotateCcw,
  RefreshCw,
  CheckSquare,
  Globe,
  GitBranch,
} from "lucide-react";

interface ProviderDashboardProps {
  agreement: any;
  onSubmitDeliverables: (stageId: string, notes: string, repoUrl?: string, previewUrl?: string) => void;
  onSendInvoice: (stageId: string) => void;
  onPauseStage: (stageId: string, reason: string) => void;
  onResumeStage: (stageId: string) => void;
  onResolveDispute: (stageId: string, choice: string) => void;
  onSyncInvoice: (invoiceId: string) => void;
  onApproveVersion: (versionNumber: number) => void;
  onOpenBuilder: () => void;
  onOpenSimulator: () => void;
  isProcessing: boolean;
}

export const ProviderDashboard: React.FC<ProviderDashboardProps> = ({
  agreement,
  onSubmitDeliverables,
  onSendInvoice,
  onPauseStage,
  onResumeStage,
  onResolveDispute,
  onSyncInvoice,
  onApproveVersion,
  onOpenBuilder,
  onOpenSimulator,
  isProcessing,
}) => {
  const [selectedStageForDelivery, setSelectedStageForDelivery] = useState<any | null>(null);
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [repoUrl, setRepoUrl] = useState("https://github.com/client-repo/storefront");
  const [previewUrl, setPreviewUrl] = useState("https://bakery-preview.vercel.app");
  const [selectedStageForPause, setSelectedStageForPause] = useState<any | null>(null);
  const [pauseReason, setPauseReason] = useState("");

  const currentVersion = agreement?.versions?.[0];
  const stages = currentVersion?.stages || [];

  const totalCents = agreement?.totalAmountCents || 60000;
  const verifiedSettledCents = stages
    .filter((s: any) =>
      ["PAYMENT_VERIFIED", "IN_PROGRESS", "SUBMITTED", "REVISION_REQUESTED", "ACCEPTED"].includes(
        s.status
      )
    )
    .reduce((acc: number, s: any) => acc + s.amountCents, 0);

  const isProviderApprovalPending = currentVersion?.providerApprovalState === "PENDING";

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Version Approval Alert (if new version drafted) */}
      {isProviderApprovalPending && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                Ratification Required
              </span>
              <h3 className="font-semibold text-slate-900 text-sm">
                Agreement Version {currentVersion?.versionNumber} Awaiting Provider Signature
              </h3>
            </div>
            <p className="text-xs text-slate-600">
              {currentVersion?.proposalSummary ||
                "A balanced schedule was created. Ratify this version to establish contract terms."}
            </p>
          </div>
          <button
            onClick={() => onApproveVersion(currentVersion.versionNumber)}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#0052CC] hover:bg-[#003D99] text-white shadow-sm transition-all flex items-center space-x-1.5 whitespace-nowrap"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>Ratify Version {currentVersion?.versionNumber}</span>
          </button>
        </div>
      )}

      {/* Provider Hero / Risk Exposure Protection Banner */}
      <section className="bg-white border-2 border-indigo-200 rounded-2xl p-6 sm:p-7 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 to-[#0052CC]" />

        <div className="max-w-3xl space-y-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span className="text-xs uppercase font-bold tracking-wider text-indigo-700">
              Provider Operational Protection Active
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Milestone Governance & Exposure Controls
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            TIDESET ensures you never commit uncollateralized labor. Work stages transition to
            &quot;Cleared to Begin&quot; strictly after PayPal payment is verified. Your maximum labor exposure is capped at <strong className="text-slate-900 font-semibold">$250.00</strong>.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={onOpenBuilder}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0052CC] hover:bg-[#003D99] text-white shadow-sm transition-all flex items-center space-x-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Propose New Agreement Scope</span>
            </button>
            <button
              onClick={onOpenSimulator}
              className="px-4 py-2.5 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-all flex items-center space-x-2"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Stress-Test Client Cash Flow</span>
            </button>
          </div>
        </div>
      </section>

      {/* Provider Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-medium text-slate-500">Total Contract Value</span>
          <div className="text-2xl font-bold text-slate-900">
            ${(totalCents / 100).toFixed(2)}
          </div>
          <span className="text-xs text-slate-500 block">Full 3-stage delivery value</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-medium text-slate-500">Verified Funds Received</span>
          <div className="text-2xl font-bold text-emerald-600">
            ${(verifiedSettledCents / 100).toFixed(2)}
          </div>
          <span className="text-xs text-emerald-700 font-medium block">Authoritatively settled via PayPal</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-medium text-slate-500">Exposure Limit Setting</span>
          <div className="text-2xl font-bold text-[#0052CC]">$250.00</div>
          <span className="text-xs text-slate-500 block">Max unbilled labor risk allowed</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-medium text-slate-500">Current Labor at Risk</span>
          <div className="text-2xl font-bold text-emerald-600">$0.00</div>
          <span className="text-xs text-emerald-700 font-medium block">100% of active work is fully funded</span>
        </div>
      </section>

      {/* Delivery Pipeline */}
      <section className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Work Delivery Pipeline & Stage Status
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Only begin work on milestones showing &quot;Payment Verified&quot;. Submit deliverables when ready for Elena to review.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {stages.map((stage: any, index: number) => {
            const isVerified = ["PAYMENT_VERIFIED", "IN_PROGRESS"].includes(stage.status);
            const isSubmitted = stage.status === "SUBMITTED";
            const isAccepted = stage.status === "ACCEPTED";
            const isRevision = stage.status === "REVISION_REQUESTED";
            const isPayable = stage.status === "PAYMENT_PENDING";
            const isLocked = stage.status === "LOCKED";
            const isPaused = stage.status === "PAUSED";
            const isDisputed = stage.status === "DISPUTED";

            let criteriaList: string[] = [];
            if (stage.acceptanceCriteria) {
              try {
                criteriaList = JSON.parse(stage.acceptanceCriteria);
              } catch {
                criteriaList = [];
              }
            }

            return (
              <div
                key={stage.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isVerified || isRevision
                    ? "bg-blue-50/40 border-[#0052CC]/40 shadow-sm"
                    : isAccepted
                    ? "bg-slate-50/60 border-slate-200"
                    : isPaused
                    ? "bg-amber-50/40 border-amber-200"
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
                          <span>Accepted by Client</span>
                        </span>
                      )}
                      {isSubmitted && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Client Review Pending</span>
                        </span>
                      )}
                      {isRevision && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 flex items-center space-x-1">
                          <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                          <span>Revision Requested by Client</span>
                        </span>
                      )}
                      {isPaused && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 flex items-center space-x-1">
                          <Pause className="w-3.5 h-3.5" />
                          <span>Paused</span>
                        </span>
                      )}
                      {isDisputed && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                          Disputed
                        </span>
                      )}
                      {isVerified && (
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
                              ? "Cleared: REAL SANDBOX VERIFIED"
                              : "Cleared: SIMULATED LOCAL TEST"}
                          </span>
                        </span>
                      )}
                      {isPayable && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          Awaiting Client Settlement
                        </span>
                      )}
                      {isLocked && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                          Locked
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600">{stage.description}</p>

                    {/* Agreed Acceptance Criteria */}
                    {criteriaList.length > 0 && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                        <span className="text-[11px] uppercase font-bold tracking-wider text-slate-700 flex items-center space-x-1.5">
                          <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Agreed Delivery Criteria:</span>
                        </span>
                        <ul className="text-xs text-slate-600 list-disc list-inside space-y-0.5">
                          {criteriaList.map((crit: string, i: number) => (
                            <li key={i}>{crit}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {stage.revisionNotes && (
                      <div className="text-xs bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-amber-900">
                        <strong>Client Feedback:</strong> {stage.revisionNotes}
                      </div>
                    )}

                    {stage.disputeReason && (
                      <div className="text-xs bg-rose-50 border border-rose-200 p-3 rounded-xl text-rose-900 space-y-1">
                        <div><strong>Formal Dispute Opened:</strong> {stage.disputeReason}</div>
                        {isDisputed && (
                          <div className="pt-1.5 flex gap-2">
                            <button
                              onClick={() => onResolveDispute(stage.id, "RESUME_WORK")}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs"
                            >
                              Agree to Revise & Resume Work
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

                    {stage.pausedReason && (
                      <div className="text-xs bg-amber-50 border border-amber-200 p-2 rounded-xl text-amber-900">
                        <strong>Paused Reason:</strong> {stage.pausedReason}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                      <span>Target Delivery: {new Date(stage.deliveryDate).toLocaleDateString()}</span>
                      {stage.paypalInvoiceId && (
                        <span className="text-[#0052CC] font-medium flex items-center space-x-1">
                          <span>PayPal Invoice: {stage.paypalInvoiceId}</span>
                          <button
                            onClick={() => onSyncInvoice(stage.paypalInvoiceId)}
                            className="p-0.5 hover:text-blue-900"
                            title="Poll PayPal Sandbox status"
                          >
                            <RefreshCw className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center space-y-2">
                    <span className="text-2xl font-bold text-slate-900">
                      ${(stage.amountCents / 100).toFixed(2)}
                    </span>

                    {/* Action 1: Submit or re-submit deliverables */}
                    {(isVerified || isRevision) && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedStageForDelivery(stage)}
                          disabled={isProcessing}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center space-x-1.5"
                        >
                          <FileCheck2 className="w-3.5 h-3.5" />
                          <span>{isRevision ? "Re-submit Work" : "Submit Deliverables"}</span>
                        </button>
                        <button
                          onClick={() => setSelectedStageForPause(stage)}
                          disabled={isProcessing}
                          className="px-3 py-2 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
                          title="Temporarily pause work on this stage"
                        >
                          Pause
                        </button>
                      </div>
                    )}

                    {isPaused && (
                      <button
                        onClick={() => onResumeStage(stage.id)}
                        disabled={isProcessing}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0052CC] text-white shadow-sm flex items-center space-x-1"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Resume Work</span>
                      </button>
                    )}

                    {/* Action 2: Send official PayPal Invoicing v2 bill */}
                    {isPayable && !stage.paypalInvoiceId && (
                      <button
                        onClick={() => onSendInvoice(stage.id)}
                        disabled={isProcessing}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#0070BA] hover:bg-[#005ea6] text-white shadow-sm transition-all flex items-center space-x-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send PayPal Invoice</span>
                      </button>
                    )}

                    {isPayable && stage.paypalInvoiceId && (
                      <div className="text-right space-y-1">
                        <span className="text-xs text-amber-700 font-medium block">Invoice Sent (Unpaid)</span>
                        <button
                          onClick={() => onSyncInvoice(stage.paypalInvoiceId)}
                          disabled={isProcessing}
                          className="text-xs text-[#0052CC] hover:underline flex items-center space-x-1 justify-end"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Check Payment</span>
                        </button>
                      </div>
                    )}

                    {isSubmitted && (
                      <span className="text-xs text-amber-800 font-medium bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        Awaiting Client Acceptance
                      </span>
                    )}

                    {isLocked && (
                      <span className="text-xs text-slate-400">Locked until previous stage completes</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Modal: Submit Deliverables */}
      {selectedStageForDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white max-w-lg w-full rounded-2xl p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Submit Deliverables for {selectedStageForDelivery.title}
            </h3>
            <p className="text-xs text-slate-600">
              Provide evidence against the agreed acceptance criteria. Elena will have a 5-day review window.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-700 font-medium">Deliverables Summary Notes:</label>
                <textarea
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Completed initial architecture and responsive UI layout."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-[#0052CC] focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="text-xs text-slate-700 font-medium">Code Repository URL (Optional):</label>
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="text-xs text-slate-700 font-medium">Live Preview / Staging URL (Optional):</label>
                <input
                  type="text"
                  value={previewUrl}
                  onChange={(e) => setPreviewUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0052CC]"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setSelectedStageForDelivery(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onSubmitDeliverables(selectedStageForDelivery.id, deliveryNotes, repoUrl, previewUrl);
                  setSelectedStageForDelivery(null);
                  setDeliveryNotes("");
                }}
                disabled={isProcessing}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center space-x-1.5"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Submit with Evidence</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Pause Work */}
      {selectedStageForPause && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Pause Work on {selectedStageForPause.title}
            </h3>
            <p className="text-xs text-slate-600">
              Document why work is being temporarily paused (e.g. waiting for client API credentials, brand asset approvals, etc.).
            </p>
            <textarea
              value={pauseReason}
              onChange={(e) => setPauseReason(e.target.value)}
              placeholder="e.g. Awaiting client domain DNS records and bakery image assets..."
              rows={3}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-[#0052CC]"
            />
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setSelectedStageForPause(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onPauseStage(selectedStageForPause.id, pauseReason);
                  setSelectedStageForPause(null);
                  setPauseReason("");
                }}
                disabled={isProcessing}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
              >
                Confirm Pause
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
