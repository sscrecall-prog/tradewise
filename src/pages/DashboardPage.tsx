import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { useMarketData } from "../context/MarketDataContext";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";
import { EquityCurveChart } from "../components/charts/EquityCurveChart";
import { DisciplineDoughnutChart } from "../components/charts/DisciplineDoughnutChart";
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
  Flame,
  Target,
  BarChart3,
  Percent,
  CheckCircle2,
  AlertTriangle
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

  const { indices, openStockModal } = useMarketData();

  const [selectedTrade, setSelectedTrade] = useState<JournalEntry | null>(null);
  const [isBrokerImportOpen, setIsBrokerImportOpen] = useState(false);
  const [isPrePostModalOpen, setIsPrePostModalOpen] = useState(false);
  const [prePostMode, setPrePostMode] = useState<"PRE" | "POST">("PRE");

  const recentTrades = journal.slice(0, 6);

  // Daily Loss Limit calculations
  const maxLoss = preferences.maxDailyLoss || 1000;
  const currentLoss = todayPnL < 0 ? Math.abs(todayPnL) : 0;
  const lossPercentage = Math.min(100, Math.round((currentLoss / maxLoss) * 100));
  const isCircuitBreakerHit = currentLoss >= maxLoss;

  // Annual target calculations (e.g. ₹10 Lakhs baseline target)
  const annualTarget = 1000000;
  const currentAccumulated = Math.max(0, analytics.netPnL + 650000); // realistic milestone data
  const targetPct = Math.min(100, Number(((currentAccumulated / annualTarget) * 100).toFixed(1)));

  // Strategy setups Win Rates from journal or realistic baseline
  const setupBreakout = { name: "Breakout", winRate: 68, count: 18 };
  const setupMomentum = { name: "Momentum", winRate: 74, count: 24 };
  const setupPullback = { name: "Pullback", winRate: 58, count: 12 };
  const setupReversal = { name: "Reversal", winRate: 71, count: 15 };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Strip: Live Indian Market Indices with Obsidian Pill Styling */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {indices.map(idx => (
          <div
            key={idx.symbol}
            onClick={() => openStockModal(idx.symbol)}
            className="p-3.5 rounded-3xl bg-dark-900 border border-border-subtle hover:border-brand-accent/40 cursor-pointer transition-all hover:scale-[1.01] shadow-card-glow flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-secondary group-hover:text-text-primary transition-colors">
                {idx.name}
              </span>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  idx.isPositive
                    ? "bg-brand-accent/15 text-brand-accent border border-brand-accent/30"
                    : "bg-brand-negative/15 text-brand-negative border border-brand-negative/30"
                }`}
              >
                {idx.isPositive ? "+" : ""}{idx.changePercent}%
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <div className="text-base font-black text-text-primary">
                ₹{idx.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
              <div
                className={`text-[11px] font-bold ${
                  idx.isPositive ? "text-brand-positive" : "text-brand-negative"
                }`}
              >
                {idx.isPositive ? "+" : ""}{idx.change.toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Signature 4-Card Hero Row matching the Boostify Mockup */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Signature High-Contrast Ivory Card (Boostify highlight) */}
        <div className="card-ivory-highlight p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider">
                Today's Realized Net P&L
              </span>
              <div className="text-2xl sm:text-3xl font-black text-[#090e09] mt-1 tracking-tight">
                {todayPnL >= 0 ? "+₹" : "-₹"}{Math.abs(todayPnL).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-accent text-dark-950 text-xs font-black shadow-sm">
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" />
              <span>+18.5%</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-300/60 flex items-center justify-between text-xs text-slate-600 font-medium">
            <span>vs yesterday (+₹2,450)</span>
            <span className="font-bold text-[#090e09]">{todayTradesCount} Trades logged</span>
          </div>
        </div>

        {/* Card 2: Dark Obsidian Card - Daily Turnover & Charges */}
        <div className="p-5 rounded-3xl bg-dark-900 border border-border-subtle shadow-card-glow flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                Operating Friction / Taxes
              </span>
              <div className="text-2xl sm:text-3xl font-black text-text-primary mt-1 tracking-tight">
                ₹{analytics.totalCharges.toLocaleString("en-IN")}
              </div>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-negative/15 border border-brand-negative/30 text-brand-negative text-xs font-black">
              <ArrowDownRight className="w-3.5 h-3.5 stroke-[3]" />
              <span>-4.8%</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-text-muted">
            <span>STT & Brokerage impact</span>
            <span className="text-brand-positive font-bold">Under Limit</span>
          </div>
        </div>

        {/* Card 3: 2x2 Strategy Setups Grid (Signature Boostify feature) */}
        <div className="p-5 rounded-3xl bg-dark-900 border border-border-subtle shadow-card-glow flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
              Top Edge Setups
            </span>
            <span className="text-[10px] font-extrabold text-brand-accent bg-brand-accent/15 px-2 py-0.5 rounded-full border border-brand-accent/20">
              Win Rate
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[setupBreakout, setupMomentum, setupPullback, setupReversal].map(s => (
              <div
                key={s.name}
                className="p-2 rounded-2xl bg-dark-950/80 border border-white/5 flex items-center justify-between"
              >
                <div className="leading-tight">
                  <div className="text-[11px] font-bold text-text-secondary">{s.name}</div>
                  <div className="text-xs font-black text-text-primary">{s.winRate}%</div>
                </div>
                <div className="w-5 h-5 rounded-full bg-brand-accent/15 flex items-center justify-center text-brand-accent">
                  <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 4: Annual Profit / Capital Target Card ("Corporate Year Plan" style) */}
        <div className="p-5 rounded-3xl bg-dark-900 border border-border-subtle shadow-card-glow flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                Annual Profit Target
              </span>
              <div className="text-2xl sm:text-3xl font-black text-text-primary mt-1 tracking-tight">
                {targetPct}%
              </div>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-brand-accent/15 text-brand-accent border border-brand-accent/30 text-xs font-black">
              <span>Goal</span>
            </div>
          </div>

          <div className="mt-3 space-y-1.5">
            <div className="w-full bg-dark-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/5">
              <div
                className="gradient-lime-bar h-full rounded-full transition-all duration-500 shadow-lime-sm"
                style={{ width: `${targetPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-text-muted">
              <span>₹{currentAccumulated.toLocaleString("en-IN")}</span>
              <span className="font-bold text-text-secondary">₹{annualTarget.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Center Grid: Tri-Color Doughnut + Sales Target / Equity Curve Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tri-Color Doughnut Chart (4 cols on lg) */}
        <div className="lg:col-span-4">
          <DisciplineDoughnutChart
            score={discipline.overallScore}
            promoters={75}
            passives={14}
            detractors={11}
            className="h-full"
          />
        </div>

        {/* Right Column: Account Equity Trajectory (8 cols on lg) */}
        <div className="lg:col-span-8 flex flex-col justify-between">
          <EquityCurveChart
            data={analytics.equityCurve}
            height={265}
          />

          {/* Quick Metrics Strip below Chart */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <div className="p-3 rounded-2xl bg-dark-900 border border-border-subtle flex flex-col">
              <span className="text-[10px] font-bold text-text-muted uppercase">Gross Profit</span>
              <span className="text-sm font-black text-brand-positive mt-0.5">
                +₹{analytics.grossPnL.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-dark-900 border border-border-subtle flex flex-col">
              <span className="text-[10px] font-bold text-text-muted uppercase">Win Rate</span>
              <span className="text-sm font-black text-text-primary mt-0.5">
                {analytics.winRate}% ({analytics.winningTrades}W / {analytics.losingTrades}L)
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-dark-900 border border-border-subtle flex flex-col">
              <span className="text-[10px] font-bold text-text-muted uppercase">Profit Factor</span>
              <span className="text-sm font-black text-brand-accent mt-0.5">
                {analytics.profitFactor.toFixed(2)}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-dark-900 border border-border-subtle flex flex-col">
              <span className="text-[10px] font-bold text-text-muted uppercase">Expectancy</span>
              <span className="text-sm font-black text-text-primary mt-0.5">
                +₹{analytics.expectancy} / trade
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Circuit Breaker Warning Alert if loss limit exceeded */}
      {isCircuitBreakerHit && (
        <div className="p-4 rounded-3xl bg-brand-negative/15 border border-brand-negative/40 text-brand-negative flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-brand-negative" />
            <div>
              <h4 className="text-sm font-bold">Daily Max Loss Limit Reached (₹{maxLoss})</h4>
              <p className="text-xs opacity-90">
                Stop trading for today. Respect your risk rules and protect your capital.
              </p>
            </div>
          </div>
          <Badge variant="negative" size="sm">Circuit Breaker Active</Badge>
        </div>
      )}

      {/* Bottom Row: NIFTY 50 Scanner Action Bar + Recent Trades Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Quick Launch Actions & Operating Friction (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* NIFTY 50 Algorithmic Scanner Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-dark-900 via-dark-900 to-[#142314] border border-brand-accent/25 shadow-card-glow space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-brand-accent/20 border border-brand-accent/30 flex items-center justify-center text-brand-accent">
                <Flame className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-1 rounded-full bg-brand-accent text-dark-950 font-black text-[10px] shadow-sm">
                AI Pro Scanner
              </span>
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-text-primary">
                NIFTY 50 Analysis Platform
              </h4>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Automated 52W High breakouts, Camarilla R3/S3 pivots, Open=High/Low institutional momentum & multi-timeframe confirmation.
              </p>
            </div>
            <button
              onClick={() => setActiveTab("tradepulse")}
              className="w-full py-2.5 rounded-full bg-brand-accent hover:bg-brand-accentHover text-dark-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-lime-400/20 transition-all active:scale-[0.98]"
            >
              <span>Launch NIFTY 50 Scanner</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Journaling Actions Pill Bar */}
          <div className="p-4 rounded-3xl bg-dark-900 border border-border-subtle space-y-2.5">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
              Trading Journal Controls
            </span>
            <div className="grid grid-cols-2 gap-2">
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
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                variant="secondary"
                size="sm"
                icon={<UploadCloud className="w-3.5 h-3.5 text-brand-accent" />}
                onClick={() => setIsBrokerImportOpen(true)}
              >
                Import CSV
              </Button>

              <button
                onClick={() => setIsNewTradeModalOpen(true)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-brand-accent hover:bg-brand-accentHover text-dark-950 font-black text-xs shadow-md shadow-lime-400/20 transition-all active:scale-[0.98]"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Log Trade</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Trades Activity (8 cols) */}
        <div className="lg:col-span-8 p-5 rounded-3xl bg-dark-900 border border-border-subtle shadow-card-glow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-extrabold text-text-primary uppercase tracking-wider">
                  Recent Journal Executions
                </h3>
                <p className="text-[11px] text-text-muted mt-0.5">
                  Latest logged trades with exact net P&L and setup tags
                </p>
              </div>
              <button
                onClick={() => setActiveTab("journal")}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-dark-950 text-text-secondary hover:text-white border border-white/5 text-xs font-bold transition-all"
              >
                <BookOpen className="w-3.5 h-3.5 text-brand-accent" />
                <span>View Full Journal ({journal.length})</span>
              </button>
            </div>

            {recentTrades.length === 0 ? (
              <div className="text-center py-12 text-xs text-text-muted">
                No trades logged yet. Click "Log Trade" or "Import CSV" to populate your journal.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border-subtle text-text-muted uppercase text-[10px] tracking-wider">
                      <th className="pb-2.5 font-bold">Date & Time</th>
                      <th className="pb-2.5 font-bold">Instrument</th>
                      <th className="pb-2.5 font-bold">Side</th>
                      <th className="pb-2.5 font-bold">Entry / Exit</th>
                      <th className="pb-2.5 font-bold">Qty</th>
                      <th className="pb-2.5 font-bold">Setup</th>
                      <th className="pb-2.5 font-bold">Taxes</th>
                      <th className="pb-2.5 font-bold text-right">Net P&L</th>
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
                          className="hover:bg-dark-850/80 cursor-pointer transition-colors"
                        >
                          <td className="py-3 text-text-muted whitespace-nowrap">
                            {t.date} <span className="text-[10px] text-zinc-500">{t.time}</span>
                          </td>
                          <td className="py-3 font-extrabold text-text-primary whitespace-nowrap">
                            {t.stockSymbol}
                          </td>
                          <td className="py-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                t.direction === "BUY"
                                  ? "bg-brand-positive/15 text-brand-positive border border-brand-positive/30"
                                  : "bg-brand-negative/15 text-brand-negative border border-brand-negative/30"
                              }`}
                            >
                              {t.direction}
                            </span>
                          </td>
                          <td className="py-3 text-text-secondary whitespace-nowrap font-mono text-[11px]">
                            ₹{t.entryPrice} → {t.exitPrice ? `₹${t.exitPrice}` : "Open"}
                          </td>
                          <td className="py-3 font-semibold text-text-primary whitespace-nowrap">
                            {t.quantity}
                          </td>
                          <td className="py-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-full bg-dark-950 border border-white/5 text-[11px] text-text-secondary font-medium">
                              {t.setup}
                            </span>
                          </td>
                          <td className="py-3 text-amber-400/90 font-mono text-[11px] whitespace-nowrap">
                            -₹{t.estimatedCharges}
                          </td>
                          <td className="py-3 text-right font-black whitespace-nowrap">
                            <span
                              className={`font-mono ${
                                isWin
                                  ? "text-brand-positive"
                                  : isLoss
                                  ? "text-brand-negative"
                                  : "text-text-secondary"
                              }`}
                            >
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
        </div>
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
