const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

// MarketDataService.ts
const marketDataServiceCode = `import { MarketQuote, IndexData, HistoricalPrice, TimeFrame } from '../types';

export interface IMarketDataProvider {
  getIndices(): Promise<IndexData[]>;
  getAllQuotes(): Promise<MarketQuote[]>;
  getQuote(symbol: string): Promise<MarketQuote | null>;
  getHistoricalData(symbol: string, timeframe: TimeFrame): Promise<HistoricalPrice[]>;
  searchStocks(query: string): Promise<MarketQuote[]>;
  isMarketOpen(): { isOpen: boolean; status: string; nextEvent: string; timeUntilNext: string };
}

export class DemoMarketDataProvider implements IMarketDataProvider {
  private static initialStocks: Omit<MarketQuote, 'sparkline' | 'lastUpdated'>[] = [
    {
      symbol: 'RELIANCE',
      name: 'Reliance Industries Ltd.',
      price: 2985.40,
      change: 32.60,
      changePercent: 1.10,
      open: 2960.00,
      high: 2998.50,
      low: 2955.00,
      close: 2985.40,
      prevClose: 2952.80,
      volume: 8452100,
      high52W: 3217.90,
      low52W: 2220.30,
      sector: 'Energy & Oil',
      pe: 28.4,
      marketCap: '₹20.2L Cr'
    },
    {
      symbol: 'HDFCBANK',
      name: 'HDFC Bank Ltd.',
      price: 1642.80,
      change: -11.20,
      changePercent: -0.68,
      open: 1658.00,
      high: 1662.40,
      low: 1638.10,
      close: 1642.80,
      prevClose: 1654.00,
      volume: 14230000,
      high52W: 1794.00,
      low52W: 1363.55,
      sector: 'Banking',
      pe: 19.8,
      marketCap: '₹12.5L Cr'
    },
    {
      symbol: 'TCS',
      name: 'Tata Consultancy Services',
      price: 4320.15,
      change: 54.30,
      changePercent: 1.27,
      open: 4280.00,
      high: 4345.00,
      low: 4272.00,
      close: 4320.15,
      prevClose: 4265.85,
      volume: 2450000,
      high52W: 4592.25,
      low52W: 3313.00,
      sector: 'Information Tech',
      pe: 31.6,
      marketCap: '₹15.6L Cr'
    },
    {
      symbol: 'INFY',
      name: 'Infosys Ltd.',
      price: 1845.60,
      change: 18.90,
      changePercent: 1.03,
      open: 1832.00,
      high: 1856.80,
      low: 1828.10,
      close: 1845.60,
      prevClose: 1826.70,
      volume: 6890000,
      high52W: 1991.45,
      low52W: 1358.35,
      sector: 'Information Tech',
      pe: 27.2,
      marketCap: '₹7.6L Cr'
    },
    {
      symbol: 'ICICIBANK',
      name: 'ICICI Bank Ltd.',
      price: 1210.50,
      change: 8.40,
      changePercent: 0.70,
      open: 1205.00,
      high: 1218.00,
      low: 1201.20,
      close: 1210.50,
      prevClose: 1202.10,
      volume: 11200000,
      high52W: 1312.80,
      low52W: 915.00,
      sector: 'Banking',
      pe: 18.3,
      marketCap: '₹8.5L Cr'
    },
    {
      symbol: 'SBIN',
      name: 'State Bank of India',
      price: 812.25,
      change: -4.10,
      changePercent: -0.50,
      open: 818.00,
      high: 821.50,
      low: 809.00,
      close: 812.25,
      prevClose: 816.35,
      volume: 16800000,
      high52W: 912.00,
      low52W: 555.25,
      sector: 'Banking',
      pe: 10.9,
      marketCap: '₹7.2L Cr'
    },
    {
      symbol: 'TATAMOTORS',
      name: 'Tata Motors Ltd.',
      price: 1024.75,
      change: 22.80,
      changePercent: 2.28,
      open: 1005.00,
      high: 1032.00,
      low: 1002.50,
      close: 1024.75,
      prevClose: 1001.95,
      volume: 9800000,
      high52W: 1179.00,
      low52W: 600.00,
      sector: 'Automobile',
      pe: 15.6,
      marketCap: '₹3.7L Cr'
    },
    {
      symbol: 'BHARTIARTL',
      name: 'Bharti Airtel Ltd.',
      price: 1580.30,
      change: 14.20,
      changePercent: 0.91,
      open: 1570.00,
      high: 1591.00,
      low: 1565.00,
      close: 1580.30,
      prevClose: 1566.10,
      volume: 4500000,
      high52W: 1680.00,
      low52W: 860.00,
      sector: 'Telecom',
      pe: 48.2,
      marketCap: '₹9.1L Cr'
    },
    {
      symbol: 'ITC',
      name: 'ITC Ltd.',
      price: 488.60,
      change: -2.30,
      changePercent: -0.47,
      open: 492.00,
      high: 494.50,
      low: 486.20,
      close: 488.60,
      prevClose: 490.90,
      volume: 12500000,
      high52W: 520.00,
      low52W: 399.30,
      sector: 'FMCG',
      pe: 29.5,
      marketCap: '₹6.1L Cr'
    },
    {
      symbol: 'LT',
      name: 'Larsen & Toubro Ltd.',
      price: 3640.00,
      change: 41.50,
      changePercent: 1.15,
      open: 3610.00,
      high: 3665.00,
      low: 3598.00,
      close: 3640.00,
      prevClose: 3598.50,
      volume: 2100000,
      high52W: 3948.60,
      low52W: 2860.00,
      sector: 'Infrastructure',
      pe: 34.1,
      marketCap: '₹5.0L Cr'
    },
    {
      symbol: 'BAJFINANCE',
      name: 'Bajaj Finance Ltd.',
      price: 7240.00,
      change: -65.00,
      changePercent: -0.89,
      open: 7320.00,
      high: 7350.00,
      low: 7210.00,
      close: 7240.00,
      prevClose: 7305.00,
      volume: 1450000,
      high52W: 8190.00,
      low52W: 6160.00,
      sector: 'Financial Services',
      pe: 29.8,
      marketCap: '₹4.4L Cr'
    },
    {
      symbol: 'SUNPHARMA',
      name: 'Sun Pharmaceutical Industries',
      price: 1790.20,
      change: 24.80,
      changePercent: 1.40,
      open: 1770.00,
      high: 1802.00,
      low: 1765.00,
      close: 1790.20,
      prevClose: 1765.40,
      volume: 3200000,
      high52W: 1960.00,
      low52W: 1100.00,
      sector: 'Healthcare & Pharma',
      pe: 36.4,
      marketCap: '₹4.3L Cr'
    },
    {
      symbol: 'MARUTI',
      name: 'Maruti Suzuki India Ltd.',
      price: 12450.00,
      change: 180.00,
      changePercent: 1.47,
      open: 12300.00,
      high: 12520.00,
      low: 12280.00,
      close: 12450.00,
      prevClose: 12270.00,
      volume: 620000,
      high52W: 13680.00,
      low52W: 9250.00,
      sector: 'Automobile',
      pe: 28.1,
      marketCap: '₹3.9L Cr'
    },
    {
      symbol: 'ASIANPAINT',
      name: 'Asian Paints Ltd.',
      price: 2890.00,
      change: -18.50,
      changePercent: -0.64,
      open: 2915.00,
      high: 2928.00,
      low: 2875.00,
      close: 2890.00,
      prevClose: 2908.50,
      volume: 1100000,
      high52W: 3422.00,
      low52W: 2750.00,
      sector: 'Consumer Goods',
      pe: 51.2,
      marketCap: '₹2.7L Cr'
    },
    {
      symbol: 'TITAN',
      name: 'Titan Company Ltd.',
      price: 3580.00,
      change: 45.00,
      changePercent: 1.27,
      open: 3540.00,
      high: 3598.00,
      low: 3530.00,
      close: 3580.00,
      prevClose: 3535.00,
      volume: 1350000,
      high52W: 3886.00,
      low52W: 2950.00,
      sector: 'Consumer Goods',
      pe: 82.0,
      marketCap: '₹3.2L Cr'
    },
    {
      symbol: 'KOTAKBANK',
      name: 'Kotak Mahindra Bank',
      price: 1785.00,
      change: 6.50,
      changePercent: 0.37,
      open: 1780.00,
      high: 1796.00,
      low: 1772.00,
      close: 1785.00,
      prevClose: 1778.50,
      volume: 3800000,
      high52W: 1940.00,
      low52W: 1545.00,
      sector: 'Banking',
      pe: 21.4,
      marketCap: '₹3.5L Cr'
    },
    {
      symbol: 'AXISBANK',
      name: 'Axis Bank Ltd.',
      price: 1195.00,
      change: -8.00,
      changePercent: -0.67,
      open: 1205.00,
      high: 1212.00,
      low: 1188.00,
      close: 1195.00,
      prevClose: 1203.00,
      volume: 7200000,
      high52W: 1339.00,
      low52W: 935.00,
      sector: 'Banking',
      pe: 14.2,
      marketCap: '₹3.7L Cr'
    },
    {
      symbol: 'WIPRO',
      name: 'Wipro Ltd.',
      price: 535.40,
      change: 4.80,
      changePercent: 0.90,
      open: 531.00,
      high: 539.00,
      low: 529.50,
      close: 535.40,
      prevClose: 530.60,
      volume: 8500000,
      high52W: 580.00,
      low52W: 375.00,
      sector: 'Information Tech',
      pe: 24.5,
      marketCap: '₹2.8L Cr'
    },
    {
      symbol: 'TATASTEEL',
      name: 'Tata Steel Ltd.',
      price: 154.20,
      change: 2.10,
      changePercent: 1.38,
      open: 152.50,
      high: 155.80,
      low: 151.80,
      close: 154.20,
      prevClose: 152.10,
      volume: 34000000,
      high52W: 184.60,
      low52W: 114.25,
      sector: 'Metals & Mining',
      pe: 42.0,
      marketCap: '₹1.9L Cr'
    },
    {
      symbol: 'NTPC',
      name: 'NTPC Ltd.',
      price: 412.00,
      change: 6.20,
      changePercent: 1.53,
      open: 407.00,
      high: 415.50,
      low: 405.00,
      close: 412.00,
      prevClose: 405.80,
      volume: 15000000,
      high52W: 448.00,
      low52W: 220.00,
      sector: 'Energy & Power',
      pe: 18.5,
      marketCap: '₹4.0L Cr'
    }
  ];

  private static generateSparkline(basePrice: number, isPositive: boolean, points: number = 20): number[] {
    const data: number[] = [];
    let current = basePrice * 0.985;
    const trend = isPositive ? 0.0015 : -0.0015;

    for (let i = 0; i < points; i++) {
      const noise = (Math.random() - 0.48) * (basePrice * 0.008);
      current = current * (1 + trend) + noise;
      data.push(Math.round(current * 100) / 100);
    }
    data[data.length - 1] = basePrice;
    return data;
  }

  async getIndices(): Promise<IndexData[]> {
    return [
      {
        symbol: 'NIFTY 50',
        name: 'NIFTY 50',
        price: 24852.15,
        change: 148.60,
        changePercent: 0.60,
        sparkline: DemoMarketDataProvider.generateSparkline(24852.15, true, 20),
        isPositive: true
      },
      {
        symbol: 'BANK NIFTY',
        name: 'NIFTY BANK',
        price: 51284.40,
        change: 215.30,
        changePercent: 0.42,
        sparkline: DemoMarketDataProvider.generateSparkline(51284.40, true, 20),
        isPositive: true
      },
      {
        symbol: 'SENSEX',
        name: 'BSE SENSEX',
        price: 81420.15,
        change: 492.20,
        changePercent: 0.61,
        sparkline: DemoMarketDataProvider.generateSparkline(81420.15, true, 20),
        isPositive: true
      },
      {
        symbol: 'FINNIFTY',
        name: 'NIFTY FINANCIAL SERVICES',
        price: 23410.80,
        change: 88.50,
        changePercent: 0.38,
        sparkline: DemoMarketDataProvider.generateSparkline(23410.80, true, 20),
        isPositive: true
      },
      {
        symbol: 'INDIA VIX',
        name: 'INDIA VOLATILITY INDEX',
        price: 13.25,
        change: -0.45,
        changePercent: -3.28,
        sparkline: DemoMarketDataProvider.generateSparkline(13.25, false, 20),
        isPositive: false
      }
    ];
  }

  async getAllQuotes(): Promise<MarketQuote[]> {
    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return DemoMarketDataProvider.initialStocks.map(stock => ({
      ...stock,
      sparkline: DemoMarketDataProvider.generateSparkline(stock.price, stock.change >= 0, 20),
      lastUpdated: now
    }));
  }

  async getQuote(symbol: string): Promise<MarketQuote | null> {
    const all = await this.getAllQuotes();
    const found = all.find(s => s.symbol.toUpperCase() === symbol.toUpperCase());
    return found || null;
  }

  async searchStocks(query: string): Promise<MarketQuote[]> {
    const all = await this.getAllQuotes();
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter(s => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.sector.toLowerCase().includes(q));
  }

  async getHistoricalData(symbol: string, timeframe: TimeFrame): Promise<HistoricalPrice[]> {
    const quote = await this.getQuote(symbol);
    const basePrice = quote ? quote.price : 1000;
    const data: HistoricalPrice[] = [];

    let count = 40;
    let stepMinutes = 5;
    let volatility = 0.004;

    switch (timeframe) {
      case '1D':
        count = 75; // 5-minute candles for full intraday session (9:15 to 15:30)
        stepMinutes = 5;
        volatility = 0.0025;
        break;
      case '1W':
        count = 50; // 30-min candles
        stepMinutes = 30;
        volatility = 0.005;
        break;
      case '1M':
        count = 60; // 2-hour candles
        stepMinutes = 120;
        volatility = 0.009;
        break;
      case '3M':
        count = 65; // Daily candles
        stepMinutes = 1440;
        volatility = 0.015;
        break;
      case '1Y':
        count = 100; // Multi-day candles
        stepMinutes = 2880;
        volatility = 0.022;
        break;
    }

    const now = Date.now();
    let currentClose = basePrice * (1 - (Math.random() * 0.04 - 0.02));

    for (let i = count - 1; i >= 0; i--) {
      const timestamp = now - i * stepMinutes * 60 * 1000;
      const dateObj = new Date(timestamp);
      const timeStr = timeframe === '1D'
        ? dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        : dateObj.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

      const open = currentClose;
      const change = (Math.random() - 0.48) * (open * volatility);
      const close = Math.max(1, Math.round((open + change) * 100) / 100);
      const high = Math.max(open, close) + Math.random() * (open * volatility * 0.7);
      const low = Math.min(open, close) - Math.random() * (open * volatility * 0.7);
      const volume = Math.floor(Math.random() * 50000 + 10000);

      currentClose = close;

      data.push({
        time: timeStr,
        timestamp,
        open: Math.round(open * 100) / 100,
        high: Math.round(high * 100) / 100,
        low: Math.round(low * 100) / 100,
        close: Math.round(close * 100) / 100,
        volume
      });
    }

    // Ensure last candle close matches current price
    if (data.length > 0 && quote) {
      data[data.length - 1].close = quote.price;
    }

    return data;
  }

  isMarketOpen(): { isOpen: boolean; status: string; nextEvent: string; timeUntilNext: string } {
    // Current IST calculation
    const now = new Date();
    // Indian Standard Time is UTC + 5:30
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const istTime = new Date(utcTime + (3600000 * 5.5));

    const day = istTime.getDay(); // 0 = Sunday, 6 = Saturday
    const hours = istTime.getHours();
    const minutes = istTime.getMinutes();
    const currentTotalMinutes = hours * 60 + minutes;

    const marketOpenMinutes = 9 * 60 + 15; // 09:15 AM
    const marketCloseMinutes = 15 * 60 + 30; // 03:30 PM

    const isWeekday = day >= 1 && day <= 5;
    const isDuringHours = currentTotalMinutes >= marketOpenMinutes && currentTotalMinutes < marketCloseMinutes;

    const isOpen = isWeekday && isDuringHours;

    let status = isOpen ? 'MARKET OPEN' : 'MARKET CLOSED';
    let nextEvent = '';
    let timeUntilNext = '';

    if (isOpen) {
      const remainingMinutes = marketCloseMinutes - currentTotalMinutes;
      const rh = Math.floor(remainingMinutes / 60);
      const rm = remainingMinutes % 60;
      nextEvent = 'Closes at 03:30 PM IST';
      timeUntilNext = \`\${rh}h \${rm}m left\`;
    } else {
      nextEvent = 'Opens at 09:15 AM IST';
      if (!isWeekday) {
        timeUntilNext = 'Opens Monday';
      } else if (currentTotalMinutes < marketOpenMinutes) {
        const remainingMinutes = marketOpenMinutes - currentTotalMinutes;
        const rh = Math.floor(remainingMinutes / 60);
        const rm = remainingMinutes % 60;
        timeUntilNext = \`Opens in \${rh}h \${rm}m\`;
      } else {
        timeUntilNext = 'Opens tomorrow 09:15 AM';
      }
    }

    return {
      isOpen,
      status,
      nextEvent,
      timeUntilNext
    };
  }
}

export const MarketDataService = new DemoMarketDataProvider();
`;

fs.writeFileSync(path.join(srcDir, 'services/MarketDataService.ts'), marketDataServiceCode);
console.log('MarketDataService created successfully');
