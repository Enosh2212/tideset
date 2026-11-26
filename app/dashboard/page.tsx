"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { TabKey } from "@/components/dashboard/DashboardSidebar";
import { OverviewHeader } from "@/components/dashboard/OverviewHeader";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { AgreementTable } from "@/components/dashboard/AgreementTable";
import { PendingActions, PendingActionItem } from "@/components/dashboard/PendingActions";
import { RecentActivity, ActivityEvent } from "@/components/dashboard/RecentActivity";
import { EmptyAgreementState } from "@/components/dashboard/EmptyAgreementState";
import { PaymentsLedger, PaymentLedgerItem } from "@/components/dashboard/PaymentsLedger";
import { DeliverablesHub, DeliverableItem } from "@/components/dashboard/DeliverablesHub";
import { AuditActivityView } from "@/components/dashboard/AuditActivityView";
import { SettingsView } from "@/components/dashboard/SettingsView";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);
  const [agreements, setAgreements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // 1. Fetch authenticated user
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) {
          router.push("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data || !data.authenticated) {
          router.push("/login");
          return;
        }
        setUser(data.user);

        // 2. Fetch authorized agreements with all relations
        return fetch("/api/agreements")
          .then((res) => res.json())
          .then((agData) => {
            if (agData.success) {
              setAgreements(agData.agreements || []);
            }
          });
      })
      .catch(() => {
        router.push("/login");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [router]);

  // Compute pending actionable tasks for the user from authoritative state machine
  const attentionItems = useMemo<PendingActionItem[]>(() => {
    if (!user || !agreements.length) return [];
    const items: PendingActionItem[] = [];

    for (const ag of agreements) {
      const isCustomer =
        ag.customerId === user.id ||
        ag.participants?.some((p: any) => p.userId === user.id && p.role === "CUSTOMER");
      const isProvider =
        ag.providerId === user.id ||
        ag.participants?.some((p: any) => p.userId === user.id && p.role === "PROVIDER");
      const version = ag.versions?.[0];
      const stages = version?.stages || [];

      // Check if agreement itself awaits bilateral acceptance
      if (ag.status === "PROPOSED") {
        items.push({
          id: `ag-approval-${ag.id}`,
          agreementId: ag.id,
          agreementTitle: ag.title,
          type: "PROPOSAL_APPROVAL",
          severity: "high",
          title: `Agreement approval required: ${ag.title}`,
          description: "Both parties must accept proposed milestones and payment terms before work commences.",
          actionLabel: "Review terms",
          href: `/agreements/${ag.id}`,
        });
      }

      // Check stage-level actionable items
      for (const stg of stages) {
        if (isCustomer) {
          // Deliverable awaiting client review
          if (stg.deliveryStatus === "SUBMITTED" || stg.status === "SUBMITTED") {
            items.push({
              id: `deliv-review-${stg.id}`,
              agreementId: ag.id,
              agreementTitle: ag.title,
              type: "DELIVERABLE_REVIEW",
              severity: "high",
              title: `Review deliverable: ${stg.title}`,
              description: "Milestone deliverables have been submitted. 5-day review countdown is active.",
              actionLabel: "Review & sign off",
              href: `/agreements/${ag.id}`,
              amountCents: stg.amountCents,
            });
          }
          // Payment pending
          else if (
            stg.status === "PAYMENT_PENDING" ||
            (stg.status === "ACTIVE" && stg.paymentStatus === "UNPAID")
          ) {
            items.push({
              id: `pay-stage-${stg.id}`,
              agreementId: ag.id,
              agreementTitle: ag.title,
              type: "PAYMENT_AUTHORIZATION",
              severity: "medium",
              title: `Authorize settlement: ${stg.title}`,
              description: `Authorize milestone payment of $${(stg.amountCents / 100).toFixed(2)} USD via PayPal Sandbox.`,
              actionLabel: "Authorize payment",
              href: `/agreements/${ag.id}`,
              amountCents: stg.amountCents,
            });
          }
        }

        if (isProvider) {
          // Submit deliverable
          if (
            stg.status === "IN_PROGRESS" ||
            (stg.status === "PAYMENT_VERIFIED" &&
              stg.deliveryStatus !== "SUBMITTED" &&
              stg.deliveryStatus !== "ACCEPTED")
          ) {
            items.push({
              id: `submit-work-${stg.id}`,
              agreementId: ag.id,
              agreementTitle: ag.title,
              type: "SUBMIT_WORK",
              severity: "medium",
              title: `Milestone in progress: ${stg.title}`,
              description: "Milestone payment is confirmed. Submit completed proof of work for client review.",
              actionLabel: "Submit deliverable",
              href: `/agreements/${ag.id}`,
              amountCents: stg.amountCents,
            });
          }
        }
      }
    }

    return items;
  }, [user, agreements]);

  // Aggregate financial metrics
  const financialMetrics = useMemo(() => {
    let activeAgreements = 0;
    let completedAgreements = 0;
    let verifiedSettledCents = 0;
    let simulatedSettledCents = 0;
    let pendingPipelineCents = 0;
    let totalStages = 0;
    let completedStages = 0;

    for (const ag of agreements) {
      if (ag.status === "ACTIVE" || ag.status === "PROPOSED") activeAgreements++;
      if (ag.status === "COMPLETED") completedAgreements++;

      const v = ag.versions?.[0];
      const stages = v?.stages || [];
      totalStages += stages.length;

      for (const stg of stages) {
        if (stg.status === "ACCEPTED" || stg.deliveryStatus === "ACCEPTED") {
          completedStages++;
        }

        const records = stg.paymentRecords || [];
        for (const r of records) {
          if (r.status === "COMPLETED") {
            if (r.settlementType === "REAL_SANDBOX_PAYPAL") {
              verifiedSettledCents += r.amountCapturedCents || 0;
            } else {
              simulatedSettledCents += r.amountCapturedCents || 0;
            }
          }
        }

        if (stg.status !== "ACCEPTED" && stg.paymentStatus !== "PAID") {
          pendingPipelineCents += stg.amountCents || 0;
        }
      }
    }

    return {
      activeAgreements,
      completedAgreements,
      verifiedSettledCents,
      simulatedSettledCents,
      pendingPipelineCents,
      totalStages,
      completedStages,
      upcomingStagesCount: Math.max(0, totalStages - completedStages),
    };
  }, [agreements]);

  // Flattened Payment Records across user's agreements
  const paymentLedger = useMemo<PaymentLedgerItem[]>(() => {
    const list: PaymentLedgerItem[] = [];

    for (const ag of agreements) {
      const v = ag.versions?.[0];
      for (const stg of v?.stages || []) {
        for (const pr of stg.paymentRecords || []) {
          list.push({
            id: pr.id,
            agreementId: ag.id,
            agreementTitle: ag.title,
            stageTitle: stg.title,
            amountCents: pr.amountCapturedCents,
            settlementType: pr.settlementType,
            paypalCaptureId: pr.paypalCaptureId || "N/A",
            status: pr.status,
            verifiedAt: pr.verifiedAt,
          });
        }
      }
    }

    return list.sort(
      (a, b) => new Date(b.verifiedAt).getTime() - new Date(a.verifiedAt).getTime()
    );
  }, [agreements]);

  // Flattened Deliverables across user's agreements
  const deliverablesList = useMemo<DeliverableItem[]>(() => {
    const list: DeliverableItem[] = [];

    for (const ag of agreements) {
      const v = ag.versions?.[0];
      for (const stg of v?.stages || []) {
        for (const del of stg.deliverables || []) {
          list.push({
            id: del.id,
            agreementId: ag.id,
            agreementTitle: ag.title,
            stageTitle: stg.title,
            title: del.title || "Deliverable Submission",
            submittedAt: del.submittedAt,
            status: del.status || stg.deliveryStatus,
            description: del.description,
          });
        }
      }
    }

    return list.sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  }, [agreements]);

  // Flattened Audit Events
  const activityEvents = useMemo<ActivityEvent[]>(() => {
    const events: ActivityEvent[] = [];
    for (const ag of agreements) {
      for (const ev of ag.auditEvents || []) {
        events.push({
          id: ev.id,
          eventType: ev.eventType,
          action: ev.action,
          details: ev.details,
          timestamp: ev.timestamp,
          createdAt: ev.createdAt,
          agreementId: ag.id,
          agreementTitle: ag.title,
          actorEmail: ev.actorEmail,
        });
      }
    }
    return events.sort(
      (a, b) =>
        new Date(b.timestamp || b.createdAt || 0).getTime() -
        new Date(a.timestamp || a.createdAt || 0).getTime()
    );
  }, [agreements]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 space-y-3">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium tracking-wide">
          Loading workspace...
        </p>
      </div>
    );
  }

  return (
    <DashboardShell
      user={user}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    >
      {/* 1. OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Header */}
          <OverviewHeader userName={user?.name} />

          {/* KPI Analytics Row */}
          <MetricCards
            activeCount={financialMetrics.activeAgreements}
            completedCount={financialMetrics.completedAgreements}
            awaitingActionCount={attentionItems.length}
            verifiedSettledCents={financialMetrics.verifiedSettledCents}
            simulatedSettledCents={financialMetrics.simulatedSettledCents}
            pendingPipelineCents={financialMetrics.pendingPipelineCents}
            upcomingStagesCount={financialMetrics.upcomingStagesCount}
            onNavigateTab={setActiveTab}
          />

          {/* Main Layout: Empty State OR Balanced 8/4 Grid */}
          {agreements.length === 0 ? (
            <EmptyAgreementState />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* 8 Columns: Agreements List/Table */}
              <div className="lg:col-span-8 space-y-6">
                <AgreementTable
                  agreements={agreements}
                  currentUserId={user?.id}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />
              </div>

              {/* 4 Columns: Contextual Panels */}
              <div className="lg:col-span-4 space-y-6">
                <PendingActions items={attentionItems} />
                <RecentActivity
                  events={activityEvents}
                  maxItems={5}
                  onViewAll={() => setActiveTab("activity")}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. AGREEMENTS TAB */}
      {activeTab === "agreements" && (
        <div className="space-y-6">
          <div className="pb-2 border-b border-slate-200">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Agreements
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Browse, filter, and manage all your active and historical milestone agreements.
            </p>
          </div>

          {agreements.length === 0 ? (
            <EmptyAgreementState />
          ) : (
            <AgreementTable
              agreements={agreements}
              currentUserId={user?.id}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          )}
        </div>
      )}

      {/* 3. PAYMENTS TAB */}
      {activeTab === "payments" && (
        <div className="space-y-6">
          <PaymentsLedger
            records={paymentLedger}
            totalSettledCents={financialMetrics.verifiedSettledCents}
          />
        </div>
      )}

      {/* 4. DELIVERABLES TAB */}
      {activeTab === "deliverables" && (
        <div className="space-y-6">
          <DeliverablesHub deliverables={deliverablesList} />
        </div>
      )}

      {/* 5. ACTIVITY TAB */}
      {activeTab === "activity" && (
        <div className="space-y-6">
          <AuditActivityView events={activityEvents} />
        </div>
      )}

      {/* 6. SETTINGS TAB */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          <SettingsView user={user} onUserUpdate={(u) => setUser(u)} />
        </div>
      )}
    </DashboardShell>
  );
}
