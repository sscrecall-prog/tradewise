import React from "react";
import { DisciplineMetrics } from "../../types";
import { ShieldCheck, Target, AlertTriangle, HeartHandshake, Zap } from "lucide-react";

interface DisciplineGaugeProps {
  metrics: DisciplineMetrics;
  className?: string;
}

export const DisciplineGauge: React.FC<DisciplineGaugeProps> = ({ metrics, className = "" }) => {
  const score = metrics.overallScore;
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let scoreColor = "#35C98A";
  let scoreBadge = "Disciplined Master";
  if (score < 60) {
    scoreColor = "#F05D5E";
    scoreBadge = "Needs Review";
  } else if (score < 80) {
    scoreColor = "#F2B84B";
    scoreBadge = "Developing Process";
  }

  const pillars = [
    { label: "Risk Management", score: metrics.riskManagementScore, icon: <ShieldCheck className="w-4 h-4 text-brand-accent" /> },
    { label: "Plan Adherence", score: metrics.planAdherenceScore, icon: <Target className="w-4 h-4 text-brand-positive" /> },
    { label: "Stop Loss Discipline", score: metrics.stopLossDisciplineScore, icon: <AlertTriangle className="w-4 h-4 text-blue-400" /> },
    { label: "Overtrading Control", score: metrics.overtradingControlScore, icon: <Zap className="w-4 h-4 text-purple-400" /> },
    { label: "Emotional Control", score: metrics.emotionalControlScore, icon: <HeartHandshake className="w-4 h-4 text-brand-warning" /> }
  ];

  return (
    <div className={`flex flex-col md:flex-row items-center gap-6 ${className}`}>
      {/* Circular Ring Gauge */}
      <div className="relative flex flex-col items-center justify-center flex-shrink-0">
        <svg className="w-36 h-36 transform -rotate-90">
          <circle
            cx="72"
            cy="72"
            r={radius}
            className="text-border-subtle/60"
            strokeWidth="10"
            stroke="currentColor"
            fill="transparent"
          />
          <circle
            cx="72"
            cy="72"
            r={radius}
            stroke={scoreColor}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold text-text-primary tracking-tight">{score}</span>
          <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">/ 100</span>
        </div>
        <span className="mt-2 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-border-subtle bg-bg-elevated text-text-primary">
          {scoreBadge}
        </span>
      </div>

      {/* 5-Factor Pillars Breakdown */}
      <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
        {pillars.map((pillar, idx) => (
          <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-bg-secondary border border-border-subtle/70">
            <div className="flex items-center gap-2">
              {pillar.icon}
              <span className="text-xs font-medium text-text-secondary">{pillar.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-accent rounded-full transition-all duration-500"
                  style={{ width: `${pillar.score}%` }}
                />
              </div>
              <span className="text-xs font-bold text-text-primary w-7 text-right">{pillar.score}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};