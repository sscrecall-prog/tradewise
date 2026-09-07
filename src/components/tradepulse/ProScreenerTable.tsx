import React, { useState, useMemo } from 'react';
import { AnalyzedStock, FilterPreset } from '../../types/tradepulse';
import { 
  Search, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Star, 
  Bookmark,
  ExternalLink,
  ChevronDown,
  CheckCircle,
  SlidersHorizontal,
  Flame,
  Rocket,
  TrendingDown,
  Activity
} from 'lucide-react';

interface ProScreenerTableProps {
  stocks: AnalyzedStock[];
  watchlist: string[];
  onToggleWatchlist: (symbol: string) => void;
  onSelectStock: (stock: AnalyzedStock) => void;
  selectedSector: string;
  onSelectSector: (sec: string) => void;
}

type SortField = 
  | 'symbol' 
  | 'ltp' 
  | 'changePercent' 
  | 'valueCrores' 
  | 'volume' 
  | 'clv' 
  | 'distFrom52WHigh' 
  | 'change30D' 
  | 'change365D' 
  | 'proScore'
  | 'alphaVsIndex';

export const ProScreenerTable: React.FC<ProScreenerTableProps> = ({
  stocks,
  watchlist,
  onToggleWatchlist,
  onSelectStock,
  selectedSector,
  onSelectSector
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterPreset>('ALL');
  const [sortField, setSortField] = useState<SortField>('proScore');
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // Default descending for metrics
    }
  };

  // Filter logic
  const filteredStocks = useMemo(() => {
    return stocks.filter(stock => {
      // Sector filter
      if (selectedSector !== 'ALL' && stock.sector !== selectedSector) {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchSymbol = stock.symbol.toLowerCase().includes(query);
        const matchSector = stock.sector.toLowerCase().includes(query);
        if (!matchSymbol && !matchSector) return false;
      }

      // Preset filters
      switch (activeFilter) {
        case 'GRADE_A_PLUS':
          return stock.confirmation?.grade === 'A+' || stock.confirmation?.grade === 'A';
        case 'HIGH_ALPHA_LEADERS':
          return (stock.alphaVsIndex ?? 0) >= 1.0;
        case 'BULLISH_SETUPS':
          return stock.setup.action === 'BUY';
        case 'BEARISH_SETUPS':
          return stock.setup.action === 'SELL' || stock.changePercent <= -0.7;
        case 'OPEN_EQUALS_LOW':
          return stock.openDrive === 'OPEN_LOW';
        case 'OPEN_EQUALS_HIGH':
          return stock.openDrive === 'OPEN_HIGH';
        case 'NEAR_52W_HIGH':
          return stock.distFrom52WHigh <= 5.0;
        case 'NEAR_52W_LOW':
          return stock.distFrom52WLow <= 5.0;
        case 'HIGH_TURNOVER':
          return stock.valueCrores >= 400;
        case 'TRIPLE_GREEN':
          return stock.changePercent > 0 && stock.change30D > 0 && stock.change365D > 0;
        case 'TOP_GAINERS':
          return stock.changePercent >= 1.0;
        case 'TOP_LOSERS':
          return stock.changePercent <= -1.0;
        case 'ALL':
        default:
          return true;
      }
    });
  }, [stocks, selectedSector, searchTerm, activeFilter]);

  // Sort logic
  const sortedStocks = useMemo(() => {
    return [...filteredStocks].sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'symbol') {
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      aVal = Number(aVal) || 0;
      bVal = Number(bVal) || 0;
      return sortAsc ? aVal - bVal : bVal - aVal;
    });
  }, [filteredStocks, sortField, sortAsc]);

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-500 opacity-60 group-hover:opacity-100" />;
    }
    return sortAsc 
      ? <ArrowUp className="w-3.5 h-3.5 text-trade-green" /> 
      : <ArrowDown className="w-3.5 h-3.5 text-trade-green" />;
  };

  const filterChips: { id: FilterPreset; label: string; icon?: React.ReactNode; count?: number }[] = [
    { id: 'ALL', label: 'All Stocks', count: stocks.length },
    { id: 'GRADE_A_PLUS', label: '🌟 Grade A/A+ Setups', count: stocks.filter(s => s.confirmation?.grade === 'A+' || s.confirmation?.grade === 'A').length },
    { id: 'HIGH_ALPHA_LEADERS', label: '⚡ High Alpha Leaders (>=+1%)', count: stocks.filter(s => (s.alphaVsIndex ?? 0) >= 1.0).length },
    { id: 'BULLISH_SETUPS', label: '🟢 Buy Setups', count: stocks.filter(s => s.setup.action === 'BUY').length },
    { id: 'BEARISH_SETUPS', label: '🔴 Short Setups', count: stocks.filter(s => s.setup.action === 'SELL' || s.changePercent <= -0.7).length },
    { id: 'OPEN_EQUALS_LOW', label: '⚡ Open = Low', count: stocks.filter(s => s.openDrive === 'OPEN_LOW').length },
    { id: 'OPEN_EQUALS_HIGH', label: '⚠️ Open = High', count: stocks.filter(s => s.openDrive === 'OPEN_HIGH').length },
    { id: 'NEAR_52W_HIGH', label: '🚀 Near 52W High (<=5%)', count: stocks.filter(s => s.distFrom52WHigh <= 5.0).length },
    { id: 'HIGH_TURNOVER', label: '💰 High Value (>₹400Cr)', count: stocks.filter(s => s.valueCrores >= 400).length },
    { id: 'TRIPLE_GREEN', label: '✨ Triple Green (1D/30D/1Y)', count: stocks.filter(s => s.changePercent > 0 && s.change30D > 0 && s.change365D > 0).length },
    { id: 'TOP_GAINERS', label: '📈 Top Gainers (>1%)', count: stocks.filter(s => s.changePercent >= 1.0).length },
    { id: 'TOP_LOSERS', label: '📉 Top Losers (<-1%)', count: stocks.filter(s => s.changePercent <= -1.0).length },
  ];

  return (
    <div className="space-y-3.5">
      
      {/* Controls Bar: Search & Quick Filters */}
      <div className="glass-panel rounded-2xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by stock ticker (e.g. RELIANCE, TCS) or sector (e.g. Banking, Auto)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-dark-900 border border-slate-300 dark:border-dark-700/80 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-trade-green focus:border-trade-green transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 justify-end text-xs text-slate-500 dark:text-slate-400 font-mono">
            <span>Showing <strong className="text-slate-900 dark:text-white">{sortedStocks.length}</strong> of {stocks.length} stocks</span>
          </div>

        </div>

        {/* Filter Preset Chips (Scrollable) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          {filterChips.map(chip => (
            <button
              key={chip.id}
              onClick={() => setActiveFilter(chip.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeFilter === chip.id
                  ? 'bg-trade-green text-dark-950 font-bold shadow-md shadow-trade-green/20'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 dark:bg-dark-900 dark:text-slate-400 dark:hover:text-slate-200 dark:border-dark-800 dark:hover:border-dark-700'
              }`}
            >
              <span>{chip.label}</span>
              {chip.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  activeFilter === chip.id ? 'bg-dark-950/20 text-dark-950' : 'bg-slate-200 text-slate-700 dark:bg-dark-800 dark:text-slate-400'
                }`}>
                  {chip.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-200 dark:border-dark-800/80 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/95 dark:bg-dark-900/95 border-b border-slate-200 dark:border-dark-800 text-slate-600 dark:text-slate-400 uppercase text-[10px] tracking-wider select-none font-semibold sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th className="py-3 px-3 w-8 text-center">⭐</th>
                
                <th 
                  onClick={() => handleSort('symbol')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>SYMBOL & SECTOR</span>
                    {renderSortIndicator('symbol')}
                  </div>
                </th>

                <th 
                  onClick={() => handleSort('ltp')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>LTP (₹)</span>
                    {renderSortIndicator('ltp')}
                  </div>
                </th>

                <th 
                  onClick={() => handleSort('changePercent')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>1D CHANGE</span>
                    {renderSortIndicator('changePercent')}
                  </div>
                </th>

                <th 
                  onClick={() => handleSort('clv')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors w-40"
                >
                  <div className="flex items-center gap-1">
                    <span>DAY RANGE / CLV</span>
                    {renderSortIndicator('clv')}
                  </div>
                </th>

                <th 
                  onClick={() => handleSort('valueCrores')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>TURNOVER (₹ CR)</span>
                    {renderSortIndicator('valueCrores')}
                  </div>
                </th>

                <th 
                  onClick={() => handleSort('distFrom52WHigh')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>52W HIGH DIST</span>
                    {renderSortIndicator('distFrom52WHigh')}
                  </div>
                </th>

                <th 
                  onClick={() => handleSort('change30D')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors text-right hidden lg:table-cell"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>30D %</span>
                    {renderSortIndicator('change30D')}
                  </div>
                </th>

                <th 
                  onClick={() => handleSort('change365D')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors text-right hidden lg:table-cell"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>365D %</span>
                    {renderSortIndicator('change365D')}
                  </div>
                </th>

                <th 
                  onClick={() => handleSort('proScore')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>PRO SCORE</span>
                    {renderSortIndicator('proScore')}
                  </div>
                </th>

                <th 
                  onClick={() => handleSort('alphaVsIndex')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>CONFIRMATION / ALPHA</span>
                    {renderSortIndicator('alphaVsIndex')}
                  </div>
                </th>

                <th className="py-3 px-3 text-center">TRADE SIGNAL</th>

                <th className="py-3 px-3 text-right">ACTION</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-dark-800/60 font-mono">
              {sortedStocks.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-12 text-center text-slate-500 font-sans text-xs">
                    No stocks match the selected search & filter criteria.
                  </td>
                </tr>
              ) : (
                sortedStocks.map(stock => {
                  const isPositive = stock.change >= 0;
                  const isWatch = watchlist.includes(stock.symbol);
                  const isActionBuy = stock.setup.action === 'BUY';
                  const isActionSell = stock.setup.action === 'SELL';

                  return (
                    <tr
                      key={stock.symbol}
                      onClick={() => onSelectStock(stock)}
                      className="hover:bg-slate-50 dark:hover:bg-dark-850/80 cursor-pointer transition-colors group"
                    >
                      {/* Watchlist Star */}
                      <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onToggleWatchlist(stock.symbol)}
                          className="p-1 rounded text-slate-400 hover:text-amber-500 dark:text-slate-500 dark:hover:text-amber-400 transition-colors"
                        >
                          <Star className={`w-3.5 h-3.5 ${isWatch ? 'fill-amber-400 text-amber-500' : ''}`} />
                        </button>
                      </td>

                      {/* Symbol & Sector */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-trade-green transition-colors">
                            {stock.symbol}
                          </span>
                          {stock.openDrive === 'OPEN_LOW' && (
                            <span className="text-[9px] font-bold px-1 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-sans border border-emerald-500/30">
                              O=L
                            </span>
                          )}
                          {stock.openDrive === 'OPEN_HIGH' && (
                            <span className="text-[9px] font-bold px-1 rounded bg-rose-500/20 text-rose-700 dark:text-rose-300 font-sans border border-rose-500/30">
                              O=H
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans block truncate max-w-[120px]">
                          {stock.sector}
                        </span>
                      </td>

                      {/* LTP */}
                      <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-slate-100 text-xs whitespace-nowrap">
                        ₹{stock.ltp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      {/* 1D Change */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <span className={`font-bold inline-flex items-center gap-0.5 ${
                          isPositive ? 'text-trade-green' : 'text-trade-red'
                        }`}>
                          {isPositive ? '+' : ''}{stock.change.toFixed(2)} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                        </span>
                      </td>

                      {/* Day Range & CLV Visualizer Bar */}
                      <td className="py-3 px-3">
                        <div className="w-32">
                          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-0.5 font-sans">
                            <span>L: {stock.low.toFixed(0)}</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-300">{stock.clv.toFixed(0)}%</span>
                            <span>H: {stock.high.toFixed(0)}</span>
                          </div>
                          {/* Visual slider track */}
                          <div className="relative w-full h-1.5 bg-slate-200 dark:bg-dark-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                stock.clv >= 65 ? 'bg-trade-green' : stock.clv <= 35 ? 'bg-trade-red' : 'bg-amber-400'
                              }`}
                              style={{ width: `${Math.max(8, stock.clv)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Turnover (₹ Crores) */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="font-bold text-slate-900 dark:text-slate-200">
                          ₹{stock.valueCrores.toLocaleString('en-IN', { maximumFractionDigits: 1 })} Cr
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {stock.volume.toLocaleString('en-IN')} shares
                        </div>
                      </td>

                      {/* 52W High Distance */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <span className={`font-semibold text-xs ${
                          stock.distFrom52WHigh <= 5 ? 'text-cyan-600 dark:text-cyan-400 font-bold' : 'text-slate-700 dark:text-slate-300'
                        }`}>
                          -{stock.distFrom52WHigh.toFixed(1)}%
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                          52H: ₹{stock.high52W.toFixed(0)}
                        </span>
                      </td>

                      {/* 30D % */}
                      <td className="py-3 px-3 text-right whitespace-nowrap hidden lg:table-cell">
                        <span className={`font-semibold ${
                          stock.change30D >= 0 ? 'text-trade-green' : 'text-trade-red'
                        }`}>
                          {stock.change30D >= 0 ? '+' : ''}{stock.change30D.toFixed(1)}%
                        </span>
                      </td>

                      {/* 365D % */}
                      <td className="py-3 px-3 text-right whitespace-nowrap hidden lg:table-cell">
                        <span className={`font-semibold ${
                          stock.change365D >= 0 ? 'text-trade-green' : 'text-trade-red'
                        }`}>
                          {stock.change365D >= 0 ? '+' : ''}{stock.change365D.toFixed(1)}%
                        </span>
                      </td>

                      {/* Pro Score */}
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded font-mono font-extrabold text-xs ${
                          stock.proScore >= 70 ? 'bg-trade-green-bg text-trade-green border border-trade-green/30' :
                          stock.proScore >= 45 ? 'bg-amber-400/10 text-amber-500 dark:text-amber-400 border border-amber-400/30' :
                          'bg-trade-red-bg text-trade-red border border-trade-red/30'
                        }`}>
                          {stock.proScore}
                        </span>
                      </td>

                      {/* Confirmation Grade & RS Alpha */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-black text-xs ${
                            stock.confirmation?.grade === 'A+' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40' :
                            stock.confirmation?.grade === 'A' ? 'bg-trade-green/20 text-trade-green border border-trade-green/40' :
                            stock.confirmation?.grade === 'B' ? 'bg-amber-400/20 text-amber-600 dark:text-amber-300 border border-amber-400/30' :
                            'bg-slate-100 dark:bg-dark-800 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-dark-700'
                          }`}>
                            <span>{stock.confirmation?.grade || 'B'}</span>
                            <span className="text-[9px] text-amber-500">{'★'.repeat(stock.confirmation?.stars || 3)}</span>
                          </span>
                          {stock.alphaVsIndex !== undefined && (
                            <span className={`text-[10px] font-mono ${stock.alphaVsIndex >= 0 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                              α {stock.alphaVsIndex >= 0 ? '+' : ''}{stock.alphaVsIndex.toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Trade Signal Badge */}
                      <td className="py-3 px-3 text-center font-sans whitespace-nowrap">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          stock.setup.signal === 'STRONG_BUY' ? 'bg-trade-green/20 text-trade-green border-trade-green/40' :
                          stock.setup.signal === 'BREAKOUT_RADAR' ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/40' :
                          stock.setup.signal === 'SWING_BUY' ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/40' :
                          stock.setup.signal === 'STRONG_SHORT' ? 'bg-trade-red/20 text-trade-red border-trade-red/40' :
                          stock.setup.signal === 'AVOID' ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/40' :
                          'bg-slate-100 dark:bg-dark-800 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-dark-700'
                        }`}>
                          {stock.setup.signal.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Action Button */}
                      <td className="py-3 px-3 text-right whitespace-nowrap font-sans" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onSelectStock(stock)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1 ${
                            isActionBuy 
                              ? 'bg-trade-green/10 hover:bg-trade-green hover:text-dark-950 text-trade-green border border-trade-green/30' 
                              : isActionSell
                              ? 'bg-trade-red/10 hover:bg-trade-red hover:text-dark-950 text-trade-red border border-trade-red/30'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 border border-slate-300 dark:bg-dark-800 dark:hover:bg-dark-700 dark:text-slate-300 dark:hover:text-white dark:border-dark-700'
                          }`}
                        >
                          <span>Analyze</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
