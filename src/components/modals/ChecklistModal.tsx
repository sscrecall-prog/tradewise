import React, { useState } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { useApp } from "../../context/AppContext";
import { CheckCircle2, ShieldCheck, AlertTriangle } from "lucide-react";

export const ChecklistModal: React.FC = () => {
  const {
    isChecklistModalOpen,
    setIsChecklistModalOpen,
    activePlanForChecklist,
    setActivePlanForChecklist,
    saveTradePlan,
    setIsNewTradeModalOpen
  } = useApp();

  const [checklist, setChecklist] = useState({
    knowSetup: true,
    entryPredefined: true,
    stopLossPredefined: true,
    targetPredefined: true,
    riskAcceptable: true,
    riskRewardAcceptable: true,
    noFOMO: true,
    noRevenge: true
  });

  if (!isChecklistModalOpen) return null;

  const items = [
    { key: "knowSetup", label: "Clear Setup Identified", desc: "Do I have a well-defined setup (Breakout, CPR, 5 EMA, etc.)?" },
    { key: "entryPredefined", label: "Entry Trigger Confirmed", desc: "Has the candle closed or price confirmed the level?" },
    { key: "stopLossPredefined", label: "Hard Stop Loss Defined", desc: "I know exactly where my thesis fails and will respect my SL." },
    { key: "targetPredefined", label: "Target / Exit Defined", desc: "Logical target based on resistance or 1:2 Risk:Reward ratio." },
    { key: "riskAcceptable", label: "Risk within 1-2% Limit", desc: "Position size is strictly capped at my maximum daily loss budget." },
    { key: "riskRewardAcceptable", label: "Minimum 1:1.5 R:R Ratio", desc: "The potential upside justifies the downside risk." },
    { key: "noFOMO", label: "Zero FOMO (Not Chasing)", desc: "I am taking the trade at the right price, not chasing green candles." },
    { key: "noRevenge", label: "Zero Revenge Mindset", desc: "My mind is calm, and I am not trying to make back a past loss." }
  ];

  const score = Object.values(checklist).filter(Boolean).length;
  const isReady = score >= 7;

  const toggle = (key: string) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const handleConfirm = async () => {
    if (activePlanForChecklist && activePlanForChecklist.stockSymbol) {
      await saveTradePlan({
        stockSymbol: activePlanForChecklist.stockSymbol || "NIFTY",
        stockName: activePlanForChecklist.stockName || "NIFTY 50",
        direction: activePlanForChecklist.direction || "BUY",
        entryPrice: activePlanForChecklist.entryPrice || 100,
        stopLoss: activePlanForChecklist.stopLoss || 95,
        targetPrice: activePlanForChecklist.targetPrice || 110,
        tradingCapital: activePlanForChecklist.tradingCapital || 100000,
        riskPercentage: activePlanForChecklist.riskPercentage || 1,
        maxRiskAmount: activePlanForChecklist.maxRiskAmount || 1000,
        riskPerShare: activePlanForChecklist.riskPerShare || 5,
        rewardPerShare: activePlanForChecklist.rewardPerShare || 10,
        riskRewardRatio: activePlanForChecklist.riskRewardRatio || 2,
        suggestedQuantity: activePlanForChecklist.suggestedQuantity || 200,
        positionValue: activePlanForChecklist.positionValue || 20000,
        potentialProfit: activePlanForChecklist.potentialProfit || 2000,
        potentialLoss: activePlanForChecklist.potentialLoss || 1000,
        setup: activePlanForChecklist.setup || "Breakout",
        notes: activePlanForChecklist.notes || "",
        checklist: {
          ...checklist,
          score,
          isComplete: isReady
        }
      });
    }

    setIsChecklistModalOpen(false);
    setActivePlanForChecklist(null);
  };

  return (
    <Modal
      isOpen={isChecklistModalOpen}
      onClose={() => setIsChecklistModalOpen(false)}
      title="Pre-Trade Discipline Checklist"
      subtitle="8 Essential Rules for Indian Traders before taking a trade"
      maxWidth="xl"
    >
      <div className="space-y-5">
        {/* Score Meter */}
        <div className="p-4 rounded-2xl bg-bg-elevated border border-border-subtle flex items-center justify-between">
          <div>
            <span className="text-xs text-text-muted uppercase tracking-wider block">
              Readiness Score
            </span>
            <div className="text-2xl font-extrabold text-text-primary mt-0.5">
              {score} / 8 Rules Passed
            </div>
            <p className="text-xs text-text-muted mt-1">
              {isReady
                ? "Excellent discipline! Setup meets strict trading criteria."
                : "Caution: Do not trade until at least 7/8 rules are checked."}
            </p>
          </div>

          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg border ${
              isReady
                ? "bg-brand-positive/15 text-brand-positive border-brand-positive/30"
                : "bg-brand-warning/15 text-brand-warning border-brand-warning/30"
            }`}
          >
            {Math.round((score / 8) * 100)}%
          </div>
        </div>

        {/* 8 Check Items */}
        <div className="space-y-2.5">
          {items.map(item => {
            const checked = checklist[item.key as keyof typeof checklist];
            return (
              <div
                key={item.key}
                onClick={() => toggle(item.key)}
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                  checked
                    ? "bg-bg-secondary/80 border-border-subtle hover:border-brand-accent/40"
                    : "bg-bg-elevated/40 border-border-subtle/50 opacity-60"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(item.key)}
                  className="mt-0.5 rounded text-brand-accent focus:ring-0 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                    {item.label}
                    {checked && <CheckCircle2 className="w-3.5 h-3.5 text-brand-positive" />}
                  </div>
                  <p className="text-[11px] text-text-muted mt-0.5">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
          <Button variant="outline" onClick={() => setIsChecklistModalOpen(false)}>
            Close
          </Button>
          <Button
            variant={isReady ? "primary" : "secondary"}
            onClick={handleConfirm}
            icon={<ShieldCheck className="w-4 h-4" />}
          >
            Confirm & Save Plan
          </Button>
        </div>
      </div>
    </Modal>
  );
};
