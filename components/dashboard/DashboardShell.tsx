"use client";

import React, { useState } from "react";
import { DashboardSidebar, TabKey } from "./DashboardSidebar";
import { DashboardTopbar } from "./DashboardTopbar";
import { X } from "lucide-react";

interface DashboardShellProps {
  user: any;
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  children: React.ReactNode;
}

export function DashboardShell({
  user,
  activeTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
  children,
}: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans antialiased">
      {/* DESKTOP SIDEBAR (Visible on md and up) */}
      <div className="hidden md:flex shrink-0">
        <DashboardSidebar
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          user={user}
        />
      </div>

      {/* MOBILE DRAWER BACKDROP & SIDEBAR (< md) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Container */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white z-10 shadow-xl">
            <div className="absolute top-2 right-2 p-1">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <DashboardSidebar
              activeTab={activeTab}
              onSelectTab={onSelectTab}
              user={user}
              onCloseMobile={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardTopbar
          currentTab={activeTab}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          user={user}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
