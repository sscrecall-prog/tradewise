import React from 'react';
import { 
  TrendingUp, 
  PlusCircle, 
  History, 
  Download, 
  RotateCcw,
  Sparkles,
  Layers,
  Check,
  BookOpen
} from 'lucide-react';
import { DailySnapshot } from '../../types/tradepulse';

export interface TradePulseNavbarProps {
  activeSnapshot: DailySnapshot | null;
  snapshots: DailySnapshot[];
  onSelectSnapshot: (id: string) => void;
  onOpenAddModal: () => void;
  onOpenHistoryDrawer: () => void;
  onResetDefault: () => void;
  onExportCsv: () => void;
  totalStocks: number;
  indexSymbol: string;
  paperTradesCount: number;
  onOpenPaperModal: () => void;
  isLiveConnected?: boolean;
  lastLiveUpdate?: string | null;
  onRefreshLive?: () => void;
  isRefreshing?: boolean;
}

export const TradePulseNavbar: React.FC<TradePulseNavbarProps> = ({
  activeSnapshot,
  snapshots,
  onSelectSnapshot,
  onOpenAddModal,
  onOpenHistoryDrawer,
  onResetDefault,
  onExportCsv,
  totalStocks,
  indexSymbol,
  paperTradesCount,
  onOpenPaperModal,
  isLiveConnected = false,
  lastLiveUpdate = null,
  onRefreshLive,
  isRefreshing = false
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-dark-950/90 backdrop-blur-md border-b border-slate-200 dark:border-dark-800/80 px-4 lg:px-8 py-3 transition-all shadow-sm dark:shadow-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Brand & Market Status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-trade-green to-emerald-700 flex items-center justify-center shadow-lg shadow-trade-green/20 ring-1 ring-trade-green/40">
            <TrendingUp className="w-6 h-6 text-dark-950 stroke-[2.5]" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                <span className="text-trade-green font-mono">{indexSymbol || 'NIFTY 50'}</span> <span className="bg-gradient-to-r from-trade-green via-emerald-500 to-cyan-500 bg-clip-text text-transparent">Analysis Platform Pro</span>
              </h1>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                isLiveConnected 
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                  : 'bg-trade-green-bg text-trade-green border border-trade-green/30'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isLiveConnected ? 'bg-emerald-500 animate-pulse' : 'bg-trade-green'}`}></span>
                {isLiveConnected ? 'LIVE NSE FEED' : 'ACTIVE FEED'}
              </span>
            </div>
            
            <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2 font-medium flex-wrap">
              <span>{activeSnapshot?.dateStr || 'Live Market Bhavcopy'}</span>
              <span className="text-slate-400 dark:text-slate-600">•</span>
              <span className="text-slate-800 dark:text-slate-300 font-mono font-bold">{totalStocks} Equities Analyzed</span>
              {lastLiveUpdate && (
                <>
                  <span className="text-slate-400 dark:text-slate-600">•</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-bold">
                    Synced: {lastLiveUpdate}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Center: Quick Index Switcher (NIFTY 100 vs NIFTY 50) */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 p-1 rounded-xl">
          {snapshots.slice(0, 3).map(snap => {
            const isActive = snap.id === activeSnapshot?.id;
            const is100 = snap.stocksCount >= 90;
            const is50 = snap.stocksCount <= 60 && snap.stocksCount > 30;
            const label = is100 ? 'NIFTY 100' : is50 ? 'NIFTY 50' : snap.dateStr.slice(0, 12);

            return (
              <button
                key={snap.id}
                onClick={() => onSelectSnapshot(snap.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  isActive
                    ? 'bg-trade-green text-dark-950 shadow-md shadow-trade-green/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-dark-850'
                }`}
                title={`Switch to ${snap.dateStr} (${snap.stocksCount} stocks)`}
              >
                {isActive && <Check className="w-3 h-3 stroke-[3]" />}
                <span>{label}</span>
                <span className={`text-[9px] font-mono px-1 rounded font-bold ${
                  isActive ? 'bg-dark-950/20 text-dark-950' : 'bg-slate-200 dark:bg-dark-800 text-slate-700 dark:text-slate-400'
                }`}>
                  {snap.stocksCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
          {/* Sync Live NSE Button */}
          {onRefreshLive && (
            <button
              onClick={onRefreshLive}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/60 text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              title="Fetch real-time updated prices directly from NSE live feed"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Sync Live NSE'}</span>
            </button>
          )}

          {/* Paper Trading Book Button */}
          <button
            onClick={onOpenPaperModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-100 dark:bg-purple-950/50 hover:bg-purple-200 dark:hover:bg-purple-900/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800/60 text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
            title="Open 1-Click Paper Trading Book & Virtual Trade Tracker"
          >
            <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="hidden sm:inline">Paper Book</span>
            {paperTradesCount > 0 && (
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-purple-600 text-white dark:bg-purple-500 dark:text-dark-950">
                {paperTradesCount}
              </span>
            )}
          </button>

          {/* Add Daily Data Button (Prominent Call-to-Action) */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-trade-green hover:bg-trade-green-light text-dark-950 font-bold text-xs shadow-lg shadow-trade-green/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            title="Upload fresh daily Nifty 50, Nifty 100, Nifty 200 Bhavcopy CSV or paste data"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>+ Add / Upload CSV</span>
          </button>

          {/* History Snapshots */}
          <button
            onClick={onOpenHistoryDrawer}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-dark-850 hover:bg-slate-200 dark:hover:bg-dark-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-dark-700/70 text-xs font-semibold transition-all"
            title="View or switch between saved daily snapshots"
          >
            <History className="w-4 h-4 text-trade-blue" />
            <span className="hidden sm:inline">History ({snapshots.length})</span>
          </button>

          {/* Export Filtered Data */}
          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-dark-850 hover:bg-slate-200 dark:hover:bg-dark-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-dark-700/70 text-xs font-semibold transition-all"
            title="Download active stock table as CSV"
          >
            <Download className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Reset to Default */}
          <button
            onClick={onResetDefault}
            className="p-2 rounded-xl bg-slate-100 dark:bg-dark-850 hover:bg-slate-200 dark:hover:bg-dark-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-dark-700/70 text-xs transition-all"
            title="Reset storage to official Nifty datasets"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
