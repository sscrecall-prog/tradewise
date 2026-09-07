import {
  OptionChainData,
  OptionStrikeRow,
  OptionLegData,
  OptionBuildUpType,
  VixRiskGuidance
} from '../types';

export class DerivativesService {
  /**
   * Determine option strike build-up classification based on price and OI deltas.
   */
  static determineBuildUp(priceChange: number, oiChange: number): OptionBuildUpType {
    if (priceChange >= 0 && oiChange >= 0) {
      return 'LONG_BUILDUP';
    } else if (priceChange < 0 && oiChange >= 0) {
      return 'SHORT_BUILDUP';
    } else if (priceChange >= 0 && oiChange < 0) {
      return 'SHORT_COVERING';
    } else {
      return 'LONG_UNWINDING';
    }
  }

  /**
   * Evaluates India VIX and returns dynamic risk management and position sizing guidance.
   */
  static evaluateVixRisk(vixValue: number): VixRiskGuidance {
    if (vixValue < 12) {
      return {
        regime: 'LOW_VOLATILITY',
        vixValue,
        title: 'Low Volatility Trap (VIX < 12)',
        description: 'Option premiums are severely underpriced. High vega expansion risk for option sellers; range breakouts imminent.',
        stopLossMultiplier: 1.0,
        positionSizeFactor: 1.0,
        recommendation: 'Avoid selling far OTM naked options. Favour debit spreads or waiting for volatility expansion.'
      };
    } else if (vixValue <= 18) {
      return {
        regime: 'NORMAL',
        vixValue,
        title: 'Optimal Volatility Regime (12 — 18)',
        description: 'Balanced market conditions. Technical levels and options pricing reflect standard statistical distributions.',
        stopLossMultiplier: 1.0,
        positionSizeFactor: 1.0,
        recommendation: 'Standard 1R position sizing. Trade predefined setups with standard technical stop losses.'
      };
    } else if (vixValue <= 24) {
      return {
        regime: 'HIGH_VOLATILITY',
        vixValue,
        title: 'High Volatility Gamma Storm (VIX > 18)',
        description: 'Large intraday swings and fast theta/gamma velocity. Normal tight stop losses will get whipped out by market noise.',
        stopLossMultiplier: 1.5,
        positionSizeFactor: 0.5,
        recommendation: 'Widen technical stop losses by 1.5x and CUT POSITION SIZE BY 50% to protect account equity.'
      };
    } else {
      return {
        regime: 'EXTREME_VOLATILITY',
        vixValue,
        title: 'Extreme Volatility Circuit Warning (VIX > 24)',
        description: 'Crisis or election/budget event regime. Severe slippage, wide bid-ask spreads, and overnight gap risk.',
        stopLossMultiplier: 2.0,
        positionSizeFactor: 0.25,
        recommendation: 'Reduce position sizing by 75% or trade intraday cash only until VIX cools below 20.'
      };
    }
  }

  /**
   * Calculates PCR and provides market sentiment classification.
   */
  static interpretPcr(pcr: number): {
    sentiment: 'EXTREME_BEARISH' | 'BEARISH' | 'NEUTRAL' | 'BULLISH' | 'EXTREME_BULLISH';
    description: string;
  } {
    if (pcr > 1.35) {
      return {
        sentiment: 'EXTREME_BULLISH',
        description: 'Heavy Put writing floor. Market is heavily bullish or overbought; watch for potential mean-reversion exhaustion.'
      };
    } else if (pcr >= 1.10) {
      return {
        sentiment: 'BULLISH',
        description: 'Put writers in firm control. Strong dip-buying support across technical key levels.'
      };
    } else if (pcr >= 0.85) {
      return {
        sentiment: 'NEUTRAL',
        description: 'Balanced open interest between Call and Put writers. Range-bound consolidation or sideways chop likely.'
      };
    } else if (pcr >= 0.65) {
      return {
        sentiment: 'BEARISH',
        description: 'Call writers dominating overhead. Resistance walls heavy, sellers in control on rallies.'
      };
    } else {
      return {
        sentiment: 'EXTREME_BEARISH',
        description: 'Extreme Call writing / oversold conditions. High chance of short covering bounce or gamma spike.'
      };
    }
  }

  /**
   * Generates a complete, mathematically coherent Option Chain snapshot with OI, PCR, Max Pain, and VIX sizing.
   */
  static generateOptionChain(
    underlying: 'NIFTY' | 'BANKNIFTY' | 'FINNIFTY' | 'SENSEX' = 'NIFTY',
    customExpiry?: string,
    liveSpotPrice?: number,
    customVix: number = 13.4
  ): OptionChainData {
    // Underlying configurations
    const configs = {
      NIFTY: {
        name: 'NIFTY 50',
        defaultSpot: 23914.45,
        defaultChange: -165.95,
        step: 50,
        strikesCount: 23,
        basis: 42.50
      },
      BANKNIFTY: {
        name: 'BANK NIFTY',
        defaultSpot: 57172.00,
        defaultChange: -852.90,
        step: 100,
        strikesCount: 23,
        basis: 110.00
      },
      FINNIFTY: {
        name: 'NIFTY FINANCIAL SERVICES',
        defaultSpot: 25813.05,
        defaultChange: -190.85,
        step: 50,
        strikesCount: 21,
        basis: 38.00
      },
      SENSEX: {
        name: 'BSE SENSEX',
        defaultSpot: 76570.35,
        defaultChange: -386.95,
        step: 100,
        strikesCount: 21,
        basis: 145.00
      }
    };

    const cfg = configs[underlying] || configs.NIFTY;
    const spot = liveSpotPrice && liveSpotPrice > 0 ? liveSpotPrice : cfg.defaultSpot;
    const spotChange = cfg.defaultChange;
    const spotChangePercent = Math.round((spotChange / spot) * 10000) / 100;
    const futuresPrice = Math.round((spot + cfg.basis) * 100) / 100;

    // Available weekly & monthly expiries
    const availableExpiries = [
      '10-Sep-2026 (Weekly)',
      '17-Sep-2026 (Weekly)',
      '24-Sep-2026 (Monthly)',
      '29-Oct-2026 (Monthly)'
    ];
    const expiryDate = customExpiry || availableExpiries[0];

    // Find ATM strike
    const atmStrike = Math.round(spot / cfg.step) * cfg.step;
    const halfCount = Math.floor(cfg.strikesCount / 2);
    const startStrike = atmStrike - (halfCount * cfg.step);

    const strikes: OptionStrikeRow[] = [];
    let totalCallOi = 0;
    let totalPutOi = 0;
    let totalCallVolume = 0;
    let totalPutVolume = 0;

    let highestCallOi = 0;
    let highestCallOiStrike = atmStrike + (cfg.step * 4);
    let highestPutOi = 0;
    let highestPutOiStrike = atmStrike - (cfg.step * 4);

    for (let i = 0; i < cfg.strikesCount; i++) {
      const strike = startStrike + (i * cfg.step);
      const isAtm = strike === atmStrike;
      const distanceFromAtm = strike - atmStrike;
      const distanceSteps = Math.abs(distanceFromAtm) / cfg.step;

      // Base IV around 12-16%
      const baseIv = Math.round((12.8 + (distanceSteps * 0.25)) * 10) / 10;

      // Call Option Modeling
      const isCallItm = strike < spot;
      const callIntrinsic = Math.max(0, spot - strike);
      const callTimeValue = Math.max(12, (cfg.step * 1.8) * Math.exp(-distanceSteps * 0.18));
      const callLtp = Math.round((callIntrinsic + callTimeValue) * 100) / 100;
      const callPriceChange = Math.round((spotChange * (isCallItm ? 0.75 : 0.35) * (1 - (distanceSteps * 0.04))) * 100) / 100;

      // Call OI distribution: High resistance walls above ATM
      const callOiMultiplier = strike >= atmStrike ? Math.max(0.6, 1.8 - (Math.abs(strike - (atmStrike + cfg.step * 2)) / (cfg.step * 5))) : 0.45;
      const callBaseContracts = underlying === 'BANKNIFTY' ? 45000 : 85000;
      const callOi = Math.round(callBaseContracts * callOiMultiplier * (1 + (Math.sin(i * 1.2) * 0.25)));
      const callChangeOi = Math.round(callOi * (spotChange < 0 ? 0.14 : -0.06));
      const callChangeOiPercent = Math.round((callChangeOi / (callOi - callChangeOi || 1)) * 1000) / 10;
      const callVolume = Math.round(callOi * 2.8);

      const callBuildUp = this.determineBuildUp(callPriceChange, callChangeOi);

      // Put Option Modeling
      const isPutItm = strike > spot;
      const putIntrinsic = Math.max(0, strike - spot);
      const putTimeValue = Math.max(12, (cfg.step * 1.8) * Math.exp(-distanceSteps * 0.18));
      const putLtp = Math.round((putIntrinsic + putTimeValue) * 100) / 100;
      const putPriceChange = Math.round((-spotChange * (isPutItm ? 0.75 : 0.35) * (1 - (distanceSteps * 0.04))) * 100) / 100;

      // Put OI distribution: High support floors below ATM
      const putOiMultiplier = strike <= atmStrike ? Math.max(0.6, 1.8 - (Math.abs(strike - (atmStrike - cfg.step * 2)) / (cfg.step * 5))) : 0.45;
      const putBaseContracts = underlying === 'BANKNIFTY' ? 42000 : 82000;
      const putOi = Math.round(putBaseContracts * putOiMultiplier * (1 + (Math.cos(i * 1.2) * 0.25)));
      const putChangeOi = Math.round(putOi * (spotChange < 0 ? -0.08 : 0.15));
      const putChangeOiPercent = Math.round((putChangeOi / (putOi - putChangeOi || 1)) * 1000) / 10;
      const putVolume = Math.round(putOi * 2.8);

      const putBuildUp = this.determineBuildUp(putPriceChange, putChangeOi);

      // Accumulate totals
      totalCallOi += callOi;
      totalPutOi += putOi;
      totalCallVolume += callVolume;
      totalPutVolume += putVolume;

      if (callOi > highestCallOi) {
        highestCallOi = callOi;
        highestCallOiStrike = strike;
      }
      if (putOi > highestPutOi) {
        highestPutOi = putOi;
        highestPutOiStrike = strike;
      }

      const callLeg: OptionLegData = {
        oi: callOi,
        changeOi: callChangeOi,
        changeOiPercent: callChangeOiPercent,
        volume: callVolume,
        ltp: callLtp,
        change: callPriceChange,
        changePercent: Math.round((callPriceChange / (callLtp - callPriceChange || 1)) * 1000) / 10,
        iv: baseIv,
        buildUp: callBuildUp
      };

      const putLeg: OptionLegData = {
        oi: putOi,
        changeOi: putChangeOi,
        changeOiPercent: putChangeOiPercent,
        volume: putVolume,
        ltp: putLtp,
        change: putPriceChange,
        changePercent: Math.round((putPriceChange / (putLtp - putPriceChange || 1)) * 1000) / 10,
        iv: baseIv,
        buildUp: putBuildUp
      };

      strikes.push({
        strikePrice: strike,
        call: callLeg,
        put: putLeg,
        isAtm,
        distanceFromAtm
      });
    }

    // Put-Call Ratio
    const pcr = totalCallOi > 0 ? Math.round((totalPutOi / totalCallOi) * 100) / 100 : 1.0;
    const { sentiment: pcrSentiment, description: pcrDescription } = this.interpretPcr(pcr);

    // Max Pain Algorithm Calculation
    // Total Loss for option buyers at settlement S:
    // Call loss = sum(CallOI * max(0, S - K))
    // Put loss = sum(PutOI * max(0, K - S))
    const maxPainCurve: { strike: number; totalLossRupees: number }[] = [];
    let minTotalLoss = Infinity;
    let maxPainStrike = atmStrike;

    strikes.forEach(targetStrike => {
      const S = targetStrike.strikePrice;
      let totalLoss = 0;

      strikes.forEach(s => {
        const K = s.strikePrice;
        // Call loss (payout to buyer = S - K if S > K)
        const callPayout = Math.max(0, S - K) * s.call.oi;
        // Put loss (payout to buyer = K - S if K > S)
        const putPayout = Math.max(0, K - S) * s.put.oi;
        totalLoss += (callPayout + putPayout);
      });

      maxPainCurve.push({
        strike: S,
        totalLossRupees: Math.round(totalLoss)
      });

      if (totalLoss < minTotalLoss) {
        minTotalLoss = totalLoss;
        maxPainStrike = S;
      }
    });

    // India VIX Risk Engine
    const vixRisk = this.evaluateVixRisk(customVix);

    return {
      underlying,
      underlyingName: cfg.name,
      spotPrice: spot,
      spotChange,
      spotChangePercent,
      futuresPrice,
      futuresBasis: cfg.basis,
      expiryDate,
      availableExpiries,
      totalCallOi,
      totalPutOi,
      totalCallVolume,
      totalPutVolume,
      pcr,
      pcrSentiment,
      pcrDescription,
      maxPainStrike,
      highestCallOiStrike,
      highestPutOiStrike,
      indiaVix: customVix,
      vixRisk,
      strikes,
      maxPainCurve,
      lastUpdated: new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    };
  }
}
