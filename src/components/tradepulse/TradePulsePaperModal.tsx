import React from 'react';
import { PaperTrade, AnalyzedStock } from '../../types/tradepulse';
import { 
  X, 
  FileText, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  Clock, 
  Zap,
  Target,
  ShieldAlert
} from 'lucide-react';

export interface TradePulsePaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  trades: PaperTrade[];
  stocks: AnalyzedStock[];
  onDeleteTrade: (id: string) => void;
  onSelectStock: (stock: AnalyzedStock) => void;
}

export const TradePulsePaperModal: React.FC<TradePulsePaperModalProps> = ({
  isOpen,
  onClose,
  trades,
  stocks,
  onDeleteTrade,
  onSelectStock
}) => {
  if (!isOpen) return null;

  // Build live P&L for each paper trade
  const stockMap = new Map<string, AnalyzedStock>();
  stocks.forEach(s => stockMap.set(s.symbol, s));

  let totalRealizedOrUnrealizedPnl = 0;
  let totalCapitalDeployed = 0;
  let winningTradesCount = 0;

  const enrichedTrades = trades.map(trade => {
    const liveStock = stockMap.get(trade.symbol);
    const curPrice = liveStock ? liveStock.ltp : trade.entryPrice;
    const isBuy = trade.action === 'BUY';
    const pnlPerShare = isBuy ? curPrice - trade.entryPrice : trade.entryPrice - curPrice;
    const totalPnl = pnlPerShare * trade.quantity;
    const pnlPercent = trade.entryPrice > 0 ? (pnlPerShare / trade.entryPrice) * 100 : 0;

    totalRealizedOrUnrealizedPnl += totalPnl;
    totalCapitalDeployed += trade.totalCapital;
    if (totalPnl > 0) winningTradesCount++;

    return {
      ...trade,
      curPrice,
      totalPnl,
      pnlPercent,
      liveStock
    };
  });

  const winRate = trades.length > 0 ? (winningTradesCount / trades.length) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-dark-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className="glass-panel rounded-3xl w-full max-w-3xl overflow-hidden border border-slate-200 dark:border-dark-700/80 shadow-2xl flex flex-col max-h-[88vh] bg-white dark:bg-dark-900"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-dark-800 flex items-center justify-between bg-slate-50 dark:bg-dark-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-trade-green/10 border border-trade-green/30 flex items-center justify-center text-trade-green">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                Paper Trading Book
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-dark-800 text-slate-700 dark:text-slate-300 font-normal font-mono border border-slate-200 dark:border-dark-700">
                  {trades.length} Active Orders
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track simulated setup execution, test rules, and verify strategy win-rate without real risk
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Summary Bar */}
        <div className="p-4 bg-slate-50 dark:bg-dark-900/60 border-b border-slate-200 dark:border-dark-800 grid grid-cols-3 gap-3 font-mono text-center">
          <div className="p-2.5 rounded-xl bg-white dark:bg-dark-950 border border-slate-200 dark:border-dark-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans block">Total Virtual P&L</span>
            <span className={`text-base font-extrabold ${
              totalRealizedOrUnrealizedPnl >= 0 ? 'text-trade-green' : 'text-trade-red'
            }`}>
              {totalRealizedOrUnrealizedPnl >= 0 ? '+' : ''}₹{totalRealizedOrUnrealizedPnl.toFixed(0)}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-dark-950 border border-slate-200 dark:border-dark-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans block">Win Rate %</span>
            <span className="text-base font-extrabold text-cyan-600 dark:text-cyan-400">
              {winRate.toFixed(1)}%
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-dark-950 border border-slate-200 dark:border-dark-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans block">Capital Deployed</span>
            <span className="text-base font-extrabold text-slate-900 dark:text-slate-200">
              ₹{totalCapitalDeployed.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* Trade Orders List */}
        <div className="p-5 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
          {enrichedTrades.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-sans text-xs">
              No paper trades logged yet. Click "Analyze" on any confirmed setup and press "Take Simulated Paper Trade"!
            </div>
          ) : (
            enrichedTrades.map(t => {
              const isProfit = t.totalPnl >= 0;

              return (
                <div
                  key={t.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-900/80 border border-slate-200 dark:border-dark-800 hover:border-slate-300 dark:hover:border-dark-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span 
                        onClick={() => t.liveStock && onSelectStock(t.liveStock)}
                        className="font-bold text-sm text-slate-900 dark:text-white font-mono hover:text-trade-green cursor-pointer transition-colors"
                      >
                        {t.symbol}
                      </span>
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                        t.action === 'BUY' ? 'bg-trade-green/20 text-trade-green' : 'bg-trade-red/20 text-trade-red'
                      }`}>
                        {t.action}
                      </span>
                      <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono">
                        {t.quantity} shares @ ₹{t.entryPrice.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans">
                        • {t.dateStr}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono text-slate-700 dark:text-slate-300 mt-1.5">
                      <span>SL: <strong className="text-rose-600 dark:text-rose-400">₹{t.stopLoss.toFixed(2)}</strong></span>
                      <span className="text-slate-300 dark:text-slate-600">|</span>
                      <span>Target: <strong className="text-trade-green">₹{t.target1.toFixed(2)}</strong></span>
                      <span className="text-slate-300 dark:text-slate-600">|</span>
                      <span>LTP: <strong className="text-slate-900 dark:text-white">₹{t.curPrice.toFixed(2)}</strong></span>
                    </div>

                    {t.notes && (
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                        {t.notes}
                      </div>
                    )}
                  </div>

                  {/* P&L Badge & Delete */}
                  <div className="flex items-center gap-3 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 dark:border-dark-800">
                    <div className="text-right font-mono">
                      <div className={`text-sm font-bold flex items-center gap-0.5 justify-end ${
                        isProfit ? 'text-trade-green' : 'text-trade-red'
                      }`}>
                        {isProfit ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        <span>{isProfit ? '+' : ''}₹{t.totalPnl.toFixed(0)}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        ({isProfit ? '+' : ''}{t.pnlPercent.toFixed(2)}%)
                      </span>
                    </div>

                    <button
                      onClick={() => onDeleteTrade(t.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-trade-red hover:bg-slate-200 dark:hover:bg-dark-800 transition-colors"
                      title="Remove Trade"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-900/90 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Orders persist in browser storage</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-dark-800 dark:hover:bg-dark-700 dark:text-white font-semibold transition-colors"
          >
            Close Book
          </button>
        </div>

      </div>
    </div>
  );
};
