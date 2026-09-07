import React from 'react';
import { MarketPulse } from '../../types/tradepulse';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart3, 
  Zap, 
  Layers 
} from 'lucide-react';

interface MarketPulseBannerProps {
  pulse: MarketPulse;
}

export const MarketPulseBanner: React.FC<MarketPulseBannerProps> = ({ pulse }) => {
  const isPositive = pulse.indexChange >= 0;
  const totalBreaths = pulse.advancesCount + pulse.declinesCount + pulse.unchangedCount;
  const advancePercent = totalBreaths > 0 ? (pulse.advancesCount / totalBreaths) * 100 : 50;

  const sentimentConfig = {
    BULLISH: { label: 'BULLISH', color: 'text-trade-green', bg: 'bg-trade-green/10', border: 'border-trade-green/30' },
    MILD_BULLISH: { label: 'MILD BULLISH', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30' },
    NEUTRAL: { label: 'NEUTRAL / BALANCED', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30' },
    MILD_BEARISH: { label: 'MILD BEARISH', color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/30' },
    BEARISH: { label: 'BEARISH', color: 'text-trade-red', bg: 'bg-trade-red/10', border: 'border-trade-red/30' }
  }[pulse.marketSentiment];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      
      {/* 1. Nifty 50 Benchmark Card */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-400 font-semibold">
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-trade-blue" />
            BENCHMARK INDEX
          </span>
          <span className="text-[10px] font-mono uppercase bg-slate-100 dark:bg-dark-800 px-2 py-0.5 rounded text-slate-800 dark:text-slate-300 font-bold border border-slate-200 dark:border-dark-700">
            {pulse.indexSymbol || 'NIFTY BENCHMARK'}
          </span>
        </div>

        <div className="my-2 flex items-baseline justify-between">
          <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
            {pulse.indexLevel.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <div className={`flex items-center gap-1 font-mono font-bold text-xs px-2 py-0.5 rounded ${
            isPositive ? 'bg-trade-green-bg text-trade-green' : 'bg-trade-red-bg text-trade-red'
          }`}>
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{isPositive ? '+' : ''}{pulse.indexChange.toFixed(2)}</span>
            <span>({isPositive ? '+' : ''}{pulse.indexChangePercent.toFixed(2)}%)</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between font-medium">
          <span>National Stock Exchange</span>
          <span className="text-slate-500 dark:text-slate-500">Official Benchmark</span>
        </div>
      </div>

      {/* 2. Market Breadth (Advances vs Declines) */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-400 font-semibold">
          <span className="flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-cyan-500" />
            MARKET BREADTH (A/D)
          </span>
          <span className="font-mono text-xs text-slate-700 dark:text-slate-200">
            Ratio: <strong className="text-slate-900 dark:text-white">{pulse.advanceDeclineRatio.toFixed(2)}</strong>
          </span>
        </div>

        <div className="my-2">
          {/* Visual Advance / Decline Bar */}
          <div className="flex justify-between items-center text-xs font-mono font-bold mb-1.5">
            <span className="text-trade-green flex items-center gap-1">
              ▲ {pulse.advancesCount} Adv
            </span>
            <span className="text-trade-red flex items-center gap-1">
              {pulse.declinesCount} Dec ▼
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-dark-800 overflow-hidden flex">
            <div 
              className="bg-trade-green transition-all duration-500" 
              style={{ width: `${advancePercent}%` }} 
              title={`Advances: ${pulse.advancesCount}`}
            />
            <div 
              className="bg-trade-red transition-all duration-500" 
              style={{ width: `${100 - advancePercent}%` }} 
              title={`Declines: ${pulse.declinesCount}`}
            />
          </div>
        </div>

        <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between font-medium">
          <span>{pulse.indexSymbol || 'Benchmark'} Constituents</span>
          <span className="text-slate-500">{pulse.unchangedCount} Flat</span>
        </div>
      </div>

      {/* 3. Market Sentiment Gauge */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-400 font-semibold">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            MARKET BIAS
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">TODAY'S MOOD</span>
        </div>

        <div className="my-2">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-extrabold tracking-wide ${sentimentConfig.bg} ${sentimentConfig.color} ${sentimentConfig.border}`}>
            <span className="w-2 h-2 rounded-full bg-current animate-pulse-subtle"></span>
            {sentimentConfig.label}
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1.5 font-medium leading-tight">
            {pulse.marketSentiment === 'BULLISH' || pulse.marketSentiment === 'MILD_BULLISH'
              ? 'Dip-buying momentum favored for intraday longs'
              : pulse.marketSentiment === 'BEARISH' || pulse.marketSentiment === 'MILD_BEARISH'
              ? 'Caution advised; selective shorting & high stop-loss discipline'
              : 'Selective stock-specific trades; avoid index chases'}
          </p>
        </div>

        <div className="text-[11px] text-slate-500 font-medium">
          Algorithmic Confluence Indicator
        </div>
      </div>

      {/* 4. Total Turnover & Active Sector */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-400 font-semibold">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-purple-500" />
            LIQUIDITY & SECTORS
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-semibold">NSE TURNOVER</span>
        </div>

        <div className="my-2">
          <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
            ₹{pulse.totalTurnoverCrores.toLocaleString('en-IN', { maximumFractionDigits: 0 })} <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">Cr</span>
          </div>
          <div className="text-xs text-slate-700 dark:text-slate-300 mt-1 flex items-center gap-1.5 font-medium">
            <span>Leading Volume:</span>
            <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 font-bold text-[11px]">
              {pulse.topSector}
            </span>
          </div>
        </div>

        <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between font-medium">
          <span>Institutional Flow</span>
          <span className="text-trade-green font-bold">High Liquidity</span>
        </div>
      </div>

    </div>
  );
};
