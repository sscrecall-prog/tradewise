import { describe, it, expect, beforeEach } from 'vitest';
import { ScalpSniperService } from './ScalpSniperService';
import { MarketQuote } from '../types';

describe('ScalpSniperService', () => {
  beforeEach(() => {
    ScalpSniperService.resetDailyScalpLock();
  });

  it('calculates accurate ₹1L capital 5x MIS quantity and target levels', () => {
    const price = 1000;
    const blueprint = ScalpSniperService.calculateScalpBlueprint(
      price,
      'BUY',
      100000, // ₹1,00,000 capital
      2000,   // ₹2,000 target
      1000,   // ₹1,000 risk cap
      5       // 5x MIS margin
    );

    // Buying power = 5,00,000. Safe allocated = 4,25,000. Qty = floor(425000 / 1000) = 425 shares
    expect(blueprint.quantity).toBe(425);
    expect(blueprint.marginUsed).toBeLessThanOrEqual(100000);
    expect(blueprint.target1Price).toBeGreaterThan(price);
    expect(blueprint.stopLossPrice).toBeLessThan(price);

    // Move needed should be less than 0.70%
    expect(blueprint.requiredPercentTarget1).toBeLessThan(0.70);
    expect(blueprint.riskPercent).toBeLessThan(0.35);

    // Risk reward should be 1 : 1.5 or better
    expect(blueprint.expectedGrossProfit1).toBeGreaterThanOrEqual(1400);
    expect(blueprint.expectedGrossLoss).toBeLessThanOrEqual(1100);
  });

  it('correctly deducts Indian regulatory taxes and brokerages to show net profit', () => {
    const blueprint = ScalpSniperService.calculateScalpBlueprint(
      500,
      'BUY',
      100000,
      2500,
      1000,
      5
    );

    expect(blueprint.totalChargesEst).toBeGreaterThan(0);
    expect(blueprint.expectedNetProfit1).toBe(Number((blueprint.expectedGrossProfit1 - blueprint.totalChargesEst).toFixed(2)));
    expect(blueprint.expectedNetLoss).toBe(Number((blueprint.expectedGrossLoss + blueprint.totalChargesEst).toFixed(2)));
  });

  it('scans and ranks high-beta liquid stocks like TATAMOTORS and SBIN', () => {
    const mockQuotes = [
      {
        symbol: 'TATAMOTORS',
        name: 'Tata Motors Ltd.',
        price: 980,
        change: 14.5,
        changePercent: 1.5,
        open: 968,
        high: 985,
        low: 968,
        prevClose: 965.5,
        volume: 12500000,
        lastUpdated: '10:15 AM'
      },
      {
        symbol: 'SBIN',
        name: 'State Bank of India',
        price: 820,
        change: 8.2,
        changePercent: 1.01,
        open: 812,
        high: 825,
        low: 811.5,
        prevClose: 811.8,
        volume: 9800000,
        lastUpdated: '10:15 AM'
      },
      {
        symbol: 'ITC',
        name: 'ITC Ltd.',
        price: 490,
        change: 0.2,
        changePercent: 0.04,
        open: 490,
        high: 492,
        low: 489,
        prevClose: 489.8,
        volume: 1200000,
        lastUpdated: '10:15 AM'
      }
    ] as unknown as MarketQuote[];

    const candidates = ScalpSniperService.scanScalpCandidates(mockQuotes, 100000, 2000, 1000);

    // Should include high-beta TATAMOTORS and SBIN, but exclude low-beta sluggish ITC
    expect(candidates.length).toBeGreaterThanOrEqual(2);
    expect(candidates.some(c => c.symbol === 'TATAMOTORS')).toBe(true);
    expect(candidates.some(c => c.symbol === 'SBIN')).toBe(true);
    expect(candidates.some(c => c.symbol === 'ITC')).toBe(false);

    // TATAMOTORS should have high beta and confluence score
    const tata = candidates.find(c => c.symbol === 'TATAMOTORS');
    expect(tata?.beta).toBe(1.62);
    expect(tata?.confluenceScore).toBeGreaterThanOrEqual(80);
  });

  it('accurately reports 10-30 min stopwatch phases', () => {
    const phase5m = ScalpSniperService.getTimerPhase(5);
    expect(phase5m.phaseName).toBe('SURGE_ZONE');
    expect(phase5m.recommendedAction).toBe('HOLD_FOR_TARGET');

    const phase15m = ScalpSniperService.getTimerPhase(15);
    expect(phase15m.phaseName).toBe('TRAIL_ZONE');
    expect(phase15m.recommendedAction).toBe('TRAIL_SL_TO_COST');

    const phase26m = ScalpSniperService.getTimerPhase(26);
    expect(phase26m.phaseName).toBe('DECAY_EXIT_ZONE');
    expect(phase26m.recommendedAction).toBe('FORCE_EXIT_NOW');
  });

  it('manages Daily "One & Done" lock persistence correctly', () => {
    let state = ScalpSniperService.getDailyScalpState();
    expect(state.hasExecutedToday).toBe(false);

    ScalpSniperService.markDailyScalpExecuted('TATAMOTORS', 2150, 'WIN');
    state = ScalpSniperService.getDailyScalpState();
    expect(state.hasExecutedToday).toBe(true);
    expect(state.tradeSymbol).toBe('TATAMOTORS');
    expect(state.netPnL).toBe(2150);
    expect(state.result).toBe('WIN');

    ScalpSniperService.resetDailyScalpLock();
    state = ScalpSniperService.getDailyScalpState();
    expect(state.hasExecutedToday).toBe(false);
  });
});
