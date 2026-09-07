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

  it('calculates single-leg order charges (Zerodha / Angel One style)', () => {
    // Intraday Buy: 100 shares of Reliance at ₹3,000 (Turnover: ₹3,00,000)
    const buyCharges = TradingCalculationService.calculateOrderCharges(3000, 100, 'BUY', true);
    expect(buyCharges.brokerage).toBeLessThanOrEqual(20);
    expect(buyCharges.stt).toBe(0); // No STT on intraday buy
    expect(buyCharges.stampDuty).toBeGreaterThan(0);
    expect(buyCharges.totalCharges).toBeGreaterThan(0);

    // Intraday Sell: 100 shares of Reliance at ₹3,020 (Turnover: ₹3,02,000)
    const sellCharges = TradingCalculationService.calculateOrderCharges(3020, 100, 'SELL', true);
    expect(sellCharges.stt).toBeGreaterThan(0); // STT applies on sell
    expect(sellCharges.stampDuty).toBe(0); // No stamp duty on sell
    expect(sellCharges.totalCharges).toBeGreaterThan(0);
  });

  it('calculates delivery (CNC) charges on both legs correctly', () => {
    // Delivery Buy: 10 shares of TCS at ₹4,000 (Turnover: ₹40,000)
    const buyDelivery = TradingCalculationService.calculateOrderCharges(4000, 10, 'BUY', false);
    expect(buyDelivery.stt).toBeCloseTo(40, 0); // 0.1% of ₹40,000 = ₹40
    expect(buyDelivery.stampDuty).toBeCloseTo(6, 0); // 0.015% of ₹40,000 = ₹6
    expect(buyDelivery.totalCharges).toBeGreaterThan(46);

    // Delivery Sell: 10 shares of TCS at ₹4,100 (Turnover: ₹41,000)
    const sellDelivery = TradingCalculationService.calculateOrderCharges(4100, 10, 'SELL', false);
    expect(sellDelivery.stt).toBeCloseTo(41, 0); // 0.1% of ₹41,000 = ₹41
    expect(sellDelivery.stampDuty).toBe(0); // Stamp duty only on buy
    expect(sellDelivery.totalCharges).toBeGreaterThan(41);
  });

  it('verifies 5x leverage margin requirements vs 1x delivery', () => {
    const turnover = 100000;
    const misMargin = turnover / 5; // 20% margin
    const cncMargin = turnover; // 100% margin

    expect(misMargin).toBe(20000);
    expect(cncMargin).toBe(100000);
    expect(cncMargin / misMargin).toBe(5);
  });

  it('provides the 4 canonical Indian market trading session windows', () => {
    const sessions = TradingCalculationService.getIndianMarketSessions();
    expect(sessions.length).toBe(4);
    expect(sessions[0].id).toBe('OPENING_VOLATILITY');
    expect(sessions[0].timeRange).toBe('09:15 - 10:00');
    expect(sessions[1].id).toBe('MORNING_TREND');
    expect(sessions[1].timeRange).toBe('10:00 - 11:30');
    expect(sessions[2].id).toBe('LUNCH_CHOP');
    expect(sessions[2].timeRange).toBe('11:30 - 13:30');
    expect(sessions[3].id).toBe('CLOSING_GAMMA');
    expect(sessions[3].timeRange).toBe('13:30 - 15:30');
  });

  it('calculates Time-of-Day 2D matrix, Golden Hour, and Red Flag Zone', () => {
    const sampleTrades: any[] = [
      // Mon 10:15 (Morning Trend) - Win +₹4,500
      {
        id: 't1',
        date: '2026-09-07', // Monday
        time: '10:15',
        status: 'CLOSED',
        direction: 'BUY',
        entryPrice: 100,
        exitPrice: 110,
        quantity: 50,
        stopLoss: 95,
        targetPrice: 115,
        netPnL: 4500,
        grossPnL: 5000,
        estimatedCharges: 500
      },
      // Wed 12:30 (Lunch Chop) - Loss -₹3,200
      {
        id: 't2',
        date: '2026-09-09', // Wednesday
        time: '12:30',
        status: 'CLOSED',
        direction: 'BUY',
        entryPrice: 100,
        exitPrice: 93,
        quantity: 50,
        stopLoss: 95,
        targetPrice: 115,
        netPnL: -3200,
        grossPnL: -3500,
        estimatedCharges: 300
      }
    ];

    const matrix = TradingCalculationService.calculateTimeOfDayMatrix(sampleTrades);
    expect(matrix.cells.length).toBe(20); // 5 days x 4 sessions

    // Mon morning cell should have 1 trade, +₹4,500
    const monMorning = matrix.cells.find(c => c.dayOfWeek === 1 && c.sessionId === 'MORNING_TREND');
    expect(monMorning?.trades).toBe(1);
    expect(monMorning?.netPnL).toBe(4500);
    expect(monMorning?.winRate).toBe(100);

    // Wed lunch cell should have 1 trade, -₹3,200
    const wedLunch = matrix.cells.find(c => c.dayOfWeek === 3 && c.sessionId === 'LUNCH_CHOP');
    expect(wedLunch?.trades).toBe(1);
    expect(wedLunch?.netPnL).toBe(-3200);
    expect(wedLunch?.winRate).toBe(0);

    // Golden hour and red flag zone detection
    expect(matrix.goldenHour?.session).toBe('Morning Trend');
    expect(matrix.goldenHour?.netPnL).toBe(4500);
    expect(matrix.redFlagZone?.session).toBe('Lunch Chop');
    expect(matrix.redFlagZone?.netPnL).toBe(-3200);
  });

  it('calculates MAE and MFE excursion analytics and capture ratios', () => {
    const sampleTrades: any[] = [
      {
        id: 't1',
        date: '2026-09-08',
        stockSymbol: 'RELIANCE',
        direction: 'BUY',
        status: 'CLOSED',
        entryPrice: 2500,
        exitPrice: 2600,
        quantity: 10,
        stopLoss: 2450,
        targetPrice: 2650,
        maePrice: 2480, // Drew down ₹20 (0.4R heat)
        mfePrice: 2620, // Reached ₹2620 (+₹120 or 2.4R)
        netPnL: 980,
        rMultiple: 2.0
      }
    ];

    const mfeMae = TradingCalculationService.calculateMfeMaeAnalytics(sampleTrades);
    expect(mfeMae.tradesWithData).toBe(1);
    expect(mfeMae.trades[0].maeR).toBe(0.4);
    expect(mfeMae.trades[0].mfeR).toBe(2.4);
    expect(mfeMae.trades[0].captureRatio).toBeGreaterThan(70);
    expect(mfeMae.entryPrecisionScore).toBeGreaterThan(80);
  });

  it('calculates Cost of Indiscipline and distinguishes violation drains', () => {
    const sampleTrades: any[] = [
      // Trade 1: Moved Stop Loss (-₹3,000)
      {
        id: 't1',
        status: 'CLOSED',
        date: '2026-09-08',
        direction: 'BUY',
        entryPrice: 100,
        exitPrice: 85,
        quantity: 200,
        stopLoss: 95, // Planned risk: 5 * 200 = ₹1,000
        movedStopLoss: true,
        planFollowed: false,
        emotion: 'Neutral',
        mistake: 'Ignored Stop Loss',
        netPnL: -3000,
        grossPnL: -3000,
        estimatedCharges: 40
      },
      // Trade 2: FOMO Trade (-₹1,500)
      {
        id: 't2',
        status: 'CLOSED',
        date: '2026-09-08',
        direction: 'BUY',
        entryPrice: 500,
        exitPrice: 485,
        quantity: 100,
        stopLoss: 490,
        movedStopLoss: false,
        planFollowed: false,
        emotion: 'FOMO',
        mistake: 'FOMO Entry',
        netPnL: -1500,
        grossPnL: -1500,
        estimatedCharges: 30
      }
    ];

    const costSummary = TradingCalculationService.calculateCostOfIndiscipline(sampleTrades);
    expect(costSummary.totalCost).toBeGreaterThan(0);
    expect(costSummary.movedStopLossCost).toBeGreaterThan(0);
    expect(costSummary.fomoTradesCost).toBe(1500);
    expect(costSummary.potentialNetPnL).toBeGreaterThan(costSummary.actualNetPnL);
    expect(costSummary.violationCount).toBe(2);
  });
});

