import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  JournalEntry,
  TradePlan,
  TradeDirection,
  PaperOrder,
  PaperPosition,
  PaperPortfolio,
  TradingPreferences,
  UserProfile,
  AppSettings,
  AcademyLesson,
  AnalyticsSummary,
  DisciplineMetrics,
  TiltLockState
} from "../types";
import { StorageService } from "../services/StorageService";
import { DemoDataSeeder } from "../services/DemoDataSeeder";
import { TradingCalculationService } from "../services/TradingCalculationService";
import { useMarketData } from "./MarketDataContext";

interface AppContextType {
  watchlist: string[];
  addToWatchlist: (symbol: string) => Promise<void>;
  removeFromWatchlist: (symbol: string) => Promise<void>;
  reorderWatchlist: (newWatchlist: string[]) => Promise<void>;
  isInWatchlist: (symbol: string) => boolean;

  tiltLockState: TiltLockState;
  isTiltLocked: boolean;
  activateTiltLock: (reason?: 'MAX_DAILY_LOSS' | 'CONSECUTIVE_LOSSES' | 'MANUAL_COOLDOWN' | 'DRAWDOWN_CIRCUIT', durationMinutes?: number, description?: string) => void;
  deactivateTiltLock: () => void;
  isTiltLockModalOpen: boolean;
  setIsTiltLockModalOpen: (open: boolean) => void;

  journal: JournalEntry[];
  addJournalEntry: (entry: Omit<JournalEntry, "id" | "createdAt">) => Promise<JournalEntry>;
  updateJournalEntry: (entry: JournalEntry) => Promise<void>;
  deleteJournalEntry: (id: string) => Promise<void>;

  tradePlans: TradePlan[];
  saveTradePlan: (plan: Omit<TradePlan, "id" | "createdAt">) => Promise<TradePlan>;
  deleteTradePlan: (id: string) => Promise<void>;

  paperPortfolio: PaperPortfolio;
  paperPositions: PaperPosition[];
  paperOrders: PaperOrder[];
  placePaperOrder: (order: Omit<PaperOrder, "id" | "timestamp" | "status">) => Promise<void>;
  closePaperPosition: (positionId: string, exitPrice?: number) => Promise<void>;
  resetPaperTrading: () => Promise<void>;
  addVirtualFunds: (amount: number) => Promise<void>;
  squareOffAllPositions: () => Promise<void>;
  cancelPaperOrder: (orderId: string) => Promise<void>;
  modifyPaperPositionSLTarget: (positionId: string, stopLoss?: number, targetPrice?: number) => Promise<void>;
  selectedContractNoteOrder: PaperOrder | null;
  setSelectedContractNoteOrder: (order: PaperOrder | null) => void;
  isContractNoteModalOpen: boolean;
  setIsContractNoteModalOpen: (open: boolean) => void;

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

  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleMobileSidebar: () => void;

  resetAllDemoData: () => Promise<void>;
  startFreshBlankCanvas: (options?: { startingCapital?: number; traderName?: string }) => Promise<void>;
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

  const [activeTab, setActiveTab] = useState<string>("dashboard");

  const [isNewTradeModalOpen, setIsNewTradeModalOpen] = useState(false);
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
  const [activePlanForChecklist, setActivePlanForChecklist] = useState<Partial<TradePlan> | null>(null);
  const [isPlaceOrderModalOpen, setIsPlaceOrderModalOpen] = useState(false);
  const [selectedStockForOrder, setSelectedStockForOrder] = useState<string | null>(null);
  const [selectedContractNoteOrder, setSelectedContractNoteOrder] = useState<PaperOrder | null>(null);
  const [isContractNoteModalOpen, setIsContractNoteModalOpen] = useState(false);

  // Pro Trader Suite: Prop-Desk Tilt Lock State
  const [tiltLockState, setTiltLockState] = useState<TiltLockState>(() => {
    try {
      const saved = localStorage.getItem("tradewise_tilt_lock");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.isActive && parsed.lockedUntil) {
          const rem = Math.max(0, Math.floor((new Date(parsed.lockedUntil).getTime() - Date.now()) / 1000));
          if (rem > 0) {
            return { ...parsed, remainingSeconds: rem };
          }
        }
      }
    } catch {}
    return {
      isActive: false,
      reason: 'MANUAL_COOLDOWN',
      reasonDescription: 'Trading active and discipline normal.',
      lockedAt: '',
      lockedUntil: '',
      remainingSeconds: 0,
      emergencyOverridesCount: 0
    };
  });

  const [isTiltLockModalOpen, setIsTiltLockModalOpen] = useState(false);
  const isTiltLocked = Boolean(tiltLockState.isActive && tiltLockState.remainingSeconds > 0);

  const activateTiltLock = useCallback((
    reason: 'MAX_DAILY_LOSS' | 'CONSECUTIVE_LOSSES' | 'MANUAL_COOLDOWN' | 'DRAWDOWN_CIRCUIT' = 'MANUAL_COOLDOWN',
    durationMinutes: number = 30,
    description?: string
  ) => {
    const now = new Date();
    const until = new Date(now.getTime() + durationMinutes * 60 * 1000);
    const desc = description || (
      reason === 'MAX_DAILY_LOSS' ? 'Daily maximum loss limit reached. Trading paused to protect capital.' :
      reason === 'CONSECUTIVE_LOSSES' ? '3 consecutive losses detected. Mandatory cooldown active.' :
      reason === 'DRAWDOWN_CIRCUIT' ? 'Severe equity drawdown reached. Terminal lock engaged.' :
      'Manual discipline cooldown activated. Take a breather.'
    );
    const newState: TiltLockState = {
      isActive: true,
      reason,
      reasonDescription: desc,
      lockedAt: now.toISOString(),
      lockedUntil: until.toISOString(),
      remainingSeconds: durationMinutes * 60,
      emergencyOverridesCount: tiltLockState.emergencyOverridesCount || 0
    };
    setTiltLockState(newState);
    try {
      localStorage.setItem("tradewise_tilt_lock", JSON.stringify(newState));
    } catch {}
    setIsTiltLockModalOpen(true);
  }, [tiltLockState.emergencyOverridesCount]);

  const deactivateTiltLock = useCallback(() => {
    setTiltLockState(prev => {
      const updated: TiltLockState = {
        ...prev,
        isActive: false,
        remainingSeconds: 0,
        emergencyOverridesCount: (prev.emergencyOverridesCount || 0) + 1
      };
      try {
        localStorage.setItem("tradewise_tilt_lock", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setIsTiltLockModalOpen(false);
  }, []);

  // Countdown timer for active tilt lock
  useEffect(() => {
    if (!tiltLockState.isActive) return;
    const interval = setInterval(() => {
      const rem = Math.max(0, Math.floor((new Date(tiltLockState.lockedUntil).getTime() - Date.now()) / 1000));
      if (rem <= 0) {
        setTiltLockState(prev => {
          const updated = { ...prev, isActive: false, remainingSeconds: 0 };
          try {
            localStorage.setItem("tradewise_tilt_lock", JSON.stringify(updated));
          } catch {}
          return updated;
        });
        clearInterval(interval);
      } else {
        setTiltLockState(prev => ({ ...prev, remainingSeconds: rem }));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [tiltLockState.isActive, tiltLockState.lockedUntil]);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("tradewise_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem("tradewise_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  }, []);

  const toggleMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen(prev => !prev);
  }, []);

  // Professional global keyboard shortcut: Ctrl+B or Cmd+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

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
        StorageService.getAll<{ id: string; symbol: string }>("watchlist"),
        StorageService.getAll<JournalEntry>("journal"),
        StorageService.getAll<TradePlan>("tradePlans"),
        StorageService.getAll<PaperPortfolio & { id: string }>("paperPortfolio"),
        StorageService.getAll<PaperPosition>("paperPositions"),
        StorageService.getAll<PaperOrder>("paperOrders"),
        StorageService.getAll<AcademyLesson>("academy"),
        StorageService.getAll<TradingPreferences & { id: string }>("preferences"),
        StorageService.getAll<UserProfile & { id: string }>("profile"),
        StorageService.getAll<AppSettings & { id: string }>("settings")
      ]);

      if (watchlistItems.length > 0) {
        setWatchlist(watchlistItems.map(i => i.symbol));
      } else {
        setWatchlist(DemoDataSeeder.getInitialWatchlist());
      }
      setJournal(journalItems);
      setTradePlans(planItems);
      if (portfolioItems.length > 0) setPaperPortfolio(portfolioItems[0]);
      setPaperPositions(positionItems);
      setPaperOrders(orderItems);
      if (lessonItems.length > 0) setAcademyLessons(lessonItems);
      if (prefItems.length > 0) setPreferences(prefItems[0]);
      if (profileItems.length > 0) setProfile(profileItems[0]);
      if (settingsItems.length > 0) setSettings(settingsItems[0]);
    } catch (e) {
      console.error("Error initializing app state:", e);
    }
  }, []);

  useEffect(() => {
    initializeAppState();
  }, [initializeAppState]);

  // Live quote sync for paper trading positions
  useEffect(() => {
    if (paperPositions.length === 0 || quotes.length === 0) return;

    let totalUnrealized = 0;
    const updatedPositions = paperPositions.map(pos => {
      const liveQuote = quotes.find(q => q.symbol.toUpperCase() === pos.stockSymbol.toUpperCase());
      const currentPrice = liveQuote ? liveQuote.price : pos.currentPrice;
      const priceDiff = pos.direction === "BUY" ? (currentPrice - pos.avgPrice) : (pos.avgPrice - currentPrice);
      const unrealizedPnL = Math.round(priceDiff * pos.quantity * 100) / 100;
      const unrealizedPnLPercent = Math.round((priceDiff / pos.avgPrice) * 10000) / 100;
      const netPnL = Math.round((unrealizedPnL - (pos.buyCharges || 0)) * 100) / 100;
      totalUnrealized += unrealizedPnL;

      return {
        ...pos,
        currentPrice,
        unrealizedPnL,
        unrealizedPnLPercent,
        netPnL
      };
    });

    setPaperPositions(updatedPositions);
    setPaperPortfolio(prev => ({
      ...prev,
      unrealizedPnL: Math.round(totalUnrealized * 100) / 100,
      totalPortfolioValue: Math.round((prev.cashBalance + prev.usedMargin + totalUnrealized) * 100) / 100
    }));
  }, [quotes]);

  const addToWatchlist = async (symbol: string) => {
    const cleanSym = symbol.toUpperCase().trim();
    if (watchlist.includes(cleanSym)) return;
    const updated = [...watchlist, cleanSym];
    setWatchlist(updated);
    await StorageService.save("watchlist", { id: cleanSym, symbol: cleanSym, addedAt: new Date().toISOString() });
  };

  const removeFromWatchlist = async (symbol: string) => {
    const cleanSym = symbol.toUpperCase().trim();
    const updated = watchlist.filter(s => s !== cleanSym);
    setWatchlist(updated);
    await StorageService.delete("watchlist", cleanSym);
  };

  const reorderWatchlist = async (newWatchlist: string[]) => {
    setWatchlist(newWatchlist);
    const items = newWatchlist.map(sym => ({ id: sym, symbol: sym, addedAt: new Date().toISOString() }));
    await StorageService.saveAll("watchlist", items);
  };

  const isInWatchlist = (symbol: string) => {
    return watchlist.includes(symbol.toUpperCase().trim());
  };

  const addJournalEntry = async (entry: Omit<JournalEntry, "id" | "createdAt">) => {
    const id = "trade-" + Date.now();
    const fullEntry: JournalEntry = {
      ...entry,
      id,
      createdAt: new Date().toISOString()
    };
    const updated = [fullEntry, ...journal];
    setJournal(updated);
    await StorageService.save("journal", fullEntry);
    return fullEntry;
  };

  const updateJournalEntry = async (entry: JournalEntry) => {
    const updated = journal.map(j => (j.id === entry.id ? entry : j));
    setJournal(updated);
    await StorageService.save("journal", entry);
  };

  const deleteJournalEntry = async (id: string) => {
    const updated = journal.filter(j => j.id !== id);
    setJournal(updated);
    await StorageService.delete("journal", id);
  };

  const saveTradePlan = async (plan: Omit<TradePlan, "id" | "createdAt">) => {
    const id = "plan-" + Date.now();
    const fullPlan: TradePlan = {
      ...plan,
      id,
      createdAt: new Date().toISOString()
    };
    const updated = [fullPlan, ...tradePlans];
    setTradePlans(updated);
    await StorageService.save("tradePlans", fullPlan);
    return fullPlan;
  };

  const deleteTradePlan = async (id: string) => {
    const updated = tradePlans.filter(p => p.id !== id);
    setTradePlans(updated);
    await StorageService.delete("tradePlans", id);
  };

  const placePaperOrder = async (orderData: Omit<PaperOrder, "id" | "timestamp" | "status">) => {
    if (isTiltLocked) {
      setIsTiltLockModalOpen(true);
      return;
    }

    const id = "ord-" + Date.now();
    const timestamp = new Date().toLocaleString("en-IN");
    const isIntraday = orderData.productType === "INTRADAY (MIS)";
    const leverage = isIntraday ? 5 : 1;
    const turnover = Math.round(orderData.price * orderData.quantity * 100) / 100;
    const requiredMargin = Math.round((turnover / leverage) * 100) / 100;

    // Calculate realistic Indian broker charges (Zerodha / Angel One style)
    const charges = TradingCalculationService.calculateOrderCharges(
      orderData.price,
      orderData.quantity,
      orderData.direction,
      isIntraday
    );

    const totalDeduction = requiredMargin + charges.totalCharges;

    if (totalDeduction > paperPortfolio.cashBalance) {
      alert(`Insufficient available margin. Required: ₹${totalDeduction.toLocaleString("en-IN")} (Margin: ₹${requiredMargin.toLocaleString("en-IN")} + Charges: ₹${charges.totalCharges.toFixed(2)}), Available Cash: ₹${paperPortfolio.cashBalance.toLocaleString("en-IN")}`);
      return;
    }

    const contractNoteId = "CN-" + Math.floor(100000 + Math.random() * 900000);

    const order: PaperOrder = {
      ...orderData,
      id,
      timestamp,
      status: "EXECUTED",
      executedPrice: orderData.price,
      marginRequired: requiredMargin,
      turnover,
      charges,
      contractNoteId
    };

    const newOrders = [order, ...paperOrders];
    setPaperOrders(newOrders);
    await StorageService.save("paperOrders", order);

    // Existing position lookup
    const existingPosIndex = paperPositions.findIndex(
      p => p.stockSymbol === order.stockSymbol && p.direction === order.direction && p.productType === order.productType
    );

    let updatedPositions: PaperPosition[];
    const newCash = Math.round((paperPortfolio.cashBalance - totalDeduction) * 100) / 100;
    const newUsedMargin = Math.round((paperPortfolio.usedMargin + requiredMargin) * 100) / 100;
    const newTotalCharges = Math.round(((paperPortfolio.totalChargesPaid || 0) + charges.totalCharges) * 100) / 100;
    const newTradesCount = (paperPortfolio.totalTradesCount || 0) + 1;

    if (existingPosIndex >= 0) {
      const existing = paperPositions[existingPosIndex];
      const totalQty = existing.quantity + order.quantity;
      const totalCost = existing.avgPrice * existing.quantity + order.price * order.quantity;
      const newAvg = Math.round((totalCost / totalQty) * 100) / 100;
      const combinedMargin = Math.round((existing.marginAllocated + requiredMargin) * 100) / 100;
      const combinedBuyCharges = Math.round((existing.buyCharges + charges.totalCharges) * 100) / 100;

      updatedPositions = [...paperPositions];
      updatedPositions[existingPosIndex] = {
        ...existing,
        quantity: totalQty,
        avgPrice: newAvg,
        marginAllocated: combinedMargin,
        buyCharges: combinedBuyCharges,
        stopLoss: order.stopLoss || existing.stopLoss,
        targetPrice: order.targetPrice || existing.targetPrice
      };
    } else {
      const newPos: PaperPosition = {
        id: "pos-" + Date.now(),
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
        openedAt: new Date().toISOString(),
        marginAllocated: requiredMargin,
        leverage,
        buyCharges: charges.totalCharges,
        netPnL: -charges.totalCharges
      };
      updatedPositions = [newPos, ...paperPositions];
    }

    setPaperPositions(updatedPositions);
    await StorageService.saveAll("paperPositions", updatedPositions);

    const newPortfolio: PaperPortfolio = {
      ...paperPortfolio,
      cashBalance: newCash,
      usedMargin: newUsedMargin,
      totalChargesPaid: newTotalCharges,
      totalTradesCount: newTradesCount,
      totalPortfolioValue: Math.round((newCash + newUsedMargin) * 100) / 100
    };
    setPaperPortfolio(newPortfolio);
    await StorageService.save("paperPortfolio", { id: "portfolio_main", ...newPortfolio });
  };

  const closePaperPosition = async (positionId: string, exitPrice?: number) => {
    const pos = paperPositions.find(p => p.id === positionId);
    if (!pos) return;

    const liveQuote = quotes.find(q => q.symbol.toUpperCase() === pos.stockSymbol.toUpperCase());
    const finalPrice = exitPrice || (liveQuote ? liveQuote.price : pos.currentPrice);
    const isIntraday = pos.productType === "INTRADAY (MIS)";
    const exitDirection: TradeDirection = pos.direction === "BUY" ? "SELL" : "BUY";

    // Calculate exit regulatory & brokerage charges
    const sellCharges = TradingCalculationService.calculateOrderCharges(
      finalPrice,
      pos.quantity,
      exitDirection,
      isIntraday
    );

    const priceDiff = pos.direction === "BUY" ? (finalPrice - pos.avgPrice) : (pos.avgPrice - finalPrice);
    const grossPnL = Math.round(priceDiff * pos.quantity * 100) / 100;
    const totalTradeCharges = Math.round((pos.buyCharges + sellCharges.totalCharges) * 100) / 100;
    const netPnL = Math.round((grossPnL - totalTradeCharges) * 100) / 100;

    // Return the margin allocated + gross profit/loss minus exit taxes
    const returnCash = Math.round((pos.marginAllocated + grossPnL - sellCharges.totalCharges) * 100) / 100;
    const newCash = Math.round((paperPortfolio.cashBalance + returnCash) * 100) / 100;
    const newUsedMargin = Math.max(0, Math.round((paperPortfolio.usedMargin - pos.marginAllocated) * 100) / 100);
    const newRealizedPnL = Math.round((paperPortfolio.realizedPnL + netPnL) * 100) / 100;
    const newTotalCharges = Math.round(((paperPortfolio.totalChargesPaid || 0) + sellCharges.totalCharges) * 100) / 100;

    const updatedPositions = paperPositions.filter(p => p.id !== positionId);
    setPaperPositions(updatedPositions);
    await StorageService.saveAll("paperPositions", updatedPositions);

    const newPortfolio: PaperPortfolio = {
      ...paperPortfolio,
      cashBalance: newCash,
      usedMargin: newUsedMargin,
      realizedPnL: newRealizedPnL,
      totalChargesPaid: newTotalCharges,
      totalPortfolioValue: Math.round((newCash + newUsedMargin) * 100) / 100
    };
    setPaperPortfolio(newPortfolio);
    await StorageService.save("paperPortfolio", { id: "portfolio_main", ...newPortfolio });

    const contractNoteId = "CN-" + Math.floor(100000 + Math.random() * 900000);
    const closeOrder: PaperOrder = {
      id: "ord-" + Date.now(),
      stockSymbol: pos.stockSymbol,
      stockName: pos.stockName,
      direction: exitDirection,
      orderType: "MARKET",
      productType: pos.productType,
      quantity: pos.quantity,
      price: finalPrice,
      executedPrice: finalPrice,
      status: "EXECUTED",
      timestamp: new Date().toLocaleString("en-IN"),
      marginRequired: 0,
      turnover: Math.round(finalPrice * pos.quantity * 100) / 100,
      charges: sellCharges,
      contractNoteId
    };
    const newOrders = [closeOrder, ...paperOrders];
    setPaperOrders(newOrders);
    await StorageService.save("paperOrders", closeOrder);
  };

  const squareOffAllPositions = async () => {
    if (paperPositions.length === 0) return;
    for (const pos of [...paperPositions]) {
      await closePaperPosition(pos.id);
    }
  };

  const addVirtualFunds = async (amount: number) => {
    if (amount <= 0) return;
    const newCash = Math.round((paperPortfolio.cashBalance + amount) * 100) / 100;
    const newInitial = Math.round((paperPortfolio.initialCapital + amount) * 100) / 100;
    const newTotal = Math.round((paperPortfolio.totalPortfolioValue + amount) * 100) / 100;

    const newPortfolio: PaperPortfolio = {
      ...paperPortfolio,
      initialCapital: newInitial,
      cashBalance: newCash,
      totalPortfolioValue: newTotal
    };
    setPaperPortfolio(newPortfolio);
    await StorageService.save("paperPortfolio", { id: "portfolio_main", ...newPortfolio });
  };

  const cancelPaperOrder = async (orderId: string) => {
    const order = paperOrders.find(o => o.id === orderId);
    if (!order || order.status !== "PENDING") return;

    const updated = paperOrders.map(o => o.id === orderId ? { ...o, status: "CANCELLED" as const } : o);
    setPaperOrders(updated);
    await StorageService.saveAll("paperOrders", updated);
  };

  const modifyPaperPositionSLTarget = async (positionId: string, stopLoss?: number, targetPrice?: number) => {
    const updated = paperPositions.map(pos => {
      if (pos.id === positionId) {
        return {
          ...pos,
          stopLoss,
          targetPrice
        };
      }
      return pos;
    });
    setPaperPositions(updated);
    await StorageService.saveAll("paperPositions", updated);
  };

  const resetPaperTrading = async () => {
    const initial = DemoDataSeeder.getInitialPaperPortfolio();
    setPaperPortfolio(initial);
    setPaperPositions([]);
    setPaperOrders([]);
    await StorageService.save("paperPortfolio", { id: "portfolio_main", ...initial });
    await StorageService.clearStore("paperPositions");
    await StorageService.clearStore("paperOrders");
  };

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
    await StorageService.saveAll("academy", updated);
  };

  const updatePreferences = async (newPrefs: Partial<TradingPreferences>) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    await StorageService.save("preferences", { id: "user_prefs", ...updated });
  };

  const updateProfile = async (newProf: Partial<UserProfile>) => {
    const updated = { ...profile, ...newProf };
    setProfile(updated);
    await StorageService.save("profile", { id: "user_profile", ...updated });
  };

  const updateSettings = async (newSet: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSet };
    setSettings(updated);
    await StorageService.save("settings", { id: "app_settings", ...updated });
  };

  const analytics = TradingCalculationService.generateAnalytics(journal, preferences.defaultCapital);
  const discipline = TradingCalculationService.calculateDisciplineScore(journal);

  const todayStr = new Date().toISOString().split("T")[0];
  const todayTrades = journal.filter(t => t.date === todayStr);
  const todayRiskUsed = todayTrades.reduce((acc, t) => {
    const riskPerShare = Math.abs(t.entryPrice - t.stopLoss);
    return acc + (riskPerShare * t.quantity);
  }, 0);
  const todayPnL = todayTrades.reduce((acc, t) => acc + t.netPnL, 0);

  // Tilt Lock Automatic Circuit Breaker Watcher
  useEffect(() => {
    if (tiltLockState.isActive) return;

    // 1. Max Daily Loss Hit
    if (preferences.maxDailyLoss > 0 && todayPnL <= -Math.abs(preferences.maxDailyLoss)) {
      activateTiltLock(
        'MAX_DAILY_LOSS',
        45,
        `Daily loss limit reached (-₹${Math.abs(preferences.maxDailyLoss).toLocaleString('en-IN')}). Cooldown engaged to protect remaining capital.`
      );
      return;
    }

    // 2. 3 Consecutive Losses Today
    const todayClosed = todayTrades.filter(t => t.status === 'CLOSED');
    if (todayClosed.length >= 3) {
      const last3 = todayClosed.slice(0, 3);
      const allLosses = last3.every(t => t.netPnL < 0);
      if (allLosses) {
        activateTiltLock(
          'CONSECUTIVE_LOSSES',
          30,
          '3 consecutive losses detected today. Prop-desk Tilt Lock engaged to prevent emotional revenge trading.'
        );
      }
    }
  }, [todayPnL, todayTrades, preferences.maxDailyLoss, tiltLockState.isActive, activateTiltLock]);

  const resetAllDemoData = async () => {
    await DemoDataSeeder.resetToDemoData();
    await initializeAppState();
  };

  const startFreshBlankCanvas = async (options?: { startingCapital?: number; traderName?: string }) => {
    await DemoDataSeeder.startFreshBlankCanvas(options);
    if (options?.traderName) {
      await updateProfile({ name: options.traderName });
    }
    if (options?.startingCapital) {
      await updatePreferences({ defaultCapital: options.startingCapital });
    }
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

        tiltLockState,
        isTiltLocked,
        activateTiltLock,
        deactivateTiltLock,
        isTiltLockModalOpen,
        setIsTiltLockModalOpen,

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
        addVirtualFunds,
        squareOffAllPositions,
        cancelPaperOrder,
        modifyPaperPositionSLTarget,
        selectedContractNoteOrder,
        setSelectedContractNoteOrder,
        isContractNoteModalOpen,
        setIsContractNoteModalOpen,

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

        isSidebarCollapsed,
        setIsSidebarCollapsed,
        toggleSidebar,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        toggleMobileSidebar,

        resetAllDemoData,
        startFreshBlankCanvas,
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
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};