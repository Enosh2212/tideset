"use client";

import { useEffect } from "react";
import Link from "next/link";
import { BothwayLogo } from "@/components/brand/BothwayLogo";
import { RefreshCw, Home, AlertTriangle } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Never conceal errors: log complete error object and stack trace
    console.error("[Bothway ErrorBoundary caught an unhandled client exception]:", error);
  }, [error]);

  const isDev = process.env.NODE_ENV !== "production";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-xl w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-5">
        <div className="flex justify-center">
          <BothwayLogo size={42} showWordmark />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 text-rose-600 bg-rose-50 px-3 py-1 rounded-full text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Client Runtime Exception</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            An unexpected error occurred in this view
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            The page encountered an unhandled exception. Your data and account settings remain safe.
          </p>
        </div>

        {/* Detailed diagnostic block — visible so errors are not concealed */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span className="font-semibold uppercase tracking-wider">Diagnostic Details</span>
            {error.digest && <span className="text-slate-400">Digest: {error.digest}</span>}
          </div>
          <div className="text-xs font-mono text-rose-700 break-all font-semibold">
            {error.message || "Unknown error"}
          </div>
          {isDev && error.stack && (
            <pre className="text-[10px] font-mono text-slate-600 bg-white p-2.5 rounded border border-slate-200 overflow-x-auto max-h-48 whitespace-pre-wrap">
              {error.stack}
            </pre>
          )}
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#0052CC] text-white hover:bg-[#0047B3] transition-colors shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <span>Hard Reload</span>
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
