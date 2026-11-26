"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PublicNavbar } from "@/components/PublicNavbar";
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Users,
} from "lucide-react";

export default function InviteAcceptPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();

  const [invitation, setInvitation] = useState<any | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});

    // Fetch invitation details
    fetch(`/api/invitations/${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.invitation) {
          setInvitation(data.invitation);
        } else {
          setError(data.error || "Invitation not found.");
        }
      })
      .catch(() => {
        setError("Failed to load invitation.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [token]);

  const handleAccept = async () => {
    setIsAccepting(true);
    setError(null);

    try {
      const res = await fetch(`/api/invitations/${token}`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/agreements/${data.agreementId}`);
      } else {
        setError(data.error || "Failed to accept invitation.");
      }
    } catch {
      setError("An unexpected error occurred while accepting invitation.");
    } finally {
      setIsAccepting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <PublicNavbar />
        <main className="flex-1 flex flex-col items-center justify-center p-8 space-y-3">
          <RefreshCw className="w-8 h-8 text-[#0052CC] animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Validating invitation link...</p>
        </main>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <PublicNavbar />
        <main className="flex-1 max-w-md mx-auto px-4 py-16 text-center space-y-4">
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error || "This invitation link is invalid or has expired."}
          </div>
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-blue-600 hover:underline"
          >
            <span>Return to Bothway Home</span>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <PublicNavbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full mx-auto bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0052CC] flex items-center justify-center mx-auto border border-blue-200">
              <Users className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">You&apos;re Invited to Collaborate</h1>
            <p className="text-xs text-slate-500">
              <strong>{invitation.inviterName}</strong> has invited you to join a milestone agreement.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Agreement Title:</span>
              <span className="font-bold text-slate-900">{invitation.agreement?.title}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Proposed Role:</span>
              <span className="font-bold text-[#0052CC] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {invitation.role === "CUSTOMER" ? "Client / Buyer" : "Service Provider"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Total Agreement Value:</span>
              <span className="font-mono font-bold text-slate-900">
                ${((invitation.agreement?.totalAmountCents || 0) / 100).toFixed(2)} USD
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200">
              <span>Invited Email:</span>
              <span className="font-mono text-slate-600">{invitation.invitedEmail}</span>
            </div>
          </div>

          {invitation.isAccepted ? (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs text-center font-medium">
              This invitation has already been accepted.
            </div>
          ) : invitation.isExpired ? (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs text-center font-medium">
              This invitation link has expired.
            </div>
          ) : user ? (
            <button
              onClick={handleAccept}
              disabled={isAccepting}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#0052CC] hover:bg-[#0047B3] text-white shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isAccepting ? "Joining Agreement..." : `Accept & Join as ${invitation.role}`}</span>
            </button>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                href="/login"
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#0052CC] hover:bg-[#0047B3] text-white shadow-xs transition-all flex items-center justify-center space-x-2"
              >
                <span>Sign In to Accept Invitation</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/signup"
                className="w-full py-2.5 rounded-xl text-xs font-semibold bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 shadow-xs transition-all flex items-center justify-center space-x-2"
              >
                <span>Create New Account</span>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
