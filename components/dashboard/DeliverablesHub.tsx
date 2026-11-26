"use client";

import React from "react";
import Link from "next/link";
import { FileCheck, ChevronRight } from "lucide-react";

export interface DeliverableItem {
  id: string;
  agreementId: string;
  agreementTitle: string;
  stageTitle: string;
  title: string;
  submittedAt: string;
  status: string;
  description?: string;
}

interface DeliverablesHubProps {
  deliverables: DeliverableItem[];
}

export function DeliverablesHub({ deliverables }: DeliverablesHubProps) {
  return (
    <div className="space-y-4">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-semibold text-slate-900 tracking-tight">
            Deliverables & reviews
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Milestone work submitted for bilateral verification and sign-off.
          </p>
        </div>

        <span className="text-xs text-slate-400">
          {deliverables.length} submitted
        </span>
      </div>

      {/* Deliverables List */}
      {deliverables.length === 0 ? (
        <div className="py-12 text-center space-y-1.5">
          <FileCheck className="w-6 h-6 text-slate-300 mx-auto" />
          <p className="text-xs font-medium text-slate-600">No deliverables submitted</p>
          <p className="text-[11px] text-slate-400">
            When providers submit milestone work, items will appear here for inspection and approval.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {deliverables.map((item) => {
            const dateObj = new Date(item.submittedAt);
            const isAccepted = item.status === "ACCEPTED";
            const isPending = item.status === "SUBMITTED" || item.status === "IN_REVIEW";

            return (
              <div
                key={item.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-xs text-slate-900 truncate">
                      {item.title}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      &bull; {item.stageTitle}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    Agreement: {item.agreementTitle}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Submitted {dateObj.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      isAccepted
                        ? "bg-emerald-50 text-emerald-700"
                        : isPending
                        ? "bg-blue-50 text-blue-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {isAccepted ? "Accepted" : isPending ? "Awaiting review" : item.status.toLowerCase()}
                  </span>

                  <Link
                    href={`/agreements/${item.agreementId}`}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    <span>Inspect</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
