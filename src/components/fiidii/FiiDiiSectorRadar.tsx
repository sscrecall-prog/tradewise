import React, { useState } from 'react';
import { FiiDiiReport } from '../../types';
import { FiiDiiService } from '../../services/FiiDiiService';
import {
  TrendingUp,
  TrendingDown,
  Compass,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  RotateCw,
  Sparkles,
  BarChart2,
  PieChart
} from 'lucide-react';

interface FiiDiiSectorRadarProps {
  initialReport?: FiiDiiReport;
}

export const FiiDiiSectorRadar: React.FC<FiiDiiSectorRadarProps> = ({ initialReport }) => {
  const [report, setReport] = useState<FiiDiiReport>(() => initialReport || FiiDiiService.generateReport());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setReport(FiiDiiService.generateReport());
      setIsRefreshing(false);
    }, 400);
  };

  const getRankBadgeClass = (rank: string) => {
    switch (rank) {
      case 'LEADING':
        return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case 'IMPROVING':
        return 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30';
      case 'WEAKENING':
        return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'LAGGING':
        return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30';
      default:
        return 'bg-bg-elevated text-text-secondary border-border-subtle';
    }
  };

  const getInflowBadge = (status: string) => {
    switch (status) {
      case 'HEAVY_INFLOW':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Heavy Inflow 🔥</span>;
      case 'INFLOW':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400">Inflow</span>;
      case 'NEUTRAL':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-bg-elevated text-text-muted">Neutral</span>;
      case 'OUTFLOW':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400">Outflow</span>;
      case 'HEAVY_OUTFLOW':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30">Heavy Outflow ⚠️</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-bg-card border border-border-subtle shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-accent/15 border border-brand-accent/30 flex items-center justify-center text-brand-positive">
            <Compass className="w-5 h-5 text-brand-positive" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-text-primary">
                FII / DII Flow & Sector Rotation Radar
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500/15 text-purple-400 border border-purple-500/30">
                Smart Money Flow
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Track institutional cash positioning, FII Index Futures short squeeze potential, and sectoral leadership.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-text-muted">Synced: {report.lastUpdated}</span>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-bg-secondary hover:bg-bg-elevated border border-border-subtle text-xs font-bold text-text-primary transition-all active:scale-95 shadow-sm"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-brand-accent' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Institutional Market Summary Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-bg-card via-bg-card to-purple-500/10 border border-purple-500/25 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed text-text-secondary">
          <strong className="text-text-primary">Institutional Bias Intelligence: </strong>
          {report.marketSummary}
        </div>
      </div>

      {/* 4 Macro Institutional Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: FII Cash Net */}
        <div className="p-5 rounded-3xl bg-bg-card border border-border-subtle shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
              FII Cash Net
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              report.cash.fiiNet >= 0
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
            }`}>
              {report.cash.fiiNet >= 0 ? 'Net Buyers' : 'Net Sellers'}
            </span>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-black ${report.cash.fiiNet >= 0 ? 'text-brand-positive' : 'text-brand-negative'}`}>
              {report.cash.fiiNet >= 0 ? '+₹' : '-₹'}
              {Math.abs(report.cash.fiiNet).toLocaleString('en-IN', { minimumFractionDigits: 1 })} Cr
            </div>
            <div className="flex items-center justify-between text-[11px] text-text-muted mt-2 pt-2 border-t border-border-subtle/50">
              <span>Buy: ₹{report.cash.fiiGrossBuy.toLocaleString('en-IN')} Cr</span>
              <span>Sell: ₹{report.cash.fiiGrossSell.toLocaleString('en-IN')} Cr</span>
            </div>
          </div>
        </div>

        {/* Card 2: DII Cash Net */}
        <div className="p-5 rounded-3xl bg-bg-card border border-border-subtle shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
              DII Cash Net
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              report.cash.diiNet >= 0
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
            }`}>
              Domestic Support
            </span>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-black ${report.cash.diiNet >= 0 ? 'text-brand-positive' : 'text-brand-negative'}`}>
              {report.cash.diiNet >= 0 ? '+₹' : '-₹'}
              {Math.abs(report.cash.diiNet).toLocaleString('en-IN', { minimumFractionDigits: 1 })} Cr
            </div>
            <div className="flex items-center justify-between text-[11px] text-text-muted mt-2 pt-2 border-t border-border-subtle/50">
              <span>Buy: ₹{report.cash.diiGrossBuy.toLocaleString('en-IN')} Cr</span>
              <span>Sell: ₹{report.cash.diiGrossSell.toLocaleString('en-IN')} Cr</span>
            </div>
          </div>
        </div>

        {/* Card 3: Combined Institutional Net */}
        <div className="p-5 rounded-3xl bg-bg-card border border-border-subtle shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
              Combined Smart Money
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-accent/15 text-brand-positive">
              FII + DII Total
            </span>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-black ${report.cash.combinedNet >= 0 ? 'text-brand-positive' : 'text-brand-negative'}`}>
              {report.cash.combinedNet >= 0 ? '+₹' : '-₹'}
              {Math.abs(report.cash.combinedNet).toLocaleString('en-IN', { minimumFractionDigits: 1 })} Cr
            </div>
            <div className="text-[11px] text-text-muted mt-2 pt-2 border-t border-border-subtle/50 flex items-center justify-between">
              <span>Net Liquidity Impulse</span>
              <span className="font-bold text-text-primary">
                {report.cash.combinedNet >= 0 ? 'Bullish Fuel 🚀' : 'Bearish Drain 🔻'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: FII Index Futures Long Ratio */}
        <div className="p-5 rounded-3xl bg-bg-card border border-border-subtle shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
              FII Futures Long Ratio
            </span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-purple-500/20 text-purple-400">
              {report.derivatives.indexFuturesLongRatio}%
            </span>
          </div>
          <div className="mt-2 space-y-1.5">
            <div className="text-sm font-extrabold text-text-primary truncate">
              {report.derivatives.sentimentLabel}
            </div>
            {/* Visual Meter Bar */}
            <div className="w-full bg-bg-secondary h-2.5 rounded-full overflow-hidden p-0.5 border border-border-subtle">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  report.derivatives.indexFuturesLongRatio <= 25
                    ? 'bg-rose-500 shadow-sm shadow-rose-500/50'
                    : report.derivatives.indexFuturesLongRatio >= 70
                    ? 'bg-emerald-400'
                    : 'bg-brand-accent'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, report.derivatives.indexFuturesLongRatio))}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-text-muted">
              <span>0% (Full Short)</span>
              <span>100% (Full Long)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sector Rotation Heatmap Matrix */}
      <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-base font-bold text-text-primary flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-brand-accent" />
              <span>NSE Sector Rotation & Relative Strength Radar</span>
            </h4>
            <p className="text-xs text-text-muted mt-0.5">
              Identify which sectors institutions are rotating into today (Leading vs Lagging)
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 font-semibold text-[11px]">
              Leading (Outperforming)
            </span>
            <span className="px-2 py-1 rounded-lg bg-rose-500/15 text-rose-400 font-semibold text-[11px]">
              Lagging (Underperforming)
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border-subtle text-text-muted uppercase text-[10px]">
              <tr>
                <th className="pb-3 font-bold">Sectoral Index</th>
                <th className="pb-3 font-bold">Current Level</th>
                <th className="pb-3 font-bold">Change (%)</th>
                <th className="pb-3 font-bold">Momentum State</th>
                <th className="pb-3 font-bold">Market Breadth</th>
                <th className="pb-3 font-bold">Leading Stock</th>
                <th className="pb-3 font-bold text-right">Flow Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/50">
              {report.sectors.map(sec => {
                const isPositive = sec.changePercent >= 0;
                return (
                  <tr key={sec.symbol} className="hover:bg-bg-elevated/40 transition-colors">
                    <td className="py-3 font-extrabold text-text-primary">{sec.name}</td>
                    <td className="py-3 font-mono text-text-secondary font-semibold">
                      ₹{sec.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 font-extrabold">
                      <span className={`inline-flex items-center gap-1 ${isPositive ? 'text-brand-positive' : 'text-brand-negative'}`}>
                        {isPositive ? <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" /> : <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />}
                        {isPositive ? '+' : ''}{sec.changePercent}%
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${getRankBadgeClass(sec.momentumRank)}`}>
                        {sec.momentumRank}
                      </span>
                    </td>
                    <td className="py-3 text-text-secondary">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-500 font-bold">{sec.advances} Adv</span>
                        <span className="text-text-muted">/</span>
                        <span className="text-rose-500 font-bold">{sec.declines} Dec</span>
                      </div>
                    </td>
                    <td className="py-3 font-semibold text-text-primary">
                      {sec.topContender}
                    </td>
                    <td className="py-3 text-right">
                      {getInflowBadge(sec.inflowStatus)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historical 5-Day Cash Trend */}
      <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle space-y-4">
        <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
          <PieChart className="w-4 h-4 text-purple-400" />
          <span>Last 5 Sessions: Institutional Cash Net Trajectory (₹ Crores)</span>
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {report.historicalCash.map((day, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-bg-secondary border border-border-subtle flex flex-col justify-between">
              <span className="text-[11px] font-bold text-text-muted">{day.date}</span>
              <div className="mt-2">
                <div className="text-[10px] text-text-secondary">FII Net:</div>
                <div className={`text-xs font-black ${day.fiiNet >= 0 ? 'text-brand-positive' : 'text-brand-negative'}`}>
                  {day.fiiNet >= 0 ? '+₹' : '-₹'}{Math.abs(day.fiiNet).toLocaleString('en-IN')} Cr
                </div>
              </div>
              <div className="mt-1.5 pt-1.5 border-t border-border-subtle/50">
                <div className="text-[10px] text-text-secondary">Combined:</div>
                <div className={`text-xs font-black ${day.combinedNet >= 0 ? 'text-brand-positive' : 'text-brand-negative'}`}>
                  {day.combinedNet >= 0 ? '+₹' : '-₹'}{Math.abs(day.combinedNet).toLocaleString('en-IN')} Cr
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
