"use client";

import React from "react";
import {
  Waves,
  ShieldCheck,
  User,
  Briefcase,
  Sliders,
  RotateCcw,
  Sparkles,
} from "lucide-react";

interface NavbarProps {
  currentRole: "CUSTOMER" | "PROVIDER";
  onRoleChange: (role: "CUSTOMER" | "PROVIDER") => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenBuilder: () => void;
  onOpenSimulator: () => void;
  onResetDemo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  activeTab,
  onTabChange,
  onOpenBuilder,
  onOpenSimulator,
  onResetDemo,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-3 mb-6 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-[#0052CC] flex items-center justify-center text-white shadow-sm">
            <Waves className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-slate-900">
                TIDESET
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-[#0052CC] border border-blue-200">
                PayPal AI Hackathon 2026
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              AI Agreement Intelligence & Survivable Milestones
            </p>
          </div>
        </div>

        {/* Central Nav Tabs */}
        <nav className="hidden md:flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          {[
            { id: "overview", label: "Overview" },
            { id: "agreement", label: "Agreement & Stages" },
            { id: "payments", label: "PayPal Payments" },
            { id: "audit", label: "Audit Trail" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-white text-[#0052CC] font-semibold shadow-sm border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Action Controls & Persona Switcher */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Quick Trigger: Stress Simulator */}
          <button
            onClick={onOpenSimulator}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-all"
            title="Open Counterfactual Stress-Test Simulator"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Stress Test</span>
          </button>

          {/* Quick Trigger: AI Intake Builder */}
          <button
            onClick={onOpenBuilder}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0052CC] text-white hover:bg-[#003D99] shadow-sm transition-all"
            title="Generate AI Agreement"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI Builder</span>
          </button>

          {/* Persona Switcher Dropdown / Pill */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => onRoleChange("CUSTOMER")}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs transition-all ${
                currentRole === "CUSTOMER"
                  ? "bg-white text-slate-900 shadow-sm font-semibold border border-slate-200/60"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Switch to Elena (Customer View)"
            >
              <User className="w-3 h-3 text-[#0052CC]" />
              <span>Elena</span>
            </button>
            <button
              onClick={() => onRoleChange("PROVIDER")}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs transition-all ${
                currentRole === "PROVIDER"
                  ? "bg-white text-slate-900 shadow-sm font-semibold border border-slate-200/60"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Switch to Marcus (Service Provider View)"
            >
              <Briefcase className="w-3 h-3 text-indigo-600" />
              <span>Marcus</span>
            </button>
          </div>

          {/* PayPal Sandbox Live Health Indicator */}
          <div
            className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] font-medium text-emerald-800"
            title="Connected to official PayPal Sandbox REST API"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>PayPal Sandbox Live</span>
          </div>

          {/* Reset Demo State Button */}
          <button
            onClick={onResetDemo}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
            title="Reset Demo Data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
