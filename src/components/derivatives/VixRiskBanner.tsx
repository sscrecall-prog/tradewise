import React from "react";
import { VixRiskGuidance } from "../../types";
import { useApp } from "../../context/AppContext";
import { AlertTriangle, ShieldAlert, Zap, Activity, CheckCircle2, Sliders } from "lucide-react";

interface VixRiskBannerProps {
  vixRisk: VixRiskGuidance;
  vixValue: number;
  onVixChange: (newVix: number) => void;
}

export const VixRiskBanner: React.FC<VixRiskBannerProps> = ({
  vixRisk,
  vixValue,
  onVixChange
}) => {
  const { setActiveTab } = useApp();

  const getRegimeColor = () => {
    switch (vixRisk.regime) {
      case "LOW_VOLATILITY":
        return {
          bg: "bg-amber-500/10 border-amber-500/30 text-amber-400",
          badge: "bg-amber-500/20 text-amber-300",
          icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
        };
      case "HIGH_VOLATILITY":
      case "EXTREME_VOLATILITY":
        return {
          bg: "bg-rose-500/15 border-rose-500/40 text-rose-400",
          badge: "bg-rose-500/20 text-rose-300",
          icon: <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 animate-pulse" />
        };
      default:
        return {
          bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
          badge: "bg-emerald-500/20 text-emerald-300",
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
        };
    }
  };

  const style = getRegimeColor();

  return (
    <div className={`p-5 rounded-3xl border shadow-sm transition-all duration-300 ${style.bg}`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left: Icon & Description */}
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-2xl bg-bg-card/50 border border-current/20 shadow-sm mt-0.5">
            {style.icon}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider">
                India VIX Dynamic Risk Sizing Engine
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${style.badge}`}>
                {vixRisk.title}
              </span>
            </div>

            <p className="text-xs text-text-primary font-semibold leading-relaxed max-w-2xl">
              {vixRisk.description}
            </p>

            <p className="text-[11px] text-text-secondary">
              <b className="text-text-primary">Actionable Rule:</b> {vixRisk.recommendation}
            </p>
          </div>
        </div>

        {/* Right: VIX Gauge & Interactive Simulation Controls */}
        <div className="flex items-center gap-4 bg-bg-card/80 p-3 rounded-2xl border border-border-subtle shrink-0">
          <div className="text-center px-2">
            <span className="text-[10px] text-text-muted uppercase font-bold block flex items-center gap-1 justify-center">
              <Activity className="w-3 h-3 text-brand-accent" />
              India VIX
            </span>
            <span className="text-xl font-black font-mono text-text-primary">
              {vixValue.toFixed(1)}
            </span>
          </div>

          {/* Quick Presets / Simulation */}
          <div className="space-y-1.5 border-l border-border-subtle pl-3 text-[10px]">
            <div className="text-text-muted font-bold flex items-center gap-1">
              <Sliders className="w-3 h-3 text-brand-accent" />
              Simulate VIX:
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onVixChange(11.2)}
                className={`px-2 py-1 rounded-lg font-mono font-bold cursor-pointer transition-colors ${
                  vixValue < 12 ? "bg-amber-500/20 text-amber-300" : "bg-bg-secondary text-text-muted hover:text-text-primary"
                }`}
                title="Simulate Low VIX (< 12) Squeeze Trap"
              >
                11.2 (Low)
              </button>
              <button
                type="button"
                onClick={() => onVixChange(13.8)}
                className={`px-2 py-1 rounded-lg font-mono font-bold cursor-pointer transition-colors ${
                  vixValue >= 12 && vixValue <= 18 ? "bg-emerald-500/20 text-emerald-300" : "bg-bg-secondary text-text-muted hover:text-text-primary"
                }`}
                title="Simulate Normal Market VIX (12 - 18)"
              >
                13.8 (Normal)
              </button>
              <button
                type="button"
                onClick={() => onVixChange(21.4)}
                className={`px-2 py-1 rounded-lg font-mono font-bold cursor-pointer transition-colors ${
                  vixValue > 18 ? "bg-rose-500/20 text-rose-300" : "bg-bg-secondary text-text-muted hover:text-text-primary"
                }`}
                title="Simulate High VIX (> 18) Gamma Storm"
              >
                21.4 (High)
              </button>
            </div>
          </div>

          {/* Position Sizing Action Button */}
          {vixRisk.positionSizeFactor < 1 && (
            <button
              onClick={() => setActiveTab("planner")}
              className="px-3 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-[11px] transition-all shadow-md shadow-rose-500/20 cursor-pointer flex items-center gap-1 shrink-0"
            >
              <Zap className="w-3 h-3" />
              Apply 50% Sizing
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
