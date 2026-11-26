"use client";

import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

interface OverviewHeaderProps {
  userName?: string;
}

export function OverviewHeader({ userName }: OverviewHeaderProps) {
  const firstName = userName ? userName.split(" ")[0] : null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Overview
          </h1>
          {firstName && (
            <span className="text-xs font-medium text-slate-500 hidden md:inline">
              &bull; Welcome back, {firstName}
            </span>
          )}
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your agreements, payments and upcoming work.
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <Link
          href="/agreements/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New agreement</span>
        </Link>
      </div>
    </div>
  );
}
