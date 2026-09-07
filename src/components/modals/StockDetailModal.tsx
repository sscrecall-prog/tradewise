import React, { useState, useEffect } from "react";
import { Button } from "../common/Button";
import { Badge } from "../common/Badge";
import { TradingViewProChart } from "../charts/TradingViewProChart";
import { useMarketData } from "../../context/MarketDataContext";
import { useApp } from "../../context/AppContext";
import { TimeFrame, HistoricalPrice } from "../../types";
import {
  TrendingUp,
  TrendingDown,
  Bookmark,
  BookmarkCheck,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Maximize2,
  Minimize2,
  X,
  ExternalLink,
  Sparkles,
  Layers
} from "lucide-react";

export const StockDetailModal: React.FC = () => {
  const { selectedStockSymbol, closeStockModal, getQuote, getHistoricalData, fetchAndAddQuote } = useMarketData();
  const {
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    setIsPlaceOrderModalOpen,
    setSelectedStockForOrder
  } = useApp();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeframe, setTimeframe] = useState<TimeFrame>("1D");
  const [history, setHistory] = useState<HistoricalPrice[]>([]);
  const [loadingChart, setLoadingChart] = useState(false);

  const quote = selectedStockSymbol ? getQuote(selectedStockSymbol) : undefined;
  const inWatchlist = selectedStockSymbol ? isInWatchlist(selectedStockSymbol) : false;

  // Auto-fetch quote if not present in cached quotes
  useEffect(() => {
    if (selectedStockSymbol && !quote) {
      fetchAndAddQuote(selectedStockSymbol);
    }
  }, [selectedStockSymbol, quote, fetchAndAddQuote]);

  // Fetch genuine historical candlestick data
  useEffect(() => {
    if (!selectedStockSymbol) return;
    setLoadingChart(true);
    getHistoricalData(selectedStockSymbol, timeframe)
      .then(data => setHistory(data))
      .finally(() => setLoadingChart(false));
  }, [selectedStockSymbol, timeframe, getHistoricalData]);

  // Handle ESC key to exit fullscreen or close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          closeStockModal();
        }
      }
    };
    if (selectedStockSymbol) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedStockSymbol, isFullscreen, closeStockModal]);

  if (!selectedStockSymbol || !quote) return null;

  const isPositive = quote.change >= 0;

  const handleToggleWatchlist = () => {
    if (inWatchlist) removeFromWatchlist(quote.symbol);
    else addToWatchlist(quote.symbol);
  };

  const handleStartTrade = (type: "BUY" | "SELL") => {
    setSelectedStockForOrder(quote.symbol);
    setIsPlaceOrderModalOpen(true);
    if (!isFullscreen) closeStockModal();
  };

  const tvWebUrl = `https://in.tradingview.com/chart/?symbol=NSE:${quote.symbol}`;

  // FULLSCREEN TRADING TERMINAL MODE
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 w-screen h-screen bg-[#090A0F] text-text-primary flex flex-col overflow-hidden animate-fadeIn select-none">
        {/* Top Navigation Bar */}
        <header className="h-14 border-b border-border-subtle bg-[#0E1118]/95 backdrop-blur-md px-4 flex items-center justify-between gap-4 flex-shrink-0">
          {/* Left: Symbol, Name, Price Hero */}
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-text-primary tracking-wide">{quote.symbol}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg-card border border-border-subtle text-text-muted">
                  {quote.sector}
                </span>
                <span className="text-xs text-text-muted hidden md:inline truncate max-w-[180px]">{quote.name}</span>
              </div>
            </div>

            <div className="h-6 w-px bg-border-subtle mx-1 hidden sm:block" />

            <div className="flex items-baseline gap-2">
              <span className="text-lg font-extrabold text-text-primary">
                ₹{quote.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
              <span
                className={`text-xs font-bold flex items-center gap-0.5 ${
                  isPositive ? "text-brand-positive" : "text-brand-negative"
                }`}
              >
                {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {isPositive ? "+" : ""}{quote.change.toFixed(2)} ({isPositive ? "+" : ""}{quote.changePercent}%)
              </span>
            </div>
          </div>

          {/* Right: Quick Buy/Sell, Watchlist, Fullscreen Exit, External Link, Close */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleStartTrade("BUY")}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-brand-positive hover:bg-emerald-600 text-white shadow-sm transition-colors"
            >
              BUY
            </button>
            <button
              onClick={() => handleStartTrade("SELL")}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-brand-negative hover:bg-rose-600 text-white shadow-sm transition-colors"
            >
              SELL
            </button>

            <button
              onClick={handleToggleWatchlist}
              className={`p-2 rounded-xl border transition-colors ${
                inWatchlist
                  ? "bg-brand-accent/15 text-brand-accent border-brand-accent/30"
                  : "bg-bg-card border-border-subtle text-text-muted hover:text-text-primary"
              }`}
              title={inWatchlist ? "In Watchlist" : "Add to Watchlist"}
            >
              {inWatchlist ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>

            <a
              href={tvWebUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 rounded-xl bg-bg-card border border-border-subtle text-text-secondary hover:text-brand-accent text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Open Official Chart in TradingView.com"
            >
              <span className="hidden sm:inline">TradingView.com</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 rounded-xl bg-bg-card border border-border-subtle text-text-secondary hover:text-brand-accent hover:bg-bg-elevated transition-colors"
              title="Exit Fullscreen (or press Esc)"
            >
              <Minimize2 className="w-4 h-4" />
            </button>

            <button
              onClick={closeStockModal}
              className="p-2 rounded-xl bg-bg-card border border-border-subtle text-text-secondary hover:text-brand-negative hover:bg-brand-negative/10 transition-colors"
              title="Close Chart"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Fullscreen Main Chart View Area */}
        <main className="flex-1 w-full h-[calc(100vh-3.5rem)] bg-[#090A0F] overflow-hidden relative">
          {loadingChart && history.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-xs text-text-muted">
              Loading live exchange candles...
            </div>
          ) : (
            <TradingViewProChart
              data={history}
              symbol={quote.symbol}
              timeframe={timeframe}
              onTimeframeChange={setTimeframe}
              height={window.innerHeight - 60}
              className="w-full h-full border-0 rounded-none"
            />
          )}
        </main>
      </div>
    );
  }

  // STANDARD WINDOWED MODAL VIEW
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" onClick={closeStockModal} />

      {/* Modal Card */}
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-bg-card border border-border-subtle rounded-3xl shadow-2xl overflow-hidden z-10 animate-scaleUp">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border-subtle bg-bg-card/70 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl text-text-primary">{quote.symbol}</span>
              <Badge variant="neutral" size="sm">{quote.sector}</Badge>
              <span className="text-xs text-text-muted font-normal">{quote.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={tvWebUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 rounded-xl bg-bg-secondary border border-border-subtle text-text-secondary hover:text-brand-accent text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Open Official Chart in TradingView.com"
            >
              <span className="hidden sm:inline">TradingView.com</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* FULLSCREEN BUTTON */}
            <button
              onClick={() => setIsFullscreen(true)}
              className="px-3 py-1.5 rounded-xl bg-brand-accent/15 hover:bg-brand-accent/25 border border-brand-accent/40 text-brand-accent text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              title="Expand Chart to Full Screen (TradingView Workstation)"
            >
              <Maximize2 className="w-3.5 h-3.5" /> Full Screen
            </button>

            <button
              onClick={closeStockModal}
              className="p-1.5 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          {/* Price Hero & Quick Execution Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
            <div>
              <div className="text-3xl font-extrabold text-text-primary">
                ₹{quote.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-sm font-bold flex items-center gap-0.5 ${
                    isPositive ? "text-brand-positive" : "text-brand-negative"
                  }`}
                >
                  {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {isPositive ? "+" : ""}{quote.change.toFixed(2)} ({isPositive ? "+" : ""}{quote.changePercent}%)
                </span>
                <span className="text-xs text-text-muted">Today</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleStartTrade("BUY")}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-positive hover:bg-emerald-600 text-white shadow-sm transition-colors"
              >
                BUY (MIS / CNC)
              </button>
              <button
                onClick={() => handleStartTrade("SELL")}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-negative hover:bg-rose-600 text-white shadow-sm transition-colors"
              >
                SELL (Short)
              </button>
              <Button
                variant={inWatchlist ? "secondary" : "outline"}
                size="sm"
                icon={inWatchlist ? <BookmarkCheck className="w-4 h-4 text-brand-accent" /> : <Bookmark className="w-4 h-4" />}
                onClick={handleToggleWatchlist}
              >
                {inWatchlist ? "In Watchlist" : "Add Watchlist"}
              </Button>
            </div>
          </div>

          {/* Chart Display Area: TradingView Official Lightweight Engine */}
          <div className="w-full">
            {loadingChart && history.length === 0 ? (
              <div className="h-[460px] rounded-2xl bg-[#090A0F] border border-border-subtle flex items-center justify-center text-xs text-text-muted">
                Loading live exchange candles...
              </div>
            ) : (
              <TradingViewProChart
                data={history}
                symbol={quote.symbol}
                timeframe={timeframe}
                onTimeframeChange={setTimeframe}
                height={460}
                className="w-full"
              />
            )}
          </div>

          {/* Key Fundamental & Market Data Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-bg-secondary border border-border-subtle">
              <span className="text-[11px] text-text-muted block">Open</span>
              <span className="text-sm font-semibold text-text-primary">₹{quote.open.toFixed(2)}</span>
            </div>
            <div className="p-3 rounded-xl bg-bg-secondary border border-border-subtle">
              <span className="text-[11px] text-text-muted block">Day High</span>
              <span className="text-sm font-semibold text-brand-positive">₹{quote.high.toFixed(2)}</span>
            </div>
            <div className="p-3 rounded-xl bg-bg-secondary border border-border-subtle">
              <span className="text-[11px] text-text-muted block">Day Low</span>
              <span className="text-sm font-semibold text-brand-negative">₹{quote.low.toFixed(2)}</span>
            </div>
            <div className="p-3 rounded-xl bg-bg-secondary border border-border-subtle">
              <span className="text-[11px] text-text-muted block">Prev. Close</span>
              <span className="text-sm font-semibold text-text-primary">₹{quote.prevClose.toFixed(2)}</span>
            </div>
            <div className="p-3 rounded-xl bg-bg-secondary border border-border-subtle">
              <span className="text-[11px] text-text-muted block">52W High</span>
              <span className="text-sm font-semibold text-text-primary">₹{quote.high52W.toFixed(2)}</span>
            </div>
            <div className="p-3 rounded-xl bg-bg-secondary border border-border-subtle">
              <span className="text-[11px] text-text-muted block">52W Low</span>
              <span className="text-sm font-semibold text-text-primary">₹{quote.low52W.toFixed(2)}</span>
            </div>
            <div className="p-3 rounded-xl bg-bg-secondary border border-border-subtle">
              <span className="text-[11px] text-text-muted block">Volume</span>
              <span className="text-sm font-semibold text-text-primary">{quote.volume.toLocaleString("en-IN")}</span>
            </div>
            <div className="p-3 rounded-xl bg-bg-secondary border border-border-subtle">
              <span className="text-[11px] text-text-muted block">Market Cap</span>
              <span className="text-sm font-semibold text-text-primary">{quote.marketCap || "Large Cap"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
