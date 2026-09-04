import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Card } from "../components/common/Card";
import { StatCard } from "../components/common/StatCard";
import { Badge } from "../components/common/Badge";
import { DisciplineGauge } from "../components/common/DisciplineGauge";
import {
  HeartHandshake,
  ShieldCheck,
  AlertTriangle,
  Smile,
  Zap,
  BookOpen,
  CheckCircle2,
  Sparkles,
  Award
} from "lucide-react";

export const PsychologyPage: React.FC = () => {
  const { discipline, analytics, journal } = useApp();

  const [activeMindset, setActiveMindset] = useState("Calm");

  const rules = [
    {
      title: "1. Respect the Stop Loss unconditionally",
      desc: "A small loss is an operational cost of trading. Shifting SL or averaging a losing position turns a controlled risk into account ruin."
    },
    {
      title: "2. Never Buy Out-of-the-Money Options for Hope",
      desc: "Far OTM options on expiry days have 95%+ probability of expiring worthless due to theta decay. Trade near-the-money or delta 0.5."
    },
    {
      title: "3. Maximum 2 to 3 Trades Per Day",
      desc: "Overtrading is the #1 wealth destroyer in India. Brokerage and STT will drain your capital even on breakeven days."
    },
    {
      title: "4. Circuit Breaker Rule (Max Daily Loss)",
      desc: "If your daily loss reaches your preset limit (e.g. ₹1,000 or 1-2% of capital), close the screen and walk away immediately."
    },
    {
      title: "5. No Revenge Trading After a Loss",
      desc: "The market does not owe you anything. When angry or frustrated, your brain enters fight-or-flight, making rational analysis impossible."
    },
    {
      title: "6. Wait for Candle Close Confirmation",
      desc: "Never anticipate breakouts inside the first 2 minutes of a candle. Institutional fakeouts trap impatient retail buyers."
    },
    {
      title: "7. Protect Your Profits (Trail Stop Loss)",
      desc: "When a trade moves 1.5R to 2R in your favor, immediately move your Stop Loss to breakeven. Never let a green trade turn red."
    },
    {
      title: "8. Avoid the 11:30 AM to 1:00 PM Mid-Day Chop",
      desc: "European and US markets are closed; Indian volume drops significantly. Premium erosion eats option buyers alive."
    },
    {
      title: "9. Process > Immediate Profit",
      desc: "A winning trade that broke rules is a bad trade. A losing trade that followed the system with strict SL is a successful trade."
    },
    {
      title: "10. Never Risk More Than 1-2% on a Single Trade",
      desc: "Survival is the prerequisite to profitability. With 1% risk per trade, you can survive a 10-trade losing streak and still recover."
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-text-primary tracking-tight">
          Psychology, Mindset & Discipline Hub
        </h2>
        <p className="text-xs text-text-secondary mt-0.5">
          Master the psychological edge: Overcome FOMO, eliminate revenge trading, and build institutional discipline
        </p>
      </div>

      {/* Top Discipline Hero Card */}
      <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="positive" size="sm">
              Process Guardian Active
            </Badge>
            <span className="text-xs text-text-muted">Trader Health Score</span>
          </div>
          <h3 className="text-2xl font-extrabold text-text-primary tracking-tight">
            Your Overall Discipline Score: {discipline.overallScore}/100
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed max-w-xl">
            Profitable trading is 80% emotional regulation and 20% setup analysis. Consistently executing your system without emotional deviation guarantees long-term compounding.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <span className="px-3 py-1 rounded-xl bg-bg-secondary border border-border-subtle text-xs text-text-secondary font-medium">
              Risk Adherence: <strong className="text-brand-positive">{discipline.riskManagementScore}%</strong>
            </span>
            <span className="px-3 py-1 rounded-xl bg-bg-secondary border border-border-subtle text-xs text-text-secondary font-medium">
              Stop Loss Integrity: <strong className="text-brand-positive">{discipline.stopLossDisciplineScore}%</strong>
            </span>
            <span className="px-3 py-1 rounded-xl bg-bg-secondary border border-border-subtle text-xs text-text-secondary font-medium">
              Overtrading Control: <strong className="text-brand-positive">{discipline.overtradingControlScore}%</strong>
            </span>
          </div>
        </div>

        <div className="flex-shrink-0 flex items-center justify-center p-4">
          <DisciplineGauge metrics={discipline} />
        </div>
      </div>

      {/* Behavioral Insights Feed */}
      <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand-accent" />
          <h3 className="text-base font-bold text-text-primary">
            Automated Behavioral Insights & Audit
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {analytics.behavioralInsights && analytics.behavioralInsights.length > 0 ? (
            analytics.behavioralInsights.map((insight, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-bg-secondary border border-border-subtle flex items-start gap-3 text-xs leading-relaxed text-text-primary"
              >
                <div className="p-1.5 rounded-lg bg-brand-accent/15 text-brand-accent flex-shrink-0 mt-0.5">
                  <Zap className="w-4 h-4" />
                </div>
                <span>{insight}</span>
              </div>
            ))
          ) : (
            <div className="text-xs text-text-muted p-4 col-span-2 text-center">
              Log at least 5 trades with setups and emotions to generate institutional behavioral audit insights.
            </div>
          )}
        </div>
      </div>

      {/* The 10 Commandments of Indian Trading */}
      <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-brand-accent" />
            <h3 className="text-base font-bold text-text-primary">
              The 10 Commandments of Indian Stock Market Trading
            </h3>
          </div>
          <Badge variant="accent" size="sm">NIFTY & BANKNIFTY Rules</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map((rule, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-bg-secondary border border-border-subtle hover:border-brand-accent/40 transition-all flex flex-col justify-between"
            >
              <h4 className="text-xs font-bold text-text-primary mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-positive flex-shrink-0" />
                {rule.title}
              </h4>
              <p className="text-xs text-text-muted leading-relaxed">{rule.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
