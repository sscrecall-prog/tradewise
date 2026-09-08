import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { StockCombobox } from "../common/StockCombobox";
import { useApp } from "../../context/AppContext";
import { useMarketData } from "../../context/MarketDataContext";
import {
  TradeDirection,
  TradeStatus,
  SetupType,
  EmotionType,
  MistakeType
} from "../../types";
import { TradingCalculationService } from "../../services/TradingCalculationService";
import { PaperTradeSyncService, PaperTradeSyncData } from "../../services/PaperTradeSyncService";
import {
  TrendingUp,
  TrendingDown,
  Calculator,
  Sparkles,
  AlertCircle,
  Zap,
  RotateCcw
} from "lucide-react";

const INDEX_LOT_SIZES: Record<string, number> = {
  NIFTY: 25,
  BANKNIFTY: 15,
  FINNIFTY: 25,
  MIDCPNIFTY: 50,
  SENSEX: 10,
  BANKEX: 15
};

const POPULAR_INSTRUMENTS = [
  { symbol: "NIFTY", name: "NIFTY 50 Index", isIndex: true },
  { symbol: "BANKNIFTY", name: "Bank Nifty Index", isIndex: true },
  { symbol: "FINNIFTY", name: "Nifty Financial Services", isIndex: true },
  { symbol: "SENSEX", name: "BSE SENSEX", isIndex: true },
  { symbol: "RELIANCE", name: "Reliance Industries", isIndex: false },
  { symbol: "HDFCBANK", name: "HDFC Bank Ltd.", isIndex: false },
  { symbol: "ICICIBANK", name: "ICICI Bank Ltd.", isIndex: false },
  { symbol: "INFY", name: "Infosys Ltd.", isIndex: false },
  { symbol: "TATAMOTORS", name: "Tata Motors Ltd.", isIndex: false },
  { symbol: "SBIN", name: "State Bank of India", isIndex: false }
];

export const NewTradeModal: React.FC = () => {
  const {
    isNewTradeModalOpen,
    setIsNewTradeModalOpen,
    addJournalEntry,
    preferences,
    isTiltLocked,
    setIsTiltLockModalOpen,
    setActiveTab,
    closedPaperTrades,
    paperPositions,
    paperOrders,
    initialTradePrefill,
    clearTradePrefill
  } = useApp();
  const { quotes } = useMarketData();

  // Paper Trading Auto-Fill Sync State
  const [autoFilledTrade, setAutoFilledTrade] = useState<PaperTradeSyncData | null>(null);

  // Compute all available paper trades today
  const todayPaperTrades = useMemo(() => {
    return PaperTradeSyncService.getTodayPaperTrades({
      closedPaperTrades,
      paperPositions,
      paperOrders,
      liveQuotes: quotes
    });
  }, [closedPaperTrades, paperPositions, paperOrders, quotes]);

  // Mode: Options vs Equity/Futures
  const [segment, setSegment] = useState<"OPTIONS" | "EQUITY_MIS" | "EQUITY_CNC" | "FUTURES">("OPTIONS");

  // Basic Details
  const [symbol, setSymbol] = useState("NIFTY");
  const [instrumentName, setInstrumentName] = useState("NIFTY 50");
  const [direction, setDirection] = useState<TradeDirection>("BUY");
  const [tradeStatus, setTradeStatus] = useState<TradeStatus>("CLOSED");

  // Option specific
  const [optionType, setOptionType] = useState<"CE" | "PE">("CE");
  const [strikePrice, setStrikePrice] = useState("24500");
  const [lots, setLots] = useState(1);

  // Price & Quantity
  const [quantity, setQuantity] = useState(25);
  const [entryPrice, setEntryPrice] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [targetPrice, setTargetPrice] = useState("");

  // MAE / MFE Excursions
  const [maePrice, setMaePrice] = useState("");
  const [mfePrice, setMfePrice] = useState("");

  // Timing
  const [tradeDate, setTradeDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [tradeTime, setTradeTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  });
  const [holdingMinutes, setHoldingMinutes] = useState(35);

  // Strategy & Psychology
  const [setup, setSetup] = useState<SetupType>("Breakout");
  const [emotion, setEmotion] = useState<EmotionType>("Calm");
  const [mistake, setMistake] = useState<MistakeType>("None");
  const [planFollowed, setPlanFollowed] = useState(true);
  const [movedStopLoss, setMovedStopLoss] = useState(false);
  const [overtraded, setOvertraded] = useState(false);
  const [notes, setNotes] = useState("");
  const [chartUrl, setChartUrl] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Apply paper trade data across all modal fields
  const applyPaperTrade = useCallback((pt: PaperTradeSyncData) => {
    setSymbol(pt.stockSymbol);
    setInstrumentName(pt.stockName);
    setSegment(pt.segment);
    setDirection(pt.direction);
    setQuantity(pt.quantity);
    setEntryPrice(pt.entryPrice.toFixed(2));
    setExitPrice(pt.exitPrice !== undefined ? pt.exitPrice.toFixed(2) : "");
    setStopLoss(pt.stopLoss !== undefined ? pt.stopLoss.toFixed(2) : "");
    setTargetPrice(pt.targetPrice !== undefined ? pt.targetPrice.toFixed(2) : "");
    setHoldingMinutes(pt.holdingMinutes || 15);
    setTradeStatus(pt.tradeStatus || "CLOSED");
    setTradeDate(pt.tradeDate);
    setTradeTime(pt.tradeTime);
    if (pt.maePrice !== undefined) setMaePrice(pt.maePrice.toFixed(2));
    if (pt.mfePrice !== undefined) setMfePrice(pt.mfePrice.toFixed(2));
    setAutoFilledTrade(pt);
  }, []);

  const handleClearAutoFill = () => {
    setAutoFilledTrade(null);
    setEntryPrice("");
    setExitPrice("");
    setStopLoss("");
    setTargetPrice("");
    setMaePrice("");
    setMfePrice("");
  };

  // Check if opened with pre-filled paper trade data
  useEffect(() => {
    if (initialTradePrefill && isNewTradeModalOpen) {
      if (initialTradePrefill.stockSymbol) {
        setSymbol(initialTradePrefill.stockSymbol);
      }
      if (initialTradePrefill.stockName) {
        setInstrumentName(initialTradePrefill.stockName);
      }
      if (initialTradePrefill.direction) {
        setDirection(initialTradePrefill.direction);
      }
      if (initialTradePrefill.quantity) {
        setQuantity(initialTradePrefill.quantity);
      }
      if (initialTradePrefill.entryPrice !== undefined) {
        setEntryPrice(initialTradePrefill.entryPrice.toString());
      }
      if (initialTradePrefill.exitPrice !== undefined) {
        setExitPrice(initialTradePrefill.exitPrice.toString());
      }
      if (initialTradePrefill.stopLoss !== undefined) {
        setStopLoss(initialTradePrefill.stopLoss.toString());
      }
      if (initialTradePrefill.targetPrice !== undefined) {
        setTargetPrice(initialTradePrefill.targetPrice.toString());
      }
      if (initialTradePrefill.holdingMinutes !== undefined) {
        setHoldingMinutes(initialTradePrefill.holdingMinutes);
      }
      if (initialTradePrefill.status) {
        setTradeStatus(initialTradePrefill.status);
      }
      if (initialTradePrefill.maePrice !== undefined) {
        setMaePrice(initialTradePrefill.maePrice.toString());
      }
      if (initialTradePrefill.mfePrice !== undefined) {
        setMfePrice(initialTradePrefill.mfePrice.toString());
      }
      if (initialTradePrefill.date) {
        setTradeDate(initialTradePrefill.date);
      }
      if (initialTradePrefill.time) {
        setTradeTime(initialTradePrefill.time);
      }
      if (initialTradePrefill.isFromPaperTrade) {
        setAutoFilledTrade({
          id: 'prefill-' + Date.now(),
          source: 'CLOSED_POSITION',
          sourceLabel: 'Paper Terminal Export',
          stockSymbol: initialTradePrefill.stockSymbol || symbol,
          stockName: initialTradePrefill.stockName || instrumentName,
          direction: initialTradePrefill.direction || direction,
          segment: segment,
          quantity: initialTradePrefill.quantity || quantity,
          entryPrice: initialTradePrefill.entryPrice || 0,
          exitPrice: initialTradePrefill.exitPrice,
          stopLoss: initialTradePrefill.stopLoss,
          targetPrice: initialTradePrefill.targetPrice,
          holdingMinutes: initialTradePrefill.holdingMinutes || 15,
          tradeStatus: initialTradePrefill.status || 'CLOSED',
          tradeDate: initialTradePrefill.date || tradeDate,
          tradeTime: initialTradePrefill.time || tradeTime
        });
      }
      clearTradePrefill();
    }
  }, [initialTradePrefill, isNewTradeModalOpen, clearTradePrefill, symbol, instrumentName, direction, segment, quantity, tradeDate, tradeTime]);

  // Update quantity whenever lots or symbol changes in options mode
  useEffect(() => {
    if (segment === "OPTIONS" && INDEX_LOT_SIZES[symbol]) {
      const lotSize = INDEX_LOT_SIZES[symbol];
      setQuantity(lots * lotSize);
    }
  }, [lots, symbol, segment]);

  // Handle symbol change
  const handleSymbolChange = (sym: string, compName?: string, customLotSize?: number) => {
    setSymbol(sym);
    if (compName) {
      setInstrumentName(compName);
    } else {
      const pop = POPULAR_INSTRUMENTS.find(p => p.symbol === sym);
      if (pop) setInstrumentName(pop.name);
      else {
        const q = quotes.find(q => q.symbol.toUpperCase() === sym.toUpperCase());
        if (q) setInstrumentName(q.name);
        else setInstrumentName(sym);
      }
    }

    const lotSize = customLotSize || INDEX_LOT_SIZES[sym];
    if (lotSize) {
      setQuantity(lots * lotSize);
    }

    // SMART AUTO-FILL: Check if there is paper trading execution data for this stock
    const matchedPaperTrade = PaperTradeSyncService.getLatestPaperTradeForSymbol(sym, {
      closedPaperTrades,
      paperPositions,
      paperOrders,
      liveQuotes: quotes
    });

    if (matchedPaperTrade) {
      applyPaperTrade(matchedPaperTrade);
      return;
    }

    // If no paper trade found, reset auto-filled status
    setAutoFilledTrade(null);

    // Auto-prefill entry price if empty or zero from quote
    const liveQ = quotes.find(q => q.symbol.toUpperCase() === sym.toUpperCase());
    if (liveQ && (!entryPrice || parseFloat(entryPrice) === 0)) {
      setEntryPrice(liveQ.price.toFixed(2));
    }
  };

  // Full contract name e.g. "NIFTY 24500 CE" or "RELIANCE"
  const formattedSymbol = useMemo(() => {
    if (segment === "OPTIONS") {
      return `${symbol} ${strikePrice} ${optionType}`;
    }
    if (segment === "FUTURES") {
      return `${symbol} FUT`;
    }
    return symbol;
  }, [segment, symbol, strikePrice, optionType]);

  // Live calculation of P&L and Indian Taxes
  const calculations = useMemo(() => {
    const en = parseFloat(entryPrice) || 0;
    const ex = parseFloat(exitPrice) || 0;
    const sl = parseFloat(stopLoss) || 0;
    const qty = quantity || 0;
    const isIntraday = segment !== "EQUITY_CNC";

    if (en <= 0 || qty <= 0) {
      return {
        grossPnL: 0,
        charges: { stt: 0, brokerage: 0, exchangeCharges: 0, gst: 0, sebiCharges: 0, stampDuty: 0, totalCharges: 0 },
        netPnL: 0,
        rMultiple: 0,
        roiPercent: 0
      };
    }

    const priceDiff = direction === "BUY" ? ex - en : en - ex;
    const grossPnL = tradeStatus === "CLOSED" && ex > 0 ? Math.round(priceDiff * qty * 100) / 100 : 0;

    const charges = TradingCalculationService.calculateIndianCharges(
      en,
      ex > 0 ? ex : en,
      qty,
      isIntraday,
      preferences.defaultBrokeragePerOrder || 20
    );

    const netPnL = tradeStatus === "CLOSED" && ex > 0 ? Math.round((grossPnL - charges.totalCharges) * 100) / 100 : 0;

    let rMultiple = 0;
    if (sl > 0) {
      const riskPerShare = Math.abs(en - sl);
      const totalRisk = riskPerShare * qty;
      if (totalRisk > 0 && grossPnL !== 0) {
        rMultiple = Math.round((grossPnL / totalRisk) * 100) / 100;
      }
    }

    const positionValue = en * qty;
    const roiPercent = positionValue > 0 && grossPnL !== 0 ? Math.round((netPnL / positionValue) * 1000) / 10 : 0;

    return {
      grossPnL,
      charges,
      netPnL,
      rMultiple,
      roiPercent
    };
  }, [entryPrice, exitPrice, stopLoss, quantity, direction, segment, tradeStatus, preferences.defaultBrokeragePerOrder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (isTiltLocked) {
      setIsTiltLockModalOpen(true);
      return;
    }

    const en = parseFloat(entryPrice);
    if (!en || en <= 0) {
      setErrorMessage("Please enter a valid entry price.");
      return;
    }

    const qty = quantity;
    if (!qty || qty <= 0) {
      setErrorMessage("Please enter a valid quantity.");
      return;
    }

    const ex = tradeStatus === "CLOSED" ? parseFloat(exitPrice) : undefined;
    if (tradeStatus === "CLOSED" && (!ex || ex <= 0)) {
      setErrorMessage("For a closed trade, please enter a valid exit price.");
      return;
    }

    const sl = parseFloat(stopLoss) || 0;
    const tg = parseFloat(targetPrice) || 0;
    const maeP = maePrice ? parseFloat(maePrice) : undefined;
    const mfeP = mfePrice ? parseFloat(mfePrice) : undefined;

    try {
      setIsSubmitting(true);
      await addJournalEntry({
        date: tradeDate,
        time: tradeTime,
        stockSymbol: formattedSymbol,
        stockName: instrumentName,
        direction,
        entryPrice: en,
        exitPrice: ex,
        quantity: qty,
        stopLoss: sl,
        targetPrice: tg,
        maePrice: maeP,
        mfePrice: mfeP,
        grossPnL: calculations.grossPnL,
        estimatedCharges: calculations.charges.totalCharges,
        netPnL: calculations.netPnL,
        status: tradeStatus,
        setup,
        emotion,
        planFollowed,
        movedStopLoss,
        overtraded,
        mistake,
        notes: notes.trim() + (chartUrl ? `\n[Chart Snapshot]: ${chartUrl.trim()}` : ""),
        rMultiple: calculations.rMultiple,
        holdingTimeMinutes: holdingMinutes
      });

      setIsNewTradeModalOpen(false);
      setEntryPrice("");
      setExitPrice("");
      setStopLoss("");
      setTargetPrice("");
      setMaePrice("");
      setMfePrice("");
      setNotes("");
      setChartUrl("");
    } catch (err) {
      setErrorMessage("Failed to save trade. Please check your inputs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isNewTradeModalOpen}
      onClose={() => setIsNewTradeModalOpen(false)}
      title="Log New Trade"
      subtitle="Indian Stock & F&O Execution Journal with live regulatory taxes"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {isTiltLocked && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Prop-Desk Tilt Lock active. Journaling and live execution are paused.</span>
            </div>
            <button
              type="button"
              onClick={() => setIsTiltLockModalOpen(true)}
              className="underline font-bold hover:text-white cursor-pointer"
            >
              View Timer &amp; Guide
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-brand-negative/15 border border-brand-negative/30 text-brand-negative text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Today's Paper Trades Quick-Select Strip */}
        {todayPaperTrades.length > 0 && (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                Today's Paper Trades Available ({todayPaperTrades.length}):
              </span>
              <span className="text-[10px] text-text-muted">Click any stock to 1-Click Auto-Fill</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-0.5 custom-scrollbar">
              {todayPaperTrades.map(pt => {
                const isCurrent = symbol.toUpperCase() === pt.stockSymbol.toUpperCase();
                return (
                  <button
                    key={pt.stockSymbol}
                    type="button"
                    onClick={() => applyPaperTrade(pt)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer ${
                      isCurrent
                        ? 'bg-amber-400 text-dark-950 shadow-md font-black ring-2 ring-amber-300/50'
                        : 'bg-bg-secondary hover:bg-bg-card border border-border-subtle text-text-primary hover:border-amber-500/40'
                    }`}
                  >
                    <span>{pt.stockSymbol}</span>
                    <span className="text-[10px] opacity-85 font-mono">
                      Qty: {pt.quantity} @ ₹{pt.entryPrice}{pt.exitPrice ? ` → ₹${pt.exitPrice}` : ''}
                    </span>
                    {pt.netPnL !== undefined && (
                      <span
                        className={`text-[10px] font-bold ${
                          pt.netPnL >= 0
                            ? isCurrent ? 'text-dark-950 font-black' : 'text-emerald-400'
                            : isCurrent ? 'text-red-950 font-black' : 'text-rose-400'
                        }`}
                      >
                        {pt.netPnL >= 0 ? '+' : ''}₹{Math.round(pt.netPnL)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Segment Selector Tabs */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
            Market Segment
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => {
                setSegment("OPTIONS");
                if (!INDEX_LOT_SIZES[symbol]) handleSymbolChange("NIFTY");
              }}
              className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                segment === "OPTIONS"
                  ? "bg-brand-accent/20 border-brand-accent text-brand-accent shadow-sm"
                  : "bg-bg-elevated border-border-subtle text-text-secondary hover:text-text-primary"
              }`}
            >
              Index Options (CE/PE)
            </button>
            <button
              type="button"
              onClick={() => setSegment("EQUITY_MIS")}
              className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                segment === "EQUITY_MIS"
                  ? "bg-brand-accent/20 border-brand-accent text-brand-accent shadow-sm"
                  : "bg-bg-elevated border-border-subtle text-text-secondary hover:text-text-primary"
              }`}
            >
              Equity Intraday (MIS)
            </button>
            <button
              type="button"
              onClick={() => setSegment("EQUITY_CNC")}
              className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                segment === "EQUITY_CNC"
                  ? "bg-brand-accent/20 border-brand-accent text-brand-accent shadow-sm"
                  : "bg-bg-elevated border-border-subtle text-text-secondary hover:text-text-primary"
              }`}
            >
              Equity Swing (CNC)
            </button>
            <button
              type="button"
              onClick={() => setSegment("FUTURES")}
              className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                segment === "FUTURES"
                  ? "bg-brand-accent/20 border-brand-accent text-brand-accent shadow-sm"
                  : "bg-bg-elevated border-border-subtle text-text-secondary hover:text-text-primary"
              }`}
            >
              Futures (F&O)
            </button>
          </div>
        </div>

        {/* Instrument & Contract Specs */}
        <div className="p-4 rounded-2xl bg-bg-elevated/50 border border-border-subtle space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-text-secondary">Underlying Symbol</label>
                <span className="text-[10px] text-brand-positive font-bold">2,540+ Equities & Indices</span>
              </div>
              <StockCombobox
                value={symbol}
                onChange={(newSym, compName, lotSize) => handleSymbolChange(newSym, compName, lotSize)}
                segment={segment}
              />
            </div>

            {/* Options Details */}
            {segment === "OPTIONS" && (
              <>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Strike Price</label>
                  <input
                    type="number"
                    step="50"
                    value={strikePrice}
                    onChange={e => setStrikePrice(e.target.value)}
                    placeholder="e.g. 24500"
                    className="w-full bg-bg-secondary border border-border-subtle rounded-xl px-3 py-2 text-xs font-semibold text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Option Type</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOptionType("CE")}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                        optionType === "CE"
                          ? "bg-brand-positive/20 border-brand-positive text-brand-positive"
                          : "bg-bg-secondary border-border-subtle text-text-muted"
                      }`}
                    >
                      CALL (CE)
                    </button>
                    <button
                      type="button"
                      onClick={() => setOptionType("PE")}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                        optionType === "PE"
                          ? "bg-brand-negative/20 border-brand-negative text-brand-negative"
                          : "bg-bg-secondary border-border-subtle text-text-muted"
                      }`}
                    >
                      PUT (PE)
                    </button>
                  </div>
                </div>

                {/* India VIX Live Advisory Strip */}
                <div className="sm:col-span-2 p-2.5 rounded-xl bg-bg-secondary/70 border border-border-subtle flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 text-text-secondary">
                    <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
                    <span><b>India VIX (13.4):</b> Balanced Volatility. Standard 1R lot sizing recommended.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewTradeModalOpen(false);
                      setActiveTab("derivatives");
                    }}
                    className="text-brand-accent hover:underline font-bold text-[10px] cursor-pointer"
                  >
                    View Live Option Chain &rarr;
                  </button>
                </div>
              </>
            )}

            {segment !== "OPTIONS" && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-text-secondary mb-1">Full Name</label>
                <input
                  type="text"
                  value={instrumentName}
                  onChange={e => setInstrumentName(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-subtle rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent"
                />
              </div>
            )}
          </div>

          {/* Trade Direction & Status */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Direction</label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setDirection("BUY")}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1 transition-all ${
                    direction === "BUY"
                      ? "bg-brand-positive/20 border-brand-positive text-brand-positive"
                      : "bg-bg-secondary border-border-subtle text-text-muted"
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" /> BUY
                </button>
                <button
                  type="button"
                  onClick={() => setDirection("SELL")}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1 transition-all ${
                    direction === "SELL"
                      ? "bg-brand-negative/20 border-brand-negative text-brand-negative"
                      : "bg-bg-secondary border-border-subtle text-text-muted"
                  }`}
                >
                  <TrendingDown className="w-3.5 h-3.5" /> SELL
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Trade Status</label>
              <select
                value={tradeStatus}
                onChange={e => setTradeStatus(e.target.value as TradeStatus)}
                className="w-full bg-bg-secondary border border-border-subtle rounded-xl px-3 py-1.5 text-xs font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent"
              >
                <option value="CLOSED">CLOSED (Realized P&L)</option>
                <option value="OPEN">OPEN (Active Position)</option>
              </select>
            </div>

            {segment === "OPTIONS" && INDEX_LOT_SIZES[symbol] ? (
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Lots ({INDEX_LOT_SIZES[symbol]} qty/lot)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="1"
                    value={lots}
                    onChange={e => setLots(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-bg-secondary border border-border-subtle rounded-xl px-3 py-1.5 text-xs font-bold text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent"
                  />
                  <span className="text-[11px] text-text-muted whitespace-nowrap">
                    = {quantity} qty
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Total Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-bg-secondary border border-border-subtle rounded-xl px-3 py-1.5 text-xs font-bold text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Holding (Mins)</label>
              <input
                type="number"
                min="1"
                value={holdingMinutes}
                onChange={e => setHoldingMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-bg-secondary border border-border-subtle rounded-xl px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent"
              />
            </div>
          </div>
        </div>

        {/* Paper Trade Auto-Fill Status Banner */}
        {autoFilledTrade && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between animate-fadeIn text-xs shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
                <Zap className="w-4 h-4 fill-amber-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-amber-300 text-xs">
                    ⚡ Auto-Filled from Today's Paper Trading ({autoFilledTrade.stockSymbol})
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
                    {autoFilledTrade.sourceLabel}
                  </span>
                </div>
                <p className="text-[11px] text-text-secondary truncate mt-0.5">
                  Entry: ₹{autoFilledTrade.entryPrice} • Exit: ₹{autoFilledTrade.exitPrice || '--'} • SL: ₹{autoFilledTrade.stopLoss || '--'} • Target: ₹{autoFilledTrade.targetPrice || '--'} • Qty: {autoFilledTrade.quantity} • Hold: {autoFilledTrade.holdingMinutes}m
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClearAutoFill}
              className="text-[11px] font-bold text-text-muted hover:text-text-primary px-3 py-1.5 rounded-xl hover:bg-bg-elevated transition-colors flex items-center gap-1.5 flex-shrink-0 border border-border-subtle cursor-pointer ml-2"
              title="Reset fields to blank manual entry"
            >
              <RotateCcw className="w-3 h-3" />
              Clear
            </button>
          </div>
        )}

        {/* Prices Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Entry Price (₹) *</label>
            <input
              type="number"
              step="0.05"
              required
              placeholder="e.g. 145.50"
              value={entryPrice}
              onChange={e => setEntryPrice(e.target.value)}
              className="w-full bg-bg-secondary border border-border-subtle rounded-xl px-3 py-2 text-sm font-bold text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Exit Price (₹) {tradeStatus === "CLOSED" && "*"}
            </label>
            <input
              type="number"
              step="0.05"
              disabled={tradeStatus === "OPEN"}
              placeholder={tradeStatus === "OPEN" ? "Running..." : "e.g. 182.00"}
              value={exitPrice}
              onChange={e => setExitPrice(e.target.value)}
              className={`w-full bg-bg-secondary border border-border-subtle rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-brand-accent ${
                tradeStatus === "OPEN" ? "opacity-50 cursor-not-allowed" : "text-text-primary"
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Stop Loss (₹)</label>
            <input
              type="number"
              step="0.05"
              placeholder="e.g. 125.00"
              value={stopLoss}
              onChange={e => setStopLoss(e.target.value)}
              className="w-full bg-bg-secondary border border-border-subtle rounded-xl px-3 py-2 text-sm font-semibold text-brand-negative focus:outline-none focus:ring-1 focus:ring-brand-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Target Price (₹)</label>
            <input
              type="number"
              step="0.05"
              placeholder="e.g. 190.00"
              value={targetPrice}
              onChange={e => setTargetPrice(e.target.value)}
              className="w-full bg-bg-secondary border border-border-subtle rounded-xl px-3 py-2 text-sm font-semibold text-brand-positive focus:outline-none focus:ring-1 focus:ring-brand-accent"
            />
          </div>
        </div>

        {/* Advanced: MAE / MFE Excursions (Optional) */}
        {tradeStatus === "CLOSED" && (
          <div className="p-3.5 rounded-2xl bg-bg-secondary/50 border border-border-subtle/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-text-secondary">
                Optional: Excursion Pricing (MAE &amp; MFE)
              </span>
              <span className="text-[10px] text-text-muted">For Precision Analytics</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-text-secondary mb-1">
                  MAE Price (Worst Drawdown Faced)
                </label>
                <input
                  type="number"
                  step="0.05"
                  placeholder="e.g. 138.00"
                  value={maePrice}
                  onChange={e => setMaePrice(e.target.value)}
                  className="w-full bg-bg-card border border-border-subtle rounded-xl px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-text-secondary mb-1">
                  MFE Price (Peak Profit Reached)
                </label>
                <input
                  type="number"
                  step="0.05"
                  placeholder="e.g. 195.00"
                  value={mfePrice}
                  onChange={e => setMfePrice(e.target.value)}
                  className="w-full bg-bg-card border border-border-subtle rounded-xl px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Live Indian Regulatory Charges & Net P&L Summary Box */}
        {tradeStatus === "CLOSED" && parseFloat(entryPrice) > 0 && parseFloat(exitPrice) > 0 && (
          <div className="p-4 rounded-2xl bg-bg-elevated/70 border border-border-subtle space-y-3">
            <div className="flex items-center justify-between border-b border-border-subtle/80 pb-2">
              <span className="text-xs font-bold text-text-secondary flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-brand-accent" />
                Live Indian Charges & Net P&L Breakdown
              </span>
              <span className="text-[11px] text-text-muted">SEBI + NSE + Stamp + GST</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-2.5 rounded-xl bg-bg-secondary border border-border-subtle/60">
                <div className="text-[11px] text-text-muted">Gross P&L</div>
                <div className={`text-base font-bold ${calculations.grossPnL >= 0 ? "text-brand-positive" : "text-brand-negative"}`}>
                  {calculations.grossPnL >= 0 ? "+₹" : "-₹"}{Math.abs(calculations.grossPnL).toLocaleString("en-IN")}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-bg-secondary border border-border-subtle/60">
                <div className="text-[11px] text-text-muted">Taxes & Brokerage</div>
                <div className="text-base font-bold text-amber-400">
                  -₹{calculations.charges.totalCharges.toLocaleString("en-IN")}
                </div>
                <div className="text-[9px] text-text-muted mt-0.5">
                  STT: ₹{calculations.charges.stt} | GST: ₹{calculations.charges.gst}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-bg-secondary border border-border-subtle/60">
                <div className="text-[11px] text-text-muted">Net Realized P&L</div>
                <div className={`text-base font-bold ${calculations.netPnL >= 0 ? "text-brand-positive" : "text-brand-negative"}`}>
                  {calculations.netPnL >= 0 ? "+₹" : "-₹"}{Math.abs(calculations.netPnL).toLocaleString("en-IN")}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-bg-secondary border border-border-subtle/60">
                <div className="text-[11px] text-text-muted">R-Multiple</div>
                <div className={`text-base font-bold ${calculations.rMultiple >= 0 ? "text-brand-positive" : "text-brand-negative"}`}>
                  {calculations.rMultiple > 0 ? `+${calculations.rMultiple}R` : `${calculations.rMultiple}R`}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Strategy & Psychology Tags */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Setup / Strategy</label>
            <select
              value={setup}
              onChange={e => setSetup(e.target.value as SetupType)}
              className="w-full bg-bg-secondary border border-border-subtle rounded-xl px-3 py-2 text-xs font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent"
            >
              <option value="Breakout">Breakout</option>
              <option value="Pullback">Pullback / 20 EMA</option>
              <option value="Support/Resistance">Support / Resistance</option>
              <option value="Reversal">Reversal / 5 EMA</option>
              <option value="Trend Continuation">Trend Continuation</option>
              <option value="Range Bound">Range Bound / CPR</option>
              <option value="Gap Fill">Gap Up / Gap Down Fill</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Emotional State</label>
            <select
              value={emotion}
              onChange={e => setEmotion(e.target.value as EmotionType)}
              className="w-full bg-bg-secondary border border-border-subtle rounded-xl px-3 py-2 text-xs font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent"
            >
              <option value="Calm">Calm & Disciplined</option>
              <option value="Neutral">Neutral</option>
              <option value="FOMO">FOMO (Chased the move)</option>
              <option value="Revenge">Revenge Trading</option>
              <option value="Impatient">Impatient (Early entry)</option>
              <option value="Overconfident">Overconfident</option>
              <option value="Fear">Fear / Hesitation</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Mistake Classification</label>
            <select
              value={mistake}
              onChange={e => setMistake(e.target.value as MistakeType)}
              className="w-full bg-bg-secondary border border-border-subtle rounded-xl px-3 py-2 text-xs font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent"
            >
              <option value="None">None (Flawless Execution)</option>
              <option value="Chased Entry">Chased Entry</option>
              <option value="Early Exit">Early Exit (Cut Winner)</option>
              <option value="Ignored Stop Loss">Ignored Stop Loss</option>
              <option value="Oversized Position">Oversized / Overleveraged</option>
              <option value="FOMO Entry">FOMO Entry</option>
              <option value="Revenge Trading">Revenge Trading</option>
              <option value="Late Entry">Late Entry</option>
              <option value="Greed">Greed (Failed to book profit)</option>
            </select>
          </div>
        </div>

        {/* Rule Adherence Checkboxes */}
        <div className="p-3 rounded-xl bg-bg-secondary border border-border-subtle flex flex-wrap gap-4 text-xs">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={planFollowed}
              onChange={e => setPlanFollowed(e.target.checked)}
              className="rounded text-brand-accent focus:ring-0"
            />
            <span className="text-text-primary font-medium">Followed Trading Plan</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={movedStopLoss}
              onChange={e => setMovedStopLoss(e.target.checked)}
              className="rounded text-brand-negative focus:ring-0"
            />
            <span className="text-text-secondary">Moved Stop Loss further</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={overtraded}
              onChange={e => setOvertraded(e.target.checked)}
              className="rounded text-brand-negative focus:ring-0"
            />
            <span className="text-text-secondary">Overtraded today</span>
          </label>
        </div>

        {/* Notes & Chart Snapshot URL */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Trade Thesis & Reflection Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="What made you take this trade? How was your execution and discipline?"
              className="w-full bg-bg-secondary border border-border-subtle rounded-xl px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand-accent custom-scrollbar"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              TradingView Chart Snapshot URL (Optional)
            </label>
            <input
              type="url"
              value={chartUrl}
              onChange={e => setChartUrl(e.target.value)}
              placeholder="https://www.tradingview.com/x/..."
              className="w-full bg-bg-secondary border border-border-subtle rounded-xl px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand-accent"
            />
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Trade Date</label>
            <input
              type="date"
              value={tradeDate}
              onChange={e => setTradeDate(e.target.value)}
              className="w-full bg-bg-secondary border border-border-subtle rounded-xl px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Execution Time</label>
            <input
              type="time"
              value={tradeTime}
              onChange={e => setTradeTime(e.target.value)}
              className="w-full bg-bg-secondary border border-border-subtle rounded-xl px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsNewTradeModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || isTiltLocked}
            icon={<Sparkles className="w-4 h-4" />}
          >
            {isTiltLocked ? "Frozen by Tilt Lock" : isSubmitting ? "Saving..." : "Save to Journal"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
