import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { Lock, ShieldAlert, Heart, RefreshCw, AlertTriangle, CheckCircle2, X } from "lucide-react";

export const TiltLockModal: React.FC = () => {
  const { tiltLockState, isTiltLocked, deactivateTiltLock, isTiltLockModalOpen, setIsTiltLockModalOpen } = useApp();

  // Box Breathing cycle: Inhale (4s) -> Hold (4s) -> Exhale (4s) -> Hold (4s)
  const [breathPhase, setBreathPhase] = useState<"Inhale" | "Hold (In)" | "Exhale" | "Hold (Out)">("Inhale");
  const [breathSeconds, setBreathSeconds] = useState(4);

  // Anti-impulsive override state
  const [pledgeText, setPledgeText] = useState("");
  const REQUIRED_PLEDGE = "I WILL RESPECT MY RISK";
  const isPledgeMatched = pledgeText.trim() === REQUIRED_PLEDGE;

  // Box breathing timer
  useEffect(() => {
    if (!isTiltLockModalOpen || !isTiltLocked) return;
    const interval = setInterval(() => {
      setBreathSeconds(prev => {
        if (prev <= 1) {
          setBreathPhase(curr => {
            if (curr === "Inhale") return "Hold (In)";
            if (curr === "Hold (In)") return "Exhale";
            if (curr === "Exhale") return "Hold (Out)";
            return "Inhale";
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTiltLockModalOpen, isTiltLocked]);

  if (!isTiltLockModalOpen || !isTiltLocked) return null;

  const minutes = Math.floor(tiltLockState.remainingSeconds / 60);
  const seconds = tiltLockState.remainingSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const reasonLabels = {
    MAX_DAILY_LOSS: "Daily Max Loss Hit",
    CONSECUTIVE_LOSSES: "3 Consecutive Losses",
    MANUAL_COOLDOWN: "Voluntary Cooldown",
    DRAWDOWN_CIRCUIT: "Equity Drawdown Circuit"
  };

  const getBreathingScale = () => {
    if (breathPhase === "Inhale") return "scale-125 duration-1000";
    if (breathPhase === "Hold (In)") return "scale-125 duration-0";
    if (breathPhase === "Exhale") return "scale-90 duration-1000";
    return "scale-90 duration-0";
  };

  const handleOverrideUnlock = () => {
    if (!isPledgeMatched) return;
    deactivateTiltLock();
    setPledgeText("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      {/* Heavy Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={() => setIsTiltLockModalOpen(false)}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col bg-bg-card border-2 border-rose-500/50 rounded-3xl shadow-2xl overflow-hidden z-10 animate-scale-up">
        {/* Top Alert Ribbon */}
        <div className="bg-rose-600 px-6 py-2.5 flex items-center justify-between text-white text-xs font-black uppercase tracking-widest">
          <span className="flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" />
            Prop-Desk Terminal Freeze Active
          </span>
          <button
            onClick={() => setIsTiltLockModalOpen(false)}
            className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors"
            title="Minimize modal (trading remains locked)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Header & Reason */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-extrabold uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5" />
              <span>{reasonLabels[tiltLockState.reason] || "Discipline Freeze"}</span>
            </div>
            <h2 className="text-2xl font-black text-text-primary tracking-tight">
              TILT LOCK ENGAGED
            </h2>
            <p className="text-xs text-text-secondary max-w-md mx-auto leading-relaxed">
              {tiltLockState.reasonDescription}
            </p>
          </div>

          {/* Countdown Clock */}
          <div className="p-6 rounded-2xl bg-bg-secondary border border-border-subtle text-center space-y-2">
            <span className="text-[11px] uppercase font-bold text-text-muted tracking-wider block">
              Mandatory Cooldown Countdown
            </span>
            <div className="text-5xl font-black font-mono text-rose-400 tracking-wider">
              {timeFormatted}
            </div>
            <p className="text-[11px] text-text-muted">
              Market orders and paper execution are blocked until the cooldown expires.
            </p>
          </div>

          {/* 4-4-4 Box Breathing Physiological Reset Widget */}
          <div className="p-5 rounded-2xl bg-bg-secondary/60 border border-brand-accent/20 flex flex-col items-center text-center space-y-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-brand-accent uppercase tracking-wider">
              <Heart className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>4-4-4 Box Breathing Guide (Reduce Cortisol)</span>
            </div>

            {/* Pulsing Visual Orb */}
            <div className="relative w-28 h-28 flex items-center justify-center my-2">
              <div
                className={`absolute inset-0 rounded-full bg-brand-accent/20 blur-md transition-transform ease-in-out ${getBreathingScale()}`}
              ></div>
              <div
                className={`w-20 h-20 rounded-full border-2 border-brand-accent bg-bg-card flex flex-col items-center justify-center shadow-lg transition-transform ease-in-out ${getBreathingScale()}`}
              >
                <span className="text-xs font-extrabold text-brand-accent uppercase tracking-wider">
                  {breathPhase}
                </span>
                <span className="text-lg font-black font-mono text-text-primary mt-0.5">
                  {breathSeconds}s
                </span>
              </div>
            </div>

            <p className="text-[11px] text-text-secondary max-w-xs leading-relaxed">
              Take deep breaths from the diaphragm. Reset elevated heart rate to prevent revenge trading and impulsive behavior.
            </p>
          </div>

          {/* Anti-Impulsive Pledge Override */}
          <div className="p-4 rounded-2xl bg-bg-secondary border border-border-subtle space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-text-primary">
                Emergency Override (Disciplinary Pledge)
              </span>
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              To unlock trading before the cooldown expires, you must consciously type the pledge below. This override will be recorded in your journal metrics:
            </p>

            <div className="p-2.5 rounded-xl bg-bg-card border border-border-subtle font-mono text-xs text-center font-black tracking-widest text-brand-accent select-all">
              {REQUIRED_PLEDGE}
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={pledgeText}
                onChange={e => setPledgeText(e.target.value.toUpperCase())}
                placeholder={`Type "${REQUIRED_PLEDGE}" to unlock`}
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg-card border border-border-subtle text-text-primary text-xs font-mono tracking-wider focus:outline-none focus:border-brand-accent transition-colors"
              />

              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setIsTiltLockModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-bg-secondary hover:bg-bg-elevated text-text-secondary hover:text-text-primary text-xs font-semibold transition-colors"
                >
                  Keep Locked &amp; Review Charts
                </button>

                <button
                  type="button"
                  disabled={!isPledgeMatched}
                  onClick={handleOverrideUnlock}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    isPledgeMatched
                      ? "bg-rose-500 hover:bg-rose-600 text-white cursor-pointer shadow-lg shadow-rose-500/20"
                      : "bg-bg-secondary text-text-muted cursor-not-allowed opacity-50"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Override &amp; Unlock
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
