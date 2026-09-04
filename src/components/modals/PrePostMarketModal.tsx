import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { useApp } from "../../context/AppContext";
import { Sun, Moon, Sparkles, CheckCircle2, ShieldAlert } from "lucide-react";

interface PrePostMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "PRE" | "POST";
}

export const PrePostMarketModal: React.FC<PrePostMarketModalProps> = ({
  isOpen,
  onClose,
  defaultMode = "PRE"
}) => {
  const { preferences, todayPnL, todayTradesCount } = useApp();
  const [mode, setMode] = useState<"PRE" | "POST">(defaultMode);

  // Pre-market state
  const [marketSentiment, setMarketSentiment] = useState<"BULLISH" | "BEARISH" | "RANGEBOUND">("BULLISH");
  const [niftySupport, setNiftySupport] = useState("24350");
  const [niftyResistance, setNiftyResistance] = useState("24600");
  const [bankNiftySupport, setBankNiftySupport] = useState("50800");
  const [bankNiftyResistance, setBankNiftyResistance] = useState("51500");
  const [dailyFocusNotes, setDailyFocusNotes] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Post-market state
  const [rulesRespected, setRulesRespected] = useState(true);
  const [postMarketReview, setPostMarketReview] = useState("");
  const [tomorrowImprovement, setTomorrowImprovement] = useState("");

  const todayKey = new Date().toISOString().split("T")[0];

  useEffect(() => {
    // Load today's routine if previously saved
    const savedPre = localStorage.getItem(`tw_pre_${todayKey}`);
    if (savedPre) {
      try {
        const d = JSON.parse(savedPre);
        setMarketSentiment(d.marketSentiment || "BULLISH");
        setNiftySupport(d.niftySupport || "24350");
        setNiftyResistance(d.niftyResistance || "24600");
        setDailyFocusNotes(d.dailyFocusNotes || "");
      } catch (e) {}
    }

    const savedPost = localStorage.getItem(`tw_post_${todayKey}`);
    if (savedPost) {
      try {
        const d = JSON.parse(savedPost);
        setRulesRespected(d.rulesRespected ?? true);
        setPostMarketReview(d.postMarketReview || "");
        setTomorrowImprovement(d.tomorrowImprovement || "");
      } catch (e) {}
    }
  }, [todayKey, isOpen]);

  const handleSave = () => {
    if (mode === "PRE") {
      localStorage.setItem(
        `tw_pre_${todayKey}`,
        JSON.stringify({
          marketSentiment,
          niftySupport,
          niftyResistance,
          bankNiftySupport,
          bankNiftyResistance,
          dailyFocusNotes,
          updatedAt: new Date().toISOString()
        })
      );
    } else {
      localStorage.setItem(
        `tw_post_${todayKey}`,
        JSON.stringify({
          rulesRespected,
          postMarketReview,
          tomorrowImprovement,
          updatedAt: new Date().toISOString()
        })
      );
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {mode === "PRE" ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-400" />}
          <span>{mode === "PRE" ? "Pre-Market Plan (09:00 AM)" : "Post-Market Debrief (03:45 PM)"}</span>
        </div>
      }
      subtitle={`Daily Ritual for Professional Indian Traders • ${todayKey}`}
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Mode Switcher */}
        <div className="flex bg-bg-secondary p-1 rounded-xl border border-border-subtle">
          <button
            onClick={() => setMode("PRE")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
              mode === "PRE" ? "bg-bg-elevated text-amber-400 shadow-sm" : "text-text-muted hover:text-text-secondary"
            }`}
          >
            <Sun className="w-3.5 h-3.5" /> Pre-Market Plan
          </button>
          <button
            onClick={() => setMode("POST")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
              mode === "POST" ? "bg-bg-elevated text-indigo-400 shadow-sm" : "text-text-muted hover:text-text-secondary"
            }`}
          >
            <Moon className="w-3.5 h-3.5" /> Post-Market Review
          </button>
        </div>

        {savedSuccess && (
          <div className="p-3 rounded-xl bg-brand-positive/15 border border-brand-positive/30 text-brand-positive text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Successfully saved today's {mode === "PRE" ? "Pre-Market Plan" : "Post-Market Review"}!</span>
          </div>
        )}

        {mode === "PRE" ? (
          <div className="space-y-4">
            {/* Risk Reminder */}
            <div className="p-3.5 rounded-xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-text-primary block">Daily Risk Limits:</span>
                <span className="text-text-muted">
                  Max Loss Limit: <strong className="text-brand-negative">₹{preferences.maxDailyLoss}</strong> | Max Trades: <strong>{preferences.maxTradesPerDay}</strong>
                </span>
              </div>
              <span className="px-2 py-1 rounded bg-bg-secondary text-brand-accent font-bold text-[10px]">
                Rule Protected
              </span>
            </div>

            {/* GIFT Nifty Bias */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                GIFT Nifty / Global Cues Sentiment
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "BULLISH", label: "Bullish (Gap Up / Long)" },
                  { id: "RANGEBOUND", label: "Rangebound / Sideways" },
                  { id: "BEARISH", label: "Bearish (Gap Down / Short)" }
                ].map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setMarketSentiment(s.id as any)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                      marketSentiment === s.id
                        ? "bg-brand-accent/20 border-brand-accent text-brand-accent shadow-sm"
                        : "bg-bg-elevated border-border-subtle text-text-muted hover:text-text-primary"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Nifty & Bank Nifty Key Levels */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-bg-secondary border border-border-subtle space-y-2">
                <span className="text-xs font-bold text-text-primary block">NIFTY 50 Levels</span>
                <div>
                  <label className="text-[10px] text-text-muted block">Support (S1 / CPR)</label>
                  <input
                    type="number"
                    value={niftySupport}
                    onChange={e => setNiftySupport(e.target.value)}
                    className="w-full bg-bg-elevated border border-border-subtle rounded-lg px-2.5 py-1 text-xs font-bold text-text-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-text-muted block">Resistance (R1 / High)</label>
                  <input
                    type="number"
                    value={niftyResistance}
                    onChange={e => setNiftyResistance(e.target.value)}
                    className="w-full bg-bg-elevated border border-border-subtle rounded-lg px-2.5 py-1 text-xs font-bold text-text-primary"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-bg-secondary border border-border-subtle space-y-2">
                <span className="text-xs font-bold text-text-primary block">BANK NIFTY Levels</span>
                <div>
                  <label className="text-[10px] text-text-muted block">Support (S1 / CPR)</label>
                  <input
                    type="number"
                    value={bankNiftySupport}
                    onChange={e => setBankNiftySupport(e.target.value)}
                    className="w-full bg-bg-elevated border border-border-subtle rounded-lg px-2.5 py-1 text-xs font-bold text-text-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-text-muted block">Resistance (R1 / High)</label>
                  <input
                    type="number"
                    value={bankNiftyResistance}
                    onChange={e => setBankNiftyResistance(e.target.value)}
                    className="w-full bg-bg-elevated border border-border-subtle rounded-lg px-2.5 py-1 text-xs font-bold text-text-primary"
                  />
                </div>
              </div>
            </div>

            {/* Daily Focus Notes */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Today's Trading Plan & Stock Focus
              </label>
              <textarea
                rows={3}
                value={dailyFocusNotes}
                onChange={e => setDailyFocusNotes(e.target.value)}
                placeholder="Stocks in news, RBI policy / FED events, preferred setups (e.g. wait for 15-min ORB breakout before entering)..."
                className="w-full bg-bg-secondary border border-border-subtle rounded-xl p-3 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand-accent custom-scrollbar"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Today's Outcome Card */}
            <div className="p-4 rounded-xl bg-bg-elevated border border-border-subtle flex items-center justify-between">
              <div>
                <span className="text-xs text-text-muted block">Today's Trading Result</span>
                <span className={`text-xl font-bold ${todayPnL >= 0 ? "text-brand-positive" : "text-brand-negative"}`}>
                  {todayPnL >= 0 ? "+₹" : "-₹"}{Math.abs(todayPnL).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-text-muted block">Trades Executed</span>
                <span className="text-xl font-bold text-text-primary">{todayTradesCount} Trades</span>
              </div>
            </div>

            {/* Rule Followed Checkbox */}
            <div className="p-3.5 rounded-xl bg-bg-secondary border border-border-subtle flex items-center justify-between text-xs">
              <span className="font-semibold text-text-primary">
                Did you strictly respect your Stop Losses and daily loss limit today?
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRulesRespected(true)}
                  className={`px-3 py-1.5 rounded-lg font-bold border transition-colors ${
                    rulesRespected
                      ? "bg-brand-positive/20 border-brand-positive text-brand-positive"
                      : "bg-bg-elevated border-border-subtle text-text-muted"
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setRulesRespected(false)}
                  className={`px-3 py-1.5 rounded-lg font-bold border transition-colors ${
                    !rulesRespected
                      ? "bg-brand-negative/20 border-brand-negative text-brand-negative"
                      : "bg-bg-elevated border-border-subtle text-text-muted"
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* Post-Market Review */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                What went well today? What trades worked?
              </label>
              <textarea
                rows={3}
                value={postMarketReview}
                onChange={e => setPostMarketReview(e.target.value)}
                placeholder="Reflect on your best executions, patience in waiting for setups..."
                className="w-full bg-bg-secondary border border-border-subtle rounded-xl p-3 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand-accent custom-scrollbar"
              />
            </div>

            {/* Lessons for Tomorrow */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                One Key Lesson to Improve Tomorrow
              </label>
              <input
                type="text"
                value={tomorrowImprovement}
                onChange={e => setTomorrowImprovement(e.target.value)}
                placeholder="e.g. Do not overtrade after 1:30 PM, avoid hero-zero options on expiry day..."
                className="w-full bg-bg-secondary border border-border-subtle rounded-xl px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand-accent"
              />
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSave} icon={<Sparkles className="w-4 h-4" />}>
            Save {mode === "PRE" ? "Pre-Market Plan" : "Post-Market Review"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
