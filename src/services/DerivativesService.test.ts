import { describe, it, expect } from 'vitest';
import { DerivativesService } from './DerivativesService';

describe('DerivativesService', () => {
  it('correctly classifies all 4 institutional option build-up types', () => {
    // Price Up & OI Up -> Long Build-up
    expect(DerivativesService.determineBuildUp(15, 5000)).toBe('LONG_BUILDUP');

    // Price Down & OI Up -> Short Build-up (Writing)
    expect(DerivativesService.determineBuildUp(-10, 4200)).toBe('SHORT_BUILDUP');

    // Price Up & OI Down -> Short Covering
    expect(DerivativesService.determineBuildUp(20, -3500)).toBe('SHORT_COVERING');

    // Price Down & OI Down -> Long Unwinding
    expect(DerivativesService.determineBuildUp(-25, -6000)).toBe('LONG_UNWINDING');
  });

  it('evaluates India VIX dynamic risk sizing and warning regimes accurately', () => {
    // Low VIX < 12
    const lowVix = DerivativesService.evaluateVixRisk(10.5);
    expect(lowVix.regime).toBe('LOW_VOLATILITY');
    expect(lowVix.title).toContain('Low Volatility Trap');
    expect(lowVix.positionSizeFactor).toBe(1.0);

    // Normal VIX 12 - 18
    const normalVix = DerivativesService.evaluateVixRisk(14.2);
    expect(normalVix.regime).toBe('NORMAL');
    expect(normalVix.positionSizeFactor).toBe(1.0);
    expect(normalVix.stopLossMultiplier).toBe(1.0);

    // High VIX > 18 -> Auto 50% position cut suggestion
    const highVix = DerivativesService.evaluateVixRisk(21.4);
    expect(highVix.regime).toBe('HIGH_VOLATILITY');
    expect(highVix.positionSizeFactor).toBe(0.5); // 50% cut!
    expect(highVix.stopLossMultiplier).toBe(1.5); // 1.5x wider stops!
    expect(highVix.recommendation).toContain('CUT POSITION SIZE BY 50%');

    // Extreme VIX > 24
    const extremeVix = DerivativesService.evaluateVixRisk(28.0);
    expect(extremeVix.regime).toBe('EXTREME_VOLATILITY');
    expect(extremeVix.positionSizeFactor).toBe(0.25);
  });

  it('interprets Put-Call Ratio (PCR) sentiment correctly', () => {
    expect(DerivativesService.interpretPcr(1.45).sentiment).toBe('EXTREME_BULLISH');
    expect(DerivativesService.interpretPcr(1.20).sentiment).toBe('BULLISH');
    expect(DerivativesService.interpretPcr(0.98).sentiment).toBe('NEUTRAL');
    expect(DerivativesService.interpretPcr(0.75).sentiment).toBe('BEARISH');
    expect(DerivativesService.interpretPcr(0.55).sentiment).toBe('EXTREME_BEARISH');
  });

  it('generates NIFTY Option Chain with accurate strikes, PCR, and Max Pain', () => {
    const data = DerivativesService.generateOptionChain('NIFTY', undefined, 24000, 13.5);

    expect(data.underlying).toBe('NIFTY');
    expect(data.spotPrice).toBe(24000);
    expect(data.strikes.length).toBeGreaterThanOrEqual(20);

    // ATM strike should be 24000
    const atm = data.strikes.find(s => s.isAtm);
    expect(atm).toBeDefined();
    expect(atm?.strikePrice).toBe(24000);

    // Step should be 50 pts
    const strike0 = data.strikes[0].strikePrice;
    const strike1 = data.strikes[1].strikePrice;
    expect(strike1 - strike0).toBe(50);

    // Total OI and PCR
    expect(data.totalCallOi).toBeGreaterThan(0);
    expect(data.totalPutOi).toBeGreaterThan(0);
    expect(data.pcr).toBeGreaterThan(0);

    // Max Pain calculation should be a valid strike price
    expect(data.maxPainStrike).toBeGreaterThan(23000);
    expect(data.maxPainStrike).toBeLessThan(25000);
    expect(data.maxPainCurve.length).toBe(data.strikes.length);

    // Key walls
    expect(data.highestCallOiStrike).toBeGreaterThan(0);
    expect(data.highestPutOiStrike).toBeGreaterThan(0);
  });

  it('generates BANKNIFTY Option Chain with 100 pt intervals', () => {
    const data = DerivativesService.generateOptionChain('BANKNIFTY', undefined, 57000, 15.2);
    expect(data.underlying).toBe('BANKNIFTY');
    expect(data.strikes[1].strikePrice - data.strikes[0].strikePrice).toBe(100);
  });
});
