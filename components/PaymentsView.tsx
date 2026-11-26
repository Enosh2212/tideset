"use client";

import React from "react";
import { CreditCard, ExternalLink, ShieldCheck, Clock, Receipt, AlertTriangle } from "lucide-react";

interface PaymentsViewProps {
  agreement: any;
  onPayStage: (stage: any) => void;
  isCustomer: boolean;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  agreement,
  onPayStage,
  isCustomer,
}) => {
  const currentVersion = agreement?.versions?.[0];
  const stages = currentVersion?.stages || [];

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 space-y-6 border border-slate-200 shadow-xs">
      <div className="border-b border-slate-100 pb-4">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          PayPal Settlement & Invoicing Records
        </h3>
        <p className="text-xs text-slate-500">
          Official PayPal Sandbox payment captures, Invoicing v2 records, and authoritative settlement audits.
        </p>
      </div>

      <div className="space-y-3.5">
        {stages.map((stage: any) => {
          const payments = stage.paymentRecords || [];
          const payment = payments[0];
          const isVerified = ["PAYMENT_VERIFIED", "IN_PROGRESS", "SUBMITTED", "ACCEPTED"].includes(
            stage.status
          );
          const isPending = stage.status === "PAYMENT_PENDING";
          const isReal = payment?.settlementType === "REAL_SANDBOX_PAYPAL";

          return (
            <div
              key={stage.id}
              className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-slate-50/80"
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-semibold text-slate-900 text-sm">{stage.title}</h4>
                  {isVerified ? (
                    isReal ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>REAL SANDBOX PAYMENT VERIFIED</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center space-x-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>SIMULATED LOCAL TEST</span>
                      </span>
                    )
                  ) : isPending ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-[#0052CC] border border-blue-200">
                      PAYMENT PENDING
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-200 text-slate-600">
                      UPCOMING
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-500">
                  Amount:{" "}
                  <span className="font-mono font-bold text-slate-900">
                    ${(stage.amountCents / 100).toFixed(2)} USD
                  </span>
                </div>

                {payment && (
                  <div className="text-[11px] font-mono text-emerald-700 space-y-0.5 pt-1">
                    <div>
                      Capture ID: {payment.paypalCaptureId}
                      <span className="text-slate-400 ml-2">
                        ({new Date(payment.verifiedAt).toLocaleTimeString()})
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Settlement Mode: {payment.settlementType}
                    </div>
                  </div>
                )}

                {stage.paypalInvoiceUrl && (
                  <div className="pt-1">
                    <a
                      href={stage.paypalInvoiceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#0052CC] hover:underline flex items-center space-x-1 font-medium"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>View PayPal Invoice: {stage.paypalInvoiceId}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {isCustomer && isPending && (
                <button
                  onClick={() => onPayStage(stage)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0070BA] hover:bg-[#005ea6] text-white shadow-xs flex items-center space-x-1.5 self-start sm:self-center transition-all cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Pay Now</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
