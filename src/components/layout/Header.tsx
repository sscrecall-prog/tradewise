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
  Menu
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useMarketData } from "../../context/MarketDataContext";
import { useApp } from "../../context/AppContext";

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
    toggleMobileSidebar
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

      {/* Center: Signature Floating Pill Navigation Dock */}
      <nav className="hidden xl:flex items-center gap-1 bg-bg-secondary border border-border-subtle p-1 rounded-full shadow-sm">
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

      {/* Right Controls: AI Assistant, Download Report, Live Status, CTAs */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* "Download Report" Pill Button */}
        <button
          onClick={handleDownloadReport}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bg-secondary hover:bg-bg-elevated text-text-secondary hover:text-text-primary border border-border-subtle text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm"
          title="Download trade journal data as CSV"
        >
          <Download className="w-3.5 h-3.5 text-text-muted" />
          <span className="hidden lg:inline">Download Report</span>
        </button>

        {/* "AI Assistant" Pill Button */}
        <button
          onClick={() => setActiveTab("tradepulse")}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-accent hover:bg-brand-accentHover text-dark-950 font-black text-xs shadow-md shadow-lime-400/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          title="Open AI Decision & NIFTY 50 Analysis Platform"
        >
          <Sparkles className="w-3.5 h-3.5 fill-dark-950" />
          <span>AI Assistant</span>
        </button>

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

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-bg-secondary border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors shadow-sm"
          aria-label="Toggle theme"
          title={theme === "dark" ? "Switch to Light mode" : "Switch to Dark mode"}
        >
          {theme === "dark" ? <Sun className="w-3.5 h-3.5 text-brand-accent" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
        </button>

        {/* Log Trade CTA */}
        <button
          onClick={() => setIsNewTradeModalOpen(true)}
          className="hidden sm:flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-dark-950 hover:bg-dark-900 text-white dark:bg-white/10 dark:hover:bg-white/15 dark:text-white border border-transparent dark:border-white/20 text-xs font-bold transition-all active:scale-[0.98] shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 text-brand-accent stroke-[3]" />
          <span>Log Trade</span>
        </button>

        {/* User Profile Pill */}
        <div
          onClick={() => setActiveTab("settings")}
          className="cursor-pointer hidden lg:flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-bg-secondary border border-border-subtle hover:border-brand-accent/40 transition-colors shadow-sm"
          title="Trader Profile & Settings"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-brand-accent to-emerald-400 text-dark-950 font-black text-[10px] flex items-center justify-center">
            {profile.name ? profile.name.slice(0, 2).toUpperCase() : "TR"}
          </div>
          <div className="text-left leading-none">
            <div className="text-[11px] font-bold text-text-primary truncate max-w-[80px]">
              {profile.name || "Trader"}
            </div>
            <div className="text-[9px] text-brand-positive font-mono font-bold">Pro Plan</div>
          </div>
        </div>
      </div>
    </header>
  );
};