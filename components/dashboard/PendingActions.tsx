"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, ChevronRight, ArrowRight } from "lucide-react";

export interface PendingActionItem {
  id: string;
  agreementId: string;
  agreementTitle: string;
  type: "DELIVERABLE_REVIEW" | "PAYMENT_AUTHORIZATION" | "PROPOSAL_APPROVAL" | "SUBMIT_WORK";
  severity: "high" | "medium" | "info";
  title: string;
  description: string;
  actionLabel: string;
  href: string;
  amountCents?: number;
}

interface PendingActionsProps {
  items: PendingActionItem[];
}

export function PendingActions({ items }: PendingActionsProps) {
  if (items.length === 0) {
    return null; // Calm state when nothing needs attention
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Action required ({items.length})
        </h3>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-amber-200/80 bg-amber-50/40 text-xs transition-colors"
          >
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900">
                  {item.title}
                </span>
                <span className="text-[11px] text-slate-500 truncate hidden sm:inline">
                  &bull; {item.agreementTitle}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 line-clamp-1">
                {item.description}
              </p>
            </div>

            <Link
              href={item.href}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-white border border-amber-300 text-amber-900 hover:bg-amber-50 transition-colors shrink-0 self-start sm:self-center shadow-2xs"
            >
              <span>{item.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-700" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
