"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SettingsView } from "@/components/dashboard/SettingsView";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) {
          router.push("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data || !data.authenticated) {
          router.push("/login");
          return;
        }
        setUser(data.user);
      })
      .catch(() => {
        router.push("/login");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="flex items-center gap-3 text-slate-500 text-xs font-medium">
          <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
          <span>Loading account settings...</span>
        </div>
      </div>
    );
  }

  return (
    <DashboardShell
      user={user}
      activeTab="settings"
      onSelectTab={(tab) => {
        if (tab === "overview") router.push("/dashboard");
        else router.push(`/dashboard?tab=${tab}`);
      }}
      searchQuery=""
      onSearchChange={() => {}}
    >
      <SettingsView user={user} onUserUpdate={(u) => setUser(u)} />
    </DashboardShell>
  );
}
