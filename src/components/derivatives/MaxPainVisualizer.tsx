import React from "react";
import { OptionChainData } from "../../types";
import { Target, TrendingDown, Info, ShieldAlert } from "lucide-react";

interface MaxPainVisualizerProps {
  data: OptionChainData;
}

export const MaxPainVisualizer: React.FC<MaxPainVisualizerProps> = ({ data }) => {
  const maxLoss = Math.max(...data.maxPainCurve.map(c => c.totalLossRupees), 1);
  const minLoss = Math.min(...data.maxPainCurve.map(c => c.totalLossRupees), 1);

  // Focus on 15 strikes around Max Pain strike
  const mpIndex = data.maxPainCurve.findIndex(c => c.strike === data.maxPainStrike);
  const startIdx = Math.max(0, mpIndex - 7);
  const endIdx = Math.min(data.maxPainCurve.length, startIdx + 15);
  const visibleCurve = data.maxPainCurve.slice(startIdx, endIdx);

  const formatCrores = (val: number) => {
    return `₹${(val / 10000000).toFixed(1)} Cr`;
  };

  const spotDistance = data.maxPainStrike - data.spotPrice;

  return (
    <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-sm space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-400 text-xs font-black uppercase tracking-wider mb-2">
            <Target className="w-3.5 h-3.5" />
            <span>Expiry Settlement Gravitational Center</span>
          </div>
          <h3 className="text-xl font-extrabold text-text-primary tracking-tight">
            Max Pain Level:{" "}
            <span className="text-purple-400 font-mono">
              ₹{data.maxPainStrike.toLocaleString("en-IN")}
            </span>
          </h3>
          <p className="text-xs text-text-secondary mt-1 max-w-2xl">
            The Max Pain Theory states that an index option expiry tends to cluster around the strike
            price where option buyers lose the maximum amount of money, leaving option sellers with the highest profit.
          </p>
        </div>

        {/* Quick Target Distance Card */}
        <div className="bg-bg-secondary p-3.5 rounded-2xl border border-border-subtle shrink-0 text-center min-w-[170px]">
          <span className="text-[10px] uppercase font-bold text-text-muted block">
            Spot to Max Pain
          </span>
          <span
            className={`text-lg font-black font-mono ${
              spotDistance >= 0 ? "text-brand-positive" : "text-brand-negative"
            }`}
          >
            {spotDistance >= 0 ? "+" : ""}
            {spotDistance.toFixed(1)} pts
          </span>
          <span className="text-[10px] text-text-muted block mt-0.5">
            {Math.abs(spotDistance) < 40 ? "Near Equilibrium" : "Gravitational Gap"}
          </span>
        </div>
      </div>

      {/* Max Pain Loss Bar Curve */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-text-muted uppercase">
          <span>Strike Price</span>
          <span>Option Buyers Cumulative Loss</span>
        </div>

        <div className="space-y-2">
          {visibleCurve.map(point => {
            const isMaxPain = point.strike === data.maxPainStrike;
            const isAtm = point.strike === Math.round(data.spotPrice / 50) * 50;

            // Height/width percent
            const barPercent = Math.max(12, Math.round(((point.totalLossRupees - minLoss) / (maxLoss - minLoss || 1)) * 100));

            return (
              <div
                key={point.strike}
                className={`p-3 rounded-2xl border transition-all ${
                  isMaxPain
                    ? "bg-purple-500/20 border-purple-500/60 shadow-lg shadow-purple-500/10 ring-1 ring-purple-400"
                    : isAtm
                    ? "bg-brand-accent/10 border-brand-accent/30"
                    : "bg-bg-secondary/40 border-border-subtle"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-black font-mono text-sm text-text-primary">
                      ₹{point.strike.toLocaleString("en-IN")}
                    </span>
                    {isMaxPain && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-500 text-white font-black text-[9px] uppercase tracking-wider">
                        ★ MAX PAIN
                      </span>
                    )}
                    {isAtm && (
                      <span className="px-2 py-0.5 rounded-full bg-brand-accent text-bg-primary font-black text-[9px] uppercase tracking-wider">
                        ATM
                      </span>
                    )}
                  </div>

                  <span className="font-mono font-bold text-xs text-text-secondary">
                    {formatCrores(point.totalLossRupees)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-bg-secondary h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isMaxPain
                        ? "bg-purple-400 shadow-sm"
                        : "bg-slate-500/40"
                    }`}
                    style={{ width: `${barPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Institutional Explainer Box */}
      <div className="p-4 rounded-2xl bg-bg-secondary border border-border-subtle flex items-start gap-3 text-xs text-text-secondary">
        <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <b className="text-text-primary font-semibold">How to Trade Using Max Pain on Expiry Day:</b>
          <p className="leading-relaxed">
            As zero-hour approaches on weekly expiry afternoons (1:30 PM — 3:15 PM), large institutional option writing desks defend their written positions. If spot price deviates widely from Max Pain without strong fundamental news, mean-reversion trades towards the Max Pain strike offer exceptional risk-to-reward ratios.
          </p>
        </div>
      </div>
    </div>
  );
};
