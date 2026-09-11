import React, { useState, useMemo } from 'react';
import { useMarketData } from '../../context/MarketDataContext';
import { useApp } from '../../context/AppContext';
import { IntradayConfirmationService, IntradayConfirmationReport } from '../../services/IntradayConfirmationService';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Zap,
  Clock,
  Sparkles,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  ChevronRight
} from 'lucide-react';

export const IntradaySignalScanner: React.FC = () => {
  const { quotes, indices, openStockModal } = useMarketData();
  const { setSelectedStockForOrder, setIsPlaceOrderModalOpen } = useApp();

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'OPEN_DRIVE' | 'CAMARILLA' | 'NARROW_CPR'>('ALL');
  const [directionTab, setDirectionTab] = useState<'BUY' | 'SELL'>('BUY');

  const niftyQuote = indices.find(i => i.symbol === '^NSEI' || i.name.includes('NIFTY 50'));
  const niftyChange = niftyQuote ? niftyQuote.changePercent : 0.40;

  // Scan quotes
  const { topBuys, topSells } = useMemo(() => {
    return IntradayConfirmationService.scanTopSetups(quotes, niftyChange);
  }, [quotes, niftyChange]);

  const displayedList: IntradayConfirmationReport[] = useMemo(() => {
    const source = directionTab === 'BUY' ? topBuys : topSells;
    if (activeFilter === 'ALL') return source;

    if (activeFilter === 'OPEN_DRIVE') {
      return source.filter(r => 
        directionTab === 'BUY' ? r.openDrive === 'OPEN_LOW' : r.openDrive === 'OPEN_HIGH'
      );
    }

    if (activeFilter === 'CAMARILLA') {
      return source.filter(r => 
        directionTab === 'BUY' ? r.camarilla.status === 'H4_BREAKOUT' : r.camarilla.status === 'L4_BREAKDOWN'
      );
    }

    if (activeFilter === 'NARROW_CPR') {
      return source.filter(r => r.cpr.cprType === 'NARROW');
    }

    return source;
  }, [topBuys, topSells, directionTab, activeFilter]);

  const handleOpenStock = (symbol: string) => {
    openStockModal(symbol);
  };

  const handleQuickTrade = (e: React.MouseEvent, symbol: string) => {
    e.stopPropagation();
    setSelectedStockForOrder(symbol);
    setIsPlaceOrderModalOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-brand-accent text-white flex items-center gap-1">
              <Zap className="w-3 h-3" /> Live Institutional Scanner
            </span>
            <span className="text-xs text-text-muted">
              Auto-scanned across NSE quotes
            </span>
          </div>
          <h3 className="text-lg font-extrabold text-text-primary tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-accent" />
            Intraday Signal Confluence Scanner (NSE)
          </h3>
          <p className="text-xs text-text-secondary">
            Algorithmic 6-pillar confirmation filter: Only high-probability setups with VWAP, CPR, and Volume confluence.
          </p>
        </div>

        {/* Direction Switcher Tab */}
        <div className="flex items-center p-1 rounded-2xl bg-bg-secondary border border-border-subtle self-start sm:self-auto">
          <button
            onClick={() => setDirectionTab('BUY')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              directionTab === 'BUY'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            🟢 Strong Buys ({topBuys.length})
          </button>
          <button
            onClick={() => setDirectionTab('SELL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              directionTab === 'SELL'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            🔴 Strong Shorts ({topSells.length})
          </button>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-xs">
        <button
          onClick={() => setActiveFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
            activeFilter === 'ALL'
              ? 'bg-text-primary text-bg-primary'
              : 'bg-bg-secondary text-text-secondary hover:text-text-primary border border-border-subtle'
          }`}
        >
          All High Probability
        </button>

        <button
          onClick={() => setActiveFilter('OPEN_DRIVE')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
            activeFilter === 'OPEN_DRIVE'
              ? 'bg-emerald-500 text-white'
              : 'bg-bg-secondary text-text-secondary hover:text-text-primary border border-border-subtle'
          }`}
        >
          <span>🔥</span> {directionTab === 'BUY' ? 'Open = Low Setups' : 'Open = High Setups'}
        </button>

        <button
          onClick={() => setActiveFilter('CAMARILLA')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
            activeFilter === 'CAMARILLA'
              ? 'bg-cyan-600 text-white'
              : 'bg-bg-secondary text-text-secondary hover:text-text-primary border border-border-subtle'
          }`}
        >
          <span>🎯</span> Camarilla Breakouts (H4/L4)
        </button>

        <button
          onClick={() => setActiveFilter('NARROW_CPR')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
            activeFilter === 'NARROW_CPR'
              ? 'bg-amber-600 text-white'
              : 'bg-bg-secondary text-text-secondary hover:text-text-primary border border-border-subtle'
          }`}
        >
          <span>📐</span> Narrow CPR Trending Day
        </button>
      </div>

      {/* Scanner Results List */}
      {displayedList.length === 0 ? (
        <div className="p-8 rounded-2xl bg-bg-secondary border border-border-subtle text-center text-xs text-text-muted space-y-1">
          <p className="font-bold">No setups matching "{activeFilter}" filter currently.</p>
          <p>Switch to "All High Probability" or check other direction tab.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {displayedList.map(report => {
            const isBuyCard = directionTab === 'BUY';
            const cardBorder = isBuyCard
              ? 'border-emerald-500/30 hover:border-emerald-500/60 bg-bg-card'
              : 'border-rose-500/30 hover:border-rose-500/60 bg-bg-card';

            return (
              <div
                key={report.symbol}
                onClick={() => handleOpenStock(report.symbol)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm hover:shadow-md group ${cardBorder}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base text-text-primary group-hover:text-brand-accent transition-colors">
                        {report.symbol}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-secondary font-mono text-text-muted border border-border-subtle">
                        {report.sector}
                      </span>
                    </div>
                    <span className="text-[11px] text-text-muted truncate max-w-[200px] block">
                      {report.name}
                    </span>
                  </div>

                  {/* Confluence Score Pill */}
                  <div className="text-right">
                    <span className={`px-2.5 py-1 rounded-xl text-xs font-black tracking-wide inline-block ${
                      isBuyCard ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                    }`}>
                      {report.score}% SCORE
                    </span>
                    <span className="text-[10px] text-text-muted block font-semibold mt-0.5">
                      {report.verdict.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Price and Intraday Signals Row */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-border-subtle text-xs">
                  <div>
                    <div className="font-extrabold font-mono text-sm text-text-primary">
                      ₹{report.price.toFixed(2)}
                    </div>
                    <div className={`text-[11px] font-bold flex items-center gap-0.5 ${
                      report.change >= 0 ? 'text-brand-positive' : 'text-brand-negative'
                    }`}>
                      {report.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {report.change >= 0 ? '+' : ''}{report.change.toFixed(2)} ({report.changePercent}%)
                    </div>
                  </div>

                  {/* Micro Setup Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {report.openDrive === 'OPEN_LOW' && (
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-[10px]">
                        Open=Low
                      </span>
                    )}
                    {report.openDrive === 'OPEN_HIGH' && (
                      <span className="px-2 py-0.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 font-bold text-[10px]">
                        Open=High
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-lg bg-bg-secondary border border-border-subtle text-text-muted font-mono text-[10px]">
                      VWAP: ₹{report.vwap.toFixed(0)}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-bg-secondary border border-border-subtle text-text-muted font-mono text-[10px]">
                      {report.cpr.cprType} CPR
                    </span>
                  </div>
                </div>

                {/* Quick Action Strip */}
                <div className="mt-3 pt-2.5 border-t border-border-subtle/70 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-text-secondary flex items-center gap-1 font-semibold group-hover:text-brand-accent transition-colors">
                    View 6-Pillar Edge <ChevronRight className="w-3.5 h-3.5" />
                  </span>

                  <button
                    onClick={(e) => handleQuickTrade(e, report.symbol)}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold text-white shadow-xs transition-transform active:scale-95 ${
                      isBuyCard ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                    }`}
                  >
                    ⚡ Trade (MIS 5x)
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
