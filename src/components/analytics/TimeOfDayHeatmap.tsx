import React, { useState } from "react";
import { TimeOfDayMatrix, TimeOfDayCell } from "../../types";
import { Sparkles, AlertTriangle, Clock, TrendingUp, TrendingDown, Info } from "lucide-react";

interface TimeOfDayHeatmapProps {
  matrix?: TimeOfDayMatrix;
}

export const TimeOfDayHeatmap: React.FC<TimeOfDayHeatmapProps> = ({ matrix }) => {
  const [selectedCell, setSelectedCell] = useState<TimeOfDayCell | null>(null);

  if (!matrix || matrix.cells.length === 0) {
    return (
      <div className="p-8 rounded-3xl bg-bg-card border border-border-subtle text-center">
        <Clock className="w-10 h-10 text-brand-accent mx-auto mb-3 opacity-60" />
        <h4 className="text-base font-bold text-text-primary">Time-of-Day Matrix Loading</h4>
        <p className="text-xs text-text-secondary mt-1">
          Record closed trades with execution times to reveal your institutional session edge.
        </p>
      </div>
    );
  }

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const sessions = [
    { id: "OPENING_VOLATILITY", label: "Opening Volatility", timeRange: "09:15 - 10:00", badge: "Gap Digestion" },
    { id: "MORNING_TREND", label: "Morning Trend", timeRange: "10:00 - 11:30", badge: "Prime Momentum" },
    { id: "LUNCH_CHOP", label: "Lunch Chop", timeRange: "11:30 - 13:30", badge: "Trap Zone" },
    { id: "CLOSING_GAMMA", label: "Closing / Gamma", timeRange: "13:30 - 15:30", badge: "Expiry & Square-off" }
  ];

  // Helper to get cell color
  const getCellBg = (cell: TimeOfDayCell) => {
    if (cell.trades === 0) return "bg-bg-secondary/40 border-border-subtle/50 text-text-muted hover:border-brand-accent/30";
    if (cell.netPnL > 0) {
      if (cell.netPnL > 10000) return "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 hover:border-emerald-400";
      if (cell.netPnL > 3000) return "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:border-emerald-400";
      return "bg-emerald-500/10 border-emerald-500/20 text-emerald-300 hover:border-emerald-400";
    } else {
      if (cell.netPnL < -10000) return "bg-rose-500/25 border-rose-500/50 text-rose-400 hover:border-rose-400";
      if (cell.netPnL < -3000) return "bg-rose-500/15 border-rose-500/30 text-rose-400 hover:border-rose-400";
      return "bg-rose-500/10 border-rose-500/20 text-rose-300 hover:border-rose-400";
    }
  };

  const isGolden = (cell: TimeOfDayCell) =>
    matrix.goldenHour &&
    matrix.goldenHour.day === cell.dayName &&
    matrix.goldenHour.session === cell.sessionLabel &&
    cell.trades > 0;

  const isRedFlag = (cell: TimeOfDayCell) =>
    matrix.redFlagZone &&
    matrix.redFlagZone.day === cell.dayName &&
    matrix.redFlagZone.session === cell.sessionLabel &&
    cell.trades > 0 &&
    cell.netPnL < 0;

  return (
    <div className="space-y-6">
      {/* Top Banner Cards: Golden Hour & Red Flag Zone */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Golden Hour */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <Sparkles className="w-4 h-4 text-brand-accent animate-pulse" />
              <span>Golden Hour (Peak Edge)</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
              Highest P&L
            </span>
          </div>
          <div className="mt-3">
            {matrix.goldenHour ? (
              <>
                <p className="text-base font-extrabold text-text-primary">
                  {matrix.goldenHour.day} — {matrix.goldenHour.session}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs">
                  <span className="text-brand-positive font-bold">
                    +₹{matrix.goldenHour.netPnL.toLocaleString("en-IN")}
                  </span>
                  <span className="text-text-secondary">
                    Win Rate: <b className="text-text-primary">{matrix.goldenHour.winRate}%</b>
                  </span>
                </div>
              </>
            ) : (
              <p className="text-xs text-text-secondary">Log more trades to calculate peak edge.</p>
            )}
          </div>
        </div>

        {/* Red Flag Zone */}
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-400">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Red Flag Zone (Bleed)</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold">
              Avoid Trading
            </span>
          </div>
          <div className="mt-3">
            {matrix.redFlagZone && matrix.redFlagZone.netPnL < 0 ? (
              <>
                <p className="text-base font-extrabold text-text-primary">
                  {matrix.redFlagZone.day} — {matrix.redFlagZone.session}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs">
                  <span className="text-rose-400 font-bold">
                    -₹{Math.abs(matrix.redFlagZone.netPnL).toLocaleString("en-IN")}
                  </span>
                  <span className="text-text-secondary">
                    Win Rate: <b className="text-text-primary">{matrix.redFlagZone.winRate}%</b>
                  </span>
                </div>
              </>
            ) : (
              <p className="text-xs text-text-secondary">No severe loss session identified yet. Well done!</p>
            )}
          </div>
        </div>

        {/* Best Session Overall */}
        <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-secondary">
            <TrendingUp className="w-4 h-4 text-brand-positive" />
            <span>Best Session Overall</span>
          </div>
          <div className="mt-3">
            <p className="text-sm font-extrabold text-text-primary truncate">
              {matrix.bestSessionOverall}
            </p>
            <p className="text-[11px] text-text-muted mt-1">
              Consistently yields your highest directional win rate.
            </p>
          </div>
        </div>

        {/* Worst Session Overall */}
        <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-secondary">
            <TrendingDown className="w-4 h-4 text-rose-400" />
            <span>Worst Session Overall</span>
          </div>
          <div className="mt-3">
            <p className="text-sm font-extrabold text-text-primary truncate">
              {matrix.worstSessionOverall}
            </p>
            <p className="text-[11px] text-text-muted mt-1">
              Prone to chop, fakeouts and spread-induced stop-outs.
            </p>
          </div>
        </div>
      </div>

      {/* 2D Heatmap Matrix Table */}
      <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border-subtle">
          <div>
            <h3 className="text-base font-extrabold text-text-primary flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-accent" />
              Indian Market Session Matrix (Mon — Fri × 4 Market Windows)
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Click any cell to inspect volume, win rate, and rupee expectancy per session.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500/60 inline-block"></span>
              <span className="text-text-secondary">Profitable</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-500/30 border border-rose-500/60 inline-block"></span>
              <span className="text-text-secondary">Drawdown</span>
            </div>
          </div>
        </div>

        {/* Matrix Grid Container */}
        <div className="overflow-x-auto">
          <div className="min-w-[650px]">
            {/* Header Columns */}
            <div className="grid grid-cols-5 gap-3 mb-2 text-center">
              <div className="text-left text-xs font-bold uppercase tracking-wider text-text-muted self-end pb-2">
                Day \ Session
              </div>
              {sessions.map(s => (
                <div key={s.id} className="p-2.5 rounded-xl bg-bg-secondary border border-border-subtle text-center">
                  <span className="block text-xs font-extrabold text-text-primary leading-tight">
                    {s.label}
                  </span>
                  <span className="block text-[10px] text-brand-accent font-semibold mt-0.5 font-mono">
                    {s.timeRange}
                  </span>
                  <span className="inline-block text-[9px] px-1.5 py-0.2 rounded bg-bg-elevated text-text-muted mt-1">
                    {s.badge}
                  </span>
                </div>
              ))}
            </div>

            {/* Rows for Mon to Fri */}
            <div className="space-y-2.5">
              {days.map((dayName, dayIndex) => {
                const dayNum = dayIndex + 1;
                return (
                  <div key={dayName} className="grid grid-cols-5 gap-3 items-stretch">
                    {/* Day label */}
                    <div className="p-3 rounded-xl bg-bg-secondary/70 border border-border-subtle flex items-center justify-between">
                      <span className="text-xs font-bold text-text-primary">{dayName}</span>
                      <span className="text-[10px] font-mono text-text-muted">
                        D{dayNum}
                      </span>
                    </div>

                    {/* 4 Sessions for this day */}
                    {sessions.map(s => {
                      const cell = matrix.cells.find(
                        c => c.dayOfWeek === dayNum && c.sessionId === s.id
                      );
                      if (!cell) {
                        return (
                          <div
                            key={s.id}
                            className="p-3 rounded-xl bg-bg-secondary/20 border border-border-subtle/30 text-center text-xs text-text-muted flex items-center justify-center"
                          >
                            —
                          </div>
                        );
                      }

                      const golden = isGolden(cell);
                      const redFlag = isRedFlag(cell);

                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setSelectedCell(cell)}
                          className={`relative p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer group flex flex-col justify-between ${getCellBg(
                            cell
                          )} ${
                            selectedCell === cell ? "ring-2 ring-brand-accent shadow-lg" : ""
                          }`}
                        >
                          {/* Corner Badges */}
                          {golden && (
                            <span className="absolute -top-1.5 -right-1.5 bg-brand-accent text-bg-primary text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-sm flex items-center gap-0.5">
                              ★ GOLD
                            </span>
                          )}
                          {redFlag && (
                            <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-sm flex items-center gap-0.5">
                              ⚠ AVOID
                            </span>
                          )}

                          <div className="flex items-center justify-between w-full">
                            <span className="text-xs font-extrabold tracking-tight">
                              {cell.trades > 0 ? (
                                cell.netPnL >= 0 ? (
                                  `+₹${cell.netPnL.toLocaleString("en-IN")}`
                                ) : (
                                  `-₹${Math.abs(cell.netPnL).toLocaleString("en-IN")}`
                                )
                              ) : (
                                <span className="text-text-muted font-normal">No trades</span>
                              )}
                            </span>
                            {cell.trades > 0 && (
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  cell.winRate >= 50
                                    ? "bg-emerald-500/20 text-emerald-300"
                                    : "bg-rose-500/20 text-rose-300"
                                }`}
                              >
                                {cell.winRate}%
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-current/10 text-[10px] opacity-80 group-hover:opacity-100">
                            <span>
                              {cell.trades} {cell.trades === 1 ? "trade" : "trades"}
                            </span>
                            {cell.trades > 0 && (
                              <span className="font-mono">
                                E: ₹{Math.round(cell.expectancy)}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Cell Inspector Banner */}
        {selectedCell && (
          <div className="mt-4 p-4 rounded-2xl bg-bg-secondary border border-brand-accent/40 animate-fade-in flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-text-primary">
                  {selectedCell.dayName} — {selectedCell.sessionLabel}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-brand-accent/20 text-brand-accent font-bold">
                  {selectedCell.timeRange}
                </span>
              </div>
              <p className="text-xs text-text-secondary">
                {selectedCell.trades === 0
                  ? "Zero trades executed in this window yet."
                  : `Total ${selectedCell.trades} trades executed with ${selectedCell.wins} wins and ${selectedCell.losses} losses.`}
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="p-2.5 rounded-xl bg-bg-card border border-border-subtle text-center min-w-[90px]">
                <span className="text-[10px] text-text-muted block">Net P&L</span>
                <span
                  className={`text-sm font-extrabold ${
                    selectedCell.netPnL >= 0 ? "text-brand-positive" : "text-brand-negative"
                  }`}
                >
                  {selectedCell.netPnL >= 0 ? "+₹" : "-₹"}
                  {Math.abs(selectedCell.netPnL).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-bg-card border border-border-subtle text-center min-w-[80px]">
                <span className="text-[10px] text-text-muted block">Win Rate</span>
                <span className="text-sm font-extrabold text-text-primary">
                  {selectedCell.winRate}%
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-bg-card border border-border-subtle text-center min-w-[90px]">
                <span className="text-[10px] text-text-muted block">Expectancy</span>
                <span className="text-sm font-extrabold text-brand-accent font-mono">
                  ₹{Math.round(selectedCell.expectancy)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Institutional Market Rule Note */}
        <div className="p-3.5 rounded-xl bg-bg-secondary/60 border border-border-subtle flex items-start gap-2.5 text-xs text-text-secondary">
          <Info className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
          <div>
            <b className="text-text-primary font-semibold">Institutional Trading Rule:</b> Over 70% of retail Indian intraday traders lose money between <span className="text-brand-accent font-mono">11:30 AM and 1:30 PM (Lunch Chop)</span> due to low institutional participation and sideways churn. High probability momentum expansions concentrate in the <span className="text-brand-positive font-mono">10:00 — 11:30 AM Morning Trend</span> and <span className="text-brand-accent font-mono">13:30 — 15:30 PM Gamma / European Open</span> windows.
          </div>
        </div>
      </div>
    </div>
  );
};
