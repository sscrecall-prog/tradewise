import React from 'react';
import { AnalyzedStock } from '../../types/tradepulse';
import { Layers, TrendingUp, TrendingDown } from 'lucide-react';

interface SectorHeatmapProps {
  stocks: AnalyzedStock[];
  selectedSector: string;
  onSelectSector: (sector: string) => void;
}

export const SectorHeatmap: React.FC<SectorHeatmapProps> = ({
  stocks,
  selectedSector,
  onSelectSector
}) => {
  // Aggregate sector stats
  const sectorMap = new Map<string, {
    count: number;
    totalTurnover: number;
    sumChangePercent: number;
    stocks: AnalyzedStock[];
  }>();

  stocks.forEach(stock => {
    const sec = stock.sector || 'Other';
    const entry = sectorMap.get(sec) || { count: 0, totalTurnover: 0, sumChangePercent: 0, stocks: [] };
    entry.count += 1;
    entry.totalTurnover += stock.valueCrores;
    entry.sumChangePercent += stock.changePercent;
    entry.stocks.push(stock);
    sectorMap.set(sec, entry);
  });

  const sectorList = Array.from(sectorMap.entries()).map(([sector, data]) => ({
    sector,
    count: data.count,
    totalTurnover: data.totalTurnover,
    avgChangePercent: data.count > 0 ? data.sumChangePercent / data.count : 0,
    stocks: data.stocks
  })).sort((a, b) => b.totalTurnover - a.totalTurnover);

  return (
    <div className="glass-panel rounded-2xl p-4 space-y-3 border border-slate-200 dark:border-dark-800/80 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
            Sector Rotation & Turnover Heatmap
          </h3>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
            (Click sector to filter screener table)
          </span>
        </div>

        {selectedSector !== 'ALL' && (
          <button
            onClick={() => onSelectSector('ALL')}
            className="text-xs text-trade-green hover:underline font-semibold"
          >
            Clear Sector Filter ({selectedSector})
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {sectorList.map(item => {
          const isSelected = selectedSector === item.sector;
          const isPos = item.avgChangePercent >= 0;

          return (
            <div
              key={item.sector}
              onClick={() => onSelectSector(isSelected ? 'ALL' : item.sector)}
              className={`p-3 rounded-xl cursor-pointer transition-all border ${
                isSelected 
                  ? 'bg-purple-500/15 border-purple-500 shadow-md shadow-purple-500/10 scale-[1.02]' 
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-slate-300 dark:bg-dark-900/80 dark:hover:bg-dark-850 dark:border-dark-800 dark:hover:border-dark-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-200 truncate pr-1">
                  {item.sector}
                </span>
                <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono px-1 rounded bg-slate-200 dark:bg-dark-800">
                  {item.count}
                </span>
              </div>

              <div className="mt-2 flex items-baseline justify-between">
                <div className={`text-xs font-mono font-bold flex items-center gap-0.5 ${
                  isPos ? 'text-trade-green' : 'text-trade-red'
                }`}>
                  {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{isPos ? '+' : ''}{item.avgChangePercent.toFixed(2)}%</span>
                </div>

                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  ₹{item.totalTurnover.toFixed(0)} Cr
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
