import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { useMarketData } from "../context/MarketDataContext";
import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";
import { Sparkline } from "../components/charts/Sparkline";
import { StockDetailModal } from "../components/modals/StockDetailModal";
import { ListedCompany, MarketQuote } from "../types";
import {
  Bookmark,
  Trash2,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Bell,
  BellRing,
  ArrowUpDown,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  X,
  Layers,
  ChevronDown
} from "lucide-react";

interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: "ABOVE" | "BELOW";
  createdPrice: number;
  active: boolean;
  createdAt: string;
}

interface CustomWatchlist {
  id: string;
  name: string;
  icon: string;
  symbols: string[];
}

const DEFAULT_WATCHLISTS: CustomWatchlist[] = [
  {
    id: "favorites",
    name: "My Favorites",
    icon: "⭐",
    symbols: ["RELIANCE", "HDFCBANK", "ICICIBANK", "TCS", "INFY", "SBIN", "TATAMOTORS", "TRENT"]
  },
  {
    id: "nifty50",
    name: "Nifty 50 Core",
    icon: "🏛️",
    symbols: ["RELIANCE", "HDFCBANK", "ICICIBANK", "TCS", "INFY", "SBIN", "BHARTIARTL", "ITC", "LT", "KOTAKBANK"]
  },
  {
    id: "momentum",
    name: "F&O Momentum",
    icon: "⚡",
    symbols: ["TRENT", "SUZLON", "DIXON", "HAL", "BEL", "JIOFIN", "TATAMOTORS", "IRFC"]
  },
  {
    id: "breakouts",
    name: "Breakout Radar",
    icon: "🎯",
    symbols: ["SUZLON", "HAL", "TRENT", "DIXON", "IRFC"]
  }
];

export const WatchlistPage: React.FC = () => {
  const {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    setIsPlaceOrderModalOpen,
    setSelectedStockForOrder,
    setActiveTab
  } = useApp();

  const {
    quotes,
    openStockModal,
    searchAllIndianStocks,
    fetchAndAddQuote,
    isLiveConnected,
    lastLiveUpdate
  } = useMarketData();

  // Multi-watchlist state with LocalStorage persistence
  const [watchlists, setWatchlists] = useState<CustomWatchlist[]>(() => {
    try {
      const saved = localStorage.getItem("tradewise_custom_watchlists");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_WATCHLISTS;
  });

  const [activeListId, setActiveListId] = useState<string>("favorites");
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [sortOption, setSortOption] = useState<"default" | "gainers" | "losers" | "volume" | "name">("default");

  // Search & add stock inline drawer/modal
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [isCreateListModalOpen, setIsCreateListModalOpen] = useState(false);

  // Price Alerts state
  const [alerts, setAlerts] = useState<PriceAlert[]>(() => {
    try {
      const saved = localStorage.getItem("tradewise_price_alerts");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [alertModalStock, setAlertModalStock] = useState<MarketQuote | null>(null);
  const [alertTargetPrice, setAlertTargetPrice] = useState<string>("");
  const [alertCondition, setAlertCondition] = useState<"ABOVE" | "BELOW">("ABOVE");

  // Save watchlists to localStorage
  useEffect(() => {
    localStorage.setItem("tradewise_custom_watchlists", JSON.stringify(watchlists));
  }, [watchlists]);

  // Save alerts to localStorage
  useEffect(() => {
    localStorage.setItem("tradewise_price_alerts", JSON.stringify(alerts));
  }, [alerts]);

  const activeWatchlist = useMemo(() => {
    return watchlists.find(w => w.id === activeListId) || watchlists[0];
  }, [watchlists, activeListId]);

  // Ensure all symbols in the active watchlist have their live quotes fetched
  useEffect(() => {
    activeWatchlist.symbols.forEach(sym => {
      if (!quotes.some(q => q.symbol.toUpperCase() === sym.toUpperCase())) {
        fetchAndAddQuote(sym);
      }
    });
  }, [activeWatchlist, quotes, fetchAndAddQuote]);

  // Map symbols to full MarketQuote objects
  const rawListQuotes = useMemo(() => {
    return activeWatchlist.symbols.map(sym => {
      const clean = sym.toUpperCase();
      const existing = quotes.find(q => q.symbol.toUpperCase() === clean);
      if (existing) return existing;

      return {
        symbol: clean,
        name: clean,
        price: 0,
        change: 0,
        changePercent: 0,
        open: 0,
        high: 0,
        low: 0,
        close: 0,
        prevClose: 0,
        volume: 0,
        high52W: 0,
        low52W: 0,
        sector: "NSE Listed",
        sparkline: [0, 0],
        lastUpdated: "Syncing..."
      } as MarketQuote;
    });
  }, [activeWatchlist, quotes]);

  // Filter & Sort
  const sortedQuotes = useMemo(() => {
    let result = [...rawListQuotes];

    if (sortOption === "gainers") {
      result.sort((a, b) => b.changePercent - a.changePercent);
    } else if (sortOption === "losers") {
      result.sort((a, b) => a.changePercent - b.changePercent);
    } else if (sortOption === "volume") {
      result.sort((a, b) => b.volume - a.volume);
    } else if (sortOption === "name") {
      result.sort((a, b) => a.symbol.localeCompare(b.symbol));
    }

    return result;
  }, [rawListQuotes, sortOption]);

  // Watchlist summary metrics
  const stats = useMemo(() => {
    const validQuotes = rawListQuotes.filter(q => q.price > 0);
    const count = validQuotes.length;
    const gainers = validQuotes.filter(q => q.change > 0).length;
    const losers = validQuotes.filter(q => q.change < 0).length;
    const avgChange = count > 0 ? validQuotes.reduce((acc, q) => acc + q.changePercent, 0) / count : 0;
    return { count, gainers, losers, avgChange: Math.round(avgChange * 100) / 100 };
  }, [rawListQuotes]);

  // Search results for adding stocks
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchAllIndianStocks(searchQuery);
  }, [searchQuery, searchAllIndianStocks]);

  // Add stock to active watchlist
  const handleAddStock = async (stock: ListedCompany) => {
    const sym = stock.symbol.toUpperCase();
    if (!activeWatchlist.symbols.includes(sym)) {
      const updated = watchlists.map(w => {
        if (w.id === activeWatchlist.id) {
          return { ...w, symbols: [...w.symbols, sym] };
        }
        return w;
      });
      setWatchlists(updated);
      await addToWatchlist(sym);
      await fetchAndAddQuote(sym);
    }
    setSearchQuery("");
    setIsSearchOpen(false);
  };

  // Remove stock from active watchlist
  const handleRemoveStock = (e: React.MouseEvent, symbol: string) => {
    e.stopPropagation();
    const updated = watchlists.map(w => {
      if (w.id === activeWatchlist.id) {
        return { ...w, symbols: w.symbols.filter(s => s !== symbol) };
      }
      return w;
    });
    setWatchlists(updated);
    removeFromWatchlist(symbol);
  };

  // Create new custom watchlist
  const handleCreateList = () => {
    if (!newListName.trim()) return;
    const newId = "wl-" + Date.now();
    const newList: CustomWatchlist = {
      id: newId,
      name: newListName.trim(),
      icon: "📋",
      symbols: []
    };
    setWatchlists([...watchlists, newList]);
    setActiveListId(newId);
    setNewListName("");
    setIsCreateListModalOpen(false);
  };

  // Delete custom watchlist
  const handleDeleteList = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (watchlists.length <= 1) return;
    const filtered = watchlists.filter(w => w.id !== id);
    setWatchlists(filtered);
    if (activeListId === id) {
      setActiveListId(filtered[0].id);
    }
  };

  // Create price alert
  const handleSaveAlert = () => {
    if (!alertModalStock || !alertTargetPrice) return;
    const priceNum = parseFloat(alertTargetPrice);
    if (isNaN(priceNum) || priceNum <= 0) return;

    const newAlert: PriceAlert = {
      id: "alert-" + Date.now(),
      symbol: alertModalStock.symbol,
      targetPrice: priceNum,
      condition: alertCondition,
      createdPrice: alertModalStock.price,
      active: true,
      createdAt: new Date().toLocaleTimeString("en-IN")
    };

    setAlerts([newAlert, ...alerts]);
    setAlertModalStock(null);
    setAlertTargetPrice("");
  };

  const handleDeleteAlert = (alertId: string) => {
    setAlerts(alerts.filter(a => a.id !== alertId));
  };

  const getStockAlert = (symbol: string) => {
    return alerts.find(a => a.symbol.toUpperCase() === symbol.toUpperCase() && a.active);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Metrics Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="accent" size="sm">Multi-Watchlist Terminal</Badge>
            <span className="text-xs text-text-muted">
              {isLiveConnected ? `NSE/BSE Live Synced • ${lastLiveUpdate}` : "Connecting..."}
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-text-primary tracking-tight">
            Professional Trading Watchlists
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Organize Indian stocks across multiple custom lists, set live price triggers, and execute 1-click orders
          </p>
        </div>

        {/* Watchlist Quick Summary Stats */}
        <div className="flex items-center gap-3 bg-bg-card border border-border-subtle p-2.5 rounded-2xl">
          <div className="text-center px-3 border-r border-border-subtle">
            <div className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Stocks</div>
            <div className="text-sm font-extrabold text-text-primary">{stats.count}</div>
          </div>
          <div className="text-center px-3 border-r border-border-subtle">
            <div className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Adv / Dec</div>
            <div className="text-sm font-extrabold flex items-center justify-center gap-1">
              <span className="text-brand-positive">{stats.gainers}</span>
              <span className="text-text-muted">/</span>
              <span className="text-brand-negative">{stats.losers}</span>
            </div>
          </div>
          <div className="text-center px-3">
            <div className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Avg Move</div>
            <div
              className={`text-sm font-extrabold ${
                stats.avgChange >= 0 ? "text-brand-positive" : "text-brand-negative"
              }`}
            >
              {stats.avgChange >= 0 ? "+" : ""}{stats.avgChange}%
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Watchlist Tabs Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
          {watchlists.map(list => {
            const isActive = list.id === activeListId;
            return (
              <div
                key={list.id}
                onClick={() => setActiveListId(list.id)}
                className={`group px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-2 select-none ${
                  isActive
                    ? "bg-brand-accent/15 text-brand-accent border border-brand-accent/40 shadow-sm"
                    : "bg-bg-card hover:bg-bg-elevated text-text-secondary border border-border-subtle"
                }`}
              >
                <span>{list.icon}</span>
                <span>{list.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? "bg-brand-accent/20 text-brand-accent" : "bg-bg-secondary text-text-muted"
                  }`}
                >
                  {list.symbols.length}
                </span>

                {/* Delete custom watchlist button if more than 1 list exists */}
                {watchlists.length > 1 && list.id !== "favorites" && (
                  <button
                    onClick={e => handleDeleteList(list.id, e)}
                    className="opacity-0 group-hover:opacity-100 hover:text-brand-negative p-0.5 transition-opacity"
                    title="Delete this watchlist"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          <button
            onClick={() => setIsCreateListModalOpen(true)}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-bg-card hover:bg-bg-elevated text-text-muted hover:text-brand-accent border border-dashed border-border-subtle transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            New List
          </button>
        </div>

        {/* View Toggle & Sorting Controls */}
        <div className="flex items-center gap-2">
          {/* Sorting Dropdown */}
          <div className="flex items-center gap-1 bg-bg-card border border-border-subtle rounded-xl px-2.5 py-1.5 text-xs text-text-secondary">
            <ArrowUpDown className="w-3.5 h-3.5 text-brand-accent" />
            <select
              value={sortOption}
              onChange={e => setSortOption(e.target.value as any)}
              className="bg-transparent text-xs font-semibold text-text-primary focus:outline-none cursor-pointer"
            >
              <option value="default" className="bg-bg-card text-text-primary">Default Order</option>
              <option value="gainers" className="bg-bg-card text-text-primary">Top Gainers %</option>
              <option value="losers" className="bg-bg-card text-text-primary">Top Losers %</option>
              <option value="volume" className="bg-bg-card text-text-primary">Highest Volume</option>
              <option value="name" className="bg-bg-card text-text-primary">Alphabetical (A-Z)</option>
            </select>
          </div>

          {/* Card vs Table View Toggle */}
          <div className="flex items-center bg-bg-card border border-border-subtle rounded-xl p-0.5">
            <button
              onClick={() => setViewMode("card")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "card" ? "bg-bg-elevated text-brand-accent shadow-sm" : "text-text-muted hover:text-text-primary"
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "table" ? "bg-bg-elevated text-brand-accent shadow-sm" : "text-text-muted hover:text-text-primary"
              }`}
              title="Dense Terminal Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Inline Quick Search & Add Stock Bar (Search 2,540+ NSE Stocks) */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-brand-accent" />
          <input
            type="text"
            placeholder={`+ Add any stock to ${activeWatchlist.name} (Search 2,540+ NSE companies like Zomato, Trent, Suzlon, HAL, Adani...)`}
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            className="w-full bg-bg-card border border-border-subtle rounded-2xl pl-10 pr-10 py-3 text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand-accent transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 text-xs text-text-muted hover:text-text-primary p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdown for Inline Stock Search */}
        {isSearchOpen && searchResults.length > 0 && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsSearchOpen(false)} />
            <div className="absolute left-0 right-0 top-full mt-2 bg-bg-card border border-border-subtle rounded-2xl shadow-2xl overflow-hidden z-20 py-2 divide-y divide-border-subtle/50 max-h-80 overflow-y-auto custom-scrollbar">
              <div className="px-4 py-2 text-[10px] font-bold text-text-muted uppercase tracking-wider bg-bg-secondary/40 flex items-center justify-between">
                <span>Select to add to {activeWatchlist.name}</span>
                <span>{searchResults.length} matches</span>
              </div>
              {searchResults.map(stock => {
                const isAlreadyIn = activeWatchlist.symbols.includes(stock.symbol.toUpperCase());
                return (
                  <div
                    key={stock.symbol}
                    onClick={() => handleAddStock(stock)}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-bg-elevated cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-text-primary">{stock.symbol}</span>
                        <span className="text-[10px] text-text-muted px-1.5 py-0.5 rounded bg-bg-secondary border border-border-subtle font-mono">
                          NSE:{stock.series || "EQ"}
                        </span>
                        {stock.alias && (
                          <span className="text-[10px] text-brand-accent bg-brand-accent/10 px-1.5 py-0.5 rounded">
                            {stock.alias}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-text-muted truncate max-w-sm">{stock.name}</p>
                    </div>

                    <div>
                      {isAlreadyIn ? (
                        <span className="text-[11px] font-semibold text-brand-positive bg-brand-positive/10 px-2.5 py-1 rounded-lg flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> In List
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-brand-accent bg-brand-accent/10 hover:bg-brand-accent/20 px-2.5 py-1 rounded-lg border border-brand-accent/30 flex items-center gap-1 transition-colors">
                          <Plus className="w-3.5 h-3.5" /> Add
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Main Watchlist Content: Empty State vs. Card Grid vs. Dense Table */}
      {sortedQuotes.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-bg-card border border-border-subtle space-y-3">
          <Bookmark className="w-10 h-10 text-brand-accent/40 mx-auto" />
          <h4 className="text-base font-bold text-text-primary">No stocks in {activeWatchlist.name}</h4>
          <p className="text-xs text-text-muted max-w-md mx-auto">
            Use the search box above to search any of the 2,540+ Indian listed equities and add them to this list.
          </p>
        </div>
      ) : viewMode === "card" ? (
        /* CARD GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedQuotes.map(stock => {
            const isPos = stock.change >= 0;
            const alert = getStockAlert(stock.symbol);
            const dayRangePct =
              stock.high > stock.low
                ? Math.min(100, Math.max(0, ((stock.price - stock.low) / (stock.high - stock.low)) * 100))
                : 50;

            return (
              <div
                key={stock.symbol}
                onClick={() => openStockModal(stock.symbol)}
                className="group p-5 rounded-3xl bg-bg-card border border-border-subtle hover:border-brand-accent/50 cursor-pointer transition-all flex flex-col justify-between space-y-3.5 hover:shadow-lg hover:shadow-black/20"
              >
                {/* Top Row: Symbol, Sector, Price Alert, Delete */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base text-text-primary group-hover:text-brand-accent transition-colors">
                        {stock.symbol}
                      </span>
                      <span className="text-[10px] text-text-muted px-1.5 py-0.5 rounded bg-bg-secondary border border-border-subtle">
                        {stock.sector}
                      </span>
                    </div>
                    <div className="text-xs text-text-muted truncate max-w-[170px] mt-0.5">
                      {stock.name}
                    </div>
                  </div>

                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    {/* Alert Trigger Button */}
                    <button
                      onClick={() => {
                        setAlertModalStock(stock);
                        setAlertTargetPrice(stock.price ? String(stock.price) : "");
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        alert
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "text-text-muted hover:text-brand-accent hover:bg-bg-secondary"
                      }`}
                      title={alert ? `Alert active at ₹${alert.targetPrice}` : "Set Price Alert"}
                    >
                      {alert ? <BellRing className="w-3.5 h-3.5 animate-bounce" /> : <Bell className="w-3.5 h-3.5" />}
                    </button>

                    {/* Delete Stock */}
                    <button
                      onClick={e => handleRemoveStock(e, stock.symbol)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-brand-negative hover:bg-brand-negative/10 transition-colors"
                      title="Remove from watchlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Price & Sparkline */}
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-extrabold text-text-primary tracking-tight">
                      ₹{stock.price > 0 ? stock.price.toFixed(2) : "..."}
                    </div>
                    <div
                      className={`text-xs font-bold flex items-center gap-0.5 mt-0.5 ${
                        isPos ? "text-brand-positive" : "text-brand-negative"
                      }`}
                    >
                      {isPos ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      {isPos ? "+" : ""}{stock.change.toFixed(2)} ({isPos ? "+" : ""}{stock.changePercent}%)
                    </div>
                  </div>
                  <div className="w-24">
                    <Sparkline data={stock.sparkline} isPositive={isPos} width={90} height={30} />
                  </div>
                </div>

                {/* Day Range Bar (Low to High) */}
                {stock.low > 0 && stock.high > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-text-muted">
                      <span>L: ₹{stock.low.toFixed(2)}</span>
                      <span className="font-semibold text-text-secondary">Day's Range</span>
                      <span>H: ₹{stock.high.toFixed(2)}</span>
                    </div>
                    <div className="w-full h-1.5 bg-bg-secondary rounded-full overflow-hidden relative">
                      <div
                        className="h-full bg-gradient-to-r from-brand-negative via-amber-400 to-brand-positive rounded-full"
                        style={{ width: "100%" }}
                      />
                      <div
                        className="absolute top-0 bottom-0 w-2 bg-white rounded-full -translate-x-1/2 shadow"
                        style={{ left: `${dayRangePct}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Bottom Quick Action: Volume & 1-Click Buy/Sell */}
                <div
                  className="pt-2.5 border-t border-border-subtle flex items-center justify-between gap-2"
                  onClick={e => e.stopPropagation()}
                >
                  <span className="text-[11px] text-text-muted font-mono truncate">
                    Vol: {stock.volume ? stock.volume.toLocaleString("en-IN") : "-"}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setSelectedStockForOrder(stock.symbol);
                        setIsPlaceOrderModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-brand-positive/10 text-brand-positive hover:bg-brand-positive/20 border border-brand-positive/30 transition-colors"
                    >
                      BUY
                    </button>
                    <button
                      onClick={() => {
                        setSelectedStockForOrder(stock.symbol);
                        setIsPlaceOrderModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-brand-negative/10 text-brand-negative hover:bg-brand-negative/20 border border-brand-negative/30 transition-colors"
                    >
                      SELL
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TERMINAL DENSE TABLE VIEW */
        <div className="rounded-3xl bg-bg-card border border-border-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg-secondary/70 border-b border-border-subtle text-text-muted uppercase text-[10px] tracking-wider select-none">
                <tr>
                  <th className="py-3 px-4 font-semibold">Instrument</th>
                  <th className="py-3 px-4 font-semibold">Price (₹)</th>
                  <th className="py-3 px-4 font-semibold">24h Change</th>
                  <th className="py-3 px-4 font-semibold">Today's Range (L - H)</th>
                  <th className="py-3 px-4 font-semibold">Volume</th>
                  <th className="py-3 px-4 font-semibold">Trend</th>
                  <th className="py-3 px-4 font-semibold text-center">Alert</th>
                  <th className="py-3 px-4 font-semibold text-right">Instant Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50">
                {sortedQuotes.map(stock => {
                  const isPos = stock.change >= 0;
                  const alert = getStockAlert(stock.symbol);
                  const dayRangePct =
                    stock.high > stock.low
                      ? Math.min(100, Math.max(0, ((stock.price - stock.low) / (stock.high - stock.low)) * 100))
                      : 50;

                  return (
                    <tr
                      key={stock.symbol}
                      onClick={() => openStockModal(stock.symbol)}
                      className="hover:bg-bg-elevated cursor-pointer transition-colors group"
                    >
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-extrabold text-sm text-text-primary group-hover:text-brand-accent transition-colors flex items-center gap-1.5">
                          {stock.symbol}
                          <span className="text-[10px] font-normal text-text-muted px-1.5 py-0.5 rounded bg-bg-secondary border border-border-subtle">
                            {stock.sector}
                          </span>
                        </div>
                        <div className="text-[11px] text-text-muted truncate max-w-xs">{stock.name}</div>
                      </td>

                      <td className="py-3 px-4 font-extrabold text-sm text-text-primary whitespace-nowrap">
                        ₹{stock.price > 0 ? stock.price.toFixed(2) : "..."}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`font-bold flex items-center gap-0.5 ${
                            isPos ? "text-brand-positive" : "text-brand-negative"
                          }`}
                        >
                          {isPos ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          {isPos ? "+" : ""}{stock.change.toFixed(2)} ({isPos ? "+" : ""}{stock.changePercent}%)
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap w-44">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-text-muted">
                            <span>₹{stock.low || stock.price}</span>
                            <span>₹{stock.high || stock.price}</span>
                          </div>
                          <div className="w-full h-1 bg-bg-secondary rounded-full overflow-hidden relative">
                            <div
                              className="h-full bg-gradient-to-r from-brand-negative to-brand-positive rounded-full"
                              style={{ width: "100%" }}
                            />
                            <div
                              className="absolute top-0 bottom-0 w-1.5 bg-white rounded-full -translate-x-1/2"
                              style={{ left: `${dayRangePct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-text-secondary font-mono text-[11px] whitespace-nowrap">
                        {stock.volume ? stock.volume.toLocaleString("en-IN") : "-"}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap w-24">
                        <Sparkline data={stock.sparkline} isPositive={isPos} width={80} height={24} />
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setAlertModalStock(stock);
                            setAlertTargetPrice(stock.price ? String(stock.price) : "");
                          }}
                          className={`p-1.5 rounded-lg transition-colors ${
                            alert
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : "text-text-muted hover:text-brand-accent hover:bg-bg-secondary"
                          }`}
                          title={alert ? `Alert: ${alert.condition} ₹${alert.targetPrice}` : "Set Alert"}
                        >
                          {alert ? <BellRing className="w-3.5 h-3.5 animate-bounce" /> : <Bell className="w-3.5 h-3.5" />}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedStockForOrder(stock.symbol);
                              setIsPlaceOrderModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-brand-positive/10 text-brand-positive hover:bg-brand-positive/20 border border-brand-positive/30 transition-colors"
                          >
                            BUY
                          </button>
                          <button
                            onClick={() => {
                              setSelectedStockForOrder(stock.symbol);
                              setIsPlaceOrderModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-brand-negative/10 text-brand-negative hover:bg-brand-negative/20 border border-brand-negative/30 transition-colors"
                          >
                            SELL
                          </button>
                          <button
                            onClick={e => handleRemoveStock(e, stock.symbol)}
                            className="p-1 rounded-lg text-text-muted hover:text-brand-negative hover:bg-brand-negative/10 transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE NEW WATCHLIST MODAL */}
      {isCreateListModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-bg-card border border-border-subtle p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-text-primary">Create New Watchlist</h3>
              <button
                onClick={() => setIsCreateListModalOpen(false)}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Watchlist Name</label>
              <input
                type="text"
                placeholder="e.g. Swing Breakouts, IT Stocks, Nifty Next 50"
                value={newListName}
                onChange={e => setNewListName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleCreateList()}
                className="w-full bg-bg-secondary border border-border-subtle rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent"
                autoFocus
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsCreateListModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleCreateList}>
                Create List
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* PRICE ALERT MODAL */}
      {alertModalStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-bg-card border border-border-subtle p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-text-primary flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-amber-400" /> Set Price Alert
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  {alertModalStock.symbol} • Current LTP: ₹{alertModalStock.price.toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => setAlertModalStock(null)}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-text-secondary">Trigger Condition</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    onClick={() => setAlertCondition("ABOVE")}
                    className={`py-2 rounded-xl text-xs font-bold transition-colors ${
                      alertCondition === "ABOVE"
                        ? "bg-brand-positive/20 text-brand-positive border border-brand-positive/40"
                        : "bg-bg-secondary text-text-muted border border-border-subtle"
                    }`}
                  >
                    Crosses Above (≥)
                  </button>
                  <button
                    onClick={() => setAlertCondition("BELOW")}
                    className={`py-2 rounded-xl text-xs font-bold transition-colors ${
                      alertCondition === "BELOW"
                        ? "bg-brand-negative/20 text-brand-negative border border-brand-negative/40"
                        : "bg-bg-secondary text-text-muted border border-border-subtle"
                    }`}
                  >
                    Falls Below (≤)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-secondary">Target Price (₹)</label>
                <input
                  type="number"
                  step="0.05"
                  value={alertTargetPrice}
                  onChange={e => setAlertTargetPrice(e.target.value)}
                  placeholder="e.g. 750.00"
                  className="w-full bg-bg-secondary border border-border-subtle rounded-xl px-3 py-2 text-xs font-mono text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent mt-1"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setAlertModalStock(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveAlert}>
                Set Alert
              </Button>
            </div>
          </div>
        </div>
      )}

      <StockDetailModal />
    </div>
  );
};
