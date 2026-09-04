const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const subDirs = [
  'types',
  'services',
  'context',
  'components/common',
  'components/charts',
  'components/layout',
  'components/modals',
  'pages'
];

subDirs.forEach(dir => {
  const fullPath = path.join(srcDir, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// src/index.css
fs.writeFileSync(path.join(srcDir, 'index.css'), `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-bg-primary: #090A0F;
  --color-bg-secondary: #111318;
  --color-bg-card: #171A21;
  --color-bg-elevated: #1D212A;
  --color-text-primary: #F5F7FA;
  --color-text-secondary: #9AA3B2;
  --color-text-muted: #64748B;
  --color-border: #272C36;
}

html.light {
  --color-bg-primary: #F4F6F9;
  --color-bg-secondary: #FFFFFF;
  --color-bg-card: #FFFFFF;
  --color-bg-elevated: #F8FAFC;
  --color-text-primary: #0F172A;
  --color-text-secondary: #64748B;
  --color-text-muted: #94A3B8;
  --color-border: #E2E8F0;
}

body {
  margin: 0;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  overflow-x: hidden;
  -webkit-tap-highlight-color: transparent;
}

/* Custom scrollbars */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #C9A227;
}

.glass-panel {
  background: rgba(23, 26, 33, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(39, 44, 54, 0.8);
}

html.light .glass-panel {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(226, 232, 240, 0.9);
}

/* Smooth chart animation transitions */
canvas {
  touch-action: none;
}
`);

// src/types/index.ts
fs.writeFileSync(path.join(srcDir, 'types/index.ts'), `export type StockSymbol = string;

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
`);

console.log('Types and styles written successfully');
