import { MarketQuote, IndexData, HistoricalPrice, TimeFrame, ListedCompany } from '../types';
import indianStocksData from '../data/indianStocksMaster.json';

export interface IMarketDataProvider {
  getIndices(): Promise<IndexData[]>;
  getAllQuotes(): Promise<MarketQuote[]>;
  getQuote(symbol: string): Promise<MarketQuote | null>;
  getHistoricalData(symbol: string, timeframe: TimeFrame): Promise<HistoricalPrice[]>;
  searchStocks(query: string): Promise<MarketQuote[]>;
  searchAllIndianStocks(query: string): ListedCompany[];
  isMarketOpen(): { isOpen: boolean; status: string; nextEvent: string; timeUntilNext: string };
  isLiveConnected: boolean;
  lastLiveUpdated: string | null;
}

const ALL_INDIAN_STOCKS: ListedCompany[] = indianStocksData as ListedCompany[];

const SYMBOL_TO_YF: Record<string, string> = {
  // Indices
  NIFTY: '^NSEI',
  BANKNIFTY: '^NSEBANK',
  FINNIFTY: 'NIFTY_FIN_SERVICE.NS',
  SENSEX: '^BSESN',
  // Key custom mappings
  TATAMOTORS: 'TMCV.NS',
  TMCV: 'TMCV.NS',
  TMPV: 'TMPV.NS',
  ETERNAL: 'ETERNAL.NS',
  ZOMATO: 'ETERNAL.NS',
  PAYTM: 'PAYTM.NS',
  NYKAA: 'NYKAA.NS',
  M_M: 'M&M.NS'
};

const POPULAR_NSE_STOCKS: Omit<MarketQuote, 'sparkline' | 'lastUpdated'>[] = [
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd.',
    price: 1313.10,
    change: 12.50,
    changePercent: 0.96,
    open: 1300.00,
    high: 1321.90,
    low: 1293.10,
    close: 1313.10,
    prevClose: 1300.60,
    volume: 8452100,
    high52W: 1608.80,
    low52W: 1110.00,
    sector: 'Energy & Oil',
    pe: 28.4,
    marketCap: '₹18.2L Cr'
  },
  {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Ltd.',
    price: 700.80,
    change: -4.20,
    changePercent: -0.60,
    open: 705.00,
    high: 705.65,
    low: 700.00,
    close: 700.80,
    prevClose: 705.00,
    volume: 14230000,
    high52W: 897.00,
    low52W: 681.00,
    sector: 'Banking',
    pe: 19.8,
    marketCap: '₹12.5L Cr'
  },
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services',
    price: 2348.00,
    change: 28.50,
    changePercent: 1.23,
    open: 2320.00,
    high: 2363.00,
    low: 2303.50,
    close: 2348.00,
    prevClose: 2319.50,
    volume: 2450000,
    high52W: 4592.25,
    low52W: 2280.00,
    sector: 'Information Tech',
    pe: 31.6,
    marketCap: '₹15.6L Cr'
  },
  {
    symbol: 'INFY',
    name: 'Infosys Ltd.',
    price: 1140.00,
    change: 14.20,
    changePercent: 1.26,
    open: 1125.00,
    high: 1147.80,
    low: 1118.60,
    close: 1140.00,
    prevClose: 1125.80,
    volume: 6890000,
    high52W: 1991.45,
    low52W: 1090.00,
    sector: 'Information Tech',
    pe: 27.2,
    marketCap: '₹7.6L Cr'
  },
  {
    symbol: 'ICICIBANK',
    name: 'ICICI Bank Ltd.',
    price: 1426.50,
    change: 8.40,
    changePercent: 0.59,
    open: 1420.00,
    high: 1436.00,
    low: 1420.70,
    close: 1426.50,
    prevClose: 1418.10,
    volume: 11200000,
    high52W: 1480.00,
    low52W: 915.00,
    sector: 'Banking',
    pe: 18.3,
    marketCap: '₹8.5L Cr'
  },
  {
    symbol: 'SBIN',
    name: 'State Bank of India',
    price: 1020.90,
    change: -5.10,
    changePercent: -0.50,
    open: 1026.00,
    high: 1035.30,
    low: 1017.30,
    close: 1020.90,
    prevClose: 1026.00,
    volume: 16800000,
    high52W: 1050.00,
    low52W: 555.25,
    sector: 'Banking',
    pe: 10.9,
    marketCap: '₹7.2L Cr'
  },
  {
    symbol: 'TATAMOTORS',
    name: 'Tata Motors Ltd. (TMCV)',
    price: 447.45,
    change: 8.20,
    changePercent: 1.87,
    open: 440.00,
    high: 452.00,
    low: 438.50,
    close: 447.45,
    prevClose: 439.25,
    volume: 9800000,
    high52W: 590.00,
    low52W: 380.00,
    sector: 'Automobile',
    pe: 15.6,
    marketCap: '₹3.7L Cr'
  },
  {
    symbol: 'TRENT',
    name: 'Trent Limited (Westside / Zudio)',
    price: 2852.30,
    change: 42.10,
    changePercent: 1.50,
    open: 2820.00,
    high: 2873.00,
    low: 2810.00,
    close: 2852.30,
    prevClose: 2810.20,
    volume: 3200000,
    high52W: 3100.00,
    low52W: 1850.00,
    sector: 'Retail & Fashion',
    pe: 125.4,
    marketCap: '₹2.8L Cr'
  },
  {
    symbol: 'SUZLON',
    name: 'Suzlon Energy Limited',
    price: 45.46,
    change: 1.25,
    changePercent: 2.83,
    open: 44.50,
    high: 46.39,
    low: 44.20,
    close: 45.46,
    prevClose: 44.21,
    volume: 54200000,
    high52W: 86.00,
    low52W: 24.50,
    sector: 'Green Energy',
    pe: 45.2,
    marketCap: '₹62,000 Cr'
  },
  {
    symbol: 'HAL',
    name: 'Hindustan Aeronautics Ltd.',
    price: 4780.00,
    change: 73.00,
    changePercent: 1.55,
    open: 4710.00,
    high: 4793.50,
    low: 4707.00,
    close: 4780.00,
    prevClose: 4707.00,
    volume: 2400000,
    high52W: 5675.00,
    low52W: 2150.00,
    sector: 'Defence & Aero',
    pe: 39.8,
    marketCap: '₹3.2L Cr'
  },
  {
    symbol: 'BEL',
    name: 'Bharat Electronics Limited',
    price: 405.75,
    change: 2.85,
    changePercent: 0.71,
    open: 403.00,
    high: 408.00,
    low: 402.90,
    close: 405.75,
    prevClose: 402.90,
    volume: 18500000,
    high52W: 425.00,
    low52W: 175.00,
    sector: 'Defence & Aero',
    pe: 42.1,
    marketCap: '₹2.9L Cr'
  },
  {
    symbol: 'IRFC',
    name: 'Indian Railway Finance Corp',
    price: 82.48,
    change: 1.18,
    changePercent: 1.45,
    open: 81.50,
    high: 82.50,
    low: 81.30,
    close: 82.48,
    prevClose: 81.30,
    volume: 28900000,
    high52W: 104.00,
    low52W: 45.00,
    sector: 'Railways & Infra',
    pe: 18.5,
    marketCap: '₹1.07L Cr'
  },
  {
    symbol: 'JIOFIN',
    name: 'Jio Financial Services Ltd.',
    price: 236.90,
    change: 4.60,
    changePercent: 1.98,
    open: 233.00,
    high: 237.40,
    low: 232.30,
    close: 236.90,
    prevClose: 232.30,
    volume: 22100000,
    high52W: 394.00,
    low52W: 210.00,
    sector: 'Finance & NBFC',
    pe: 95.0,
    marketCap: '₹1.5L Cr'
  },
  {
    symbol: 'DIXON',
    name: 'Dixon Technologies (India)',
    price: 14590.00,
    change: 275.00,
    changePercent: 1.92,
    open: 14350.00,
    high: 14620.00,
    low: 14315.00,
    close: 14590.00,
    prevClose: 14315.00,
    volume: 480000,
    high52W: 16800.00,
    low52W: 6200.00,
    sector: 'Electronics EMS',
    pe: 88.5,
    marketCap: '₹87,000 Cr'
  },
  {
    symbol: 'BHARTIARTL',
    name: 'Bharti Airtel Ltd.',
    price: 1862.80,
    change: 18.20,
    changePercent: 0.99,
    open: 1845.00,
    high: 1875.00,
    low: 1840.00,
    close: 1862.80,
    prevClose: 1844.60,
    volume: 4500000,
    high52W: 1920.00,
    low52W: 1200.00,
    sector: 'Telecom',
    pe: 48.2,
    marketCap: '₹9.1L Cr'
  },
  {
    symbol: 'ITC',
    name: 'ITC Ltd.',
    price: 266.30,
    change: -1.20,
    changePercent: -0.45,
    open: 267.50,
    high: 269.00,
    low: 265.20,
    close: 266.30,
    prevClose: 267.50,
    volume: 12500000,
    high52W: 520.00,
    low52W: 250.00,
    sector: 'FMCG',
    pe: 29.5,
    marketCap: '₹6.1L Cr'
  },
  {
    symbol: 'LT',
    name: 'Larsen & Toubro Ltd.',
    price: 3981.00,
    change: 41.50,
    changePercent: 1.05,
    open: 3940.00,
    high: 4010.00,
    low: 3935.00,
    close: 3981.00,
    prevClose: 3939.50,
    volume: 2100000,
    high52W: 4100.00,
    low52W: 2860.00,
    sector: 'Infrastructure',
    pe: 34.1,
    marketCap: '₹5.5L Cr'
  },
  {
    symbol: 'KOTAKBANK',
    name: 'Kotak Mahindra Bank',
    price: 423.50,
    change: -3.10,
    changePercent: -0.73,
    open: 426.00,
    high: 428.50,
    low: 421.00,
    close: 423.50,
    prevClose: 426.60,
    volume: 5100000,
    high52W: 540.00,
    low52W: 390.00,
    sector: 'Banking',
    pe: 21.4,
    marketCap: '₹3.9L Cr'
  }
];

export class LiveMarketDataProvider implements IMarketDataProvider {
  public isLiveConnected: boolean = false;
  public lastLiveUpdated: string | null = null;

  private cachedIndices: IndexData[] | null = null;
  private cachedQuotes: MarketQuote[] | null = null;
  private dynamicQuotesCache = new Map<string, MarketQuote>();
  private lastFetchTime: number = 0;
  private readonly CACHE_TTL_MS = 8000;

  private getApiUrl(path: string): string {
    return `/api/market${path}`;
  }

  private async fetchChart(yfSymbol: string, range = '1d', interval = '5m'): Promise<any> {
    try {
      const url = `${this.getApiUrl('/v8/finance/chart/')}${encodeURIComponent(yfSymbol)}?range=${range}&interval=${interval}`;
      const res = await fetch(url, {
        headers: { Accept: 'application/json' }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data?.chart?.result?.[0] || null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Search across all 2,540+ official NSE listed companies
   */
  searchAllIndianStocks(query: string): ListedCompany[] {
    if (!query.trim()) {
      return ALL_INDIAN_STOCKS.slice(0, 30);
    }

    const q = query.toUpperCase().trim();
    const matches: { item: ListedCompany; score: number }[] = [];

    for (const stock of ALL_INDIAN_STOCKS) {
      const sym = stock.symbol.toUpperCase();
      const name = stock.name.toUpperCase();
      const alias = (stock.alias || '').toUpperCase();

      if (sym === q) {
        matches.push({ item: stock, score: 100 });
      } else if (sym.startsWith(q)) {
        matches.push({ item: stock, score: 80 });
      } else if (name.startsWith(q)) {
        matches.push({ item: stock, score: 70 });
      } else if (sym.includes(q)) {
        matches.push({ item: stock, score: 60 });
      } else if (name.includes(q)) {
        matches.push({ item: stock, score: 50 });
      } else if (alias.includes(q)) {
        matches.push({ item: stock, score: 45 });
      }

      if (matches.length >= 80) break;
    }

    matches.sort((a, b) => b.score - a.score);
    return matches.slice(0, 40).map(m => m.item);
  }

  /**
   * Fetch live Indian benchmark indices
   */
  async getIndices(): Promise<IndexData[]> {
    const now = Date.now();
    if (this.cachedIndices && now - this.lastFetchTime < this.CACHE_TTL_MS) {
      return this.cachedIndices;
    }

    const configs = [
      { symbol: 'NIFTY', name: 'NIFTY 50', yf: '^NSEI' },
      { symbol: 'BANKNIFTY', name: 'BANK NIFTY', yf: '^NSEBANK' },
      { symbol: 'SENSEX', name: 'BSE SENSEX', yf: '^BSESN' },
      { symbol: 'FINNIFTY', name: 'FINNIFTY', yf: 'NIFTY_FIN_SERVICE.NS' }
    ];

    try {
      const results = await Promise.all(
        configs.map(async item => {
          const chart = await this.fetchChart(item.yf, '1d', '5m');
          if (chart && chart.meta) {
            const meta = chart.meta;
            const price = Math.round((meta.regularMarketPrice || 0) * 100) / 100;
            const prev = Math.round((meta.chartPreviousClose || meta.previousClose || price) * 100) / 100;
            const change = Math.round((price - prev) * 100) / 100;
            const changePercent = prev > 0 ? Math.round((change / prev) * 10000) / 100 : 0;

            const quotesArr: number[] = (chart.indicators?.quote?.[0]?.close || []).filter(
              (v: any) => typeof v === 'number' && !isNaN(v)
            );
            const sparkline = quotesArr.length >= 8 ? quotesArr.slice(-20) : [prev, price];

            return {
              symbol: item.symbol,
              name: item.name,
              price,
              change,
              changePercent,
              sparkline,
              isPositive: change >= 0
            };
          }

          return this.getFallbackIndex(item.symbol, item.name);
        })
      );

      this.isLiveConnected = true;
      this.lastLiveUpdated = new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      this.cachedIndices = results;
      return results;
    } catch (e) {
      return this.getAllFallbackIndices();
    }
  }

  /**
   * Fetch quotes for prominent active stocks
   */
  async getAllQuotes(): Promise<MarketQuote[]> {
    const now = Date.now();
    if (this.cachedQuotes && now - this.lastFetchTime < this.CACHE_TTL_MS) {
      return this.cachedQuotes;
    }

    try {
      const results = await Promise.all(
        POPULAR_NSE_STOCKS.map(async base => {
          const yfSym = SYMBOL_TO_YF[base.symbol] || `${base.symbol}.NS`;
          const chart = await this.fetchChart(yfSym, '1d', '5m');

          if (chart && chart.meta) {
            const meta = chart.meta;
            const price = Math.round((meta.regularMarketPrice || base.price) * 100) / 100;
            const prevClose = Math.round((meta.chartPreviousClose || meta.previousClose || base.prevClose) * 100) / 100;
            const change = Math.round((price - prevClose) * 100) / 100;
            const changePercent = prevClose > 0 ? Math.round((change / prevClose) * 10000) / 100 : 0;

            const open = Math.round((meta.regularMarketOpen || base.open) * 100) / 100;
            const high = Math.round((meta.regularMarketDayHigh || base.high) * 100) / 100;
            const low = Math.round((meta.regularMarketDayLow || base.low) * 100) / 100;
            const volume = meta.regularMarketVolume || base.volume;
            const high52W = meta.fiftyTwoWeekHigh || base.high52W;
            const low52W = meta.fiftyTwoWeekLow || base.low52W;

            const quotesArr: number[] = (chart.indicators?.quote?.[0]?.close || []).filter(
              (v: any) => typeof v === 'number' && !isNaN(v)
            );
            const sparkline = quotesArr.length >= 8 ? quotesArr.slice(-20) : [prevClose, price];

            return {
              ...base,
              price,
              change,
              changePercent,
              open,
              high,
              low,
              close: price,
              prevClose,
              volume,
              high52W,
              low52W,
              sparkline,
              lastUpdated: new Date().toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })
            };
          }

          return {
            ...base,
            sparkline: this.generateSparkline(base.price, base.change >= 0),
            lastUpdated: new Date().toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })
          };
        })
      );

      this.isLiveConnected = true;
      this.lastLiveUpdated = new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      this.cachedQuotes = results;
      this.lastFetchTime = now;
      return results;
    } catch (e) {
      return this.getAllFallbackQuotes();
    }
  }

  /**
   * Get quote for ANY Indian stock from the 2,540+ database
   */
  async getQuote(symbol: string): Promise<MarketQuote | null> {
    const cleanSym = symbol.toUpperCase().trim();

    // Check cached quotes first
    const quotes = await this.getAllQuotes();
    const found = quotes.find(q => q.symbol.toUpperCase() === cleanSym);
    if (found) return found;

    // Check dynamic cache
    if (this.dynamicQuotesCache.has(cleanSym)) {
      return this.dynamicQuotesCache.get(cleanSym)!;
    }

    // Lookup in master list for official company name
    const masterCompany = ALL_INDIAN_STOCKS.find(s => s.symbol.toUpperCase() === cleanSym);
    const companyName = masterCompany ? masterCompany.name : cleanSym;

    const yfSym = SYMBOL_TO_YF[cleanSym] || `${cleanSym}.NS`;
    const chart = await this.fetchChart(yfSym, '1d', '5m');

    if (chart && chart.meta) {
      const meta = chart.meta;
      const price = Math.round((meta.regularMarketPrice || 100) * 100) / 100;
      const prevClose = Math.round((meta.chartPreviousClose || meta.previousClose || price) * 100) / 100;
      const change = Math.round((price - prevClose) * 100) / 100;
      const changePercent = prevClose > 0 ? Math.round((change / prevClose) * 10000) / 100 : 0;

      const quotesArr: number[] = (chart.indicators?.quote?.[0]?.close || []).filter(
        (v: any) => typeof v === 'number' && !isNaN(v)
      );

      const quote: MarketQuote = {
        symbol: cleanSym,
        name: companyName,
        price,
        change,
        changePercent,
        open: meta.regularMarketOpen || price,
        high: meta.regularMarketDayHigh || price,
        low: meta.regularMarketDayLow || price,
        close: price,
        prevClose,
        volume: meta.regularMarketVolume || 500000,
        high52W: meta.fiftyTwoWeekHigh || price * 1.3,
        low52W: meta.fiftyTwoWeekLow || price * 0.7,
        sector: masterCompany ? 'NSE Listed' : 'Equity',
        sparkline: quotesArr.length >= 8 ? quotesArr.slice(-20) : [prevClose, price],
        lastUpdated: new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      };

      this.dynamicQuotesCache.set(cleanSym, quote);
      return quote;
    }

    // Fallback for custom symbol
    if (masterCompany) {
      const fallbackQuote: MarketQuote = {
        symbol: cleanSym,
        name: masterCompany.name,
        price: 150.00,
        change: 0.00,
        changePercent: 0.00,
        open: 150.00,
        high: 155.00,
        low: 148.00,
        close: 150.00,
        prevClose: 150.00,
        volume: 250000,
        high52W: 210.00,
        low52W: 90.00,
        sector: 'NSE Listed',
        sparkline: [150, 151, 150, 152, 150],
        lastUpdated: new Date().toLocaleTimeString('en-IN')
      };
      this.dynamicQuotesCache.set(cleanSym, fallbackQuote);
      return fallbackQuote;
    }

    return null;
  }

  async getHistoricalData(symbol: string, timeframe: TimeFrame): Promise<HistoricalPrice[]> {
    const cleanSym = symbol.toUpperCase().trim();
    const yfSym = SYMBOL_TO_YF[cleanSym] || `${cleanSym}.NS`;

    let range = '1d';
    let interval = '5m';

    if (timeframe === '1D') {
      range = '1d';
      interval = '5m';
    } else if (timeframe === '1W') {
      range = '5d';
      interval = '15m';
    } else if (timeframe === '1M') {
      range = '1mo';
      interval = '1d';
    } else if (timeframe === '3M') {
      range = '3mo';
      interval = '1d';
    } else if (timeframe === '1Y') {
      range = '1y';
      interval = '1wk';
    }

    try {
      const chart = await this.fetchChart(yfSym, range, interval);
      if (chart && chart.timestamp && chart.indicators?.quote?.[0]) {
        const ts: number[] = chart.timestamp;
        const q = chart.indicators.quote[0];
        const prices: HistoricalPrice[] = [];

        let lastClose = chart.meta?.previousClose || 100;

        for (let i = 0; i < ts.length; i++) {
          const timestamp = ts[i] * 1000;
          const open = q.open[i] != null ? Math.round(q.open[i] * 100) / 100 : lastClose;
          const high = q.high[i] != null ? Math.round(q.high[i] * 100) / 100 : Math.max(open, lastClose);
          const low = q.low[i] != null ? Math.round(q.low[i] * 100) / 100 : Math.min(open, lastClose);
          const close = q.close[i] != null ? Math.round(q.close[i] * 100) / 100 : open;
          const volume = q.volume[i] || 0;

          lastClose = close;

          const dateObj = new Date(timestamp);
          const timeStr =
            timeframe === '1D' || timeframe === '1W'
              ? dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
              : dateObj.toISOString().split('T')[0];

          prices.push({
            time: timeStr,
            timestamp,
            open,
            high,
            low,
            close,
            volume
          });
        }

        if (prices.length > 0) return prices;
      }
    } catch (e) {
      console.warn('Historical data fetch failed, using generator:', e);
    }

    return this.generateFallbackHistorical(symbol, timeframe);
  }

  async searchStocks(query: string): Promise<MarketQuote[]> {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    const quotes = await this.getAllQuotes();
    return quotes.filter(
      s => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.sector.toLowerCase().includes(q)
    );
  }

  isMarketOpen(): { isOpen: boolean; status: string; nextEvent: string; timeUntilNext: string } {
    const now = new Date();
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
    const istTime = new Date(utcTime + 3600000 * 5.5);

    const day = istTime.getDay();
    const hours = istTime.getHours();
    const minutes = istTime.getMinutes();
    const currentTotalMinutes = hours * 60 + minutes;

    const marketOpenMinutes = 9 * 60 + 15;
    const marketCloseMinutes = 15 * 60 + 30;

    const isWeekday = day >= 1 && day <= 5;
    const isDuringHours = currentTotalMinutes >= marketOpenMinutes && currentTotalMinutes < marketCloseMinutes;
    const isOpen = isWeekday && isDuringHours;

    let status = isOpen ? 'MARKET OPEN (LIVE)' : 'MARKET CLOSED';
    let nextEvent = '';
    let timeUntilNext = '';

    if (isOpen) {
      const remainingMinutes = marketCloseMinutes - currentTotalMinutes;
      const rh = Math.floor(remainingMinutes / 60);
      const rm = remainingMinutes % 60;
      nextEvent = 'Closes at 03:30 PM IST';
      timeUntilNext = `${rh}h ${rm}m left`;
    } else {
      nextEvent = 'Opens at 09:15 AM IST';
      if (!isWeekday) {
        timeUntilNext = 'Opens Monday';
      } else if (currentTotalMinutes < marketOpenMinutes) {
        const remainingMinutes = marketOpenMinutes - currentTotalMinutes;
        const rh = Math.floor(remainingMinutes / 60);
        const rm = remainingMinutes % 60;
        timeUntilNext = `Opens in ${rh}h ${rm}m`;
      } else {
        timeUntilNext = 'Opens tomorrow 09:15 AM';
      }
    }

    return { isOpen, status, nextEvent, timeUntilNext };
  }

  private getFallbackIndex(symbol: string, name: string): IndexData {
    const prices: Record<string, { price: number; change: number; pct: number }> = {
      NIFTY: { price: 23914.45, change: -165.95, pct: -0.69 },
      BANKNIFTY: { price: 57172.00, change: -852.90, pct: -1.47 },
      SENSEX: { price: 76570.35, change: -386.95, pct: -0.50 },
      FINNIFTY: { price: 25813.05, change: -190.85, pct: -0.73 }
    };
    const p = prices[symbol] || { price: 24000, change: 50, pct: 0.2 };
    return {
      symbol,
      name,
      price: p.price,
      change: p.change,
      changePercent: p.pct,
      isPositive: p.change >= 0,
      sparkline: this.generateSparkline(p.price, p.change >= 0)
    };
  }

  private getAllFallbackIndices(): IndexData[] {
    return [
      this.getFallbackIndex('NIFTY', 'NIFTY 50'),
      this.getFallbackIndex('BANKNIFTY', 'BANK NIFTY'),
      this.getFallbackIndex('SENSEX', 'BSE SENSEX'),
      this.getFallbackIndex('FINNIFTY', 'FINNIFTY')
    ];
  }

  private getAllFallbackQuotes(): MarketQuote[] {
    return POPULAR_NSE_STOCKS.map(base => ({
      ...base,
      sparkline: this.generateSparkline(base.price, base.change >= 0),
      lastUpdated: new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }));
  }

  private generateSparkline(basePrice: number, isUp: boolean): number[] {
    const points: number[] = [];
    let current = basePrice * (isUp ? 0.985 : 1.015);
    for (let i = 0; i < 20; i++) {
      const step = (basePrice - current) / (20 - i);
      const noise = (Math.random() - 0.48) * (basePrice * 0.003);
      current += step + noise;
      points.push(Math.round(current * 100) / 100);
    }
    points[points.length - 1] = basePrice;
    return points;
  }

  private generateFallbackHistorical(symbol: string, timeframe: TimeFrame): HistoricalPrice[] {
    const base = POPULAR_NSE_STOCKS.find(s => s.symbol === symbol)?.price || 1000;
    const count = timeframe === '1D' ? 40 : timeframe === '1W' ? 35 : 30;
    const result: HistoricalPrice[] = [];
    let curr = base * 0.96;

    for (let i = 0; i < count; i++) {
      const open = curr;
      const delta = (Math.random() - 0.48) * (base * 0.012);
      const close = Math.round((open + delta) * 100) / 100;
      const high = Math.round((Math.max(open, close) + Math.random() * (base * 0.005)) * 100) / 100;
      const low = Math.round((Math.min(open, close) - Math.random() * (base * 0.005)) * 100) / 100;
      const volume = Math.floor(Math.random() * 500000 + 100000);

      result.push({
        time: `${9 + Math.floor(i / 6)}:${String((i % 6) * 10).padStart(2, '0')}`,
        timestamp: Date.now() - (count - i) * 10 * 60000,
        open,
        high,
        low,
        close,
        volume
      });
      curr = close;
    }
    return result;
  }
}

export const MarketDataService = new LiveMarketDataProvider();
