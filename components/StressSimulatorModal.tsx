"use client";

import React, { useState } from "react";
import {
  Sliders,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Sparkles,
  ArrowRight,
  X,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

interface StressSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  agreementId: string;
  onApplyRepair: (adjustedStages: any[]) => void;
}

export const StressSimulatorModal: React.FC<StressSimulatorModalProps> = ({
  isOpen,
  onClose,
  agreementId,
  onApplyRepair,
}) => {
  const [delayDays, setDelayDays] = useState(7);
  const [costIncrease, setCostIncrease] = useState(0);
  const [incomeReduction, setIncomeReduction] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const runSimulation = async (days = delayDays, cost = costIncrease, reduction = incomeReduction) => {
    setIsSimulating(true);
    try {
      const res = await fetch(`/api/agreements/${agreementId}/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inflowDelayDays: days,
          costIncreaseCents: cost * 100,
          inflowReductionCents: reduction * 100,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSimulationResult({
          ...data.simulation,
          aiRecoveryAdvice: data.aiRecoveryAdvice,
        });
      }
    } catch (e) {
      console.error("Simulation failed", e);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white max-w-2xl w-full rounded-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shadow-xs">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Agreement Stress-Test Simulator
              </h3>
              <p className="text-xs text-slate-500">
                Counterfactual scenario modeling: Test financial friction before it happens.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sliders & Shock Controls */}
        <div className="space-y-5 bg-slate-50 p-5 rounded-2xl border border-slate-200">
          {/* Shock 1: Paycheck Delay */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-800">
                Customer Paycheck Arrival Delay
              </span>
              <span className="font-mono text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {delayDays === 0 ? "On Time (Day 14)" : `+${delayDays} Days Late (Day ${14 + delayDays})`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="21"
              step="1"
              value={delayDays}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setDelayDays(val);
                runSimulation(val, costIncrease, incomeReduction);
              }}
              className="w-full accent-[#0052CC] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>0d (On Time)</span>
              <span>+7d (1 Week)</span>
              <span>+14d (2 Weeks)</span>
              <span>+21d (3 Weeks)</span>
            </div>
          </div>

          {/* Quick preset buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 mr-1">Presets:</span>
            {[
              { label: "Normal (0d)", days: 0, cost: 0 },
              { label: "7-Day Paycheck Delay", days: 7, cost: 0 },
              { label: "14-Day Serious Delay", days: 14, cost: 0 },
              { label: "+$50 Scope Change", days: 0, cost: 50 },
            ].map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDelayDays(p.days);
                  setCostIncrease(p.cost);
                  runSimulation(p.days, p.cost, incomeReduction);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all border border-slate-200 shadow-xs"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Simulation Feedback */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Impact & Survivability Analysis
            </h4>
            {isSimulating && (
              <span className="text-xs text-[#0052CC] font-medium flex items-center space-x-1.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Simulating...</span>
              </span>
            )}
          </div>

          {simulationResult ? (
            <div className="space-y-3">
              {/* Liquidity Deficit Alert or Safe Alert */}
              {simulationResult.hasDeficit ? (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
                  <div className="flex items-center space-x-2 text-rose-700 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Rigid Milestone Breakdown Detected!</span>
                  </div>
                  <p className="text-xs text-rose-800 leading-relaxed">
                    Under standard unadjusted terms, a {delayDays}-day income delay forces Stage 2 payment
                    to occur before the customer receives their paycheck, creating a liquidity deficit.
                  </p>
                  {simulationResult.shockedValidation?.errors?.map((err: string, i: number) => (
                    <div key={i} className="text-[11px] font-mono text-rose-800 bg-rose-100/70 p-2.5 rounded-lg border border-rose-200">
                      {err}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                  <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Schedule Remains 100% Survivable</span>
                  </div>
                  <p className="text-xs text-emerald-700">
                    Customer cash reserves remain positive throughout all milestone disbursements.
                  </p>
                </div>
              )}

              {/* TIDESET AI Survivability Repair Recommendation */}
              {simulationResult.recommendedRepair && (
                <div className="p-5 rounded-xl bg-blue-50/60 border border-blue-200 space-y-3">
                  <div className="flex items-center space-x-2 text-[#0052CC] font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-[#0052CC]" />
                    <span>TIDESET AI Survivability Solution</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {simulationResult.recommendedRepair.explanation}
                  </p>

                  {simulationResult.aiRecoveryAdvice && (
                    <div className="p-3.5 rounded-lg bg-white border border-blue-100 text-xs space-y-1.5 shadow-xs">
                      <div className="font-semibold text-slate-800 flex items-center justify-between">
                        <span>AI Recovery Analysis ({simulationResult.aiRecoveryAdvice.modelDetails})</span>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-50 text-[#0052CC] font-bold border border-blue-200">
                          {simulationResult.aiRecoveryAdvice.isAiGenerated ? "OpenRouter Live" : "Deterministic"}
                        </span>
                      </div>
                      <p className="text-slate-700">{simulationResult.aiRecoveryAdvice.recommendedAdjustment}</p>
                      <p className="text-[11px] text-slate-500 italic">{simulationResult.aiRecoveryAdvice.tradeoffSummary}</p>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => {
                        onApplyRepair(simulationResult.recommendedRepair.adjustedStages);
                        onClose();
                      }}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#0052CC] hover:bg-[#0047B3] text-white shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Draft Survivable Revision (v2)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
              Drag the slider above or click a preset to simulate cash-flow friction.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
