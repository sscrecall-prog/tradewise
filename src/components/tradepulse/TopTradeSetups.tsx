import React, { useState } from 'react';
import { AnalyzedStock } from '../../types/tradepulse';
import { 
  Rocket, 
  TrendingDown, 
  Sparkles, 
  Target, 
  ShieldAlert, 
  ArrowUpRight, 
  ArrowDownRight,
  Flame,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

interface TopTradeSetupsProps {
  stocks: AnalyzedStock[];
  onSelectStock: (stock: AnalyzedStock) => void;
}

export const TopTradeSetups: React.FC<TopTradeSetupsProps> = ({ stocks, onSelectStock }) => {
  const [activeTab, setActiveTab] = useState<'LONGS' | 'BREAKOUTS' | 'SHORTS' | 'SWING'>('LONGS');

  // Filter candidate groups
  const bullishLongs = [...stocks]
    .filter(s => s.setup.action === 'BUY' && (s.openDrive === 'OPEN_LOW' || s.clv >= 65))
    .sort((a, b) => b.proScore - a.proScore)
    .slice(0, 4);

  const breakoutRadar = [...stocks]
    .filter(s => s.distFrom52WHigh <= 5.0 && s.changePercent >= 0)
    .sort((a, b) => a.distFrom52WHigh - b.distFrom52WHigh)
    .slice(0, 4);

  const bearishShorts = [...stocks]
    .filter(s => s.setup.action === 'SELL' || s.openDrive === 'OPEN_HIGH' || s.changePercent <= -0.7)
    .sort((a, b) => a.proScore - b.proScore)
    .slice(0, 4);

  const swingDipBuys = [...stocks]
    .filter(s => s.change365D >= 10 && s.change30D <= 0 && s.changePercent >= 0.1)
    .sort((a, b) => b.change365D - a.change365D)
    .slice(0, 4);

  const displayedStocks = 
    activeTab === 'LONGS' ? bullishLongs :
    activeTab === 'BREAKOUTS' ? breakoutRadar :
    activeTab === 'SHORTS' ? bearishShorts :
    swingDipBuys;

  return (
    <section className="space-y-4">
      
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-trade-green animate-pulse-subtle"></span>
            <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              Trade Recommendations <span className="text-xs font-normal text-slate-600 dark:text-slate-400 font-mono">(Kon Si Company Me Trade Karein?)</span>
            </h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Algorithmic high-probability setups with pre-calculated Entry, Stop-Loss, and Target levels
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl overflow-x-auto">
          <button
            onClick={() => setActiveTab('LONGS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'LONGS'
                ? 'bg-trade-green text-dark-950 shadow-md shadow-trade-green/20'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Top Longs ({bullishLongs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('BREAKOUTS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'BREAKOUTS'
                ? 'bg-cyan-500 text-dark-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>52W Breakouts ({breakoutRadar.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('SHORTS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'SHORTS'
                ? 'bg-trade-red text-dark-950 shadow-md shadow-trade-red/20'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Top Shorts ({bearishShorts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('SWING')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'SWING'
                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dip Reversals ({swingDipBuys.length})</span>
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      {displayedStocks.length === 0 ? (
        <div className="glass-panel rounded-2xl p-8 text-center text-slate-400 text-sm">
          No stocks currently meeting strict criteria for this category. Check other tabs or explore all 50 stocks in the Screener table below.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {displayedStocks.map(stock => {
            const isLong = stock.setup.action === 'BUY';
            const changePos = stock.change >= 0;

            return (
              <div
                key={stock.symbol}
                onClick={() => onSelectStock(stock)}
                className="glass-panel-interactive rounded-2xl p-4 flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  {/* Top Row: Symbol, Sector, Pro Score */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-slate-900 dark:text-white font-mono group-hover:text-trade-green transition-colors">
                          {stock.symbol}
                        </span>
                        {stock.openDrive === 'OPEN_LOW' && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                            OPEN=LOW
                          </span>
                        )}
                        {stock.openDrive === 'OPEN_HIGH' && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30">
                            OPEN=HIGH
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-600 dark:text-slate-400 block font-medium">{stock.sector}</span>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">PRO SCORE</span>
                        <span className={`text-xs font-mono font-extrabold px-1.5 py-0.5 rounded ${
                          stock.proScore >= 70 ? 'bg-trade-green-bg text-trade-green' :
                          stock.proScore >= 45 ? 'bg-amber-400/10 text-amber-500 dark:text-amber-400' :
                          'bg-trade-red-bg text-trade-red'
                        }`}>
                          {stock.proScore}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Current Price & Day Change */}
                  <div className="my-2.5 flex items-baseline justify-between border-y border-slate-200 dark:border-dark-800/80 py-2">
                    <div>
                      <div className="text-lg font-black text-slate-900 dark:text-white font-mono">
                        ₹{stock.ltp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-slate-600 dark:text-slate-400 font-mono">
                        Turnover: ₹{stock.valueCrores.toFixed(0)} Cr
                      </div>
                    </div>

                    <div className={`text-right font-mono font-bold text-xs ${
                      changePos ? 'text-trade-green' : 'text-trade-red'
                    }`}>
                      <div className="flex items-center gap-0.5 justify-end">
                        {changePos ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        <span>{changePos ? '+' : ''}{stock.change.toFixed(2)}</span>
                      </div>
                      <span className="text-[11px]">({changePos ? '+' : ''}{stock.changePercent.toFixed(2)}%)</span>
                    </div>
                  </div>

                  {/* Strategy Badge & Confirmation Grade */}
                  <div className="mb-2.5 flex items-center justify-between gap-1 flex-wrap">
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                      isLong 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-trade-green/10 dark:text-trade-green dark:border-trade-green/30' 
                        : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-trade-red/10 dark:text-trade-red dark:border-trade-red/30'
                    }`}>
                      {stock.setup.strategy}
                    </span>

                    <div className="flex items-center gap-1 font-mono">
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${
                        stock.confirmation.grade === 'A+' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40' :
                        stock.confirmation.grade === 'A' ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/40' :
                        stock.confirmation.grade === 'B' ? 'bg-amber-400/20 text-amber-700 dark:text-amber-300 border-amber-400/40' :
                        'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/40'
                      }`}>
                        GRADE {stock.confirmation.grade}
                      </span>
                      <span className="text-[10px] text-amber-400 font-bold">
                        {'★'.repeat(stock.confirmation.stars)}
                      </span>
                    </div>
                  </div>

                  {/* Execution Matrix (Entry, SL, Targets) */}
                  <div className="grid grid-cols-2 gap-1.5 bg-slate-50 dark:bg-dark-900/90 rounded-xl p-2.5 border border-slate-200 dark:border-dark-800/90 text-xs font-mono mb-3">
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-sans font-medium">Suggested Entry</span>
                      <span className="font-bold text-slate-900 dark:text-slate-200">₹{stock.setup.entryPrice.toFixed(2)}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-rose-600 dark:text-rose-400 block font-sans font-medium">Stop Loss (SL)</span>
                      <span className="font-bold text-rose-600 dark:text-trade-red">₹{stock.setup.stopLoss.toFixed(2)}</span>
                    </div>

                    <div className="border-t border-slate-200 dark:border-dark-800 pt-1 mt-1">
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-sans font-medium">Target 1 (1:1.5)</span>
                      <span className="font-bold text-emerald-600 dark:text-trade-green">₹{stock.setup.target1.toFixed(2)}</span>
                    </div>

                    <div className="border-t border-slate-200 dark:border-dark-800 pt-1 mt-1">
                      <span className="text-[10px] text-cyan-600 dark:text-cyan-400 block font-sans font-medium">Target 2 (1:2.5)</span>
                      <span className="font-bold text-cyan-600 dark:text-cyan-400">₹{stock.setup.target2.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Rationale snippet in Hinglish */}
                  <div className="text-[11px] text-emerald-950 dark:text-slate-300 leading-relaxed bg-emerald-50/90 dark:bg-dark-850/50 p-2.5 rounded-lg border border-emerald-200 dark:border-dark-800/60 mb-2">
                    <span className="text-emerald-700 dark:text-trade-green font-bold">Trader Rationale: </span>
                    {stock.setup.rationaleHinglish}
                  </div>
                </div>

                {/* Card Footer Call to Action */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectStock(stock);
                  }}
                  className="w-full mt-2 py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 dark:bg-dark-800 dark:hover:bg-dark-700 dark:text-slate-200 dark:hover:text-white dark:border-transparent font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Position & Risk Calculator</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-trade-green" />
                </button>

              </div>
            );
          })}
        </div>
      )}

    </section>
  );
};
