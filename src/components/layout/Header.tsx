import React, { useState, useEffect } from "react";
import {
  Search,
  Sun,
  Moon,
  Plus,
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Radio
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useMarketData } from "../../context/MarketDataContext";
import { useApp } from "../../context/AppContext";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const {
    marketStatus,
    quotes,
    openStockModal,
    isLiveConnected,
    lastLiveUpdate,
    refreshData,
    isLoading,
    searchAllIndianStocks
  } = useMarketData();
  const { setIsNewTradeModalOpen, setActiveTab } = useApp();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  const [istTime, setIstTime] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    { symbol: string; name: string; series?: string; price?: number; change?: number; changePercent?: number }[]
  >([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const ist = new Date(utc + 3600000 * 5.5);
      setIstTime(
        ist.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true
        }) + " IST"
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const matched = searchAllIndianStocks(searchQuery);
    const enriched = matched.slice(0, 8).map(company => {
      const q = quotes.find(x => x.symbol.toUpperCase() === company.symbol.toUpperCase());
      return {
        symbol: company.symbol,
        name: company.name,
        series: company.series,
        price: q?.price,
        change: q?.change,
        changePercent: q?.changePercent
      };
    });
    setSearchResults(enriched);
  }, [searchQuery, quotes, searchAllIndianStocks]);

  return (
    <header className="sticky top-0 z-20 w-full bg-bg-primary/85 backdrop-blur-md border-b border-border-subtle px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
      {/* Search bar with quick results dropdown */}
      <div className="relative flex-1 max-w-xs sm:max-w-md">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Search all 2,540+ NSE & BSE companies..."
            className="w-full bg-bg-secondary border border-border-subtle rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand-accent focus:border-brand-accent transition-colors"
          />
        </div>

        {/* Dropdown search results */}
        {isSearchOpen && searchResults.length > 0 && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsSearchOpen(false)}
            />
            <div className="absolute left-0 right-0 top-full mt-2 bg-bg-card border border-border-subtle rounded-2xl shadow-2xl overflow-hidden z-20 py-2 divide-y divide-border-subtle/50">
              <div className="px-3.5 py-1.5 text-[10px] font-bold text-text-muted uppercase tracking-wider bg-bg-secondary/40 flex items-center justify-between">
                <span>NSE Listed Equities</span>
                <span>{searchResults.length} matches</span>
              </div>
              {searchResults.map(stock => (
                <div
                  key={stock.symbol}
                  onClick={() => {
                    openStockModal(stock.symbol);
                    setIsSearchOpen(false);
                    setSearchQuery("");
                  }}
                  className="flex items-center justify-between px-4 py-2.5 hover:bg-bg-elevated cursor-pointer transition-colors"
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-text-primary">{stock.symbol}</span>
                      <span className="text-[10px] text-text-muted px-1.5 py-0.5 rounded bg-bg-secondary border border-border-subtle/60 font-mono">
                        NSE:{stock.series || "EQ"}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-secondary truncate max-w-[220px]">{stock.name}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {stock.price !== undefined ? (
                      <>
                        <div className="text-xs font-bold text-text-primary">₹{stock.price.toFixed(2)}</div>
                        <div
                          className={`text-[10px] font-semibold ${
                            (stock.change || 0) >= 0 ? "text-brand-positive" : "text-brand-negative"
                          }`}
                        >
                          {(stock.change || 0) >= 0 ? "+" : ""}{stock.change?.toFixed(2)} ({stock.changePercent}%)
                        </div>
                      </>
                    ) : (
                      <span className="text-[10px] font-semibold text-brand-accent bg-brand-accent/10 px-2 py-0.5 rounded border border-brand-accent/20">
                        View Chart
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Right controls: Market Status, Clock, Theme, CTAs */}
      <div className="flex items-center gap-2 sm:gap-3.5">
        {/* Live Market Connected Badge */}
        <div
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold select-none ${
            isLiveConnected
              ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/30"
              : "bg-bg-secondary text-text-muted border-border-subtle"
          }`}
          title={lastLiveUpdate ? `Live prices synced with NSE/BSE at ${lastLiveUpdate}` : "Connecting to NSE/BSE..."}
        >
          <span className={`w-2 h-2 rounded-full ${isLiveConnected ? "bg-emerald-400 animate-pulse" : "bg-text-muted"}`} />
          <span>{isLiveConnected ? "NSE/BSE Live" : "Connecting..."}</span>
        </div>

        {/* Market Status Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-bg-secondary border border-border-subtle text-xs">
          <span className={`w-2 h-2 rounded-full ${marketStatus.isOpen ? "bg-brand-positive animate-pulse" : "bg-brand-negative"}`} />
          <span className="font-semibold text-text-primary">{marketStatus.status}</span>
          <span className="text-text-muted">({marketStatus.timeUntilNext})</span>
        </div>

        {/* IST Clock */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-text-secondary px-2.5 py-1.5 rounded-xl bg-bg-secondary border border-border-subtle font-mono">
          <Clock className="w-3.5 h-3.5 text-brand-accent" />
          <span>{istTime}</span>
        </div>

        {/* Manual Refresh Button */}
        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing || isLoading}
          className="p-2 rounded-xl bg-bg-secondary border border-border-subtle text-text-secondary hover:text-brand-accent hover:bg-bg-elevated transition-colors disabled:opacity-50"
          title="Refresh live market quotes"
          aria-label="Refresh live quotes"
        >
          <RotateCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-brand-accent" : ""}`} />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-bg-secondary border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-brand-accent" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>

        {/* Log Trade CTA */}
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setIsNewTradeModalOpen(true)}
          className="hidden sm:inline-flex"
        >
          Log Trade
        </Button>
      </div>
    </header>
  );
};