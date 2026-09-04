import { describe, it, expect } from 'vitest';
import { TradingCalculationService } from './TradingCalculationService';

describe('TradingCalculationService', () => {
  it('calculates risk amount correctly', () => {
    // Capital: ₹1,00,000, Risk: 1% -> ₹1,000
    const risk = TradingCalculationService.calculateRiskAmount(100000, 1);
    expect(risk).toBe(1000);

    // Capital: ₹2,50,000, Risk: 2% -> ₹5,000
    expect(TradingCalculationService.calculateRiskAmount(250000, 2)).toBe(5000);
  });

  it('calculates risk and reward per share correctly', () => {
    // Entry: 1250, Stop Loss: 1230 -> Risk per share = 20
    const riskPerShare = TradingCalculationService.calculateRiskPerShare(1250, 1230);
    expect(riskPerShare).toBe(20);

    // Entry: 1250, Target: 1290 -> Reward per share = 40
    const rewardPerShare = TradingCalculationService.calculateRewardPerShare(1250, 1290);
    expect(rewardPerShare).toBe(40);
  });

  it('calculates Risk to Reward ratio correctly', () => {
    // Risk: 20, Reward: 40 -> 1 : 2
    const rr = TradingCalculationService.calculateRiskReward(20, 40);
    expect(rr.ratio).toBe(2);
    expect(rr.display).toBe('1 : 2.00');

    // Risk: 25, Reward: 62.5 -> 1 : 2.5
    const rr2 = TradingCalculationService.calculateRiskReward(25, 62.5);
    expect(rr2.ratio).toBe(2.5);
    expect(rr2.display).toBe('1 : 2.50');
  });

  it('calculates position sizing exactly as in the specification example', () => {
    // Example from prompt:
    // Capital: ₹1,00,000
    // Risk: 1%
    // Entry: ₹1,250
    // Stop Loss: ₹1,230
    // Target: ₹1,290
    // Expected:
    // Maximum Risk: ₹1,000
    // Risk per share: ₹20
    // Suggested quantity: 50
    // Position value: ₹62,500
    // Risk : Reward: 1 : 2

    const res = TradingCalculationService.calculatePositionSize(100000, 1, 1250, 1230, 1290);
    expect(res.maxRiskAmount).toBe(1000);
    expect(res.riskPerShare).toBe(20);
    expect(res.rewardPerShare).toBe(40);
    expect(res.suggestedQuantity).toBe(50);
    expect(res.positionValue).toBe(62500);
    expect(res.potentialProfit).toBe(2000);
    expect(res.potentialLoss).toBe(1000);
    expect(res.riskRewardRatio).toBe(2);
  });

  it('calculates realistic Indian regulatory charges', () => {
    // Buy 50 shares of Reliance at ₹2,500 and Sell at ₹2,550
    const charges = TradingCalculationService.calculateIndianCharges(2500, 2550, 50, true);
    expect(charges.totalCharges).toBeGreaterThan(0);
    expect(charges.stt).toBeGreaterThan(0);
    expect(charges.brokerage).toBeLessThanOrEqual(40);
    expect(charges.gst).toBeGreaterThan(0);
  });

  it('calculates win rate, expectancy, and profit factor correctly', () => {
    // 6 wins out of 10 trades = 60%
    expect(TradingCalculationService.calculateWinRate(6, 10)).toBe(60);

    // Total gains: 10000, Total losses: 5000 -> Profit Factor = 2.0
    expect(TradingCalculationService.calculateProfitFactor(10000, 5000)).toBe(2);

    // Win Rate: 60%, Avg Win: ₹2,000, Avg Loss: ₹1,000
    // Expectancy = (0.6 * 2000) - (0.4 * 1000) = 1200 - 400 = ₹800
    expect(TradingCalculationService.calculateExpectancy(60, 2000, 1000)).toBe(800);
  });

  it('calculates drawdown correctly', () => {
    const equityCurve = [100000, 105000, 110000, 102000, 108000, 95000, 115000];
    const dd = TradingCalculationService.calculateDrawdown(equityCurve);
    // Peak is 110000, trough is 95000 -> max drawdown amount = 15000
    expect(dd.maxDrawdownAmount).toBe(15000);
    expect(dd.maxDrawdownPercent).toBeCloseTo(13.64, 1);
  });
});
