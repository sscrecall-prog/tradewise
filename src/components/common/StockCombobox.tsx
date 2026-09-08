import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useMarketData } from '../../context/MarketDataContext';
import { useApp } from '../../context/AppContext';
import { PaperTradeSyncService, PaperTradeSyncData } from '../../services/PaperTradeSyncService';
import { ListedCompany } from '../../types';
import { Search, ChevronDown, Check, Sparkles, TrendingUp, X, Zap } from 'lucide-react';

interface StockComboboxProps {
  value: string;
  onChange: (symbol: string, companyName: string, lotSize?: number) => void;
  segment?: 'OPTIONS' | 'EQUITY_MIS' | 'EQUITY_CNC' | 'FUTURES';
  placeholder?: string;
  className?: string;
}

const INDEX_OPTIONS = [
  { symbol: 'NIFTY', name: 'NIFTY 50 Index', lotSize: 25, isIndex: true },
  { symbol: 'BANKNIFTY', name: 'BANK NIFTY Index', lotSize: 15, isIndex: true },
  { symbol: 'FINNIFTY', name: 'Nifty Financial Services', lotSize: 25, isIndex: true },
  { symbol: 'MIDCPNIFTY', name: 'Nifty Midcap Select', lotSize: 50, isIndex: true },
  { symbol: 'SENSEX', name: 'BSE SENSEX Index', lotSize: 10, isIndex: true },
  { symbol: 'BANKEX', name: 'BSE Bankex Index', lotSize: 15, isIndex: true }
];

export const StockCombobox: React.FC<StockComboboxProps> = ({
  value,
  onChange,
  segment = 'OPTIONS',
  placeholder = 'Search 2,540+ companies or indices...',
  className = ''
}) => {
  const { quotes, searchAllIndianStocks, fetchAndAddQuote } = useMarketData();
  const { closedPaperTrades, paperPositions, paperOrders } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'PAPER_TRADES' | 'INDICES' | 'NIFTY50'>('ALL');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  // Compute paper trades available for auto-fill
  const todayPaperTrades = useMemo(() => {
    return PaperTradeSyncService.getTodayPaperTrades({
      closedPaperTrades,
      paperPositions,
      paperOrders,
      liveQuotes: quotes
    });
  }, [closedPaperTrades, paperPositions, paperOrders, quotes]);

  const paperTradeMap = useMemo(() => {
    const map = new Map<string, PaperTradeSyncData>();
    for (const pt of todayPaperTrades) {
      map.set(pt.stockSymbol.toUpperCase(), pt);
    }
    return map;
  }, [todayPaperTrades]);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter items based on activeCategory and searchQuery
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toUpperCase();

    // If searching, search across all 2,540+ companies + matching indices
    if (query) {
      const matchedIndices = INDEX_OPTIONS.filter(
        idx => idx.symbol.includes(query) || idx.name.toUpperCase().includes(query)
      );

      const matchedStocks = searchAllIndianStocks(query);

      return [
        ...matchedIndices.map(idx => ({
          symbol: idx.symbol,
          name: idx.name,
          series: 'INDEX',
          isIndex: true,
          lotSize: idx.lotSize,
          paperTrade: paperTradeMap.get(idx.symbol.toUpperCase())
        })),
        ...matchedStocks.map(stock => ({
          symbol: stock.symbol,
          name: stock.name,
          series: stock.series || 'EQ',
          isIndex: false,
          lotSize: undefined,
          paperTrade: paperTradeMap.get(stock.symbol.toUpperCase())
        }))
      ].slice(0, 60);
    }

    // Filter by category: PAPER_TRADES
    if (activeCategory === 'PAPER_TRADES') {
      return todayPaperTrades.map(pt => ({
        symbol: pt.stockSymbol,
        name: pt.stockName,
        series: pt.segment === 'EQUITY_CNC' ? 'CNC' : 'MIS',
        isIndex: false,
        lotSize: undefined,
        paperTrade: pt
      }));
    }

    // Default view when query is empty: filter by category
    if (activeCategory === 'INDICES') {
      return INDEX_OPTIONS.map(idx => ({
        symbol: idx.symbol,
        name: idx.name,
        series: 'INDEX',
        isIndex: true,
        lotSize: idx.lotSize,
        paperTrade: paperTradeMap.get(idx.symbol.toUpperCase())
      }));
    }

    if (activeCategory === 'NIFTY50') {
      // Return top active quotes from NIFTY 50
      return quotes.slice(0, 50).map(q => ({
        symbol: q.symbol,
        name: q.name,
        series: 'EQ',
        isIndex: false,
        lotSize: undefined,
        paperTrade: paperTradeMap.get(q.symbol.toUpperCase())
      }));
    }

    // Default 'ALL': Show Paper Trades on top, then Indices, then prominent NIFTY 50
    const paperList = todayPaperTrades.map(pt => ({
      symbol: pt.stockSymbol,
      name: pt.stockName,
      series: pt.segment === 'EQUITY_CNC' ? 'CNC' : 'MIS',
      isIndex: false,
      lotSize: undefined,
      paperTrade: pt
    }));

    const indicesList = INDEX_OPTIONS.map(idx => ({
      symbol: idx.symbol,
      name: idx.name,
      series: 'INDEX',
      isIndex: true,
      lotSize: idx.lotSize,
      paperTrade: paperTradeMap.get(idx.symbol.toUpperCase())
    }));

    const stocksList = quotes.slice(0, 30).map(q => ({
      symbol: q.symbol,
      name: q.name,
      series: 'EQ',
      isIndex: false,
      lotSize: undefined,
      paperTrade: paperTradeMap.get(q.symbol.toUpperCase())
    }));

    const seen = new Set<string>();
    const combined: any[] = [];
    for (const item of [...paperList, ...indicesList, ...stocksList]) {
      if (!seen.has(item.symbol.toUpperCase())) {
        combined.push(item);
        seen.add(item.symbol.toUpperCase());
      }
    }

    return combined;
  }, [searchQuery, activeCategory, quotes, searchAllIndianStocks, todayPaperTrades, paperTradeMap]);

  const handleSelect = (sym: string, compName: string, lot?: number) => {
    onChange(sym, compName, lot);
    fetchAndAddQuote(sym); // Background sync quote
    setIsOpen(false);
    setSearchQuery('');
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev + 1 < filteredItems.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev - 1 >= 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[highlightedIndex]) {
        const item = filteredItems[highlightedIndex];
        handleSelect(item.symbol, item.name, item.lotSize);
      } else if (searchQuery.trim()) {
        const customSym = searchQuery.trim().toUpperCase();
        handleSelect(customSym, customSym);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Selected Box / Input Trigger */}
      <div
        onClick={() => {
          setIsOpen(prev => !prev);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className="w-full bg-bg-secondary border border-border-subtle hover:border-brand-accent/50 rounded-xl px-3 py-2 flex items-center justify-between cursor-pointer transition-colors shadow-sm focus-within:ring-1 focus-within:ring-brand-accent"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0 pr-1">
          <span className="text-xs font-black text-text-primary tracking-wide truncate">
            {value || 'Select Underlying'}
          </span>
          {INDEX_OPTIONS.some(i => i.symbol === value) ? (
            <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-400 text-[10px] font-black uppercase">
              Index
            </span>
          ) : (
            <span className="px-1.5 py-0.2 rounded bg-bg-elevated border border-border-subtle text-text-muted text-[10px] font-mono">
              NSE
            </span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-text-muted transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180 text-brand-accent' : ''
          }`}
        />
      </div>

      {/* Floating Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-bg-card border border-border-subtle rounded-2xl shadow-2xl overflow-hidden animate-fadeIn flex flex-col max-h-96 min-w-[320px] sm:min-w-[380px]">
          {/* Search Input Bar */}
          <div className="p-2.5 border-b border-border-subtle bg-bg-secondary flex items-center gap-2">
            <Search className="w-4 h-4 text-text-muted flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setHighlightedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full bg-transparent text-xs font-semibold text-text-primary placeholder:text-text-muted focus:outline-none"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 rounded-lg hover:bg-bg-elevated text-text-muted hover:text-text-primary"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Pills (When not actively typing search) */}
          {!searchQuery && (
            <div className="flex items-center gap-1 px-3 py-2 bg-bg-secondary/60 border-b border-border-subtle overflow-x-auto text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setActiveCategory('ALL')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  activeCategory === 'ALL'
                    ? 'bg-brand-accent text-dark-950 font-black'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                }`}
              >
                All (2,540+)
              </button>
              {todayPaperTrades.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveCategory('PAPER_TRADES')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeCategory === 'PAPER_TRADES'
                      ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40 font-black'
                      : 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
                  }`}
                >
                  <Zap className="w-3 h-3 text-amber-400" />
                  Paper Traded ({todayPaperTrades.length})
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveCategory('INDICES')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  activeCategory === 'INDICES'
                    ? 'bg-purple-500/20 text-purple-400 font-black'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                }`}
              >
                Indices (F&O)
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('NIFTY50')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  activeCategory === 'NIFTY50'
                    ? 'bg-emerald-500/20 text-emerald-400 font-black'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                }`}
              >
                NIFTY 50 Leaders
              </button>
            </div>
          )}

          {/* Quick info strip */}
          <div className="px-3 py-1 bg-bg-secondary/40 border-b border-border-subtle/50 text-[10px] text-text-muted flex items-center justify-between">
            <span>
              {searchQuery
                ? `Showing results for "${searchQuery}"`
                : `${activeCategory === 'PAPER_TRADES' ? "Today's Executed & Open Paper Trades" : activeCategory === 'INDICES' ? 'Indian Index Derivatives' : '2,540+ NSE & BSE Equities Available'}`}
            </span>
            <span>{filteredItems.length} matches</span>
          </div>

          {/* Search Results List */}
          <div ref={listRef} className="overflow-y-auto max-h-64 divide-y divide-border-subtle/50 custom-scrollbar">
            {filteredItems.map((item, idx) => {
              const isSelected = value.toUpperCase() === item.symbol.toUpperCase();
              const isHighlighted = highlightedIndex === idx;
              const quote = quotes.find(q => q.symbol.toUpperCase() === item.symbol.toUpperCase());

              return (
                <div
                  key={`${item.symbol}-${idx}`}
                  onClick={() => handleSelect(item.symbol, item.name, item.lotSize)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`px-3.5 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-brand-accent/15 border-l-2 border-brand-accent'
                      : isHighlighted
                      ? 'bg-bg-elevated'
                      : 'hover:bg-bg-elevated/60'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-black ${isSelected ? 'text-brand-positive' : 'text-text-primary'}`}>
                        {item.symbol}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          item.isIndex
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-bg-secondary border border-border-subtle text-text-muted'
                        }`}
                      >
                        {item.series || 'EQ'}
                      </span>
                      {item.lotSize && (
                        <span className="text-[10px] text-text-muted font-semibold">
                          (Lot: {item.lotSize})
                        </span>
                      )}
                      {item.paperTrade && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <Zap className="w-2.5 h-2.5 text-amber-400" />
                          Traded: {item.paperTrade.quantity} Qty @ ₹{item.paperTrade.entryPrice}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-text-muted truncate mt-0.5">{item.name}</p>
                  </div>

                  {/* Price & Selection Checkmark */}
                  <div className="flex items-center gap-2.5 flex-shrink-0 text-right">
                    {quote && (
                      <div className="text-right">
                        <div className="text-xs font-bold text-text-primary">
                          ₹{quote.price.toFixed(2)}
                        </div>
                        <div
                          className={`text-[10px] font-bold ${
                            quote.change >= 0 ? 'text-brand-positive' : 'text-brand-negative'
                          }`}
                        >
                          {quote.change >= 0 ? '+' : ''}
                          {quote.changePercent}%
                        </div>
                      </div>
                    )}
                    {isSelected && <Check className="w-4 h-4 text-brand-accent stroke-[3]" />}
                  </div>
                </div>
              );
            })}

            {/* Custom fallback if typed symbol not found */}
            {searchQuery.trim() && !filteredItems.some(i => i.symbol === searchQuery.trim().toUpperCase()) && (
              <div
                onClick={() => {
                  const sym = searchQuery.trim().toUpperCase();
                  handleSelect(sym, sym);
                }}
                className="px-3.5 py-3 hover:bg-bg-elevated cursor-pointer transition-colors bg-brand-accent/5 border-t border-brand-accent/20 flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-black text-brand-accent">
                    Use "{searchQuery.trim().toUpperCase()}"
                  </span>
                  <p className="text-[11px] text-text-muted mt-0.5">Log trade with this custom ticker</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-accent/20 text-brand-accent font-bold">
                  Custom Symbol
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
