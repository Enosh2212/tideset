"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Shield,
  Sliders,
  LogOut,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Laptop,
  Lock,
} from "lucide-react";

interface SettingsViewProps {
  user: any;
  onUserUpdate?: (updatedUser: any) => void;
}

type SectionKey = "profile" | "security" | "preferences" | "account";

export function SettingsView({ user, onUserUpdate }: SettingsViewProps) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<SectionKey>("profile");

  // Profile Edit State
  const [name, setName] = useState(user?.name || "");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameMessage, setNameMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Sessions State
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isTerminatingSessions, setIsTerminatingSessions] = useState(false);

  // Preferences State
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMotion = localStorage.getItem("bothway_reduced_motion") === "true";
      setReducedMotion(savedMotion);
      document.documentElement.classList.toggle("reduce-motion", savedMotion);
    }
  }, []);

  const handleToggleReducedMotion = () => {
    const nextVal = !reducedMotion;
    setReducedMotion(nextVal);
    if (typeof window !== "undefined") {
      localStorage.setItem("bothway_reduced_motion", String(nextVal));
      document.documentElement.classList.toggle("reduce-motion", nextVal);
    }
  };

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  useEffect(() => {
    if (activeSection === "security") {
      fetchSessions();
    }
  }, [activeSection]);

  const fetchSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const res = await fetch("/api/user/sessions");
      const data = await res.json();
      if (data.success) {
        setSessions(data.sessions || []);
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      setNameMessage({ type: "error", text: "Display name must be at least 2 characters." });
      return;
    }
    setIsSavingName(true);
    setNameMessage(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setNameMessage({ type: "success", text: "Profile updated successfully." });
        setIsEditingName(false);
        onUserUpdate?.({ ...user, name: name.trim() });
      } else {
        setNameMessage({ type: "error", text: data.error || "Failed to update profile." });
      }
    } catch {
      setNameMessage({ type: "error", text: "Network error occurred." });
    } finally {
      setIsSavingName(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword.length < 8) {
      setPasswordMessage({ type: "error", text: "New password must be at least 8 characters long." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setPasswordMessage({ type: "success", text: "Password changed successfully." });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordMessage({ type: "error", text: data.error || "Failed to change password." });
      }
    } catch {
      setPasswordMessage({ type: "error", text: "Network error occurred." });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleTerminateAllSessions = async () => {
    if (!confirm("Are you sure you want to terminate all active sessions? You will need to log back in.")) {
      return;
    }
    setIsTerminatingSessions(true);
    try {
      const res = await fetch("/api/user/sessions", { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        router.push("/login");
      }
    } catch {
      setIsTerminatingSessions(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  const navSections = [
    { id: "profile" as SectionKey, label: "Profile", icon: User },
    { id: "security" as SectionKey, label: "Security & Sessions", icon: Shield },
    { id: "preferences" as SectionKey, label: "Preferences", icon: Sliders },
    { id: "account" as SectionKey, label: "Account Management", icon: LogOut },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Editorial Header */}
      <div className="pb-4 border-b border-slate-100">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Manage your account profile, authentication credentials, and workspace preferences.
        </p>
      </div>

      {/* Low-Chrome Two-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
        {/* Left Sub-Nav Rail: Flat list without card enclosing */}
        <nav className="md:col-span-3 space-y-0.5" aria-label="Settings categories">
          {navSections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSection(sec.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors text-left relative ${
                  isActive
                    ? "bg-blue-50/70 text-blue-900 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {isActive && (
                  <span
                    className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-blue-600 rounded-r"
                    aria-hidden="true"
                  />
                )}
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-blue-600" : "text-slate-400"
                  }`}
                />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Content Column: Open surface with hairline dividers */}
        <div className="md:col-span-9 space-y-6">
          {/* SECTION 1: PROFILE */}
          {activeSection === "profile" && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-100">
                <h2 className="text-base font-semibold text-slate-900">Personal Information</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your identity across agreements, counterparty invitations, and audit logs.
                </p>
              </div>

              {nameMessage && (
                <div
                  className={`p-3 rounded-md text-xs flex items-center gap-2 ${
                    nameMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-800"
                      : "bg-red-50 text-red-800"
                  }`}
                >
                  {nameMessage.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span>{nameMessage.text}</span>
                </div>
              )}

              {/* Clean flat rows */}
              <div className="space-y-4 text-xs">
                {/* Display Name Row */}
                <div className="py-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                      Display Name
                    </span>
                    {!isEditingName ? (
                      <span className="text-sm font-medium text-slate-900 mt-0.5 block">
                        {user?.name || "Not set"}
                      </span>
                    ) : (
                      <form onSubmit={handleSaveProfile} className="flex items-center gap-2 mt-1">
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="px-2.5 py-1 text-xs rounded border border-slate-300 focus:border-blue-600 focus:outline-hidden"
                          placeholder="Your full name"
                        />
                        <button
                          type="submit"
                          disabled={isSavingName}
                          className="px-3 py-1 rounded text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isSavingName ? "Saving..." : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setName(user?.name || "");
                            setIsEditingName(false);
                          }}
                          className="px-2.5 py-1 rounded text-xs text-slate-600 hover:text-slate-900"
                        >
                          Cancel
                        </button>
                      </form>
                    )}
                  </div>
                  {!isEditingName && (
                    <button
                      type="button"
                      onClick={() => setIsEditingName(true)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 self-start sm:self-auto"
                    >
                      Edit
                    </button>
                  )}
                </div>

                {/* Primary Email Row */}
                <div className="py-3 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                      Primary Email
                    </span>
                    <span className="text-sm font-medium text-slate-900 mt-0.5 block font-mono">
                      {user?.email || "N/A"}
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Verified
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: SECURITY */}
          {activeSection === "security" && (
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="pb-4 border-b border-slate-100">
                  <h2 className="text-base font-semibold text-slate-900">Password & Credentials</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Update your account password using scrypt hashing.
                  </p>
                </div>

                {user?.hasPassword === false ? (
                  <div className="text-xs text-slate-600 flex items-center gap-2 py-2">
                    <Lock className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Signed in via Google OAuth. Password is managed in your Google Account.</span>
                  </div>
                ) : (
                  <form onSubmit={handleChangePassword} className="space-y-3 max-w-sm text-xs">
                    {passwordMessage && (
                      <div
                        className={`p-3 rounded text-xs flex items-center gap-2 ${
                          passwordMessage.type === "success"
                            ? "bg-emerald-50 text-emerald-800"
                            : "bg-red-50 text-red-800"
                        }`}
                      >
                        {passwordMessage.type === "success" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                        )}
                        <span>{passwordMessage.text}</span>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="block text-[11px] font-medium text-slate-600">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        className="w-full px-2.5 py-1.5 rounded border border-slate-200 text-xs focus:border-blue-600 focus:outline-hidden"
                        placeholder="••••••••"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-medium text-slate-600">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={8}
                        className="w-full px-2.5 py-1.5 rounded border border-slate-200 text-xs focus:border-blue-600 focus:outline-hidden"
                        placeholder="Minimum 8 characters"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-medium text-slate-600">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full px-2.5 py-1.5 rounded border border-slate-200 text-xs focus:border-blue-600 focus:outline-hidden"
                        placeholder="Re-enter new password"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isChangingPassword}
                        className="px-3.5 py-1.5 rounded text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isChangingPassword ? "Updating..." : "Update password"}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Active Sessions */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between pb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Active Sessions</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Devices and browsers authenticated to your workspace.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleTerminateAllSessions}
                    disabled={isTerminatingSessions}
                    className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    {isTerminatingSessions ? "Terminating..." : "Sign out all devices"}
                  </button>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {isLoadingSessions ? (
                    <div className="flex items-center gap-2 text-slate-400 py-3">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                      <span>Checking active sessions...</span>
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="text-slate-500 py-3">Current browser session active.</div>
                  ) : (
                    sessions.map((sess) => (
                      <div key={sess.id} className="py-2.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Laptop className="w-4 h-4 text-slate-400 shrink-0" />
                          <div className="truncate">
                            <span className="font-medium text-slate-900 mr-2">{sess.userAgent}</span>
                            {sess.isCurrent && (
                              <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                                Current
                              </span>
                            )}
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              IP: {sess.ipAddress} &bull; Created {new Date(sess.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: PREFERENCES */}
          {activeSection === "preferences" && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-100">
                <h2 className="text-base font-semibold text-slate-900">Workspace Preferences</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visual accessibility and regional settlement currency settings.
                </p>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {/* Theme */}
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-900">Color Palette</div>
                    <div className="text-[11px] text-slate-400">Bothway high-contrast Blue & White theme</div>
                  </div>
                  <span className="text-[11px] font-medium text-slate-600">Default</span>
                </div>

                {/* Reduced Motion Toggle */}
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-900">Reduced Motion</div>
                    <div className="text-[11px] text-slate-400">
                      Suppresses animations and animated crowd previews across the interface
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleReducedMotion}
                    aria-pressed={reducedMotion}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      reducedMotion ? "bg-blue-600" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                        reducedMotion ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Currency */}
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-900">Settlement Currency</div>
                    <div className="text-[11px] text-slate-400">All milestone transactions are denominated in USD</div>
                  </div>
                  <span className="font-mono text-xs font-semibold text-slate-800">USD ($)</span>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: ACCOUNT MANAGEMENT */}
          {activeSection === "account" && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-100">
                <h2 className="text-base font-semibold text-slate-900">Account Management</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sign out or review compliance record retention terms.
                </p>
              </div>

              <div className="space-y-6 text-xs">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Financial Audit & Compliance Policy</h3>
                  <p className="text-slate-500 text-[11px] leading-relaxed max-w-xl">
                    Under financial governance and anti-fraud record-keeping requirements, completed milestone payment records, cryptographic agreement locks, and deliverable review histories are immutable and retained for 7 years. Accounts cannot unilaterally erase active or historical commercial agreements.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">Sign out of workspace</div>
                    <div className="text-[11px] text-slate-400">Terminates session on this browser</div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="px-3.5 py-1.5 rounded text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
