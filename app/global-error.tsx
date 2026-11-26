"use client";

import { useEffect } from "react";
import Link from "next/link";
import { BothwayLogo } from "@/components/brand/BothwayLogo";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Bothway GlobalError caught root layout exception]:", error);
  }, [error]);

  const isDev = process.env.NODE_ENV !== "production";

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center font-sans antialiased text-slate-900">
        <div className="max-w-xl w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-5">
          <div className="flex justify-center">
            <BothwayLogo size={42} showWordmark />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Application-Wide Error
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              A root-level layout error occurred. You can reload the page or return to the main dashboard.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span className="font-semibold uppercase tracking-wider">Root Diagnostic</span>
              {error.digest && <span className="text-slate-400">Digest: {error.digest}</span>}
            </div>
            <div className="text-xs font-mono text-rose-700 break-all font-semibold">
              {error.message || "Unknown root layout error"}
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
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#0052CC] text-white hover:bg-[#0047B3] transition-colors cursor-pointer"
            >
              Refresh Application
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Hard Reload
            </button>
            <Link
              href="/"
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Return Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
