"use client";

import React from "react";
import Link from "next/link";
import { History, ChevronRight } from "lucide-react";
import { ActivityEvent } from "./RecentActivity";

interface AuditActivityViewProps {
  events: ActivityEvent[];
}

export function AuditActivityView({ events }: AuditActivityViewProps) {
  return (
    <div className="space-y-4">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-semibold text-slate-900 tracking-tight">
            Audit trail & activity
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable chronological record of bilateral proposals, approvals, deliverables, and payments.
          </p>
        </div>

        <span className="text-xs text-slate-400">
          {events.length} events
        </span>
      </div>

      {/* Events Stream */}
      {events.length === 0 ? (
        <div className="py-12 text-center space-y-1.5">
          <History className="w-6 h-6 text-slate-300 mx-auto" />
          <p className="text-xs font-medium text-slate-600">No activity logged</p>
          <p className="text-[11px] text-slate-400">
            System and milestone actions will be recorded here automatically.
          </p>
        </div>
      ) : (
        <div className="relative pl-5 space-y-5 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
          {events.map((ev, index) => {
            const dateStr = ev.timestamp || ev.createdAt;
            const dateObj = dateStr ? new Date(dateStr) : null;

            return (
              <div key={ev.id || index} className="relative space-y-1 text-xs">
                {/* Dot */}
                <div className="absolute -left-[23px] top-1.5 w-2 h-2 rounded-full bg-blue-600 ring-4 ring-white" />

                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">
                      {ev.eventType || ev.action || "Event"}
                    </span>
                    {ev.agreementTitle && (
                      <span className="text-slate-400 truncate max-w-[220px]">
                        &bull; {ev.agreementTitle}
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-400">
                    {dateObj ? `${dateObj.toLocaleDateString([], { month: "short", day: "numeric" })} at ${dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}
                  </span>
                </div>

                {ev.details && (
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {ev.details}
                  </p>
                )}

                {ev.agreementId && (
                  <div>
                    <Link
                      href={`/agreements/${ev.agreementId}`}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <span>View agreement</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
