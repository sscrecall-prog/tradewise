import React from "react";

interface DistributionProps {
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  className?: string;
}

export const DistributionChart: React.FC<DistributionProps> = ({
  winningTrades,
  losingTrades,
  winRate,
  className = ""
}) => {
  const total = winningTrades + losingTrades || 1;
  const winPercent = Math.round((winningTrades / total) * 100);
  const lossPercent = 100 - winPercent;

  return (
    <div className={`p-4 bg-bg-card rounded-2xl border border-border-subtle ${className}`}>
      <div className="flex items-center justify-between mb-3 text-xs font-medium text-text-secondary">
        <span>Win / Loss Distribution</span>
        <span className="font-bold text-text-primary">{winningTrades} Wins / {losingTrades} Losses</span>
      </div>
      <div className="h-5 flex rounded-xl overflow-hidden border border-border-subtle/80 mb-3">
        <div
          className="bg-brand-positive flex items-center justify-center text-[10px] font-bold text-bg-primary transition-all duration-500"
          style={{ width: `${winPercent}%` }}
        >
          {winPercent > 12 && `${winPercent}%`} 
        </div>
        <div
          className="bg-brand-negative flex items-center justify-center text-[10px] font-bold text-white transition-all duration-500"
          style={{ width: `${lossPercent}%` }}
        >
          {lossPercent > 12 && `${lossPercent}%`} 
        </div>
      </div>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-positive" />
          <span className="text-text-secondary">Winning Trades ({winningTrades})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-negative" />
          <span className="text-text-secondary">Losing Trades ({losingTrades})</span>
        </div>
      </div>
    </div>
  );
};