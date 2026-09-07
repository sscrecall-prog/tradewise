import React, { useState, useMemo } from 'react';
import { AnalyzedStock } from '../../types/tradepulse';
import { 
  TrendingUp, 
  TrendingDown, 
  Flame, 
  ShieldAlert, 
  BarChart2, 
  ArrowUpRight, 
  ArrowDownRight, 
  Zap, 
  Layers,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';

interface TopGainersLosersAnalyticsProps {
  stocks: AnalyzedStock[];
  onSelectStock: (stock: AnalyzedStock) => void;
}

export const TopGainersLosersAnalytics: React.FC<TopGainersLosersAnalyticsProps> = ({
  stocks,
  onSelectStock
}) => {
  const [viewMode, setViewMode] = useState<'SIDE_BY_SIDE' | 'GAINERS_ONLY' | 'LOSERS_ONLY'>('SIDE_BY_SIDE');

  // Top 10 Gainers sorted by changePercent descending
  const top10Gainers = useMemo(() => {
    return [...stocks]
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, 10);
  }, [stocks]);

  // Top 10 Losers sorted by changePercent ascending
  const top10Losers = useMemo(() => {
    return [...stocks]
      .sort((a, b) => a.changePercent - b.changePercent)
      .slice(0, 10);
  }, [stocks]);

  // Comparative Analytics Metrics
  const analytics = useMemo(() => {
    const avgGain = top10Gainers.length > 0 
      ? top10Gainers.reduce((acc, s) => acc + s.changePercent, 0) / top10Gainers.length 
      : 0;

    const avgLoss = top10Losers.length > 0 
      ? top10Losers.reduce((acc, s) => acc + s.changePercent, 0) / top10Losers.length 
      : 0;

    const gainersTurnover = top10Gainers.reduce((acc, s) => acc + s.valueCrores, 0);
    const losersTurnover = top10Losers.reduce((acc, s) => acc + s.valueCrores, 0);
    const totalTurnoverBoth = gainersTurnover + losersTurnover;
    const gainersTurnoverPct = totalTurnoverBoth > 0 ? (gainersTurnover / totalTurnoverBoth) * 100 : 50;

    // Average Close Location Value (Are gainers closing near highs? Are losers near lows?)
    const gainersAvgClv = top10Gainers.length > 0 
      ? top10Gainers.reduce((acc, s) => acc + s.clv, 0) / top10Gainers.length 
      : 50;

    const losersAvgClv = top10Losers.length > 0 
      ? top10Losers.reduce((acc, s) => acc + s.clv, 0) / top10Losers.length 
      : 50;

    // Dominant sectors
    const countSectors = (list: AnalyzedStock[]) => {
      const counts: Record<string, number> = {};
      list.forEach(s => { counts[s.sector] = (counts[s.sector] || 0) + 1; });
      return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Mixed';
    };

    const topGainSector = countSectors(top10Gainers);
    const topLossSector = countSectors(top10Losers);

    // Institutional Verdict
    let institutionalVerdict = '';
    if (gainersTurnoverPct >= 60) {
      institutionalVerdict = 'BULLISH INSTITUTIONAL CONVICTION: High-value buying flow heavily dominating over low-conviction selling.';
    } else if (gainersTurnoverPct <= 40) {
      institutionalVerdict = 'BEARISH DISTRIBUTION: Heavy institutional selling volume outpacing weak speculative buying.';
    } else {
      institutionalVerdict = 'BALANCED ROTATION: Sectoral churn between buyers and sellers with no single-sided panic.';
    }

    return {
      avgGain,
      avgLoss,
      gainersTurnover,
      losersTurnover,
      gainersTurnoverPct,
      gainersAvgClv,
      losersAvgClv,
      topGainSector,
      topLossSector,
      institutionalVerdict
    };
  }, [top10Gainers, top10Losers]);

  return (
    <section className="space-y-4">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-trade-green" />
            <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              Top 10 Gainers & Losers Analytics
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-dark-800 text-slate-700 dark:text-slate-300 font-mono border border-slate-200 dark:border-dark-700">
              MOMENTUM RADAR
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Comparative institutional turnover, day-closing strength, and actionable trading setups
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl">
          <button
            onClick={() => setViewMode('SIDE_BY_SIDE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'SIDE_BY_SIDE'
                ? 'bg-white dark:bg-dark-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-dark-700'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Side-by-Side (10 vs 10)
          </button>
          <button
            onClick={() => setViewMode('GAINERS_ONLY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'GAINERS_ONLY'
                ? 'bg-trade-green text-dark-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            🟢 Gainers Only
          </button>
          <button
            onClick={() => setViewMode('LOSERS_ONLY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'LOSERS_ONLY'
                ? 'bg-trade-red text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            🔴 Losers Only
          </button>
        </div>
      </div>

      {/* Comparative Institutional Battle Summary Banner */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 space-y-4 border border-slate-200 dark:border-dark-800/80 shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-200 dark:border-dark-800 pb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Institutional Turnover Battle (Gainers vs Losers)
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-trade-green font-bold">
              Gainers: ₹{analytics.gainersTurnover.toFixed(0)} Cr ({analytics.gainersTurnoverPct.toFixed(1)}%)
            </span>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span className="text-trade-red font-bold">
              Losers: ₹{analytics.losersTurnover.toFixed(0)} Cr ({(100 - analytics.gainersTurnoverPct).toFixed(1)}%)
            </span>
          </div>
        </div>

        {/* Visual Liquidity Dominance Bar */}
        <div className="space-y-1.5">
          <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-dark-900 overflow-hidden flex p-0.5 border border-slate-200 dark:border-dark-800">
            <div 
              className="bg-trade-green rounded-l-full transition-all duration-500 flex items-center justify-start pl-2 text-[9px] font-bold text-dark-950 font-mono"
              style={{ width: `${analytics.gainersTurnoverPct}%` }}
              title={`Gainers Turnover: ₹${analytics.gainersTurnover.toFixed(0)} Cr`}
            >
              {analytics.gainersTurnoverPct > 20 && `${analytics.gainersTurnoverPct.toFixed(0)}%`}
            </div>
            <div 
              className="bg-trade-red rounded-r-full transition-all duration-500 flex items-center justify-end pr-2 text-[9px] font-bold text-white font-mono"
              style={{ width: `${100 - analytics.gainersTurnoverPct}%` }}
              title={`Losers Turnover: ₹${analytics.losersTurnover.toFixed(0)} Cr`}
            >
              {(100 - analytics.gainersTurnoverPct) > 20 && `${(100 - analytics.gainersTurnoverPct).toFixed(0)}%`}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Bulls Capital Inflow</span>
            <span className="text-slate-800 dark:text-slate-300 font-semibold">{analytics.institutionalVerdict}</span>
            <span>Bears Capital Outflow</span>
          </div>
        </div>

        {/* 4 Micro Analytics Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-900/90 border border-slate-200 dark:border-dark-800/80">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-sans">Avg Gain (Top 10)</span>
            <span className="text-base font-bold text-trade-green font-mono">
              +{analytics.avgGain.toFixed(2)}%
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5 font-sans">
              Sector: <strong className="text-slate-800 dark:text-slate-300">{analytics.topGainSector}</strong>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-900/90 border border-slate-200 dark:border-dark-800/80">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-sans">Avg Drop (Top 10)</span>
            <span className="text-base font-bold text-trade-red font-mono">
              {analytics.avgLoss.toFixed(2)}%
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5 font-sans">
              Sector: <strong className="text-slate-800 dark:text-slate-300">{analytics.topLossSector}</strong>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-900/90 border border-slate-200 dark:border-dark-800/80">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-sans">Gainers Day Close (CLV)</span>
            <span className="text-base font-bold text-cyan-600 dark:text-cyan-400 font-mono">
              {analytics.gainersAvgClv.toFixed(0)}%
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5 font-sans">
              {analytics.gainersAvgClv >= 65 ? 'Closing near Day Highs' : 'Some profit taking'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-900/90 border border-slate-200 dark:border-dark-800/80">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-sans">Losers Day Close (CLV)</span>
            <span className="text-base font-bold text-rose-600 dark:text-rose-400 font-mono">
              {analytics.losersAvgClv.toFixed(0)}%
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5 font-sans">
              {analytics.losersAvgClv <= 35 ? 'Dumping near Day Lows' : 'Dip buying support'}
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Top 10 Gainers and Top 10 Losers Tables */}
      <div className={`grid gap-4 ${viewMode === 'SIDE_BY_SIDE' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        
        {/* LEFT: Top 10 Gainers Table */}
        {(viewMode === 'SIDE_BY_SIDE' || viewMode === 'GAINERS_ONLY') && (
          <div className="glass-panel rounded-2xl overflow-hidden border border-emerald-500/30 shadow-xl">
            <div className="px-4 py-3 bg-trade-green/10 border-b border-emerald-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-trade-green animate-pulse-subtle"></span>
                <h3 className="text-sm font-extrabold text-trade-green flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  TOP 10 GAINERS
                </h3>
              </div>
              <span className="text-[11px] font-mono font-semibold text-trade-green">
                Turnover: ₹{analytics.gainersTurnover.toFixed(0)} Cr
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 dark:bg-dark-900/90 text-slate-600 dark:text-slate-400 text-[10px] uppercase border-b border-slate-200 dark:border-dark-800">
                  <tr>
                    <th className="py-2.5 px-3 w-8 text-center">#</th>
                    <th className="py-2.5 px-3">SYMBOL</th>
                    <th className="py-2.5 px-3 text-right">LTP (₹)</th>
                    <th className="py-2.5 px-3 text-right">% CHG</th>
                    <th className="py-2.5 px-3 text-right">VALUE (CR)</th>
                    <th className="py-2.5 px-3 text-center">CLV %</th>
                    <th className="py-2.5 px-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-dark-800/60">
                  {top10Gainers.map((stock, idx) => (
                    <tr
                      key={stock.symbol}
                      onClick={() => onSelectStock(stock)}
                      className="hover:bg-slate-50 dark:hover:bg-dark-850/80 cursor-pointer transition-colors group"
                    >
                      <td className="py-2.5 px-3 text-center font-bold text-slate-400 dark:text-slate-500">
                        {idx + 1}
                      </td>

                      <td className="py-2.5 px-3 font-sans">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-trade-green transition-colors font-mono">
                            {stock.symbol}
                          </span>
                          {stock.openDrive === 'OPEN_LOW' && (
                            <span className="text-[9px] font-bold px-1 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                              O=L
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate max-w-[110px]">
                          {stock.sector}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        ₹{stock.ltp.toFixed(2)}
                      </td>

                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <span className="font-bold text-trade-green inline-flex items-center gap-0.5">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          +{stock.changePercent.toFixed(2)}%
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-right text-slate-800 dark:text-slate-300 whitespace-nowrap font-medium">
                        ₹{stock.valueCrores.toFixed(0)} Cr
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          stock.clv >= 70 ? 'bg-trade-green/20 text-trade-green' : 'bg-slate-100 text-slate-600 dark:bg-dark-800 dark:text-slate-400'
                        }`}>
                          {stock.clv.toFixed(0)}%
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-right whitespace-nowrap font-sans">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-trade-green/10 text-trade-green border border-trade-green/30">
                          {stock.setup.signal === 'STRONG_BUY' ? 'Strong Buy' : stock.setup.signal === 'BREAKOUT_RADAR' ? 'Breakout' : 'Buy Setup'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* RIGHT: Top 10 Losers Table */}
        {(viewMode === 'SIDE_BY_SIDE' || viewMode === 'LOSERS_ONLY') && (
          <div className="glass-panel rounded-2xl overflow-hidden border border-rose-500/30 shadow-xl">
            <div className="px-4 py-3 bg-trade-red/10 border-b border-rose-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-trade-red animate-pulse-subtle"></span>
                <h3 className="text-sm font-extrabold text-trade-red flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4" />
                  TOP 10 LOSERS
                </h3>
              </div>
              <span className="text-[11px] font-mono font-semibold text-trade-red">
                Turnover: ₹{analytics.losersTurnover.toFixed(0)} Cr
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 dark:bg-dark-900/90 text-slate-600 dark:text-slate-400 text-[10px] uppercase border-b border-slate-200 dark:border-dark-800">
                  <tr>
                    <th className="py-2.5 px-3 w-8 text-center">#</th>
                    <th className="py-2.5 px-3">SYMBOL</th>
                    <th className="py-2.5 px-3 text-right">LTP (₹)</th>
                    <th className="py-2.5 px-3 text-right">% CHG</th>
                    <th className="py-2.5 px-3 text-right">VALUE (CR)</th>
                    <th className="py-2.5 px-3 text-center">CLV %</th>
                    <th className="py-2.5 px-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-dark-800/60">
                  {top10Losers.map((stock, idx) => (
                    <tr
                      key={stock.symbol}
                      onClick={() => onSelectStock(stock)}
                      className="hover:bg-slate-50 dark:hover:bg-dark-850/80 cursor-pointer transition-colors group"
                    >
                      <td className="py-2.5 px-3 text-center font-bold text-slate-400 dark:text-slate-500">
                        {idx + 1}
                      </td>

                      <td className="py-2.5 px-3 font-sans">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-trade-red transition-colors font-mono">
                            {stock.symbol}
                          </span>
                          {stock.openDrive === 'OPEN_HIGH' && (
                            <span className="text-[9px] font-bold px-1 rounded bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                              O=H
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate max-w-[110px]">
                          {stock.sector}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        ₹{stock.ltp.toFixed(2)}
                      </td>

                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <span className="font-bold text-trade-red inline-flex items-center gap-0.5">
                          <ArrowDownRight className="w-3.5 h-3.5" />
                          {stock.changePercent.toFixed(2)}%
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-right text-slate-800 dark:text-slate-300 whitespace-nowrap font-medium">
                        ₹{stock.valueCrores.toFixed(0)} Cr
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          stock.clv <= 30 ? 'bg-trade-red/20 text-trade-red' : 'bg-slate-100 text-slate-600 dark:bg-dark-800 dark:text-slate-400'
                        }`}>
                          {stock.clv.toFixed(0)}%
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-right whitespace-nowrap font-sans">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          stock.setup.action === 'SELL'
                            ? 'bg-trade-red/10 text-trade-red border-trade-red/30'
                            : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-dark-800 dark:text-slate-400 dark:border-dark-700'
                        }`}>
                          {stock.setup.signal === 'STRONG_SHORT' ? 'Short Setup' : stock.setup.signal === 'AVOID' ? 'Avoid Buy' : 'Watch Range'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

    </section>
  );
};
