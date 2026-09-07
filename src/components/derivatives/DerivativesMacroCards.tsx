import React from "react";
import { OptionChainData } from "../../types";
import { Compass, Target, Shield, ArrowUp, ArrowDown, HelpCircle } from "lucide-react";

interface DerivativesMacroCardsProps {
  data: OptionChainData;
}

export const DerivativesMacroCards: React.FC<DerivativesMacroCardsProps> = ({ data }) => {
  const maxPainDistance = data.maxPainStrike - data.spotPrice;
  const isDistancePositive = maxPainDistance >= 0;

  // PCR needle calculation (clamps between 0% and 100% for range 0.5 to 1.5)
  const pcrPercent = Math.min(100, Math.max(0, ((data.pcr - 0.5) / (1.5 - 0.5)) * 100));

  const formatContracts = (num: number) => {
    if (num >= 100000) {
      return `${(num / 100000).toFixed(2)}L`;
    }
    return num.toLocaleString("en-IN");
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Put-Call Ratio (PCR) Card */}
      <div className="p-5 rounded-3xl bg-bg-card border border-border-subtle shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
            Put-Call Ratio (PCR)
          </span>
          <div className="p-2 rounded-xl bg-brand-accent/15 text-brand-accent">
            <Compass className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-text-primary">
              {data.pcr.toFixed(2)}
            </span>
            <span
              className={`text-xs font-black uppercase px-2 py-0.5 rounded-md ${
                data.pcr >= 1.10
                  ? "bg-emerald-500/20 text-emerald-400"
                  : data.pcr <= 0.85
                  ? "bg-rose-500/20 text-rose-400"
                  : "bg-brand-accent/20 text-brand-accent"
              }`}
            >
              {data.pcrSentiment.replace("_", " ")}
            </span>
          </div>

          {/* Visual PCR Slider Bar */}
          <div className="mt-3 space-y-1">
            <div className="w-full bg-bg-secondary h-2 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 rounded-full"
                style={{ width: "100%" }}
              />
              {/* Pointer indicator */}
              <div
                className="absolute top-0 bottom-0 w-2 bg-white rounded-full shadow-md border border-black transform -translate-x-1"
                style={{ left: `${pcrPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-text-muted font-mono">
              <span>0.5 (Bearish)</span>
              <span>1.0 (Neutral)</span>
              <span>1.5 (Bullish)</span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-[11px] text-text-muted">
          <span>PE: <b className="text-emerald-400 font-mono">{formatContracts(data.totalPutOi)}</b></span>
          <span>CE: <b className="text-rose-400 font-mono">{formatContracts(data.totalCallOi)}</b></span>
        </div>
      </div>

      {/* 2. Expiry Max Pain Card */}
      <div className="p-5 rounded-3xl bg-bg-card border border-border-subtle shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
            Expiry Max Pain
          </span>
          <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400">
            <Target className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-text-primary">
              ₹{data.maxPainStrike.toLocaleString("en-IN")}
            </span>
            <span className="text-xs font-mono font-bold text-purple-400">
              {isDistancePositive ? "+" : ""}
              {maxPainDistance.toFixed(1)} pts
            </span>
          </div>
          <p className="text-[11px] text-text-secondary mt-1 leading-relaxed">
            Theoretical settlement level where option buyers experience maximum payout loss.
          </p>
        </div>

        <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-[11px] text-text-muted">
          <span>Expiry Magnetic Pull</span>
          <span className="text-brand-accent font-bold font-mono">
            {Math.abs(maxPainDistance) < 50 ? "Near Target" : `${Math.abs(Math.round(maxPainDistance))} pts away`}
          </span>
        </div>
      </div>

      {/* 3. Highest Call OI (Resistance Wall) */}
      <div className="p-5 rounded-3xl bg-bg-card border border-border-subtle shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
            Call Resistance Wall
          </span>
          <div className="p-2 rounded-xl bg-rose-500/15 text-rose-400">
            <ArrowUp className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-rose-400">
              ₹{data.highestCallOiStrike.toLocaleString("en-IN")}
            </span>
            <span className="text-xs font-bold text-text-muted font-mono">CE</span>
          </div>
          <p className="text-[11px] text-text-secondary mt-1 leading-relaxed">
            Institutional Call writers have established their heaviest short boundary here.
          </p>
        </div>

        <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-[11px] text-text-muted">
          <span>Major Upside Barrier</span>
          <span className="text-rose-400 font-bold font-mono">Defended Ceiling</span>
        </div>
      </div>

      {/* 4. Highest Put OI (Support Floor) */}
      <div className="p-5 rounded-3xl bg-bg-card border border-border-subtle shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
            Put Support Floor
          </span>
          <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
            <Shield className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-emerald-400">
              ₹{data.highestPutOiStrike.toLocaleString("en-IN")}
            </span>
            <span className="text-xs font-bold text-text-muted font-mono">PE</span>
          </div>
          <p className="text-[11px] text-text-secondary mt-1 leading-relaxed">
            Institutional Put writers have fortified their strongest cushion here.
          </p>
        </div>

        <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-[11px] text-text-muted">
          <span>Major Downside Cushion</span>
          <span className="text-emerald-400 font-bold font-mono">Defended Floor</span>
        </div>
      </div>
    </div>
  );
};
