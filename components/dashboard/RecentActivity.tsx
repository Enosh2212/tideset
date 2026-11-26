"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface ActivityEvent {
  id: string;
  eventType?: string;
  action?: string;
  details?: string;
  timestamp?: string;
  createdAt?: string;
  agreementId?: string;
  agreementTitle?: string;
  actorEmail?: string;
}

interface RecentActivityProps {
  events: ActivityEvent[];
  maxItems?: number;
  onViewAll?: () => void;
}

export function RecentActivity({ events, maxItems = 5, onViewAll }: RecentActivityProps) {
  const displayEvents = events.slice(0, maxItems);

  // Clean human-readable event label
  const formatEventName = (raw?: string) => {
    if (!raw) return "Workspace Update";
    return raw
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Recent activity
        </h3>
        {events.length > maxItems && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            View all
          </button>
        )}
      </div>

      {displayEvents.length === 0 ? (
        <p className="text-xs text-slate-400 py-3">No activity recorded yet.</p>
      ) : (
        <div className="divide-y divide-slate-100">
          {displayEvents.map((ev, index) => {
            const dateStr = ev.timestamp || ev.createdAt;
            const formattedDate = dateStr
              ? new Date(dateStr).toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                })
              : "";
            const formattedTime = dateStr
              ? new Date(dateStr).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "";

            return (
              <div key={ev.id || index} className="py-2.5 flex items-start gap-3 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-900 truncate">
                      {formatEventName(ev.eventType || ev.action)}
                    </span>
                    <span className="text-[11px] text-slate-400 shrink-0 font-mono">
                      {formattedDate} {formattedTime}
                    </span>
                  </div>
                  {ev.agreementTitle && (
                    <div className="text-[11px] text-slate-500 truncate">
                      {ev.agreementTitle}
                    </div>
                  )}
                  {ev.details && (
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {ev.details}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
