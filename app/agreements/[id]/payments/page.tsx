"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppNavbar } from "@/components/AppNavbar";
import { PayPalCheckoutModal } from "@/components/PayPalCheckoutModal";
import {
  CreditCard,
  ShieldCheck,
  AlertTriangle,
  Receipt,
  ExternalLink,
  ArrowLeft,
  RefreshCw,
  Clock,
} from "lucide-react";

export default function AgreementPaymentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [user, setUser] = useState<any | null>(null);
  const [agreement, setAgreement] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPayStage, setSelectedPayStage] = useState<any | null>(null);

  const fetchAgreement = async () => {
    try {
      const res = await fetch(`/api/agreements/${id}`);
      const data = await res.json();
      if (data.success) {
        setAgreement(data.agreement);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push("/login");
        } else {
          setUser(data.user);
          fetchAgreement();
        }
      })
      .catch(() => router.push("/login"));
  }, [id, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <AppNavbar user={user} />
        <main className="flex-1 flex flex-col items-center justify-center p-8 space-y-3">
          <RefreshCw className="w-8 h-8 text-[#0052CC] animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading payments ledger...</p>
        </main>
      </div>
    );
  }

  const currentVersion = agreement?.versions?.[0];
  const stages = currentVersion?.stages || [];
  const myParticipant = agreement?.participants?.find((p: any) => p.userId === user?.id);
  const isCustomer = (myParticipant ? myParticipant.role : agreement?.customerId === user?.id ? "CUSTOMER" : "PROVIDER") === "CUSTOMER";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <AppNavbar user={user} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8 space-y-6">
        <div className="flex items-center space-x-3">
          <Link
            href={`/agreements/${id}`}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-xs"
            title="Back to agreement overview"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Payment & Settlement Ledger
            </h1>
            <p className="text-xs text-slate-500">
              Authoritative PayPal Sandbox captures and Invoicing v2 records for {agreement?.title}.
            </p>
          </div>
        </div>

        {/* Payments View Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-sm font-bold text-slate-900">
              Stage Settlements
            </h2>
            <p className="text-xs text-slate-500">
              Every stage payment is recorded with an immutable PayPal Capture ID and cryptographic verification.
            </p>
          </div>

          <div className="space-y-4">
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
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-slate-300"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-white text-slate-700 text-xs font-bold flex items-center justify-center border border-slate-200">
                        {stage.sequenceIndex}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm">{stage.title}</h3>

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
                      <div className="text-[11px] font-mono text-emerald-800 space-y-0.5 pt-1">
                        <div>
                          Capture ID: {payment.paypalCaptureId}
                          <span className="text-slate-400 ml-2">
                            ({new Date(payment.verifiedAt).toLocaleTimeString()})
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Settlement Mode: {payment.settlementType} • Payer: {payment.payerEmail || "Verified"}
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
                      onClick={() => setSelectedPayStage(stage)}
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
      </main>

      {/* PayPal Checkout Modal */}
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
    </div>
  );
}
