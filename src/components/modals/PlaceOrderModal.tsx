import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { useApp } from "../../context/AppContext";
import { useMarketData } from "../../context/MarketDataContext";
import { TradeDirection } from "../../types";
import { TrendingUp, TrendingDown, ShieldAlert, Sparkles } from "lucide-react";

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
  const [orderType, setOrderType] = useState<"MARKET" | "LIMIT">("MARKET");
  const [quantity, setQuantity] = useState(10);
  const [limitPrice, setLimitPrice] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (selectedStockForOrder) {
      setSymbol(selectedStockForOrder);
    }
  }, [selectedStockForOrder]);

  const quote = getQuote(symbol) || quotes[0];
  const currentPrice = quote ? quote.price : 100;
  const executionPrice = orderType === "MARKET" ? currentPrice : parseFloat(limitPrice) || currentPrice;
  const requiredMargin = productType === "INTRADAY (MIS)" ? (executionPrice * quantity) / 5 : executionPrice * quantity;

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!quantity || quantity <= 0) {
      setErrorMessage("Please enter a valid quantity.");
      return;
    }

    if (requiredMargin > paperPortfolio.cashBalance) {
      setErrorMessage(`Insufficient paper cash balance. Required: ₹${Math.round(requiredMargin)}, Available: ₹${Math.round(paperPortfolio.cashBalance)}`);
      return;
    }

    try {
      await placePaperOrder({
        stockSymbol: quote.symbol,
        stockName: quote.name,
        direction,
        orderType,
        productType,
        quantity,
        price: executionPrice,
        targetPrice: targetPrice ? parseFloat(targetPrice) : undefined,
        stopLoss: stopLoss ? parseFloat(stopLoss) : undefined
      });

      setIsPlaceOrderModalOpen(false);
      setSelectedStockForOrder(null);
    } catch (err) {
      setErrorMessage("Failed to place order.");
    }
  };

  return (
    <Modal
      isOpen={isPlaceOrderModalOpen}
      onClose={() => {
        setIsPlaceOrderModalOpen(false);
        setSelectedStockForOrder(null);
      }}
      title="Place Paper Trading Order"
      subtitle={`Virtual Capital Simulation • Available Cash: ₹${Math.round(paperPortfolio.cashBalance).toLocaleString("en-IN")}`}
      maxWidth="lg"
    >
      <form onSubmit={handleOrderSubmit} className="space-y-5">
        {errorMessage && (
          <div className="p-3 rounded-xl bg-brand-negative/15 border border-brand-negative/30 text-brand-negative text-xs">
            {errorMessage}
          </div>
        )}

        {/* Stock Selector */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Select Stock</label>
          <select
            value={symbol}
            onChange={e => setSymbol(e.target.value)}
            className="w-full bg-bg-secondary border border-border-subtle rounded-xl px-3 py-2 text-xs font-bold text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent"
          >
            {quotes.map(q => (
              <option key={q.symbol} value={q.symbol}>
                {q.symbol} — ₹{q.price.toFixed(2)} ({q.name})
              </option>
            ))}
          </select>
        </div>

        {/* Direction & Product Type */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Direction</label>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setDirection("BUY")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                  direction === "BUY"
                    ? "bg-brand-positive/20 border-brand-positive text-brand-positive"
                    : "bg-bg-secondary border-border-subtle text-text-muted"
                }`}
              >
                BUY
              </button>
              <button
                type="button"
                onClick={() => setDirection("SELL")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                  direction === "SELL"
                    ? "bg-brand-negative/20 border-brand-negative text-brand-negative"
                    : "bg-bg-secondary border-border-subtle text-text-muted"
                }`}
              >
                SELL
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Product</label>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setProductType("INTRADAY (MIS)")}
                className={`flex-1 py-2 rounded-xl text-[11px] font-bold border transition-all ${
                  productType === "INTRADAY (MIS)"
                    ? "bg-brand-accent/20 border-brand-accent text-brand-accent"
                    : "bg-bg-secondary border-border-subtle text-text-muted"
                }`}
              >
                MIS (5x)
              </button>
              <button
                type="button"
                onClick={() => setProductType("DELIVERY (CNC)")}
                className={`flex-1 py-2 rounded-xl text-[11px] font-bold border transition-all ${
                  productType === "DELIVERY (CNC)"
                    ? "bg-brand-accent/20 border-brand-accent text-brand-accent"
                    : "bg-bg-secondary border-border-subtle text-text-muted"
                }`}
              >
                CNC (1x)
              </button>
            </div>
          </div>
        </div>

        {/* Quantity & Order Type */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-bg-secondary border border-border-subtle rounded-xl px-3 py-2 text-sm font-bold text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Order Type</label>
            <select
              value={orderType}
              onChange={e => setOrderType(e.target.value as any)}
              className="w-full bg-bg-secondary border border-border-subtle rounded-xl px-3 py-2 text-xs font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent"
            >
              <option value="MARKET">MARKET (₹{currentPrice.toFixed(2)})</option>
              <option value="LIMIT">LIMIT Order</option>
            </select>
          </div>
        </div>

        {/* Limit Price if Limit order */}
        {orderType === "LIMIT" && (
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Limit Price (₹)</label>
            <input
              type="number"
              step="0.05"
              placeholder={currentPrice.toString()}
              value={limitPrice}
              onChange={e => setLimitPrice(e.target.value)}
              className="w-full bg-bg-secondary border border-border-subtle rounded-xl px-3 py-2 text-sm font-bold text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent"
            />
          </div>
        )}

        {/* Stop Loss & Target Price */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Stop Loss (Optional)</label>
            <input
              type="number"
              step="0.05"
              placeholder="e.g. 2850"
              value={stopLoss}
              onChange={e => setStopLoss(e.target.value)}
              className="w-full bg-bg-secondary border border-border-subtle rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Target Price (Optional)</label>
            <input
              type="number"
              step="0.05"
              placeholder="e.g. 2940"
              value={targetPrice}
              onChange={e => setTargetPrice(e.target.value)}
              className="w-full bg-bg-secondary border border-border-subtle rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent"
            />
          </div>
        </div>

        {/* Order Margin Summary */}
        <div className="p-3.5 rounded-xl bg-bg-elevated border border-border-subtle flex items-center justify-between text-xs">
          <span className="text-text-secondary">Required Margin:</span>
          <div className="text-right">
            <span className="font-bold text-text-primary text-sm">₹{Math.round(requiredMargin).toLocaleString("en-IN")}</span>
            <span className="text-[10px] text-text-muted block">
              {productType === "INTRADAY (MIS)" ? "5x Intraday Leverage" : "Full Value CNC"}
            </span>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsPlaceOrderModalOpen(false);
              setSelectedStockForOrder(null);
            }}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" icon={<Sparkles className="w-4 h-4" />}>
            Execute Order
          </Button>
        </div>
      </form>
    </Modal>
  );
};
