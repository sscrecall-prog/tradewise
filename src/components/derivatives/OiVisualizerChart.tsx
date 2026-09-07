import React, { useState } from "react";
import { OptionChainData, OptionStrikeRow } from "../../types";
import { BarChart3, Info } from "lucide-react";

interface OiVisualizerChartProps {
  data: OptionChainData;
}

export const OiVisualizerChart: React.FC<OiVisualizerChartProps> = ({ data }) => {
  const [selectedStrike, setSelectedStrike] = useState<OptionStrikeRow | null>(null);

  // Take the 15 strikes centered around ATM for clean visual comparison
  const atmIndex = data.strikes.findIndex(s => s.isAtm);
  const startIdx = Math.max(0, atmIndex - 7);
  const endIdx = Math.min(data.strikes.length, startIdx + 15);
  const visibleStrikes = data.strikes.slice(startIdx, endIdx);

  const maxOi = Math.max(
    ...visibleStrikes.map(s => Math.max(s.call.oi, s.put.oi)),
    1
  );

  const formatContracts = (val: number) => {
    if (val >= 100000) return `${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
    return val.toString();
  };

  return (
    <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border-subtle">
        <div>
          <h3 className="text-base font-extrabold text-text-primary flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand-accent" />
            Open Interest (OI) Distribution by Strike
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Compare Call OI (Red resistance) vs Put OI (Green support) to spot institutional boundaries.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-500 inline-block" />
            <span className="text-text-secondary font-semibold">Call OI (Resistance)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
            <span className="text-text-secondary font-semibold">Put OI (Support)</span>
          </div>
        </div>
      </div>

      {/* Bar Chart Container */}
      <div className="space-y-2">
        {visibleStrikes.map(s => {
          const callWidth = Math.round((s.call.oi / maxOi) * 100);
          const putWidth = Math.round((s.put.oi / maxOi) * 100);
          const isSelected = selectedStrike?.strikePrice === s.strikePrice;

          return (
            <div
              key={s.strikePrice}
              onClick={() => setSelectedStrike(s)}
              className={`grid grid-cols-12 items-center gap-2 py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
                s.isAtm
                  ? "bg-brand-accent/15 border border-brand-accent/40"
                  : isSelected
                  ? "bg-bg-secondary border border-border-subtle shadow-sm"
                  : "hover:bg-bg-secondary/60"
              }`}
            >
              {/* Call OI Bar (Right Aligned on the left side) */}
              <div className="col-span-5 flex items-center justify-end gap-2">
                <span className="text-[10px] font-mono font-bold text-text-muted hidden sm:inline">
                  {formatContracts(s.call.oi)}
                </span>
                <div className="w-full bg-bg-secondary h-4 rounded-l-md overflow-hidden flex justify-end">
                  <div
                    className="h-full bg-rose-500/80 hover:bg-rose-500 rounded-l-md transition-all duration-300"
                    style={{ width: `${callWidth}%` }}
                    title={`Call OI: ${s.call.oi.toLocaleString("en-IN")}`}
                  />
                </div>
              </div>

              {/* Strike Label (Center) */}
              <div className="col-span-2 text-center">
                <span
                  className={`text-xs font-mono font-black ${
                    s.isAtm ? "text-brand-accent text-sm" : "text-text-primary"
                  }`}
                >
                  {s.strikePrice}
                </span>
                {s.isAtm && (
                  <span className="block text-[9px] font-bold text-brand-accent font-sans uppercase leading-none">
                    ATM
                  </span>
                )}
              </div>

              {/* Put OI Bar (Left Aligned on the right side) */}
              <div className="col-span-5 flex items-center justify-start gap-2">
                <div className="w-full bg-bg-secondary h-4 rounded-r-md overflow-hidden flex justify-start">
                  <div
                    className="h-full bg-emerald-500/80 hover:bg-emerald-500 rounded-r-md transition-all duration-300"
                    style={{ width: `${putWidth}%` }}
                    title={`Put OI: ${s.put.oi.toLocaleString("en-IN")}`}
                  />
                </div>
                <span className="text-[10px] font-mono font-bold text-text-muted hidden sm:inline">
                  {formatContracts(s.put.oi)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Strike Inspector Drawer */}
      {selectedStrike && (
        <div className="p-4 rounded-2xl bg-bg-secondary border border-border-subtle animate-fade-in flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-text-primary">
                Strike {selectedStrike.strikePrice.toLocaleString("en-IN")} Detailed Net OI
              </span>
              {selectedStrike.isAtm && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-brand-accent/20 text-brand-accent font-black">
                  ATM
                </span>
              )}
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Net Bias:{" "}
              <b className={selectedStrike.put.oi >= selectedStrike.call.oi ? "text-emerald-400" : "text-rose-400"}>
                {selectedStrike.put.oi >= selectedStrike.call.oi
                  ? `+${(selectedStrike.put.oi - selectedStrike.call.oi).toLocaleString("en-IN")} Put Heavy (Support)`
                  : `+${(selectedStrike.call.oi - selectedStrike.put.oi).toLocaleString("en-IN")} Call Heavy (Resistance)`}
              </b>
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="p-2 rounded-xl bg-bg-card border border-border-subtle text-center min-w-[100px]">
              <span className="text-[10px] text-rose-400 block font-bold">Call LTP / OI</span>
              <span className="font-extrabold text-text-primary">₹{selectedStrike.call.ltp}</span>
              <span className="text-[10px] text-text-muted block">({formatContracts(selectedStrike.call.oi)})</span>
            </div>

            <div className="p-2 rounded-xl bg-bg-card border border-border-subtle text-center min-w-[100px]">
              <span className="text-[10px] text-emerald-400 block font-bold">Put LTP / OI</span>
              <span className="font-extrabold text-text-primary">₹{selectedStrike.put.ltp}</span>
              <span className="text-[10px] text-text-muted block">({formatContracts(selectedStrike.put.oi)})</span>
            </div>
          </div>
        </div>
      )}

      {/* Explainer Note */}
      <div className="p-3.5 rounded-2xl bg-bg-secondary/60 border border-border-subtle flex items-start gap-2.5 text-xs text-text-secondary">
        <Info className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
        <div>
          <b className="text-text-primary font-semibold">Pro Derivatives Rule:</b> Whenever Call OI heavily exceeds Put OI at a strike, that level behaves as a rigid ceiling. A breakout above this level forces call sellers to panic cover (`Short Covering`), sparking a violent short-squeeze rally.
        </div>
      </div>
    </div>
  );
};
