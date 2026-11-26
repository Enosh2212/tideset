"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CreditCard, Check, Copy, ChevronRight, ExternalLink } from "lucide-react";

export interface PaymentLedgerItem {
  id: string;
  agreementId: string;
  agreementTitle: string;
  stageTitle: string;
  amountCents: number;
  settlementType: string;
  paypalCaptureId: string;
  status: string;
  verifiedAt: string;
}

interface PaymentsLedgerProps {
  records: PaymentLedgerItem[];
  totalSettledCents: number;
}

export function PaymentsLedger({ records, totalSettledCents }: PaymentsLedgerProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const realRecords = records.filter(r => r.settlementType === "REAL_SANDBOX_PAYPAL");
  const simRecords = records.filter(r => r.settlementType !== "REAL_SANDBOX_PAYPAL");

  const realTotal = realRecords.reduce((acc, r) => acc + r.amountCents, 0);
  const simTotal = simRecords.reduce((acc, r) => acc + r.amountCents, 0);

  return (
    <div className="space-y-4">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-semibold text-slate-900 tracking-tight">
            Payments & settlements
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Authoritative PayPal Sandbox transactions and preserved development fixtures.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200">
            <span className="text-emerald-700 font-medium">Live PayPal Settled:</span>
            <span className="font-mono font-bold text-emerald-900">
              ${(realTotal / 100).toFixed(2)} USD
            </span>
          </div>

          {simTotal > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-600">
              <span className="text-slate-500 font-medium">Simulated Local Fixtures:</span>
              <span className="font-mono font-semibold text-slate-700">
                ${(simTotal / 100).toFixed(2)} USD
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Open Table */}
      {records.length === 0 ? (
        <div className="py-12 text-center space-y-1.5">
          <CreditCard className="w-6 h-6 text-slate-300 mx-auto" />
          <p className="text-xs font-medium text-slate-600">No payment records found</p>
          <p className="text-[11px] text-slate-400">
            Payment records will appear here as milestone payments are approved and captured via PayPal.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Milestone & Agreement</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3">Capture ID</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((item) => {
                const dateObj = new Date(item.verifiedAt);

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Timestamp */}
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                      <div>
                        {dateObj.toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {dateObj.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>

                    {/* Agreement & Stage */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-900 line-clamp-1">
                        {item.stageTitle}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">
                        {item.agreementTitle}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-3 font-mono font-semibold text-slate-900 whitespace-nowrap">
                      ${(item.amountCents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                      <span className="text-[10px] text-slate-400 font-sans font-normal">USD</span>
                    </td>

                    {/* Settlement Type */}
                    <td className="py-3 px-3">
                      {item.settlementType === "REAL_SANDBOX_PAYPAL" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                          Live PayPal Capture
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                          Simulated Local Fixture
                        </span>
                      )}
                    </td>

                    {/* Capture ID */}
                    <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px]">{item.paypalCaptureId.slice(0, 15)}{item.paypalCaptureId.length > 15 ? "..." : ""}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(item.paypalCaptureId, item.id)}
                          className="p-0.5 hover:text-slate-800 text-slate-400 transition-colors"
                          title="Copy Capture ID"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-center">
                      {item.settlementType === "REAL_SANDBOX_PAYPAL" ? (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          Settled & Webhook Verified
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          Preserved Fixture
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3 text-right">
                      <Link
                        href={`/agreements/${item.agreementId}`}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        <span>Agreement</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
