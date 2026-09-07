import React from "react";
import { OptionChainData } from "../../types";
import { RotateCw, TrendingUp, TrendingDown, Calendar, Layers, ShieldCheck } from "lucide-react";

interface DerivativesHeaderProps {
  data: OptionChainData;
  selectedUnderlying: 'NIFTY' | 'BANKNIFTY' | 'FINNIFTY' | 'SENSEX';
  onSelectUnderlying: (underlying: 'NIFTY' | 'BANKNIFTY' | 'FINNIFTY' | 'SENSEX') => void;
  selectedExpiry: string;
  onSelectExpiry: (expiry: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const DerivativesHeader: React.FC<DerivativesHeaderProps> = ({
  data,
  selectedUnderlying,
  onSelectUnderlying,
  selectedExpiry,
  onSelectExpiry,
  onRefresh,
  isRefreshing
}) => {
  const underlyings: { id: 'NIFTY' | 'BANKNIFTY' | 'FINNIFTY' | 'SENSEX'; label: string; lotSize: number }[] = [
    { id: 'NIFTY', label: 'NIFTY 50', lotSize: 25 },
    { id: 'BANKNIFTY', label: 'BANK NIFTY', lotSize: 15 },
    { id: 'FINNIFTY', label: 'FINNIFTY', lotSize: 25 },
    { id: 'SENSEX', label: 'BSE SENSEX', lotSize: 10 }
  ];

  const isPositive = data.spotChange >= 0;

  return (
    <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-sm space-y-5">
      {/* Top Title & Live Sync Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accent/15 border border-brand-accent/30 text-brand-accent text-xs font-black uppercase tracking-wider mb-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>F&amp;O Derivatives Edge • Institutional OI Matrix</span>
          </div>
          <h2 className="text-2xl font-black text-text-primary tracking-tight">
            Live Option Chain &amp; Derivatives Engine
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Real-time Open Interest build-up, Put-Call Ratio (PCR), Expiry Max Pain, and India VIX dynamic risk scaling
          </p>
        </div>

        {/* Live Status & Refresh Button */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold select-none">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>NSE Live • {data.lastUpdated}</span>
          </div>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-full bg-bg-secondary border border-border-subtle text-text-secondary hover:text-brand-accent hover:bg-bg-elevated transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            title="Refresh Option Chain & Open Interest"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-brand-accent" : ""}`} />
          </button>
        </div>
      </div>

      {/* Index Selector Tabs & Expiry Dropdown Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2 border-t border-border-subtle">
        {/* Underlying Index Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {underlyings.map(u => (
            <button
              key={u.id}
              onClick={() => onSelectUnderlying(u.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                selectedUnderlying === u.id
                  ? "bg-brand-accent text-bg-primary shadow-md shadow-lime-400/20 scale-[1.02]"
                  : "bg-bg-secondary text-text-secondary hover:text-text-primary hover:bg-bg-elevated border border-border-subtle"
              }`}
            >
              <span>{u.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                selectedUnderlying === u.id ? "bg-bg-primary text-brand-accent font-bold" : "bg-bg-elevated text-text-muted"
              }`}>
                {u.lotSize} Qty/Lot
              </span>
            </button>
          ))}
        </div>

        {/* Expiry Selector & Spot Quick Stats */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Expiry Dropdown */}
          <div className="flex items-center gap-2 bg-bg-secondary px-3 py-1.5 rounded-2xl border border-border-subtle">
            <Calendar className="w-3.5 h-3.5 text-text-muted" />
            <span className="text-xs text-text-muted font-semibold">Expiry:</span>
            <select
              value={selectedExpiry}
              onChange={e => onSelectExpiry(e.target.value)}
              className="bg-transparent text-xs font-bold text-text-primary focus:outline-none cursor-pointer"
            >
              {data.availableExpiries.map(exp => (
                <option key={exp} value={exp} className="bg-bg-card text-text-primary">
                  {exp}
                </option>
              ))}
            </select>
          </div>

          {/* Spot Price Pill */}
          <div className="flex items-center gap-2 bg-bg-secondary px-3.5 py-1.5 rounded-2xl border border-border-subtle">
            <span className="text-[11px] text-text-muted font-bold">Spot:</span>
            <span className="text-sm font-black font-mono text-text-primary">
              ₹{data.spotPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
            <span
              className={`inline-flex items-center text-xs font-bold font-mono ${
                isPositive ? "text-brand-positive" : "text-brand-negative"
              }`}
            >
              {isPositive ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
              {isPositive ? "+" : ""}
              {data.spotChange.toFixed(2)} ({isPositive ? "+" : ""}
              {data.spotChangePercent}%)
            </span>
          </div>

          {/* Futures Basis Pill */}
          <div className="hidden sm:flex items-center gap-1.5 bg-bg-secondary px-3 py-1.5 rounded-2xl border border-border-subtle text-[11px] text-text-muted">
            <span>Fut:</span>
            <span className="font-mono font-bold text-text-primary">
              ₹{data.futuresPrice.toLocaleString("en-IN")}
            </span>
            <span className="text-brand-positive font-mono font-semibold">
              (+{data.futuresBasis.toFixed(1)} pts premium)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
