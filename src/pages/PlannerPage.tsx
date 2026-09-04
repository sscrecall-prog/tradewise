import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { useMarketData } from "../context/MarketDataContext";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";
import { RiskVisualizer } from "../components/common/RiskVisualizer";
import { ChecklistModal } from "../components/modals/ChecklistModal";
import { TradingCalculationService } from "../services/TradingCalculationService";
import { SetupType, TradeDirection } from "../types";
import {
  Calculator,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Trash2,
  Sparkles,
  ArrowRight,
  Info,
  CheckCircle2
} from "lucide-react";

export const PlannerPage: React.FC = () => {
  const {
    preferences,
    tradePlans,
    deleteTradePlan,
    setIsChecklistModalOpen,
    setActivePlanForChecklist,
    setIsPlaceOrderModalOpen,
    setSelectedStockForOrder
  } = useApp();

  const { quotes } = useMarketData();

  // Form State
  const [symbol, setSymbol] = useState("NIFTY");
  const [direction, setDirection] = useState<TradeDirection>("BUY");
  const [capital, setCapital] = useState(preferences.defaultCapital || 100000);
  const [riskPercent, setRiskPercent] = useState(preferences.defaultRiskPercentage || 1.0);
  const [entryPrice, setEntryPrice] = useState("24500");
  const [stopLoss, setStopLoss] = useState("24420");
  const [targetPrice, setTargetPrice] = useState("24660");
  const [setup, setSetup] = useState<SetupType>("Breakout");
  const [notes, setNotes] = useState("");

  const numEntry = parseFloat(entryPrice) || 0;
  const numSL = parseFloat(stopLoss) || 0;
  const numTarget = parseFloat(targetPrice) || 0;

  // Calculation
  const planCalc = useMemo(() => {
    return TradingCalculationService.calculatePositionSize(
      capital,
      riskPercent,
      numEntry,
      numSL,
      numTarget
    );
  }, [capital, riskPercent, numEntry, numSL, numTarget]);

  const handleOpenChecklist = () => {
    setActivePlanForChecklist({
      stockSymbol: symbol,
      stockName: symbol,
      direction,
      entryPrice: numEntry,
      stopLoss: numSL,
      targetPrice: numTarget,
      tradingCapital: capital,
      riskPercentage: riskPercent,
      maxRiskAmount: planCalc.maxRiskAmount,
      riskPerShare: planCalc.riskPerShare,
      rewardPerShare: planCalc.rewardPerShare,
      riskRewardRatio: planCalc.riskRewardRatio,
      suggestedQuantity: planCalc.suggestedQuantity,
      positionValue: planCalc.positionValue,
      potentialProfit: planCalc.potentialProfit,
      potentialLoss: planCalc.potentialLoss,
      setup,
      notes
    });
    setIsChecklistModalOpen(true);
  };

  const handleExecutePaper = (stockSymbol: string) => {
    setSelectedStockForOrder(stockSymbol);
    setIsPlaceOrderModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-text-primary tracking-tight">
          Trade Planner & Position Sizing Calculator
        </h2>
        <p className="text-xs text-text-secondary mt-0.5">
          Mathematical risk management: Strict capital protection, lot sizing, and pre-trade checklist
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form & Visualizer */}
        <div className="lg:col-span-2 space-y-5">
          <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle space-y-5">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Calculator className="w-4 h-4 text-brand-accent" />
              Configure Trade Parameters
            </h3>

            {/* Symbol & Direction */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Instrument</label>
                <select
                  value={symbol}
                  onChange={e => setSymbol(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-subtle rounded-xl px-3 py-2 text-xs font-bold text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent"
                >
                  <optgroup label="Indices">
                    <option value="NIFTY">NIFTY 50</option>
                    <option value="BANKNIFTY">BANK NIFTY</option>
                    <option value="FINNIFTY">FINNIFTY</option>
                    <option value="SENSEX">SENSEX</option>
                  </optgroup>
                  <optgroup label="Equities">
                    <option value="RELIANCE">RELIANCE</option>
                    <option value="HDFCBANK">HDFC BANK</option>
                    <option value="ICICIBANK">ICICI BANK</option>
                    <option value="TATAMOTORS">TATA MOTORS</option>
                    <option value="INFY">INFOSYS</option>
                    <option value="SBIN">SBIN</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Direction</label>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDirection("BUY")}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      direction === "BUY"
                        ? "bg-brand-positive/20 border-brand-positive text-brand-positive"
                        : "bg-bg-secondary border-border-subtle text-text-muted"
                    }`}
                  >
                    BUY (Long)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirection("SELL")}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      direction === "SELL"
                        ? "bg-brand-negative/20 border-brand-negative text-brand-negative"
                        : "bg-bg-secondary border-border-subtle text-text-muted"
                    }`}
                  >
                    SELL (Short)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Setup Type</label>
                <select
                  value={setup}
                  onChange={e => setSetup(e.target.value as SetupType)}
                  className="w-full bg-bg-secondary border border-border-subtle rounded-xl px-3 py-2 text-xs font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent"
                >
                  <option value="Breakout">Breakout</option>
                  <option value="Pullback">Pullback / EMA</option>
                  <option value="Support/Resistance">Support/Resistance</option>
                  <option value="Reversal">Reversal</option>
                  <option value="Trend Continuation">Trend Continuation</option>
                  <option value="Range Bound">Range Bound</option>
                  <option value="Gap Fill">Gap Fill</option>
                </select>
              </div>
            </div>

            {/* Capital & Risk % */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-bg-secondary/70 border border-border-subtle">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-text-secondary">Trading Capital (₹)</label>
                  <span className="text-xs font-bold text-text-primary">
                    ₹{capital.toLocaleString("en-IN")}
                  </span>
                </div>
                <input
                  type="number"
                  step="5000"
                  value={capital}
                  onChange={e => setCapital(Math.max(1000, parseFloat(e.target.value) || 0))}
                  className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-3 py-1.5 text-xs font-semibold text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-text-secondary">Risk % per Trade</label>
                  <span className="text-xs font-bold text-brand-accent">{riskPercent}%</span>
                </div>
                <input
                  type="range"
                  min="0.25"
                  max="3.0"
                  step="0.25"
                  value={riskPercent}
                  onChange={e => setRiskPercent(parseFloat(e.target.value))}
                  className="w-full accent-brand-accent cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-text-muted mt-0.5">
                  <span>0.5% (Conservative)</span>
                  <span>1.0% (Standard)</span>
                  <span>2.0% (Aggressive)</span>
                </div>
              </div>
            </div>

            {/* Entry, Stop Loss, Target */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Entry Trigger Price (₹)</label>
                <input
                  type="number"
                  step="0.05"
                  value={entryPrice}
                  onChange={e => setEntryPrice(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-subtle rounded-xl px-3 py-2 text-sm font-bold text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Stop Loss Level (₹)</label>
                <input
                  type="number"
                  step="0.05"
                  value={stopLoss}
                  onChange={e => setStopLoss(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-subtle rounded-xl px-3 py-2 text-sm font-bold text-brand-negative focus:outline-none focus:ring-1 focus:ring-brand-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Target Price (₹)</label>
                <input
                  type="number"
                  step="0.05"
                  value={targetPrice}
                  onChange={e => setTargetPrice(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-subtle rounded-xl px-3 py-2 text-sm font-bold text-brand-positive focus:outline-none focus:ring-1 focus:ring-brand-accent"
                />
              </div>
            </div>

            {/* Visualizer */}
            <RiskVisualizer
              entry={numEntry}
              stopLoss={numSL}
              target={numTarget}
              direction={direction}
            />

            {/* Trade Notes */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Pre-trade Hypothesis / Notes</label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Reasoning, candle pattern, support/resistance confluence..."
                className="w-full bg-bg-secondary border border-border-subtle rounded-xl px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand-accent custom-scrollbar"
              />
            </div>
          </div>
        </div>

        {/* Right 1 Col: Sizing Summary & Checklist Trigger */}
        <div className="space-y-5">
          <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle space-y-4">
            <h3 className="text-sm font-bold text-text-primary">Position Sizing Output</h3>

            <div className="p-4 rounded-2xl bg-bg-secondary border border-border-subtle space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Max Dollar Risk:</span>
                <span className="font-bold text-brand-negative">
                  ₹{planCalc.maxRiskAmount.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Risk Per Share:</span>
                <span className="font-semibold text-text-primary">
                  ₹{planCalc.riskPerShare.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Reward Per Share:</span>
                <span className="font-semibold text-text-primary">
                  ₹{planCalc.rewardPerShare.toFixed(2)}
                </span>
              </div>

              <div className="border-t border-border-subtle/60 pt-2 flex items-center justify-between text-xs">
                <span className="text-text-muted">Risk : Reward Ratio:</span>
                <span
                  className={`font-bold ${
                    planCalc.riskRewardRatio >= 1.5 ? "text-brand-positive" : "text-brand-warning"
                  }`}
                >
                  {planCalc.riskRewardDisplay}
                </span>
              </div>
            </div>

            {/* Suggested Quantity Box */}
            <div className="p-4 rounded-2xl bg-bg-elevated border border-brand-accent/40 text-center">
              <span className="text-[11px] text-text-muted uppercase tracking-wider block">
                Suggested Position Size
              </span>
              <div className="text-3xl font-extrabold text-brand-accent mt-0.5">
                {planCalc.suggestedQuantity}{" "}
                <span className="text-xs font-normal text-text-muted">shares / contracts</span>
              </div>
              <span className="text-[11px] text-text-muted mt-1 block">
                Total Position Value: ₹{planCalc.positionValue.toLocaleString("en-IN")} ({planCalc.capitalAllocationPercent}% of Capital)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-bg-secondary border border-border-subtle">
                <span className="text-[10px] text-text-muted block">Potential Profit</span>
                <span className="font-bold text-brand-positive text-sm">
                  +₹{planCalc.potentialProfit.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-bg-secondary border border-border-subtle">
                <span className="text-[10px] text-text-muted block">Potential Loss</span>
                <span className="font-bold text-brand-negative text-sm">
                  -₹{planCalc.potentialLoss.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Pre-trade Checklist Trigger */}
            <Button
              variant="primary"
              onClick={handleOpenChecklist}
              icon={<ShieldCheck className="w-4 h-4" />}
              className="w-full"
            >
              Verify Checklist & Save Plan
            </Button>
          </div>
        </div>
      </div>

      {/* Saved Plans Section */}
      <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-text-primary">Saved Trade Plans</h3>
            <p className="text-xs text-text-muted">Pre-planned execution blueprints awaiting trigger</p>
          </div>
          <span className="text-xs text-text-muted font-semibold">{tradePlans.length} Plans</span>
        </div>

        {tradePlans.length === 0 ? (
          <div className="text-center py-8 text-xs text-text-muted">
            No saved plans yet. Configure parameters above and click "Verify Checklist & Save Plan".
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tradePlans.map(plan => (
              <div
                key={plan.id}
                className="p-4 rounded-2xl bg-bg-secondary border border-border-subtle hover:border-brand-accent/40 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-text-primary">{plan.stockSymbol}</span>
                    <Badge variant={plan.direction === "BUY" ? "positive" : "negative"} size="sm">
                      {plan.direction}
                    </Badge>
                  </div>
                  <button
                    onClick={() => deleteTradePlan(plan.id)}
                    className="p-1 rounded text-text-muted hover:text-brand-negative transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs py-1">
                  <div className="p-1.5 rounded-lg bg-bg-elevated">
                    <span className="text-[10px] text-text-muted block">Entry</span>
                    <span className="font-bold text-text-primary">₹{plan.entryPrice}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-bg-elevated">
                    <span className="text-[10px] text-text-muted block">SL</span>
                    <span className="font-bold text-brand-negative">₹{plan.stopLoss}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-bg-elevated">
                    <span className="text-[10px] text-text-muted block">Target</span>
                    <span className="font-bold text-brand-positive">₹{plan.targetPrice}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-border-subtle/50">
                  <span className="text-text-muted">Qty: {plan.suggestedQuantity}</span>
                  <span className="font-bold text-brand-accent">R:R 1:{plan.riskRewardRatio}</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExecutePaper(plan.stockSymbol)}
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                  className="w-full justify-center"
                >
                  Paper Trade This Plan
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Checklist Modal */}
      <ChecklistModal />
    </div>
  );
};
