import { JournalEntry, SetupType, EmotionType, DisciplineMetrics, AnalyticsSummary } from '../types';

export class TradingCalculationService {
  /**
   * Calculates maximum risk in rupees given capital and risk percentage.
   * Example: Capital ₹1,00,000 with 1% risk = ₹1,000.
   */
  static calculateRiskAmount(capital: number, riskPercent: number): number {
    if (capital <= 0 || riskPercent <= 0) return 0;
    return (capital * riskPercent) / 100;
  }

  /**
   * Calculates risk per share: absolute difference between entry and stop loss.
   */
  static calculateRiskPerShare(entry: number, stopLoss: number): number {
    if (entry <= 0 || stopLoss <= 0) return 0;
    return Math.abs(entry - stopLoss);
  }

  /**
   * Calculates reward per share: absolute difference between target and entry.
   */
  static calculateRewardPerShare(entry: number, target: number): number {
    if (entry <= 0 || target <= 0) return 0;
    return Math.abs(target - entry);
  }

  /**
   * Calculates Risk to Reward ratio.
   * Example: Risk ₹20, Reward ₹40 -> ratio = 2 (1:2).
   */
  static calculateRiskReward(riskPerShare: number, rewardPerShare: number): { ratio: number; display: string } {
    if (riskPerShare <= 0 || rewardPerShare <= 0) {
      return { ratio: 0, display: '1 : 0' };
    }
    const ratio = rewardPerShare / riskPerShare;
    return {
      ratio: Number(ratio.toFixed(2)),
      display: `1 : ${ratio.toFixed(2)}`
    };
  }

  /**
   * Calculates suggested position quantity based on risk limit.
   * Formula: Suggested Qty = Floor(Max Risk Amount / Risk Per Share)
   */
  static calculatePositionSize(
    capital: number,
    riskPercent: number,
    entry: number,
    stopLoss: number,
    target: number = 0
  ): {
    maxRiskAmount: number;
    riskPerShare: number;
    rewardPerShare: number;
    suggestedQuantity: number;
    positionValue: number;
    capitalAllocationPercent: number;
    potentialProfit: number;
    potentialLoss: number;
    riskRewardRatio: number;
    riskRewardDisplay: string;
  } {
    const maxRiskAmount = this.calculateRiskAmount(capital, riskPercent);
    const riskPerShare = this.calculateRiskPerShare(entry, stopLoss);
    const rewardPerShare = target > 0 ? this.calculateRewardPerShare(entry, target) : 0;
    const { ratio: riskRewardRatio, display: riskRewardDisplay } = this.calculateRiskReward(riskPerShare, rewardPerShare);

    let suggestedQuantity = 0;
    if (riskPerShare > 0 && maxRiskAmount > 0) {
      suggestedQuantity = Math.floor(maxRiskAmount / riskPerShare);
    }

    const positionValue = suggestedQuantity * entry;
    const capitalAllocationPercent = capital > 0 ? (positionValue / capital) * 100 : 0;
    const potentialProfit = suggestedQuantity * rewardPerShare;
    const potentialLoss = suggestedQuantity * riskPerShare;

    return {
      maxRiskAmount: Math.round(maxRiskAmount * 100) / 100,
      riskPerShare: Math.round(riskPerShare * 100) / 100,
      rewardPerShare: Math.round(rewardPerShare * 100) / 100,
      suggestedQuantity,
      positionValue: Math.round(positionValue * 100) / 100,
      capitalAllocationPercent: Math.round(capitalAllocationPercent * 100) / 100,
      potentialProfit: Math.round(potentialProfit * 100) / 100,
      potentialLoss: Math.round(potentialLoss * 100) / 100,
      riskRewardRatio,
      riskRewardDisplay
    };
  }

  /**
   * Calculates realistic Indian regulatory and brokerage charges.
   * Includes STT, Brokerage (capped at ₹20/order), Exchange turnover, GST, SEBI fee, Stamp duty.
   */
  static calculateIndianCharges(
    entryPrice: number,
    exitPrice: number,
    quantity: number,
    isIntraday: boolean = true,
    brokeragePerOrder: number = 20
  ): {
    stt: number;
    brokerage: number;
    exchangeCharges: number;
    gst: number;
    sebiCharges: number;
    stampDuty: number;
    totalCharges: number;
  } {
    if (quantity <= 0 || entryPrice <= 0 || exitPrice <= 0) {
      return { stt: 0, brokerage: 0, exchangeCharges: 0, gst: 0, sebiCharges: 0, stampDuty: 0, totalCharges: 0 };
    }

    const buyTurnover = entryPrice * quantity;
    const sellTurnover = exitPrice * quantity;
    const totalTurnover = buyTurnover + sellTurnover;

    // Brokerage: Min of 0.05% or ₹20 per executed leg
    const buyBrokerage = Math.min(brokeragePerOrder, buyTurnover * 0.0005);
    const sellBrokerage = Math.min(brokeragePerOrder, sellTurnover * 0.0005);
    const brokerage = Math.round((buyBrokerage + sellBrokerage) * 100) / 100;

    // STT (Securities Transaction Tax)
    // Intraday: 0.025% on sell turnover. Delivery: 0.1% on both buy and sell.
    const stt = isIntraday
      ? Math.round(sellTurnover * 0.00025 * 100) / 100
      : Math.round(totalTurnover * 0.001 * 100) / 100;

    // Exchange Turnover Fee (NSE rate ~ 0.00297%)
    const exchangeCharges = Math.round(totalTurnover * 0.0000297 * 100) / 100;

    // SEBI Turnover Fee (₹10 per crore = 0.0001%)
    const sebiCharges = Math.round(totalTurnover * 0.000001 * 100) / 100;

    // Stamp Duty (0.003% on buy side for intraday, 0.015% for delivery)
    const stampDuty = isIntraday
      ? Math.round(buyTurnover * 0.00003 * 100) / 100
      : Math.round(buyTurnover * 0.00015 * 100) / 100;

    // GST: 18% on (Brokerage + Exchange Charges + SEBI Charges)
    const gstTaxable = brokerage + exchangeCharges + sebiCharges;
    const gst = Math.round(gstTaxable * 0.18 * 100) / 100;

    const totalCharges = Math.round((stt + brokerage + exchangeCharges + gst + sebiCharges + stampDuty) * 100) / 100;

    return {
      stt,
      brokerage,
      exchangeCharges,
      gst,
      sebiCharges,
      stampDuty,
      totalCharges
    };
  }

  /**
   * Calculates gross P&L, net P&L, and R-multiple for a trade.
   */
  static calculateTradePnL(
    direction: 'BUY' | 'SELL',
    entryPrice: number,
    exitPrice: number,
    quantity: number,
    stopLoss: number = 0,
    isIntraday: boolean = true
  ): {
    grossPnL: number;
    charges: number;
    netPnL: number;
    rMultiple: number;
  } {
    if (quantity <= 0 || entryPrice <= 0 || exitPrice <= 0) {
      return { grossPnL: 0, charges: 0, netPnL: 0, rMultiple: 0 };
    }

    const priceDiff = direction === 'BUY' ? (exitPrice - entryPrice) : (entryPrice - exitPrice);
    const grossPnL = Math.round(priceDiff * quantity * 100) / 100;

    const chargesResult = this.calculateIndianCharges(entryPrice, exitPrice, quantity, isIntraday);
    const charges = chargesResult.totalCharges;
    const netPnL = Math.round((grossPnL - charges) * 100) / 100;

    let rMultiple = 0;
    if (stopLoss > 0) {
      const initialRiskPerShare = Math.abs(entryPrice - stopLoss);
      const initialTotalRisk = initialRiskPerShare * quantity;
      if (initialTotalRisk > 0) {
        rMultiple = Math.round((grossPnL / initialTotalRisk) * 100) / 100;
      }
    }

    return { grossPnL, charges, netPnL, rMultiple };
  }

  /**
   * Calculates Win Rate as percentage (0 - 100).
   */
  static calculateWinRate(winningTrades: number, totalTrades: number): number {
    if (totalTrades <= 0) return 0;
    return Math.round((winningTrades / totalTrades) * 1000) / 10;
  }

  /**
   * Calculates Average Win.
   */
  static calculateAverageWin(winPnLs: number[]): number {
    if (winPnLs.length === 0) return 0;
    const sum = winPnLs.reduce((acc, v) => acc + v, 0);
    return Math.round((sum / winPnLs.length) * 100) / 100;
  }

  /**
   * Calculates Average Loss (positive absolute number).
   */
  static calculateAverageLoss(lossPnLs: number[]): number {
    if (lossPnLs.length === 0) return 0;
    const sum = lossPnLs.reduce((acc, v) => acc + Math.abs(v), 0);
    return Math.round((sum / lossPnLs.length) * 100) / 100;
  }

  /**
   * Calculates Profit Factor = Total Gains / Total Losses.
   */
  static calculateProfitFactor(totalGains: number, totalLosses: number): number {
    const absLoss = Math.abs(totalLosses);
    if (absLoss === 0) {
      return totalGains > 0 ? 99.9 : 0;
    }
    return Math.round((totalGains / absLoss) * 100) / 100;
  }

  /**
   * Calculates Expectancy = (Win% * Avg Win) - (Loss% * Avg Loss).
   * Represents expected value in ₹ per trade.
   */
  static calculateExpectancy(winRatePercent: number, avgWin: number, avgLoss: number): number {
    const winRate = winRatePercent / 100;
    const lossRate = 1 - winRate;
    const expectancy = (winRate * avgWin) - (lossRate * Math.abs(avgLoss));
    return Math.round(expectancy * 100) / 100;
  }

  /**
   * Calculates Maximum Drawdown in amount and percentage.
   */
  static calculateDrawdown(equityPoints: number[]): { maxDrawdownAmount: number; maxDrawdownPercent: number } {
    if (!equityPoints || equityPoints.length === 0) {
      return { maxDrawdownAmount: 0, maxDrawdownPercent: 0 };
    }

    let peak = equityPoints[0];
    let maxDrawdownAmount = 0;
    let maxDrawdownPercent = 0;

    for (const point of equityPoints) {
      if (point > peak) {
        peak = point;
      }
      const drawdown = peak - point;
      if (drawdown > maxDrawdownAmount) {
        maxDrawdownAmount = drawdown;
      }
      if (peak > 0) {
        const ddPercent = (drawdown / peak) * 100;
        if (ddPercent > maxDrawdownPercent) {
          maxDrawdownPercent = ddPercent;
        }
      }
    }

    return {
      maxDrawdownAmount: Math.round(maxDrawdownAmount * 100) / 100,
      maxDrawdownPercent: Math.round(maxDrawdownPercent * 100) / 100
    };
  }

  /**
   * Calculates comprehensive Trading Discipline Score (0 - 100) based on 5 core Pillars.
   */
  static calculateDisciplineScore(journalEntries: JournalEntry[]): DisciplineMetrics {
    if (!journalEntries || journalEntries.length === 0) {
      return {
        overallScore: 82,
        riskManagementScore: 85,
        planAdherenceScore: 80,
        stopLossDisciplineScore: 88,
        overtradingControlScore: 80,
        emotionalControlScore: 78
      };
    }

    const total = journalEntries.length;
    const planFollowedCount = journalEntries.filter(t => t.planFollowed).length;
    const slRespectedCount = journalEntries.filter(t => !t.movedStopLoss).length;
    const notOvertradedCount = journalEntries.filter(t => !t.overtraded).length;
    const calmOrNeutralCount = journalEntries.filter(t => t.emotion === 'Calm' || t.emotion === 'Neutral').length;
    const noOversizeMistakeCount = journalEntries.filter(t => t.mistake !== 'Oversized Position').length;

    const planAdherenceScore = Math.round((planFollowedCount / total) * 100);
    const stopLossDisciplineScore = Math.round((slRespectedCount / total) * 100);
    const overtradingControlScore = Math.round((notOvertradedCount / total) * 100);
    const emotionalControlScore = Math.round((calmOrNeutralCount / total) * 100);
    const riskManagementScore = Math.round((noOversizeMistakeCount / total) * 100);

    const overallScore = Math.round(
      (planAdherenceScore * 0.25) +
      (stopLossDisciplineScore * 0.25) +
      (riskManagementScore * 0.20) +
      (overtradingControlScore * 0.15) +
      (emotionalControlScore * 0.15)
    );

    return {
      overallScore: Math.min(100, Math.max(0, overallScore)),
      riskManagementScore: Math.min(100, Math.max(0, riskManagementScore)),
      planAdherenceScore: Math.min(100, Math.max(0, planAdherenceScore)),
      stopLossDisciplineScore: Math.min(100, Math.max(0, stopLossDisciplineScore)),
      overtradingControlScore: Math.min(100, Math.max(0, overtradingControlScore)),
      emotionalControlScore: Math.min(100, Math.max(0, emotionalControlScore))
    };
  }

  /**
   * Generates complete analytics summary from closed journal entries.
   */
  static generateAnalytics(trades: JournalEntry[], startingCapital: number = 100000): AnalyticsSummary {
    const closedTrades = trades.filter(t => t.status === 'CLOSED');
    if (closedTrades.length === 0) {
      return {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        breakevenTrades: 0,
        winRate: 0,
        averageWin: 0,
        averageLoss: 0,
        winLossRatio: 0,
        profitFactor: 0,
        netPnL: 0,
        grossPnL: 0,
        totalCharges: 0,
        maxDrawdownAmount: 0,
        maxDrawdownPercent: 0,
        averageRiskReward: 0,
        expectancy: 0,
        consecutiveWins: 0,
        consecutiveLosses: 0,
        largestWin: 0,
        largestLoss: 0,
        setupPerformance: [],
        emotionPerformance: [],
        monthlyPnL: [],
        equityCurve: [],
        behavioralInsights: [
          'Record at least 5 completed trades in your journal to unlock personalized behavioral insights.'
        ]
      };
    }

    const winningTradesList = closedTrades.filter(t => t.netPnL > 0);
    const losingTradesList = closedTrades.filter(t => t.netPnL < 0);
    const breakevenTradesList = closedTrades.filter(t => t.netPnL === 0);

    const winningTrades = winningTradesList.length;
    const losingTrades = losingTradesList.length;
    const breakevenTrades = breakevenTradesList.length;
    const totalTrades = closedTrades.length;

    const winRate = this.calculateWinRate(winningTrades, totalTrades);

    const winPnLs = winningTradesList.map(t => t.netPnL);
    const lossPnLs = losingTradesList.map(t => t.netPnL);

    const totalGains = winPnLs.reduce((acc, v) => acc + v, 0);
    const totalLosses = lossPnLs.reduce((acc, v) => acc + v, 0);

    const averageWin = this.calculateAverageWin(winPnLs);
    const averageLoss = this.calculateAverageLoss(lossPnLs);
    const winLossRatio = averageLoss > 0 ? Math.round((averageWin / averageLoss) * 100) / 100 : averageWin > 0 ? 99 : 0;
    const profitFactor = this.calculateProfitFactor(totalGains, totalLosses);

    const grossPnL = Math.round(closedTrades.reduce((acc, t) => acc + t.grossPnL, 0) * 100) / 100;
    const totalCharges = Math.round(closedTrades.reduce((acc, t) => acc + t.estimatedCharges, 0) * 100) / 100;
    const netPnL = Math.round((grossPnL - totalCharges) * 100) / 100;

    const expectancy = this.calculateExpectancy(winRate, averageWin, averageLoss);

    // Consecutive wins/losses
    let maxWins = 0;
    let maxLosses = 0;
    let currentWins = 0;
    let currentLosses = 0;
    let largestWin = 0;
    let largestLoss = 0;

    for (const t of closedTrades) {
      if (t.netPnL > 0) {
        currentWins++;
        currentLosses = 0;
        if (currentWins > maxWins) maxWins = currentWins;
        if (t.netPnL > largestWin) largestWin = t.netPnL;
      } else if (t.netPnL < 0) {
        currentLosses++;
        currentWins = 0;
        if (currentLosses > maxLosses) maxLosses = currentLosses;
        if (t.netPnL < largestLoss) largestLoss = t.netPnL;
      }
    }

    // Equity curve
    const equityCurve: { date: string; cumulativePnL: number; drawdown: number }[] = [];
    let runningPnL = 0;
    let peakCapital = startingCapital;
    const equityPoints = [startingCapital];

    // Sort closed trades by date ascending
    const sortedTrades = [...closedTrades].sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`).getTime() - new Date(`${b.date}T${b.time || '00:00'}`).getTime());

    sortedTrades.forEach(t => {
      runningPnL += t.netPnL;
      const currentCapital = startingCapital + runningPnL;
      equityPoints.push(currentCapital);
      if (currentCapital > peakCapital) peakCapital = currentCapital;
      const currentDrawdown = peakCapital - currentCapital;
      equityCurve.push({
        date: t.date,
        cumulativePnL: Math.round(runningPnL * 100) / 100,
        drawdown: Math.round(currentDrawdown * 100) / 100
      });
    });

    const { maxDrawdownAmount, maxDrawdownPercent } = this.calculateDrawdown(equityPoints);

    // Setup performance
    const setupMap = new Map<SetupType, { trades: number; wins: number; gains: number; losses: number; netPnL: number }>();
    closedTrades.forEach(t => {
      const entry = setupMap.get(t.setup) || { trades: 0, wins: 0, gains: 0, losses: 0, netPnL: 0 };
      entry.trades++;
      if (t.netPnL > 0) {
        entry.wins++;
        entry.gains += t.netPnL;
      } else {
        entry.losses += Math.abs(t.netPnL);
      }
      entry.netPnL += t.netPnL;
      setupMap.set(t.setup, entry);
    });

    const setupPerformance = Array.from(setupMap.entries()).map(([setup, stats]) => ({
      setup,
      trades: stats.trades,
      winRate: Math.round((stats.wins / stats.trades) * 1000) / 10,
      netPnL: Math.round(stats.netPnL * 100) / 100,
      profitFactor: this.calculateProfitFactor(stats.gains, stats.losses)
    })).sort((a, b) => b.netPnL - a.netPnL);

    // Emotion performance
    const emotionMap = new Map<EmotionType, { trades: number; wins: number; netPnL: number }>();
    closedTrades.forEach(t => {
      const entry = emotionMap.get(t.emotion) || { trades: 0, wins: 0, netPnL: 0 };
      entry.trades++;
      if (t.netPnL > 0) entry.wins++;
      entry.netPnL += t.netPnL;
      emotionMap.set(t.emotion, entry);
    });

    const emotionPerformance = Array.from(emotionMap.entries()).map(([emotion, stats]) => ({
      emotion,
      trades: stats.trades,
      winRate: Math.round((stats.wins / stats.trades) * 1000) / 10,
      netPnL: Math.round(stats.netPnL * 100) / 100
    })).sort((a, b) => b.trades - a.trades);

    // Monthly PnL
    const monthMap = new Map<string, { pnl: number; trades: number }>();
    closedTrades.forEach(t => {
      const monthKey = t.date.substring(0, 7); // YYYY-MM
      const entry = monthMap.get(monthKey) || { pnl: 0, trades: 0 };
      entry.pnl += t.netPnL;
      entry.trades++;
      monthMap.set(monthKey, entry);
    });

    const monthlyPnL = Array.from(monthMap.entries()).map(([month, data]) => ({
      month,
      pnl: Math.round(data.pnl * 100) / 100,
      trades: data.trades
    })).sort((a, b) => a.month.localeCompare(b.month));

    // R:R calculation
    const rrTrades = closedTrades.filter(t => t.stopLoss > 0 && t.targetPrice > 0);
    const avgRR = rrTrades.length > 0
      ? Math.round((rrTrades.reduce((acc, t) => {
          const risk = Math.abs(t.entryPrice - t.stopLoss);
          const reward = Math.abs(t.targetPrice - t.entryPrice);
          return acc + (risk > 0 ? reward / risk : 1);
        }, 0) / rrTrades.length) * 100) / 100
      : 1.8;

    // Behavioral Insights generation
    const behavioralInsights: string[] = [];

    // Plan adherence insight
    const planFollowedTrades = closedTrades.filter(t => t.planFollowed);
    const planNotFollowedTrades = closedTrades.filter(t => !t.planFollowed);
    if (planFollowedTrades.length > 0 && planNotFollowedTrades.length > 0) {
      const winRateWithPlan = this.calculateWinRate(planFollowedTrades.filter(t => t.netPnL > 0).length, planFollowedTrades.length);
      const winRateNoPlan = this.calculateWinRate(planNotFollowedTrades.filter(t => t.netPnL > 0).length, planNotFollowedTrades.length);
      behavioralInsights.push(
        `Trades where you followed your plan had a ${winRateWithPlan}% win rate, compared to ${winRateNoPlan}% when deviating from the plan.`
      );
    }

    // Best setup insight
    if (setupPerformance.length > 1) {
      const bestSetup = setupPerformance[0];
      const lowestSetup = setupPerformance[setupPerformance.length - 1];
      if (bestSetup.trades >= 3) {
        behavioralInsights.push(
          `Your strongest setup is '${bestSetup.setup}' with a ${bestSetup.winRate}% win rate and ₹${bestSetup.netPnL.toLocaleString('en-IN')} net P&L.`
        );
      }
      if (lowestSetup.trades >= 3 && lowestSetup.netPnL < 0) {
        behavioralInsights.push(
          `Your '${lowestSetup.setup}' trades have underperformed historically with a ${lowestSetup.winRate}% win rate. Consider reviewing entries.`
        );
      }
    }

    // Emotion insight
    const calmTrades = closedTrades.filter(t => t.emotion === 'Calm');
    const fomoTrades = closedTrades.filter(t => t.emotion === 'FOMO' || t.emotion === 'Revenge');
    if (calmTrades.length >= 2 && fomoTrades.length >= 2) {
      const calmWinRate = this.calculateWinRate(calmTrades.filter(t => t.netPnL > 0).length, calmTrades.length);
      const fomoWinRate = this.calculateWinRate(fomoTrades.filter(t => t.netPnL > 0).length, fomoTrades.length);
      behavioralInsights.push(
        `Emotional control impact: Trades taken while 'Calm' produced a ${calmWinRate}% win rate, vs ${fomoWinRate}% during FOMO/Revenge states.`
      );
    }

    // Stop loss discipline insight
    const slMovedTrades = closedTrades.filter(t => t.movedStopLoss);
    if (slMovedTrades.length > 0) {
      const movedSLLosses = slMovedTrades.filter(t => t.netPnL < 0).reduce((acc, t) => acc + Math.abs(t.netPnL), 0);
      behavioralInsights.push(
        `Moving your stop loss occurred in ${slMovedTrades.length} trades, resulting in ₹${Math.round(movedSLLosses).toLocaleString('en-IN')} in avoidable drawdown.`
      );
    }

    if (behavioralInsights.length === 0) {
      behavioralInsights.push('Consistent execution: Keep logging your trades and emotions to reveal key psychological patterns.');
    }

    return {
      totalTrades,
      winningTrades,
      losingTrades,
      breakevenTrades,
      winRate,
      averageWin,
      averageLoss,
      winLossRatio,
      profitFactor,
      netPnL,
      grossPnL,
      totalCharges,
      maxDrawdownAmount,
      maxDrawdownPercent,
      averageRiskReward: avgRR,
      expectancy,
      consecutiveWins: maxWins,
      consecutiveLosses: maxLosses,
      largestWin,
      largestLoss,
      setupPerformance,
      emotionPerformance,
      monthlyPnL,
      equityCurve,
      behavioralInsights
    };
  }
}
