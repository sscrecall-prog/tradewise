import { FiiDiiCashFlow, FiiDerivativePosition, SectorPerformance, FiiDiiReport } from '../types';

export class FiiDiiService {
  /**
   * Interprets FII Index Futures Long vs Short ratio into institutional sentiment.
   */
  static interpretFiiLongRatio(ratio: number): {
    sentiment: 'OVERSOLD_SQUEEZE' | 'BEARISH' | 'NEUTRAL' | 'BULLISH' | 'OVERBOUGHT_UNWIND';
    label: string;
    description: string;
  } {
    if (ratio <= 25) {
      return {
        sentiment: 'OVERSOLD_SQUEEZE',
        label: 'Extreme Oversold (Short Squeeze Candidate)',
        description: 'FIIs are holding over 75% short positions in Index Futures. Historically, such extreme low long ratios create aggressive short-covering rallies.'
      };
    }
    if (ratio <= 40) {
      return {
        sentiment: 'BEARISH',
        label: 'Institutional Bearish Bias',
        description: 'FIIs have higher short contracts than longs. Pullbacks can face institutional selling pressure.'
      };
    }
    if (ratio <= 60) {
      return {
        sentiment: 'NEUTRAL',
        label: 'Balanced Institutional Positioning',
        description: 'FII long vs short contracts are in a healthy equilibrium. Market will follow intraday technical levels.'
      };
    }
    if (ratio <= 75) {
      return {
        sentiment: 'BULLISH',
        label: 'Institutional Bullish Accumulation',
        description: 'FIIs maintain strong long futures exposure. Buy-on-dips strategy favored near key pivot supports.'
      };
    }
    return {
      sentiment: 'OVERBOUGHT_UNWIND',
      label: 'Extreme Overbought (Long Unwinding Risk)',
      description: 'FII long ratio exceeds 75%. Caution on fresh breakout buys; institutions may initiate tactical profit booking.'
    };
  }

  /**
   * Generates a complete FII / DII Institutional Flow & Sector Rotation report.
   */
  static generateReport(): FiiDiiReport {
    const today = new Date().toISOString().slice(0, 10);

    // Realistic Institutional Cash Flow in ₹ Crores
    const cash: FiiDiiCashFlow = {
      date: today,
      fiiGrossBuy: 11485.4,
      fiiGrossSell: 9825.1,
      fiiNet: 1660.3, // +₹1,660.30 Cr
      diiGrossBuy: 8940.2,
      diiGrossSell: 7610.8,
      diiNet: 1329.4, // +₹1,329.40 Cr
      combinedNet: 2989.7 // +₹2,989.70 Cr
    };

    // FII Index Futures contracts
    const longContracts = 52400;
    const shortContracts = 158200;
    const totalContracts = longContracts + shortContracts;
    const longRatio = Number(((longContracts / totalContracts) * 100).toFixed(1)); // ~24.9%

    const sentimentInfo = this.interpretFiiLongRatio(longRatio);

    const derivatives: FiiDerivativePosition = {
      indexFuturesLongContracts: longContracts,
      indexFuturesShortContracts: shortContracts,
      indexFuturesLongRatio: longRatio,
      sentiment: sentimentInfo.sentiment,
      sentimentLabel: sentimentInfo.label,
      description: sentimentInfo.description,
      historicalTrend: [
        { date: 'Day -4', longRatio: 19.4 },
        { date: 'Day -3', longRatio: 21.2 },
        { date: 'Day -2', longRatio: 22.8 },
        { date: 'Yesterday', longRatio: 23.5 },
        { date: 'Today', longRatio }
      ]
    };

    // Sector Rotation Radar across key NSE sectoral indices
    const sectors: SectorPerformance[] = [
      {
        symbol: 'NIFTY_BANK',
        name: 'NIFTY Bank',
        price: 51280.45,
        change: 432.1,
        changePercent: 0.85,
        momentumRank: 'LEADING',
        advances: 10,
        declines: 2,
        topContender: 'HDFCBANK (+1.4%)',
        inflowStatus: 'HEAVY_INFLOW'
      },
      {
        symbol: 'NIFTY_AUTO',
        name: 'NIFTY Auto',
        price: 24820.1,
        change: 305.4,
        changePercent: 1.24,
        momentumRank: 'LEADING',
        advances: 12,
        declines: 3,
        topContender: 'TATAMOTORS (+2.1%)',
        inflowStatus: 'HEAVY_INFLOW'
      },
      {
        symbol: 'NIFTY_METAL',
        name: 'NIFTY Metal',
        price: 9140.8,
        change: 162.3,
        changePercent: 1.81,
        momentumRank: 'LEADING',
        advances: 11,
        declines: 4,
        topContender: 'TATASTEEL (+2.6%)',
        inflowStatus: 'HEAVY_INFLOW'
      },
      {
        symbol: 'NIFTY_ENERGY',
        name: 'NIFTY Energy',
        price: 41850.6,
        change: 188.2,
        changePercent: 0.45,
        momentumRank: 'IMPROVING',
        advances: 7,
        declines: 3,
        topContender: 'RELIANCE (+0.9%)',
        inflowStatus: 'INFLOW'
      },
      {
        symbol: 'NIFTY_PHARMA',
        name: 'NIFTY Pharma',
        price: 21460.3,
        change: 32.5,
        changePercent: 0.15,
        momentumRank: 'IMPROVING',
        advances: 11,
        declines: 9,
        topContender: 'SUNPHARMA (+0.8%)',
        inflowStatus: 'NEUTRAL'
      },
      {
        symbol: 'NIFTY_IT',
        name: 'NIFTY IT',
        price: 38420.9,
        change: -162.4,
        changePercent: -0.42,
        momentumRank: 'WEAKENING',
        advances: 3,
        declines: 7,
        topContender: 'INFY (-0.6%)',
        inflowStatus: 'OUTFLOW'
      },
      {
        symbol: 'NIFTY_FMCG',
        name: 'NIFTY FMCG',
        price: 58210.0,
        change: -380.5,
        changePercent: -0.65,
        momentumRank: 'LAGGING',
        advances: 4,
        declines: 11,
        topContender: 'ITC (-1.1%)',
        inflowStatus: 'HEAVY_OUTFLOW'
      }
    ];

    const historicalCash: FiiDiiCashFlow[] = [
      {
        date: 'Day -4',
        fiiGrossBuy: 9500,
        fiiGrossSell: 11200,
        fiiNet: -1700,
        diiGrossBuy: 8800,
        diiGrossSell: 6900,
        diiNet: 1900,
        combinedNet: 200
      },
      {
        date: 'Day -3',
        fiiGrossBuy: 10200,
        fiiGrossSell: 11100,
        fiiNet: -900,
        diiGrossBuy: 8500,
        diiGrossSell: 7200,
        diiNet: 1300,
        combinedNet: 400
      },
      {
        date: 'Day -2',
        fiiGrossBuy: 10800,
        fiiGrossSell: 10500,
        fiiNet: 300,
        diiGrossBuy: 8900,
        diiGrossSell: 7800,
        diiNet: 1100,
        combinedNet: 1400
      },
      {
        date: 'Yesterday',
        fiiGrossBuy: 11200,
        fiiGrossSell: 10400,
        fiiNet: 800,
        diiGrossBuy: 9100,
        diiGrossSell: 7900,
        diiNet: 1200,
        combinedNet: 2000
      },
      cash
    ];

    const marketSummary = `Institutions are Net Buyers today with combined cash inflow of +₹${cash.combinedNet.toLocaleString('en-IN')} Cr. FII Index Futures Long ratio is at ${longRatio}%, placing the market in an ${sentimentInfo.label} condition where sudden short squeezes can trigger fast upside expansion.`;

    return {
      cash,
      derivatives,
      sectors,
      historicalCash,
      marketSummary,
      lastUpdated: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
  }
}
