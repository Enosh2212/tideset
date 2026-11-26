"use client";

import React from "react";
import Link from "next/link";
import { Plus, ArrowRight, ShieldCheck, FileText, CheckCircle2 } from "lucide-react";

export function EmptyAgreementState() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs">
      {/* Visual Icon Illustration */}
      <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4">
        <FileText className="w-8 h-8 text-blue-600" />
      </div>

      <div className="max-w-md mx-auto space-y-2">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          Create your first agreement
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Set up milestone deliverables, payment schedules, and transparent review windows with your counterparty.
        </p>
      </div>

      {/* Feature Pills */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-6 pb-6 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>Milestone-based release</span>
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600">
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
          <span>5-day review governance</span>
        </span>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/agreements/new"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create an agreement</span>
        </Link>

        <Link
          href="/dashboard/getting-started"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
        >
          <span>How agreements work</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </Link>
      </div>
    </div>
  );
}
