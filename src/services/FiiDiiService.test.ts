import { describe, it, expect } from 'vitest';
import { FiiDiiService } from './FiiDiiService';

describe('FiiDiiService', () => {
  it('correctly interprets FII Index Futures Long ratios into sentiment regimes', () => {
    // <= 25% should be OVERSOLD_SQUEEZE
    const r1 = FiiDiiService.interpretFiiLongRatio(22.5);
    expect(r1.sentiment).toBe('OVERSOLD_SQUEEZE');
    expect(r1.label).toContain('Extreme Oversold');

    // 26-40% should be BEARISH
    const r2 = FiiDiiService.interpretFiiLongRatio(35.0);
    expect(r2.sentiment).toBe('BEARISH');

    // 41-60% should be NEUTRAL
    const r3 = FiiDiiService.interpretFiiLongRatio(50.0);
    expect(r3.sentiment).toBe('NEUTRAL');

    // 61-75% should be BULLISH
    const r4 = FiiDiiService.interpretFiiLongRatio(68.0);
    expect(r4.sentiment).toBe('BULLISH');

    // > 75% should be OVERBOUGHT_UNWIND
    const r5 = FiiDiiService.interpretFiiLongRatio(82.0);
    expect(r5.sentiment).toBe('OVERBOUGHT_UNWIND');
  });

  it('generates a full institutional report with cash, derivatives, and sectors', () => {
    const report = FiiDiiService.generateReport();

    expect(report.cash).toBeDefined();
    expect(report.cash.fiiNet).toBeGreaterThan(0);
    expect(report.cash.diiNet).toBeGreaterThan(0);
    expect(report.cash.combinedNet).toBe(Number((report.cash.fiiNet + report.cash.diiNet).toFixed(1)));

    expect(report.derivatives.indexFuturesLongRatio).toBeGreaterThan(0);
    expect(report.derivatives.historicalTrend.length).toBe(5);

    expect(report.sectors.length).toBeGreaterThanOrEqual(5);
    const bankNifty = report.sectors.find(s => s.symbol === 'NIFTY_BANK');
    expect(bankNifty).toBeDefined();
    expect(bankNifty?.momentumRank).toBe('LEADING');
  });
});
