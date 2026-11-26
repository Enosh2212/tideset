"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppNavbar } from "@/components/AppNavbar";
import { PayPalCheckoutModal } from "@/components/PayPalCheckoutModal";
import {
  FileText,
  CreditCard,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Copy,
  ExternalLink,
  Users,
  ArrowRight,
  RefreshCw,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function AgreementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [user, setUser] = useState<any | null>(null);
  const [agreement, setAgreement] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayStage, setSelectedPayStage] = useState<any | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showAudit, setShowAudit] = useState(false);

  const fetchAgreement = async () => {
    try {
      const res = await fetch(`/api/agreements/${id}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to load agreement.");
      } else {
        setAgreement(data.agreement);
      }
    } catch {
      setError("An unexpected network error occurred.");
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

  const handleApproveVersion = async () => {
    setIsApproving(true);
    try {
      const res = await fetch(`/api/agreements/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionNumber: agreement?.currentVersionNumber || 1 }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchAgreement();
      } else {
        alert(data.error);
      }
    } catch {
      alert("Failed to submit approval.");
    } finally {
      setIsApproving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <AppNavbar user={user} />
        <main className="flex-1 flex flex-col items-center justify-center p-8 space-y-3">
          <RefreshCw className="w-8 h-8 text-[#0052CC] animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading agreement details...</p>
        </main>
      </div>
    );
  }

  if (error || !agreement) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <AppNavbar user={user} />
        <main className="flex-1 max-w-xl mx-auto px-4 py-16 text-center space-y-4">
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error || "Agreement could not be found."}
          </div>
          <Link
            href="/agreements"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#0052CC] hover:underline"
          >
            <span>Back to agreements catalog</span>
          </Link>
        </main>
      </div>
    );
  }

  const currentVersion = agreement.versions?.[0];
  const stages = currentVersion?.stages || [];
  const myParticipant = agreement.participants?.find((p: any) => p.userId === user?.id);
  const myRole = myParticipant ? myParticipant.role : agreement.customerId === user?.id ? "CUSTOMER" : "PROVIDER";

  const customerApproved = currentVersion?.customerApprovalState === "APPROVED";
  const providerApproved = currentVersion?.providerApprovalState === "APPROVED";
  const needsMyApproval = (myRole === "CUSTOMER" && !customerApproved) || (myRole === "PROVIDER" && !providerApproved);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <AppNavbar user={user} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8 space-y-6">
        {/* Header Summary */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    agreement.status === "ACTIVE"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : agreement.status === "COMPLETED"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {agreement.status}
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  Your Role: <span className="text-slate-900 font-bold">{myRole}</span>
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  ID: {agreement.id}
                </span>
              </div>

              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {agreement.title}
              </h1>
              <p className="text-xs text-slate-500 max-w-2xl">{agreement.description}</p>
            </div>

            <div className="flex items-center space-x-6 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
              <div className="text-left md:text-right">
                <div className="text-xs text-slate-400">Total Price</div>
                <div className="text-xl font-bold font-mono text-slate-900">
                  ${(agreement.totalAmountCents / 100).toFixed(2)} USD
                </div>
                <div className="text-[11px] text-slate-500">Version {currentVersion?.versionNumber || 1}</div>
              </div>
            </div>
          </div>

          {/* Sub-Navigation Tabs */}
          <div className="flex items-center space-x-2 border-t border-slate-100 pt-3 text-xs font-semibold">
            <Link
              href={`/agreements/${id}`}
              className="px-3 py-1.5 rounded-lg bg-blue-50 text-[#0052CC] border border-blue-200"
            >
              Overview & Stages
            </Link>
            <Link
              href={`/agreements/${id}/payments`}
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Payments & Invoices
            </Link>
            <Link
              href={`/agreements/${id}/deliverables`}
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Deliverables & Reviews
            </Link>
          </div>
        </div>

        {/* Bilateral Approval Banner */}
        {needsMyApproval && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start sm:items-center space-x-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <div className="text-xs font-bold text-amber-900">
                  Version {currentVersion?.versionNumber} Awaiting Your Approval
                </div>
                <div className="text-[11px] text-amber-800">
                  Review the milestone terms below. Both participants must sign before payment or work can proceed.
                </div>
              </div>
            </div>

            <button
              onClick={handleApproveVersion}
              disabled={isApproving}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0052CC] hover:bg-[#0047B3] text-white shadow-xs transition-all shrink-0 cursor-pointer disabled:opacity-60"
            >
              <span>{isApproving ? "Approving..." : `Approve as ${myRole}`}</span>
            </button>
          </div>
        )}

        {/* Participants & Invitations Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
            <Users className="w-4 h-4 text-[#0052CC]" />
            <span>Agreement Participants</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {agreement.participants?.map((p: any) => (
              <div key={p.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {p.role}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      p.status === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900">
                  {p.user?.name || p.invitedEmail}
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {p.user?.email || p.invitedEmail}
                </div>
              </div>
            ))}
          </div>

          {/* Pending Invitations Link */}
          {agreement.invitations?.length > 0 && (
            <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-200 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-semibold text-slate-900">Pending Invitation: </span>
                <span className="font-mono text-slate-600">{agreement.invitations[0].invitedEmail}</span>
              </div>
              <button
                onClick={() => {
                  const url = `${window.location.origin}/invite/${agreement.invitations[0].token}`;
                  navigator.clipboard.writeText(url);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center space-x-1 self-start sm:self-auto shrink-0 shadow-xs"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedLink ? "Link Copied!" : "Copy Invite Link"}</span>
              </button>
            </div>
          )}
        </div>

        {/* Milestone Stages Pipeline */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Milestone Pipeline</h2>
            <span className="text-xs font-semibold text-slate-500">{stages.length} Stages</span>
          </div>

          <div className="space-y-3">
            {stages.map((stage: any) => {
              const isPayable = stage.status === "PAYMENT_PENDING";
              const isCustomer = myRole === "CUSTOMER";

              return (
                <div
                  key={stage.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-slate-300"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center border border-slate-200">
                        {stage.sequenceIndex}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm">{stage.title}</h3>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          stage.status === "PAYMENT_VERIFIED" || stage.status === "ACCEPTED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : stage.status === "SUBMITTED"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : stage.status === "PAYMENT_PENDING"
                            ? "bg-blue-50 text-[#0052CC] border border-blue-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {stage.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500">{stage.description}</p>

                    <div className="flex items-center space-x-4 text-xs text-slate-400 pt-0.5">
                      <div>
                        Amount:{" "}
                        <span className="font-mono font-bold text-slate-800">
                          ${(stage.amountCents / 100).toFixed(2)} USD
                        </span>
                      </div>
                      <div>
                        Due: {new Date(stage.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-start sm:self-center shrink-0">
                    {isPayable && isCustomer && (
                      <button
                        onClick={() => setSelectedPayStage(stage)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0070BA] hover:bg-[#005ea6] text-white shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Pay with PayPal</span>
                      </button>
                    )}

                    <Link
                      href={`/agreements/${id}/deliverables`}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
                    >
                      Deliverables
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Collapsible Audit Trail */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <button
            onClick={() => setShowAudit(!showAudit)}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer"
          >
            <span>Immutable Audit Trail ({agreement.auditEvents?.length || 0} events)</span>
            {showAudit ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {showAudit && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              {agreement.auditEvents?.map((ev: any) => (
                <div key={ev.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{ev.eventType}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(ev.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{ev.details}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* PayPal Checkout Modal */}
      {selectedPayStage && (
        <PayPalCheckoutModal
          isOpen={!!selectedPayStage}
          onClose={() => setSelectedPayStage(null)}
          stage={selectedPayStage}
          onPaymentSuccess={async () => {
            setSelectedPayStage(null);
            await fetchAgreement();
          }}
        />
      )}
    </div>
  );
}
