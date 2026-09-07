import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Card } from "../components/common/Card";
import { StatCard } from "../components/common/StatCard";
import { Badge } from "../components/common/Badge";
import { TradeDetailModal } from "../components/modals/TradeDetailModal";
import { JournalEntry } from "../types";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  PieChart,
  BarChart2,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Smile,
  Tag,
  Clock,
  HelpCircle,
  AlertTriangle,
  Target,
  AlertOctagon
} from "lucide-react";
import { TimeOfDayHeatmap } from "../components/analytics/TimeOfDayHeatmap";
import { MfeMaeScatterChart } from "../components/analytics/MfeMaeScatterChart";
import { CostOfIndisciplineCard } from "../components/analytics/CostOfIndisciplineCard";

export const AnalyticsPage: React.FC = () => {
  const { journal, analytics, discipline } = useApp();

  const [analyticsTab, setAnalyticsTab] = useState<"OVERVIEW" | "TIME_OF_DAY" | "MFE_MAE" | "COST_INDISCIPLINE">("OVERVIEW");

  // Calendar Heatmap month navigation
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const [selectedDayTrades, setSelectedDayTrades] = useState<{ date: string; trades: JournalEntry[] } | null>(null);
  const [selectedTrade, setSelectedTrade] = useState<JournalEntry | null>(null);

  // Group trades by date YYYY-MM-DD
  const tradesByDate = useMemo(() => {
    const map = new Map<string, JournalEntry[]>();
    for (const t of journal) {
      const list = map.get(t.date) || [];
      list.push(t);
      map.set(t.date, list);
    }
    return map;
  }, [journal]);

  // Calendar Days generator for the selected month
  const calendarDays = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: ({ day: number; dateStr: string; pnl: number; count: number; isCurrentMonth: boolean } | null)[] = [];

    // Leading blanks
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Actual days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dayTrades = tradesByDate.get(dateStr) || [];
      const pnl = dayTrades.reduce((acc, t) => acc + t.netPnL, 0);
      days.push({
        day: d,
        dateStr,
        pnl,
        count: dayTrades.length,
        isCurrentMonth: true
      });
    }

    return days;
  }, [calendarDate, tradesByDate]);

  const monthName = calendarDate.toLocaleString("en-IN", { month: "long", year: "numeric" });

  const prevMonth = () => {
    setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Day-of-week Performance
  const dayOfWeekStats = useMemo(() => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const stats = days.slice(1, 6).map(dayName => ({
      day: dayName,
      trades: 0,
      pnl: 0,
      wins: 0
    }));

    for (const t of journal) {
      const d = new Date(`${t.date}T12:00:00`).getDay();
      if (d >= 1 && d <= 5) {
        const item = stats[d - 1];
        item.trades++;
        item.pnl += t.netPnL;
        if (t.netPnL > 0) item.wins++;
      }
    }
    return stats;
  }, [journal]);

  // Hourly / Session Performance
  const sessionStats = useMemo(() => {
    const sessions = [
      { name: "Morning Rush (9:15 - 10:30)", pnl: 0, trades: 0, wins: 0 },
      { name: "Mid-Day Session (10:30 - 13:30)", pnl: 0, trades: 0, wins: 0 },
      { name: "Closing Momentum (13:30 - 15:30)", pnl: 0, trades: 0, wins: 0 }
    ];

    for (const t of journal) {
      const time = t.time || "10:00";
      const [hh, mm] = time.split(":").map(Number);
      const totalMinutes = hh * 60 + mm;

      let idx = 1;
      if (totalMinutes < 10 * 60 + 30) idx = 0;
      else if (totalMinutes >= 13 * 60 + 30) idx = 2;

      sessions[idx].trades++;
      sessions[idx].pnl += t.netPnL;
      if (t.netPnL > 0) sessions[idx].wins++;
    }

    return sessions;
  }, [journal]);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-extrabold text-text-primary tracking-tight">
          Trading Performance & Behavioral Analytics
        </h2>
        <p className="text-xs text-text-secondary mt-0.5">
          Data-driven insights: P&L Calendar, Gross vs Net tax drain, setup edge, and psychological impact
        </p>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setAnalyticsTab("OVERVIEW")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            analyticsTab === "OVERVIEW"
              ? "bg-brand-accent text-bg-primary shadow-sm"
              : "bg-bg-secondary text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Institutional Overview</span>
        </button>

        <button
          onClick={() => setAnalyticsTab("TIME_OF_DAY")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            analyticsTab === "TIME_OF_DAY"
              ? "bg-brand-accent text-bg-primary shadow-sm"
              : "bg-bg-secondary text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Time-of-Day Edge Matrix</span>
        </button>

        <button
          onClick={() => setAnalyticsTab("MFE_MAE")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            analyticsTab === "MFE_MAE"
              ? "bg-brand-accent text-bg-primary shadow-sm"
              : "bg-bg-secondary text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>MAE / MFE Excursions</span>
        </button>

        <button
          onClick={() => setAnalyticsTab("COST_INDISCIPLINE")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            analyticsTab === "COST_INDISCIPLINE"
              ? "bg-brand-accent text-bg-primary shadow-sm"
              : "bg-bg-secondary text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
          }`}
        >
          <AlertOctagon className="w-3.5 h-3.5" />
          <span>Cost of Indiscipline</span>
        </button>
      </div>

      {/* Tab: Time of Day Matrix */}
      {analyticsTab === "TIME_OF_DAY" && (
        <TimeOfDayHeatmap matrix={analytics.timeOfDayMatrix} />
      )}

      {/* Tab: MAE / MFE Excursion Analytics */}
      {analyticsTab === "MFE_MAE" && (
        <MfeMaeScatterChart data={analytics.mfeMaeAnalytics} />
      )}

      {/* Tab: Cost of Indiscipline */}
      {analyticsTab === "COST_INDISCIPLINE" && (
        <CostOfIndisciplineCard costData={analytics.costOfIndiscipline} />
      )}

      {/* Tab: Institutional Overview */}
      {analyticsTab === "OVERVIEW" && (
        <>
          {/* Top Metrics Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Net Realized P&L"
              value={
                <span className={analytics.netPnL >= 0 ? "text-brand-positive" : "text-brand-negative"}>
                  {analytics.netPnL >= 0 ? "+₹" : "-₹"}
                  {Math.abs(analytics.netPnL).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              }
              subtitle={`Gross: ₹${analytics.grossPnL.toLocaleString("en-IN")}`}
              icon={<TrendingUp className="w-4 h-4" />}
            />

            <StatCard
              title="Total Taxes & Brokerage"
              value={
                <span className="text-amber-400">
                  -₹{analytics.totalCharges.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              }
              subtitle="STT + GST + Exchange + Stamp"
              icon={<AlertTriangle className="w-4 h-4" />}
            />

            <StatCard
              title="Trade Expectancy"
              value={`₹${analytics.expectancy}`}
              subtitle={analytics.expectancy > 0 ? "Positive Math Edge / Trade" : "Negative Edge"}
              trend={{
                value: `${analytics.winRate}%`,
                isPositive: analytics.winRate >= 50,
                label: "Win Rate"
              }}
              icon={<BarChart2 className="w-4 h-4" />}
            />

            <StatCard
              title="Profit Factor"
              value={analytics.profitFactor.toFixed(2)}
              subtitle={`Avg Win ₹${analytics.averageWin} | Avg Loss ₹${analytics.averageLoss}`}
              icon={<PieChart className="w-4 h-4" />}
            />
          </div>

          {/* Cost of Indiscipline Card Highlight */}
          <CostOfIndisciplineCard costData={analytics.costOfIndiscipline} />

      {/* Interactive P&L Calendar Heatmap */}
      <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-brand-accent" />
            <h3 className="text-base font-bold text-text-primary">
              P&L Calendar Heatmap — {monthName}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-xl bg-bg-secondary border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-xl bg-bg-secondary border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-bold text-text-muted uppercase tracking-wider py-1 border-b border-border-subtle">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((item, idx) => {
            if (!item) {
              return <div key={`empty-${idx}`} className="h-20 rounded-2xl bg-bg-secondary/20" />;
            }

            const hasTrades = item.count > 0;
            const isProfit = item.pnl > 0;
            const isLoss = item.pnl < 0;

            let bgClass = "bg-bg-secondary/60 hover:bg-bg-elevated";
            if (hasTrades) {
              if (isProfit) {
                bgClass = item.pnl > 2000
                  ? "bg-emerald-950/70 border-emerald-500/50 hover:border-emerald-400"
                  : "bg-emerald-950/40 border-emerald-700/30 hover:border-emerald-500";
              } else if (isLoss) {
                bgClass = Math.abs(item.pnl) > 1500
                  ? "bg-rose-950/70 border-rose-500/50 hover:border-rose-400"
                  : "bg-rose-950/40 border-rose-700/30 hover:border-rose-500";
              }
            }

            return (
              <div
                key={item.dateStr}
                onClick={() => {
                  if (hasTrades) {
                    setSelectedDayTrades({
                      date: item.dateStr,
                      trades: tradesByDate.get(item.dateStr) || []
                    });
                  }
                }}
                className={`h-20 p-2 rounded-2xl border transition-all flex flex-col justify-between select-none ${
                  hasTrades ? "cursor-pointer shadow-sm hover:scale-[1.02]" : "border-border-subtle/50 opacity-60"
                } ${bgClass}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-muted">{item.day}</span>
                  {hasTrades && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-black/40 text-text-muted">
                      {item.count} {item.count === 1 ? "trade" : "trades"}
                    </span>
                  )}
                </div>

                {hasTrades ? (
                  <div>
                    <span
                      className={`text-xs font-extrabold block ${
                        isProfit ? "text-emerald-400" : isLoss ? "text-rose-400" : "text-text-muted"
                      }`}
                    >
                      {item.pnl >= 0 ? "+₹" : "-₹"}{Math.abs(item.pnl).toLocaleString("en-IN")}
                    </span>
                  </div>
                ) : (
                  <span className="text-[10px] text-text-muted/40 font-mono">—</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Trades Drawer / View */}
      {selectedDayTrades && (
        <div className="p-5 rounded-3xl bg-bg-card border border-brand-accent/50 animate-fadeIn space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-text-primary">
                Trades on {selectedDayTrades.date} ({selectedDayTrades.trades.length} trades)
              </h4>
              <p className="text-xs text-text-muted">
                Daily Net P&L:{" "}
                <strong
                  className={
                    selectedDayTrades.trades.reduce((a, b) => a + b.netPnL, 0) >= 0
                      ? "text-brand-positive"
                      : "text-brand-negative"
                  }
                >
                  ₹{selectedDayTrades.trades.reduce((a, b) => a + b.netPnL, 0).toLocaleString("en-IN")}
                </strong>
              </p>
            </div>
            <button
              onClick={() => setSelectedDayTrades(null)}
              className="text-xs text-text-muted hover:text-text-primary px-3 py-1 rounded-lg bg-bg-secondary"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            {selectedDayTrades.trades.map(t => (
              <div
                key={t.id}
                onClick={() => setSelectedTrade(t)}
                className="p-3.5 rounded-2xl bg-bg-secondary border border-border-subtle hover:border-brand-accent/60 cursor-pointer transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-text-primary text-xs">{t.stockSymbol}</span>
                  <Badge variant={t.direction === "BUY" ? "positive" : "negative"} size="sm">
                    {t.direction}
                  </Badge>
                </div>
                <div className="text-[11px] text-text-muted">
                  ₹{t.entryPrice} → {t.exitPrice ? `₹${t.exitPrice}` : "Open"} ({t.quantity} qty)
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border-subtle/50 text-xs">
                  <span className="text-[10px] text-text-muted">{t.setup}</span>
                  <span className={`font-bold ${t.netPnL >= 0 ? "text-brand-positive" : "text-brand-negative"}`}>
                    {t.netPnL >= 0 ? "+₹" : "-₹"}{Math.abs(t.netPnL).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gross vs Net Taxes Breakdown Card */}
      <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle space-y-4">
        <div>
          <h3 className="text-sm font-bold text-text-primary">
            Indian Regulatory Taxes vs Gross Profit Drain
          </h3>
          <p className="text-xs text-text-muted">
            The hidden cost of overtrading: STT, GST (18%), Stamp Duty, and Exchange fees
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-bg-secondary border border-border-subtle flex flex-col justify-between">
            <span className="text-xs text-text-muted">Total Gross Trading Profit</span>
            <div className="text-2xl font-extrabold text-brand-positive mt-1">
              ₹{analytics.grossPnL.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-text-muted mt-2">What you earned from market movements</span>
          </div>

          <div className="p-4 rounded-2xl bg-bg-secondary border border-border-subtle flex flex-col justify-between">
            <span className="text-xs text-text-muted">Total Government & Brokerage Drain</span>
            <div className="text-2xl font-extrabold text-amber-400 mt-1">
              -₹{analytics.totalCharges.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-amber-400 mt-2">
              {analytics.grossPnL > 0
                ? `${Math.round((analytics.totalCharges / analytics.grossPnL) * 100)}% of your gross profit taken by taxes`
                : "Regulatory friction"}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-bg-secondary border border-border-subtle flex flex-col justify-between">
            <span className="text-xs text-text-muted">Actual Net Bankable P&L</span>
            <div
              className={`text-2xl font-extrabold mt-1 ${
                analytics.netPnL >= 0 ? "text-brand-positive" : "text-brand-negative"
              }`}
            >
              {analytics.netPnL >= 0 ? "+₹" : "-₹"}
              {Math.abs(analytics.netPnL).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-text-muted mt-2">Realized money credited to your account</span>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Strategy Matrix & Psychological Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strategy Performance Matrix */}
        <div className="p-5 rounded-3xl bg-bg-card border border-border-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-brand-accent" />
                Setup & Strategy Matrix
              </h3>
              <p className="text-xs text-text-muted">Which setup delivers positive mathematical expectancy?</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border-subtle text-text-muted uppercase text-[10px]">
                <tr>
                  <th className="pb-2 font-semibold">Strategy</th>
                  <th className="pb-2 font-semibold">Trades</th>
                  <th className="pb-2 font-semibold">Win Rate</th>
                  <th className="pb-2 font-semibold">Profit Factor</th>
                  <th className="pb-2 font-semibold text-right">Net P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50">
                {analytics.setupPerformance.map(s => (
                  <tr key={s.setup} className="hover:bg-bg-elevated/40 transition-colors">
                    <td className="py-2.5 font-bold text-text-primary">{s.setup}</td>
                    <td className="py-2.5 text-text-secondary">{s.trades}</td>
                    <td className="py-2.5">
                      <span className={`font-semibold ${s.winRate >= 50 ? "text-brand-positive" : "text-brand-negative"}`}>
                        {s.winRate}%
                      </span>
                    </td>
                    <td className="py-2.5 font-mono text-text-primary">{s.profitFactor.toFixed(2)}</td>
                    <td className="py-2.5 text-right font-bold">
                      <span className={s.netPnL >= 0 ? "text-brand-positive" : "text-brand-negative"}>
                        {s.netPnL >= 0 ? "+₹" : "-₹"}{Math.abs(s.netPnL).toLocaleString("en-IN")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Psychology & Emotion Matrix */}
        <div className="p-5 rounded-3xl bg-bg-card border border-border-subtle space-y-4">
          <div>
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
              <Smile className="w-4 h-4 text-blue-400" />
              Mindset & Emotional Correlation
            </h3>
            <p className="text-xs text-text-muted">Direct financial cost of FOMO and Revenge trading</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border-subtle text-text-muted uppercase text-[10px]">
                <tr>
                  <th className="pb-2 font-semibold">Emotion State</th>
                  <th className="pb-2 font-semibold">Trades</th>
                  <th className="pb-2 font-semibold">Win Rate</th>
                  <th className="pb-2 font-semibold text-right">Net P&L Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50">
                {analytics.emotionPerformance.map(e => (
                  <tr key={e.emotion} className="hover:bg-bg-elevated/40 transition-colors">
                    <td className="py-2.5 font-bold text-text-primary">{e.emotion}</td>
                    <td className="py-2.5 text-text-secondary">{e.trades}</td>
                    <td className="py-2.5">
                      <span className={`font-semibold ${e.winRate >= 50 ? "text-brand-positive" : "text-brand-negative"}`}>
                        {e.winRate}%
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-bold">
                      <span className={e.netPnL >= 0 ? "text-brand-positive" : "text-brand-negative"}>
                        {e.netPnL >= 0 ? "+₹" : "-₹"}{Math.abs(e.netPnL).toLocaleString("en-IN")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Day of Week & Session Timing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Day of Week */}
        <div className="p-5 rounded-3xl bg-bg-card border border-border-subtle space-y-4">
          <div>
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4 text-brand-accent" />
              Day-of-the-Week Performance
            </h3>
            <p className="text-xs text-text-muted">Identify your best and worst trading days (e.g. Expiry day)</p>
          </div>

          <div className="space-y-2.5">
            {dayOfWeekStats.map(d => {
              const winRate = d.trades > 0 ? Math.round((d.wins / d.trades) * 100) : 0;
              return (
                <div key={d.day} className="p-3 rounded-2xl bg-bg-secondary border border-border-subtle flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-text-primary">{d.day}</span>
                    <span className="text-[11px] text-text-muted block">
                      {d.trades} trades • {winRate}% win rate
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`font-extrabold text-sm ${d.pnl >= 0 ? "text-brand-positive" : "text-brand-negative"}`}>
                      {d.pnl >= 0 ? "+₹" : "-₹"}{Math.abs(d.pnl).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Session Timing */}
        <div className="p-5 rounded-3xl bg-bg-card border border-border-subtle space-y-4">
          <div>
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-brand-accent" />
              Market Timing & Session Heatmap
            </h3>
            <p className="text-xs text-text-muted">Morning 9:15 volatility vs Mid-day consolidation</p>
          </div>

          <div className="space-y-2.5">
            {sessionStats.map(s => {
              const winRate = s.trades > 0 ? Math.round((s.wins / s.trades) * 100) : 0;
              return (
                <div key={s.name} className="p-3.5 rounded-2xl bg-bg-secondary border border-border-subtle flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-text-primary">{s.name}</span>
                    <span className="text-[11px] text-text-muted block">
                      {s.trades} trades • {winRate}% win rate
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`font-extrabold text-sm ${s.pnl >= 0 ? "text-brand-positive" : "text-brand-negative"}`}>
                      {s.pnl >= 0 ? "+₹" : "-₹"}{Math.abs(s.pnl).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      </>
      )}

      {/* Trade Detail Modal */}
      <TradeDetailModal
        trade={selectedTrade}
        isOpen={!!selectedTrade}
        onClose={() => setSelectedTrade(null)}
      />
    </div>
  );
};
