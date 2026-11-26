"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppNavbar } from "@/components/AppNavbar";
import {
  FileText,
  PlusCircle,
  ArrowRight,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  RefreshCw,
  Users,
} from "lucide-react";

export default function AgreementsListPage() {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);
  const [agreements, setAgreements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<"ALL" | "CUSTOMER" | "PROVIDER">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

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

        return fetch("/api/agreements")
          .then((res) => res.json())
          .then((agData) => {
            if (agData.success) {
              setAgreements(agData.agreements || []);
            }
          });
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
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <AppNavbar user={user} />
        <main className="flex-1 flex flex-col items-center justify-center p-8 space-y-3">
          <RefreshCw className="w-8 h-8 text-[#0052CC] animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading agreements...</p>
        </main>
      </div>
    );
  }

  // Filter agreements
  const filtered = agreements.filter((ag) => {
    const myParticipant = ag.participants?.find((p: any) => p.userId === user?.id);
    const myRole = myParticipant ? myParticipant.role : ag.customerId === user?.id ? "CUSTOMER" : "PROVIDER";

    if (filterRole === "CUSTOMER" && myRole !== "CUSTOMER") return false;
    if (filterRole === "PROVIDER" && myRole !== "PROVIDER") return false;

    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      return (
        ag.title.toLowerCase().includes(q) ||
        ag.description.toLowerCase().includes(q) ||
        ag.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <AppNavbar user={user} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Agreements</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              All milestone agreements where you participate as client or service provider.
            </p>
          </div>

          <Link
            href="/agreements/new"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0052CC] text-white hover:bg-[#0047B3] shadow-xs transition-all flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create Agreement</span>
          </Link>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {[
              { id: "ALL", label: "All Agreements" },
              { id: "CUSTOMER", label: "As Client" },
              { id: "PROVIDER", label: "As Provider" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterRole(f.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterRole === f.id
                    ? "bg-white text-[#0052CC] font-semibold shadow-xs border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or keyword..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC]"
            />
          </div>
        </div>

        {/* Agreements Table / Card List */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs text-center space-y-3">
            <p className="text-xs text-slate-500">No agreements matched your filter criteria.</p>
            <button
              onClick={() => {
                setFilterRole("ALL");
                setSearchQuery("");
              }}
              className="text-xs font-semibold text-[#0052CC] hover:underline"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((ag) => {
              const currentVersion = ag.versions?.[0];
              const stagesCount = currentVersion?.stages?.length || 0;
              const myParticipant = ag.participants?.find((p: any) => p.userId === user?.id);
              const roleLabel = myParticipant ? myParticipant.role : ag.customerId === user?.id ? "CUSTOMER" : "PROVIDER";

              return (
                <div
                  key={ag.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition-all"
                >
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          ag.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : ag.status === "COMPLETED"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {ag.status}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        Your Role: <span className="text-slate-800 font-bold">{roleLabel}</span>
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        ID: {ag.id}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">{ag.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-1">{ag.description}</p>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Total Price</div>
                      <div className="text-sm font-bold font-mono text-slate-900">
                        ${(ag.totalAmountCents / 100).toFixed(2)} USD
                      </div>
                      <div className="text-[10px] text-slate-400">{stagesCount} Stages</div>
                    </div>

                    <Link
                      href={`/agreements/${ag.id}`}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0052CC] hover:bg-[#0047B3] text-white shadow-xs transition-colors flex items-center space-x-1.5 shrink-0"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
