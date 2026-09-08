import React, { useState, useEffect, useMemo } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { Badge } from "../common/Badge";
import { useApp } from "../../context/AppContext";
import { useMarketData } from "../../context/MarketDataContext";
import { TradeDirection } from "../../types";
import { TradingCalculationService } from "../../services/TradingCalculationService";
import confetti from "canvas-confetti";
import {
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Zap,
  Info,
  ChevronDown,
  ChevronUp,
  Sliders,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

export const PlaceOrderModal: React.FC = () => {
  const {
    isPlaceOrderModalOpen,
    setIsPlaceOrderModalOpen,
    selectedStockForOrder,
    setSelectedStockForOrder,
    placePaperOrder,
    paperPortfolio
  } = useApp();
  const { quotes, getQuote } = useMarketData();

  const [symbol, setSymbol] = useState(selectedStockForOrder || "RELIANCE");
  const [direction, setDirection] = useState<TradeDirection>("BUY");
  const [productType, setProductType] = useState<"INTRADAY (MIS)" | "DELIVERY (CNC)">("INTRADAY (MIS)");
  const [orderType, setOrderType] = useState<"MARKET" | "LIMIT" | "SL" | "SL-M">("MARKET");
  const [quantity, setQuantity] = useState(10);
  const [limitPrice, setLimitPrice] = useState("");
  const [triggerPrice, setTriggerPrice] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [isChargesExpanded, setIsChargesExpanded] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (selectedStockForOrder) {
      setSymbol(selectedStockForOrder);
    }
  }, [selectedStockForOrder]);

  const quote = getQuote(symbol) || quotes[0];
  const currentPrice = quote ? quote.price : 1000;

  // Sync default limit price when stock changes
  useEffect(() => {
    if (quote) {
      setLimitPrice(quote.price.toFixed(2));
      setTriggerPrice((quote.price * 0.99).toFixed(2));
    }
  }, [symbol]);

  const executionPrice = useMemo(() => {
    if (orderType === "MARKET" || orderType === "SL-M") {
      return currentPrice;
    }
    const parsed = parseFloat(limitPrice);
    return !isNaN(parsed) && parsed > 0 ? parsed : currentPrice;
  }, [orderType, limitPrice, currentPrice]);

  const isIntraday = productType === "INTRADAY (MIS)";
  const leverage = isIntraday ? 5 : 1;
  const turnover = Math.round(executionPrice * quantity * 100) / 100;
  const requiredMargin = Math.round((turnover / leverage) * 100) / 100;

  // Single-leg live charges breakdown (Zerodha & Angel One schedule)
  const charges = useMemo(() => {
    return TradingCalculationService.calculateOrderCharges(
      executionPrice,
      quantity,
      direction,
      isIntraday
    );
  }, [executionPrice, quantity, direction, isIntraday]);

  const totalDeduction = requiredMargin + charges.totalCharges;
  const hasSufficientMargin = totalDeduction <= paperPortfolio.cashBalance;
  const marginDeficit = totalDeduction - paperPortfolio.cashBalance;

  // Maximum affordable quantity calculation (with 5x leverage)
  const maxAffordableQty = useMemo(() => {
    if (executionPrice <= 0 || paperPortfolio.cashBalance <= 0) return 1;
    // (cash - approx charges) / (price / leverage)
    const effectivePricePerUnit = (executionPrice / leverage) + (executionPrice * 0.0005);
    const maxQty = Math.floor(paperPortfolio.cashBalance / effectivePricePerUnit);
    return Math.max(1, maxQty);
  }, [executionPrice, leverage, paperPortfolio.cashBalance]);

  const handleMaxQty = () => {
    setQuantity(maxAffordableQty);
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!quantity || quantity <= 0) {
      setErrorMessage("Please enter a valid quantity of at least 1.");
      return;
    }

    if (!hasSufficientMargin) {
      setErrorMessage(
        `Insufficient available margin. Required: ₹${Math.round(totalDeduction).toLocaleString("en-IN")}, Available: ₹${Math.round(paperPortfolio.cashBalance).toLocaleString("en-IN")}`
      );
      return;
    }

    if ((orderType === "SL" || orderType === "SL-M") && (!triggerPrice || parseFloat(triggerPrice) <= 0)) {
      setErrorMessage("Please enter a valid Trigger Price for Stop-Loss order.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Execute order with safety race against a 1200ms timeout so button NEVER stays stuck
      await Promise.race([
        placePaperOrder({
          stockSymbol: quote.symbol,
          stockName: quote.name,
          direction,
          orderType,
          productType,
          quantity,
          price: executionPrice,
          triggerPrice: triggerPrice ? parseFloat(triggerPrice) : undefined,
          targetPrice: targetPrice ? parseFloat(targetPrice) : undefined,
          stopLoss: stopLoss ? parseFloat(stopLoss) : undefined
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Execution timeout")), 1200)
        )
      ]);

      setIsSuccess(true);

      // Light celebratory confetti
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: isBuy ? ['#10b981', '#34d399', '#06b6d4'] : ['#ef4444', '#f87171', '#f59e0b']
        });
      } catch {}

      // Promptly close modal after brief visual success state (180ms)
      setTimeout(() => {
        setIsPlaceOrderModalOpen(false);
        setSelectedStockForOrder(null);
        setIsSuccess(false);
        setIsSubmitting(false);
      }, 180);
    } catch (err: any) {
      setIsSubmitting(false);
      setIsSuccess(false);
      setErrorMessage(err?.message || "Failed to execute order. Please verify margin and try again.");
    }
  };

  const isBuy = direction === "BUY";
  const themeColor = isBuy ? "text-[#1E60D5] border-[#1E60D5]" : "text-[#EF4444] border-[#EF4444]";
  const themeBg = isBuy ? "bg-[#1E60D5]" : "bg-[#EF4444]";

  return (
    <Modal
      isOpen={isPlaceOrderModalOpen}
      onClose={() => {
        setIsPlaceOrderModalOpen(false);
        setSelectedStockForOrder(null);
      }}
      title={
        <div className="flex items-center justify-between w-full pr-4">
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full ${themeBg} animate-pulse`} />
            <span className="font-extrabold text-base text-text-primary tracking-tight">
              {symbol}
            </span>
            <Badge variant="neutral" size="sm">NSE</Badge>
            <span className={`text-xs font-bold font-mono ${quote && quote.change >= 0 ? "text-brand-positive" : "text-brand-negative"}`}>
              ₹{currentPrice.toFixed(2)} ({quote && quote.change >= 0 ? "+" : ""}{quote ? quote.changePercent : 0}%)
            </span>
          </div>
        </div>
      }
      subtitle="Zerodha / Angel One Style Pro Order Pad • Real-Time 5x Margin & Regulatory Charges"
      maxWidth="lg"
    >
      <form onSubmit={handleOrderSubmit} className="space-y-4 text-xs text-text-secondary">
        {errorMessage && (
          <div className="p-3 rounded-xl bg-brand-negative/15 border border-brand-negative/30 text-brand-negative font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Stock Selector & Live Depth bar */}
        <div className="p-3 rounded-xl bg-bg-secondary border border-border-subtle flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="w-full sm:w-1/2">
            <label className="block text-[11px] font-medium text-text-muted mb-1">Select Scrip</label>
            <select
              value={symbol}
              onChange={e => setSymbol(e.target.value)}
              className="w-full bg-bg-elevated border border-border-subtle rounded-lg px-2.5 py-1.5 text-xs font-bold text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent"
            >
              {quotes.map(q => (
                <option key={q.symbol} value={q.symbol}>
                  {q.symbol} — ₹{q.price.toFixed(2)} ({q.name})
                </option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-auto text-left sm:text-right text-[11px] space-y-0.5">
            <div className="text-text-muted">Market Depth (Top)</div>
            <div className="font-mono text-[10px]">
              <span className="text-brand-positive font-bold">Bid: ₹{(currentPrice * 0.9995).toFixed(2)}</span>
              <span className="text-text-muted mx-1.5">|</span>
              <span className="text-brand-negative font-bold">Ask: ₹{(currentPrice * 1.0005).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Direction Switcher (Zerodha Kite Style BUY vs SELL) */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-bg-secondary rounded-xl border border-border-subtle">
          <button
            type="button"
            onClick={() => setDirection("BUY")}
            className={`py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              isBuy
                ? "bg-[#1E60D5] text-white shadow-md shadow-blue-500/20"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            BUY (Long)
          </button>
          <button
            type="button"
            onClick={() => setDirection("SELL")}
            className={`py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              !isBuy
                ? "bg-[#EF4444] text-white shadow-md shadow-red-500/20"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            SELL (Short)
          </button>
        </div>

        {/* Product Type (MIS 5x vs CNC 1x) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-text-primary">Product Type</label>
            <span className="text-[11px] text-text-muted">SEBI Leverage Limits</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setProductType("INTRADAY (MIS)")}
              className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                productType === "INTRADAY (MIS)"
                  ? "bg-bg-elevated border-brand-accent shadow-sm"
                  : "bg-bg-secondary border-border-subtle text-text-muted hover:border-border-subtle/80"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-text-primary">Intraday MIS</span>
                <span className="px-1.5 py-0.5 rounded bg-brand-accent/20 text-brand-accent text-[10px] font-extrabold">
                  5x LEVERAGE
                </span>
              </div>
              <p className="text-[11px] text-text-muted leading-tight">
                Requires only 20% margin. Square off before 03:20 PM.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setProductType("DELIVERY (CNC)")}
              className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                productType === "DELIVERY (CNC)"
                  ? "bg-bg-elevated border-brand-accent shadow-sm"
                  : "bg-bg-secondary border-border-subtle text-text-muted hover:border-border-subtle/80"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-text-primary">Longterm CNC</span>
                <span className="px-1.5 py-0.5 rounded bg-bg-secondary border border-border-subtle text-text-muted text-[10px] font-bold">
                  1x CASH
                </span>
              </div>
              <p className="text-[11px] text-text-muted leading-tight">
                100% margin required. Delivery shares stored in Demat.
              </p>
            </button>
          </div>
        </div>

        {/* Order Type (Market / Limit / SL / SL-M) */}
        <div>
          <label className="block text-xs font-semibold text-text-primary mb-1.5">Order Type</label>
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-bg-secondary rounded-xl border border-border-subtle text-center">
            {(["MARKET", "LIMIT", "SL", "SL-M"] as const).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setOrderType(type)}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                  orderType === type
                    ? "bg-bg-elevated text-text-primary shadow-xs border border-border-subtle font-extrabold text-brand-accent"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity & Price Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-text-primary">Quantity (Shares)</label>
              <button
                type="button"
                onClick={handleMaxQty}
                className="text-[10px] font-bold text-brand-accent hover:underline"
              >
                Max: {maxAffordableQty}
              </button>
            </div>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-bg-secondary border border-border-subtle rounded-xl px-3 py-2 text-sm font-mono font-bold text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent"
            />
            {/* Quick Qty Buttons */}
            <div className="flex gap-1.5 mt-1.5">
              {[10, 25, 50, 100].map(q => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuantity(q)}
                  className="flex-1 py-1 rounded bg-bg-secondary border border-border-subtle hover:bg-bg-elevated text-[10px] font-mono font-semibold text-text-muted transition-colors"
                >
                  +{q}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              {orderType === "MARKET" ? "Price (At Market)" : "Limit Price (₹)"}
            </label>
            <input
              type="number"
              step="0.05"
              disabled={orderType === "MARKET" || orderType === "SL-M"}
              value={orderType === "MARKET" || orderType === "SL-M" ? currentPrice.toFixed(2) : limitPrice}
              onChange={e => setLimitPrice(e.target.value)}
              className={`w-full border rounded-xl px-3 py-2 text-sm font-mono font-bold text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent ${
                orderType === "MARKET" || orderType === "SL-M"
                  ? "bg-bg-elevated/50 text-text-muted border-border-subtle cursor-not-allowed"
                  : "bg-bg-secondary border-border-subtle"
              }`}
            />
            <span className="text-[10px] text-text-muted mt-1 block">
              Tick size: ₹0.05 • LTP: ₹{currentPrice.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Trigger Price for SL & SL-M */}
        {(orderType === "SL" || orderType === "SL-M") && (
          <div className="p-3 rounded-xl bg-bg-secondary border border-border-subtle">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-brand-warning flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                Trigger Price (₹)
              </label>
              <span className="text-[10px] text-text-muted">Order activates when market hits trigger</span>
            </div>
            <input
              type="number"
              step="0.05"
              value={triggerPrice}
              onChange={e => setTriggerPrice(e.target.value)}
              placeholder="Enter trigger price"
              className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-3 py-2 text-sm font-mono font-bold text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent"
            />
          </div>
        )}

        {/* Optional Target and Stoploss */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Stop Loss (Optional)</label>
            <input
              type="number"
              step="0.05"
              placeholder="e.g. 2940"
              value={stopLoss}
              onChange={e => setStopLoss(e.target.value)}
              className="w-full bg-bg-secondary border border-border-subtle rounded-xl px-3 py-2 text-xs font-mono text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Target Price (Optional)</label>
            <input
              type="number"
              step="0.05"
              placeholder="e.g. 3050"
              value={targetPrice}
              onChange={e => setTargetPrice(e.target.value)}
              className="w-full bg-bg-secondary border border-border-subtle rounded-xl px-3 py-2 text-xs font-mono text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent"
            />
          </div>
        </div>

        {/* Real-time Margin & Taxes Box (Zerodha Kite & Angel One Style) */}
        <div className="p-3.5 rounded-2xl bg-bg-elevated border border-border-subtle space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-text-muted text-xs">Margin Required</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-base font-extrabold text-text-primary font-mono">
                  ₹{requiredMargin.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="px-1.5 py-0.2 rounded bg-brand-accent/15 text-brand-accent text-[10px] font-bold">
                  {isIntraday ? "5x Applied" : "1x Cash"}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-text-muted text-xs">Available Margin</span>
              <div className="text-sm font-bold font-mono text-text-primary mt-0.5">
                ₹{Math.round(paperPortfolio.cashBalance).toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          {/* Charges & Taxes Toggle Bar */}
          <div className="pt-2 border-t border-border-subtle flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsChargesExpanded(!isChargesExpanded)}
              className="flex items-center gap-1 text-[11px] font-semibold text-brand-accent hover:underline"
            >
              <span>Approx. Charges & Taxes: ₹{charges.totalCharges.toFixed(2)}</span>
              {isChargesExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            <span className="text-[11px] text-text-muted font-mono">
              Breakeven: +₹{charges.breakevenPoints.toFixed(2)}
            </span>
          </div>

          {/* Expandable Zerodha/Angel One Charges Breakdown */}
          {isChargesExpanded && (
            <div className="p-2.5 rounded-xl bg-bg-secondary border border-border-subtle text-[10px] space-y-1 font-mono text-text-muted animate-fadeIn">
              <div className="flex justify-between">
                <span>Brokerage</span>
                <span className="text-text-primary font-bold">₹{charges.brokerage.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>STT / CTT ({isIntraday ? "0 on Buy, 0.025% on Sell" : "0.1% on Buy & Sell"})</span>
                <span className="text-text-primary font-bold">₹{charges.stt.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Exchange Turnover Charges (0.00297%)</span>
                <span className="text-text-primary font-bold">₹{charges.exchangeCharges.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (18% on Brokerage & Txn)</span>
                <span className="text-text-primary font-bold">₹{charges.gst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>SEBI Turnover Fees</span>
                <span className="text-text-primary font-bold">₹{charges.sebiCharges.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Stamp Duty ({direction === "BUY" ? (isIntraday ? "0.003%" : "0.015%") : "0%"})</span>
                <span className="text-text-primary font-bold">₹{charges.stampDuty.toFixed(2)}</span>
              </div>
              <div className="pt-1 border-t border-border-subtle flex justify-between font-bold text-brand-negative">
                <span>Total Taxes & Charges</span>
                <span>₹{charges.totalCharges.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Margin Check Indicator */}
          {!hasSufficientMargin && (
            <div className="p-2 rounded-lg bg-brand-negative/15 text-brand-negative text-[11px] font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Margin Shortfall: ₹{Math.round(marginDeficit).toLocaleString("en-IN")}. Reduce quantity or use 5x Intraday.</span>
            </div>
          )}
        </div>

        {/* Submit Actions Button */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => {
              setIsPlaceOrderModalOpen(false);
              setSelectedStockForOrder(null);
            }}
            className="flex-1"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            size="md"
            disabled={!hasSufficientMargin || isSubmitting}
            className={`flex-[2] font-bold text-white shadow-lg transition-all active:scale-95 ${
              isSuccess
                ? "bg-emerald-600 hover:bg-emerald-700"
                : isBuy
                ? "bg-[#1E60D5] hover:bg-[#1A54BD]"
                : "bg-[#EF4444] hover:bg-[#DC2626]"
            }`}
            icon={
              isSuccess ? (
                <CheckCircle2 className="w-4 h-4 animate-bounce text-white" />
              ) : isBuy ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )
            }
          >
            {isSuccess
              ? "✓ Order Placed!"
              : isSubmitting
              ? "⚡ Executing..."
              : `${direction} ${symbol} (${quantity} Qty)`}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
