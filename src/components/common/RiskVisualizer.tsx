import React from "react";

interface RiskVisualizerProps {
  entry: number;
  stopLoss: number;
  target: number;
  direction: "BUY" | "SELL";
  className?: string;
}

export const RiskVisualizer: React.FC<RiskVisualizerProps> = ({
  entry,
  stopLoss,
  target,
  direction,
  className = ""
}) => {
  if (entry <= 0 || stopLoss <= 0 || target <= 0) return null;

  const risk = Math.abs(entry - stopLoss);
  const reward = Math.abs(target - entry);
  const total = risk + reward;
  const riskPercent = total > 0 ? (risk / total) * 100 : 33;
  const rewardPercent = total > 0 ? (reward / total) * 100 : 67;
  const rrRatio = risk > 0 ? (reward / risk).toFixed(2) : "0";

  return (
    <div className={`p-4 bg-bg-secondary rounded-2xl border border-border-subtle ${className}`}>
      <div className="flex items-center justify-between text-xs font-medium text-text-secondary mb-2">
        <span>Risk Zone: ₹{risk.toFixed(2)} / share</span>
        <span className="font-bold text-brand-accent">R:R = 1 : {rrRatio}</span>
        <span>Reward Zone: ₹{reward.toFixed(2)} / share</span>
      </div>
      <div className="relative h-6 flex rounded-xl overflow-hidden border border-border-subtle/80 shadow-inner">
        {/* Risk Zone */}
        <div
          className="bg-brand-negative/30 border-r-2 border-brand-negative flex items-center justify-center text-[10px] font-bold text-brand-negative transition-all"
          style={{ width: `${riskPercent}%` }}
        >
          SL: ₹{stopLoss}
        </div>
        {/* Reward Zone */}
        <div
          className="bg-brand-positive/30 flex items-center justify-center text-[10px] font-bold text-brand-positive transition-all"
          style={{ width: `${rewardPercent}%` }}
        >
          Target: ₹{target}
        </div>
      </div>
      <div className="flex items-center justify-between text-[11px] text-text-muted mt-1.5">
        <span>Stop Loss ({direction === "BUY" ? "Below" : "Above"})</span>
        <span className="font-semibold text-text-primary">Entry Trigger: ₹{entry}</span>
        <span>Take Profit Target</span>
      </div>
    </div>
  );
};