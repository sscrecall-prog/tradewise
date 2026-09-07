import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { TradePulseNavbar } from '../components/tradepulse/TradePulseNavbar';
import { MarketPulseBanner } from '../components/tradepulse/MarketPulseBanner';
import { TopTradeSetups } from '../components/tradepulse/TopTradeSetups';
import { TopGainersLosersAnalytics } from '../components/tradepulse/TopGainersLosersAnalytics';
import { SectorHeatmap } from '../components/tradepulse/SectorHeatmap';
import { ProScreenerTable } from '../components/tradepulse/ProScreenerTable';
import { TradePulseAddDataModal } from '../components/tradepulse/TradePulseAddDataModal';
import { TradePulseStockModal } from '../components/tradepulse/TradePulseStockModal';
import { TradePulseHistoryDrawer } from '../components/tradepulse/TradePulseHistoryDrawer';
import { TradePulsePaperModal } from '../components/tradepulse/TradePulsePaperModal';

import { parseNiftyCsv } from '../services/tradepulse/stockDataParser';
import { analyzeNiftyDataset } from '../services/tradepulse/analysisEngine';
import { TradePulseStorage } from '../services/tradepulse/tradePulseStorage';
import { DEFAULT_NIFTY_CSV } from '../services/tradepulse/defaultData';
import { DailySnapshot, AnalyzedStock, PaperTrade } from '../types/tradepulse';
import { useApp } from '../context/AppContext';
import { useMarketData } from '../context/MarketDataContext';

export const TradePulsePage: React.FC = () => {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useApp();
  const { 
    quotes, 
    indices, 
    isLiveConnected, 
    lastLiveUpdate, 
    refreshData, 
    isLoading: isMarketLoading 
  } = useMarketData();

  // Snapshot State
  const [snapshots, setSnapshots] = useState<DailySnapshot[]>([]);
  const [activeSnapshotId, setActiveSnapshotId] = useState<string>('');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [isPaperModalOpen, setIsPaperModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<AnalyzedStock | null>(null);

  // Filter & Watchlist states
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [paperTrades, setPaperTrades] = useState<PaperTrade[]>([]);

  // Initialize data on mount
  useEffect(() => {
    const { snapshots: initSnaps, activeId } = TradePulseStorage.initStorage();
    setSnapshots(initSnaps);
    setActiveSnapshotId(activeId);
    setWatchlist(TradePulseStorage.getWatchlist());
    setPaperTrades(TradePulseStorage.getPaperTrades());
  }, []);

  // Active snapshot object
  const activeSnapshot = useMemo(() => {
    return snapshots.find(s => s.id === activeSnapshotId) || snapshots[0] || null;
  }, [snapshots, activeSnapshotId]);

  // Analyzed dataset for current snapshot merged with live market quotes
  const { stocks, marketPulse } = useMemo(() => {
    const csv = activeSnapshot?.rawCsv || DEFAULT_NIFTY_CSV;
    const rawRows = parseNiftyCsv(csv);

    // Merge live market feed data into rows when available
    const updatedRows = rawRows.map(row => {
      const isIndex = row.symbol.toUpperCase().includes('NIFTY') ||
                      row.symbol.toUpperCase().includes('INDEX') ||
                      row.symbol.toUpperCase().includes('SENSEX');

      if (isIndex) {
        const liveIndex = indices.find(
          idx => idx.symbol.toUpperCase() === 'NIFTY' || 
                 row.symbol.toUpperCase().includes(idx.symbol.toUpperCase())
        );
        if (liveIndex && liveIndex.price > 0) {
          return {
            ...row,
            ltp: liveIndex.price,
            change: liveIndex.change,
            changePercent: liveIndex.changePercent,
            high: Math.max(row.high, liveIndex.price),
            low: Math.min(row.low, liveIndex.price)
          };
        }
        return row;
      }

      const liveQuote = quotes.find(q => {
        const qSym = q.symbol.toUpperCase();
        const rSym = row.symbol.toUpperCase();
        if (qSym === rSym) return true;
        if (qSym === 'TMPV' && rSym === 'TATAMOTORS') return true;
        if (qSym === 'TATAMOTORS' && rSym === 'TMPV') return true;
        if (qSym === 'ETERNAL' && rSym === 'ZOMATO') return true;
        if (qSym === 'ZOMATO' && rSym === 'ETERNAL') return true;
        return false;
      });

      if (liveQuote && liveQuote.price > 0) {
        const ltp = liveQuote.price;
        const change = liveQuote.change ?? row.change;
        const changePercent = liveQuote.changePercent ?? row.changePercent;
        const high = Math.max(row.high, liveQuote.high || row.high, ltp);
        const low = Math.min(row.low, liveQuote.low || row.low, ltp);
        const open = liveQuote.open || row.open;
        const prevClose = liveQuote.prevClose || row.prevClose;
        const volume = liveQuote.volume || row.volume;
        const high52W = liveQuote.high52W || row.high52W;
        const low52W = liveQuote.low52W || row.low52W;

        return {
          ...row,
          ltp,
          change,
          changePercent,
          high,
          low,
          open,
          prevClose,
          volume,
          high52W,
          low52W
        };
      }

      return row;
    });

    return analyzeNiftyDataset(updatedRows);
  }, [activeSnapshot, quotes, indices]);

  // Watchlist toggle handler (syncs both TradePulse local and TradeWize global watchlist)
  const handleToggleWatchlist = (symbol: string) => {
    const updated = TradePulseStorage.toggleWatchlist(symbol);
    setWatchlist(updated);

    try {
      if (isInWatchlist(symbol)) {
        removeFromWatchlist(symbol);
      } else {
        addToWatchlist(symbol);
      }
    } catch (e) {
      // safe fallback
    }
  };

  // Add new snapshot
  const handleSaveSnapshot = (newSnap: DailySnapshot) => {
    const updated = TradePulseStorage.saveSnapshot(newSnap);
    setSnapshots(updated);
    setActiveSnapshotId(newSnap.id);

    // Celebrate successful import
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.2 },
      colors: ['#10b981', '#3b82f6', '#06b6d4', '#f59e0b']
    });
  };

  // Switch snapshot
  const handleSelectSnapshot = (id: string) => {
    setActiveSnapshotId(id);
    TradePulseStorage.setActiveSnapshotId(id);
  };

  // Delete snapshot
  const handleDeleteSnapshot = (id: string) => {
    const updated = TradePulseStorage.deleteSnapshot(id);
    setSnapshots(updated);
    if (activeSnapshotId === id && updated.length > 0) {
      setActiveSnapshotId(updated[0].id);
    }
  };

  // Paper Trading Handlers
  const handleTakePaperTrade = (trade: PaperTrade) => {
    const updated = TradePulseStorage.addPaperTrade(trade);
    setPaperTrades(updated);
  };

  const handleDeletePaperTrade = (id: string) => {
    const updated = TradePulseStorage.deletePaperTrade(id);
    setPaperTrades(updated);
  };

  // Reset to default
  const handleResetDefault = () => {
    if (confirm('Reset TradePulse storage to official NIFTY 100 & NIFTY 50 datasets?')) {
      localStorage.removeItem('nifty_multi_snapshots_v2');
      localStorage.removeItem('nifty50_snapshots_v1');
      const { snapshots: initSnaps, activeId } = TradePulseStorage.initStorage();
      setSnapshots(initSnaps);
      setActiveSnapshotId(activeId);
    }
  };

  // Export current table as enriched CSV
  const handleExportCsv = () => {
    if (!stocks.length) return;

    const headers = [
      'Symbol',
      'Sector',
      'LTP',
      'Change',
      '% Change',
      'Open',
      'High',
      'Low',
      'Prev Close',
      'CLV (%)',
      'Turnover (₹ Cr)',
      'Volume',
      '52W High',
      '52W High Dist (%)',
      '30D %',
      '365D %',
      'Pro Score',
      'Confirmation Grade',
      'RS Alpha (%)',
      'Trade Signal',
      'Action',
      'Suggested Entry',
      'Stop Loss',
      'Target 1',
      'Target 2'
    ];

    const rows = stocks.map(s => [
      s.symbol,
      s.sector,
      s.ltp,
      s.change,
      s.changePercent,
      s.open,
      s.high,
      s.low,
      s.prevClose,
      s.clv,
      s.valueCrores,
      s.volume,
      s.high52W,
      s.distFrom52WHigh,
      s.change30D,
      s.change365D,
      s.proScore,
      s.confirmation?.grade || 'B',
      s.alphaVsIndex ?? 0,
      s.setup.signal,
      s.setup.action,
      s.setup.entryPrice,
      s.setup.stopLoss,
      s.setup.target1,
      s.setup.target2
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `NIFTY_TradePulse_Analysis_${activeSnapshotId || 'today'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn tradepulse-scope">
      
      {/* Top TradePulse Feed & Controls Action Bar */}
      <TradePulseNavbar
        activeSnapshot={activeSnapshot}
        snapshots={snapshots}
        onSelectSnapshot={handleSelectSnapshot}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenHistoryDrawer={() => setIsHistoryDrawerOpen(true)}
        onResetDefault={handleResetDefault}
        onExportCsv={handleExportCsv}
        totalStocks={stocks.length}
        indexSymbol={marketPulse.indexSymbol}
        paperTradesCount={paperTrades.length}
        onOpenPaperModal={() => setIsPaperModalOpen(true)}
        isLiveConnected={isLiveConnected}
        lastLiveUpdate={lastLiveUpdate}
        onRefreshLive={refreshData}
        isRefreshing={isMarketLoading}
      />

      {/* Main Analysis Sections */}
      <div className="space-y-6">
        {/* 1. Market Pulse & Sentiment Header */}
        <MarketPulseBanner pulse={marketPulse} />

        {/* 2. Top Trade Recommendations ("Kon Si Company Me Trade Karein?") */}
        <TopTradeSetups
          stocks={stocks}
          onSelectStock={(stock) => setSelectedStock(stock)}
        />

        {/* 3. Top 10 Gainers & Losers Deep Analytics */}
        <TopGainersLosersAnalytics
          stocks={stocks}
          onSelectStock={(stock) => setSelectedStock(stock)}
        />

        {/* 4. Sector Rotation & Turnover Heatmap */}
        <SectorHeatmap
          stocks={stocks}
          selectedSector={selectedSector}
          onSelectSector={(sec) => setSelectedSector(sec)}
        />

        {/* 5. Master Screener & Decision Matrix */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
              Master Stock Screener & Decision Matrix
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              All {stocks.length} Equities Ranked by Pro Confluence
            </span>
          </div>

          <ProScreenerTable
            stocks={stocks}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
            onSelectStock={(stock) => setSelectedStock(stock)}
            selectedSector={selectedSector}
            onSelectSector={(sec) => setSelectedSector(sec)}
          />
        </section>
      </div>

      {/* Modals & Slide-over Drawers */}
      <TradePulseAddDataModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSaveSnapshot={handleSaveSnapshot}
      />

      <TradePulseStockModal
        stock={selectedStock}
        isOpen={!!selectedStock}
        onClose={() => setSelectedStock(null)}
        isWatchlisted={selectedStock ? watchlist.includes(selectedStock.symbol) : false}
        onToggleWatchlist={handleToggleWatchlist}
        onTakePaperTrade={handleTakePaperTrade}
      />

      <TradePulsePaperModal
        isOpen={isPaperModalOpen}
        onClose={() => setIsPaperModalOpen(false)}
        trades={paperTrades}
        stocks={stocks}
        onDeleteTrade={handleDeletePaperTrade}
        onSelectStock={(stk) => {
          setIsPaperModalOpen(false);
          setSelectedStock(stk);
        }}
      />

      <TradePulseHistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        snapshots={snapshots}
        activeSnapshotId={activeSnapshotId}
        onSelectSnapshot={handleSelectSnapshot}
        onDeleteSnapshot={handleDeleteSnapshot}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

    </div>
  );
};
