import React, { useState, useMemo } from "react";
import { MfeMaeSummary } from "../../types";
import { Target, Zap, DollarSign, Shield, Filter, ArrowUpRight, ArrowDownRight, Info } from "lucide-react";

interface MfeMaeScatterChartProps {
  data?: MfeMaeSummary;
}

export const MfeMaeScatterChart: React.FC<MfeMaeScatterChartProps> = ({ data }) => {
  const [filterMode, setFilterMode] = useState<"ALL" | "WINNERS" | "LEFT_ON_TABLE" | "HIGH_HEAT">("ALL");

  const filteredTrades = useMemo(() => {
    if (!data || !data.trades) return [];
    switch (filterMode) {
      case "WINNERS":
        return data.trades.filter(t => t.netPnL > 0);
      case "LEFT_ON_TABLE":
        return data.trades.filter(t => t.captureRatio > 0 && t.captureRatio < 60);
      case "HIGH_HEAT":
        return data.trades.filter(t => t.maeR >= 0.7);
      default:
        return data.trades;
    }
  }, [data, filterMode]);

  if (!data || data.tradesWithData === 0) {
    return (
      <div className="p-8 rounded-3xl bg-bg-card border border-border-subtle text-center">
        <Target className="w-10 h-10 text-brand-accent mx-auto mb-3 opacity-60" />
        <h4 className="text-base font-bold text-text-primary">MAE / MFE Analytics</h4>
        <p className="text-xs text-text-secondary mt-1">
          Record and close trades to unlock institutional entry precision and exit efficiency metrics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 4 Core Quantitative Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Capture Ratio */}
        <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              Avg Capture Ratio
            </span>
            <div className="p-2 rounded-xl bg-brand-accent/10 text-brand-accent">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-text-primary font-mono">
                {data.averageCaptureRatio}%
              </span>
              <span
                className={`text-xs font-bold ${
                  data.averageCaptureRatio >= 60 ? "text-brand-positive" : "text-amber-400"
                }`}
              >
                {data.averageCaptureRatio >= 65
                  ? "Elite"
                  : data.averageCaptureRatio >= 50
                  ? "Good"
                  : "Needs Work"}
              </span>
            </div>
            <p className="text-[11px] text-text-muted mt-1">
              Benchmark: &gt; 60% of peak excursion
            </p>
          </div>
        </div>

        {/* Money Left on Table */}
        <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              Left on Table
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-amber-400 font-mono">
                ₹{data.moneyLeftOnTable.toLocaleString("en-IN")}
              </span>
            </div>
            <p className="text-[11px] text-text-muted mt-1">
              Unrealized peak gains forfeited at exit
            </p>
          </div>
        </div>

        {/* Entry Precision Score */}
        <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              Entry Precision
            </span>
            <div className="p-2 rounded-xl bg-brand-positive/10 text-brand-positive">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-text-primary font-mono">
                {data.entryPrecisionScore}/100
              </span>
              <span className="text-xs text-brand-positive font-bold">
                Avg MAE: {data.averageMaeR}R
              </span>
            </div>
            <p className="text-[11px] text-text-muted mt-1">
              Lower MAE drawdown = Higher precision
            </p>
          </div>
        </div>

        {/* Exit Efficiency Score */}
        <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              Exit Efficiency
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-text-primary font-mono">
                {data.exitEfficiencyScore}/100
              </span>
              <span className="text-xs text-text-secondary font-mono">
                Avg MFE: {data.averageMfeR}R
              </span>
            </div>
            <p className="text-[11px] text-text-muted mt-1">
              Trailing stop & profit locking efficiency
            </p>
          </div>
        </div>
      </div>

      {/* Trade-by-Trade MAE/MFE Audit */}
      <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
          <div>
            <h3 className="text-base font-extrabold text-text-primary flex items-center gap-2">
              <Target className="w-5 h-5 text-brand-accent" />
              Trade Excursion Audit (MFE vs MAE Efficiency)
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Compare each trade&apos;s peak favorable move against the drawdown heat faced before closing.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setFilterMode("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                filterMode === "ALL"
                  ? "bg-brand-accent text-bg-primary"
                  : "bg-bg-secondary text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
              }`}
            >
              All ({data.trades.length})
            </button>
            <button
              onClick={() => setFilterMode("WINNERS")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                filterMode === "WINNERS"
                  ? "bg-brand-accent text-bg-primary"
                  : "bg-bg-secondary text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
              }`}
            >
              Winners Only
            </button>
            <button
              onClick={() => setFilterMode("LEFT_ON_TABLE")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                filterMode === "LEFT_ON_TABLE"
                  ? "bg-brand-accent text-bg-primary"
                  : "bg-bg-secondary text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
              }`}
            >
              Low Capture (&lt;60%)
            </button>
            <button
              onClick={() => setFilterMode("HIGH_HEAT")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                filterMode === "HIGH_HEAT"
                  ? "bg-brand-accent text-bg-primary"
                  : "bg-bg-secondary text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
              }`}
            >
              High Heat (&gt;0.7R)
            </button>
          </div>
        </div>

        {/* Excursion Visual Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead>
              <tr className="border-b border-border-subtle text-[11px] font-bold uppercase tracking-wider text-text-muted">
                <th className="py-2.5 px-3">Stock / Date</th>
                <th className="py-2.5 px-3">Direction</th>
                <th className="py-2.5 px-3">Realized P&L</th>
                <th className="py-2.5 px-3">Actual R</th>
                <th className="py-2.5 px-3">MAE (Drawdown Heat)</th>
                <th className="py-2.5 px-3">MFE (Peak Profit)</th>
                <th className="py-2.5 px-3 min-w-[150px]">Profit Capture %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/50">
              {filteredTrades.slice(0, 15).map(t => (
                <tr key={t.tradeId} className="hover:bg-bg-secondary/40 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-extrabold text-text-primary block">{t.stockSymbol}</span>
                    <span className="text-[10px] text-text-muted font-mono">{t.date}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-extrabold ${
                        t.direction === "BUY"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-rose-500/15 text-rose-400"
                      }`}
                    >
                      {t.direction === "BUY" ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      {t.direction}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`font-mono font-bold ${
                        t.netPnL >= 0 ? "text-brand-positive" : "text-brand-negative"
                      }`}
                    >
                      {t.netPnL >= 0 ? "+₹" : "-₹"}
                      {Math.abs(t.netPnL).toLocaleString("en-IN")}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-semibold text-text-primary">
                    {t.rMultiple >= 0 ? `+${t.rMultiple}R` : `${t.rMultiple}R`}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`font-mono font-bold text-xs ${
                          t.maeR > 0.7 ? "text-rose-400" : "text-text-secondary"
                        }`}
                      >
                        {t.maeR}R
                      </span>
                      {t.maeR > 0.7 && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold">
                          Heat
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-brand-positive">
                    +{t.mfeR}R
                  </td>
                  <td className="py-3 px-3">
                    {t.netPnL > 0 ? (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="font-extrabold text-text-primary">{t.captureRatio}%</span>
                          <span className="text-[10px] text-text-muted">
                            {t.captureRatio >= 70
                              ? "Optimal"
                              : t.captureRatio >= 50
                              ? "Average"
                              : "Left on table"}
                          </span>
                        </div>
                        <div className="w-full bg-bg-secondary h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              t.captureRatio >= 70
                                ? "bg-brand-positive"
                                : t.captureRatio >= 50
                                ? "bg-brand-accent"
                                : "bg-amber-400"
                            }`}
                            style={{ width: `${Math.min(100, t.captureRatio)}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-text-muted text-[11px]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Institutional Explainer Box */}
        <div className="p-4 rounded-2xl bg-bg-secondary/60 border border-border-subtle grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-text-secondary">
          <div className="flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
            <div>
              <b className="text-text-primary font-semibold">MAE (Max Adverse Excursion):</b> Measures
              the worst drawdown price endured while holding the position. If your average MAE exceeds{" "}
              <span className="text-brand-accent font-mono">0.6R</span>, your trade triggers are
              premature or stop losses are placed too close to noise clusters.
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Target className="w-4 h-4 text-brand-positive shrink-0 mt-0.5" />
            <div>
              <b className="text-text-primary font-semibold">MFE (Max Favorable Excursion):</b> Tracks
              the peak profit potential reached by the asset. A Capture Ratio below{" "}
              <span className="text-amber-400 font-mono">50%</span> indicates premature profit-taking
              or failing to trail stops behind technical pivot swings.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
