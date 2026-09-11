import React, { useMemo } from 'react';
import { MarketQuote, TradeDirection } from '../../types';
import { IntradayConfirmationService, IntradayConfirmationReport } from '../../services/IntradayConfirmationService';
import { useApp } from '../../context/AppContext';
import { useMarketData } from '../../context/MarketDataContext';
import { Button } from './Button';
import { Badge } from './Badge';
import {
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Target,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Layers,
  Sparkles,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';

interface IntradayConfluenceWidgetProps {
  quote: MarketQuote;
  onCloseParentModal?: () => void;
  compact?: boolean;
}

export const IntradayConfluenceWidget: React.FC<IntradayConfluenceWidgetProps> = ({
  quote,
  onCloseParentModal,
  compact = false
}) => {
  const {
    setSelectedStockForOrder,
    setIsPlaceOrderModalOpen,
    openNewTradeModalWithPrefill
  } = useApp();
  const { indices } = useMarketData();

  // Find Nifty 50 change % for alpha calculation
  const niftyQuote = indices.find(i => i.symbol === '^NSEI' || i.name.includes('NIFTY 50'));
  const niftyChange = niftyQuote ? niftyQuote.changePercent : 0.35;

  const report: IntradayConfirmationReport = useMemo(() => {
    return IntradayConfirmationService.analyzeStock(quote, niftyChange);
  }, [quote, niftyChange]);

  const {
    score,
    verdict,
    verdictTitle,
    verdictDescription,
    vwap,
    vwapDeviationPercent,
    openDrive,
    cpr,
    camarilla,
    pillars,
    blueprint,
    rvol,
    alphaVsNifty
  } = report;

  const isBuy = verdict === 'STRONG_BUY' || verdict === 'MODERATE_BUY';
  const isSell = verdict === 'STRONG_SELL' || verdict === 'MODERATE_SELL';
  const isChop = verdict === 'NO_TRADE_CHOP';

  const themeBorder = isBuy
    ? 'border-emerald-500/40 bg-emerald-950/20'
    : isSell
    ? 'border-rose-500/40 bg-rose-950/20'
    : 'border-amber-500/40 bg-amber-950/20';

  const scoreBadgeColor = isBuy
    ? 'bg-emerald-500 text-white'
    : isSell
    ? 'bg-rose-500 text-white'
    : 'bg-amber-500 text-black';

  const handleExecutePaperOrder = () => {
    setSelectedStockForOrder(quote.symbol);
    setIsPlaceOrderModalOpen(true);
    if (onCloseParentModal) onCloseParentModal();
  };

  const handleLogToJournal = () => {
    openNewTradeModalWithPrefill({
      stockSymbol: quote.symbol,
      stockName: quote.name,
      direction: blueprint.action === 'SELL' ? 'SELL' : 'BUY',
      entryPrice: blueprint.entryPrice,
      stopLoss: blueprint.stopLoss,
      targetPrice: blueprint.target1,
      quantity: blueprint.recommendedQuantity,
      setup: isBuy ? 'Breakout' : isSell ? 'Reversal' : 'Trend Continuation',
      notes: `TradeWise Confluence Score: ${score}% • ${verdictTitle} • ${blueprint.strategyRationale}`
    });
    if (onCloseParentModal) onCloseParentModal();
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* 1. Hero Verdict & Confluence Score Header */}
      <div className={`p-4 sm:p-5 rounded-2xl border shadow-lg transition-all ${themeBorder}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black tracking-wide ${scoreBadgeColor}`}>
                {score}% CONFLUENCE
              </span>
              <span className="text-[11px] font-mono text-text-muted flex items-center gap-1">
                <Clock className="w-3 h-3" /> Live Intraday Edge
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-text-primary tracking-tight flex items-center gap-2">
              {isBuy ? (
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              ) : isSell ? (
                <TrendingDown className="w-5 h-5 text-rose-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              )}
              {verdictTitle}
            </h3>
            <p className="text-xs text-text-secondary max-w-xl leading-relaxed">
              {verdictDescription}
            </p>
          </div>

          {/* Quick Pillar Snapshot Pill */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-border-subtle">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">
                NSE Status
              </span>
              <div className="text-sm font-black text-text-primary">
                {openDrive === 'OPEN_LOW' ? (
                  <span className="text-emerald-400">🔥 Open = Low</span>
                ) : openDrive === 'OPEN_HIGH' ? (
                  <span className="text-rose-400">⚠️ Open = High</span>
                ) : (
                  <span>Normal Open</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="px-2 py-0.5 rounded-lg bg-bg-card border border-border-subtle font-mono text-text-secondary text-[11px]">
                VWAP: ₹{vwap.toFixed(2)}
              </span>
              <span className={`px-2 py-0.5 rounded-lg border font-mono font-bold text-[11px] ${
                quote.price >= vwap 
                  ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' 
                  : 'border-rose-500/30 text-rose-400 bg-rose-500/10'
              }`}>
                {vwapDeviationPercent >= 0 ? '+' : ''}{vwapDeviationPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Multi-Factor Metrics Bar */}
        <div className="mt-4 pt-3 border-t border-border-subtle/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2 rounded-xl bg-bg-card/70 border border-border-subtle">
            <span className="text-[10px] text-text-muted block font-semibold">CPR Width</span>
            <span className={`font-bold font-mono ${cpr.cprType === 'NARROW' ? 'text-emerald-400' : 'text-text-primary'}`}>
              {cpr.cprWidthPercent.toFixed(2)}% ({cpr.cprType})
            </span>
          </div>
          <div className="p-2 rounded-xl bg-bg-card/70 border border-border-subtle">
            <span className="text-[10px] text-text-muted block font-semibold">Camarilla H4</span>
            <span className="font-bold font-mono text-text-primary">
              ₹{camarilla.h4.toFixed(2)}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-bg-card/70 border border-border-subtle">
            <span className="text-[10px] text-text-muted block font-semibold">Relative Vol (RVOL)</span>
            <span className={`font-bold font-mono ${rvol >= 1.5 ? 'text-emerald-400' : 'text-text-primary'}`}>
              {rvol.toFixed(1)}x Vol
            </span>
          </div>
          <div className="p-2 rounded-xl bg-bg-card/70 border border-border-subtle">
            <span className="text-[10px] text-text-muted block font-semibold">Alpha vs NIFTY 50</span>
            <span className={`font-bold font-mono ${alphaVsNifty >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {alphaVsNifty >= 0 ? '+' : ''}{alphaVsNifty.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* 2. The 6-Pillar Confluence Matrix */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-extrabold uppercase text-text-muted tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-accent" />
            6-Pillar Intraday Confluence Checkpoints
          </h4>
          <span className="text-[11px] text-text-muted">
            {pillars.filter(p => p.passed).length} of 6 Criteria Passed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {pillars.map(p => {
            const isPassed = p.passed;
            return (
              <div
                key={p.id}
                className={`p-3 rounded-xl border bg-bg-card/80 transition-all ${
                  isPassed 
                    ? 'border-emerald-500/30 hover:border-emerald-500/60' 
                    : 'border-border-subtle hover:border-border-strong'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {isPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-text-muted flex-shrink-0" />
                    )}
                    <span className="text-xs font-bold text-text-primary truncate">
                      {p.name}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    isPassed 
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-bg-elevated text-text-muted border border-border-subtle'
                  }`}>
                    +{p.scoreContribution}/{p.maxScore}
                  </span>
                </div>
                <p className="text-[11px] text-text-secondary leading-snug line-clamp-2">
                  {p.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Trade Execution Blueprint: Entry, SL, Target 1, Target 2 & Taxes */}
      <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-brand-accent" />
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
              Intraday Setup Blueprint & R:R Calculator
            </h4>
          </div>
          <Badge
            variant={blueprint.action === 'BUY' ? 'positive' : blueprint.action === 'SELL' ? 'negative' : 'neutral'}
            size="sm"
          >
            {blueprint.action === 'BUY' ? 'BUY SETUP' : blueprint.action === 'SELL' ? 'SELL SETUP' : 'WAIT SETUP'}
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-2.5 rounded-xl bg-bg-elevated border border-border-subtle">
            <span className="text-[10px] font-semibold text-text-muted block">Entry Price</span>
            <span className="text-sm font-extrabold text-text-primary font-mono">
              ₹{blueprint.entryPrice.toFixed(2)}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <span className="text-[10px] font-semibold text-rose-400 block">Stop-Loss (ATR)</span>
            <span className="text-sm font-extrabold text-rose-400 font-mono">
              ₹{blueprint.stopLoss.toFixed(2)}
            </span>
            <span className="text-[9px] text-text-muted block mt-0.5">
              Risk: ₹{blueprint.riskPerShare.toFixed(2)} / share
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-[10px] font-semibold text-emerald-400 block">Target 1 (1:1.5)</span>
            <span className="text-sm font-extrabold text-emerald-400 font-mono">
              ₹{blueprint.target1.toFixed(2)}
            </span>
            <span className="text-[9px] text-emerald-500/80 block mt-0.5">
              Reward: +₹{blueprint.reward1PerShare.toFixed(2)} / share
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <span className="text-[10px] font-semibold text-cyan-400 block">Target 2 (1:2.5)</span>
            <span className="text-sm font-extrabold text-cyan-400 font-mono">
              ₹{blueprint.target2.toFixed(2)}
            </span>
            <span className="text-[9px] text-cyan-500/80 block mt-0.5">
              Reward: +₹{blueprint.reward2PerShare.toFixed(2)} / share
            </span>
          </div>
        </div>

        {/* Indian Taxes & Net Expected Profit Summary */}
        <div className="p-3 rounded-xl bg-bg-elevated/70 border border-border-subtle/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="space-y-0.5">
            <span className="text-[11px] text-text-secondary flex items-center gap-1 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-brand-accent" />
              Net Profit for {blueprint.recommendedQuantity} Qty (after Indian Taxes & ₹40 Brokerage):
            </span>
            <span className="text-[10px] text-text-muted">
              STT, GST, Exchange & SEBI charges estimated at ₹{blueprint.totalChargesEst.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-emerald-400 font-mono">
              T1: +₹{blueprint.netProfitTarget1.toLocaleString('en-IN')}
            </span>
            <span className="text-text-muted">•</span>
            <span className="text-xs font-black text-cyan-400 font-mono">
              T2: +₹{blueprint.netProfitTarget2.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleExecutePaperOrder}
            className={`flex-1 font-bold text-white shadow-md active:scale-95 ${
              blueprint.action === 'SELL' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
            icon={<Zap className="w-4 h-4" />}
          >
            ⚡ 1-Click Paper Order ({blueprint.action === 'SELL' ? 'SELL' : 'BUY'} @ ₹{blueprint.entryPrice.toFixed(2)})
          </Button>

          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleLogToJournal}
            className="flex-1 font-bold"
            icon={<BookOpen className="w-4 h-4" />}
          >
            📖 Log to Trade Journal
          </Button>
        </div>
      </div>
    </div>
  );
};
