export interface RawStockRow {
  symbol: string;
  open: number;
  high: number;
  low: number;
  prevClose: number;
  ltp: number;
  indicativeClose: string;
  change: number;
  changePercent: number;
  volume: number;
  valueCrores: number;
  high52W: number;
  low52W: number;
  change30D: number;
  change365D: number;
}

export type TradeSignal = 
  | 'STRONG_BUY' 
  | 'SWING_BUY' 
  | 'BREAKOUT_RADAR' 
  | 'STRONG_SHORT' 
  | 'NEUTRAL'
  | 'AVOID';

export type OpenDriveType = 'OPEN_LOW' | 'OPEN_HIGH' | 'NORMAL';

export interface ConfirmationItem {
  id: string;
  title: string;
  description: string;
  passed: boolean;
}

export interface ConfirmationChecklist {
  stars: number; // 0 to 5
  grade: 'A+' | 'A' | 'B' | 'C';
  verdict: string;
  items: ConfirmationItem[];
}

export interface PivotLevels {
  pivot: number;
  r1: number;
  r2: number;
  s1: number;
  s2: number;
  h4: number; // Camarilla Breakout
  l4: number; // Camarilla Breakdown
}

export interface TradeSetup {
  strategy: string;
  signal: TradeSignal;
  action: 'BUY' | 'SELL' | 'WAIT';
  entryPrice: number;
  stopLoss: number;
  target1: number;
  target2: number;
  riskRewardRatio: string;
  rationale: string[];
  rationaleHinglish: string;
}

export interface AnalyzedStock extends RawStockRow {
  isIndex: boolean;
  sector: string;
  clv: number; // Close Location Value: ((LTP - Low)/(High - Low)) * 100
  dayRange: number; // High - Low
  dayRangePercent: number; // (High - Low) / Open * 100
  openDrive: OpenDriveType;
  distFrom52WHigh: number; // ((52W High - LTP) / 52W High) * 100
  distFrom52WLow: number; // ((LTP - 52W Low) / 52W Low) * 100
  proScore: number; // 0 to 100 (composite score)
  turnoverRank: number;
  volumeRank: number;
  alphaVsIndex: number; // Relative strength vs Nifty Benchmark
  pivotLevels: PivotLevels;
  confirmation: ConfirmationChecklist;
  setup: TradeSetup;
}

export interface MarketPulse {
  indexSymbol: string;
  indexLevel: number;
  indexChange: number;
  indexChangePercent: number;
  advancesCount: number;
  declinesCount: number;
  unchangedCount: number;
  totalTurnoverCrores: number;
  marketSentiment: 'BULLISH' | 'MILD_BULLISH' | 'NEUTRAL' | 'MILD_BEARISH' | 'BEARISH';
  advanceDeclineRatio: number;
  topSector: string;
}

export interface DailySnapshot {
  id: string; // e.g. '2026-09-06'
  dateStr: string; // display string
  timestamp: number;
  rawCsv: string;
  stocksCount: number;
  isCustom?: boolean;
}

export interface PaperTrade {
  id: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  entryPrice: number;
  stopLoss: number;
  target1: number;
  target2: number;
  quantity: number;
  totalCapital: number;
  timestamp: number;
  dateStr: string;
  status: 'ACTIVE' | 'TARGET_1' | 'TARGET_2' | 'STOPPED_OUT' | 'CLOSED';
  notes?: string;
}

export type FilterPreset = 
  | 'ALL'
  | 'GRADE_A_PLUS'
  | 'HIGH_ALPHA_LEADERS'
  | 'BULLISH_SETUPS'
  | 'BEARISH_SETUPS'
  | 'OPEN_EQUALS_LOW'
  | 'OPEN_EQUALS_HIGH'
  | 'NEAR_52W_HIGH'
  | 'NEAR_52W_LOW'
  | 'HIGH_TURNOVER'
  | 'TRIPLE_GREEN'
  | 'TOP_GAINERS'
  | 'TOP_LOSERS';
