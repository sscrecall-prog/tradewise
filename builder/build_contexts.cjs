const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '..', 'src');

// Ensure subdirectories exist
['context', 'components/common', 'components/charts', 'components/layout', 'components/modals', 'pages'].forEach(d => {
  const p = path.join(srcDir, d);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

// src/context/ThemeContext.tsx
const themeContextCode = `import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tw_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    }
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('tw_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
`;

// src/context/MarketDataContext.tsx
const marketDataContextCode = `import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { MarketQuote, IndexData, TimeFrame, HistoricalPrice } from '../types';
import { MarketDataService } from '../services/MarketDataService';

interface MarketStatus {
  isOpen: boolean;
  status: string;
  nextEvent: string;
  timeUntilNext: string;
}

interface MarketDataContextType {
  quotes: MarketQuote[];
  indices: IndexData[];
  marketStatus: MarketStatus;
  isLoading: boolean;
  getQuote: (symbol: string) => MarketQuote | undefined;
  getHistoricalData: (symbol: string, timeframe: TimeFrame) => Promise<HistoricalPrice[]>;
  searchStocks: (query: string) => Promise<MarketQuote[]>;
  refreshData: () => Promise<void>;
  selectedStockSymbol: string | null;
  setSelectedStockSymbol: (symbol: string | null) => void;
  openStockModal: (symbol: string) => void;
  closeStockModal: () => void;
}

const MarketDataContext = createContext<MarketDataContextType | undefined>(undefined);

export const MarketDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [quotes, setQuotes] = useState<MarketQuote[]>([]);
  const [indices, setIndices] = useState<IndexData[]>([]);
  const [marketStatus, setMarketStatus] = useState<MarketStatus>({
    isOpen: true,
    status: 'MARKET OPEN',
    nextEvent: 'Closes at 03:30 PM IST',
    timeUntilNext: 'Open'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStockSymbol, setSelectedStockSymbol] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [quotesData, indicesData] = await Promise.all([
        MarketDataService.getAllQuotes(),
        MarketDataService.getIndices()
      ]);
      setQuotes(quotesData);
      setIndices(indicesData);
      setMarketStatus(MarketDataService.isMarketOpen());
    } catch (error) {
      console.error('Failed to load market data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Subtle simulated price updates every 3 seconds to emulate live market ticks
    const interval = setInterval(() => {
      setQuotes(prev =>
        prev.map(stock => {
          const delta = (Math.random() - 0.49) * (stock.price * 0.0008);
          const newPrice = Math.max(1, Math.round((stock.price + delta) * 100) / 100);
          const change = Math.round((newPrice - stock.prevClose) * 100) / 100;
          const changePercent = Math.round((change / stock.prevClose) * 10000) / 100;
          const newSparkline = [...stock.sparkline.slice(1), newPrice];

          return {
            ...stock,
            price: newPrice,
            change,
            changePercent,
            high: Math.max(stock.high, newPrice),
            low: Math.min(stock.low, newPrice),
            sparkline: newSparkline,
            lastUpdated: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          };
        })
      );

      setIndices(prev =>
        prev.map(idx => {
          const delta = (Math.random() - 0.49) * (idx.price * 0.0004);
          const newPrice = Math.max(1, Math.round((idx.price + delta) * 100) / 100);
          const change = Math.round((idx.change + delta) * 100) / 100;
          const changePercent = Math.round((change / (idx.price - idx.change)) * 10000) / 100;
          const newSparkline = [...idx.sparkline.slice(1), newPrice];
          return {
            ...idx,
            price: newPrice,
            change,
            changePercent,
            isPositive: change >= 0,
            sparkline: newSparkline
          };
        })
      );

      setMarketStatus(MarketDataService.isMarketOpen());
    }, 3000);

    return () => clearInterval(interval);
  }, [loadData]);

  const getQuote = (symbol: string) => {
    return quotes.find(q => q.symbol.toUpperCase() === symbol.toUpperCase());
  };

  const getHistoricalData = (symbol: string, timeframe: TimeFrame) => {
    return MarketDataService.getHistoricalData(symbol, timeframe);
  };

  const searchStocks = (query: string) => {
    return MarketDataService.searchStocks(query);
  };

  const openStockModal = (symbol: string) => {
    setSelectedStockSymbol(symbol);
  };

  const closeStockModal = () => {
    setSelectedStockSymbol(null);
  };

  return (
    <MarketDataContext.Provider
      value={{
        quotes,
        indices,
        marketStatus,
        isLoading,
        getQuote,
        getHistoricalData,
        searchStocks,
        refreshData: loadData,
        selectedStockSymbol,
        setSelectedStockSymbol,
        openStockModal,
        closeStockModal
      }}
    >
      {children}
    </MarketDataContext.Provider>
  );
};

export const useMarketData = () => {
  const context = useContext(MarketDataContext);
  if (!context) throw new Error('useMarketData must be used within MarketDataProvider');
  return context;
};
`;

// src/context/AppContext.tsx
const appContextCode = `import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  JournalEntry,
  TradePlan,
  PaperOrder,
  PaperPosition,
  PaperPortfolio,
  TradingPreferences,
  UserProfile,
  AppSettings,
  AcademyLesson,
  AnalyticsSummary,
  DisciplineMetrics,
  TradeDirection
} from '../types';
import { StorageService } from '../services/StorageService';
import { DemoDataSeeder } from '../services/DemoDataSeeder';
import { TradingCalculationService } from '../services/TradingCalculationService';
import { useMarketData } from './MarketDataContext';

interface AppContextType {
  watchlist: string[];
  addToWatchlist: (symbol: string) => Promise<void>;
  removeFromWatchlist: (symbol: string) => Promise<void>;
  reorderWatchlist: (newWatchlist: string[]) => Promise<void>;
  isInWatchlist: (symbol: string) => boolean;

  journal: JournalEntry[];
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => Promise<JournalEntry>;
  updateJournalEntry: (entry: JournalEntry) => Promise<void>;
  deleteJournalEntry: (id: string) => Promise<void>;

  tradePlans: TradePlan[];
  saveTradePlan: (plan: Omit<TradePlan, 'id' | 'createdAt'>) => Promise<TradePlan>;
  deleteTradePlan: (id: string) => Promise<void>;

  paperPortfolio: PaperPortfolio;
  paperPositions: PaperPosition[];
  paperOrders: PaperOrder[];
  placePaperOrder: (order: Omit<PaperOrder, 'id' | 'timestamp' | 'status'>) => Promise<void>;
  closePaperPosition: (positionId: string, exitPrice?: number) => Promise<void>;
  resetPaperTrading: () => Promise<void>;

  academyLessons: AcademyLesson[];
  completeAcademyLesson: (lessonId: string, quizScore?: number) => Promise<void>;

  preferences: TradingPreferences;
  updatePreferences: (prefs: Partial<TradingPreferences>) => Promise<void>;

  profile: UserProfile;
  updateProfile: (prof: Partial<UserProfile>) => Promise<void>;

  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;

  analytics: AnalyticsSummary;
  discipline: DisciplineMetrics;

  todayRiskUsed: number;
  todayTradesCount: number;
  todayPnL: number;

  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Global modals
  isNewTradeModalOpen: boolean;
  setIsNewTradeModalOpen: (open: boolean) => void;
  isChecklistModalOpen: boolean;
  setIsChecklistModalOpen: (open: boolean) => void;
  activePlanForChecklist: Partial<TradePlan> | null;
  setActivePlanForChecklist: (plan: Partial<TradePlan> | null) => void;
  isPlaceOrderModalOpen: boolean;
  setIsPlaceOrderModalOpen: (open: boolean) => void;
  selectedStockForOrder: string | null;
  setSelectedStockForOrder: (symbol: string | null) => void;

  resetAllDemoData: () => Promise<void>;
  exportDataJSON: () => Promise<string>;
  importDataJSON: (jsonString: string) => Promise<{ success: boolean; message: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { quotes } = useMarketData();

  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [tradePlans, setTradePlans] = useState<TradePlan[]>([]);
  const [paperPortfolio, setPaperPortfolio] = useState<PaperPortfolio>(DemoDataSeeder.getInitialPaperPortfolio());
  const [paperPositions, setPaperPositions] = useState<PaperPosition[]>([]);
  const [paperOrders, setPaperOrders] = useState<PaperOrder[]>([]);
  const [academyLessons, setAcademyLessons] = useState<AcademyLesson[]>([]);
  const [preferences, setPreferences] = useState<TradingPreferences>(DemoDataSeeder.getInitialPreferences());
  const [profile, setProfile] = useState<UserProfile>(DemoDataSeeder.getInitialProfile());
  const [settings, setSettings] = useState<AppSettings>(DemoDataSeeder.getInitialSettings());

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modals state
  const [isNewTradeModalOpen, setIsNewTradeModalOpen] = useState(false);
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
  const [activePlanForChecklist, setActivePlanForChecklist] = useState<Partial<TradePlan> | null>(null);
  const [isPlaceOrderModalOpen, setIsPlaceOrderModalOpen] = useState(false);
  const [selectedStockForOrder, setSelectedStockForOrder] = useState<string | null>(null);

  // Initialize and seed data on first mount
  const initializeAppState = useCallback(async () => {
    try {
      await DemoDataSeeder.seedInitialData();

      const [
        watchlistItems,
        journalItems,
        planItems,
        portfolioItems,
        positionItems,
        orderItems,
        lessonItems,
        prefItems,
        profileItems,
        settingsItems
      ] = await Promise.all([
        StorageService.getAll<{ id: string; symbol: string }>('watchlist'),
        StorageService.getAll<JournalEntry>('journal'),
        StorageService.getAll<TradePlan>('tradePlans'),
        StorageService.getAll<PaperPortfolio & { id: string }>('paperPortfolio'),
        StorageService.getAll<PaperPosition>('paperPositions'),
        StorageService.getAll<PaperOrder>('paperOrders'),
        StorageService.getAll<AcademyLesson>('academy'),
        StorageService.getAll<TradingPreferences & { id: string }>('preferences'),
        StorageService.getAll<UserProfile & { id: string }>('profile'),
        StorageService.getAll<AppSettings & { id: string }>('settings')
      ]);

      if (watchlistItems.length > 0) setWatchlist(watchlistItems.map(i => i.symbol));
      if (journalItems.length > 0) setJournal(journalItems);
      if (planItems.length > 0) setTradePlans(planItems);
      if (portfolioItems.length > 0) setPaperPortfolio(portfolioItems[0]);
      if (positionItems.length > 0) setPaperPositions(positionItems);
      if (orderItems.length > 0) setPaperOrders(orderItems);
      if (lessonItems.length > 0) setAcademyLessons(lessonItems);
      if (prefItems.length > 0) setPreferences(prefItems[0]);
      if (profileItems.length > 0) setProfile(profileItems[0]);
      if (settingsItems.length > 0) setSettings(settingsItems[0]);
    } catch (e) {
      console.error('Error initializing app state:', e);
    }
  }, []);

  useEffect(() => {
    initializeAppState();
  }, [initializeAppState]);

  // Update paper positions unrealized PnL when quotes change
  useEffect(() => {
    if (paperPositions.length === 0 || quotes.length === 0) return;

    let totalUnrealized = 0;
    const updatedPositions = paperPositions.map(pos => {
      const liveQuote = quotes.find(q => q.symbol.toUpperCase() === pos.stockSymbol.toUpperCase());
      const currentPrice = liveQuote ? liveQuote.price : pos.currentPrice;
      const priceDiff = pos.direction === 'BUY' ? (currentPrice - pos.avgPrice) : (pos.avgPrice - currentPrice);
      const unrealizedPnL = Math.round(priceDiff * pos.quantity * 100) / 100;
      const unrealizedPnLPercent = Math.round((priceDiff / pos.avgPrice) * 10000) / 100;
      totalUnrealized += unrealizedPnL;

      return {
        ...pos,
        currentPrice,
        unrealizedPnL,
        unrealizedPnLPercent
      };
    });

    setPaperPositions(updatedPositions);
    setPaperPortfolio(prev => ({
      ...prev,
      unrealizedPnL: Math.round(totalUnrealized * 100) / 100,
      totalPortfolioValue: Math.round((prev.cashBalance + prev.usedMargin + totalUnrealized) * 100) / 100
    }));
  }, [quotes]);

  // Watchlist methods
  const addToWatchlist = async (symbol: string) => {
    const cleanSym = symbol.toUpperCase().trim();
    if (watchlist.includes(cleanSym)) return;
    const updated = [...watchlist, cleanSym];
    setWatchlist(updated);
    await StorageService.save('watchlist', { id: cleanSym, symbol: cleanSym, addedAt: new Date().toISOString() });
  };

  const removeFromWatchlist = async (symbol: string) => {
    const cleanSym = symbol.toUpperCase().trim();
    const updated = watchlist.filter(s => s !== cleanSym);
    setWatchlist(updated);
    await StorageService.delete('watchlist', cleanSym);
  };

  const reorderWatchlist = async (newWatchlist: string[]) => {
    setWatchlist(newWatchlist);
    const items = newWatchlist.map(sym => ({ id: sym, symbol: sym, addedAt: new Date().toISOString() }));
    await StorageService.saveAll('watchlist', items);
  };

  const isInWatchlist = (symbol: string) => {
    return watchlist.includes(symbol.toUpperCase().trim());
  };

  // Journal methods
  const addJournalEntry = async (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => {
    const id = `trade-${Date.now()}`;
    const fullEntry: JournalEntry = {
      ...entry,
      id,
      createdAt: new Date().toISOString()
    };
    const updated = [fullEntry, ...journal];
    setJournal(updated);
    await StorageService.save('journal', fullEntry);
    return fullEntry;
  };

  const updateJournalEntry = async (entry: JournalEntry) => {
    const updated = journal.map(j => (j.id === entry.id ? entry : j));
    setJournal(updated);
    await StorageService.save('journal', entry);
  };

  const deleteJournalEntry = async (id: string) => {
    const updated = journal.filter(j => j.id !== id);
    setJournal(updated);
    await StorageService.delete('journal', id);
  };

  // Trade Plans methods
  const saveTradePlan = async (plan: Omit<TradePlan, 'id' | 'createdAt'>) => {
    const id = `plan-${Date.now()}`;
    const fullPlan: TradePlan = {
      ...plan,
      id,
      createdAt: new Date().toISOString()
    };
    const updated = [fullPlan, ...tradePlans];
    setTradePlans(updated);
    await StorageService.save('tradePlans', fullPlan);
    return fullPlan;
  };

  const deleteTradePlan = async (id: string) => {
    const updated = tradePlans.filter(p => p.id !== id);
    setTradePlans(updated);
    await StorageService.delete('tradePlans', id);
  };

  // Paper Trading methods
  const placePaperOrder = async (orderData: Omit<PaperOrder, 'id' | 'timestamp' | 'status'>) => {
    const id = `ord-${Date.now()}`;
    const timestamp = new Date().toLocaleString('en-IN');
    const orderCost = orderData.price * orderData.quantity;

    if (orderData.direction === 'BUY' && orderCost > paperPortfolio.cashBalance) {
      alert('Insufficient virtual cash balance for this order.');
      return;
    }

    const order: PaperOrder = {
      ...orderData,
      id,
      timestamp,
      status: 'EXECUTED',
      executedPrice: orderData.price
    };

    const newOrders = [order, ...paperOrders];
    setPaperOrders(newOrders);
    await StorageService.save('paperOrders', order);

    // Create or update open position
    const existingPosIndex = paperPositions.findIndex(
      p => p.stockSymbol === order.stockSymbol && p.direction === order.direction && p.productType === order.productType
    );

    let updatedPositions: PaperPosition[];
    let newCash = paperPortfolio.cashBalance;
    let newUsedMargin = paperPortfolio.usedMargin;

    if (order.direction === 'BUY') {
      newCash -= orderCost;
      newUsedMargin += orderCost;

      if (existingPosIndex >= 0) {
        const existing = paperPositions[existingPosIndex];
        const totalQty = existing.quantity + order.quantity;
        const totalCost = existing.avgPrice * existing.quantity + order.price * order.quantity;
        const newAvg = Math.round((totalCost / totalQty) * 100) / 100;

        updatedPositions = [...paperPositions];
        updatedPositions[existingPosIndex] = {
          ...existing,
          quantity: totalQty,
          avgPrice: newAvg,
          stopLoss: order.stopLoss || existing.stopLoss,
          targetPrice: order.targetPrice || existing.targetPrice
        };
      } else {
        const newPos: PaperPosition = {
          id: `pos-${Date.now()}`,
          stockSymbol: order.stockSymbol,
          stockName: order.stockName,
          direction: order.direction,
          quantity: order.quantity,
          avgPrice: order.price,
          currentPrice: order.price,
          stopLoss: order.stopLoss,
          targetPrice: order.targetPrice,
          unrealizedPnL: 0,
          unrealizedPnLPercent: 0,
          productType: order.productType,
          openedAt: new Date().toISOString()
        };
        updatedPositions = [newPos, ...paperPositions];
      }
    } else {
      // Short or Exit
      if (existingPosIndex >= 0) {
        // Closing buy position
        const existing = paperPositions[existingPosIndex];
        const closeQty = Math.min(existing.quantity, order.quantity);
        const realizedGain = (order.price - existing.avgPrice) * closeQty;

        newCash += existing.avgPrice * closeQty + realizedGain;
        newUsedMargin -= existing.avgPrice * closeQty;

        if (existing.quantity === closeQty) {
          updatedPositions = paperPositions.filter((_, idx) => idx !== existingPosIndex);
        } else {
          updatedPositions = [...paperPositions];
          updatedPositions[existingPosIndex] = {
            ...existing,
            quantity: existing.quantity - closeQty
          };
        }
      } else {
        // New Short position
        newCash -= orderCost;
        newUsedMargin += orderCost;
        const newPos: PaperPosition = {
          id: `pos-${Date.now()}`,
          stockSymbol: order.stockSymbol,
          stockName: order.stockName,
          direction: 'SELL',
          quantity: order.quantity,
          avgPrice: order.price,
          currentPrice: order.price,
          stopLoss: order.stopLoss,
          targetPrice: order.targetPrice,
          unrealizedPnL: 0,
          unrealizedPnLPercent: 0,
          productType: order.productType,
          openedAt: new Date().toISOString()
        };
        updatedPositions = [newPos, ...paperPositions];
      }
    }

    setPaperPositions(updatedPositions);
    await StorageService.saveAll('paperPositions', updatedPositions);

    const newPortfolio: PaperPortfolio = {
      ...paperPortfolio,
      cashBalance: Math.round(newCash * 100) / 100,
      usedMargin: Math.round(newUsedMargin * 100) / 100,
      totalPortfolioValue: Math.round((newCash + newUsedMargin) * 100) / 100
    };
    setPaperPortfolio(newPortfolio);
    await StorageService.save('paperPortfolio', { id: 'portfolio_main', ...newPortfolio });
  };

  const closePaperPosition = async (positionId: string, exitPrice?: number) => {
    const pos = paperPositions.find(p => p.id === positionId);
    if (!pos) return;

    const liveQuote = quotes.find(q => q.symbol.toUpperCase() === pos.stockSymbol.toUpperCase());
    const finalPrice = exitPrice || (liveQuote ? liveQuote.price : pos.currentPrice);

    const priceDiff = pos.direction === 'BUY' ? (finalPrice - pos.avgPrice) : (pos.avgPrice - finalPrice);
    const realizedPnL = Math.round(priceDiff * pos.quantity * 100) / 100;
    const returnCash = pos.avgPrice * pos.quantity + realizedPnL;

    const newCash = paperPortfolio.cashBalance + returnCash;
    const newUsedMargin = Math.max(0, paperPortfolio.usedMargin - (pos.avgPrice * pos.quantity));
    const newRealizedPnL = paperPortfolio.realizedPnL + realizedPnL;

    const updatedPositions = paperPositions.filter(p => p.id !== positionId);
    setPaperPositions(updatedPositions);
    await StorageService.saveAll('paperPositions', updatedPositions);

    const newPortfolio: PaperPortfolio = {
      ...paperPortfolio,
      cashBalance: Math.round(newCash * 100) / 100,
      usedMargin: Math.round(newUsedMargin * 100) / 100,
      realizedPnL: Math.round(newRealizedPnL * 100) / 100,
      totalPortfolioValue: Math.round((newCash + newUsedMargin) * 100) / 100
    };
    setPaperPortfolio(newPortfolio);
    await StorageService.save('paperPortfolio', { id: 'portfolio_main', ...newPortfolio });

    // Also record closing order in paper orders
    const closeOrder: PaperOrder = {
      id: `ord-${Date.now()}`,
      stockSymbol: pos.stockSymbol,
      stockName: pos.stockName,
      direction: pos.direction === 'BUY' ? 'SELL' : 'BUY',
      orderType: 'MARKET',
      productType: pos.productType,
      quantity: pos.quantity,
      price: finalPrice,
      executedPrice: finalPrice,
      status: 'EXECUTED',
      timestamp: new Date().toLocaleString('en-IN')
    };
    const newOrders = [closeOrder, ...paperOrders];
    setPaperOrders(newOrders);
    await StorageService.save('paperOrders', closeOrder);
  };

  const resetPaperTrading = async () => {
    const initial = DemoDataSeeder.getInitialPaperPortfolio();
    setPaperPortfolio(initial);
    setPaperPositions([]);
    setPaperOrders([]);
    await StorageService.save('paperPortfolio', { id: 'portfolio_main', ...initial });
    await StorageService.clearStore('paperPositions');
    await StorageService.clearStore('paperOrders');
  };

  // Academy methods
  const completeAcademyLesson = async (lessonId: string, quizScore: number = 100) => {
    const updated = academyLessons.map(lesson => {
      if (lesson.id === lessonId) {
        return {
          ...lesson,
          isCompleted: true,
          quizScore
        };
      }
      return lesson;
    });
    setAcademyLessons(updated);
    await StorageService.saveAll('academy', updated);
  };

  // Preferences & Profile methods
  const updatePreferences = async (newPrefs: Partial<TradingPreferences>) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    await StorageService.save('preferences', { id: 'user_prefs', ...updated });
  };

  const updateProfile = async (newProf: Partial<UserProfile>) => {
    const updated = { ...profile, ...newProf };
    setProfile(updated);
    await StorageService.save('profile', { id: 'user_profile', ...updated });
  };

  const updateSettings = async (newSet: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSet };
    setSettings(updated);
    await StorageService.save('settings', { id: 'app_settings', ...updated });
  };

  // Analytics & Discipline computed live
  const analytics = TradingCalculationService.generateAnalytics(journal, preferences.defaultCapital);
  const discipline = TradingCalculationService.calculateDisciplineScore(journal);

  // Today's stats calculation
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTrades = journal.filter(t => t.date === todayStr);
  const todayRiskUsed = todayTrades.reduce((acc, t) => {
    const riskPerShare = Math.abs(t.entryPrice - t.stopLoss);
    return acc + (riskPerShare * t.quantity);
  }, 0);
  const todayPnL = todayTrades.reduce((acc, t) => acc + t.netPnL, 0);

  const resetAllDemoData = async () => {
    await DemoDataSeeder.resetToDemoData();
    await initializeAppState();
  };

  const exportDataJSON = async () => {
    return await StorageService.exportAllData();
  };

  const importDataJSON = async (jsonString: string) => {
    const result = await StorageService.importAllData(jsonString);
    if (result.success) {
      await initializeAppState();
    }
    return result;
  };

  return (
    <AppContext.Provider
      value={{
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        reorderWatchlist,
        isInWatchlist,

        journal,
        addJournalEntry,
        updateJournalEntry,
        deleteJournalEntry,

        tradePlans,
        saveTradePlan,
        deleteTradePlan,

        paperPortfolio,
        paperPositions,
        paperOrders,
        placePaperOrder,
        closePaperPosition,
        resetPaperTrading,

        academyLessons,
        completeAcademyLesson,

        preferences,
        updatePreferences,

        profile,
        updateProfile,

        settings,
        updateSettings,

        analytics,
        discipline,

        todayRiskUsed: Math.round(todayRiskUsed * 100) / 100,
        todayTradesCount: todayTrades.length,
        todayPnL: Math.round(todayPnL * 100) / 100,

        activeTab,
        setActiveTab,

        isNewTradeModalOpen,
        setIsNewTradeModalOpen,
        isChecklistModalOpen,
        setIsChecklistModalOpen,
        activePlanForChecklist,
        setActivePlanForChecklist,
        isPlaceOrderModalOpen,
        setIsPlaceOrderModalOpen,
        selectedStockForOrder,
        setSelectedStockForOrder,

        resetAllDemoData,
        exportDataJSON,
        importDataJSON
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
`;

fs.writeFileSync(path.join(srcDir, 'context/ThemeContext.tsx'), themeContextCode);
fs.writeFileSync(path.join(srcDir, 'context/MarketDataContext.tsx'), marketDataContextCode);
fs.writeFileSync(path.join(srcDir, 'context/AppContext.tsx'), appContextCode);
console.log('Contexts created successfully in src/context/');
