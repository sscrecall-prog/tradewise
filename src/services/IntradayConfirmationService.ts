import { MarketQuote, TradeDirection } from '../types';
import { TradingCalculationService } from './TradingCalculationService';

export type IntradayVerdict = 
  | 'STRONG_BUY' 
  | 'MODERATE_BUY' 
  | 'NO_TRADE_CHOP' 
  | 'MODERATE_SELL' 
  | 'STRONG_SELL';

export type OpenDriveType = 'OPEN_LOW' | 'OPEN_HIGH' | 'NORMAL';
export type CPRType = 'NARROW' | 'MODERATE' | 'WIDE';

export interface IntradayPillar {
  id: string;
  name: string;
  badge: string;
  description: string;
  passed: boolean;
  scoreContribution: number;
  maxScore: number;
  bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}

export interface CPRLevels {
  pivot: number;
  bottomCPR: number;
  topCPR: number;
  cprWidthPercent: number;
  cprType: CPRType;
  isAboveCPR: boolean;
  isBelowCPR: boolean;
}

export interface CamarillaLevels {
  h4: number; // Breakout Buy
  h3: number; // Resistance / Mean Reversion Short
  l3: number; // Support / Mean Reversion Long
  l4: number; // Breakdown Short
  status: 'H4_BREAKOUT' | 'H3_RESISTANCE' | 'L4_BREAKDOWN' | 'L3_SUPPORT' | 'INSIDE_RANGE';
}

export interface IntradayTradeBlueprint {
  action: TradeDirection | 'WAIT';
  entryPrice: number;
  stopLoss: number;
  target1: number;
  target2: number;
  riskPerShare: number;
  reward1PerShare: number;
  reward2PerShare: number;
  riskRewardRatio: string;
  recommendedQuantity: number;
  marginRequired: number;
  netProfitTarget1: number;
  netProfitTarget2: number;
  totalChargesEst: number;
  strategyRationale: string;
}

export interface IntradayConfirmationReport {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  vwap: number;
  vwapDeviationPercent: number;
  openDrive: OpenDriveType;
  score: number; // 0 to 100
  verdict: IntradayVerdict;
  verdictTitle: string;
  verdictDescription: string;
  cpr: CPRLevels;
  camarilla: CamarillaLevels;
  pillars: IntradayPillar[];
  blueprint: IntradayTradeBlueprint;
  rvol: number;
  alphaVsNifty: number;
  analyzedAt: string;
}

function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export class IntradayConfirmationService {
  /**
   * Analyzes any Indian stock quote against real-time market confluence metrics.
   */
  static analyzeStock(
    quote: MarketQuote,
    niftyChangePercent: number = 0.45,
    sectorAvgChangePercent?: number
  ): IntradayConfirmationReport {
    const price = quote.price;
    const open = quote.open || price;
    const high = Math.max(quote.high || price, price, open);
    const low = Math.min(quote.low || price, price, open);
    const prevClose = quote.prevClose || open;
    const volume = quote.volume || 250000;
    const range = Math.max(0.1, high - low);

    // 1. Calculate Intraday VWAP approximation (Close-weighted Volume Curve)
    const vwap = round2((open + 2 * high + 2 * low + 3 * price) / 8);
    const vwapDeviationPercent = round2(((price - vwap) / vwap) * 100);

    // 2. Open = Low (Pavitra Bullish) / Open = High (Pavitra Bearish) Detection
    const openLowDiff = Math.abs(open - low) / Math.max(1, open) * 100;
    const openHighDiff = Math.abs(high - open) / Math.max(1, open) * 100;

    let openDrive: OpenDriveType = 'NORMAL';
    if (openLowDiff <= 0.12 && price > open) {
      openDrive = 'OPEN_LOW';
    } else if (openHighDiff <= 0.12 && price < open) {
      openDrive = 'OPEN_HIGH';
    }

    // 3. Central Pivot Range (CPR) Calculations
    const pivot = round2((high + low + prevClose) / 3);
    const bottomCPR = round2((high + low) / 2);
    const topCPR = round2((pivot - bottomCPR) + pivot);
    const cprWidthPercent = round2((Math.abs(topCPR - bottomCPR) / pivot) * 100);
    const cprType: CPRType = cprWidthPercent <= 0.35 ? 'NARROW' : cprWidthPercent >= 0.85 ? 'WIDE' : 'MODERATE';
    const isAboveCPR = price > Math.max(topCPR, bottomCPR);
    const isBelowCPR = price < Math.min(topCPR, bottomCPR);

    // 4. Camarilla Pivot Levels
    const h4 = round2(price + (range * 1.1) / 2);
    const h3 = round2(price + (range * 1.1) / 4);
    const l3 = round2(price - (range * 1.1) / 4);
    const l4 = round2(price - (range * 1.1) / 2);

    let camarillaStatus: CamarillaLevels['status'] = 'INSIDE_RANGE';
    if (price >= h4) camarillaStatus = 'H4_BREAKOUT';
    else if (price >= h3) camarillaStatus = 'H3_RESISTANCE';
    else if (price <= l4) camarillaStatus = 'L4_BREAKDOWN';
    else if (price <= l3) camarillaStatus = 'L3_SUPPORT';

    // 5. Alpha vs Nifty 50
    const alphaVsNifty = round2(quote.changePercent - niftyChangePercent);

    // 6. Sector Tailwind
    const sectorChange = typeof sectorAvgChangePercent === 'number' 
      ? sectorAvgChangePercent 
      : (quote.changePercent * 0.7);

    // 7. Relative Volume (RVOL)
    const benchmarkExpectedVolume = Math.max(200000, price * 120);
    const rvol = round2(Math.max(0.6, Math.min(3.8, volume / benchmarkExpectedVolume)));

    // -------------------------------------------------------------
    // Compute 6-Pillars & Confluence Score (0 to 100)
    // -------------------------------------------------------------
    const pillars: IntradayPillar[] = [];
    let rawBullishPoints = 0;

    // Pillar 1: VWAP Trend & Slope (20 pts)
    const isAboveVwap = price >= vwap;
    const vwapPoints = isAboveVwap ? 20 : (vwapDeviationPercent > -0.5 ? 8 : 0);
    rawBullishPoints += vwapPoints;
    pillars.push({
      id: 'vwap',
      name: 'VWAP Institutional Anchor',
      badge: isAboveVwap ? 'Above VWAP' : 'Below VWAP',
      description: isAboveVwap 
        ? `Trading above VWAP (₹${vwap.toFixed(2)}) with +${vwapDeviationPercent}% premium. Institutions are buyers.`
        : `Trading below VWAP (₹${vwap.toFixed(2)}). Intraday sellers dominant.`,
      passed: isAboveVwap,
      scoreContribution: vwapPoints,
      maxScore: 20,
      bias: isAboveVwap ? 'BULLISH' : 'BEARISH'
    });

    // Pillar 2: Open Drive Setup (20 pts)
    let openPoints = 10;
    let openBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
    let openDesc = 'Normal market open within initial balance.';
    if (openDrive === 'OPEN_LOW') {
      openPoints = 20;
      openBias = 'BULLISH';
      openDesc = 'Pavitra Open=Low setup detected (0 downside wick). Strong morning buyer aggression.';
    } else if (openDrive === 'OPEN_HIGH') {
      openPoints = 0;
      openBias = 'BEARISH';
      openDesc = 'Pavitra Open=High rejection detected (0 upside wick). Morning sellers pinned open.';
    } else {
      const clv = ((price - low) / range) * 100;
      if (clv >= 65) {
        openPoints = 15;
        openBias = 'BULLISH';
        openDesc = `Strong close location (${clv.toFixed(0)}% CLV) near day high.`;
      } else if (clv <= 35) {
        openPoints = 3;
        openBias = 'BEARISH';
        openDesc = `Weak close location (${clv.toFixed(0)}% CLV) near day low.`;
      }
    }
    rawBullishPoints += openPoints;
    pillars.push({
      id: 'open-drive',
      name: 'Opening Drive & Structure',
      badge: openDrive === 'OPEN_LOW' ? 'OPEN = LOW' : openDrive === 'OPEN_HIGH' ? 'OPEN = HIGH' : 'Range Close',
      description: openDesc,
      passed: openPoints >= 12,
      scoreContribution: openPoints,
      maxScore: 20,
      bias: openBias
    });

    // Pillar 3: CPR & Camarilla Level Confluence (15 pts)
    let cprPoints = 5;
    let cprBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
    if (isAboveCPR || price >= h3) {
      cprPoints = isAboveCPR && price >= h3 ? 15 : 10;
      cprBias = 'BULLISH';
    } else if (isBelowCPR || price <= l3) {
      cprPoints = 0;
      cprBias = 'BEARISH';
    }
    rawBullishPoints += cprPoints;
    pillars.push({
      id: 'cpr-pivots',
      name: 'CPR & Camarilla Confluence',
      badge: `${cprType} CPR • ${isAboveCPR ? 'Above CPR' : isBelowCPR ? 'Below CPR' : 'Inside CPR'}`,
      description: isAboveCPR 
        ? `Price holding firmly above CPR (TC: ₹${topCPR.toFixed(2)}). Bullish breakout territory.`
        : isBelowCPR 
        ? `Price cracked below CPR floor (BC: ₹${bottomCPR.toFixed(2)}). Bearish breakdown territory.`
        : `Oscillating within CPR. Expect choppy mean-reverting action.`,
      passed: cprPoints >= 10,
      scoreContribution: cprPoints,
      maxScore: 15,
      bias: cprBias
    });

    // Pillar 4: Relative Strength vs NIFTY 50 (15 pts)
    let alphaPoints = 5;
    let alphaBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
    if (alphaVsNifty >= 0.5) {
      alphaPoints = 15;
      alphaBias = 'BULLISH';
    } else if (alphaVsNifty >= 0) {
      alphaPoints = 10;
      alphaBias = 'BULLISH';
    } else if (alphaVsNifty <= -0.5) {
      alphaPoints = 0;
      alphaBias = 'BEARISH';
    }
    rawBullishPoints += alphaPoints;
    pillars.push({
      id: 'relative-strength',
      name: 'Alpha vs NIFTY 50 Benchmark',
      badge: `${alphaVsNifty >= 0 ? '+' : ''}${alphaVsNifty.toFixed(2)}% Alpha`,
      description: alphaVsNifty >= 0
        ? `Outperforming benchmark NIFTY by +${alphaVsNifty.toFixed(2)}%. High institutional buying interest.`
        : `Underperforming NIFTY 50 by ${alphaVsNifty.toFixed(2)}%. Relative intraday weakness.`,
      passed: alphaPoints >= 10,
      scoreContribution: alphaPoints,
      maxScore: 15,
      bias: alphaBias
    });

    // Pillar 5: Sector Tailwind Alignment (15 pts)
    let sectorPoints = 5;
    let sectorBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
    const isSectorBullish = sectorChange >= 0.2;
    const isSectorBearish = sectorChange <= -0.2;

    if (quote.changePercent > 0 && isSectorBullish) {
      sectorPoints = 15;
      sectorBias = 'BULLISH';
    } else if (quote.changePercent < 0 && isSectorBearish) {
      sectorPoints = 0; // Bearish confirmation
      sectorBias = 'BEARISH';
    } else if (quote.changePercent > 0 && isSectorBearish) {
      // Divergence Warning: Stock going up while sector is bleeding
      sectorPoints = 4;
      sectorBias = 'NEUTRAL';
    } else {
      sectorPoints = 8;
    }
    rawBullishPoints += sectorPoints;
    pillars.push({
      id: 'sector-tailwind',
      name: 'Sector Alignment',
      badge: `${quote.sector || 'NSE Equity'} (${sectorChange >= 0 ? '+' : ''}${sectorChange.toFixed(2)}%)`,
      description: sectorPoints === 15
        ? `Full sector tailwind. Sector index is supporting stock's upward momentum.`
        : sectorPoints === 4
        ? `Divergence Warning: Sector is red while stock is green. High risk of bull trap.`
        : `Sector alignment is neutral or mildly supportive.`,
      passed: sectorPoints >= 10,
      scoreContribution: sectorPoints,
      maxScore: 15,
      bias: sectorBias
    });

    // Pillar 6: Relative Volume (RVOL) Expansion (15 pts)
    let rvolPoints = 5;
    let rvolBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
    if (rvol >= 1.6) {
      rvolPoints = 15;
      rvolBias = quote.changePercent >= 0 ? 'BULLISH' : 'BEARISH';
    } else if (rvol >= 1.1) {
      rvolPoints = 10;
      rvolBias = quote.changePercent >= 0 ? 'BULLISH' : 'BEARISH';
    } else {
      rvolPoints = 3;
    }
    rawBullishPoints += rvolPoints;
    pillars.push({
      id: 'rvol',
      name: 'Volume Expansion (RVOL)',
      badge: `${rvol.toFixed(1)}x RVOL`,
      description: rvol >= 1.6
        ? `High volume expansion (${rvol.toFixed(1)}x normal). Confirms heavy institutional participation.`
        : rvol >= 1.1
        ? `Healthy intraday volume (${rvol.toFixed(1)}x average).`
        : `Subdued volume (${rvol.toFixed(1)}x). Breakouts prone to low-volume failure.`,
      passed: rvolPoints >= 10,
      scoreContribution: rvolPoints,
      maxScore: 15,
      bias: rvolBias
    });

    // Final Composite Score (0 to 100)
    const score = Math.max(5, Math.min(98, Math.round(rawBullishPoints)));

    let verdict: IntradayVerdict = 'NO_TRADE_CHOP';
    let verdictTitle = 'NO TRADE / CHOP ZONE';
    let verdictDescription = 'Mixed indicator confluence. Wait for clear VWAP/CPR resolution before deploying capital.';

    if (score >= 80) {
      verdict = 'STRONG_BUY';
      verdictTitle = 'STRONG BUY (HIGH PROBABILITY)';
      verdictDescription = '5+ institutional pillars aligned bullish. High conviction Long momentum setup.';
    } else if (score >= 62) {
      verdict = 'MODERATE_BUY';
      verdictTitle = 'MODERATE BUY';
      verdictDescription = 'Favorable bullish structure. Safe for systematic pullback entry above VWAP.';
    } else if (score <= 25) {
      verdict = 'STRONG_SELL';
      verdictTitle = 'STRONG SELL (HIGH PROBABILITY SHORT)';
      verdictDescription = 'Institutional dumping detected. Breakdown confirmed below VWAP and CPR.';
    } else if (score <= 40) {
      verdict = 'MODERATE_SELL';
      verdictTitle = 'MODERATE SELL / SHORT';
      verdictDescription = 'Bearish pressure building. Suitable for short scalps below day pivot.';
    }

    // -------------------------------------------------------------
    // Dynamic ATR-Based Trade Blueprint (Entry, SL, Targets & Taxes)
    // -------------------------------------------------------------
    const isLong = verdict === 'STRONG_BUY' || verdict === 'MODERATE_BUY';
    const isShort = verdict === 'STRONG_SELL' || verdict === 'MODERATE_SELL';
    const action: TradeDirection | 'WAIT' = isLong ? 'BUY' : isShort ? 'SELL' : 'WAIT';

    // Dynamic ATR: 0.9% to 1.8% of share price
    const atr = Math.max(price * 0.009, range * 0.75);

    let entryPrice = price;
    let stopLoss = isLong ? round2(price - 1.15 * atr) : round2(price + 1.15 * atr);
    
    // Ensure SL doesn't violate day low/high boundaries
    if (isLong) {
      stopLoss = Math.min(stopLoss, round2(Math.min(vwap, low)));
      // Safeguard distance
      if (entryPrice - stopLoss < price * 0.004) {
        stopLoss = round2(entryPrice - price * 0.007);
      }
    } else if (isShort) {
      stopLoss = Math.max(stopLoss, round2(Math.max(vwap, high)));
      if (stopLoss - entryPrice < price * 0.004) {
        stopLoss = round2(entryPrice + price * 0.007);
      }
    }

    const riskPerShare = round2(Math.abs(entryPrice - stopLoss));
    const reward1PerShare = round2(riskPerShare * 1.5);
    const reward2PerShare = round2(riskPerShare * 2.5);

    const target1 = isLong ? round2(entryPrice + reward1PerShare) : round2(entryPrice - reward1PerShare);
    const target2 = isLong ? round2(entryPrice + reward2PerShare) : round2(entryPrice - reward2PerShare);

    // Position sizing calculation (standard 100 qty baseline for easy reference)
    const baseQty = Math.max(1, Math.floor(50000 / Math.max(1, price / 5)));
    const recommendedQuantity = Math.min(500, Math.max(10, Math.round(baseQty / 5) * 5));
    const marginRequired = round2((price * recommendedQuantity) / 5);

    // Real Indian regulatory charges (Zerodha / Angel One schedule)
    const estCharges = TradingCalculationService.calculateOrderCharges(
      price,
      recommendedQuantity,
      isLong ? 'BUY' : 'SELL',
      true
    );

    const grossProfitT1 = round2(reward1PerShare * recommendedQuantity);
    const grossProfitT2 = round2(reward2PerShare * recommendedQuantity);
    const netProfitTarget1 = round2(grossProfitT1 - estCharges.totalCharges * 2);
    const netProfitTarget2 = round2(grossProfitT2 - estCharges.totalCharges * 2);

    const blueprint: IntradayTradeBlueprint = {
      action,
      entryPrice,
      stopLoss,
      target1,
      target2,
      riskPerShare,
      reward1PerShare,
      reward2PerShare,
      riskRewardRatio: '1 : 1.5',
      recommendedQuantity,
      marginRequired,
      netProfitTarget1,
      netProfitTarget2,
      totalChargesEst: round2(estCharges.totalCharges * 2),
      strategyRationale: isLong
        ? `Long entry @ ₹${entryPrice.toFixed(2)} with SL @ ₹${stopLoss.toFixed(2)} (Risk: ₹${riskPerShare.toFixed(2)}). Target 1 @ ₹${target1.toFixed(2)} gives 1:1.5 R:R.`
        : isShort
        ? `Short entry @ ₹${entryPrice.toFixed(2)} with SL @ ₹${stopLoss.toFixed(2)} (Risk: ₹${riskPerShare.toFixed(2)}). Target 1 @ ₹${target1.toFixed(2)} gives 1:1.5 R:R.`
        : 'Wait for decisive breakout above VWAP or breakdown below CPR before initiating intraday positions.'
    };

    return {
      symbol: quote.symbol,
      name: quote.name,
      sector: quote.sector || 'NSE Listed',
      price,
      change: quote.change,
      changePercent: quote.changePercent,
      vwap,
      vwapDeviationPercent,
      openDrive,
      score,
      verdict,
      verdictTitle,
      verdictDescription,
      cpr: {
        pivot,
        bottomCPR,
        topCPR,
        cprWidthPercent,
        cprType,
        isAboveCPR,
        isBelowCPR
      },
      camarilla: {
        h4,
        h3,
        l3,
        l4,
        status: camarillaStatus
      },
      pillars,
      blueprint,
      rvol,
      alphaVsNifty,
      analyzedAt: new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    };
  }

  /**
   * Scans a list of quotes to rank the Top Strongest Buy and Sell Setups
   */
  static scanTopSetups(
    quotes: MarketQuote[],
    niftyChangePercent: number = 0.45
  ): { topBuys: IntradayConfirmationReport[]; topSells: IntradayConfirmationReport[] } {
    if (!quotes || quotes.length === 0) {
      return { topBuys: [], topSells: [] };
    }

    const analyzedList = quotes
      .filter(q => q.price > 10 && q.symbol !== 'NIFTY 50' && q.symbol !== 'BANK NIFTY')
      .map(q => this.analyzeStock(q, niftyChangePercent));

    // Sort top buys by highest confluence score
    const topBuys = analyzedList
      .filter(r => r.score >= 60)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    // Sort top sells by lowest confluence score
    const topSells = analyzedList
      .filter(r => r.score <= 40)
      .sort((a, b) => a.score - b.score)
      .slice(0, 8);

    return { topBuys, topSells };
  }
}
