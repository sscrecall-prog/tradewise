import { MarketQuote, IndexData, HistoricalPrice, TimeFrame, ListedCompany } from '../types';
import indianStocksData from '../data/indianStocksMaster.json';

export interface IMarketDataProvider {
  getIndices(): Promise<IndexData[]>;
  getAllQuotes(): Promise<MarketQuote[]>;
  getQuote(symbol: string): Promise<MarketQuote | null>;
  getHistoricalData(symbol: string, timeframe: TimeFrame): Promise<HistoricalPrice[]>;
  searchStocks(query: string): Promise<MarketQuote[]>;
  searchAllIndianStocks(query: string): ListedCompany[];
  getAllIndianStocks(): ListedCompany[];
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
  'M&M': 'M&M.NS',
  M_M: 'M&M.NS',
  'BAJAJ-AUTO': 'BAJAJ-AUTO.NS',
  TATAMOTORS: 'TMPV.NS',
  TMCV: 'TMCV.NS',
  TMPV: 'TMPV.NS',
  ETERNAL: 'ETERNAL.NS',
  ZOMATO: 'ETERNAL.NS',
  PAYTM: 'PAYTM.NS',
  NYKAA: 'NYKAA.NS',
  LTIM: 'LTIM.NS'
};

const POPULAR_NSE_STOCKS: Omit<MarketQuote, 'sparkline' | 'lastUpdated'>[] = [
  // --- NIFTY 50 OFFICIAL CONSTITUENTS (ALL 50 EQUITIES) ---
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd.',
    price: 1307.00,
    change: 12.50,
    changePercent: 0.96,
    open: 1304.10,
    high: 1324.20,
    low: 1305.70,
    close: 1307.00,
    prevClose: 1322.00,
    volume: 8452100,
    high52W: 1611.80,
    low52W: 1249.80,
    sector: 'Energy & Oil',
    pe: 28.4,
    marketCap: '₹18.2L Cr'
  },
  {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Ltd.',
    price: 708.35,
    change: 5.45,
    changePercent: 0.77,
    open: 708.35,
    high: 716.50,
    low: 708.35,
    close: 712.10,
    prevClose: 706.65,
    volume: 14230000,
    high52W: 1020.50,
    low52W: 698.50,
    sector: 'Banking',
    pe: 19.8,
    marketCap: '₹12.5L Cr'
  },
  {
    symbol: 'ICICIBANK',
    name: 'ICICI Bank Ltd.',
    price: 1423.20,
    change: -6.80,
    changePercent: -0.48,
    open: 1432.10,
    high: 1438.30,
    low: 1421.40,
    close: 1423.20,
    prevClose: 1430.00,
    volume: 6693889,
    high52W: 1480.00,
    low52W: 1187.60,
    sector: 'Banking',
    pe: 18.3,
    marketCap: '₹8.5L Cr'
  },
  {
    symbol: 'SBIN',
    name: 'State Bank of India',
    price: 1016.10,
    change: -7.30,
    changePercent: -0.71,
    open: 1026.00,
    high: 1029.20,
    low: 1016.10,
    close: 1016.10,
    prevClose: 1023.40,
    volume: 6724566,
    high52W: 1234.70,
    low52W: 803.00,
    sector: 'Banking',
    pe: 10.9,
    marketCap: '₹7.2L Cr'
  },
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services Ltd.',
    price: 2304.00,
    change: -16.10,
    changePercent: -0.69,
    open: 2330.00,
    high: 2363.90,
    low: 2302.40,
    close: 2304.00,
    prevClose: 2320.10,
    volume: 2564322,
    high52W: 3350.00,
    low52W: 1976.80,
    sector: 'IT Software',
    pe: 31.6,
    marketCap: '₹15.6L Cr'
  },
  {
    symbol: 'INFY',
    name: 'Infosys Ltd.',
    price: 1130.00,
    change: -0.30,
    changePercent: -0.03,
    open: 1133.00,
    high: 1146.70,
    low: 1125.40,
    close: 1130.00,
    prevClose: 1130.30,
    volume: 5881388,
    high52W: 1728.00,
    low52W: 982.40,
    sector: 'IT Software',
    pe: 27.2,
    marketCap: '₹7.6L Cr'
  },
  {
    symbol: 'BHARTIARTL',
    name: 'Bharti Airtel Ltd.',
    price: 1840.00,
    change: -29.00,
    changePercent: -1.55,
    open: 1868.10,
    high: 1870.70,
    low: 1840.00,
    close: 1840.00,
    prevClose: 1869.00,
    volume: 3614328,
    high52W: 2174.50,
    low52W: 1740.50,
    sector: 'Telecom',
    pe: 48.2,
    marketCap: '₹9.1L Cr'
  },
  {
    symbol: 'ITC',
    name: 'ITC Ltd.',
    price: 264.10,
    change: 1.10,
    changePercent: 0.42,
    open: 264.00,
    high: 266.25,
    low: 262.65,
    close: 264.10,
    prevClose: 263.00,
    volume: 9519153,
    high52W: 427.00,
    low52W: 255.50,
    sector: 'FMCG',
    pe: 29.5,
    marketCap: '₹6.1L Cr'
  },
  {
    symbol: 'LT',
    name: 'Larsen & Toubro Ltd.',
    price: 3964.10,
    change: -10.90,
    changePercent: -0.27,
    open: 3981.00,
    high: 3994.90,
    low: 3964.10,
    close: 3964.10,
    prevClose: 3975.00,
    volume: 1319056,
    high52W: 4440.00,
    low52W: 3288.10,
    sector: 'Infrastructure',
    pe: 34.1,
    marketCap: '₹5.5L Cr'
  },
  {
    symbol: 'KOTAKBANK',
    name: 'Kotak Mahindra Bank Ltd.',
    price: 424.50,
    change: 3.35,
    changePercent: 0.80,
    open: 421.65,
    high: 425.95,
    low: 421.15,
    close: 424.50,
    prevClose: 421.15,
    volume: 9408316,
    high52W: 453.20,
    low52W: 345.50,
    sector: 'Banking',
    pe: 21.4,
    marketCap: '₹3.9L Cr'
  },
  {
    symbol: 'AXISBANK',
    name: 'Axis Bank Ltd.',
    price: 1273.00,
    change: 6.00,
    changePercent: 0.47,
    open: 1270.30,
    high: 1280.70,
    low: 1262.00,
    close: 1273.00,
    prevClose: 1267.00,
    volume: 3810611,
    high52W: 1418.30,
    low52W: 1045.00,
    sector: 'Banking',
    pe: 14.5,
    marketCap: '₹3.9L Cr'
  },
  {
    symbol: 'BAJFINANCE',
    name: 'Bajaj Finance Ltd.',
    price: 1060.50,
    change: 11.50,
    changePercent: 1.10,
    open: 1050.60,
    high: 1063.60,
    low: 1049.70,
    close: 1060.50,
    prevClose: 1049.00,
    volume: 5952048,
    high52W: 1176.40,
    low52W: 787.90,
    sector: 'Financial Services',
    pe: 29.8,
    marketCap: '₹6.5L Cr'
  },
  {
    symbol: 'BAJAJFINSV',
    name: 'Bajaj Finserv Ltd.',
    price: 1970.00,
    change: -22.10,
    changePercent: -1.11,
    open: 1985.00,
    high: 1994.20,
    low: 1970.00,
    close: 1970.00,
    prevClose: 1992.10,
    volume: 437793,
    high52W: 2195.00,
    low52W: 1597.00,
    sector: 'Financial Services',
    pe: 38.2,
    marketCap: '₹3.1L Cr'
  },
  {
    symbol: 'HINDUNILVR',
    name: 'Hindustan Unilever Ltd.',
    price: 1973.40,
    change: 11.40,
    changePercent: 0.58,
    open: 1967.00,
    high: 1984.20,
    low: 1950.40,
    close: 1973.40,
    prevClose: 1962.00,
    volume: 2247162,
    high52W: 2750.00,
    low52W: 1950.40,
    sector: 'FMCG',
    pe: 51.2,
    marketCap: '₹4.6L Cr'
  },
  {
    symbol: 'MARUTI',
    name: 'Maruti Suzuki India Ltd.',
    price: 12694.00,
    change: -163.00,
    changePercent: -1.27,
    open: 12880.00,
    high: 12880.00,
    low: 12656.00,
    close: 12694.00,
    prevClose: 12857.00,
    volume: 322752,
    high52W: 17370.00,
    low52W: 12201.00,
    sector: 'Automobile',
    pe: 26.5,
    marketCap: '₹3.9L Cr'
  },
  {
    symbol: 'M&M',
    name: 'Mahindra & Mahindra Ltd.',
    price: 3170.00,
    change: 20.00,
    changePercent: 0.63,
    open: 3158.70,
    high: 3185.30,
    low: 3144.20,
    close: 3170.00,
    prevClose: 3150.00,
    volume: 1489449,
    high52W: 3839.90,
    low52W: 2896.00,
    sector: 'Automobile',
    pe: 32.4,
    marketCap: '₹3.9L Cr'
  },
  {
    symbol: 'SUNPHARMA',
    name: 'Sun Pharmaceutical Industries',
    price: 1899.00,
    change: -17.00,
    changePercent: -0.89,
    open: 1912.00,
    high: 1917.30,
    low: 1895.00,
    close: 1899.00,
    prevClose: 1916.00,
    volume: 761333,
    high52W: 2046.90,
    low52W: 1548.00,
    sector: 'Pharma',
    pe: 39.8,
    marketCap: '₹4.5L Cr'
  },
  {
    symbol: 'TITAN',
    name: 'Titan Company Ltd.',
    price: 5020.00,
    change: -7.00,
    changePercent: -0.14,
    open: 5010.00,
    high: 5022.00,
    low: 4980.00,
    close: 5020.00,
    prevClose: 5027.00,
    volume: 310845,
    high52W: 5186.70,
    low52W: 3303.10,
    sector: 'Retail & Consumer',
    pe: 85.2,
    marketCap: '₹4.4L Cr'
  },
  {
    symbol: 'TATAMOTORS',
    name: 'Tata Motors Ltd. (TMPV)',
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
    symbol: 'TATASTEEL',
    name: 'Tata Steel Ltd.',
    price: 188.79,
    change: 4.59,
    changePercent: 2.49,
    open: 184.20,
    high: 189.90,
    low: 182.84,
    close: 188.79,
    prevClose: 184.20,
    volume: 36500951,
    high52W: 224.40,
    low52W: 158.40,
    sector: 'Metals & Mining',
    pe: 42.1,
    marketCap: '₹2.3L Cr'
  },
  {
    symbol: 'NTPC',
    name: 'NTPC Ltd.',
    price: 332.50,
    change: 1.60,
    changePercent: 0.48,
    open: 332.75,
    high: 334.05,
    low: 329.80,
    close: 332.50,
    prevClose: 330.90,
    volume: 7032282,
    high52W: 414.40,
    low52W: 315.55,
    sector: 'Power & Energy',
    pe: 14.8,
    marketCap: '₹3.2L Cr'
  },
  {
    symbol: 'ONGC',
    name: 'Oil & Natural Gas Corp Ltd.',
    price: 234.65,
    change: -0.35,
    changePercent: -0.15,
    open: 235.44,
    high: 235.44,
    low: 233.60,
    close: 234.65,
    prevClose: 236.00,
    volume: 5338085,
    high52W: 307.50,
    low52W: 227.65,
    sector: 'Energy & Oil',
    pe: 7.2,
    marketCap: '₹2.9L Cr'
  },
  {
    symbol: 'POWERGRID',
    name: 'Power Grid Corp of India',
    price: 266.00,
    change: 0.40,
    changePercent: 0.15,
    open: 266.90,
    high: 267.50,
    low: 265.05,
    close: 266.00,
    prevClose: 265.60,
    volume: 7967122,
    high52W: 324.95,
    low52W: 250.00,
    sector: 'Power & Energy',
    pe: 16.4,
    marketCap: '₹2.5L Cr'
  },
  {
    symbol: 'ADANIENT',
    name: 'Adani Enterprises Ltd.',
    price: 2938.00,
    change: 37.00,
    changePercent: 1.28,
    open: 2900.00,
    high: 2965.00,
    low: 2882.80,
    close: 2938.00,
    prevClose: 2901.00,
    volume: 1060844,
    high52W: 3245.00,
    low52W: 1753.00,
    sector: 'Conglomerate',
    pe: 88.5,
    marketCap: '₹3.3L Cr'
  },
  {
    symbol: 'ADANIPORTS',
    name: 'Adani Ports & SEZ Ltd.',
    price: 1707.30,
    change: 0.80,
    changePercent: 0.05,
    open: 1699.90,
    high: 1716.90,
    low: 1692.40,
    close: 1707.30,
    prevClose: 1706.50,
    volume: 1281968,
    high52W: 1891.10,
    low52W: 1292.00,
    sector: 'Infrastructure',
    pe: 34.6,
    marketCap: '₹3.7L Cr'
  },
  {
    symbol: 'COALINDIA',
    name: 'Coal India Ltd.',
    price: 415.35,
    change: 0.55,
    changePercent: 0.13,
    open: 418.00,
    high: 418.00,
    low: 412.55,
    close: 415.35,
    prevClose: 420.05,
    volume: 6126850,
    high52W: 491.25,
    low52W: 369.60,
    sector: 'Energy & Mining',
    pe: 8.5,
    marketCap: '₹2.5L Cr'
  },
  {
    symbol: 'JSWSTEEL',
    name: 'JSW Steel Ltd.',
    price: 1325.00,
    change: 17.00,
    changePercent: 1.30,
    open: 1305.00,
    high: 1331.70,
    low: 1300.10,
    close: 1325.00,
    prevClose: 1308.00,
    volume: 1094356,
    high52W: 1351.00,
    low52W: 1040.00,
    sector: 'Metals & Mining',
    pe: 45.2,
    marketCap: '₹3.2L Cr'
  },
  {
    symbol: 'HCLTECH',
    name: 'HCL Technologies Ltd.',
    price: 1293.40,
    change: -25.60,
    changePercent: -1.94,
    open: 1324.90,
    high: 1331.40,
    low: 1291.20,
    close: 1293.40,
    prevClose: 1319.00,
    volume: 2210569,
    high52W: 1780.10,
    low52W: 1030.00,
    sector: 'IT Software',
    pe: 24.8,
    marketCap: '₹3.5L Cr'
  },
  {
    symbol: 'TECHM',
    name: 'Tech Mahindra Ltd.',
    price: 1596.90,
    change: -1.10,
    changePercent: -0.07,
    open: 1605.10,
    high: 1623.40,
    low: 1586.90,
    close: 1596.90,
    prevClose: 1598.00,
    volume: 1173518,
    high52W: 1854.00,
    low52W: 1304.10,
    sector: 'IT Software',
    pe: 38.5,
    marketCap: '₹1.5L Cr'
  },
  {
    symbol: 'ULTRACEMCO',
    name: 'UltraTech Cement Ltd.',
    price: 11408.00,
    change: 133.00,
    changePercent: 1.18,
    open: 11357.00,
    high: 11434.00,
    low: 11292.00,
    close: 11408.00,
    prevClose: 11275.00,
    volume: 280870,
    high52W: 13110.00,
    low52W: 10325.00,
    sector: 'Cement & Infra',
    pe: 42.1,
    marketCap: '₹3.3L Cr'
  },
  {
    symbol: 'GRASIM',
    name: 'Grasim Industries Ltd.',
    price: 3322.00,
    change: 12.00,
    changePercent: 0.36,
    open: 3318.90,
    high: 3332.60,
    low: 3268.10,
    close: 3322.00,
    prevClose: 3310.00,
    volume: 892704,
    high52W: 3411.10,
    low52W: 2502.50,
    sector: 'Conglomerate',
    pe: 31.2,
    marketCap: '₹2.2L Cr'
  },
  {
    symbol: 'CIPLA',
    name: 'Cipla Ltd.',
    price: 1385.00,
    change: -9.70,
    changePercent: -0.70,
    open: 1397.70,
    high: 1399.10,
    low: 1375.50,
    close: 1385.00,
    prevClose: 1394.70,
    volume: 1326180,
    high52W: 1673.00,
    low52W: 1165.70,
    sector: 'Pharma',
    pe: 26.8,
    marketCap: '₹1.1L Cr'
  },
  {
    symbol: 'DRREDDY',
    name: "Dr. Reddy's Laboratories",
    price: 1151.00,
    change: -4.00,
    changePercent: -0.35,
    open: 1157.00,
    high: 1166.80,
    low: 1151.00,
    close: 1151.00,
    prevClose: 1155.00,
    volume: 568461,
    high52W: 1414.90,
    low52W: 1101.00,
    sector: 'Pharma',
    pe: 18.9,
    marketCap: '₹95,000 Cr'
  },
  {
    symbol: 'WIPRO',
    name: 'Wipro Ltd.',
    price: 176.40,
    change: 0.68,
    changePercent: 0.39,
    open: 176.74,
    high: 178.75,
    low: 176.40,
    close: 176.40,
    prevClose: 175.72,
    volume: 6882678,
    high52W: 273.10,
    low52W: 169.00,
    sector: 'IT Software',
    pe: 19.5,
    marketCap: '₹92,000 Cr'
  },
  {
    symbol: 'EICHERMOT',
    name: 'Eicher Motors Ltd.',
    price: 7630.50,
    change: -59.50,
    changePercent: -0.77,
    open: 7665.00,
    high: 7665.50,
    low: 7590.00,
    close: 7630.50,
    prevClose: 7690.00,
    volume: 492954,
    high52W: 8230.00,
    low52W: 6308.00,
    sector: 'Automobile',
    pe: 36.4,
    marketCap: '₹2.1L Cr'
  },
  {
    symbol: 'BPCL',
    name: 'Bharat Petroleum Corporation',
    price: 315.70,
    change: -4.35,
    changePercent: -1.36,
    open: 319.40,
    high: 320.65,
    low: 315.70,
    close: 315.70,
    prevClose: 320.05,
    volume: 1834819,
    high52W: 391.65,
    low52W: 266.60,
    sector: 'Energy & Oil',
    pe: 12.1,
    marketCap: '₹1.3L Cr'
  },
  {
    symbol: 'TATACONSUM',
    name: 'Tata Consumer Products Ltd.',
    price: 1010.00,
    change: -9.20,
    changePercent: -0.90,
    open: 1020.00,
    high: 1022.90,
    low: 1008.50,
    close: 1010.00,
    prevClose: 1019.20,
    volume: 1030689,
    high52W: 1282.70,
    low52W: 1007.20,
    sector: 'FMCG',
    pe: 72.5,
    marketCap: '₹98,000 Cr'
  },
  {
    symbol: 'NESTLEIND',
    name: 'Nestle India Ltd.',
    price: 1410.50,
    change: -5.50,
    changePercent: -0.39,
    open: 1415.00,
    high: 1420.00,
    low: 1402.50,
    close: 1410.50,
    prevClose: 1416.00,
    volume: 974257,
    high52W: 1553.00,
    low52W: 1145.00,
    sector: 'FMCG',
    pe: 64.2,
    marketCap: '₹1.3L Cr'
  },
  {
    symbol: 'APOLLOHOSP',
    name: 'Apollo Hospitals Enterprise',
    price: 8650.00,
    change: -42.00,
    changePercent: -0.48,
    open: 8702.50,
    high: 8740.00,
    low: 8641.00,
    close: 8650.00,
    prevClose: 8692.00,
    volume: 288351,
    high52W: 9050.00,
    low52W: 6696.50,
    sector: 'Healthcare',
    pe: 88.0,
    marketCap: '₹1.2L Cr'
  },
  {
    symbol: 'DIVISLAB',
    name: "Divi's Laboratories Ltd.",
    price: 9100.00,
    change: -150.00,
    changePercent: -1.62,
    open: 9244.00,
    high: 9269.00,
    low: 9100.00,
    close: 9100.00,
    prevClose: 9250.00,
    volume: 250202,
    high52W: 9467.00,
    low52W: 5636.50,
    sector: 'Pharma',
    pe: 78.4,
    marketCap: '₹2.4L Cr'
  },
  {
    symbol: 'HINDALCO',
    name: 'Hindalco Industries Ltd.',
    price: 1011.00,
    change: 1.00,
    changePercent: 0.10,
    open: 1012.90,
    high: 1020.80,
    low: 1005.00,
    close: 1011.00,
    prevClose: 1010.00,
    volume: 3682428,
    high52W: 1176.00,
    low52W: 723.10,
    sector: 'Metals & Mining',
    pe: 16.8,
    marketCap: '₹2.2L Cr'
  },
  {
    symbol: 'INDUSINDBK',
    name: 'IndusInd Bank Ltd.',
    price: 980.00,
    change: 8.50,
    changePercent: 0.87,
    open: 985.00,
    high: 994.00,
    low: 978.00,
    close: 980.00,
    prevClose: 971.50,
    volume: 3400000,
    high52W: 1580.00,
    low52W: 950.00,
    sector: 'Banking',
    pe: 11.2,
    marketCap: '₹76,000 Cr'
  },
  {
    symbol: 'BRITANNIA',
    name: 'Britannia Industries Ltd.',
    price: 5101.50,
    change: -28.50,
    changePercent: -0.56,
    open: 5155.00,
    high: 5160.50,
    low: 5089.50,
    close: 5101.50,
    prevClose: 5130.00,
    volume: 269673,
    high52W: 6336.00,
    low52W: 5035.00,
    sector: 'FMCG',
    pe: 54.0,
    marketCap: '₹1.2L Cr'
  },
  {
    symbol: 'SHRIRAMFIN',
    name: 'Shriram Finance Ltd.',
    price: 1041.00,
    change: -3.20,
    changePercent: -0.31,
    open: 1044.20,
    high: 1052.80,
    low: 1037.00,
    close: 1041.00,
    prevClose: 1044.20,
    volume: 4135730,
    high52W: 1153.70,
    low52W: 580.00,
    sector: 'Financial Services',
    pe: 16.2,
    marketCap: '₹1.3L Cr'
  },
  {
    symbol: 'BEL',
    name: 'Bharat Electronics Ltd.',
    price: 405.35,
    change: -3.25,
    changePercent: -0.80,
    open: 409.25,
    high: 413.10,
    low: 405.35,
    close: 405.35,
    prevClose: 408.60,
    volume: 8354982,
    high52W: 473.45,
    low52W: 368.50,
    sector: 'Defence & Aero',
    pe: 42.1,
    marketCap: '₹2.9L Cr'
  },
  {
    symbol: 'TRENT',
    name: 'Trent Ltd. (Tata Retail)',
    price: 2853.00,
    change: 37.40,
    changePercent: 1.33,
    open: 2849.00,
    high: 2879.00,
    low: 2833.20,
    close: 2853.00,
    prevClose: 2815.60,
    volume: 577393,
    high52W: 3782.67,
    low52W: 2183.67,
    sector: 'Retail & Consumer',
    pe: 125.4,
    marketCap: '₹2.8L Cr'
  },
  {
    symbol: 'SBILIFE',
    name: 'SBI Life Insurance Co Ltd.',
    price: 1775.00,
    change: 60.00,
    changePercent: 3.50,
    open: 1715.00,
    high: 1775.00,
    low: 1707.40,
    close: 1775.00,
    prevClose: 1715.00,
    volume: 1720166,
    high52W: 2132.00,
    low52W: 1700.40,
    sector: 'Financial Services',
    pe: 82.1,
    marketCap: '₹1.7L Cr'
  },
  {
    symbol: 'HDFCLIFE',
    name: 'HDFC Life Insurance Co Ltd.',
    price: 546.40,
    change: 12.90,
    changePercent: 2.42,
    open: 533.70,
    high: 548.00,
    low: 533.30,
    close: 546.40,
    prevClose: 533.50,
    volume: 6016219,
    high52W: 803.00,
    low52W: 530.50,
    sector: 'Financial Services',
    pe: 75.0,
    marketCap: '₹1.1L Cr'
  },
  {
    symbol: 'BAJAJ-AUTO',
    name: 'Bajaj Auto Ltd.',
    price: 11919.00,
    change: -1.00,
    changePercent: -0.01,
    open: 12005.00,
    high: 12025.00,
    low: 11873.00,
    close: 11919.00,
    prevClose: 11920.00,
    volume: 154199,
    high52W: 12470.00,
    low52W: 8491.50,
    sector: 'Automobile',
    pe: 38.0,
    marketCap: '₹3.3L Cr'
  },
  {
    symbol: 'ASIANPAINT',
    name: 'Asian Paints Ltd.',
    price: 2527.30,
    change: -14.30,
    changePercent: -0.56,
    open: 2540.00,
    high: 2553.90,
    low: 2519.80,
    close: 2527.30,
    prevClose: 2541.60,
    volume: 399368,
    high52W: 2985.70,
    low52W: 2115.00,
    sector: 'Paints & Consumer',
    pe: 58.2,
    marketCap: '₹2.4L Cr'
  },

  // --- POPULAR HIGH-VOLUME MOMENTUM STOCKS ---
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
    symbol: 'ETERNAL',
    name: 'Eternal (Zomato Ltd.)',
    price: 322.75,
    change: -2.05,
    changePercent: -0.63,
    open: 325.30,
    high: 327.75,
    low: 320.80,
    close: 322.75,
    prevClose: 324.80,
    volume: 17824027,
    high52W: 368.45,
    low52W: 212.60,
    sector: 'Consumer Internet',
    pe: 120.0,
    marketCap: '₹2.8L Cr'
  },
  {
    symbol: 'PFC',
    name: 'Power Finance Corporation',
    price: 355.60,
    change: 10.10,
    changePercent: 2.92,
    open: 344.90,
    high: 357.70,
    low: 344.00,
    close: 355.60,
    prevClose: 345.50,
    volume: 19206290,
    high52W: 486.50,
    low52W: 329.90,
    sector: 'Financial Services',
    pe: 7.8,
    marketCap: '₹1.17L Cr'
  },
  {
    symbol: 'INDIGO',
    name: 'InterGlobe Aviation Ltd.',
    price: 4977.00,
    change: -3.00,
    changePercent: -0.06,
    open: 4980.00,
    high: 5035.00,
    low: 4977.00,
    close: 4977.00,
    prevClose: 4980.00,
    volume: 394117,
    high52W: 5970.00,
    low52W: 3895.20,
    sector: 'Aviation',
    pe: 24.5,
    marketCap: '₹1.9L Cr'
  },
  {
    symbol: 'MAXHEALTH',
    name: 'Max Healthcare Institute',
    price: 984.80,
    change: -10.10,
    changePercent: -1.02,
    open: 994.90,
    high: 1001.30,
    low: 981.10,
    close: 984.80,
    prevClose: 994.90,
    volume: 1167047,
    high52W: 1221.90,
    low52W: 903.00,
    sector: 'Healthcare',
    pe: 85.0,
    marketCap: '₹95,000 Cr'
  },
  {
    symbol: 'TMPV',
    name: 'Tata Motors PV Ltd.',
    price: 311.50,
    change: -0.50,
    changePercent: -0.16,
    open: 312.00,
    high: 315.50,
    low: 310.65,
    close: 311.50,
    prevClose: 312.00,
    volume: 4010174,
    high52W: 739.70,
    low52W: 294.30,
    sector: 'Automobile',
    pe: 14.2,
    marketCap: '₹1.2L Cr'
  },
  {
    symbol: 'TMCV',
    name: 'Tata Motors Commercial Vehicles',
    price: 457.50,
    change: -2.85,
    changePercent: -0.62,
    open: 462.85,
    high: 469.20,
    low: 456.20,
    close: 457.50,
    prevClose: 460.35,
    volume: 6245264,
    high52W: 509.00,
    low52W: 306.30,
    sector: 'Automobile',
    pe: 16.5,
    marketCap: '₹1.6L Cr'
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
   * Return all 2,540+ indexed Indian listed companies
   */
  getAllIndianStocks(): ListedCompany[] {
    return ALL_INDIAN_STOCKS;
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
      const BATCH_SIZE = 10;
      const results: MarketQuote[] = [];

      for (let i = 0; i < POPULAR_NSE_STOCKS.length; i += BATCH_SIZE) {
        const batch = POPULAR_NSE_STOCKS.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.all(
          batch.map(async base => {
            try {
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
            } catch (err) {
              // Graceful fallback to baseline
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
        results.push(...batchResults);
      }

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
