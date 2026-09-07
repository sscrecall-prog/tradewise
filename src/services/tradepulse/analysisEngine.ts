import { 
  RawStockRow, 
  AnalyzedStock, 
  MarketPulse, 
  TradeSetup, 
  TradeSignal, 
  OpenDriveType,
  PivotLevels,
  ConfirmationChecklist,
  ConfirmationItem
} from '../../types/tradepulse';
import { getCompanyMeta } from './defaultData';

/**
 * Normalizes number to 2 decimal places.
 */
function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Calculates Central Pivot and Support/Resistance Levels (Floor + Camarilla Breakouts)
 */
export function calculatePivotLevels(high: number, low: number, close: number): PivotLevels {
  const pivot = round2((high + low + close) / 3);
  const range = Math.max(0.1, high - low);
  const r1 = round2((2 * pivot) - low);
  const s1 = round2((2 * pivot) - high);
  const r2 = round2(pivot + range);
  const s2 = round2(pivot - range);
  const h4 = round2(close + (range * 1.1) / 2);
  const l4 = round2(close - (range * 1.1) / 2);

  return { pivot, r1, r2, s1, s2, h4, l4 };
}

/**
 * 5-Star Multi-Factor Trade Confirmation Checklist
 */
export function generateConfirmationChecklist(
  stock: RawStockRow,
  clv: number,
  openDrive: OpenDriveType,
  alphaVsIndex: number,
  sectorAvgChange: number,
  turnoverRank: number,
  totalEquities: number,
  setup: TradeSetup
): ConfirmationChecklist {
  const isBuy = setup.action === 'BUY';
  const isSell = setup.action === 'SELL';

  // Rule 1: Price Action & Closing Confluence
  const r1Passed = isBuy ? (openDrive === 'OPEN_LOW' || clv >= 65) : isSell ? (openDrive === 'OPEN_HIGH' || clv <= 35) : clv >= 50;
  const r1Item: ConfirmationItem = {
    id: 'price-action',
    title: 'Price Structure & Intraday Close',
    description: isBuy 
      ? (openDrive === 'OPEN_LOW' ? 'Bullish Open=Low drive verified (zero downside wick)' : `Closing near Day High with strong ${clv.toFixed(0)}% CLV`)
      : (openDrive === 'OPEN_HIGH' ? 'Bearish Open=High rejection verified (sellers pinned open)' : `Weak closing near Day Low (${clv.toFixed(0)}% CLV)`),
    passed: r1Passed
  };

  // Rule 2: Relative Strength (Alpha vs Benchmark)
  const r2Passed = isBuy ? alphaVsIndex >= 0.4 : isSell ? alphaVsIndex <= -0.4 : Math.abs(alphaVsIndex) >= 0.2;
  const r2Item: ConfirmationItem = {
    id: 'relative-strength',
    title: 'Relative Strength (Alpha vs Index)',
    description: alphaVsIndex >= 0 
      ? `Outperforming benchmark by +${alphaVsIndex.toFixed(2)}% Alpha` 
      : `Lagging benchmark by ${alphaVsIndex.toFixed(2)}% Alpha`,
    passed: r2Passed
  };

  // Rule 3: Sector Tailwind Alignment
  const r3Passed = isBuy ? sectorAvgChange >= 0 : isSell ? sectorAvgChange <= 0 : true;
  const r3Item: ConfirmationItem = {
    id: 'sector-tailwind',
    title: 'Sector Tailwind Alignment',
    description: sectorAvgChange >= 0 
      ? `Sector is bullish (+${sectorAvgChange.toFixed(2)}% avg change)` 
      : `Sector is bearish (${sectorAvgChange.toFixed(2)}% avg change)`,
    passed: r3Passed
  };

  // Rule 4: Institutional Turnover & Liquidity
  const turnoverPercentile = turnoverRank / totalEquities;
  const r4Passed = turnoverPercentile <= 0.40 || stock.valueCrores >= 180;
  const r4Item: ConfirmationItem = {
    id: 'institutional-liquidity',
    title: 'Institutional Size & Turnover',
    description: `High institutional participation: ₹${stock.valueCrores.toFixed(0)} Cr turnover (Rank #${turnoverRank})`,
    passed: r4Passed
  };

  // Rule 5: Favorable Risk-to-Reward Ratio
  const r5Passed = isBuy ? (setup.target1 > setup.entryPrice && setup.stopLoss < setup.entryPrice) : isSell ? (setup.target1 < setup.entryPrice && setup.stopLoss > setup.entryPrice) : true;
  const r5Item: ConfirmationItem = {
    id: 'risk-reward',
    title: 'Favorable Risk-to-Reward (>= 1:1.5)',
    description: `Logical Stop-Loss and Target 1 provide >= 1:1.5 R:R margin of safety`,
    passed: r5Passed
  };

  const items = [r1Item, r2Item, r3Item, r4Item, r5Item];
  const passedCount = items.filter(i => i.passed).length;

  let grade: ConfirmationChecklist['grade'] = 'C';
  let verdict = 'GRADE C (Low Conviction / Avoid): Incomplete confirmation. High risk of false breakout.';

  if (passedCount === 5) {
    grade = 'A+';
    verdict = 'GRADE A+ (High Conviction Institutional Setup): All 5 institutional confirmations fully verified!';
  } else if (passedCount === 4) {
    grade = 'A';
    verdict = 'GRADE A (Strong Setup): 4 confirmations aligned. High probability trade setup.';
  } else if (passedCount === 3) {
    grade = 'B';
    verdict = 'GRADE B (Moderate Setup): 3 confirmations passed. Wait for pullback confirmation before executing.';
  }

  return {
    stars: passedCount,
    grade,
    verdict,
    items
  };
}

/**
 * Calculates Close Location Value (CLV).
 * Indicates where the LTP finished between the Day Low and Day High.
 * 100% means right at Day High (bulls dominant).
 * 0% means right at Day Low (bears dominant).
 */
export function calculateCLV(high: number, low: number, ltp: number): number {
  if (high <= low) return 50;
  const clv = ((ltp - low) / (high - low)) * 100;
  return Math.max(0, Math.min(100, round2(clv)));
}

/**
 * Detects whether there was an Open Drive (Open = Low or Open = High).
 * In Indian markets, Open=Low with high volume is one of the highest probability intraday long signals.
 */
export function detectOpenDrive(open: number, high: number, low: number): OpenDriveType {
  if (open <= 0) return 'NORMAL';
  
  // Tolerance within 0.08% or 0.50 points
  const lowDiff = Math.abs(open - low);
  const highDiff = Math.abs(open - high);
  const threshold = Math.max(0.5, open * 0.0008);

  if (lowDiff <= threshold) return 'OPEN_LOW';
  if (highDiff <= threshold) return 'OPEN_HIGH';
  return 'NORMAL';
}

/**
 * Generates actionable Trade Setup (Action, Signal, Entry, SL, Target1, Target2, Rationale).
 */
export function generateTradeSetup(
  stock: RawStockRow,
  clv: number,
  openDrive: OpenDriveType,
  distFrom52WHigh: number,
  distFrom52WLow: number,
  proScore: number
): TradeSetup {
  const { ltp, high, low, changePercent, valueCrores, change30D, change365D, symbol } = stock;
  const range = high - low;
  const rationale: string[] = [];
  let signal: TradeSignal = 'NEUTRAL';
  let action: 'BUY' | 'SELL' | 'WAIT' = 'WAIT';
  let strategy = 'Range-bound / Observation';
  let rationaleHinglish = '';

  // Setup 1: 52-Week High Breakout
  if (distFrom52WHigh <= 4.0 && changePercent >= 0.5 && valueCrores >= 120) {
    signal = 'BREAKOUT_RADAR';
    action = 'BUY';
    strategy = '52-Week High Breakout Continuation';
    rationale.push(`Stock is trading just ${distFrom52WHigh.toFixed(1)}% below its 52-Week High (${stock.high52W}).`);
    rationale.push(`Multi-timeframe strength: 365D return is +${change365D.toFixed(1)}% with strong institutional interest.`);
    rationaleHinglish = `${symbol} apne 52-Week High (${stock.high52W}) se sirf ${distFrom52WHigh.toFixed(1)}% door hai. Jabardast momentum aur buying interest ke sath breakout ke liye ready hai.`;
  }
  // Setup 2: Strong Bullish Open Drive / Momentum Buy
  else if ((openDrive === 'OPEN_LOW' || clv >= 70) && changePercent >= 0.8 && valueCrores >= 200) {
    signal = 'STRONG_BUY';
    action = 'BUY';
    strategy = openDrive === 'OPEN_LOW' ? 'Bullish Open=Low Drive (Intraday Long)' : 'High Volume Trend Continuation';
    if (openDrive === 'OPEN_LOW') {
      rationale.push('Textbook Open = Low pattern: Buyers took control instantly at market open with zero downside.');
    }
    rationale.push(`Closing near Day High with ${clv.toFixed(0)}% Close Location Value.`);
    rationale.push(`High Institutional Turnover: ₹${valueCrores.toFixed(1)} Crores traded.`);
    rationaleHinglish = `${symbol} me institutional buying dekhi jaa rahi hai (₹${valueCrores.toFixed(0)} Cr turnover). ${openDrive === 'OPEN_LOW' ? 'Open=Low pattern hai, ' : ''}day high ke kareeb band ho raha hai. Long trade ke liye high probability candidate hai.`;
  }
  // Setup 3: Swing Dip / Value Accumulation Buy
  else if (change365D >= 15 && change30D <= -1 && changePercent >= 0.3) {
    signal = 'SWING_BUY';
    action = 'BUY';
    strategy = 'Swing Dip Pullback Reversal';
    rationale.push(`Strong 1-year secular uptrend (+${change365D.toFixed(1)}%) with recent healthy 30-day pullback (${change30D.toFixed(1)}%).`);
    rationale.push('Today showed green reversal candle with buying support emerging.');
    rationaleHinglish = `${symbol} 1-year me secular uptrend me hai (+${change365D.toFixed(1)}%). 30-day ke dip ke baad aaj fresh buying trigger ho rahi hai. Swing traders ke liye low-risk entry opportunity.`;
  }
  // Setup 4: Strong Bearish Breakdown / Short
  else if ((openDrive === 'OPEN_HIGH' || clv <= 25) && changePercent <= -0.7 && valueCrores >= 150) {
    signal = 'STRONG_SHORT';
    action = 'SELL';
    strategy = openDrive === 'OPEN_HIGH' ? 'Bearish Open=High Rejection (Intraday Short)' : 'Bearish Trend Breakdown';
    if (openDrive === 'OPEN_HIGH') {
      rationale.push('Open = High pattern: Sellers pushed prices down right from open without resistance.');
    }
    rationale.push(`Weak closing near Day Low with CLV of only ${clv.toFixed(0)}%.`);
    rationale.push(`Down ${Math.abs(changePercent).toFixed(2)}% on ₹${valueCrores.toFixed(1)} Cr heavy volume.`);
    rationaleHinglish = `${symbol} me sellers aggressively haavi hain. ${openDrive === 'OPEN_HIGH' ? 'Open=High rejection bana hai, ' : ''}day low ke pass trade ho raha hai. Intraday shorting ya existing long positions se exit karne ka signal.`;
  }
  // Setup 5: Weakness / Avoid
  else if (change30D <= -5 && change365D <= -10 && changePercent < 0) {
    signal = 'AVOID';
    action = 'WAIT';
    strategy = 'Laggard Downtrend (Avoid Buying)';
    rationale.push('Consistent underperformance across 1D, 30D, and 365D timeframes.');
    rationale.push('No reversal confirmation yet. High risk of capital trap.');
    rationaleHinglish = `${symbol} multi-timeframe downtrend me fasa hua hai. Filhal fresh buying avoid karein jab tak trend reversal confirm na ho.`;
  }
  // Setup 6: Neutral
  else {
    signal = 'NEUTRAL';
    action = 'WAIT';
    strategy = 'Consolidation / Range-Bound Watch';
    rationale.push('Price is hovering inside the middle of the daily range without strong conviction.');
    rationale.push('Wait for a decisive breakout above Day High or breakdown below Day Low.');
    rationaleHinglish = `${symbol} filhal range-bound hai. Day high cross hone par hi fresh entry plan karein.`;
  }

  // Calculate Entry, Stop Loss, and Targets
  let entryPrice = ltp;
  let stopLoss = ltp;
  let target1 = ltp;
  let target2 = ltp;

  // Adaptive risk buffer based on price level
  const minRisk = Math.max(ltp * 0.007, range * 0.4); // at least 0.7% or 40% of day range

  if (action === 'BUY') {
    entryPrice = round2(ltp);
    // SL below Low with small buffer
    stopLoss = round2(Math.min(ltp - minRisk, low - (range * 0.08)));
    const risk = entryPrice - stopLoss;
    target1 = round2(entryPrice + risk * 1.5);
    target2 = round2(entryPrice + risk * 2.5);
  } else if (action === 'SELL') {
    entryPrice = round2(ltp);
    // SL above High with small buffer
    stopLoss = round2(Math.max(ltp + minRisk, high + (range * 0.08)));
    const risk = stopLoss - entryPrice;
    target1 = round2(entryPrice - risk * 1.5);
    target2 = round2(entryPrice - risk * 2.5);
  } else {
    // Neutral reference levels
    entryPrice = round2(high);
    stopLoss = round2(low);
    const risk = entryPrice - stopLoss;
    target1 = round2(entryPrice + risk * 1.5);
    target2 = round2(entryPrice + risk * 2.5);
  }

  return {
    strategy,
    signal,
    action,
    entryPrice,
    stopLoss,
    target1,
    target2,
    riskRewardRatio: action === 'WAIT' ? '1:1.5' : '1:2.0',
    rationale,
    rationaleHinglish
  };
}

/**
 * Calculates Composite Pro Trader Score (0 - 100).
 * Dynamically scales with totalStocks universe (50, 100, 200, 500, etc.)
 */
export function calculateProScore(
  stock: RawStockRow,
  clv: number,
  openDrive: OpenDriveType,
  turnoverRank: number,
  distFrom52WHigh: number,
  totalStocks: number = 50
): number {
  let score = 50;

  // 1. CLV Component (0 - 25 pts)
  // CLV 100 -> +15, CLV 0 -> -15
  score += (clv - 50) * 0.3;

  // 2. Day % Change Component (0 - 20 pts)
  // +3% -> +12, -3% -> -12
  score += Math.max(-15, Math.min(15, stock.changePercent * 5));

  // 3. Open Drive Bonus
  if (openDrive === 'OPEN_LOW') score += 10;
  else if (openDrive === 'OPEN_HIGH') score -= 10;

  // 4. Institutional Liquidity Percentile Rank
  const rankPercentile = turnoverRank / totalStocks; // 0.0 to 1.0
  if (rankPercentile <= 0.10) score += 10; // Top 10% volume
  else if (rankPercentile <= 0.25) score += 6; // Top 25%
  else if (rankPercentile <= 0.50) score += 2; // Above median
  else score -= 4; // Below median

  // 5. 52-Week Proximity (Near High = Bullish momentum, Near Low = Broken down)
  if (distFrom52WHigh <= 5) score += 8;
  else if (distFrom52WHigh <= 12) score += 4;
  else if (distFrom52WHigh >= 30) score -= 5;

  // 6. Multi-Timeframe Confluence (30D & 365D)
  if (stock.change30D > 0 && stock.change365D > 0) score += 6; // Triple Green
  else if (stock.change30D < 0 && stock.change365D < 0) score -= 6; // Triple Red

  return Math.max(1, Math.min(99, Math.round(score)));
}

/**
 * Main Analysis Orchestrator:
 * Processes an array of RawStockRow and returns fully analyzed stock records with scores, rankings, and signals.
 * Handles NIFTY 50, NIFTY 100, NIFTY 200, NIFTY 500, or any custom universe seamlessly!
 */
export function analyzeNiftyDataset(rows: RawStockRow[]): {
  stocks: AnalyzedStock[];
  marketPulse: MarketPulse;
} {
  // Separate Index from stocks dynamically
  const isIndexSymbol = (sym: string) => {
    const s = sym.toUpperCase().trim();
    return s.includes('NIFTY') || s.includes('INDEX') || s.includes('SENSEX') || s.includes('BANKNIFTY');
  };

  const indexRow = rows.find(r => isIndexSymbol(r.symbol));
  const indexSymbol = indexRow ? indexRow.symbol : 'NIFTY BENCHMARK';
  
  // All equities excluding index rows
  const stockRows = rows.filter(r => !isIndexSymbol(r.symbol));
  const totalEquities = stockRows.length;

  // Sort by turnover (valueCrores) to establish turnover ranking
  const sortedByTurnover = [...stockRows].sort((a, b) => b.valueCrores - a.valueCrores);
  const turnoverRankMap = new Map<string, number>();
  sortedByTurnover.forEach((s, idx) => turnoverRankMap.set(s.symbol, idx + 1));

  // Sort by volume to establish volume ranking
  const sortedByVolume = [...stockRows].sort((a, b) => b.volume - a.volume);
  const volumeRankMap = new Map<string, number>();
  sortedByVolume.forEach((s, idx) => volumeRankMap.set(s.symbol, idx + 1));

  // Pre-calculate sector average changes for sector tailwinds confirmation
  const sectorStatsMap = new Map<string, { sumChange: number; count: number }>();
  stockRows.forEach(row => {
    const meta = getCompanyMeta(row.symbol);
    const cur = sectorStatsMap.get(meta.sector) || { sumChange: 0, count: 0 };
    cur.sumChange += row.changePercent;
    cur.count += 1;
    sectorStatsMap.set(meta.sector, cur);
  });

  const indexChangePercent = indexRow ? indexRow.changePercent : 0;

  let advancesCount = 0;
  let declinesCount = 0;
  let unchangedCount = 0;
  let totalTurnover = 0;
  const sectorTurnoverMap = new Map<string, number>();

  const analyzedStocks: AnalyzedStock[] = stockRows.map(row => {
    const isIndex = false;
    const meta = getCompanyMeta(row.symbol);
    const clv = calculateCLV(row.high, row.low, row.ltp);
    const dayRange = round2(row.high - row.low);
    const dayRangePercent = row.open > 0 ? round2((dayRange / row.open) * 100) : 0;
    const openDrive = detectOpenDrive(row.open, row.high, row.low);

    const distFrom52WHigh = row.high52W > 0 
      ? round2(((row.high52W - row.ltp) / row.high52W) * 100) 
      : 0;
    const distFrom52WLow = row.low52W > 0 
      ? round2(((row.ltp - row.low52W) / row.low52W) * 100) 
      : 0;

    const turnoverRank = turnoverRankMap.get(row.symbol) || Math.round(totalEquities / 2);
    const volumeRank = volumeRankMap.get(row.symbol) || Math.round(totalEquities / 2);

    const proScore = calculateProScore(row, clv, openDrive, turnoverRank, distFrom52WHigh, totalEquities);
    const setup = generateTradeSetup(row, clv, openDrive, distFrom52WHigh, distFrom52WLow, proScore);

    // Confirmation & Alpha Metrics
    const secStats = sectorStatsMap.get(meta.sector);
    const sectorAvgChange = secStats && secStats.count > 0 ? secStats.sumChange / secStats.count : 0;
    const alphaVsIndex = round2(row.changePercent - indexChangePercent);
    const pivotLevels = calculatePivotLevels(row.high, row.low, row.ltp);
    const confirmation = generateConfirmationChecklist(
      row,
      clv,
      openDrive,
      alphaVsIndex,
      sectorAvgChange,
      turnoverRank,
      totalEquities,
      setup
    );

    // Track market pulse
    if (row.change > 0) advancesCount++;
    else if (row.change < 0) declinesCount++;
    else unchangedCount++;

    totalTurnover += row.valueCrores;
    const curSecVal = sectorTurnoverMap.get(meta.sector) || 0;
    sectorTurnoverMap.set(meta.sector, curSecVal + row.valueCrores);

    return {
      ...row,
      isIndex,
      sector: meta.sector,
      clv,
      dayRange,
      dayRangePercent,
      openDrive,
      distFrom52WHigh,
      distFrom52WLow,
      proScore,
      turnoverRank,
      volumeRank,
      alphaVsIndex,
      pivotLevels,
      confirmation,
      setup
    };
  });

  // Find top sector by turnover
  let topSector = 'Banking';
  let maxSecTurnover = 0;
  sectorTurnoverMap.forEach((val, sec) => {
    if (val > maxSecTurnover) {
      maxSecTurnover = val;
      topSector = sec;
    }
  });

  // Market sentiment calculation scaled dynamically
  let marketSentiment: MarketPulse['marketSentiment'] = 'NEUTRAL';
  const netAdv = advancesCount - declinesCount;
  const netAdvPct = totalEquities > 0 ? (netAdv / totalEquities) * 100 : 0;
  const idxChg = indexRow ? indexRow.changePercent : (advancesCount > declinesCount ? 0.3 : -0.3);

  if (idxChg >= 0.7 && netAdvPct >= 20) marketSentiment = 'BULLISH';
  else if (idxChg > 0.05 || netAdvPct >= 8) marketSentiment = 'MILD_BULLISH';
  else if (idxChg <= -0.7 && netAdvPct <= -20) marketSentiment = 'BEARISH';
  else if (idxChg < -0.05 || netAdvPct <= -8) marketSentiment = 'MILD_BEARISH';
  else marketSentiment = 'NEUTRAL';

  const marketPulse: MarketPulse = {
    indexSymbol,
    indexLevel: indexRow ? indexRow.ltp : 24000,
    indexChange: indexRow ? indexRow.change : 0,
    indexChangePercent: indexRow ? indexRow.changePercent : 0,
    advancesCount,
    declinesCount,
    unchangedCount,
    totalTurnoverCrores: round2(totalTurnover),
    marketSentiment,
    advanceDeclineRatio: declinesCount > 0 ? round2(advancesCount / declinesCount) : advancesCount,
    topSector
  };

  return {
    stocks: analyzedStocks,
    marketPulse
  };
}
