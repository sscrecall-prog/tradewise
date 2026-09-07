export type StockSymbol = string;

export interface ListedCompany {
  symbol: string;
  name: string;
  series: string;
  alias?: string;
}

export interface MarketQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  close: number;
  prevClose: number;
  volume: number;
  high52W: number;
  low52W: number;
  sector: string;
  sparkline: number[];
  pe?: number;
  marketCap?: string;
  lastUpdated: string;
}

export interface HistoricalPrice {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type TimeFrame = '1D' | '1W' | '1M' | '3M' | '1Y';

export interface IndexData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  sparkline: number[];
  isPositive: boolean;
}

export type TradeDirection = 'BUY' | 'SELL';
export type TradeStatus = 'OPEN' | 'CLOSED';
export type SetupType = 'Breakout' | 'Pullback' | 'Support/Resistance' | 'Reversal' | 'Trend Continuation' | 'Range Bound' | 'Gap Fill';
export type EmotionType = 'Calm' | 'Neutral' | 'Fear' | 'FOMO' | 'Revenge' | 'Overconfident' | 'Impatient';
export type MistakeType = 'None' | 'Chased Entry' | 'Early Exit' | 'Greed' | 'Ignored Stop Loss' | 'Oversized Position' | 'FOMO Entry' | 'Revenge Trading' | 'Late Entry';

export interface PreTradeChecklist {
  knowSetup: boolean;
  entryPredefined: boolean;
  stopLossPredefined: boolean;
  targetPredefined: boolean;
  riskAcceptable: boolean;
  riskRewardAcceptable: boolean;
  noFOMO: boolean;
  noRevenge: boolean;
  score: number; // 0 to 8
  isComplete: boolean;
}

export interface TradePlan {
  id: string;
  stockSymbol: string;
  stockName: string;
  direction: TradeDirection;
  entryPrice: number;
  stopLoss: number;
  targetPrice: number;
  tradingCapital: number;
  riskPercentage: number;
  maxRiskAmount: number;
  riskPerShare: number;
  rewardPerShare: number;
  riskRewardRatio: number;
  suggestedQuantity: number;
  positionValue: number;
  potentialProfit: number;
  potentialLoss: number;
  setup: SetupType;
  notes?: string;
  checklist: PreTradeChecklist;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  stockSymbol: string;
  stockName: string;
  direction: TradeDirection;
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  stopLoss: number;
  targetPrice: number;
  grossPnL: number;
  estimatedCharges: number;
  netPnL: number;
  status: TradeStatus;
  setup: SetupType;
  emotion: EmotionType;
  planFollowed: boolean;
  movedStopLoss: boolean;
  overtraded: boolean;
  mistake: MistakeType;
  notes: string;
  rMultiple: number;
  holdingTimeMinutes?: number;
  maePrice?: number;
  mfePrice?: number;
  maeR?: number;
  mfeR?: number;
  createdAt: string;
  closedAt?: string;
}

export interface PsychologyEntry {
  id: string;
  date: string;
  tradeId?: string;
  emotion: EmotionType;
  planFollowed: boolean;
  movedStopLoss: boolean;
  overtraded: boolean;
  notes?: string;
}

export interface OrderChargesBreakdown {
  brokerage: number;
  stt: number;
  exchangeCharges: number;
  gst: number;
  sebiCharges: number;
  stampDuty: number;
  totalCharges: number;
  breakevenPoints?: number;
}

export interface PaperOrder {
  id: string;
  stockSymbol: string;
  stockName: string;
  direction: TradeDirection;
  orderType: 'MARKET' | 'LIMIT' | 'SL' | 'SL-M';
  productType: 'INTRADAY (MIS)' | 'DELIVERY (CNC)';
  quantity: number;
  price: number;
  triggerPrice?: number;
  targetPrice?: number;
  stopLoss?: number;
  status: 'PENDING' | 'EXECUTED' | 'CANCELLED';
  timestamp: string;
  executedPrice?: number;
  marginRequired?: number;
  turnover?: number;
  charges?: OrderChargesBreakdown;
  contractNoteId?: string;
}

export interface PaperPosition {
  id: string;
  stockSymbol: string;
  stockName: string;
  direction: TradeDirection;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  stopLoss?: number;
  targetPrice?: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  productType: 'INTRADAY (MIS)' | 'DELIVERY (CNC)';
  openedAt: string;
  marginAllocated: number;
  leverage: number;
  buyCharges: number;
  netPnL?: number;
}

export interface PaperPortfolio {
  initialCapital: number;
  cashBalance: number;
  usedMargin: number;
  realizedPnL: number;
  unrealizedPnL: number;
  totalPortfolioValue: number;
  totalChargesPaid?: number;
  totalTradesCount?: number;
}

export interface TradingPreferences {
  defaultCapital: number;
  defaultRiskPercentage: number;
  maxDailyLoss: number;
  maxTradesPerDay: number;
  preferredSetup: SetupType;
  strictWarningThresholds: boolean;
  defaultBrokeragePerOrder: number;
}

export interface UserProfile {
  name: string;
  tradingStyle: 'Intraday Trader' | 'Swing Trader' | 'Position Trader' | 'Beginner Learner';
  experienceLevel: 'Beginner (< 1 Year)' | 'Intermediate (1-3 Years)' | 'Advanced (3+ Years)';
  joinedDate: string;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  currency: 'INR';
  currencySymbol: '₹';
  soundEnabled: boolean;
  autoRefreshData: boolean;
  refreshIntervalSeconds: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface AcademyLesson {
  id: string;
  level: 1 | 2 | 3 | 4;
  levelTitle: string;
  title: string;
  slug: string;
  readTime: string;
  summary: string;
  contentMarkdown: string;
  exampleScenario: string;
  keyTakeaways: string[];
  quiz: QuizQuestion[];
  isCompleted: boolean;
  quizScore?: number;
}

export interface DisciplineMetrics {
  overallScore: number;
  riskManagementScore: number;
  planAdherenceScore: number;
  stopLossDisciplineScore: number;
  overtradingControlScore: number;
  emotionalControlScore: number;
}

export interface AnalyticsSummary {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakevenTrades: number;
  winRate: number;
  averageWin: number;
  averageLoss: number;
  winLossRatio: number;
  profitFactor: number;
  netPnL: number;
  grossPnL: number;
  totalCharges: number;
  maxDrawdownAmount: number;
  maxDrawdownPercent: number;
  averageRiskReward: number;
  expectancy: number;
  consecutiveWins: number;
  consecutiveLosses: number;
  largestWin: number;
  largestLoss: number;
  setupPerformance: { setup: SetupType; trades: number; winRate: number; netPnL: number; profitFactor: number }[];
  emotionPerformance: { emotion: EmotionType; trades: number; winRate: number; netPnL: number }[];
  monthlyPnL: { month: string; pnl: number; trades: number }[];
  equityCurve: { date: string; cumulativePnL: number; drawdown: number }[];
  behavioralInsights: string[];
  timeOfDayMatrix?: TimeOfDayMatrix;
  mfeMaeAnalytics?: MfeMaeSummary;
  costOfIndiscipline?: CostOfIndisciplineSummary;
}

export type MarketSessionId = 'OPENING_VOLATILITY' | 'MORNING_TREND' | 'LUNCH_CHOP' | 'CLOSING_GAMMA';

export interface MarketSessionWindow {
  id: MarketSessionId;
  label: string;
  timeRange: string;
  startMinute: number;
  endMinute: number;
  description: string;
}

export interface TimeOfDayCell {
  dayOfWeek: number; // 1 (Mon) to 5 (Fri)
  dayName: string;
  sessionId: MarketSessionId;
  sessionLabel: string;
  timeRange: string;
  trades: number;
  wins: number;
  losses: number;
  winRate: number;
  netPnL: number;
  expectancy: number;
}

export interface TimeOfDayMatrix {
  cells: TimeOfDayCell[];
  goldenHour: { day: string; session: string; netPnL: number; winRate: number } | null;
  redFlagZone: { day: string; session: string; netPnL: number; winRate: number } | null;
  bestSessionOverall: string;
  worstSessionOverall: string;
}

export interface MfeMaeTradeData {
  tradeId: string;
  stockSymbol: string;
  date: string;
  direction: TradeDirection;
  netPnL: number;
  rMultiple: number;
  maePrice: number;
  mfePrice: number;
  maeR: number;
  mfeR: number;
  captureRatio: number; // 0-100%
}

export interface MfeMaeSummary {
  tradesWithData: number;
  averageCaptureRatio: number;
  averageMaeR: number;
  averageMfeR: number;
  moneyLeftOnTable: number;
  entryPrecisionScore: number;
  exitEfficiencyScore: number;
  trades: MfeMaeTradeData[];
}

export interface CostOfIndisciplineSummary {
  totalCost: number;
  movedStopLossCost: number;
  fomoTradesCost: number;
  revengeTradesCost: number;
  overtradingCost: number;
  unplannedTradesCost: number;
  potentialNetPnL: number;
  actualNetPnL: number;
  violationCount: number;
}

export interface TiltLockState {
  isActive: boolean;
  reason: 'MAX_DAILY_LOSS' | 'CONSECUTIVE_LOSSES' | 'MANUAL_COOLDOWN' | 'DRAWDOWN_CIRCUIT';
  reasonDescription: string;
  lockedAt: string;
  lockedUntil: string;
  remainingSeconds: number;
  emergencyOverridesCount: number;
}

// --- F&O DERIVATIVES EDGE TYPES ---

export type OptionBuildUpType = 'LONG_BUILDUP' | 'SHORT_BUILDUP' | 'SHORT_COVERING' | 'LONG_UNWINDING';

export interface OptionLegData {
  oi: number;              // In contracts
  changeOi: number;        // Absolute net change in contracts
  changeOiPercent: number; // % change in contracts
  volume: number;          // Traded volume
  ltp: number;             // Last Traded Price
  change: number;          // Price change
  changePercent: number;   // Price % change
  iv: number;              // Implied Volatility %
  buildUp: OptionBuildUpType;
}

export interface OptionStrikeRow {
  strikePrice: number;
  call: OptionLegData;
  put: OptionLegData;
  isAtm: boolean;
  distanceFromAtm: number;
}

export interface VixRiskGuidance {
  regime: 'LOW_VOLATILITY' | 'NORMAL' | 'HIGH_VOLATILITY' | 'EXTREME_VOLATILITY';
  vixValue: number;
  title: string;
  description: string;
  stopLossMultiplier: number; // 1.0 (normal) to 1.5 (high)
  positionSizeFactor: number;  // 1.0 (normal) or 0.5 (cut size 50%)
  recommendation: string;
}

export interface OptionChainData {
  underlying: 'NIFTY' | 'BANKNIFTY' | 'FINNIFTY' | 'SENSEX';
  underlyingName: string;
  spotPrice: number;
  spotChange: number;
  spotChangePercent: number;
  futuresPrice: number;
  futuresBasis: number; // futuresPrice - spotPrice
  expiryDate: string;
  availableExpiries: string[];
  totalCallOi: number;
  totalPutOi: number;
  totalCallVolume: number;
  totalPutVolume: number;
  pcr: number; // Put-Call Ratio
  pcrSentiment: 'EXTREME_BEARISH' | 'BEARISH' | 'NEUTRAL' | 'BULLISH' | 'EXTREME_BULLISH';
  pcrDescription: string;
  maxPainStrike: number;
  highestCallOiStrike: number; // Resistance wall
  highestPutOiStrike: number;  // Support floor
  indiaVix: number;
  vixRisk: VixRiskGuidance;
  strikes: OptionStrikeRow[];
  maxPainCurve: { strike: number; totalLossRupees: number }[];
  lastUpdated: string;
}

