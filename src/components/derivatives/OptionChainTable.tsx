import React from "react";
import { OptionChainData, OptionStrikeRow, OptionBuildUpType } from "../../types";
import { useApp } from "../../context/AppContext";
import { Layers, ArrowUpRight, ArrowDownRight, Zap } from "lucide-react";

interface OptionChainTableProps {
  data: OptionChainData;
}

export const OptionChainTable: React.FC<OptionChainTableProps> = ({ data }) => {
  const { setIsNewTradeModalOpen } = useApp();

  const maxCallOi = Math.max(...data.strikes.map(s => s.call.oi), 1);
  const maxPutOi = Math.max(...data.strikes.map(s => s.put.oi), 1);

  const getBuildUpBadge = (type: OptionBuildUpType) => {
    switch (type) {
      case "LONG_BUILDUP":
        return {
          label: "Long Build-up",
          shortLabel: "LB",
          className: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
        };
      case "SHORT_BUILDUP":
        return {
          label: "Short Build-up",
          shortLabel: "SB",
          className: "bg-rose-500/20 text-rose-300 border-rose-500/30"
        };
      case "SHORT_COVERING":
        return {
          label: "Short Covering",
          shortLabel: "SC",
          className: "bg-amber-500/20 text-amber-300 border-amber-500/30"
        };
      case "LONG_UNWINDING":
        return {
          label: "Long Unwinding",
          shortLabel: "LU",
          className: "bg-slate-500/20 text-slate-300 border-slate-500/30"
        };
    }
  };

  const handleStrikeClick = (strike: number, optionType: "CE" | "PE") => {
    // Open NewTradeModal for quick journal / execution prefill
    setIsNewTradeModalOpen(true);
  };

  return (
    <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
      {/* Table Header & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
        <div>
          <h3 className="text-base font-extrabold text-text-primary flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-accent" />
            Live Option Chain Matrix ({data.underlyingName} • Expiry: {data.expiryDate})
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Click any Call or Put contract to log a paper execution or journal entry.
          </p>
        </div>

        {/* Build-Up Legend Pills */}
        <div className="flex items-center gap-2 text-[10px] font-bold flex-wrap">
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            ● Long Build-up (Bullish)
          </span>
          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
            ● Short Build-up (Writing)
          </span>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            ● Short Covering (Squeeze)
          </span>
          <span className="px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-300 border border-slate-500/30">
            ● Long Unwinding (Exit)
          </span>
        </div>
      </div>

      {/* Option Chain Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-center text-xs min-w-[950px] border-collapse">
          <thead>
            {/* Top Super-headers */}
            <tr className="border-b border-border-subtle">
              <th colSpan={5} className="py-2 bg-rose-500/10 text-rose-400 font-extrabold text-xs uppercase tracking-wider rounded-tl-2xl">
                CALL OPTIONS (CE) — RESISTANCE ZONE
              </th>
              <th className="py-2 bg-bg-secondary text-text-primary font-black text-xs uppercase tracking-wider">
                STRIKE
              </th>
              <th colSpan={5} className="py-2 bg-emerald-500/10 text-emerald-400 font-extrabold text-xs uppercase tracking-wider rounded-tr-2xl">
                PUT OPTIONS (PE) — SUPPORT ZONE
              </th>
            </tr>
            {/* Column subheaders */}
            <tr className="border-b border-border-subtle text-[11px] font-bold uppercase tracking-wider text-text-muted bg-bg-secondary/40">
              <th className="py-2 px-2 text-left">OI (Contracts)</th>
              <th className="py-2 px-2">Chg in OI</th>
              <th className="py-2 px-2">Build-up</th>
              <th className="py-2 px-2">LTP (₹)</th>
              <th className="py-2 px-2">IV</th>

              <th className="py-2 px-4 bg-bg-secondary text-text-primary font-black">
                STRIKE
              </th>

              <th className="py-2 px-2">IV</th>
              <th className="py-2 px-2">LTP (₹)</th>
              <th className="py-2 px-2">Build-up</th>
              <th className="py-2 px-2">Chg in OI</th>
              <th className="py-2 px-2 text-right">OI (Contracts)</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border-subtle/40 font-mono text-[11px]">
            {data.strikes.map(s => {
              const callBadge = getBuildUpBadge(s.call.buildUp);
              const putBadge = getBuildUpBadge(s.put.buildUp);

              const callDepthPercent = Math.min(100, Math.round((s.call.oi / maxCallOi) * 100));
              const putDepthPercent = Math.min(100, Math.round((s.put.oi / maxPutOi) * 100));

              const isMaxPain = s.strikePrice === data.maxPainStrike;
              const isCallWall = s.strikePrice === data.highestCallOiStrike;
              const isPutWall = s.strikePrice === data.highestPutOiStrike;

              return (
                <tr
                  key={s.strikePrice}
                  className={`transition-colors group ${
                    s.isAtm
                      ? "bg-brand-accent/15 border-y-2 border-brand-accent/50 font-bold"
                      : "hover:bg-bg-secondary/60"
                  }`}
                >
                  {/* CALLS: OI with depth bar */}
                  <td
                    onClick={() => handleStrikeClick(s.strikePrice, "CE")}
                    className="py-2 px-2 text-left relative cursor-pointer group-hover:underline"
                    title={`Trade ${s.strikePrice} CE`}
                  >
                    <div
                      className="absolute inset-y-1 left-0 bg-rose-500/10 rounded-r transition-all pointer-events-none"
                      style={{ width: `${callDepthPercent}%` }}
                    />
                    <span className="relative z-10 font-bold text-text-primary">
                      {s.call.oi.toLocaleString("en-IN")}
                    </span>
                    {isCallWall && (
                      <span className="ml-1.5 px-1 py-0.2 rounded bg-rose-500 text-white font-black text-[9px]">
                        WALL
                      </span>
                    )}
                  </td>

                  {/* CALLS: Chg OI */}
                  <td className="py-2 px-2">
                    <span
                      className={`font-semibold ${
                        s.call.changeOi >= 0 ? "text-brand-positive" : "text-brand-negative"
                      }`}
                    >
                      {s.call.changeOi >= 0 ? "+" : ""}
                      {s.call.changeOi.toLocaleString("en-IN")}
                    </span>
                  </td>

                  {/* CALLS: Build-up */}
                  <td className="py-2 px-1">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold border font-sans ${callBadge.className}`}
                    >
                      {callBadge.shortLabel}
                    </span>
                  </td>

                  {/* CALLS: LTP */}
                  <td
                    onClick={() => handleStrikeClick(s.strikePrice, "CE")}
                    className="py-2 px-2 font-bold cursor-pointer text-text-primary hover:text-brand-accent"
                  >
                    <div>₹{s.call.ltp.toFixed(2)}</div>
                    <div
                      className={`text-[9px] ${
                        s.call.change >= 0 ? "text-brand-positive" : "text-brand-negative"
                      }`}
                    >
                      {s.call.change >= 0 ? "+" : ""}
                      {s.call.change.toFixed(2)}
                    </div>
                  </td>

                  {/* CALLS: IV */}
                  <td className="py-2 px-2 text-text-muted">{s.call.iv}%</td>

                  {/* CENTER: STRIKE PRICE */}
                  <td className={`py-2 px-4 bg-bg-secondary/80 font-black text-xs select-none ${
                    s.isAtm ? "text-brand-accent text-sm" : "text-text-primary"
                  }`}>
                    <div className="flex items-center justify-center gap-1.5">
                      <span>{s.strikePrice.toLocaleString("en-IN")}</span>
                      {s.isAtm && (
                        <span className="px-1.5 py-0.2 rounded-full bg-brand-accent text-bg-primary font-black text-[9px]">
                          ATM
                        </span>
                      )}
                      {isMaxPain && (
                        <span className="px-1.5 py-0.2 rounded-full bg-purple-500 text-white font-black text-[9px]" title="Expiry Max Pain">
                          MP
                        </span>
                      )}
                    </div>
                  </td>

                  {/* PUTS: IV */}
                  <td className="py-2 px-2 text-text-muted">{s.put.iv}%</td>

                  {/* PUTS: LTP */}
                  <td
                    onClick={() => handleStrikeClick(s.strikePrice, "PE")}
                    className="py-2 px-2 font-bold cursor-pointer text-text-primary hover:text-brand-accent"
                  >
                    <div>₹{s.put.ltp.toFixed(2)}</div>
                    <div
                      className={`text-[9px] ${
                        s.put.change >= 0 ? "text-brand-positive" : "text-brand-negative"
                      }`}
                    >
                      {s.put.change >= 0 ? "+" : ""}
                      {s.put.change.toFixed(2)}
                    </div>
                  </td>

                  {/* PUTS: Build-up */}
                  <td className="py-2 px-1">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold border font-sans ${putBadge.className}`}
                    >
                      {putBadge.shortLabel}
                    </span>
                  </td>

                  {/* PUTS: Chg OI */}
                  <td className="py-2 px-2">
                    <span
                      className={`font-semibold ${
                        s.put.changeOi >= 0 ? "text-brand-positive" : "text-brand-negative"
                      }`}
                    >
                      {s.put.changeOi >= 0 ? "+" : ""}
                      {s.put.changeOi.toLocaleString("en-IN")}
                    </span>
                  </td>

                  {/* PUTS: OI with depth bar */}
                  <td
                    onClick={() => handleStrikeClick(s.strikePrice, "PE")}
                    className="py-2 px-2 text-right relative cursor-pointer group-hover:underline"
                    title={`Trade ${s.strikePrice} PE`}
                  >
                    <div
                      className="absolute inset-y-1 right-0 bg-emerald-500/10 rounded-l transition-all pointer-events-none"
                      style={{ width: `${putDepthPercent}%` }}
                    />
                    {isPutWall && (
                      <span className="mr-1.5 px-1 py-0.2 rounded bg-emerald-500 text-white font-black text-[9px]">
                        FLOOR
                      </span>
                    )}
                    <span className="relative z-10 font-bold text-text-primary">
                      {s.put.oi.toLocaleString("en-IN")}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
