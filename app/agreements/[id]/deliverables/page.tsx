"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppNavbar } from "@/components/AppNavbar";
import {
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  Clock,
  RotateCcw,
  MessageSquare,
  ShieldCheck,
  Send,
} from "lucide-react";

export default function AgreementDeliverablesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [user, setUser] = useState<any | null>(null);
  const [agreement, setAgreement] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Deliverables submission form
  const [activeStageId, setActiveStageId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  // Revision request form
  const [revisionStageId, setRevisionStageId] = useState<string | null>(null);
  const [revisionFeedback, setRevisionFeedback] = useState("");

  const fetchAgreement = async () => {
    try {
      const res = await fetch(`/api/agreements/${id}`);
      const data = await res.json();
      if (data.success) {
        setAgreement(data.agreement);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push("/login");
        } else {
          setUser(data.user);
          fetchAgreement();
        }
      })
      .catch(() => router.push("/login"));
  }, [id, router]);

  const handleSubmitDeliverables = async (stageId: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/stages/${stageId}/deliver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliverablesNotes: notes,
          repoUrl,
          previewUrl,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActiveStageId(null);
        setNotes("");
        setRepoUrl("");
        setPreviewUrl("");
        await fetchAgreement();
      } else {
        alert(data.error);
      }
    } catch {
      alert("Failed to submit deliverables.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAcceptStage = async (stageId: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/stages/${stageId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.success) {
        await fetchAgreement();
      } else {
        alert(data.error);
      }
    } catch {
      alert("Failed to accept stage.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestRevision = async (stageId: string) => {
    if (!revisionFeedback.trim()) {
      alert("Please provide revision feedback notes.");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch(`/api/stages/${stageId}/revision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revisionNotes: revisionFeedback }),
      });
      const data = await res.json();
      if (data.success) {
        setRevisionStageId(null);
        setRevisionFeedback("");
        await fetchAgreement();
      } else {
        alert(data.error);
      }
    } catch {
      alert("Failed to submit revision request.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <AppNavbar user={user} />
        <main className="flex-1 flex flex-col items-center justify-center p-8 space-y-3">
          <RefreshCw className="w-8 h-8 text-[#0052CC] animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading deliverables...</p>
        </main>
      </div>
    );
  }

  const currentVersion = agreement?.versions?.[0];
  const stages = currentVersion?.stages || [];
  const myParticipant = agreement?.participants?.find((p: any) => p.userId === user?.id);
  const myRole = myParticipant ? myParticipant.role : agreement?.customerId === user?.id ? "CUSTOMER" : "PROVIDER";
  const isProvider = myRole === "PROVIDER";
  const isCustomer = myRole === "CUSTOMER";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <AppNavbar user={user} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8 space-y-6">
        <div className="flex items-center space-x-3">
          <Link
            href={`/agreements/${id}`}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-xs"
            title="Back to agreement overview"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Deliverables & Verification Review
            </h1>
            <p className="text-xs text-slate-500">
              Provider work submissions, 5-day inspection windows, and structured revision tracking.
            </p>
          </div>
        </div>

        {/* Milestone Deliverables List */}
        <div className="space-y-4">
          {stages.map((stage: any) => {
            let evidence: any = null;
            if (stage.deliverableEvidence) {
              try {
                evidence = JSON.parse(stage.deliverableEvidence);
              } catch {}
            }

            const canSubmit =
              isProvider &&
              (stage.status === "PAYMENT_VERIFIED" ||
                stage.status === "IN_PROGRESS" ||
                stage.status === "REVISION_REQUESTED");

            const canReview = isCustomer && stage.status === "SUBMITTED";

            return (
              <div
                key={stage.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center border border-slate-200">
                      {stage.sequenceIndex}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{stage.title}</h3>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase self-start sm:self-auto ${
                      stage.status === "ACCEPTED"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : stage.status === "SUBMITTED"
                        ? "bg-purple-50 text-purple-700 border border-purple-200"
                        : stage.status === "REVISION_REQUESTED"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : stage.status === "PAYMENT_VERIFIED"
                        ? "bg-blue-50 text-[#0052CC] border border-blue-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {stage.status}
                  </span>
                </div>

                {/* Evidence Details if submitted */}
                {evidence ? (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="font-semibold text-slate-800">Submitted Deliverable Evidence:</div>
                    <p className="text-slate-600 leading-relaxed font-mono text-[11px] bg-white p-2.5 rounded-lg border border-slate-200">
                      {evidence.notes}
                    </p>

                    <div className="flex flex-wrap gap-3 pt-1">
                      {evidence.repoUrl && (
                        <a
                          href={evidence.repoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#0052CC] font-semibold flex items-center space-x-1 hover:underline"
                        >
                          <span>Repository Link</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {evidence.previewUrl && (
                        <a
                          href={evidence.previewUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#0052CC] font-semibold flex items-center space-x-1 hover:underline"
                        >
                          <span>Live Preview URL</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    {stage.reviewDeadline && (
                      <div className="text-[11px] text-slate-500 pt-1 flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>5-Day Review Deadline: {new Date(stage.reviewDeadline).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500">
                    No deliverables submitted yet for this milestone stage.
                  </div>
                )}

                {/* Revision Notes if in revision requested */}
                {stage.status === "REVISION_REQUESTED" && stage.revisionNotes && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-1 text-xs">
                    <div className="font-bold text-rose-800 flex items-center space-x-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Client Requested Revisions:</span>
                    </div>
                    <p className="text-rose-900 leading-relaxed">{stage.revisionNotes}</p>
                  </div>
                )}

                {/* Customer Review Controls */}
                {canReview && (
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleAcceptStage(stage.id)}
                      disabled={isProcessing}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-60"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Accept Deliverables</span>
                    </button>

                    <button
                      onClick={() => setRevisionStageId(revisionStageId === stage.id ? null : stage.id)}
                      disabled={isProcessing}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                      <span>Request Revisions</span>
                    </button>
                  </div>
                )}

                {/* Revision Feedback Input Drawer */}
                {revisionStageId === stage.id && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 pt-3">
                    <div className="text-xs font-semibold text-slate-800">
                      Explain required adjustments according to agreed acceptance criteria:
                    </div>
                    <textarea
                      rows={2}
                      value={revisionFeedback}
                      onChange={(e) => setRevisionFeedback(e.target.value)}
                      placeholder="e.g. Please update the navigation bar contrast and add mobile touch targets..."
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC]"
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setRevisionStageId(null)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleRequestRevision(stage.id)}
                        disabled={isProcessing}
                        className="px-4 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                      >
                        Submit Revision Request
                      </button>
                    </div>
                  </div>
                )}

                {/* Provider Submission Button / Drawer */}
                {canSubmit && (
                  <div className="pt-2">
                    {activeStageId !== stage.id ? (
                      <button
                        onClick={() => setActiveStageId(stage.id)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0052CC] hover:bg-[#0047B3] text-white shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>
                          {stage.status === "REVISION_REQUESTED" ? "Re-submit Work" : "Submit Deliverables"}
                        </span>
                      </button>
                    ) : (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                        <div className="text-xs font-bold text-slate-800">
                          Submit Work Evidence for {stage.title}
                        </div>

                        <div className="space-y-2">
                          <div>
                            <label className="text-[11px] font-semibold text-slate-600">
                              Work Notes & Summary
                            </label>
                            <textarea
                              rows={2}
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder="Describe deliverables and how acceptance criteria are met..."
                              className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC]"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="text-[11px] font-semibold text-slate-600">
                                Repository URL (Optional)
                              </label>
                              <input
                                type="url"
                                value={repoUrl}
                                onChange={(e) => setRepoUrl(e.target.value)}
                                placeholder="https://github.com/org/repo"
                                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-semibold text-slate-600">
                                Live Preview URL (Optional)
                              </label>
                              <input
                                type="url"
                                value={previewUrl}
                                onChange={(e) => setPreviewUrl(e.target.value)}
                                placeholder="https://preview.domain.com"
                                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end space-x-2 pt-1">
                          <button
                            onClick={() => setActiveStageId(null)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSubmitDeliverables(stage.id)}
                            disabled={isProcessing}
                            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#0052CC] hover:bg-[#0047B3] text-white shadow-xs"
                          >
                            <span>{isProcessing ? "Submitting..." : "Submit with Evidence"}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
