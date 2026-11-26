"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  RefreshCw,
  ExternalLink,
  Receipt,
  Lock,
} from "lucide-react";

interface PayPalCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  stage: any;
  onPaymentSuccess: () => void;
}

export const PayPalCheckoutModal: React.FC<PayPalCheckoutModalProps> = ({
  isOpen,
  onClose,
  stage,
  onPaymentSuccess,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [captureReceipt, setCaptureReceipt] = useState<any | null>(null);
  const [paypalStatus, setPaypalStatus] = useState<any>(null);
  const [pendingOrder, setPendingOrder] = useState<any | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/paypal/status")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setPaypalStatus(data.status);
          }
        })
        .catch((err) => console.error("Failed to load PayPal status", err));
    } else {
      setPendingOrder(null);
      setCaptureReceipt(null);
      setStatusMessage("");
    }
  }, [isOpen]);

  if (!isOpen || !stage) return null;

  // Step 1: Create Order & Open Approval Flow
  const handleInitiatePayment = async () => {
    setIsProcessing(true);
    setStatusMessage("Creating PayPal Order (Orders v2)...");

    try {
      const createRes = await fetch("/api/paypal/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stageId: stage.id }),
      });
      const createData = await createRes.json();

      if (!createData.success) {
        throw new Error(createData.error || "Failed to create order");
      }

      const order = createData.order;

      if (!order.isSimulated && order.approveUrl) {
        // Genuine Sandbox Order: prompt buyer to approve on PayPal
        setPendingOrder(order);
        setStatusMessage("PayPal Order created. Opening PayPal Sandbox checkout...");
        window.open(order.approveUrl, "_blank");
      } else {
        // Simulated local fallback: proceed directly to capture
        await handleCaptureOrder(order.orderId);
      }
    } catch (err: any) {
      setStatusMessage(`Order creation failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 2: Authoritatively Capture Payment after Buyer Approval
  const handleCaptureOrder = async (orderIdToCapture?: string) => {
    const targetOrderId = orderIdToCapture || pendingOrder?.orderId;
    if (!targetOrderId) return;

    setIsProcessing(true);
    setStatusMessage(`Verifying & Capturing Order: ${targetOrderId}...`);

    try {
      const captureRes = await fetch("/api/paypal/orders/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: targetOrderId, stageId: stage.id }),
      });
      const captureData = await captureRes.json();

      if (!captureData.success) {
        throw new Error(captureData.error || "Capture verification failed");
      }

      setStatusMessage("Settlement Verified! Updating milestone status...");
      setCaptureReceipt(captureData.payment);
      setPendingOrder(null);

      setTimeout(() => {
        onPaymentSuccess();
      }, 2000);
    } catch (err: any) {
      setStatusMessage(`${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const isRealCapture = captureReceipt?.settlementType === "REAL_SANDBOX_PAYPAL";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white max-w-md w-full rounded-2xl p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0070BA] text-white flex items-center justify-center font-bold text-xs shadow-sm">
              PP
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">PayPal Sandbox Checkout</h3>
              <p className="text-[11px] text-slate-500">Authoritative Milestone Settlement</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Integration Status Badge */}
        {paypalStatus && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center justify-between border ${
              paypalStatus.isConfigured
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-amber-50 text-amber-800 border-amber-200"
            }`}
          >
            <div className="flex items-center space-x-1.5 font-semibold">
              {paypalStatus.isConfigured ? (
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              )}
              <span>{paypalStatus.status}</span>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white border border-slate-200/60 uppercase">
              {paypalStatus.isConfigured ? "Sandbox Live" : "Local Test"}
            </span>
          </div>
        )}

        {/* Milestone Summary Card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
            Payment for Milestone
          </span>
          <h4 className="text-sm font-bold text-slate-900">{stage.title}</h4>
          <p className="text-xs text-slate-600 leading-relaxed">{stage.description}</p>
          <div className="flex items-baseline justify-between pt-2 border-t border-slate-200">
            <span className="text-xs font-medium text-slate-600">Settlement Amount:</span>
            <span className="text-xl font-bold text-[#0052CC]">
              ${(stage.amountCents / 100).toFixed(2)} USD
            </span>
          </div>
        </div>

        {/* Transaction Flow Feedback */}
        {captureReceipt ? (
          <div
            className={`p-4 rounded-xl border space-y-2.5 ${
              isRealCapture
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-blue-50 border-blue-200 text-blue-900"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  {isRealCapture ? "REAL SANDBOX PAYMENT VERIFIED" : "SIMULATED LOCAL TEST"}
                </span>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white border border-slate-200">
                {captureReceipt.settlementType}
              </span>
            </div>

            <div className="text-xs font-mono space-y-1 text-slate-700">
              <div>Capture ID: {captureReceipt.paypalCaptureId}</div>
              <div>Amount: ${(captureReceipt.amountCapturedCents / 100).toFixed(2)} USD</div>
              <div>Status: COMPLETED</div>
              {!isRealCapture && (
                <div className="text-amber-800 text-[11px] italic pt-1">
                  * Note: Recorded in local demonstration environment. No external PayPal funds transferred.
                </div>
              )}
            </div>
            <p className="text-xs text-slate-600 pt-1">
              Provider has been cleared to begin work on this milestone.
            </p>
          </div>
        ) : pendingOrder ? (
          /* Step 2: Waiting for Buyer Approval on PayPal */
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                <span>Genuine Sandbox Order Created</span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white border border-blue-200">
                  {pendingOrder.orderId}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Please complete buyer approval in PayPal Sandbox using your <strong>Personal Sandbox account</strong>.
              </p>
              <a
                href={pendingOrder.approveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 text-xs text-[#0052CC] hover:text-[#003D99] underline font-semibold"
              >
                <span>Re-open PayPal Sandbox Approval Window</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {statusMessage && (
              <div className="text-xs text-blue-800 flex items-center space-x-1.5 p-2.5 rounded-lg bg-blue-50 border border-blue-200">
                {isProcessing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{statusMessage}</span>
              </div>
            )}

            <button
              onClick={() => handleCaptureOrder()}
              disabled={isProcessing}
              className="w-full py-3.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>I Have Approved — Capture Verified Payment</span>
            </button>
          </div>
        ) : (
          /* Step 1: Initial State */
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <Lock className="w-3.5 h-3.5 text-[#0052CC]" />
              <span>Zero-exposure escrow: Funds unlock only this specific milestone.</span>
            </div>

            {statusMessage && (
              <div className="text-xs text-blue-800 flex items-center space-x-1.5 p-2.5 rounded-lg bg-blue-50 border border-blue-200">
                {isProcessing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{statusMessage}</span>
              </div>
            )}

            <button
              onClick={handleInitiatePayment}
              disabled={isProcessing}
              className="w-full py-3.5 rounded-xl font-bold text-sm bg-[#0070BA] hover:bg-[#005ea6] text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>Authorize & Pay ${(stage.amountCents / 100).toFixed(2)} with PayPal</span>
            </button>

            <button
              onClick={() => handleCaptureOrder("SIM-ORDER-" + Date.now())}
              disabled={isProcessing}
              className="w-full py-2.5 rounded-xl font-medium text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-all flex items-center justify-center space-x-2"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Simulate Sandbox Settlement (Demo Test)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
