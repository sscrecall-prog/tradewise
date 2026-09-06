import {
  JournalEntry,
  PaperOrder,
  PaperPosition,
  PaperPortfolio,
  TradingPreferences,
  UserProfile,
  AppSettings,
  AcademyLesson,
  TradePlan
} from '../types';
import { StorageService } from './StorageService';

export class DemoDataSeeder {
  static getInitialWatchlist(): string[] {
    return ['RELIANCE', 'HDFCBANK', 'TCS', 'INFY', 'ICICIBANK', 'SBIN', 'TATAMOTORS'];
  }

  static getInitialPreferences(): TradingPreferences {
    return {
      defaultCapital: 100000,
      defaultRiskPercentage: 1.0,
      maxDailyLoss: 1000,
      maxTradesPerDay: 2,
      preferredSetup: 'Breakout',
      strictWarningThresholds: true,
      defaultBrokeragePerOrder: 20
    };
  }

  static getInitialProfile(): UserProfile {
    return {
      name: 'Rohan Sharma',
      tradingStyle: 'Intraday Trader',
      experienceLevel: 'Beginner (< 1 Year)',
      joinedDate: '2026-08-01'
    };
  }

  static getInitialSettings(): AppSettings {
    return {
      theme: 'dark',
      currency: 'INR',
      currencySymbol: '₹',
      soundEnabled: true,
      autoRefreshData: true,
      refreshIntervalSeconds: 5
    };
  }

  static getInitialJournal(): JournalEntry[] {
    return [
  {
    "id": "j-01",
    "date": "2026-08-04",
    "time": "09:45",
    "stockSymbol": "RELIANCE",
    "stockName": "Reliance Industries Ltd.",
    "direction": "BUY",
    "entryPrice": 2880,
    "exitPrice": 2920,
    "quantity": 25,
    "stopLoss": 2860,
    "targetPrice": 2920,
    "grossPnL": 1000,
    "estimatedCharges": 42.5,
    "netPnL": 957.5,
    "status": "CLOSED",
    "setup": "Breakout",
    "emotion": "Calm",
    "planFollowed": true,
    "movedStopLoss": false,
    "overtraded": false,
    "mistake": "None",
    "notes": "Clean 15-min opening range breakout with strong volume.",
    "rMultiple": 2,
    "holdingTimeMinutes": 45,
    "createdAt": "2026-08-04T09:45:00Z",
    "closedAt": "2026-08-04T10:30:00Z"
  },
  {
    "id": "j-02",
    "date": "2026-08-05",
    "time": "10:15",
    "stockSymbol": "HDFCBANK",
    "stockName": "HDFC Bank Ltd.",
    "direction": "BUY",
    "entryPrice": 1620,
    "exitPrice": 1608,
    "quantity": 40,
    "stopLoss": 1608,
    "targetPrice": 1644,
    "grossPnL": -480,
    "estimatedCharges": 38.2,
    "netPnL": -518.2,
    "status": "CLOSED",
    "setup": "Pullback",
    "emotion": "Neutral",
    "planFollowed": true,
    "movedStopLoss": false,
    "overtraded": false,
    "mistake": "None",
    "notes": "Pullback to 20 EMA failed as bank nifty weakened. Respected SL strictly.",
    "rMultiple": -1,
    "holdingTimeMinutes": 28,
    "createdAt": "2026-08-05T10:15:00Z",
    "closedAt": "2026-08-05T10:43:00Z"
  },
  {
    "id": "j-03",
    "date": "2026-08-06",
    "time": "11:30",
    "stockSymbol": "TCS",
    "stockName": "Tata Consultancy Services",
    "direction": "BUY",
    "entryPrice": 4200,
    "exitPrice": 4260,
    "quantity": 15,
    "stopLoss": 4170,
    "targetPrice": 4260,
    "grossPnL": 900,
    "estimatedCharges": 48,
    "netPnL": 852,
    "status": "CLOSED",
    "setup": "Support/Resistance",
    "emotion": "Calm",
    "planFollowed": true,
    "movedStopLoss": false,
    "overtraded": false,
    "mistake": "None",
    "notes": "Bounce from major daily support level ₹4,170. Hit exact 1:2 target.",
    "rMultiple": 2,
    "holdingTimeMinutes": 80,
    "createdAt": "2026-08-06T11:30:00Z",
    "closedAt": "2026-08-06T12:50:00Z"
  },
  {
    "id": "j-04",
    "date": "2026-08-07",
    "time": "13:10",
    "stockSymbol": "TATAMOTORS",
    "stockName": "Tata Motors Ltd.",
    "direction": "BUY",
    "entryPrice": 980,
    "exitPrice": 960,
    "quantity": 50,
    "stopLoss": 970,
    "targetPrice": 1000,
    "grossPnL": -1000,
    "estimatedCharges": 36.5,
    "netPnL": -1036.5,
    "status": "CLOSED",
    "setup": "Breakout",
    "emotion": "Fear",
    "planFollowed": false,
    "movedStopLoss": true,
    "overtraded": false,
    "mistake": "Ignored Stop Loss",
    "notes": "Initial SL was 970, but moved it to 960 hoping it would bounce.",
    "rMultiple": -2,
    "holdingTimeMinutes": 55,
    "createdAt": "2026-08-07T13:10:00Z",
    "closedAt": "2026-08-07T14:05:00Z"
  },
  {
    "id": "j-05",
    "date": "2026-08-10",
    "time": "09:30",
    "stockSymbol": "INFY",
    "stockName": "Infosys Ltd.",
    "direction": "BUY",
    "entryPrice": 1780,
    "exitPrice": 1815,
    "quantity": 30,
    "stopLoss": 1765,
    "targetPrice": 1815,
    "grossPnL": 1050,
    "estimatedCharges": 41.2,
    "netPnL": 1008.8,
    "status": "CLOSED",
    "setup": "Trend Continuation",
    "emotion": "Calm",
    "planFollowed": true,
    "movedStopLoss": false,
    "overtraded": false,
    "mistake": "None",
    "notes": "IT sector strong. Higher highs on 5 min chart.",
    "rMultiple": 2.33,
    "holdingTimeMinutes": 62,
    "createdAt": "2026-08-10T09:30:00Z",
    "closedAt": "2026-08-10T10:32:00Z"
  },
  {
    "id": "j-06",
    "date": "2026-08-11",
    "time": "14:00",
    "stockSymbol": "SBIN",
    "stockName": "State Bank of India",
    "direction": "BUY",
    "entryPrice": 805,
    "exitPrice": 796,
    "quantity": 60,
    "stopLoss": 796,
    "targetPrice": 820,
    "grossPnL": -540,
    "estimatedCharges": 34,
    "netPnL": -574,
    "status": "CLOSED",
    "setup": "Reversal",
    "emotion": "FOMO",
    "planFollowed": false,
    "movedStopLoss": false,
    "overtraded": true,
    "mistake": "FOMO Entry",
    "notes": "Took trade late afternoon without proper setup.",
    "rMultiple": -1,
    "holdingTimeMinutes": 35,
    "createdAt": "2026-08-11T14:00:00Z",
    "closedAt": "2026-08-11T14:35:00Z"
  },
  {
    "id": "j-07",
    "date": "2026-08-12",
    "time": "10:00",
    "stockSymbol": "ICICIBANK",
    "stockName": "ICICI Bank Ltd.",
    "direction": "BUY",
    "entryPrice": 1180,
    "exitPrice": 1205,
    "quantity": 40,
    "stopLoss": 1168,
    "targetPrice": 1204,
    "grossPnL": 1000,
    "estimatedCharges": 40,
    "netPnL": 960,
    "status": "CLOSED",
    "setup": "Breakout",
    "emotion": "Calm",
    "planFollowed": true,
    "movedStopLoss": false,
    "overtraded": false,
    "mistake": "None",
    "notes": "Resistance breakout at 1180 with heavy institutional volume.",
    "rMultiple": 2.08,
    "holdingTimeMinutes": 75,
    "createdAt": "2026-08-12T10:00:00Z",
    "closedAt": "2026-08-12T11:15:00Z"
  },
  {
    "id": "j-08",
    "date": "2026-08-13",
    "time": "11:15",
    "stockSymbol": "BHARTIARTL",
    "stockName": "Bharti Airtel Ltd.",
    "direction": "BUY",
    "entryPrice": 1540,
    "exitPrice": 1572,
    "quantity": 25,
    "stopLoss": 1524,
    "targetPrice": 1572,
    "grossPnL": 800,
    "estimatedCharges": 39.5,
    "netPnL": 760.5,
    "status": "CLOSED",
    "setup": "Trend Continuation",
    "emotion": "Calm",
    "planFollowed": true,
    "movedStopLoss": false,
    "overtraded": false,
    "mistake": "None",
    "notes": "VWAP bounce strategy in intraday trend.",
    "rMultiple": 2,
    "holdingTimeMinutes": 90,
    "createdAt": "2026-08-13T11:15:00Z",
    "closedAt": "2026-08-13T12:45:00Z"
  },
  {
    "id": "j-09",
    "date": "2026-08-14",
    "time": "13:45",
    "stockSymbol": "MARUTI",
    "stockName": "Maruti Suzuki India Ltd.",
    "direction": "BUY",
    "entryPrice": 12100,
    "exitPrice": 11980,
    "quantity": 5,
    "stopLoss": 12000,
    "targetPrice": 12300,
    "grossPnL": -600,
    "estimatedCharges": 45,
    "netPnL": -645,
    "status": "CLOSED",
    "setup": "Reversal",
    "emotion": "Impatient",
    "planFollowed": false,
    "movedStopLoss": false,
    "overtraded": false,
    "mistake": "Early Exit",
    "notes": "Exited early in panic before hitting technical stop.",
    "rMultiple": -1.2,
    "holdingTimeMinutes": 20,
    "createdAt": "2026-08-14T13:45:00Z",
    "closedAt": "2026-08-14T14:05:00Z"
  },
  {
    "id": "j-10",
    "date": "2026-08-17",
    "time": "09:40",
    "stockSymbol": "RELIANCE",
    "stockName": "Reliance Industries Ltd.",
    "direction": "BUY",
    "entryPrice": 2940,
    "exitPrice": 2985,
    "quantity": 20,
    "stopLoss": 2915,
    "targetPrice": 2990,
    "grossPnL": 900,
    "estimatedCharges": 42,
    "netPnL": 858,
    "status": "CLOSED",
    "setup": "Breakout",
    "emotion": "Calm",
    "planFollowed": true,
    "movedStopLoss": false,
    "overtraded": false,
    "mistake": "None",
    "notes": "Pre-market gap up holding and broke initial 15m high cleanly.",
    "rMultiple": 1.8,
    "holdingTimeMinutes": 50,
    "createdAt": "2026-08-17T09:40:00Z",
    "closedAt": "2026-08-17T10:30:00Z"
  },
  {
    "id": "j-11",
    "date": "2026-08-18",
    "time": "10:30",
    "stockSymbol": "LT",
    "stockName": "Larsen & Toubro Ltd.",
    "direction": "BUY",
    "entryPrice": 3550,
    "exitPrice": 3610,
    "quantity": 15,
    "stopLoss": 3520,
    "targetPrice": 3610,
    "grossPnL": 900,
    "estimatedCharges": 44,
    "netPnL": 856,
    "status": "CLOSED",
    "setup": "Support/Resistance",
    "emotion": "Calm",
    "planFollowed": true,
    "movedStopLoss": false,
    "overtraded": false,
    "mistake": "None",
    "notes": "L&T strong order book news. Support at 3520 swing low.",
    "rMultiple": 2,
    "holdingTimeMinutes": 110,
    "createdAt": "2026-08-18T10:30:00Z",
    "closedAt": "2026-08-18T12:20:00Z"
  },
  {
    "id": "j-12",
    "date": "2026-08-19",
    "time": "12:00",
    "stockSymbol": "SUNPHARMA",
    "stockName": "Sun Pharmaceutical Industries",
    "direction": "BUY",
    "entryPrice": 1740,
    "exitPrice": 1720,
    "quantity": 25,
    "stopLoss": 1720,
    "targetPrice": 1780,
    "grossPnL": -500,
    "estimatedCharges": 37,
    "netPnL": -537,
    "status": "CLOSED",
    "setup": "Pullback",
    "emotion": "Neutral",
    "planFollowed": true,
    "movedStopLoss": false,
    "overtraded": false,
    "mistake": "None",
    "notes": "Pharma sector lagging today. Planned loss accepted smoothly.",
    "rMultiple": -1,
    "holdingTimeMinutes": 40,
    "createdAt": "2026-08-19T12:00:00Z",
    "closedAt": "2026-08-19T12:40:00Z"
  },
  {
    "id": "j-13",
    "date": "2026-08-20",
    "time": "13:00",
    "stockSymbol": "TATAMOTORS",
    "stockName": "Tata Motors Ltd.",
    "direction": "BUY",
    "entryPrice": 1005,
    "exitPrice": 1025,
    "quantity": 40,
    "stopLoss": 995,
    "targetPrice": 1025,
    "grossPnL": 800,
    "estimatedCharges": 35,
    "netPnL": 765,
    "status": "CLOSED",
    "setup": "Breakout",
    "emotion": "Calm",
    "planFollowed": true,
    "movedStopLoss": false,
    "overtraded": false,
    "mistake": "None",
    "notes": "Broke above psychological mark of ₹1,000.",
    "rMultiple": 2,
    "holdingTimeMinutes": 45,
    "createdAt": "2026-08-20T13:00:00Z",
    "closedAt": "2026-08-20T13:45:00Z"
  },
  {
    "id": "j-14",
    "date": "2026-08-21",
    "time": "11:00",
    "stockSymbol": "BAJFINANCE",
    "stockName": "Bajaj Finance Ltd.",
    "direction": "BUY",
    "entryPrice": 7180,
    "exitPrice": 7100,
    "quantity": 8,
    "stopLoss": 7120,
    "targetPrice": 7300,
    "grossPnL": -640,
    "estimatedCharges": 42,
    "netPnL": -682,
    "status": "CLOSED",
    "setup": "Reversal",
    "emotion": "Revenge",
    "planFollowed": false,
    "movedStopLoss": true,
    "overtraded": true,
    "mistake": "Revenge Trading",
    "notes": "Recouping flat trade by jumping into high beta stock.",
    "rMultiple": -1.33,
    "holdingTimeMinutes": 30,
    "createdAt": "2026-08-21T11:00:00Z",
    "closedAt": "2026-08-21T11:30:00Z"
  },
  {
    "id": "j-15",
    "date": "2026-08-24",
    "time": "09:30",
    "stockSymbol": "TCS",
    "stockName": "Tata Consultancy Services",
    "direction": "BUY",
    "entryPrice": 4280,
    "exitPrice": 4335,
    "quantity": 15,
    "stopLoss": 4250,
    "targetPrice": 4340,
    "grossPnL": 825,
    "estimatedCharges": 46,
    "netPnL": 779,
    "status": "CLOSED",
    "setup": "Breakout",
    "emotion": "Calm",
    "planFollowed": true,
    "movedStopLoss": false,
    "overtraded": false,
    "mistake": "None",
    "notes": "All time high momentum continuation.",
    "rMultiple": 1.83,
    "holdingTimeMinutes": 65,
    "createdAt": "2026-08-24T09:30:00Z",
    "closedAt": "2026-08-24T10:35:00Z"
  },
  {
    "id": "j-16",
    "date": "2026-08-25",
    "time": "10:15",
    "stockSymbol": "INFY",
    "stockName": "Infosys Ltd.",
    "direction": "BUY",
    "entryPrice": 1825,
    "exitPrice": 1855,
    "quantity": 30,
    "stopLoss": 1810,
    "targetPrice": 1855,
    "grossPnL": 900,
    "estimatedCharges": 41.5,
    "netPnL": 858.5,
    "status": "CLOSED",
    "setup": "Trend Continuation",
    "emotion": "Calm",
    "planFollowed": true,
    "movedStopLoss": false,
    "overtraded": false,
    "mistake": "None",
    "notes": "Riding the IT wave. Trailed SL behind 5m swing lows.",
    "rMultiple": 2,
    "holdingTimeMinutes": 70,
    "createdAt": "2026-08-25T10:15:00Z",
    "closedAt": "2026-08-25T11:25:00Z"
  },
  {
    "id": "j-17",
    "date": "2026-08-26",
    "time": "13:30",
    "stockSymbol": "TITAN",
    "stockName": "Titan Company Ltd.",
    "direction": "BUY",
    "entryPrice": 3520,
    "exitPrice": 3480,
    "quantity": 12,
    "stopLoss": 3480,
    "targetPrice": 3600,
    "grossPnL": -480,
    "estimatedCharges": 39,
    "netPnL": -519,
    "status": "CLOSED",
    "setup": "Breakout",
    "emotion": "Neutral",
    "planFollowed": true,
    "movedStopLoss": false,
    "overtraded": false,
    "mistake": "None",
    "notes": "Breakout failed at 3540 resistance. SL triggered cleanly.",
    "rMultiple": -1,
    "holdingTimeMinutes": 35,
    "createdAt": "2026-08-26T13:30:00Z",
    "closedAt": "2026-08-26T14:05:00Z"
  },
  {
    "id": "j-18",
    "date": "2026-08-27",
    "time": "10:00",
    "stockSymbol": "HDFCBANK",
    "stockName": "HDFC Bank Ltd.",
    "direction": "BUY",
    "entryPrice": 1630,
    "exitPrice": 1655,
    "quantity": 35,
    "stopLoss": 1618,
    "targetPrice": 1654,
    "grossPnL": 875,
    "estimatedCharges": 42,
    "netPnL": 833,
    "status": "CLOSED",
    "setup": "Support/Resistance",
    "emotion": "Calm",
    "planFollowed": true,
    "movedStopLoss": false,
    "overtraded": false,
    "mistake": "None",
    "notes": "Reversal off 51,000 support in Bank Nifty.",
    "rMultiple": 2.08,
    "holdingTimeMinutes": 85,
    "createdAt": "2026-08-27T10:00:00Z",
    "closedAt": "2026-08-27T11:25:00Z"
  },
  {
    "id": "j-19",
    "date": "2026-08-28",
    "time": "11:30",
    "stockSymbol": "RELIANCE",
    "stockName": "Reliance Industries Ltd.",
    "direction": "BUY",
    "entryPrice": 2970,
    "exitPrice": 2995,
    "quantity": 20,
    "stopLoss": 2955,
    "targetPrice": 3000,
    "grossPnL": 500,
    "estimatedCharges": 42.5,
    "netPnL": 457.5,
    "status": "CLOSED",
    "setup": "Pullback",
    "emotion": "Calm",
    "planFollowed": true,
    "movedStopLoss": false,
    "overtraded": false,
    "mistake": "None",
    "notes": "Solid test of VWAP with bullish engulfing candle.",
    "rMultiple": 1.67,
    "holdingTimeMinutes": 50,
    "createdAt": "2026-08-28T11:30:00Z",
    "closedAt": "2026-08-28T12:20:00Z"
  },
  {
    "id": "j-20",
    "date": "2026-08-29",
    "time": "14:15",
    "stockSymbol": "SBIN",
    "stockName": "State Bank of India",
    "direction": "BUY",
    "entryPrice": 814,
    "exitPrice": 808,
    "quantity": 50,
    "stopLoss": 808,
    "targetPrice": 826,
    "grossPnL": -300,
    "estimatedCharges": 32,
    "netPnL": -332,
    "status": "CLOSED",
    "setup": "Trend Continuation",
    "emotion": "Neutral",
    "planFollowed": true,
    "movedStopLoss": false,
    "overtraded": false,
    "mistake": "None",
    "notes": "End of month market consolidation.",
    "rMultiple": -1,
    "holdingTimeMinutes": 25,
    "createdAt": "2026-08-29T14:15:00Z",
    "closedAt": "2026-08-29T14:40:00Z"
  },
  {
    "id": "j-21",
    "date": "2026-09-01",
    "time": "09:45",
    "stockSymbol": "TATAMOTORS",
    "stockName": "Tata Motors Ltd.",
    "direction": "BUY",
    "entryPrice": 1010,
    "quantity": 30,
    "stopLoss": 995,
    "targetPrice": 1040,
    "grossPnL": 442.5,
    "estimatedCharges": 35,
    "netPnL": 407.5,
    "status": "OPEN",
    "setup": "Breakout",
    "emotion": "Calm",
    "planFollowed": true,
    "movedStopLoss": false,
    "overtraded": false,
    "mistake": "None",
    "notes": "Monthly auto sales numbers came strong. In active profit.",
    "rMultiple": 0.98,
    "createdAt": "2026-09-01T09:45:00Z"
  }
];
  }

  static getInitialPaperPortfolio(): PaperPortfolio {
    return {
      initialCapital: 100000,
      cashBalance: 89069.50,
      usedMargin: 10930.50,
      realizedPnL: 4250,
      unrealizedPnL: 820.25,
      totalPortfolioValue: 105070.25,
      totalChargesPaid: 248.50,
      totalTradesCount: 7
    };
  }

  static getInitialPaperPositions(): PaperPosition[] {
    return [
      {
        id: 'pos-1',
        stockSymbol: 'RELIANCE',
        stockName: 'Reliance Industries Ltd.',
        direction: 'BUY',
        quantity: 10,
        avgPrice: 2960.00,
        currentPrice: 2985.40,
        stopLoss: 2940.00,
        targetPrice: 3000.00,
        unrealizedPnL: 254.00,
        unrealizedPnLPercent: 0.86,
        productType: 'INTRADAY (MIS)',
        openedAt: '2026-09-01T09:35:00Z',
        marginAllocated: 5920.00,
        leverage: 5,
        buyCharges: 21.40,
        netPnL: 232.60
      },
      {
        id: 'pos-2',
        stockSymbol: 'TATAMOTORS',
        stockName: 'Tata Motors Ltd.',
        direction: 'BUY',
        quantity: 25,
        avgPrice: 1002.10,
        currentPrice: 1024.75,
        stopLoss: 990.00,
        targetPrice: 1030.00,
        unrealizedPnL: 566.25,
        unrealizedPnLPercent: 2.26,
        productType: 'INTRADAY (MIS)',
        openedAt: '2026-09-01T10:05:00Z',
        marginAllocated: 5010.50,
        leverage: 5,
        buyCharges: 18.25,
        netPnL: 548.00
      }
    ];
  }

  static getInitialPaperOrders(): PaperOrder[] {
    return [
      {
        id: 'ord-1',
        stockSymbol: 'RELIANCE',
        stockName: 'Reliance Industries Ltd.',
        direction: 'BUY',
        orderType: 'MARKET',
        productType: 'INTRADAY (MIS)',
        quantity: 10,
        price: 2960.00,
        executedPrice: 2960.00,
        stopLoss: 2940.00,
        targetPrice: 3000.00,
        status: 'EXECUTED',
        timestamp: '2026-09-01 09:35:12',
        marginRequired: 5920.00,
        turnover: 29600.00,
        contractNoteId: 'CN-884210',
        charges: {
          brokerage: 8.88,
          stt: 0,
          exchangeCharges: 0.88,
          gst: 1.76,
          sebiCharges: 0.03,
          stampDuty: 0.89,
          totalCharges: 12.44,
          breakevenPoints: 1.24
        }
      },
      {
        id: 'ord-2',
        stockSymbol: 'TATAMOTORS',
        stockName: 'Tata Motors Ltd.',
        direction: 'BUY',
        orderType: 'MARKET',
        productType: 'INTRADAY (MIS)',
        quantity: 25,
        price: 1002.10,
        executedPrice: 1002.10,
        stopLoss: 990.00,
        targetPrice: 1030.00,
        status: 'EXECUTED',
        timestamp: '2026-09-01 10:05:44',
        marginRequired: 5010.50,
        turnover: 25052.50,
        contractNoteId: 'CN-884211',
        charges: {
          brokerage: 7.52,
          stt: 0,
          exchangeCharges: 0.74,
          gst: 1.49,
          sebiCharges: 0.03,
          stampDuty: 0.75,
          totalCharges: 10.53,
          breakevenPoints: 0.42
        }
      },
      {
        id: 'ord-3',
        stockSymbol: 'INFY',
        stockName: 'Infosys Ltd.',
        direction: 'BUY',
        orderType: 'LIMIT',
        productType: 'INTRADAY (MIS)',
        quantity: 15,
        price: 1830.00,
        stopLoss: 1815.00,
        targetPrice: 1860.00,
        status: 'PENDING',
        timestamp: '2026-09-01 11:20:00',
        marginRequired: 5490.00,
        turnover: 27450.00,
        contractNoteId: 'CN-884212',
        charges: {
          brokerage: 8.24,
          stt: 0,
          exchangeCharges: 0.82,
          gst: 1.63,
          sebiCharges: 0.03,
          stampDuty: 0.82,
          totalCharges: 11.54,
          breakevenPoints: 0.77
        }
      }
    ];
  }

  static getInitialAcademyLessons(): AcademyLesson[] {
    return [
  {
    "id": "lesson-1-1",
    "level": 1,
    "levelTitle": "Level 1 — Foundations",
    "title": "What is the Indian Stock Market?",
    "slug": "what-is-indian-stock-market",
    "readTime": "4 min read",
    "summary": "Understand the core ecosystem: NSE, BSE, SEBI, Demat accounts, and how shares are traded.",
    "contentMarkdown": "The Indian stock market is an organized marketplace where shares of publicly listed companies are traded.\\n\\n### Key Market Pillars in India:\\n1. **Stock Exchanges**: NSE (National Stock Exchange) and BSE (Bombay Stock Exchange).\\n2. **The Regulator — SEBI**: Protects investor interests and enforces fair practices.\\n3. **Depositories (CDSL & NSDL)**: Electronic vaults where shares are stored in digital Demat format.",
    "exampleScenario": "When you buy 10 shares of Infosys on your broker app (e.g. Zerodha or Groww), the order routes to NSE. CDSL stores the shares in your Demat account.",
    "keyTakeaways": [
      "NSE and BSE are exchanges; SEBI is the regulatory authority.",
      "Demat accounts hold shares electronically; Trading accounts are used to place orders.",
      "Standard market hours in India are 09:15 AM to 03:30 PM IST (Mon-Fri)."
    ],
    "quiz": [
      {
        "id": "q-1-1",
        "question": "Which regulatory authority oversees and regulates the Indian securities market?",
        "options": [
          "RBI",
          "SEBI",
          "IRDAI",
          "Ministry of Finance"
        ],
        "correctOptionIndex": 1,
        "explanation": "SEBI (Securities and Exchange Board of India) is the statutory regulatory body governing Indian capital markets."
      },
      {
        "id": "q-1-2",
        "question": "What is the primary role of a Demat account?",
        "options": [
          "To transfer money from your bank",
          "To hold shares and securities in electronic format",
          "To calculate intraday brokerage",
          "To guarantee profit returns"
        ],
        "correctOptionIndex": 1,
        "explanation": "A Demat (Dematerialized) account securely stores your financial instruments in digital form with CDSL or NSDL."
      }
    ],
    "isCompleted": true,
    "quizScore": 100
  },
  {
    "id": "lesson-1-2",
    "level": 1,
    "levelTitle": "Level 1 — Foundations",
    "title": "Order Types: Market, Limit, and Stop Loss",
    "slug": "order-types-explained",
    "readTime": "5 min read",
    "summary": "Learn how Market Orders, Limit Orders, and SL (Stop-Loss) Orders protect your capital.",
    "contentMarkdown": "Executing trades correctly requires picking the right order type.\\n\\n### 1. Market Order\\n- Executes immediately at the best available market price.\\n- Risk: High slippage during volatile sessions.\\n\\n### 2. Limit Order\\n- Executes only at your specified price or better.\\n- Advantage: Full price protection.\\n\\n### 3. Stop-Loss (SL) Order\\n- Automatic risk limiter that exits your position if the price moves against you.",
    "exampleScenario": "Reliance trades at ₹2,980. You place a Limit Buy at ₹2,975 and an SL Order at ₹2,955. Your risk is strictly capped at ₹20/share.",
    "keyTakeaways": [
      "Always prefer Limit Orders over Market Orders during volatile morning openings.",
      "Never enter a trade without a predefined active Stop Loss.",
      "Slippage is the difference between your expected price and actual execution price."
    ],
    "quiz": [
      {
        "id": "q-1-3",
        "question": "If you want to buy TCS only at ₹4,300 or lower, which order type should you place?",
        "options": [
          "Market Order",
          "Limit Order",
          "SL-Market at ₹4,350",
          "Disclosed Order"
        ],
        "correctOptionIndex": 1,
        "explanation": "A Limit Order guarantees you buy at ₹4,300 or cheaper, protecting you from paying higher."
      }
    ],
    "isCompleted": true,
    "quizScore": 100
  },
  {
    "id": "lesson-1-3",
    "level": 1,
    "levelTitle": "Level 1 — Foundations",
    "title": "Understanding Indian Trading Charges & Taxes",
    "slug": "indian-trading-charges-stt-gst",
    "readTime": "6 min read",
    "summary": "Master the breakdown of Brokerage, STT, GST, Stamp Duty, and Exchange Turnover Fees.",
    "contentMarkdown": "Trading costs directly impact your net profitability.\\n\\n### Charges Breakdown:\\n1. **Brokerage**: Flat ₹20/order with discount brokers.\\n2. **STT (Securities Transaction Tax)**: 0.025% on sell turnover (Intraday) or 0.1% on both legs (Delivery).\\n3. **Exchange Turnover**: ~0.00297% on turnover.\\n4. **GST**: 18% on (Brokerage + Exchange Fees + SEBI charges).\\n5. **Stamp Duty**: 0.003% on buy value (Intraday).",
    "exampleScenario": "Buying 50 shares of Reliance at ₹2,500 and selling at ₹2,520 yields ₹1,000 gross profit. Charges equal ~₹42, resulting in ₹958 Net P&L.",
    "keyTakeaways": [
      "Overtrading racks up massive brokerage and STT even if gross P&L is neutral.",
      "Net P&L = Gross P&L minus regulatory taxes and brokerage fees.",
      "Always factor in breakeven points when planning scalp setups."
    ],
    "quiz": [
      {
        "id": "q-1-4",
        "question": "On which side of an intraday equity trade is STT charged?",
        "options": [
          "Only on the Buy side",
          "Only on the Sell side",
          "On both Buy and Sell sides",
          "STT is exempt for intraday"
        ],
        "correctOptionIndex": 1,
        "explanation": "In Indian equity intraday trading, STT is levied at 0.025% solely on the sell-side turnover."
      }
    ],
    "isCompleted": false
  },
  {
    "id": "lesson-2-1",
    "level": 2,
    "levelTitle": "Level 2 — Technical Analysis",
    "title": "Candlestick Anatomy & Core Price Action",
    "slug": "candlestick-anatomy-and-price-action",
    "readTime": "5 min read",
    "summary": "Understand Open, High, Low, Close (OHLC) and how wick rejections signal supply and demand.",
    "contentMarkdown": "Candlesticks show the battle between buyers and sellers.\\n\\n### Anatomy:\\n- **Body**: Range between Open and Close.\\n  - Green: Bullish close > open.\\n  - Red: Bearish close < open.\\n- **Upper Wick**: Selling rejection from peak.\\n- **Lower Wick**: Buying support from trough.",
    "exampleScenario": "Tata Motors drops to ₹1,000 on high volume but buyers push it up to close at ₹1,024, leaving a long hammer wick. This demonstrates aggressive demand at ₹1,000.",
    "keyTakeaways": [
      "Candlestick wicks reveal where liquidity and price rejection occurred.",
      "Never trade a candlestick pattern in isolation without contextual trend support.",
      "Higher timeframes (15m, 1h, Daily) carry significantly higher reliability."
    ],
    "quiz": [
      {
        "id": "q-2-1",
        "question": "What does a long lower shadow (wick) on a candlestick indicate?",
        "options": [
          "Sellers held total control",
          "Buyers absorbed the sell-off and drove price higher",
          "Market closed at the absolute day low",
          "Volume was zero"
        ],
        "correctOptionIndex": 1,
        "explanation": "A long lower wick indicates buying rejection of lower prices."
      }
    ],
    "isCompleted": true,
    "quizScore": 100
  },
  {
    "id": "lesson-2-2",
    "level": 2,
    "levelTitle": "Level 2 — Technical Analysis",
    "title": "Support and Resistance: Horizontal Supply & Demand",
    "slug": "support-and-resistance-zones",
    "readTime": "6 min read",
    "summary": "Identify psychological price levels where price repeatedly pauses, reverses, or breaks out.",
    "contentMarkdown": "Support and Resistance are price **zones**, not exact single rupee lines.\\n\\n### 1. Support (Floor)\\n- Price level where buying demand halts downward momentum.\\n\\n### 2. Resistance (Ceiling)\\n- Price level where selling pressure halts upward rallies.\\n\\n### Role Reversal:\\n- Broken resistance decisively turns into future support.",
    "exampleScenario": "HDFC Bank bounces 3 times off ₹1,600. Once it breaks resistance at ₹1,660, that ₹1,660 level serves as new support on pullbacks.",
    "keyTakeaways": [
      "Treat S&R levels as zones of liquidity.",
      "Broken resistance becomes new support.",
      "High volume confirmation on breakout is essential."
    ],
    "quiz": [
      {
        "id": "q-2-2",
        "question": "What happens when a major resistance level is broken with high volume?",
        "options": [
          "The level becomes invalid",
          "The resistance level often turns into support on future pullbacks",
          "The stock can never decline again",
          "Exchange halts trading"
        ],
        "correctOptionIndex": 1,
        "explanation": "The Role Reversal principle states that broken resistance frequently flips to become support."
      }
    ],
    "isCompleted": false
  },
  {
    "id": "lesson-2-3",
    "level": 2,
    "levelTitle": "Level 2 — Technical Analysis",
    "title": "Core Indicators: EMA, RSI, and VWAP",
    "slug": "core-technical-indicators",
    "readTime": "7 min read",
    "summary": "Use indicators as objective confirmation filters, not as magical crystal balls.",
    "contentMarkdown": "Indicators confirm trends and momentum.\\n\\n### 1. EMA (Exponential Moving Average)\\n- 20 EMA: Short-term momentum.\\n- 200 EMA: Major trend filter.\\n\\n### 2. RSI (Relative Strength Index)\\n- Measures velocity (0-100). Above 60 is bullish momentum.\\n\\n### 3. VWAP (Volume Weighted Average Price)\\n- Institutional benchmark for intraday trend direction.",
    "exampleScenario": "Tata Motors holds above VWAP and tests the 20 EMA at ₹1,015. A bullish reversal candle provides a high-probability long entry.",
    "keyTakeaways": [
      "VWAP is the premier benchmark for intraday equity direction.",
      "Indicators confirm price structure; they do not dictate it.",
      "Keep your chart clean with 2-3 complimentary tools."
    ],
    "quiz": [
      {
        "id": "q-2-3",
        "question": "Why is VWAP critical for intraday equity traders?",
        "options": [
          "It guarantees profits",
          "Institutional algorithms use it as a true volume-weighted benchmark",
          "It eliminates taxes",
          "It only works after 3 PM"
        ],
        "correctOptionIndex": 1,
        "explanation": "VWAP reflects the true average price weighted by institutional volume."
      }
    ],
    "isCompleted": false
  },
  {
    "id": "lesson-3-1",
    "level": 3,
    "levelTitle": "Level 3 — Trading Strategy & Risk",
    "title": "The Mathematics of Risk-to-Reward (R:R)",
    "slug": "risk-to-reward-mathematics",
    "readTime": "6 min read",
    "summary": "Learn why a 40% win rate can make you consistently profitable with proper 1:2 or 1:3 R:R.",
    "contentMarkdown": "Winning trading is about asymmetric risk-reward math.\\n\\n### The Math:\\nTake 10 trades risking ₹1,000 with 1:2 R:R:\\n- **4 Wins (40%)**: 4 × ₹2,000 = +₹8,000\\n- **6 Losses (60%)**: 6 × ₹1,000 = -₹6,000\\n- **Net Profit**: +₹2,000 Net Gain!\\n\\n### Minimum Standard:\\nNever enter a setup with less than 1:1.5 (preferably 1:2) R:R.",
    "exampleScenario": "Entry: ₹500, Stop Loss: ₹490 (Risk: ₹10), Target: ₹520 (Reward: ₹20). R:R is 1:2.",
    "keyTakeaways": [
      "High win rate is useless if average loss exceeds average win.",
      "With 1:2 R:R, you only need to be right 34% of the time to break even.",
      "Always calculate exit targets before clicking buy."
    ],
    "quiz": [
      {
        "id": "q-3-1",
        "question": "If you risk ₹500 to make ₹1,500, what is the Risk to Reward ratio?",
        "options": [
          "1 : 1",
          "1 : 2",
          "1 : 3",
          "3 : 1"
        ],
        "correctOptionIndex": 2,
        "explanation": "Risk ₹500 : Reward ₹1,500 gives 1 : 3 ratio."
      }
    ],
    "isCompleted": true,
    "quizScore": 100
  },
  {
    "id": "lesson-3-2",
    "level": 3,
    "levelTitle": "Level 3 — Trading Strategy & Risk",
    "title": "Position Sizing & The 1% Risk Rule",
    "slug": "position-sizing-one-percent-rule",
    "readTime": "6 min read",
    "summary": "How to calculate exact share quantity so no single trade can ever damage your capital.",
    "contentMarkdown": "Position sizing protects your capital from catastrophic drawdowns.\\n\\n### Formula:\\nSuggested Quantity = Floor(Max Risk Amount / Risk Per Share)\\n\\n### Example:\\n- Capital: ₹1,00,000\\n- Max Risk (1%): ₹1,000\\n- Entry: ₹1,250, Stop Loss: ₹1,230 (Risk/share = ₹20)\\n- **Quantity**: ₹1,000 / ₹20 = 50 shares\\n- **Position Value**: 50 × ₹1,250 = ₹62,500",
    "exampleScenario": "With ₹1,00,000 capital, risking ₹1,000 on a ₹20 SL stock means purchasing exactly 50 shares.",
    "keyTakeaways": [
      "Derive share quantity from stop loss distance, never from gut feeling.",
      "The 1% rule enables you to survive 20 consecutive losses with 80%+ capital intact.",
      "Never allocate position size beyond risk parameters."
    ],
    "quiz": [
      {
        "id": "q-3-2",
        "question": "With ₹1,00,000 capital and 1% risk limit (₹1,000), if Entry is ₹500 and Stop Loss is ₹480, what is your suggested quantity?",
        "options": [
          "25 shares",
          "50 shares",
          "100 shares",
          "200 shares"
        ],
        "correctOptionIndex": 1,
        "explanation": "Risk/share = ₹20. Max risk = ₹1,000. 1000 / 20 = 50 shares."
      }
    ],
    "isCompleted": true,
    "quizScore": 100
  },
  {
    "id": "lesson-4-1",
    "level": 4,
    "levelTitle": "Level 4 — Psychology & Discipline",
    "title": "Overcoming FOMO and The Revenge Trading Trap",
    "slug": "overcoming-fomo-and-revenge-trading",
    "readTime": "6 min read",
    "summary": "Recognize emotional triggers that cause beginners to blow accounts and implement circuit breakers.",
    "contentMarkdown": "Trading psychology is 80% of long-term success.\\n\\n### Destructive Traps:\\n1. **FOMO**: Chasing extended moves at peaks without an entry trigger.\\n2. **Revenge Trading**: Angrily taking oversized trades after a loss.\\n\\n### Rules of Discipline:\\n- Max 2 trades per day.\\n- Daily loss limit circuit breaker: when hit, close terminal immediately.",
    "exampleScenario": "After losing ₹500 on trade #1, taking a reckless oversized second trade resulting in ₹3,500 loss is classic revenge trading.",
    "keyTakeaways": [
      "Accepting a small planned loss is the hallmark of a professional.",
      "Missing a move costs ₹0; chasing bad moves costs real money.",
      "A daily stop loss limit protects you from emotional spiral."
    ],
    "quiz": [
      {
        "id": "q-4-1",
        "question": "What is the most disciplined action to take after hitting your maximum daily loss limit?",
        "options": [
          "Double position size to recover",
          "Shut down trading terminal and review journal after market hours",
          "Switch to high-risk options",
          "Average down"
        ],
        "correctOptionIndex": 1,
        "explanation": "Shutting down the terminal preserves capital and stops emotional destruction."
      }
    ],
    "isCompleted": true,
    "quizScore": 100
  },
  {
    "id": "lesson-4-2",
    "level": 4,
    "levelTitle": "Level 4 — Psychology & Discipline",
    "title": "The Pre-Trade Checklist & Journaling Routine",
    "slug": "pre-trade-checklist-and-journaling",
    "readTime": "5 min read",
    "summary": "Build an ironclad daily process: Plan before execution, review after closing.",
    "contentMarkdown": "Follow the loop: **LEARN → PLAN → PRACTICE → JOURNAL → ANALYZE → IMPROVE**.\\n\\n### The 8-Point Pre-Trade Checklist:\\n1. Setup Known\\n2. Entry Predefined\\n3. Stop Loss Predefined\\n4. Target Predefined\\n5. Risk within 1% limit\\n6. Risk/Reward >= 1:1.5\\n7. No FOMO\\n8. No Revenge trading",
    "exampleScenario": "Before clicking Buy, you complete the 8-point checklist in TRADEWISE. At 3:30 PM, you record your emotion and execution score.",
    "keyTakeaways": [
      "Never execute without completing your pre-trade checklist.",
      "Your journal reveals objective patterns in your performance.",
      "Measure success by process adherence, not individual trade outcome."
    ],
    "quiz": [
      {
        "id": "q-4-2",
        "question": "What is the primary benefit of maintaining a comprehensive trading journal?",
        "options": [
          "To show off on social media",
          "To identify recurring behavioral mistakes and analyze which setups yield real positive expectancy",
          "To get automatic buy signals",
          "To avoid taxes"
        ],
        "correctOptionIndex": 1,
        "explanation": "Journaling provides objective data on your emotional patterns and setup profitability."
      }
    ],
    "isCompleted": false
  }
];
  }

  static async seedInitialData(): Promise<void> {
    const isInitialized = typeof window !== 'undefined' ? localStorage.getItem('tw_app_initialized') : null;
    if (isInitialized === 'true') {
      return;
    }

    const existingWatchlist = await StorageService.getAll('watchlist');
    if (existingWatchlist.length === 0) {
      const watchlistItems = this.getInitialWatchlist().map(symbol => ({ id: symbol, symbol, addedAt: new Date().toISOString() }));
      await StorageService.saveAll('watchlist', watchlistItems);
    }

    const existingPrefs = await StorageService.getAll('preferences');
    if (existingPrefs.length === 0) {
      await StorageService.save('preferences', { id: 'user_prefs', ...this.getInitialPreferences() });
    }

    const existingProfile = await StorageService.getAll('profile');
    if (existingProfile.length === 0) {
      await StorageService.save('profile', { id: 'user_profile', ...this.getInitialProfile() });
    }

    const existingSettings = await StorageService.getAll('settings');
    if (existingSettings.length === 0) {
      await StorageService.save('settings', { id: 'app_settings', ...this.getInitialSettings() });
    }

    const existingJournal = await StorageService.getAll('journal');
    if (existingJournal.length === 0) {
      await StorageService.saveAll('journal', this.getInitialJournal());
    }

    const existingPaperPortfolio = await StorageService.getAll('paperPortfolio');
    if (existingPaperPortfolio.length === 0) {
      await StorageService.save('paperPortfolio', { id: 'portfolio_main', ...this.getInitialPaperPortfolio() });
    }

    const existingPaperPositions = await StorageService.getAll('paperPositions');
    if (existingPaperPositions.length === 0) {
      await StorageService.saveAll('paperPositions', this.getInitialPaperPositions());
    }

    const existingPaperOrders = await StorageService.getAll('paperOrders');
    if (existingPaperOrders.length === 0) {
      await StorageService.saveAll('paperOrders', this.getInitialPaperOrders());
    }

    const existingAcademy = await StorageService.getAll('academy');
    if (existingAcademy.length === 0) {
      await StorageService.saveAll('academy', this.getInitialAcademyLessons());
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('tw_app_initialized', 'true');
    }
  }

  static async startFreshBlankCanvas(options?: { startingCapital?: number; traderName?: string }): Promise<void> {
    const storesToClear = [
      'journal',
      'tradePlans',
      'paperOrders',
      'paperPositions'
    ];
    for (const store of storesToClear) {
      await StorageService.clearStore(store);
    }

    const startingCapital = options?.startingCapital || 100000;

    // Fresh Paper Portfolio with starting balance
    const freshPortfolio: PaperPortfolio = {
      initialCapital: startingCapital,
      cashBalance: startingCapital,
      usedMargin: 0,
      realizedPnL: 0,
      unrealizedPnL: 0,
      totalPortfolioValue: startingCapital,
      totalChargesPaid: 0,
      totalTradesCount: 0
    };
    await StorageService.save('paperPortfolio', { id: 'portfolio_main', ...freshPortfolio });

    // Clear price alerts & daily checklist logs from localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('tw_price_alerts');
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('tw_checklist_')) {
            localStorage.removeItem(key);
          }
        });
        localStorage.setItem('tw_app_initialized', 'true');
        localStorage.setItem('tw_canvas_mode', 'blank');
      } catch (e) {
        console.error('Error clearing localStorage for blank canvas:', e);
      }
    }
  }

  static async resetToDemoData(): Promise<void> {
    const stores = [
      'watchlist',
      'journal',
      'tradePlans',
      'paperOrders',
      'paperPositions',
      'paperPortfolio',
      'preferences',
      'profile',
      'settings',
      'academy'
    ];
    for (const store of stores) {
      await StorageService.clearStore(store);
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tw_app_initialized');
      localStorage.setItem('tw_canvas_mode', 'demo');
    }
    await this.seedInitialData();
  }
}
