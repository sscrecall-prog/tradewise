import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Target, 
  ShieldAlert, 
  TrendingUp, 
  TrendingDown, 
  Calculator, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Zap,
  Info,
  Layers,
  Sparkles,
  Compass,
  Check,
  Wallet,
  ExternalLink,
  Sliders,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { AnalyzedStock, PaperTrade } from '../../types/tradepulse';
import { useApp } from '../../context/AppContext';
import confetti from 'canvas-confetti';

export interface TradePulseStockModalProps {
  stock: AnalyzedStock | null;
  isOpen: boolean;
  onClose: () => void;
  isWatchlisted: boolean;
  onToggleWatchlist: (symbol: string) => void;
  onTakePaperTrade: (trade: PaperTrade) => void;
}

export const TradePulseStockModal: React.FC<TradePulseStockModalProps> = ({
  stock,
  isOpen,
  onClose,
  isWatchlisted,
  onToggleWatchlist,
  onTakePaperTrade
}) => {
  const {
    placePaperOrder,
    paperPortfolio,
    paperPositions,
    setIsPlaceOrderModalOpen,
    setSelectedStockForOrder,
    setActiveTab
  } = useApp();

  const paperSectionRef = useRef<HTMLDivElement>(null);

  // Position Sizing & Paper Trading state
  const defaultDir = stock?.setup.action === 'SELL' ? 'SELL' : 'BUY';
  const [selectedDirection, setSelectedDirection] = useState<'BUY' | 'SELL'>(defaultDir);
  const [productType, setProductType] = useState<'INTRADAY (MIS)' | 'DELIVERY (CNC)'>('INTRADAY (MIS)');
  const [riskPercent, setRiskPercent] = useState<number>(1.5);
  const [customEntryPrice, setCustomEntryPrice] = useState<number>(stock?.setup.entryPrice || 0);
  const [customStopLoss, setCustomStopLoss] = useState<number>(stock?.setup.stopLoss || 0);
  const [customTarget, setCustomTarget] = useState<number>(stock?.setup.target1 || 0);
  const [customQty, setCustomQty] = useState<number | null>(null);
  const [paperTradeSuccess, setPaperTradeSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state whenever selected stock changes
  useEffect(() => {
    if (stock) {
      setSelectedDirection(stock.setup.action === 'SELL' ? 'SELL' : 'BUY');
      setCustomEntryPrice(stock.setup.entryPrice);
      setCustomStopLoss(stock.setup.stopLoss);
      setCustomTarget(stock.setup.target1);
      setCustomQty(null);
      setPaperTradeSuccess(false);
      setErrorMessage(null);
    }
  }, [stock?.symbol]);

  if (!isOpen || !stock) return null;

  const isPositive = stock.change >= 0;
  const isBuy = selectedDirection === 'BUY';

  // Entry, SL, Target calculations for position sizing
  const entryPrice = customEntryPrice > 0 ? customEntryPrice : stock.setup.entryPrice;
  const stopLoss = customStopLoss > 0 ? customStopLoss : stock.setup.stopLoss;
  const target1 = customTarget > 0 ? customTarget : stock.setup.target1;
  const target2 = stock.setup.target2;

  // Risk per share in ₹
  const riskPerShare = isBuy 
    ? Math.max(0.1, entryPrice - stopLoss)
    : Math.max(0.1, stopLoss - entryPrice);

  // Reward per share at Target 1 and 2
  const reward1PerShare = isBuy
    ? Math.max(0.1, target1 - entryPrice)
    : Math.max(0.1, entryPrice - target1);

  const reward2PerShare = isBuy
    ? Math.max(0.1, target2 - entryPrice)
    : Math.max(0.1, entryPrice - target2);

  // Virtual Cash from TradeWize Global Paper Portfolio
  const availableCash = paperPortfolio?.cashBalance ?? 100000;
  const maxRiskRupees = (availableCash * riskPercent) / 100;

  // Auto recommended quantity based on risk percentage
  const autoRecommendedQty = Math.max(1, Math.floor(maxRiskRupees / riskPerShare));

  // Leverage based on product type
  const leverage = productType === 'INTRADAY (MIS)' ? 5 : 1;

  // Max affordable quantity with current available cash and leverage
  const maxAffordableQty = Math.max(1, Math.floor((availableCash * leverage) / Math.max(1, entryPrice)));

  // Final quantity to trade
  const recommendedQty = customQty && customQty > 0 ? customQty : autoRecommendedQty;

  const capitalRequiredCash = recommendedQty * entryPrice;
  const requiredMargin = Math.round((capitalRequiredCash / leverage) * 100) / 100;
  const totalPotentialLoss = Math.round(recommendedQty * riskPerShare * 100) / 100;
  const totalPotentialProfitT1 = Math.round(recommendedQty * reward1PerShare * 100) / 100;
  const totalPotentialProfitT2 = Math.round(recommendedQty * reward2PerShare * 100) / 100;
  const riskRewardRatio = (reward1PerShare / riskPerShare).toFixed(1);

  const handleExecutePaperTrade = async () => {
    if (isSubmitting) return;

    if (requiredMargin > availableCash) {
      setErrorMessage(`Insufficient TradeWize virtual margin. Required: ₹${requiredMargin.toLocaleString('en-IN')}, Available: ₹${availableCash.toLocaleString('en-IN')}`);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // 1. Place order in TradeWize Global Paper Engine
      await placePaperOrder({
        stockSymbol: stock.symbol,
        stockName: stock.symbol,
        direction: selectedDirection,
        orderType: 'MARKET',
        productType,
        quantity: recommendedQty,
        price: entryPrice,
        stopLoss,
        targetPrice: target1
      });

      // 2. Also register in TradePulse's local book & history
      const trade: PaperTrade = {
        id: `pt-${Date.now()}`,
        symbol: stock.symbol,
        action: selectedDirection,
        entryPrice,
        stopLoss,
        target1,
        target2,
        quantity: recommendedQty,
        totalCapital: requiredMargin,
        timestamp: Date.now(),
        dateStr: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        status: 'ACTIVE',
        notes: `${stock.confirmation.grade} Setup • ${productType} • TradeWize Linked`
      };
      onTakePaperTrade(trade);

      setPaperTradeSuccess(true);
      setTimeout(() => setPaperTradeSuccess(false), 3500);

      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: isBuy ? ['#10b981', '#34d399', '#06b6d4'] : ['#ef4444', '#f87171', '#f59e0b']
      });
    } catch (err: any) {
      console.error('Error placing paper order:', err);
      setErrorMessage(err?.message || 'Failed to place paper order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenTerminal = () => {
    setSelectedStockForOrder(stock.symbol);
    setIsPlaceOrderModalOpen(true);
    onClose();
  };

  const handleOpenPaperPage = () => {
    setActiveTab('paper');
    onClose();
  };

  const scrollToPaperTrading = () => {
    paperSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const { pivot, r1, r2, s1, s2, h4, l4 } = stock.pivotLevels;
  const conf = stock.confirmation;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-dark-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className="glass-panel rounded-3xl w-full max-w-4xl overflow-hidden border border-slate-200 dark:border-dark-700/80 shadow-2xl my-6 flex flex-col bg-white dark:bg-dark-900"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-dark-800 flex items-center justify-between bg-slate-50 dark:bg-dark-900/80">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onToggleWatchlist(stock.symbol)}
              className="p-2 rounded-xl bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-700 hover:bg-slate-100 dark:hover:bg-dark-750 text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
              title="Toggle Watchlist"
            >
              <Star className={`w-4 h-4 ${isWatchlisted ? 'fill-amber-400 text-amber-500' : ''}`} />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                  {stock.symbol}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 text-slate-700 dark:text-slate-300">
                  {stock.sector}
                </span>

                {/* Grade Badge */}
                <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-md border font-mono ${
                  conf.grade === 'A+' ? 'bg-trade-green/20 text-trade-green border-trade-green/40 shadow-sm shadow-trade-green/20' :
                  conf.grade === 'A' ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/40' :
                  conf.grade === 'B' ? 'bg-amber-400/20 text-amber-600 dark:text-amber-300 border-amber-400/40' :
                  'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/40'
                }`}>
                  GRADE {conf.grade}
                </span>

                {/* Alpha Badge */}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                  stock.alphaVsIndex >= 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                }`}>
                  RS Alpha: {stock.alphaVsIndex >= 0 ? '+' : ''}{stock.alphaVsIndex}%
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Multi-Factor Trade Confirmation Terminal • High-Precision Setup Analysis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
                ₹{stock.ltp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className={`text-xs font-mono font-bold flex items-center gap-1 justify-end ${
                isPositive ? 'text-trade-green' : 'text-trade-red'
              }`}>
                {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                <span>{isPositive ? '+' : ''}{stock.change.toFixed(2)} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Jump Bar */}
        <div className="px-6 py-2.5 bg-slate-100/90 dark:bg-dark-850/90 border-b border-slate-200 dark:border-dark-800 flex items-center justify-between gap-3 overflow-x-auto text-xs">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-trade-blue" />
              Jump:
            </span>
            <button
              type="button"
              onClick={() => document.getElementById('tp-section-checklist')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-dark-800 hover:bg-slate-200 dark:hover:bg-dark-700 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-dark-700 transition-colors"
            >
              ★ 5-Star Checklist
            </button>
            <button
              type="button"
              onClick={() => document.getElementById('tp-section-pivot')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-dark-800 hover:bg-slate-200 dark:hover:bg-dark-700 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-dark-700 transition-colors"
            >
              🪜 Pivot S/R Ladder
            </button>
            <button
              type="button"
              onClick={() => document.getElementById('tp-section-setup')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-dark-800 hover:bg-slate-200 dark:hover:bg-dark-700 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-dark-700 transition-colors"
            >
              🎯 Setup Rationale
            </button>
          </div>

          <button
            type="button"
            onClick={scrollToPaperTrading}
            className="px-3 py-1 rounded-lg bg-trade-green/15 hover:bg-trade-green/25 text-emerald-700 dark:text-trade-green font-extrabold border border-trade-green/30 flex items-center gap-1.5 transition-all shadow-sm flex-shrink-0"
          >
            <Zap className="w-3.5 h-3.5 text-trade-green animate-pulse" />
            <span>⚡ Paper Trading Desk</span>
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          
          {/* Section 1: 5-Star Multi-Factor Trade Confirmation Checklist */}
          <div id="tp-section-checklist" className="rounded-2xl bg-slate-50 dark:bg-gradient-to-br dark:from-dark-900 dark:to-dark-850 border border-slate-200 dark:border-dark-700 p-5 space-y-4 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-dark-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-xs uppercase tracking-wider text-slate-900 dark:text-white font-black">
                    5-Star Trade Confirmation Checklist
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center text-amber-500 text-sm">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={i < conf.stars ? 'opacity-100' : 'opacity-25'}>★</span>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {conf.stars} of 5 Rules Confirmed
                  </span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className={`text-xs font-black px-3 py-1 rounded-xl border inline-block ${
                  conf.grade === 'A+' ? 'bg-trade-green/20 text-trade-green border-trade-green/40' :
                  conf.grade === 'A' ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/40' :
                  conf.grade === 'B' ? 'bg-amber-400/20 text-amber-700 dark:text-amber-300 border-amber-400/40' :
                  'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/40'
                }`}>
                  {conf.verdict}
                </span>
              </div>
            </div>

            {/* Checklist Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {conf.items.map(item => (
                <div 
                  key={item.id}
                  className={`p-3 rounded-xl border flex items-start gap-3 transition-all ${
                    item.passed 
                      ? 'bg-emerald-50 border-emerald-300 text-slate-900 dark:bg-emerald-950/20 dark:border-emerald-500/30 dark:text-slate-200' 
                      : 'bg-white border-slate-200 text-slate-600 dark:bg-dark-900/60 dark:border-dark-800 dark:text-slate-400'
                  }`}
                >
                  <div className="mt-0.5">
                    {item.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-trade-green shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                      <span>{item.title}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                        item.passed ? 'bg-trade-green/20 text-trade-green' : 'bg-slate-100 text-slate-600 dark:bg-dark-800 dark:text-slate-500'
                      }`}>
                        {item.passed ? 'PASSED' : 'NOT MET'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                      {item.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Daily Pivot Points & Support/Resistance Levels Ladder */}
          <div id="tp-section-pivot" className="glass-panel rounded-2xl p-5 space-y-3 border border-slate-200 dark:border-dark-800/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  Daily Pivot Points & S/R Breakout Ladder
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                Floor + Camarilla Levels
              </span>
            </div>

            {/* Visual Levels Bar */}
            <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 text-center font-mono text-xs pt-1">
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/50">
                <span className="text-[10px] text-rose-600 dark:text-rose-400 font-sans block">Support 2 (S2)</span>
                <span className="font-bold text-rose-900 dark:text-white">₹{s2.toFixed(1)}</span>
                <span className="text-[9px] text-slate-500 block mt-0.5">Key Floor</span>
              </div>

              <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-200/80 dark:bg-rose-950/20 dark:border-rose-800/40">
                <span className="text-[10px] text-rose-600 dark:text-rose-300 font-sans block">Support 1 (S1)</span>
                <span className="font-bold text-rose-800 dark:text-rose-200">₹{s1.toFixed(1)}</span>
                <span className="text-[9px] text-slate-500 block mt-0.5">Demand Zone</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 dark:bg-dark-900 dark:border-dark-700">
                <span className="text-[10px] text-slate-600 dark:text-slate-400 font-sans block">Central Pivot (P)</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">₹{pivot.toFixed(1)}</span>
                <span className="text-[9px] text-slate-500 block mt-0.5">Base Line</span>
              </div>

              {/* Current LTP Spotlight */}
              <div className="p-2.5 rounded-xl bg-trade-green/15 border border-trade-green/40 shadow-sm shadow-trade-green/10 sm:col-span-1 col-span-3">
                <span className="text-[10px] text-trade-green font-sans font-bold block">Current LTP</span>
                <span className="font-extrabold text-slate-900 dark:text-white text-sm">₹{stock.ltp.toFixed(1)}</span>
                <span className="text-[9px] text-trade-green dark:text-trade-green/80 font-semibold block mt-0.5">
                  {stock.ltp >= pivot ? 'Above Pivot (Bullish)' : 'Below Pivot (Bearish)'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 dark:bg-emerald-950/20 dark:border-emerald-800/40">
                <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-sans block">Resistance 1 (R1)</span>
                <span className="font-bold text-emerald-800 dark:text-emerald-200">₹{r1.toFixed(1)}</span>
                <span className="text-[9px] text-slate-500 block mt-0.5">1st Hurdle</span>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/50">
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-sans block">Resistance 2 (R2)</span>
                <span className="font-bold text-emerald-900 dark:text-white">₹{r2.toFixed(1)}</span>
                <span className="text-[9px] text-slate-500 block mt-0.5">Breakout Target</span>
              </div>

              <div className="p-2.5 rounded-xl bg-cyan-50 border border-cyan-200 dark:bg-cyan-950/30 dark:border-cyan-800/40">
                <span className="text-[10px] text-cyan-700 dark:text-cyan-400 font-sans block">Camarilla (H4)</span>
                <span className="font-bold text-cyan-900 dark:text-cyan-200">₹{h4.toFixed(1)}</span>
                <span className="text-[9px] text-slate-500 block mt-0.5">Squeeze Level</span>
              </div>
            </div>
          </div>

          {/* Section 3: Execution Levels Grid & Rationale */}
          <div id="tp-section-setup" className="rounded-2xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-750 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-dark-800 pb-3">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold block">
                  Actionable Execution Setup
                </span>
                <span className="text-base font-extrabold text-slate-900 dark:text-white">
                  {stock.setup.strategy}
                </span>
              </div>

              {/* Action Badge - Fixed so WAIT shows Range-Bound/Observation rather than default SELL */}
              <span className={`text-xs font-bold px-3 py-1 rounded-xl border ${
                stock.setup.action === 'BUY'
                  ? 'bg-trade-green/10 text-trade-green border-trade-green/30'
                  : stock.setup.action === 'SELL'
                  ? 'bg-trade-red/10 text-trade-red border-trade-red/30'
                  : 'bg-amber-400/15 text-amber-600 dark:text-amber-400 border-amber-400/30'
              }`}>
                {stock.setup.action === 'BUY' ? 'LONG / BUY' : stock.setup.action === 'SELL' ? 'SHORT / SELL' : 'RANGE-BOUND / OBSERVATION'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-white dark:bg-dark-950 border border-slate-200 dark:border-dark-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-sans block">Setup Entry Price</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">₹{stock.setup.entryPrice.toFixed(2)}</span>
                <span className="text-[10px] text-slate-500 block font-sans mt-0.5">Recommended Level</span>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-dark-950 border border-slate-200 dark:border-dark-800">
                <span className="text-[11px] text-rose-600 dark:text-rose-400 font-sans block">Stop Loss (SL)</span>
                <span className="text-base font-bold text-trade-red">₹{stock.setup.stopLoss.toFixed(2)}</span>
                <span className="text-[10px] text-rose-600/80 dark:text-rose-400/80 block font-sans mt-0.5">
                  Risk: ₹{Math.abs(stock.setup.entryPrice - stock.setup.stopLoss).toFixed(2)} ({((Math.abs(stock.setup.entryPrice - stock.setup.stopLoss) / stock.setup.entryPrice) * 100).toFixed(1)}%)
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-dark-950 border border-slate-200 dark:border-dark-800">
                <span className="text-[11px] text-trade-green font-sans block">Target 1 (1:1.5)</span>
                <span className="text-base font-bold text-trade-green">₹{stock.setup.target1.toFixed(2)}</span>
                <span className="text-[10px] text-trade-green/80 block font-sans mt-0.5">
                  Reward: +₹{Math.abs(stock.setup.target1 - stock.setup.entryPrice).toFixed(2)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-dark-950 border border-slate-200 dark:border-dark-800">
                <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-sans block">Target 2 (1:2.5)</span>
                <span className="text-base font-bold text-cyan-600 dark:text-cyan-400">₹{stock.setup.target2.toFixed(2)}</span>
                <span className="text-[10px] text-cyan-600/80 dark:text-cyan-400/80 block font-sans mt-0.5">
                  Reward: +₹{Math.abs(stock.setup.target2 - stock.setup.entryPrice).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Rationale Snippet */}
            <div className="bg-white dark:bg-dark-950/60 p-3.5 rounded-xl border border-slate-200 dark:border-dark-800/80 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <span className="text-trade-green font-bold">Trader Rationale: </span>
              {stock.setup.rationaleHinglish}
            </div>
          </div>

          {/* Section 4: Live TradeWize Paper Trading Desk & Execution Controls */}
          <div 
            id="tp-section-paper-trading" 
            ref={paperSectionRef} 
            className="rounded-2xl bg-slate-50 dark:bg-dark-900 border-2 border-emerald-500/30 dark:border-emerald-500/30 p-5 space-y-5 shadow-lg relative"
          >
            {/* Paper Trading Header & TradeWize Account Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-dark-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-trade-green/10 text-trade-green border border-trade-green/20">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      TradeWize Paper Trading Desk
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
                      PORTFOLIO LINKED
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Live connected to TradeWize virtual trading ledger & risk management
                  </p>
                </div>
              </div>

              {/* Account Balance & Paper Book Link */}
              <div className="flex items-center gap-2.5 bg-white dark:bg-dark-950 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-dark-800 text-xs font-mono">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <Wallet className="w-3.5 h-3.5 text-trade-blue" />
                  <span>Virtual Balance:</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">
                  ₹{availableCash.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
                <button
                  type="button"
                  onClick={handleOpenPaperPage}
                  className="text-[11px] text-trade-blue hover:underline flex items-center gap-1 font-sans ml-1 border-l border-slate-200 dark:border-dark-750 pl-2"
                  title="Go to Paper Trading Portfolio"
                >
                  <span>Book ({paperPositions.length})</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Range-Bound Warning Note if action is WAIT */}
            {stock.setup.action === 'WAIT' && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-500" />
                <div>
                  <strong className="font-bold">Consolidation / Range-Bound Mode:</strong> {stock.symbol} is currently oscillating within its support and resistance. Choose <strong>BUY</strong> near Support (S1: ₹{s1.toFixed(1)}) or <strong>SELL</strong> near Resistance (R1: ₹{r1.toFixed(1)}) below.
                </div>
              </div>
            )}

            {/* Order Controls Grid: Direction & Product Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Order Direction */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Order Direction
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDirection('BUY')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all border ${
                      selectedDirection === 'BUY'
                        ? 'bg-trade-green text-dark-950 border-trade-green shadow-md shadow-trade-green/20'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 dark:bg-dark-950 dark:text-slate-400 dark:border-dark-700'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 stroke-[2.5]" />
                    <span>LONG / BUY</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedDirection('SELL')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all border ${
                      selectedDirection === 'SELL'
                        ? 'bg-trade-red text-white border-trade-red shadow-md shadow-trade-red/20'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 dark:bg-dark-950 dark:text-slate-400 dark:border-dark-700'
                    }`}
                  >
                    <TrendingDown className="w-4 h-4 stroke-[2.5]" />
                    <span>SHORT / SELL</span>
                  </button>
                </div>
              </div>

              {/* Product Type (MIS vs CNC) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Product Type (Leverage)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setProductType('INTRADAY (MIS)')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition-all border ${
                      productType === 'INTRADAY (MIS)'
                        ? 'bg-trade-blue/15 text-trade-blue border-trade-blue/40 font-black ring-1 ring-trade-blue/30'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 dark:bg-dark-950 dark:text-slate-400 dark:border-dark-700'
                    }`}
                  >
                    <span>INTRADAY (MIS)</span>
                    <span className="text-[10px] opacity-80 font-mono">5x Leverage</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductType('DELIVERY (CNC)')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition-all border ${
                      productType === 'DELIVERY (CNC)'
                        ? 'bg-trade-blue/15 text-trade-blue border-trade-blue/40 font-black ring-1 ring-trade-blue/30'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 dark:bg-dark-950 dark:text-slate-400 dark:border-dark-700'
                    }`}
                  >
                    <span>DELIVERY (CNC)</span>
                    <span className="text-[10px] opacity-80 font-mono">1x Cash</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Editable Execution Parameters: Entry, Stop Loss, Target */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Entry Price */}
              <div className="bg-white dark:bg-dark-950 p-3 rounded-xl border border-slate-200 dark:border-dark-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Execution Entry (₹)
                  </label>
                  <button
                    type="button"
                    onClick={() => setCustomEntryPrice(stock.ltp)}
                    className="text-[10px] text-trade-blue hover:underline font-semibold"
                  >
                    Use CMP (₹{stock.ltp.toFixed(1)})
                  </button>
                </div>
                <input
                  type="number"
                  step="0.05"
                  value={customEntryPrice || ''}
                  onChange={(e) => setCustomEntryPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-dark-700 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-trade-green"
                />
                <div className="flex gap-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setCustomEntryPrice(stock.setup.entryPrice)}
                    className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    Setup: ₹{stock.setup.entryPrice.toFixed(1)}
                  </button>
                </div>
              </div>

              {/* Stop Loss */}
              <div className="bg-white dark:bg-dark-950 p-3 rounded-xl border border-slate-200 dark:border-dark-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                    Stop Loss (SL) (₹)
                  </label>
                  <span className="text-[10px] text-rose-500 font-mono font-semibold">
                    Risk: ₹{riskPerShare.toFixed(1)}/sh
                  </span>
                </div>
                <input
                  type="number"
                  step="0.05"
                  value={customStopLoss || ''}
                  onChange={(e) => setCustomStopLoss(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-dark-700 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-rose-600 dark:text-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
                <div className="flex gap-1 text-[10px] overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setCustomStopLoss(stock.setup.stopLoss)}
                    className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex-shrink-0"
                  >
                    Setup: ₹{stock.setup.stopLoss.toFixed(1)}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomStopLoss(isBuy ? s1 : r1)}
                    className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex-shrink-0"
                  >
                    {isBuy ? `S1: ₹${s1.toFixed(1)}` : `R1: ₹${r1.toFixed(1)}`}
                  </button>
                </div>
              </div>

              {/* Target Price */}
              <div className="bg-white dark:bg-dark-950 p-3 rounded-xl border border-slate-200 dark:border-dark-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    Target (TP) (₹)
                  </label>
                  <span className="text-[10px] text-emerald-500 font-mono font-semibold">
                    Gain: +₹{reward1PerShare.toFixed(1)}/sh
                  </span>
                </div>
                <input
                  type="number"
                  step="0.05"
                  value={customTarget || ''}
                  onChange={(e) => setCustomTarget(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-dark-700 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <div className="flex gap-1 text-[10px] overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setCustomTarget(stock.setup.target1)}
                    className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex-shrink-0"
                  >
                    Setup: ₹{stock.setup.target1.toFixed(1)}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomTarget(isBuy ? r1 : s1)}
                    className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex-shrink-0"
                  >
                    {isBuy ? `R1: ₹${r1.toFixed(1)}` : `S1: ₹${s1.toFixed(1)}`}
                  </button>
                </div>
              </div>
            </div>

            {/* Quantity Selector & Presets */}
            <div className="bg-white dark:bg-dark-950 p-4 rounded-xl border border-slate-200 dark:border-dark-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Order Quantity & Position Sizing
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Auto-sized for {riskPercent}% risk limit (₹{maxRiskRupees.toFixed(0)}) or pick custom preset
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Shares:</span>
                  <input
                    type="number"
                    min="1"
                    value={recommendedQty}
                    onChange={(e) => setCustomQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24 bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-dark-700 rounded-lg px-2.5 py-1 text-sm font-mono font-black text-slate-900 dark:text-white text-center focus:outline-none focus:ring-1 focus:ring-trade-green"
                  />
                </div>
              </div>

              {/* Preset Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setCustomQty(autoRecommendedQty)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    customQty === null || customQty === autoRecommendedQty
                      ? 'bg-trade-green text-dark-950 shadow-sm'
                      : 'bg-slate-100 dark:bg-dark-850 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-dark-800'
                  }`}
                >
                  🎯 Risk 1.5% ({autoRecommendedQty} Qty)
                </button>
                {[10, 25, 50, 100].map(q => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setCustomQty(q)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                      customQty === q
                        ? 'bg-trade-blue text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-dark-850 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-dark-800'
                    }`}
                  >
                    +{q}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCustomQty(maxAffordableQty)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    customQty === maxAffordableQty
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-dark-850 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-dark-800'
                  }`}
                >
                  ⚡ Max Afford ({maxAffordableQty} Qty)
                </button>
              </div>
            </div>

            {/* Calculated Results / Live Margin & Risk Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white dark:bg-dark-950 rounded-xl p-4 border border-slate-200 dark:border-dark-800 font-mono text-xs">
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans block">Required Margin</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  ₹{requiredMargin.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans block mt-0.5">
                  {productType === 'INTRADAY (MIS)' ? '5x MIS Leverage' : '1x CNC Delivery'}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans block">Max Loss at SL</span>
                <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                  -₹{totalPotentialLoss.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
                <span className="text-[10px] text-slate-500 font-sans block mt-0.5">
                  ({((riskPerShare / entryPrice) * 100).toFixed(1)}% risk)
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans block">Gain at Target 1</span>
                <span className="text-sm font-bold text-trade-green">
                  +₹{totalPotentialProfitT1.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
                <span className="text-[10px] text-trade-green/80 font-sans block mt-0.5">
                  R:R 1 : {riskRewardRatio}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans block">Gain at Target 2</span>
                <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">
                  +₹{totalPotentialProfitT2.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
                <span className="text-[10px] text-cyan-600/80 dark:text-cyan-400/80 font-sans block mt-0.5">
                  Breakout Target
                </span>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action Buttons Row */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <span>
                  Turnover: <strong className="text-slate-900 dark:text-white font-mono">₹{capitalRequiredCash.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong>
                </span>
                <span>•</span>
                <span>
                  Margin: <strong className="text-trade-green font-mono">₹{requiredMargin.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                {/* Open in full terminal button */}
                <button
                  type="button"
                  onClick={handleOpenTerminal}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-dark-700 bg-white dark:bg-dark-950 hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors flex items-center gap-1.5"
                  title="Open full TradeWize Order Placement Modal"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Terminal</span>
                </button>

                {/* Main 1-Click Execution */}
                <button
                  type="button"
                  onClick={handleExecutePaperTrade}
                  disabled={isSubmitting}
                  className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 ${
                    paperTradeSuccess
                      ? 'bg-emerald-600 text-white shadow-emerald-500/30'
                      : isBuy 
                      ? 'bg-trade-green hover:bg-trade-green-light text-dark-950 shadow-trade-green/20' 
                      : 'bg-trade-red hover:bg-trade-red-light text-white shadow-trade-red/20'
                  }`}
                >
                  {paperTradeSuccess ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Order Executed in TradeWize!</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 stroke-[2.5]" />
                      <span>Execute Paper Trade ({recommendedQty} Shares)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-900 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-trade-blue" />
            Check live market depth & VWAP before final order entry in terminal.
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={scrollToPaperTrading}
              className="px-3 py-1.5 rounded-xl bg-trade-green/15 hover:bg-trade-green/25 text-emerald-700 dark:text-trade-green border border-trade-green/30 font-bold transition-all flex items-center gap-1"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>⚡ Paper Trade {stock.symbol}</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-dark-800 dark:hover:bg-dark-700 dark:text-white font-semibold transition-colors"
            >
              Close Drilldown
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
