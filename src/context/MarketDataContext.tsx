import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { MarketQuote, IndexData, TimeFrame, HistoricalPrice, ListedCompany } from "../types";
import { MarketDataService } from "../services/MarketDataService";

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
  isLiveConnected: boolean;
  lastLiveUpdate: string | null;
  getQuote: (symbol: string) => MarketQuote | undefined;
  fetchAndAddQuote: (symbol: string) => Promise<MarketQuote | null>;
  getHistoricalData: (symbol: string, timeframe: TimeFrame) => Promise<HistoricalPrice[]>;
  searchStocks: (query: string) => Promise<MarketQuote[]>;
  searchAllIndianStocks: (query: string) => ListedCompany[];
  getAllIndianStocks: () => ListedCompany[];
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
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [lastLiveUpdate, setLastLiveUpdate] = useState<string | null>(null);
  const [marketStatus, setMarketStatus] = useState<MarketStatus>(() => MarketDataService.isMarketOpen());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStockSymbol, setSelectedStockSymbol] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const priorityList = selectedStockSymbol ? [selectedStockSymbol] : [];
      const [quotesData, indicesData] = await Promise.all([
        MarketDataService.getAllQuotes(priorityList),
        MarketDataService.getIndices()
      ]);
      setQuotes(prev => {
        // Merge with any dynamically fetched quotes
        const map = new Map<string, MarketQuote>();
        quotesData.forEach(q => map.set(q.symbol.toUpperCase(), q));
        prev.forEach(q => {
          if (!map.has(q.symbol.toUpperCase())) {
            map.set(q.symbol.toUpperCase(), q);
          }
        });
        return Array.from(map.values());
      });
      setIndices(indicesData);
      setIsLiveConnected(MarketDataService.isLiveConnected);
      setLastLiveUpdate(MarketDataService.lastLiveUpdated);
      setMarketStatus(MarketDataService.isMarketOpen());
    } catch (error) {
      console.error("Failed to load market data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStockSymbol]);

  useEffect(() => {
    loadData();

    // High-frequency live market sync every 2.5s when market is OPEN
    const livePollInterval = setInterval(() => {
      const current = MarketDataService.isMarketOpen();
      setMarketStatus(current);
      if (current.isOpen) {
        loadData();
      }
    }, 2500);

    // Continuous 1-second micro-tick stream: strictly only when market is actively OPEN
    // When market is closed (after 03:30 PM IST), prices are 100% frozen
    const tickInterval = setInterval(() => {
      const current = MarketDataService.isMarketOpen();
      setMarketStatus(current);
      if (current.isOpen) {
        setQuotes(prev => MarketDataService.applyMicroTick(prev));
      }
    }, 1000);

    return () => {
      clearInterval(livePollInterval);
      clearInterval(tickInterval);
    };
  }, [loadData]);

  const getQuote = (symbol: string) => {
    return quotes.find(q => q.symbol.toUpperCase() === symbol.toUpperCase());
  };

  const fetchAndAddQuote = async (symbol: string): Promise<MarketQuote | null> => {
    const existing = getQuote(symbol);
    if (existing) return existing;

    const q = await MarketDataService.getQuote(symbol);
    if (q) {
      setQuotes(prev => {
        if (prev.some(x => x.symbol.toUpperCase() === q.symbol.toUpperCase())) return prev;
        return [q, ...prev];
      });
      return q;
    }
    return null;
  };

  const getHistoricalData = (symbol: string, timeframe: TimeFrame) => {
    return MarketDataService.getHistoricalData(symbol, timeframe);
  };

  const searchStocks = (query: string) => {
    return MarketDataService.searchStocks(query);
  };

  const searchAllIndianStocks = (query: string) => {
    return MarketDataService.searchAllIndianStocks(query);
  };

  const openStockModal = (symbol: string) => {
    setSelectedStockSymbol(symbol);
    // Asynchronously ensure quote is loaded in state
    fetchAndAddQuote(symbol);
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
        isLiveConnected,
        lastLiveUpdate,
        getQuote,
        fetchAndAddQuote,
        getHistoricalData,
        searchStocks,
        searchAllIndianStocks,
        getAllIndianStocks: () => MarketDataService.getAllIndianStocks(),
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
  if (!context) {
    throw new Error("useMarketData must be used within a MarketDataProvider");
  }
  return context;
};