"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  FileCheck,
  History,
  Settings,
  LogOut,
  Shield,
  Layers,
  HelpCircle,
} from "lucide-react";
import { BothwayLogo } from "@/components/brand/BothwayLogo";

export type TabKey = "overview" | "agreements" | "payments" | "deliverables" | "activity" | "settings";

interface DashboardSidebarProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  user: any;
  onCloseMobile?: () => void;
}

export function DashboardSidebar({
  activeTab,
  onSelectTab,
  user,
  onCloseMobile,
}: DashboardSidebarProps) {
  const router = useRouter();

  const handleNavClick = (tab: TabKey) => {
    onSelectTab(tab);
    onCloseMobile?.();
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  const navItems: Array<{ id: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "agreements", label: "Agreements", icon: FileText },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "deliverables", label: "Deliverables", icon: FileCheck },
    { id: "activity", label: "Activity", icon: History },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "US";

  return (
    <aside className="w-60 bg-white border-r border-slate-200 flex flex-col justify-between h-full select-none">
      {/* Top Section: Brand & Nav */}
      <div className="p-4 space-y-6">
        {/* Brand Logo with Official Canva Artwork */}
        <Link href="/dashboard" className="flex items-center px-1 pt-1 hover:opacity-95 transition-opacity">
          <BothwayLogo size={36} showWordmark subtext="FINANCIAL WORKSPACE" />
        </Link>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-2 mt-2 border-t border-slate-100">
            <Link
              href="/dashboard/getting-started"
              onClick={() => onCloseMobile?.()}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50/60 transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-slate-400 hover:text-blue-600" />
              <span>Getting Started Guide</span>
            </Link>
          </div>
        </nav>
      </div>

      {/* Bottom Section: Compact Real User Info */}
      <div className="p-3 border-t border-slate-200">
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
              {userInitials}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-semibold text-slate-900 truncate">
                {user?.name || "User"}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {user?.email || "Account"}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
