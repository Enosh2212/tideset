"use client";

import React from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  FileText,
  CreditCard,
  User,
  Sliders,
} from "lucide-react";

interface AuditTimelineProps {
  events: any[];
}

export const AuditTimeline: React.FC<AuditTimelineProps> = ({ events }) => {
  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 space-y-6 border border-slate-200 shadow-xs">
      <div className="border-b border-slate-100 pb-4">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          Immutable Audit Trail & Ledger
        </h3>
        <p className="text-xs text-slate-500">
          Chronological record of all bilateral proposals, version signatures, and authoritative PayPal settlements.
        </p>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {events && events.length > 0 ? (
          events.map((ev, index) => {
            const isPayment = ev.eventType === "PAYMENT_VERIFIED";
            const isVersion = ev.eventType.includes("VERSION");
            const isDeliverable = ev.eventType.includes("DELIVERABLES");

            return (
              <div key={ev.id || index} className="relative space-y-1">
                {/* Node marker */}
                <div
                  className={`absolute -left-[27px] top-1 w-5 h-5 rounded-full flex items-center justify-center border shadow-xs ${
                    isPayment
                      ? "bg-emerald-600 text-white border-emerald-400"
                      : isVersion
                      ? "bg-[#0052CC] text-white border-blue-400"
                      : isDeliverable
                      ? "bg-emerald-500 text-white border-emerald-300"
                      : "bg-slate-200 text-slate-700 border-slate-300"
                  }`}
                >
                  {isPayment ? (
                    <CreditCard className="w-2.5 h-2.5" />
                  ) : isVersion ? (
                    <FileText className="w-2.5 h-2.5" />
                  ) : (
                    <CheckCircle2 className="w-2.5 h-2.5" />
                  )}
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <span className="font-semibold text-slate-800">{ev.eventType}</span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(ev.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {ev.details}
                </p>
              </div>
            );
          })
        ) : (
          <div className="text-xs text-slate-400">No events recorded yet.</div>
        )}
      </div>
    </div>
  );
};
