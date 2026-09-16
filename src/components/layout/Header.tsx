import React, { useState, useEffect } from "react";
import {
  Search,
  Sun,
  Moon,
  Plus,
  TrendingUp,
  RotateCw,
  Sparkles,
  Download,
  Flame,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  Lock,
  Layers,
  Compass,
  Zap
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useMarketData } from "../../context/MarketDataContext";
import { useApp } from "../../context/AppContext";
import { BrandLogo } from "../common/BrandLogo";

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const {
    quotes,
    openStockModal,
    isLiveConnected,
    lastLiveUpdate,
    refreshData,
    isLoading,
    searchAllIndianStocks
  } = useMarketData();
  const {
    activeTab,
    setActiveTab,
    setIsNewTradeModalOpen,
    profile,
    journal,
    isSidebarCollapsed,
    toggleSidebar,
    toggleMobileSidebar,
    isTiltLocked,
    tiltLockState,
    setIsTiltLockModalOpen,
    setIsScalpSniperModalOpen
  } = useApp();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  const handleDownloadReport = () => {
    if (journal.length === 0) {
      alert("No trades recorded yet to export.");
      return;
    }
    const headers = ["ID", "Date", "Symbol", "Direction", "Qty", "Entry", "Exit", "P&L", "Status", "Setup"];
    const rows = journal.map(t => [
      t.id,
      t.date,
      t.stockSymbol,
      t.direction,
      t.quantity,
      t.entryPrice,
      t.exitPrice || 0,
      t.netPnL,
      t.status,
      t.setup
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tradewise_journal_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    Array<{ symbol: string; name: string; series?: string; price?: number; change?: number; changePercent?: number }>
  >([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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

  const navPills = [
    { id: "dashboard", label: "Dashboard" },
    { id: "derivatives", label: "F&O Options", icon: <Layers className="w-3.5 h-3.5 text-purple-400" /> },
    { id: "fii-dii", label: "FII/DII Flow", icon: <Compass className="w-3.5 h-3.5 text-cyan-400" /> },
    { id: "tradepulse", label: "NIFTY 50", icon: <Flame className="w-3.5 h-3.5" /> },
    { id: "markets", label: "Markets" },
    { id: "watchlist", label: "Watchlist" },
    { id: "journal", label: "Journal" },
    { id: "analytics", label: "Analytics" },
    { id: "planner", label: "Planner" }
  ];

  return (
    <header className="sticky top-0 z-20 w-full bg-bg-card/90 dark:bg-dark-950/90 backdrop-blur-xl border-b border-border-subtle px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 shadow-sm">
      {/* Left: Mobile Drawer Trigger, Desktop Sidebar Collapse Toggle, and Pill Search Bar */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-xs sm:max-w-sm">
        {/* Mobile Hamburger Drawer Button */}
        <button
          onClick={toggleMobileSidebar}
          className="md:hidden flex items-center justify-center w-8 h-8 rounded-xl bg-bg-secondary text-text-secondary hover:text-brand-accent border border-border-subtle flex-shrink-0 transition-colors hover:bg-bg-elevated"
          title="Open Menu"
          aria-label="Open menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Mobile Brand Emblem */}
        <div className="md:hidden flex-shrink-0">
          <BrandLogo
            size="xs"
            showText={false}
            onClick={() => setActiveTab("dashboard")}
          />
        </div>

        {/* Desktop Sidebar Toggle Button */}
        <button
          onClick={toggleSidebar}
          className={`hidden md:flex items-center justify-center w-8 h-8 rounded-xl border transition-all flex-shrink-0 ${
            isSidebarCollapsed
              ? "bg-brand-accent/15 text-brand-positive border-brand-accent/30 hover:bg-brand-accent/25 shadow-lime-sm"
              : "bg-bg-secondary text-text-secondary hover:text-brand-accent border-border-subtle hover:bg-bg-elevated"
          }`}
          title={isSidebarCollapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
          aria-label="Toggle sidebar"
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>

        {/* Pill Search Input */}
        <div className="relative w-full">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-3.5 h-3.5 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search 2,540+ NSE/BSE companies..."
              className="w-full bg-bg-secondary border border-border-subtle hover:border-brand-accent/40 rounded-full pl-9 pr-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand-accent focus:border-brand-accent transition-all shadow-sm"
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
                <div className="px-3.5 py-1.5 text-[10px] font-bold text-text-muted uppercase tracking-wider bg-bg-secondary flex items-center justify-between">
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
                        <span className="text-[10px] text-text-muted px-1.5 py-0.5 rounded bg-bg-secondary border border-border-subtle font-mono">
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
                            className={`text-[10px] font-bold ${
                              (stock.change || 0) >= 0 ? "text-brand-positive" : "text-brand-negative"
                            }`}
                          >
                            {(stock.change || 0) >= 0 ? "+" : ""}{stock.change?.toFixed(2)} ({stock.changePercent}%)
                          </div>
                        </>
                      ) : (
                        <span className="text-[10px] font-semibold text-brand-accent bg-brand-accent/10 px-2 py-0.5 rounded-full border border-brand-accent/20">
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
      </div>

      {/* Center: Signature Floating Pill Navigation Dock (Shown on 2xl screens to avoid clipping controls on laptops) */}
      <nav className="hidden 2xl:flex items-center gap-1 bg-bg-secondary border border-border-subtle p-1 rounded-full shadow-sm">
        {navPills.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                isActive
                  ? "bg-brand-accent text-dark-950 shadow-md shadow-lime-400/25 scale-[1.02]"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
              }`}
            >
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right Controls: AI Assistant, Scalp Sniper, Tilt Lock, Live Status, Theme & Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        {/* "Download Report" Pill Button */}
        <button
          onClick={handleDownloadReport}
          className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bg-secondary hover:bg-bg-elevated text-text-secondary hover:text-text-primary border border-border-subtle text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm flex-shrink-0"
          title="Download trade journal data as CSV"
        >
          <Download className="w-3.5 h-3.5 text-text-muted" />
          <span>Report</span>
        </button>

        {/* "10-30m Scalp Sniper" Pill Button (High Contrast in Light Mode) */}
        <button
          onClick={() => setIsScalpSniperModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300 dark:bg-gradient-to-r dark:from-amber-500/20 dark:to-yellow-500/20 dark:hover:from-amber-500/30 dark:hover:to-yellow-500/30 dark:text-amber-300 dark:border-amber-500/40 font-black text-xs border shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] flex-shrink-0"
          title="10-30 Min Scalp Sniper (₹1L Capital Blueprint & Asymmetric 1:2 R:R)"
        >
          <Zap className="w-3.5 h-3.5 fill-current text-amber-700 dark:text-amber-400" />
          <span className="hidden md:inline">10-30m Sniper</span>
          <span className="md:hidden">Sniper</span>
        </button>

        {/* "AI Assistant" Pill Button */}
        <button
          onClick={() => setActiveTab("tradepulse")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-accent hover:bg-brand-accentHover text-dark-950 font-black text-xs shadow-md shadow-lime-400/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex-shrink-0"
          title="Open AI Decision & NIFTY 50 Analysis Platform"
        >
          <Sparkles className="w-3.5 h-3.5 fill-dark-950" />
          <span className="hidden sm:inline">AI Assistant</span>
        </button>

        {/* Prop-Desk Tilt Lock Indicator & Trigger */}
        {isTiltLocked ? (
          <button
            onClick={() => setIsTiltLockModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-400 text-xs font-black transition-all animate-pulse shadow-md shadow-rose-500/10 cursor-pointer"
            title="Trading terminal locked for discipline cooldown. Click to view timer or pledge override."
          >
            <Lock className="w-3.5 h-3.5" />
            <span>
              Tilt Lock ({Math.floor(tiltLockState.remainingSeconds / 60)}m {tiltLockState.remainingSeconds % 60}s)
            </span>
          </button>
        ) : (
          <button
            onClick={() => setIsTiltLockModalOpen(true)}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bg-secondary hover:bg-bg-elevated text-text-secondary hover:text-rose-400 border border-border-subtle hover:border-rose-500/30 text-xs font-bold transition-all shadow-sm cursor-pointer"
            title="Open Prop-Desk Tilt Lock & Cooldown Shield"
          >
            <Lock className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden xl:inline">Tilt Lock</span>
          </button>
        )}

        {/* Live Market Connected Badge */}
        <div
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-bold select-none ${
            isLiveConnected
              ? "bg-emerald-500/10 text-emerald-700 dark:text-brand-positive border-emerald-500/30"
              : "bg-bg-secondary text-text-muted border-border-subtle"
          }`}
          title={lastLiveUpdate ? `Live prices synced with NSE at ${lastLiveUpdate}` : "Connecting to NSE..."}
        >
          <span className={`w-2 h-2 rounded-full ${isLiveConnected ? "bg-brand-positive animate-pulse" : "bg-text-muted"}`} />
          <span className="text-[11px]">{isLiveConnected ? "Live NSE" : "Connecting..."}</span>
        </div>

        {/* Manual Refresh Button */}
        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing || isLoading}
          className="p-2 rounded-full bg-bg-secondary border border-border-subtle text-text-secondary hover:text-brand-accent hover:bg-bg-elevated transition-colors disabled:opacity-50 shadow-sm"
          title="Refresh live market quotes"
          aria-label="Refresh live quotes"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-brand-accent" : ""}`} />
        </button>

        {/* Theme Toggle (High-Contrast & Always Distinct) */}
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer flex-shrink-0 ${
            theme === "dark"
              ? "bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 border-amber-500/50 shadow-amber-500/20"
              : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-300 shadow-indigo-500/15"
          }`}
          aria-label="Toggle theme"
          title={theme === "dark" ? "Dark Mode is Active • Click to switch to Light Mode" : "Light Mode is Active • Click to switch to Dark Mode"}
        >
          {theme === "dark" ? (
            <>
              <Sun className="w-4 h-4 text-amber-400 fill-amber-400/80 animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-wider hidden sm:inline">Dark</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-600 fill-indigo-600/80" />
              <span className="text-[11px] font-black uppercase tracking-wider hidden sm:inline">Light</span>
            </>
          )}
        </button>

        {/* Log Trade CTA */}
        <button
          onClick={() => setIsNewTradeModalOpen(true)}
          className="hidden sm:flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-dark-950 hover:bg-dark-900 text-white dark:bg-white/10 dark:hover:bg-white/15 dark:text-white border border-transparent dark:border-white/20 text-xs font-bold transition-all active:scale-[0.98] shadow-sm flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5 text-brand-accent stroke-[3]" />
          <span>Log Trade</span>
        </button>

        {/* User Profile Button (Visible on ALL devices: Mobile, Tablet, Desktop) */}
        <div
          onClick={() => setActiveTab("settings")}
          className="cursor-pointer flex items-center gap-2 pl-1 sm:pl-1.5 pr-2 sm:pr-3 py-1 rounded-full bg-bg-secondary border border-border-subtle hover:border-brand-accent/60 hover:bg-bg-elevated transition-all hover:scale-[1.03] active:scale-[0.97] shadow-sm flex-shrink-0"
          title="Trader Profile & Settings"
        >
          <div className="relative flex-shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-400 to-lime-300 text-dark-950 font-black text-xs flex items-center justify-center shadow-xs border border-amber-500/40">
              {profile.name ? profile.name.slice(0, 2).toUpperCase() : "TR"}
            </div>
            {/* Online Green Status Dot */}
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-bg-primary" />
          </div>
          <div className="text-left leading-none hidden md:block">
            <div className="text-[11px] font-black text-text-primary truncate max-w-[90px]">
              {profile.name || "Trader"}
            </div>
            <div className="text-[9px] text-brand-positive font-mono font-bold">Pro Account</div>
          </div>
        </div>
      </div>
    </header>
  );
};