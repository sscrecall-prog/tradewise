import React, { useState, useMemo } from "react";
import { useMarketData } from "../context/MarketDataContext";
import { useApp } from "../context/AppContext";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";
import { Sparkline } from "../components/charts/Sparkline";
import { StockDetailModal } from "../components/modals/StockDetailModal";
import { ListedCompany } from "../types";
import {
  TrendingUp,
  TrendingDown,
  Search,
  Bookmark,
  BookmarkCheck,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Layers,
  CheckCircle2,
  ExternalLink
} from "lucide-react";

export const MarketsPage: React.FC = () => {
  const { quotes, indices, openStockModal, searchAllIndianStocks, isLiveConnected, lastLiveUpdate } = useMarketData();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist, setIsPlaceOrderModalOpen, setSelectedStockForOrder, setActiveTab } = useApp();

  const [search, setSearch] = useState("");
  const [selectedSector, setSelectedSector] = useState("ALL");

  const sectors = ["ALL", "Banking", "Information Tech", "Automobile", "Energy & Oil", "Defence & Aero", "Retail & Fashion", "Finance & NBFC"];

  // Search across all 2,540+ NSE companies
  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    return searchAllIndianStocks(search);
  }, [search, searchAllIndianStocks]);

  // Default filtered prominent quotes when search is empty
  const defaultFilteredQuotes = useMemo(() => {
    if (selectedSector === "ALL") return quotes;
    return quotes.filter(q => q.sector.toLowerCase().includes(selectedSector.toLowerCase()));
  }, [quotes, selectedSector]);

  const handleToggleWatchlist = (e: React.MouseEvent, symbol: string) => {
    e.stopPropagation();
    if (isInWatchlist(symbol)) removeFromWatchlist(symbol);
    else addToWatchlist(symbol);
  };

  const handleOrder = (e: React.MouseEvent, symbol: string) => {
    e.stopPropagation();
    setSelectedStockForOrder(symbol);
    setIsPlaceOrderModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="accent" size="sm">NSE & BSE Master Terminal</Badge>
            <span className="text-xs text-text-muted">
              {isLiveConnected ? `Live Feed Active • ${lastLiveUpdate}` : "Connecting to Market..."}
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-text-primary tracking-tight">
            Indian Stock & Index Markets
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Full official database: Search all 2,540+ NSE listed equities, indices, and sectoral leaders
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-bg-card border border-border-subtle text-xs font-semibold text-text-secondary">
            <strong>2,540</strong> Listed Equities Indexed
          </span>
        </div>
      </div>

      {/* TradePulse Pro Engine Launch Banner */}
      <div 
        onClick={() => setActiveTab("tradepulse")}
        className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-bg-card to-cyan-950/30 border border-emerald-500/30 hover:border-emerald-500/60 cursor-pointer transition-all shadow-lg group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center ring-1 ring-emerald-500/40 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                NIFTY TradePulse Pro Engine
              </h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                5-STAR CONFIRMATION
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Daily CSV Bhavcopy Analysis, Setup Grades (A+, A, B), Floor & Camarilla Pivots, and Top 10 Gainers & Losers Arena
            </p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setActiveTab("tradepulse");
          }}
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-dark-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20 self-start sm:self-auto whitespace-nowrap"
        >
          <span>Launch TradePulse Pro</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Indices Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {indices.map(idx => (
          <div
            key={idx.symbol}
            onClick={() => openStockModal(idx.symbol)}
            className="p-4 rounded-2xl bg-bg-card border border-border-subtle hover:border-brand-accent/50 cursor-pointer transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-secondary">{idx.name}</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  idx.isPositive ? "bg-brand-positive/10 text-brand-positive" : "bg-brand-negative/10 text-brand-negative"
                }`}
              >
                {idx.isPositive ? "+" : ""}{idx.changePercent}%
              </span>
            </div>
            <div className="mt-1">
              <div className="text-base font-extrabold text-text-primary">
                ₹{idx.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
              <div className={`text-[11px] font-semibold ${idx.isPositive ? "text-brand-positive" : "text-brand-negative"}`}>
                {idx.isPositive ? "+" : ""}{idx.change.toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Comprehensive Search & Category Bar */}
      <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle space-y-3">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-brand-accent" />
          <input
            type="text"
            placeholder="Search ANY Indian Company (e.g. Zomato, Trent, Suzlon, HAL, Adani, Tata Power, IRFC, Paytm, Dixon...)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-bg-secondary border border-border-subtle rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm font-medium text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand-accent transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-2.5 text-xs text-text-muted hover:text-text-primary p-1"
            >
              Clear
            </button>
          )}
        </div>

        {/* Sector Tabs (Visible when search is empty) */}
        {!search.trim() && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            {sectors.map(sec => (
              <button
                key={sec}
                onClick={() => setSelectedSector(sec)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedSector === sec
                    ? "bg-bg-elevated text-brand-accent border border-brand-accent/40 shadow-sm"
                    : "bg-bg-secondary text-text-muted hover:text-text-primary border border-border-subtle"
                }`}
              >
                {sec}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* If User Is Searching: Display Universal Indian Stock Search Results */}
      {search.trim() ? (
        <div className="rounded-3xl bg-bg-card border border-border-subtle overflow-hidden space-y-2">
          <div className="px-5 py-3.5 border-b border-border-subtle flex items-center justify-between bg-bg-secondary/40">
            <span className="text-xs font-bold text-text-primary flex items-center gap-2">
              <Search className="w-4 h-4 text-brand-accent" />
              Search Results ({searchResults.length} matches from 2,540+ listed Indian companies)
            </span>
            <span className="text-[11px] text-text-muted">Click any row to open live chart & quote</span>
          </div>

          {searchResults.length === 0 ? (
            <div className="text-center py-12 text-xs text-text-muted">
              No Indian companies found matching "{search}". Try searching by ticker (e.g. TRENT, SUZLON, HAL) or registered name.
            </div>
          ) : (
            <div className="divide-y divide-border-subtle/50">
              {searchResults.map(company => {
                const liveQuote = quotes.find(q => q.symbol.toUpperCase() === company.symbol.toUpperCase());
                const inWatch = isInWatchlist(company.symbol);

                return (
                  <div
                    key={company.symbol}
                    onClick={() => openStockModal(company.symbol)}
                    className="p-4 hover:bg-bg-elevated cursor-pointer transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <span className="font-extrabold text-sm text-text-primary">{company.symbol}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-secondary text-text-muted border border-border-subtle font-mono">
                          NSE:{company.series || "EQ"}
                        </span>
                        {company.alias && (
                          <span className="text-[10px] text-brand-accent bg-brand-accent/10 px-1.5 py-0.5 rounded">
                            {company.alias}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-text-muted truncate mt-0.5 max-w-lg">
                        {company.name}
                      </div>
                    </div>

                    {liveQuote ? (
                      <div className="text-right flex items-center gap-4">
                        <div>
                          <div className="text-sm font-extrabold text-text-primary">
                            ₹{liveQuote.price.toFixed(2)}
                          </div>
                          <div
                            className={`text-[11px] font-bold ${
                              liveQuote.change >= 0 ? "text-brand-positive" : "text-brand-negative"
                            }`}
                          >
                            {liveQuote.change >= 0 ? "+" : ""}
                            {liveQuote.change.toFixed(2)} ({liveQuote.changePercent}%)
                          </div>
                        </div>

                        <div className="hidden sm:block w-24">
                          <Sparkline
                            data={liveQuote.sparkline}
                            isPositive={liveQuote.change >= 0}
                            width={90}
                            height={26}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-right">
                        <span className="text-xs font-semibold text-brand-accent bg-brand-accent/10 px-2.5 py-1 rounded-lg border border-brand-accent/20 flex items-center gap-1">
                          View Live Chart <ExternalLink className="w-3 h-3" />
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={e => handleToggleWatchlist(e, company.symbol)}
                        className="p-1.5 rounded-lg bg-bg-secondary hover:bg-bg-elevated text-text-secondary hover:text-brand-accent transition-colors"
                        title={inWatch ? "In Watchlist" : "Add to Watchlist"}
                      >
                        {inWatch ? <BookmarkCheck className="w-4 h-4 text-brand-accent" /> : <Bookmark className="w-4 h-4" />}
                      </button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={e => handleOrder(e, company.symbol)}
                      >
                        Order
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Default Table: Active Benchmark & High Volume Indian Equities */
        <div className="rounded-3xl bg-bg-card border border-border-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg-secondary/70 border-b border-border-subtle text-text-muted uppercase text-[10px] tracking-wider select-none">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Stock</th>
                  <th className="py-3.5 px-4 font-semibold">Price (₹)</th>
                  <th className="py-3.5 px-4 font-semibold">24h Change</th>
                  <th className="py-3.5 px-4 font-semibold">Trend (24h)</th>
                  <th className="py-3.5 px-4 font-semibold">52W Range</th>
                  <th className="py-3.5 px-4 font-semibold">Volume</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50">
                {defaultFilteredQuotes.map(stock => {
                  const isPos = stock.change >= 0;
                  const inWatch = isInWatchlist(stock.symbol);
                  return (
                    <tr
                      key={stock.symbol}
                      onClick={() => openStockModal(stock.symbol)}
                      className="hover:bg-bg-elevated cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-text-primary text-sm flex items-center gap-2">
                          {stock.symbol}
                          <span className="text-[10px] font-normal text-text-muted px-1.5 py-0.5 rounded bg-bg-secondary border border-border-subtle">
                            {stock.sector}
                          </span>
                        </div>
                        <div className="text-[11px] text-text-muted">{stock.name}</div>
                      </td>

                      <td className="py-3 px-4 font-extrabold text-sm text-text-primary whitespace-nowrap">
                        ₹{stock.price.toFixed(2)}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`font-bold flex items-center gap-0.5 ${isPos ? "text-brand-positive" : "text-brand-negative"}`}>
                          {isPos ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          {isPos ? "+" : ""}{stock.change.toFixed(2)} ({isPos ? "+" : ""}{stock.changePercent}%)
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap w-28">
                        <Sparkline data={stock.sparkline} isPositive={isPos} width={100} height={28} />
                      </td>

                      <td className="py-3 px-4 text-text-muted text-[11px] whitespace-nowrap">
                        <div>L: ₹{stock.low52W}</div>
                        <div>H: ₹{stock.high52W}</div>
                      </td>

                      <td className="py-3 px-4 text-text-secondary font-mono text-[11px] whitespace-nowrap">
                        {stock.volume.toLocaleString("en-IN")}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={e => handleToggleWatchlist(e, stock.symbol)}
                            className="p-1.5 rounded-lg bg-bg-secondary hover:bg-bg-elevated text-text-secondary hover:text-brand-accent transition-colors"
                            title={inWatch ? "In Watchlist" : "Add to Watchlist"}
                          >
                            {inWatch ? <BookmarkCheck className="w-4 h-4 text-brand-accent" /> : <Bookmark className="w-4 h-4" />}
                          </button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={e => handleOrder(e, stock.symbol)}
                          >
                            Order
                          </Button>
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

      <StockDetailModal />
    </div>
  );
};
