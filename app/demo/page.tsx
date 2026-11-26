"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { CustomerDashboard } from "@/components/CustomerDashboard";
import { ProviderDashboard } from "@/components/ProviderDashboard";
import { StressSimulatorModal } from "@/components/StressSimulatorModal";
import { AgreementBuilderModal } from "@/components/AgreementBuilderModal";
import { PayPalCheckoutModal } from "@/components/PayPalCheckoutModal";
import { AuditTimeline } from "@/components/AuditTimeline";
import { PaymentsView } from "@/components/PaymentsView";
import { RefreshCw, Sparkles, ArrowRight, AlertTriangle, ShieldCheck, Play } from "lucide-react";

export default function DemoPage() {
  const [currentRole, setCurrentRole] = useState<"CUSTOMER" | "PROVIDER">("CUSTOMER");
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [agreement, setAgreement] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Modals
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [selectedPayStage, setSelectedPayStage] = useState<any | null>(null);

  // Synchronize authenticated server session when persona toggles
  const syncServerSession = async (role: "CUSTOMER" | "PROVIDER") => {
    try {
      await fetch("/api/auth/demo-switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
    } catch (e) {
      console.error("Session sync failed:", e);
    }
  };

  const fetchAgreement = async () => {
    try {
      const res = await fetch("/api/agreements/agree_web_storefront_600");
      const data = await res.json();
      if (data.success) {
        setAgreement(data.agreement);
      }
    } catch (err) {
      console.error("Failed to load agreement", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (newRole: "CUSTOMER" | "PROVIDER") => {
    setCurrentRole(newRole);
    await syncServerSession(newRole);
    await fetchAgreement();
  };

  useEffect(() => {
    syncServerSession(currentRole).then(() => {
      fetchAgreement();
    });
  }, []);

  const handlePayStage = (stage: any) => {
    setSelectedPayStage(stage);
  };

  const handleSubmitDeliverables = async (
    stageId: string,
    notes: string,
    repoUrl?: string,
    previewUrl?: string
  ) => {
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
        await fetchAgreement();
      } else {
        alert(data.error);
      }
    } catch (err: any) {
      console.error(err);
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
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestRevision = async (stageId: string, notes: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/stages/${stageId}/revision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revisionNotes: notes }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchAgreement();
      } else {
        alert(data.error);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRaiseDispute = async (stageId: string, reason: string, proposedResolution?: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/stages/${stageId}/dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          disputeReason: reason,
          proposedResolution: proposedResolution || "REVISE_WITHOUT_CHARGE",
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchAgreement();
      } else {
        alert(data.error);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResolveDispute = async (stageId: string, resolutionChoice: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/stages/${stageId}/resolve-dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolutionChoice }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchAgreement();
      } else {
        alert(data.error);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePauseStage = async (stageId: string, reason: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/stages/${stageId}/pause`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pausedReason: reason }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchAgreement();
      } else {
        alert(data.error);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResumeStage = async (stageId: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/stages/${stageId}/resume`, {
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
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendInvoice = async (stageId: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/paypal/invoices/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stageId }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchAgreement();
      } else {
        alert(data.error);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSyncInvoice = async (invoiceId: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/paypal/invoices/${invoiceId}/sync`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        await fetchAgreement();
      } else {
        alert(data.error);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveVersion = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/agreements/agree_web_storefront_600/approve`, {
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
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyRepair = (adjustedStages: any[]) => {
    console.log("Applying repair:", adjustedStages);
    setIsBuilderOpen(true);
  };

  const handleResetDemo = async () => {
    setIsLoading(true);
    try {
      await syncServerSession("CUSTOMER");
      setCurrentRole("CUSTOMER");
      await fetchAgreement();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen pb-16 bg-[#F8FAFC]">
      {/* Sandbox Notice Banner */}
      <div className="bg-amber-500 text-midnight-950 px-4 py-1.5 text-center text-xs font-bold flex items-center justify-center space-x-2 border-b border-amber-600">
        <Play className="w-3.5 h-3.5 fill-current" />
        <span>TIDESET Interactive Demo Sandbox — Isolated sample environment with simulated and live PayPal Sandbox execution</span>
        <Link href="/dashboard" className="underline font-semibold ml-2 text-slate-900">
          Return to Real Workspace &rarr;
        </Link>
      </div>

      {/* Navigation */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenBuilder={() => setIsBuilderOpen(true)}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onResetDemo={handleResetDemo}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
            <RefreshCw className="w-8 h-8 text-[#0052CC] animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Loading TIDESET Demo Intelligence...</p>
          </div>
        ) : !agreement ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3 shadow-xs">
            <p className="text-sm text-slate-600 font-medium">No agreement found.</p>
            <button
              onClick={handleResetDemo}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#0052CC] text-white shadow-xs hover:bg-[#0047B3]"
            >
              Initialize Demo Agreement
            </button>
          </div>
        ) : (
          <>
            {activeTab === "overview" || activeTab === "agreement" ? (
              currentRole === "CUSTOMER" ? (
                <CustomerDashboard
                  agreement={agreement}
                  onPayStage={handlePayStage}
                  onAcceptStage={handleAcceptStage}
                  onRequestRevision={handleRequestRevision}
                  onRaiseDispute={handleRaiseDispute}
                  onResolveDispute={handleResolveDispute}
                  onApproveVersion={handleApproveVersion}
                  onOpenSimulator={() => setIsSimulatorOpen(true)}
                  onOpenBuilder={() => setIsBuilderOpen(true)}
                  isProcessing={isProcessing}
                />
              ) : (
                <ProviderDashboard
                  agreement={agreement}
                  onSubmitDeliverables={handleSubmitDeliverables}
                  onSendInvoice={handleSendInvoice}
                  onPauseStage={handlePauseStage}
                  onResumeStage={handleResumeStage}
                  onResolveDispute={handleResolveDispute}
                  onSyncInvoice={handleSyncInvoice}
                  onApproveVersion={handleApproveVersion}
                  onOpenBuilder={() => setIsBuilderOpen(true)}
                  onOpenSimulator={() => setIsSimulatorOpen(true)}
                  isProcessing={isProcessing}
                />
              )
            ) : activeTab === "payments" ? (
              <PaymentsView
                agreement={agreement}
                onPayStage={handlePayStage}
                isCustomer={currentRole === "CUSTOMER"}
              />
            ) : (
              <AuditTimeline events={agreement.auditEvents} />
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {isSimulatorOpen && (
        <StressSimulatorModal
          isOpen={isSimulatorOpen}
          onClose={() => setIsSimulatorOpen(false)}
          agreementId={agreement?.id || "agree_web_storefront_600"}
          onApplyRepair={handleApplyRepair}
        />
      )}

      {isBuilderOpen && (
        <AgreementBuilderModal
          isOpen={isBuilderOpen}
          onClose={() => setIsBuilderOpen(false)}
          agreementId={agreement?.id || "agree_web_storefront_600"}
          onVersionCreated={fetchAgreement}
        />
      )}

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
    </main>
  );
}
