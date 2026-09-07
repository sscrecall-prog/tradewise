import React from "react";

interface DisciplineDoughnutChartProps {
  score?: number;
  promoters?: number;
  passives?: number;
  detractors?: number;
  className?: string;
}

export const DisciplineDoughnutChart: React.FC<DisciplineDoughnutChartProps> = ({
  score = 88,
  promoters = 75,
  passives = 14,
  detractors = 11,
  className = ""
}) => {
  const r = 64;
  const circumference = 2 * Math.PI * r;

  const total = promoters + passives + detractors || 100;
  const pPct = promoters / total;
  const passPct = passives / total;
  const dPct = detractors / total;

  const pLength = pPct * circumference;
  const passLength = passPct * circumference;
  const dLength = dPct * circumference;

  const pOffset = 0;
  const passOffset = -pLength;
  const dOffset = -(pLength + passLength);

  return (
    <div className={`p-5 rounded-3xl bg-dark-900 border border-border-subtle shadow-card-glow flex flex-col justify-between ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-xs font-extrabold text-text-primary uppercase tracking-wider">
            Trader Discipline & Psychology
          </h3>
          <p className="text-[11px] text-text-muted mt-0.5">
            Rule execution consistency & emotional control
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-brand-accent/15 border border-brand-accent/30 text-brand-accent text-xs font-black">
          Top 5% Tier
        </span>
      </div>

      {/* Tri-color Donut Chart */}
      <div className="relative flex items-center justify-center my-4">
        <svg className="w-44 h-44 transform -rotate-90" viewBox="0 0 160 160">
          {/* Background Track */}
          <circle
            cx="80"
            cy="80"
            r={r}
            stroke="#1c261c"
            strokeWidth="14"
            fill="transparent"
          />

          {/* Promoters Arc - Volt Lime (#b8f331) */}
          <circle
            cx="80"
            cy="80"
            r={r}
            stroke="#b8f331"
            strokeWidth="14"
            strokeDasharray={`${pLength} ${circumference - pLength}`}
            strokeDashoffset={pOffset}
            strokeLinecap="round"
            fill="transparent"
          />

          {/* Passives Arc - Sky Blue (#38bdf8) */}
          <circle
            cx="80"
            cy="80"
            r={r}
            stroke="#38bdf8"
            strokeWidth="14"
            strokeDasharray={`${passLength} ${circumference - passLength}`}
            strokeDashoffset={passOffset}
            strokeLinecap="round"
            fill="transparent"
          />

          {/* Detractors Arc - Coral Pink (#fb7185) */}
          <circle
            cx="80"
            cy="80"
            r={r}
            stroke="#fb7185"
            strokeWidth="14"
            strokeDasharray={`${dLength} ${circumference - dLength}`}
            strokeDashoffset={dOffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center Metric Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
            Execution Score
          </span>
          <span className="text-2xl font-black text-text-primary tracking-tight">
            {score}%
          </span>
          <span className="text-[10px] font-bold text-brand-positive">
            Consistent Edge
          </span>
        </div>
      </div>

      {/* Legend Rows matching the mockup */}
      <div className="space-y-2 pt-2 border-t border-white/5 text-xs">
        <div className="flex items-center justify-between p-2 rounded-2xl bg-dark-950/60 border border-white/5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-accent shadow-lime-sm" />
            <span className="text-zinc-300 font-medium">Clean Rule Execution</span>
          </div>
          <span className="font-extrabold text-brand-accent font-mono">{promoters}%</span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-2xl bg-dark-950/60 border border-white/5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-trade-blue" />
            <span className="text-zinc-300 font-medium">Controlled Scratches</span>
          </div>
          <span className="font-extrabold text-trade-blue font-mono">{passives}%</span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-2xl bg-dark-950/60 border border-white/5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-negative shadow-coral-glow" />
            <span className="text-zinc-300 font-medium">Impulsive / FOMO Mistakes</span>
          </div>
          <span className="font-extrabold text-brand-negative font-mono">{detractors}%</span>
        </div>
      </div>
    </div>
  );
};
