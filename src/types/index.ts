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

export interface PaperOrder {
  id: string;
  stockSymbol: string;
  stockName: string;
  direction: TradeDirection;
  orderType: 'MARKET' | 'LIMIT';
  productType: 'INTRADAY (MIS)' | 'DELIVERY (CNC)';
  quantity: number;
  price: number;
  targetPrice?: number;
  stopLoss?: number;
  status: 'PENDING' | 'EXECUTED' | 'CANCELLED';
  timestamp: string;
  executedPrice?: number;
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
}

export interface PaperPortfolio {
  initialCapital: number;
  cashBalance: number;
  usedMargin: number;
  realizedPnL: number;
  unrealizedPnL: number;
  totalPortfolioValue: number;
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
}
