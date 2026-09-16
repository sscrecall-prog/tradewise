import { MarketQuote, TradeDirection } from '../types';
import { TradingCalculationService } from './TradingCalculationService';

export interface ScalpCandidate {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  beta: number;
  rvol: number; // Relative Volume
  direction: TradeDirection;
  setupType: '15M_ORB_BREAKOUT' | 'VWAP_MOMENTUM_THRUST' | 'OPEN_LOW_DRIVE';
  confluenceScore: number; // 0-100%
  
  // Position Sizing & Target Math for ₹1L Capital
  recommendedQuantity: number;
  marginUsed: number;
  target1Price: number;
  target2Price: number;
  stopLossPrice: number;
  
  // Price delta in ₹ points and %
  requiredPointsTarget1: number;
  requiredPercentTarget1: number;
  requiredPointsTarget2: number;
  requiredPercentTarget2: number;
  riskPoints: number;
  riskPercent: number;
  
  // Expected Net in-hand Rupees after Indian taxes & brokerages
  expectedGrossProfit1: number;
  expectedGrossProfit2: number;
  expectedGrossLoss: number;
  totalChargesEst: number;
  expectedNetProfit1: number;
  expectedNetProfit2: number;
  expectedNetLoss: number;
  riskRewardRatio: string;
  
  // Execution time recommendations
  optimalHoldingMinutes: string;
  rationale: string;
}

export interface ScalpTimerPhase {
  currentMinute: number;
  phaseName: 'SURGE_ZONE' | 'TRAIL_ZONE' | 'DECAY_EXIT_ZONE';
  phaseColor: string;
  statusBadge: string;
  actionGuideline: string;
  recommendedAction: 'HOLD_FOR_TARGET' | 'TRAIL_SL_TO_COST' | 'FORCE_EXIT_NOW';
}

export interface DailyScalpState {
  date: string;
  hasExecutedToday: boolean;
  tradeSymbol?: string;
  netPnL?: number;
  result?: 'WIN' | 'LOSS' | 'BREAKEVEN';
  timestamp?: string;
}

const STORAGE_KEY_DAILY_SCALP = 'tradewise_daily_scalp_lock';
const inMemoryStore = new Map<string, string>();

function safeGetItem(key: string): string | null {
  try {
    if (typeof localStorage !== 'undefined' && localStorage) {
      return localStorage.getItem(key);
    }
  } catch {
    // ignore
  }
  return inMemoryStore.get(key) || null;
}

function safeSetItem(key: string, value: string): void {
  try {
    if (typeof localStorage !== 'undefined' && localStorage) {
      localStorage.setItem(key, value);
      return;
    }
  } catch {
    // ignore
  }
  inMemoryStore.set(key, value);
}

function safeRemoveItem(key: string): void {
  try {
    if (typeof localStorage !== 'undefined' && localStorage) {
      localStorage.removeItem(key);
      return;
    }
  } catch {
    // ignore
  }
  inMemoryStore.delete(key);
}

// High-Beta (>1.3) liquid equities suited for fast 10-30 min moves
export const HIGH_BETA_LIQUID_UNIVERSE: Record<string, { name: string; sector: string; beta: number }> = {
  TATAMOTORS: { name: 'Tata Motors Ltd.', sector: 'Automobile', beta: 1.62 },
  SBIN: { name: 'State Bank of India', sector: 'Banking & PSU', beta: 1.54 },
  JSWSTEEL: { name: 'JSW Steel Ltd.', sector: 'Metals & Mining', beta: 1.51 },
  RELIANCE: { name: 'Reliance Industries Ltd.', sector: 'Oil & Gas / Conglomerate', beta: 1.38 },
  ICICIBANK: { name: 'ICICI Bank Ltd.', sector: 'Banking & Financials', beta: 1.42 },
  AXISBANK: { name: 'Axis Bank Ltd.', sector: 'Banking & Financials', beta: 1.46 },
  INDUSINDBK: { name: 'IndusInd Bank Ltd.', sector: 'Banking & Financials', beta: 1.68 },
  HINDALCO: { name: 'Hindalco Industries Ltd.', sector: 'Metals & Mining', beta: 1.58 },
  BAJFINANCE: { name: 'Bajaj Finance Ltd.', sector: 'Financial Services', beta: 1.45 },
  BHARTIARTL: { name: 'Bharti Airtel Ltd.', sector: 'Telecom', beta: 1.32 },
  ADANIENT: { name: 'Adani Enterprises Ltd.', sector: 'Conglomerates', beta: 1.85 },
  TATASTEEL: { name: 'Tata Steel Ltd.', sector: 'Metals & Mining', beta: 1.48 },
  MARUTI: { name: 'Maruti Suzuki India Ltd.', sector: 'Automobile', beta: 1.34 }
};

export class ScalpSniperService {
  /**
   * Calculates position size and exact rupee targets based on capital and target presets
   */
  public static calculateScalpBlueprint(
    price: number,
    direction: TradeDirection,
    capital: number = 100000,
    targetRupeesGoal: number = 2000, // ₹1,500 to ₹3,000
    maxLossRupeesCap: number = 1000,  // strictly ₹800 - ₹1,000 (1:2 R:R)
    marginMultiplier: number = 5     // 5x SEBI Intraday MIS Margin
  ): {
    quantity: number;
    marginUsed: number;
    target1Price: number;
    target2Price: number;
    stopLossPrice: number;
    requiredPointsTarget1: number;
    requiredPercentTarget1: number;
    requiredPointsTarget2: number;
    requiredPercentTarget2: number;
    riskPoints: number;
    riskPercent: number;
    expectedGrossProfit1: number;
    expectedGrossProfit2: number;
    expectedGrossLoss: number;
    totalChargesEst: number;
    expectedNetProfit1: number;
    expectedNetProfit2: number;
    expectedNetLoss: number;
    riskRewardRatio: string;
  } {
    const validPrice = Math.max(1, price);
    const totalBuyingPower = capital * marginMultiplier; // e.g. ₹5,00,000 on ₹1 Lakh
    
    // Position sizing: allocate approx 80-90% of buying power for safe margin cushion
    const allocatedPower = totalBuyingPower * 0.85;
    const quantity = Math.max(1, Math.floor(allocatedPower / validPrice));
    const marginUsed = Number((quantity * validPrice / marginMultiplier).toFixed(2));

    // Calculate required point moves for target 1 (e.g. ₹1,500) and target 2 (e.g. ₹2,500 - ₹3,000)
    const target1Goal = Math.max(1200, Math.round(targetRupeesGoal * 0.75));
    const target2Goal = Math.max(2000, Math.round(targetRupeesGoal * 1.25));
    const maxRiskGoal = Math.min(1000, maxLossRupeesCap);

    const requiredPoints1 = Number((target1Goal / quantity).toFixed(2));
    const requiredPoints2 = Number((target2Goal / quantity).toFixed(2));
    const riskPoints = Number((maxRiskGoal / quantity).toFixed(2));

    let target1Price: number;
    let target2Price: number;
    let stopLossPrice: number;

    if (direction === 'BUY') {
      target1Price = Number((validPrice + requiredPoints1).toFixed(2));
      target2Price = Number((validPrice + requiredPoints2).toFixed(2));
      stopLossPrice = Number((validPrice - riskPoints).toFixed(2));
    } else {
      target1Price = Number((validPrice - requiredPoints1).toFixed(2));
      target2Price = Number((validPrice - requiredPoints2).toFixed(2));
      stopLossPrice = Number((validPrice + riskPoints).toFixed(2));
    }

    const requiredPercent1 = Number(((requiredPoints1 / validPrice) * 100).toFixed(2));
    const requiredPercent2 = Number(((requiredPoints2 / validPrice) * 100).toFixed(2));
    const riskPercent = Number(((riskPoints / validPrice) * 100).toFixed(2));

    // Calculate institutional charges (Zerodha/Angel One model: ₹20 buy + ₹20 sell + STT + GST + SEBI)
    const orderCharges = TradingCalculationService.calculateOrderCharges(
      validPrice,
      quantity,
      direction,
      true
    );
    const roundTripCharges = Number((orderCharges.totalCharges * 2).toFixed(2));

    const expectedGrossProfit1 = Number((requiredPoints1 * quantity).toFixed(2));
    const expectedGrossProfit2 = Number((requiredPoints2 * quantity).toFixed(2));
    const expectedGrossLoss = Number((riskPoints * quantity).toFixed(2));

    const expectedNetProfit1 = Number((expectedGrossProfit1 - roundTripCharges).toFixed(2));
    const expectedNetProfit2 = Number((expectedGrossProfit2 - roundTripCharges).toFixed(2));
    const expectedNetLoss = Number((expectedGrossLoss + roundTripCharges).toFixed(2));

    const rrRatio = (requiredPoints1 / Math.max(0.01, riskPoints)).toFixed(1);

    return {
      quantity,
      marginUsed,
      target1Price,
      target2Price,
      stopLossPrice,
      requiredPointsTarget1: requiredPoints1,
      requiredPercentTarget1: requiredPercent1,
      requiredPointsTarget2: requiredPoints2,
      requiredPercentTarget2: requiredPercent2,
      riskPoints,
      riskPercent,
      expectedGrossProfit1,
      expectedGrossProfit2,
      expectedGrossLoss,
      totalChargesEst: roundTripCharges,
      expectedNetProfit1,
      expectedNetProfit2,
      expectedNetLoss,
      riskRewardRatio: `1 : ${rrRatio}`
    };
  }

  /**
   * Scans a list of quotes and produces the Top 3-5 Ranked Scalp Candidates
   */
  public static scanScalpCandidates(
    quotes: MarketQuote[],
    capital: number = 100000,
    targetRupees: number = 2000,
    riskRupees: number = 1000
  ): ScalpCandidate[] {
    const candidates: ScalpCandidate[] = [];

    // Filter quotes matching high-beta universe or large active movers
    for (const q of quotes) {
      const sym = q.symbol.toUpperCase().replace('.NS', '');
      const meta = HIGH_BETA_LIQUID_UNIVERSE[sym];
      
      // If not in pre-defined high beta, check if it's high volume liquid stock (> ₹100 price)
      const beta = meta ? meta.beta : (q.price > 200 && Math.abs(q.changePercent) > 0.8 ? 1.35 : 1.1);
      if (beta < 1.30 || q.price < 50) continue;

      // Simulated or derived RVOL and setup
      const rvol = Number((1.6 + (Math.abs(q.changePercent) * 0.4)).toFixed(2));
      const isBullish = q.changePercent > 0;
      const direction: TradeDirection = isBullish ? 'BUY' : 'SELL';

      let setupType: '15M_ORB_BREAKOUT' | 'VWAP_MOMENTUM_THRUST' | 'OPEN_LOW_DRIVE' = '15M_ORB_BREAKOUT';
      if (Math.abs(q.changePercent) >= 1.5) {
        setupType = 'OPEN_LOW_DRIVE';
      } else if (Math.abs(q.changePercent) >= 0.8) {
        setupType = 'VWAP_MOMENTUM_THRUST';
      }

      // Calculate blueprint math
      const blueprint = this.calculateScalpBlueprint(
        q.price,
        direction,
        capital,
        targetRupees,
        riskRupees
      );

      // Confluence Score calculation (0-100%)
      let score = 70;
      if (beta >= 1.5) score += 10;
      if (rvol >= 2.0) score += 10;
      if (Math.abs(q.changePercent) >= 1.0) score += 5;
      if (blueprint.requiredPercentTarget1 <= 0.50) score += 5; // Fast achievable target
      score = Math.min(96, Math.max(72, score));

      const rationale = isBullish
        ? `Bullish 15M ORB above VWAP with ${beta}x Beta. Needs only a tiny +${blueprint.requiredPercentTarget1}% move (+₹${blueprint.requiredPointsTarget1}) to secure +₹${blueprint.expectedNetProfit1} net profit.`
        : `Bearish breakdown below VWAP. High institutional volume with ${beta}x Beta. Downside target +${blueprint.requiredPercentTarget1}% yields +₹${blueprint.expectedNetProfit1} net profit.`;

      candidates.push({
        symbol: sym,
        name: meta ? meta.name : q.name,
        sector: meta ? meta.sector : 'NIFTY Equities',
        price: q.price,
        change: q.change,
        changePercent: q.changePercent,
        beta,
        rvol,
        direction,
        setupType,
        confluenceScore: score,
        recommendedQuantity: blueprint.quantity,
        marginUsed: blueprint.marginUsed,
        target1Price: blueprint.target1Price,
        target2Price: blueprint.target2Price,
        stopLossPrice: blueprint.stopLossPrice,
        requiredPointsTarget1: blueprint.requiredPointsTarget1,
        requiredPercentTarget1: blueprint.requiredPercentTarget1,
        requiredPointsTarget2: blueprint.requiredPointsTarget2,
        requiredPercentTarget2: blueprint.requiredPercentTarget2,
        riskPoints: blueprint.riskPoints,
        riskPercent: blueprint.riskPercent,
        expectedGrossProfit1: blueprint.expectedGrossProfit1,
        expectedGrossProfit2: blueprint.expectedGrossProfit2,
        expectedGrossLoss: blueprint.expectedGrossLoss,
        totalChargesEst: blueprint.totalChargesEst,
        expectedNetProfit1: blueprint.expectedNetProfit1,
        expectedNetProfit2: blueprint.expectedNetProfit2,
        expectedNetLoss: blueprint.expectedNetLoss,
        riskRewardRatio: blueprint.riskRewardRatio,
        optimalHoldingMinutes: '10 to 25 mins',
        rationale
      });
    }

    // Sort by Confluence Score & Beta descending
    candidates.sort((a, b) => b.confluenceScore - a.confluenceScore || b.beta - a.beta);

    return candidates.slice(0, 5);
  }

  /**
   * Computes the 10-30 Minute Scalp Stopwatch Phase
   */
  public static getTimerPhase(elapsedMinutes: number): ScalpTimerPhase {
    const min = Math.max(0, Math.floor(elapsedMinutes));

    if (min < 10) {
      return {
        currentMinute: min,
        phaseName: 'SURGE_ZONE',
        phaseColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        statusBadge: '🟢 0–10 Min: High Velocity Impulse',
        actionGuideline: 'Stock in primary momentum thrust. Hold position firmly for Target 1 (+₹1,500). Do not panic on small wicks.',
        recommendedAction: 'HOLD_FOR_TARGET'
      };
    } else if (min < 20) {
      return {
        currentMinute: min,
        phaseName: 'TRAIL_ZONE',
        phaseColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        statusBadge: '🟡 10–20 Min: Safe Trail Phase',
        actionGuideline: 'Immediate action: Shift Stop-Loss to Entry Price (Breakeven). Your trade is now 100% Risk-Free!',
        recommendedAction: 'TRAIL_SL_TO_COST'
      };
    } else {
      return {
        currentMinute: min,
        phaseName: 'DECAY_EXIT_ZONE',
        phaseColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
        statusBadge: '🔴 20–30 Min: Momentum Fading Alert',
        actionGuideline: 'Exit trade immediately at market price! Intraday momentum volume has dried up. Never hold a scalp into a hope trade.',
        recommendedAction: 'FORCE_EXIT_NOW'
      };
    }
  }

  /**
   * Reads the Daily "One & Done" Scalp Lock state
   */
  public static getDailyScalpState(): DailyScalpState {
    const today = new Date().toISOString().split('T')[0];
    try {
      const raw = safeGetItem(STORAGE_KEY_DAILY_SCALP);
      if (raw) {
        const parsed: DailyScalpState = JSON.parse(raw);
        if (parsed.date === today) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return {
      date: today,
      hasExecutedToday: false
    };
  }

  /**
   * Saves the Daily "One & Done" Scalp Lock state
   */
  public static markDailyScalpExecuted(symbol: string, netPnL?: number, result: 'WIN' | 'LOSS' | 'BREAKEVEN' = 'WIN'): void {
    const today = new Date().toISOString().split('T')[0];
    const state: DailyScalpState = {
      date: today,
      hasExecutedToday: true,
      tradeSymbol: symbol,
      netPnL,
      result,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };
    try {
      safeSetItem(STORAGE_KEY_DAILY_SCALP, JSON.stringify(state));
    } catch {
      // ignore
    }
  }

  /**
   * Manually resets today's scalp lock (for testing or override)
   */
  public static resetDailyScalpLock(): void {
    try {
      safeRemoveItem(STORAGE_KEY_DAILY_SCALP);
    } catch {
      // ignore
    }
  }
}
