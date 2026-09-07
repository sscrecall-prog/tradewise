import React from "react";
import { CostOfIndisciplineSummary } from "../../types";
import { useApp } from "../../context/AppContext";
import { AlertOctagon, ShieldCheck, Flame, ArrowUpRight, Lock, Zap, RefreshCw, XCircle } from "lucide-react";

interface CostOfIndisciplineCardProps {
  costData?: CostOfIndisciplineSummary;
}

export const CostOfIndisciplineCard: React.FC<CostOfIndisciplineCardProps> = ({ costData }) => {
  const { activateTiltLock } = useApp();

  if (!costData) {
    return null;
  }

  const hasCost = costData.totalCost > 0;
  const pnlDifference = costData.potentialNetPnL - costData.actualNetPnL;

  const violations = [
    {
      title: "Moved Stop Loss Penalties",
      description: "Losses magnified by pushing stop loss further away during adverse moves.",
      cost: costData.movedStopLossCost,
      icon: <XCircle className="w-4 h-4 text-rose-400" />,
      color: "border-rose-500/30 bg-rose-500/10 text-rose-400"
    },
    {
      title: "FOMO & Chased Entries",
      description: "Losses from buying the top of green candles without waiting for pullback confirmation.",
      cost: costData.fomoTradesCost,
      icon: <Zap className="w-4 h-4 text-amber-400" />,
      color: "border-amber-500/30 bg-amber-500/10 text-amber-400"
    },
    {
      title: "Revenge Trading",
      description: "Emotional trades taken immediately following a loss in a desperate attempt to break even.",
      cost: costData.revengeTradesCost,
      icon: <Flame className="w-4 h-4 text-orange-400" />,
      color: "border-orange-500/30 bg-orange-500/10 text-orange-400"
    },
    {
      title: "Overtrading & Excess STT/Charges",
      description: "Trading out of boredom beyond risk allocation + avoidable regulatory tax drain.",
      cost: costData.overtradingCost,
      icon: <RefreshCw className="w-4 h-4 text-purple-400" />,
      color: "border-purple-500/30 bg-purple-500/10 text-purple-400"
    }
  ];

  return (
    <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-sm space-y-6">
      {/* Top Banner: Actual vs Potential Equity */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-border-subtle">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Cost of Indiscipline Calculator</span>
          </div>
          <h3 className="text-xl font-extrabold text-text-primary tracking-tight">
            Avoidable Trading Capital Drain:{" "}
            <span className="text-rose-400 font-mono">
              ₹{costData.totalCost.toLocaleString("en-IN")}
            </span>
          </h3>
          <p className="text-xs text-text-secondary mt-1 max-w-xl">
            This rupee figure represents exact trading losses directly caused by rule violations,
            revenge entries, and moving stop loss. If you strictly followed your rules, this capital
            would still be in your trading account.
          </p>
        </div>

        {/* Side-by-side P&L Comparison Widget */}
        <div className="flex items-center gap-3 bg-bg-secondary p-3.5 rounded-2xl border border-border-subtle shrink-0">
          <div className="text-center px-3 border-r border-border-subtle">
            <span className="text-[10px] text-text-muted uppercase font-bold block">
              Actual Net P&L
            </span>
            <span
              className={`text-base font-extrabold font-mono ${
                costData.actualNetPnL >= 0 ? "text-brand-positive" : "text-brand-negative"
              }`}
            >
              {costData.actualNetPnL >= 0 ? "+₹" : "-₹"}
              {Math.abs(costData.actualNetPnL).toLocaleString("en-IN")}
            </span>
          </div>

          <div className="text-center px-3">
            <span className="text-[10px] text-brand-accent uppercase font-bold block flex items-center gap-1 justify-center">
              <ShieldCheck className="w-3 h-3" />
              Potential P&L
            </span>
            <span className="text-base font-black text-brand-positive font-mono">
              {costData.potentialNetPnL >= 0 ? "+₹" : "-₹"}
              {Math.abs(costData.potentialNetPnL).toLocaleString("en-IN")}
            </span>
          </div>

          {hasCost && (
            <div className="pl-2">
              <span className="text-[10px] px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-extrabold flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" />
                +₹{pnlDifference.toLocaleString("en-IN")} Boost
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 4 Pillars of Violation Drain */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {violations.map(v => (
          <div
            key={v.title}
            className={`p-4 rounded-2xl border flex flex-col justify-between ${
              v.cost > 0 ? v.color : "bg-bg-secondary/40 border-border-subtle text-text-muted"
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-primary">{v.title}</span>
                {v.icon}
              </div>
              <p className="text-[11px] text-text-secondary mt-1.5 line-clamp-2 leading-relaxed">
                {v.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-current/15 flex items-baseline justify-between">
              <span className="text-[10px] uppercase tracking-wider font-semibold opacity-80">
                Capital Drain
              </span>
              <span className="text-sm font-black font-mono">
                {v.cost > 0 ? `₹${v.cost.toLocaleString("en-IN")}` : "₹0 (Clean)"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Tilt Lock CTA & Prescription */}
      <div className="p-4 rounded-2xl bg-bg-secondary border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-brand-accent" />
            Prop-Desk Discipline Prescription
          </span>
          <p className="text-xs text-text-secondary">
            Feeling angry, anxious, or tempted to make back lost funds? Institutional prop traders
            freeze terminal access immediately to prevent emotional ruin.
          </p>
        </div>

        <button
          onClick={() => activateTiltLock("MANUAL_COOLDOWN", 30, "Manual discipline cooldown initiated by trader.")}
          className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-xs transition-colors shrink-0 flex items-center justify-center gap-2"
        >
          <Lock className="w-3.5 h-3.5" />
          Engage Tilt Lock (30-Min Cooldown)
        </button>
      </div>
    </div>
  );
};
