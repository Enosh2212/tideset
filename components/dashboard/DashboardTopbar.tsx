"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, Search, X, User, LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { BothwayLogo } from "@/components/brand/BothwayLogo";

interface DashboardTopbarProps {
  currentTab: string;
  onToggleMobileMenu: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  user: any;
}

export function DashboardTopbar({
  currentTab,
  onToggleMobileMenu,
  searchQuery,
  onSearchChange,
  user,
}: DashboardTopbarProps) {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);

  const tabLabels: Record<string, string> = {
    overview: "Overview",
    agreements: "Agreements",
    payments: "Payments & Settlements",
    deliverables: "Deliverables Hub",
    activity: "Audit Trail",
    settings: "Settings",
  };

  const pageTitle = tabLabels[currentTab] || "Overview";

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "US";

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Left: Mobile Menu Button & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="md:hidden flex items-center">
          <BothwayLogo size={28} />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 hidden sm:inline">Workspace</span>
          <span className="text-slate-300 hidden sm:inline">/</span>
          <span className="font-semibold text-slate-900 text-sm sm:text-base">
            {pageTitle}
          </span>
        </div>
      </div>

      {/* Right: Functional Search & Status Pill & User Menu */}
      <div className="flex items-center gap-3">
        {/* Real In-Place Search */}
        <div className="relative hidden sm:block">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search workspace..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-lg text-xs bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-blue-500 w-44 md:w-56 transition-all"
          />
        </div>

        {/* Quiet Sandbox Environment Pill */}
        <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
          <span>Sandbox Mode</span>
        </span>

        {/* Compact User Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-blue-100 transition-all focus:outline-hidden"
            aria-label="User account menu"
          >
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center border border-blue-200">
              {userInitials}
            </div>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-slate-200 shadow-md p-1.5 text-xs z-30">
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="font-semibold text-slate-900 truncate">{user?.name}</div>
                <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
              </div>

              <div className="py-1">
                <Link
                  href="/settings"
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50 rounded-lg"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>Settings</span>
                </Link>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
