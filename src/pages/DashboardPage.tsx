import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { useMarketData } from "../context/MarketDataContext";
import { StatCard } from "../components/common/StatCard";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";
import { EquityCurveChart } from "../components/charts/EquityCurveChart";
import { TradeDetailModal } from "../components/modals/TradeDetailModal";
import { BrokerImportModal } from "../components/modals/BrokerImportModal";
import { PrePostMarketModal } from "../components/modals/PrePostMarketModal";
import { JournalEntry } from "../types";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  UploadCloud,
  Sun,
  Moon,
  Sparkles,
  ShieldAlert,
  Calculator,
  ChevronRight,
  BookOpen,
  Flame
} from "lucide-react";

export const DashboardPage: React.FC = () => {
  const {
    journal,
    analytics,
    discipline,
    todayPnL,
    todayTradesCount,
    todayRiskUsed,
    preferences,
    setIsNewTradeModalOpen,
    setActiveTab
  } = useApp();

  const { indices, quotes, openStockModal } = useMarketData();

  const [selectedTrade, setSelectedTrade] = useState<JournalEntry | null>(null);
  const [isBrokerImportOpen, setIsBrokerImportOpen] = useState(false);
  const [isPrePostModalOpen, setIsPrePostModalOpen] = useState(false);
  const [prePostMode, setPrePostMode] = useState<"PRE" | "POST">("PRE");

  const recentTrades = journal.slice(0, 5);

  // Daily Loss Limit circuit breaker calculations
  const maxLoss = preferences.maxDailyLoss || 1000;
  const currentLoss = todayPnL < 0 ? Math.abs(todayPnL) : 0;
  const lossPercentage = Math.min(100, Math.round((currentLoss / maxLoss) * 100));
  const isCircuitBreakerHit = currentLoss >= maxLoss;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Indian Indices Live Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {indices.map(idx => (
          <div
            key={idx.symbol}
            onClick={() => openStockModal(idx.symbol)}
            className="p-3.5 rounded-2xl bg-bg-card border border-border-subtle hover:border-brand-accent/50 cursor-pointer transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-secondary">{idx.name}</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  idx.isPositive ? "bg-brand-positive/10 text-brand-positive" : "bg-brand-negative/10 text-brand-negative"
                }`}
              >
                {idx.isPositive ? "+" : ""}{idx.changePercent}%
              </span>
            </div>
            <div className="mt-1">
              <div className="text-base font-extrabold text-text-primary">
                ₹{idx.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
              <div className={`text-[11px] font-semibold ${idx.isPositive ? "text-brand-positive" : "text-brand-negative"}`}>
                {idx.isPositive ? "+" : ""}{idx.change.toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* NIFTY 50 Algorithmic Analysis Platform Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-bg-card via-bg-card to-emerald-950/25 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 shadow-sm">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-text-primary">
                NIFTY 50 Algorithmic Decision & Analysis Platform
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                5-Star Setups
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              52W Breakouts, Camarilla pivots, Open=Low/High patterns & institutional turnover across Nifty 50 companies.
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveTab("tradepulse")}
          className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-dark-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all flex-shrink-0"
        >
          <span>Launch NIFTY 50 Platform</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Circuit Breaker Warning Alert if loss limit exceeded */}
      {isCircuitBreakerHit && (
        <div className="p-4 rounded-2xl bg-brand-negative/15 border border-brand-negative/40 text-brand-negative flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-brand-negative" />
            <div>
              <h4 className="text-sm font-bold">Daily Max Loss Limit Reached (₹{maxLoss})</h4>
              <p className="text-xs opacity-90">
                Stop trading for today. Respect your risk rules and protect your capital.
              </p>
            </div>
          </div>
          <Badge variant="negative" size="sm">Trading Circuit Breaker Active</Badge>
        </div>
      )}

      {/* Hero Welcome & Quick Action CTAs */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-bg-card via-bg-card to-bg-elevated border border-border-subtle flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="accent" size="sm">NSE & BSE F&O Journal</Badge>
            <span className="text-xs text-text-muted">Pro Terminal</span>
          </div>
          <h2 className="text-xl font-extrabold text-text-primary tracking-tight">
            Indian Stock Market Trading Journal
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Track setups, audit regulatory charges & STT, enforce discipline, and master your trading psychology.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={<Sun className="w-3.5 h-3.5 text-amber-400" />}
            onClick={() => {
              setPrePostMode("PRE");
              setIsPrePostModalOpen(true);
            }}
          >
            Pre-Market
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={<Moon className="w-3.5 h-3.5 text-indigo-400" />}
            onClick={() => {
              setPrePostMode("POST");
              setIsPrePostModalOpen(true);
            }}
          >
            Post-Market
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={<UploadCloud className="w-3.5 h-3.5 text-brand-accent" />}
            onClick={() => setIsBrokerImportOpen(true)}
          >
            Import Broker CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsNewTradeModalOpen(true)}
          >
            Log Trade
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Realized Net P&L"
          value={
            <span className={todayPnL >= 0 ? "text-brand-positive" : "text-brand-negative"}>
              {todayPnL >= 0 ? "+₹" : "-₹"}{Math.abs(todayPnL).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          }
          subtitle={`${todayTradesCount} Trades taken today`}
          icon={<TrendingUp className="w-4 h-4" />}
        />

        <StatCard
          title="Overall Win Rate"
          value={`${analytics.winRate}%`}
          subtitle={`${analytics.winningTrades} Wins / ${analytics.losingTrades} Losses`}
          trend={{
            value: analytics.winLossRatio,
            isPositive: analytics.winRate >= 50,
            label: "Ratio"
          }}
          icon={<Sparkles className="w-4 h-4" />}
        />

        <StatCard
          title="Profit Factor"
          value={analytics.profitFactor.toFixed(2)}
          subtitle={analytics.profitFactor >= 1.5 ? "Profitable Edge" : "Needs Improvement"}
          trend={{
            value: `₹${analytics.expectancy}/trade`,
            isPositive: analytics.expectancy > 0,
            label: "Expectancy"
          }}
          icon={<Calculator className="w-4 h-4" />}
        />

        <StatCard
          title="Discipline Score"
          value={`${discipline.overallScore}/100`}
          subtitle="Process > Profits"
          trend={{
            value: `${discipline.stopLossDisciplineScore}%`,
            isPositive: discipline.overallScore >= 75,
            label: "SL Rule"
          }}
          icon={<ShieldAlert className="w-4 h-4" />}
        />
      </div>

      {/* Main Grid: Equity Curve Chart + Risk & Discipline Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equity Curve (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-bg-card border border-border-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-text-primary">Cumulative Net P&L Curve</h3>
              <p className="text-xs text-text-muted">Account Equity trajectory factoring all Indian taxes & brokerage</p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-text-muted block">Net Account Realized P&L</span>
              <span className={`text-base font-extrabold ${analytics.netPnL >= 0 ? "text-brand-positive" : "text-brand-negative"}`}>
                {analytics.netPnL >= 0 ? "+₹" : "-₹"}{Math.abs(analytics.netPnL).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <EquityCurveChart data={analytics.equityCurve} height={256} className="w-full" />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border-subtle text-xs text-text-muted mt-2">
            <span>Gross Profit: ₹{analytics.grossPnL.toLocaleString("en-IN")}</span>
            <span className="text-amber-400">Total Charges/Taxes: -₹{analytics.totalCharges.toLocaleString("en-IN")}</span>
            <span>Max Drawdown: {analytics.maxDrawdownPercent}%</span>
          </div>
        </div>

        {/* Daily Risk Guardian & Quick Discipline (1 col) */}
        <div className="p-5 rounded-3xl bg-bg-card border border-border-subtle flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-brand-accent" />
              Daily Risk Guardian
            </h3>
            <p className="text-xs text-text-muted">Prevents revenge trading and catastrophic drawdowns</p>
          </div>

          {/* Loss Limit Progress */}
          <div className="p-4 rounded-2xl bg-bg-secondary border border-border-subtle space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-text-secondary">Max Daily Loss Budget</span>
              <span className="text-text-primary font-bold">₹{currentLoss} / ₹{maxLoss}</span>
            </div>
            <div className="w-full bg-bg-elevated h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  lossPercentage >= 80 ? "bg-brand-negative" : lossPercentage >= 50 ? "bg-amber-400" : "bg-brand-positive"
                }`}
                style={{ width: `${lossPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-text-muted">
              <span>{lossPercentage}% Risk Consumed</span>
              <span>{maxLoss - currentLoss > 0 ? `₹${maxLoss - currentLoss} Left` : "Cap Reached"}</span>
            </div>
          </div>

          {/* Key Discipline Breakdown */}
          <div className="space-y-2 text-xs">
            <span className="font-bold text-text-secondary uppercase tracking-wider block text-[10px]">
              Discipline Pillar Adherence
            </span>
            <div className="flex items-center justify-between p-2 rounded-xl bg-bg-secondary/60">
              <span className="text-text-muted">Stop Loss Adherence</span>
              <span className="font-bold text-brand-positive">{discipline.stopLossDisciplineScore}%</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-bg-secondary/60">
              <span className="text-text-muted">Overtrading Control</span>
              <span className="font-bold text-brand-positive">{discipline.overtradingControlScore}%</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-bg-secondary/60">
              <span className="text-text-muted">Plan Followed Rate</span>
              <span className="font-bold text-brand-positive">{discipline.planAdherenceScore}%</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab("psychology")}
            className="w-full justify-between"
          >
            <span>View Discipline Scorecard</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Recent Trades Table Section */}
      <div className="p-5 rounded-3xl bg-bg-card border border-border-subtle">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-text-primary">Recent Trades</h3>
            <p className="text-xs text-text-muted">Latest logged trades with exact net P&L and setup tags</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("journal")}
            icon={<BookOpen className="w-4 h-4" />}
          >
            View Full Journal ({journal.length})
          </Button>
        </div>

        {recentTrades.length === 0 ? (
          <div className="text-center py-10 text-xs text-text-muted">
            No trades logged yet. Click "Log Trade" or "Import Broker CSV" to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border-subtle text-text-muted uppercase text-[10px] tracking-wider">
                  <th className="pb-2.5 font-semibold">Date & Time</th>
                  <th className="pb-2.5 font-semibold">Instrument</th>
                  <th className="pb-2.5 font-semibold">Side</th>
                  <th className="pb-2.5 font-semibold">Entry / Exit</th>
                  <th className="pb-2.5 font-semibold">Qty</th>
                  <th className="pb-2.5 font-semibold">Setup</th>
                  <th className="pb-2.5 font-semibold">Taxes & Charges</th>
                  <th className="pb-2.5 font-semibold text-right">Net P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50">
                {recentTrades.map(t => {
                  const isWin = t.netPnL > 0;
                  const isLoss = t.netPnL < 0;
                  return (
                    <tr
                      key={t.id}
                      onClick={() => setSelectedTrade(t)}
                      className="hover:bg-bg-elevated cursor-pointer transition-colors"
                    >
                      <td className="py-3 text-text-muted whitespace-nowrap">
                        {t.date} <span className="text-[10px]">{t.time}</span>
                      </td>
                      <td className="py-3 font-bold text-text-primary whitespace-nowrap">
                        {t.stockSymbol}
                      </td>
                      <td className="py-3 whitespace-nowrap">
                        <Badge variant={t.direction === "BUY" ? "positive" : "negative"} size="sm">
                          {t.direction}
                        </Badge>
                      </td>
                      <td className="py-3 text-text-secondary whitespace-nowrap">
                        ₹{t.entryPrice} → {t.exitPrice ? `₹${t.exitPrice}` : "Open"}
                      </td>
                      <td className="py-3 font-medium text-text-primary whitespace-nowrap">
                        {t.quantity}
                      </td>
                      <td className="py-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-bg-secondary border border-border-subtle text-[11px] text-text-secondary font-medium">
                          {t.setup}
                        </span>
                      </td>
                      <td className="py-3 text-amber-400 font-mono text-[11px] whitespace-nowrap">
                        -₹{t.estimatedCharges}
                      </td>
                      <td className="py-3 text-right font-extrabold whitespace-nowrap">
                        <span className={isWin ? "text-brand-positive" : isLoss ? "text-brand-negative" : "text-text-secondary"}>
                          {t.netPnL >= 0 ? "+₹" : "-₹"}{Math.abs(t.netPnL).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <TradeDetailModal
        trade={selectedTrade}
        isOpen={!!selectedTrade}
        onClose={() => setSelectedTrade(null)}
      />

      <BrokerImportModal
        isOpen={isBrokerImportOpen}
        onClose={() => setIsBrokerImportOpen(false)}
      />

      <PrePostMarketModal
        isOpen={isPrePostModalOpen}
        onClose={() => setIsPrePostModalOpen(false)}
        defaultMode={prePostMode}
      />
    </div>
  );
};
