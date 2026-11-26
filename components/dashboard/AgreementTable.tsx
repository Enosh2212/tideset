"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Search, FileText, ChevronRight, User } from "lucide-react";

export type AgreementFilter = "ALL" | "ACTIVE" | "AWAITING_APPROVAL" | "AWAITING_PAYMENT" | "IN_REVIEW" | "COMPLETED";

interface AgreementTableProps {
  agreements: any[];
  currentUserId?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function AgreementTable({
  agreements,
  currentUserId,
  searchQuery = "",
  onSearchChange,
}: AgreementTableProps) {
  const [activeFilter, setActiveFilter] = useState<AgreementFilter>("ALL");
  const [internalSearch, setInternalSearch] = useState(searchQuery);

  const effectiveSearch = onSearchChange ? searchQuery : internalSearch;

  const handleSearchChange = (val: string) => {
    if (onSearchChange) {
      onSearchChange(val);
    } else {
      setInternalSearch(val);
    }
  };

  const filteredAgreements = useMemo(() => {
    return agreements.filter((ag) => {
      // Search
      const q = effectiveSearch.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        ag.title?.toLowerCase().includes(q) ||
        ag.description?.toLowerCase().includes(q) ||
        ag.id?.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      // Status Filter
      if (activeFilter === "ALL") return true;
      if (activeFilter === "ACTIVE") return ag.status === "ACTIVE";
      if (activeFilter === "AWAITING_APPROVAL") return ag.status === "PROPOSED";
      if (activeFilter === "COMPLETED") return ag.status === "COMPLETED";

      // Stage-level filters
      const currentVersion = ag.versions?.[0];
      const stages = currentVersion?.stages || [];

      if (activeFilter === "AWAITING_PAYMENT") {
        return stages.some((s: any) => s.status === "PAYMENT_PENDING" || (s.status === "ACTIVE" && s.paymentStatus === "UNPAID"));
      }

      if (activeFilter === "IN_REVIEW") {
        return stages.some((s: any) => s.deliveryStatus === "SUBMITTED" || s.status === "SUBMITTED");
      }

      return true;
    });
  }, [agreements, effectiveSearch, activeFilter]);

  const filterTabs: Array<{ id: AgreementFilter; label: string }> = [
    { id: "ALL", label: "All" },
    { id: "ACTIVE", label: "Active" },
    { id: "AWAITING_APPROVAL", label: "Awaiting approval" },
    { id: "AWAITING_PAYMENT", label: "Awaiting payment" },
    { id: "IN_REVIEW", label: "In review" },
    { id: "COMPLETED", label: "Completed" },
  ];

  return (
    <div className="space-y-3">
      {/* Table Header & Compact Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Agreements
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            ({filteredAgreements.length})
          </span>
        </div>

        {/* Filter Tabs & Search */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 border-r border-slate-200 pr-2 mr-1">
            {filterTabs.map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                    isActive
                      ? "bg-slate-100 text-slate-900 font-semibold"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {!onSearchChange && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter..."
                value={internalSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-7 pr-2.5 py-1 rounded-md text-xs bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-blue-500 w-36"
              />
            </div>
          )}
        </div>
      </div>

      {/* Agreements Data Table */}
      {filteredAgreements.length === 0 ? (
        <div className="py-8 text-center space-y-1">
          <p className="text-xs font-medium text-slate-700">No agreements found</p>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
            {effectiveSearch || activeFilter !== "ALL"
              ? "No agreements match your filter criteria."
              : "No agreements in your workspace."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 pr-4">Agreement</th>
                  <th className="py-2.5 px-4">Counterparty</th>
                  <th className="py-2.5 px-4">Role</th>
                  <th className="py-2.5 px-4">Milestone</th>
                  <th className="py-2.5 px-4 text-right">Value</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                  <th className="py-2.5 pl-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAgreements.map((ag) => {
                  const currentVersion = ag.versions?.[0];
                  const stages = currentVersion?.stages || [];
                  const totalStages = stages.length;
                  const completedStages = stages.filter(
                    (s: any) => s.status === "ACCEPTED" || s.deliveryStatus === "ACCEPTED"
                  ).length;

                  const currentStage =
                    stages.find(
                      (s: any) =>
                        s.status !== "ACCEPTED" &&
                        s.status !== "LOCKED" &&
                        s.deliveryStatus !== "ACCEPTED"
                    ) || stages[0];

                  const myParticipant = ag.participants?.find((p: any) => p.userId === currentUserId);
                  const isCustomer = myParticipant
                    ? myParticipant.role === "CUSTOMER"
                    : ag.customerId === currentUserId;
                  const roleLabel = isCustomer ? "Customer" : "Provider";

                  const counterparty = ag.participants?.find((p: any) => p.userId !== currentUserId);
                  const counterpartyName = counterparty?.user?.name || "Pending invite";

                  const totalValueFormatted = (ag.totalAmountCents / 100).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  });

                  return (
                    <tr
                      key={ag.id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Title & Scope */}
                      <td className="py-3.5 pr-4 font-medium text-slate-900 max-w-[200px]">
                        <Link
                          href={`/agreements/${ag.id}`}
                          className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate block"
                        >
                          {ag.title}
                        </Link>
                        <span className="font-mono text-[10px] text-slate-400 block truncate">
                          {ag.id}
                        </span>
                      </td>

                      {/* Counterparty */}
                      <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                        <span className="font-medium text-slate-900">{counterpartyName}</span>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-[11px] font-medium text-slate-600">
                          {roleLabel}
                        </span>
                      </td>

                      {/* Current Milestone */}
                      <td className="py-3.5 px-4 text-slate-600">
                        {currentStage ? (
                          <div>
                            <span className="font-medium text-slate-900 block truncate max-w-[160px]">
                              {currentStage.title}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {completedStages} of {totalStages} completed
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">None</span>
                        )}
                      </td>

                      {/* Value */}
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900 whitespace-nowrap">
                        ${totalValueFormatted}
                        <span className="text-[10px] text-slate-400 ml-1 font-sans">USD</span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${
                            ag.status === "ACTIVE"
                              ? "bg-blue-50 text-blue-700"
                              : ag.status === "COMPLETED"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {ag.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 pl-4 text-right whitespace-nowrap">
                        <Link
                          href={`/agreements/${ag.id}`}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                        >
                          <span>Manage</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile List View (< 768px) */}
          <div className="md:hidden divide-y divide-slate-100">
            {filteredAgreements.map((ag) => (
              <div key={ag.id} className="py-3.5 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/agreements/${ag.id}`}
                    className="font-semibold text-xs text-slate-900 hover:text-blue-600"
                  >
                    {ag.title}
                  </Link>
                  <span className="font-mono text-xs font-bold text-slate-900">
                    ${(ag.totalAmountCents / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{ag.status}</span>
                  <Link
                    href={`/agreements/${ag.id}`}
                    className="text-blue-600 font-semibold"
                  >
                    View agreement &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
