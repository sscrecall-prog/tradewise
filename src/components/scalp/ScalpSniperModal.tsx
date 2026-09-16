import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useMarketData } from '../../context/MarketDataContext';
import { useApp } from '../../context/AppContext';
import {
  ScalpSniperService,
  ScalpCandidate,
  DailyScalpState
} from '../../services/ScalpSniperService';
import { AudioService } from '../../services/AudioService';
import {
  Zap,
  ShieldCheck,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  AlertTriangle,
  Flame,
  CheckCircle2,
  RefreshCw,
  Play,
  Square,
  Sparkles,
  Info,
  DollarSign
} from 'lucide-react';

interface ScalpSniperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScalpSniperModal: React.FC<ScalpSniperModalProps> = ({ isOpen, onClose }) => {
  const { quotes, openStockModal } = useMarketData();
  const {
    placePaperOrder,
    setIsNewTradeModalOpen,
    openAnalyticsTab
  } = useApp();

  // Presets State
  const [capital, setCapital] = useState<number>(100000);
  const [targetGoal, setTargetGoal] = useState<number>(2000);
  const [riskCap, setRiskCap] = useState<number>(1000);
  const [candidates, setCandidates] = useState<ScalpCandidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<ScalpCandidate | null>(null);

  // Daily Shield State
  const [dailyState, setDailyState] = useState<DailyScalpState>(ScalpSniperService.getDailyScalpState());
  const [overrideShield, setOverrideShield] = useState<boolean>(false);

  // Live 10-30 Minute Stopwatch State
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);

  // Refresh candidates on quotes change or preset change
  useEffect(() => {
    if (!isOpen) return;
    const items = ScalpSniperService.scanScalpCandidates(quotes, capital, targetGoal, riskCap);
    setCandidates(items);
    if (items.length > 0 && (!selectedCandidate || !items.find(c => c.symbol === selectedCandidate.symbol))) {
      setSelectedCandidate(items[0]);
    }
  }, [isOpen, quotes, capital, targetGoal, riskCap]);

  // Daily state reload
  useEffect(() => {
    if (isOpen) {
      setDailyState(ScalpSniperService.getDailyScalpState());
    }
  }, [isOpen]);

  // Stopwatch Interval
  useEffect(() => {
    let interval: any = null;
    if (timerActive) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          const next = prev + 1;
          // Trigger audio chime at key minute milestones
          if (next === 600) { // 10 mins
            AudioService.playOrderChime();
          } else if (next === 1200) { // 20 mins
            AudioService.playErrorSound();
          } else if (next === 1800) { // 30 mins
            AudioService.playErrorSound();
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const elapsedMinutes = Math.floor(timerSeconds / 60);
  const remainingSeconds = timerSeconds % 60;
  const currentPhase = ScalpSniperService.getTimerPhase(elapsedMinutes);

  const formatTimer = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleStartTimer = () => {
    setTimerSeconds(0);
    setTimerActive(true);
    AudioService.playOrderChime();
  };

  const handleStopTimer = () => {
    setTimerActive(false);
  };

  const handleResetTimer = () => {
    setTimerActive(false);
    setTimerSeconds(0);
  };

  // 1-Click Paper Scalp Execution
  const handleExecutePaperScalp = (candidate: ScalpCandidate) => {
    const isLong = candidate.direction === 'BUY';
    placePaperOrder({
      stockSymbol: candidate.symbol,
      stockName: candidate.name,
      direction: candidate.direction,
      orderType: 'MARKET',
      productType: 'INTRADAY (MIS)',
      quantity: candidate.recommendedQuantity,
      price: candidate.price,
      stopLoss: candidate.stopLossPrice,
      targetPrice: candidate.target1Price
    });

    // Mark daily scalp executed
    ScalpSniperService.markDailyScalpExecuted(candidate.symbol, candidate.expectedNetProfit1, 'WIN');
    setDailyState(ScalpSniperService.getDailyScalpState());

    // Auto-start 30-min stopwatch
    handleStartTimer();
  };

  const isLocked = dailyState.hasExecutedToday && !overrideShield;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-sm shadow-amber-500/20">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-text-primary tracking-wide">
                10–30 Min Scalp Sniper
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-400 border border-amber-500/30">
                ₹1L Blueprint
              </span>
            </div>
          </div>
        </div>
      }
      subtitle="High-Beta 15M ORB & Momentum Scanner • Asymmetric 1:2 R:R • Indian Markets"
      maxWidth="4xl"
    >
      <div className="space-y-6 text-xs text-text-secondary">
        {/* DAILY "ONE & DONE" OVERTRADING SHIELD BANNER */}
        {isLocked ? (
          <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/15 via-bg-secondary to-bg-card border-2 border-amber-500/40 shadow-xl space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <span>One &amp; Done Rule Active — Today's 1 Scalp Concluded</span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-brand-positive/20 text-brand-positive border border-brand-positive/30">
                🛡️ Capital Protected
              </span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              You have already executed today's high-probability trade on <span className="text-text-primary font-bold">{dailyState.tradeSymbol}</span> at {dailyState.timestamp}. 
              Professional prop-desk rule: <strong className="text-amber-300">"Never give back morning profits to the market."</strong> Overtrading is the #1 reason retail accounts fail.
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-border-subtle/50 flex-wrap gap-2">
              <span className="text-[11px] text-text-muted">Come back fresh for tomorrow's 9:15 AM opening session.</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOverrideShield(true)}
                className="text-xs"
              >
                Practice Simulation Mode
              </Button>
            </div>
          </div>
        ) : null}

        {/* PRESET CONFIGURATION BAR */}
        <div className="p-4 rounded-3xl bg-bg-secondary border border-border-subtle grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          {/* Capital Preset */}
          <div>
            <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Account Capital (₹)</span>
              <span className="text-brand-positive font-extrabold">5x MIS: ₹{(capital * 5).toLocaleString('en-IN')}</span>
            </label>
            <div className="flex items-center gap-1.5">
              {[50000, 100000, 200000].map(amt => (
                <button
                  key={amt}
                  onClick={() => setCapital(amt)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    capital === amt
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                      : 'bg-bg-elevated text-text-secondary border-border-subtle hover:text-text-primary'
                  }`}
                >
                  ₹{(amt / 100000).toFixed(amt >= 100000 ? 0 : 1)}L
                </button>
              ))}
            </div>
          </div>

          {/* Target Profit Preset */}
          <div>
            <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Target Profit</span>
              <span className="text-amber-400 font-black">+₹{targetGoal.toLocaleString('en-IN')}</span>
            </label>
            <div className="flex items-center gap-1.5">
              {[1500, 2000, 3000].map(tg => (
                <button
                  key={tg}
                  onClick={() => setTargetGoal(tg)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    targetGoal === tg
                      ? 'bg-brand-positive/20 text-brand-positive border-brand-positive/50 shadow-sm'
                      : 'bg-bg-elevated text-text-secondary border-border-subtle hover:text-text-primary'
                  }`}
                >
                  +₹{tg}
                </button>
              ))}
            </div>
          </div>

          {/* Risk Limit Preset */}
          <div>
            <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Max Risk Cap (1:2 R:R)</span>
              <span className="text-brand-negative font-black">-₹{riskCap.toLocaleString('en-IN')}</span>
            </label>
            <div className="flex items-center gap-1.5">
              {[800, 1000].map(rk => (
                <button
                  key={rk}
                  onClick={() => setRiskCap(rk)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    riskCap === rk
                      ? 'bg-brand-negative/20 text-brand-negative border-brand-negative/50 shadow-sm'
                      : 'bg-bg-elevated text-text-secondary border-border-subtle hover:text-text-primary'
                  }`}
                >
                  -₹{rk}
                </button>
              ))}
              <div className="px-2.5 py-1 rounded-xl bg-bg-elevated border border-border-subtle text-[10px] font-black text-amber-300 flex items-center justify-center">
                1:{(targetGoal / riskCap).toFixed(1)} R:R
              </div>
            </div>
          </div>
        </div>

        {/* 10-30 MINUTE LIVE STOPWATCH & PHASE GAUGE */}
        <div className="p-4 rounded-3xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="font-extrabold text-xs text-text-primary uppercase tracking-wide">
                10–30 Minute Momentum Stopwatch
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-black text-amber-400 bg-bg-secondary px-3 py-1 rounded-xl border border-border-subtle">
                ⏱️ {formatTimer(timerSeconds)}
              </span>
              {!timerActive ? (
                <button
                  onClick={handleStartTimer}
                  className="px-3 py-1 rounded-xl bg-brand-positive hover:bg-brand-positive/90 text-dark-950 font-extrabold text-xs flex items-center gap-1 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start</span>
                </button>
              ) : (
                <button
                  onClick={handleStopTimer}
                  className="px-3 py-1 rounded-xl bg-brand-negative hover:bg-brand-negative/90 text-white font-extrabold text-xs flex items-center gap-1 transition-all"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Pause</span>
                </button>
              )}
              <button
                onClick={handleResetTimer}
                className="p-1.5 rounded-xl hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-colors"
                title="Reset Timer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 3-Phase Color Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className={currentPhase.phaseColor.split(' ')[0]}>
                {currentPhase.statusBadge}
              </span>
              <span className="text-text-muted text-[10px]">
                {elapsedMinutes < 30 ? `${30 - elapsedMinutes} mins left before force exit` : 'Time Expired'}
              </span>
            </div>
            {/* Visual Phase Progress */}
            <div className="h-2 w-full bg-bg-secondary rounded-full overflow-hidden flex border border-border-subtle">
              <div
                className={`transition-all duration-300 ${
                  elapsedMinutes < 10
                    ? 'bg-emerald-400 shadow-sm shadow-emerald-400/30'
                    : elapsedMinutes < 20
                    ? 'bg-amber-400 shadow-sm shadow-amber-400/30'
                    : 'bg-rose-500 shadow-sm shadow-rose-500/30'
                }`}
                style={{ width: `${Math.min(100, (timerSeconds / 1800) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-text-muted leading-relaxed">
              💡 <strong>Phase Rule:</strong> {currentPhase.actionGuideline}
            </p>
          </div>
        </div>

        {/* TOP 3-5 RANKED SCALP CANDIDATES */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <span className="font-extrabold text-xs text-text-primary uppercase tracking-wide">
                Live High-Beta Scalp Setups (Top {candidates.length} Ranked)
              </span>
            </div>
            <span className="text-[11px] text-text-muted">
              Auto-calibrated for ₹{(capital).toLocaleString('en-IN')} capital &amp; 5x MIS
            </span>
          </div>

          {candidates.length === 0 ? (
            <div className="p-8 rounded-3xl bg-bg-secondary border border-border-subtle text-center text-text-muted">
              <Sparkles className="w-6 h-6 mx-auto mb-2 text-text-muted/50" />
              <p className="font-bold text-xs">No 10-30 min candidates matching strict high-beta criteria right now.</p>
              <p className="text-[11px] mt-1">Wait for the 9:15–9:45 AM opening momentum window when RVOL peaks.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {candidates.map(candidate => {
                const isSelected = selectedCandidate?.symbol === candidate.symbol;
                const isLong = candidate.direction === 'BUY';

                return (
                  <div
                    key={candidate.symbol}
                    onClick={() => setSelectedCandidate(candidate)}
                    className={`p-4 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'bg-bg-secondary border-amber-500/60 shadow-lg shadow-amber-500/10 scale-[1.01]'
                        : 'bg-bg-card border-border-subtle hover:border-amber-500/30 hover:bg-bg-elevated'
                    }`}
                  >
                    {/* Header: Symbol, Name, Price, Beta Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-text-primary tracking-wide">
                            {candidate.symbol}
                          </span>
                          <Badge
                            variant={isLong ? 'positive' : 'negative'}
                            size="sm"
                          >
                            {candidate.direction}
                          </Badge>
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            {candidate.beta}x Beta
                          </span>
                        </div>
                        <div className="text-[11px] text-text-muted truncate max-w-[180px] mt-0.5">
                          {candidate.name} • {candidate.sector}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-black text-sm text-text-primary">
                          ₹{candidate.price.toFixed(2)}
                        </div>
                        <div
                          className={`text-[10px] font-extrabold ${
                            candidate.changePercent >= 0 ? 'text-brand-positive' : 'text-brand-negative'
                          }`}
                        >
                          {candidate.changePercent >= 0 ? '+' : ''}{candidate.changePercent.toFixed(2)}%
                        </div>
                      </div>
                    </div>

                    {/* Sizing & Profit Projection Grid */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-bg-elevated/70 border border-border-subtle/50 text-center">
                      <div>
                        <span className="text-[10px] text-text-muted font-bold block">Buy Qty</span>
                        <span className="text-xs font-black text-text-primary">{candidate.recommendedQuantity} shs</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-text-muted font-bold block">Need Move</span>
                        <span className="text-xs font-black text-amber-400">
                          +{candidate.requiredPercentTarget1}% (₹{candidate.requiredPointsTarget1})
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-text-muted font-bold block">Net Profit</span>
                        <span className="text-xs font-black text-brand-positive">
                          +₹{candidate.expectedNetProfit1}
                        </span>
                      </div>
                    </div>

                    {/* Rationale snippet */}
                    <p className="text-[11px] text-text-muted leading-relaxed line-clamp-2">
                      {candidate.rationale}
                    </p>

                    {/* Action Bar */}
                    <div className="pt-2 border-t border-border-subtle flex items-center justify-between gap-2">
                      <div className="text-[10px] text-text-muted">
                        SL: <span className="text-brand-negative font-bold">₹{candidate.stopLossPrice}</span> (Risk: -₹{candidate.expectedGrossLoss})
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openStockModal(candidate.symbol);
                          }}
                          className="px-2 py-1 rounded-xl text-[11px] font-bold text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
                        >
                          Chart
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExecutePaperScalp(candidate);
                          }}
                          disabled={isLocked}
                          className="px-3 py-1.5 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-dark-950 font-black text-xs flex items-center gap-1 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Zap className="w-3 h-3 fill-current" />
                          <span>1-Click Scalp</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* INSTITUTIONAL SCALPING RULES BOX */}
        <div className="p-4 rounded-3xl bg-bg-secondary border border-border-subtle text-[11px] text-text-muted space-y-2">
          <div className="font-extrabold text-xs text-text-primary flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-400" />
            <span>Prop-Desk 10-30 Minute Scalping Mandate</span>
          </div>
          <ul className="list-disc pl-4 space-y-1 leading-relaxed">
            <li><strong>Asymmetric 1:2 R:R</strong>: Target is always ₹1,500–₹3,000 against a strictly capped ₹800–₹1,000 risk. Even with a 55% win rate, you generate ~₹15,000+ monthly net profit on ₹1L capital.</li>
            <li><strong>Strict 30-Minute Exit</strong>: If the stock does not reach Target within 25–30 minutes, momentum volume has died down. Close the trade at market price. Never convert a scalp into an intraday hope trade.</li>
            <li><strong>One &amp; Done Discipline</strong>: Take only 1 high-conviction scalp trade per morning. Once complete, shut the screen to protect your daily earnings.</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};
