const fs = require('fs');
const chunks = [];

chunks.push(`import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useMarketData } from '../context/MarketDataContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { TradingCalculationService } from '../services/TradingCalculationService';
import { PaperPosition, PaperOrder } from '../types';
import {
  Layers,
  Briefcase,
  Clock,
  Wallet,
  Plus,
  RotateCcw,
  Zap,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  FileText,
  SlidersHorizontal,
  Search,
  AlertTriangle,
  Info,
  ChevronRight
} from 'lucide-react';

export const PaperTradingPage: React.FC = () => {
  const {
    paperPortfolio,
    paperPositions,
    paperOrders,
    closePaperPosition,
    resetPaperTrading,
    addVirtualFunds,
    squareOffAllPositions,
    cancelPaperOrder,
    modifyPaperPositionSLTarget,
    setSelectedContractNoteOrder,
    setIsContractNoteModalOpen,
    setIsPlaceOrderModalOpen,
    setSelectedStockForOrder
  } = useApp();

  const { quotes, openStockModal } = useMarketData();

  const [activeTab, setActiveTab] = useState<'positions' | 'holdings' | 'orders' | 'funds'>('positions');
  const [closingId, setClosingId] = useState<string | null>(null);
  const [isSquaringAll, setIsSquaringAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [productFilter, setProductFilter] = useState<'ALL' | 'MIS' | 'CNC'>('ALL');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'ALL' | 'EXECUTED' | 'PENDING' | 'CANCELLED'>('ALL');

  // Modify SL / Target modal state
  const [editingPosition, setEditingPosition] = useState<PaperPosition | null>(null);
  const [editSL, setEditSL] = useState('');
  const [editTarget, setEditTarget] = useState('');

  // Add Funds Modal State
  const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false);
  const [customFundAmount, setCustomFundAmount] = useState('');

  // Live Position calculations with Market Quotes
  const livePositions = useMemo(() => {
    return paperPositions.map(pos => {
      const quote = quotes.find(q => q.symbol.toUpperCase() === pos.stockSymbol.toUpperCase());
      const currentPrice = quote ? quote.price : pos.currentPrice;
      const isIntraday = pos.productType === 'INTRADAY (MIS)';
      const priceDiff = pos.direction === 'BUY'
        ? currentPrice - pos.avgPrice
        : pos.avgPrice - currentPrice;
      const grossPnL = Math.round(priceDiff * pos.quantity * 100) / 100;
      const grossPnLPercent = Math.round(((priceDiff / pos.avgPrice) * 100) * 100) / 100;

      // Estimated exit charges to calculate realistic net P&L
      const estimatedExitCharges = TradingCalculationService.calculateOrderCharges(
        currentPrice,
        pos.quantity,
        pos.direction === 'BUY' ? 'SELL' : 'BUY',
        isIntraday
      );
      const totalEstimatedCharges = Math.round((pos.buyCharges + estimatedExitCharges.totalCharges) * 100) / 100;
      const netPnL = Math.round((grossPnL - totalEstimatedCharges) * 100) / 100;

      return {
        ...pos,
        currentPrice,
        unrealizedPnL: grossPnL,
        unrealizedPnLPercent: grossPnLPercent,
        netPnL,
        estimatedExitCharges: estimatedExitCharges.totalCharges
      };
    });
  }, [paperPositions, quotes]);

  // Holdings are positions with CNC (Cash & Carry) product type
  const holdingsPositions = useMemo(() => {
    return livePositions.filter(p => p.productType === 'DELIVERY (CNC)');
  }, [livePositions]);

  // Filtered positions for display
  const filteredPositions = useMemo(() => {
    return livePositions.filter(p => {
      const matchesSearch = p.stockSymbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.stockName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesProduct = productFilter === 'ALL' ||
        (productFilter === 'MIS' && p.productType === 'INTRADAY (MIS)') ||
        (productFilter === 'CNC' && p.productType === 'DELIVERY (CNC)');
      return matchesSearch && matchesProduct;
    });
  }, [livePositions, searchQuery, productFilter]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return paperOrders.filter(o => {
      const matchesSearch = o.stockSymbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.stockName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = orderStatusFilter === 'ALL' || o.status === orderStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [paperOrders, searchQuery, orderStatusFilter]);
`);
chunks.push(`
  // Calculations for summary banner
  const totalUnrealizedPnL = livePositions.reduce((acc, p) => acc + p.unrealizedPnL, 0);
  const totalMarginBlocked = livePositions.reduce((acc, p) => acc + p.marginAllocated, 0);
  const totalInvestedValue = livePositions.reduce((acc, p) => acc + (p.avgPrice * p.quantity), 0);
  const totalGrossPnL = Math.round((paperPortfolio.realizedPnL + totalUnrealizedPnL) * 100) / 100;
  const isOverallPositive = totalGrossPnL >= 0;

  const marginUtilizedPct = paperPortfolio.totalPortfolioValue > 0
    ? Math.min(100, Math.round((paperPortfolio.usedMargin / paperPortfolio.totalPortfolioValue) * 100))
    : 0;

  // Actions
  const handleClose = async (positionId: string) => {
    setClosingId(positionId);
    try {
      await closePaperPosition(positionId);
    } finally {
      setClosingId(null);
    }
  };

  const handleSquareOffAll = async () => {
    if (livePositions.length === 0) return;
    if (window.confirm(\`Are you sure you want to Square Off all \${livePositions.length} open position(s) at current market prices?\`)) {
      setIsSquaringAll(true);
      try {
        await squareOffAllPositions();
      } finally {
        setIsSquaringAll(false);
      }
    }
  };

  const handleReset = async () => {
    if (window.confirm('Reset Paper Trading account? Balance will restore to ₹1,00,000 and all positions will be cleared.')) {
      await resetPaperTrading();
    }
  };

  const handleQuickAddFunds = async (amount: number) => {
    await addVirtualFunds(amount);
  };

  const handleCustomAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(customFundAmount);
    if (!isNaN(val) && val > 0) {
      await addVirtualFunds(val);
      setCustomFundAmount('');
      setIsAddFundsModalOpen(false);
    }
  };

  const handleOpenModifyModal = (pos: PaperPosition) => {
    setEditingPosition(pos);
    setEditSL(pos.stopLoss ? pos.stopLoss.toString() : '');
    setEditTarget(pos.targetPrice ? pos.targetPrice.toString() : '');
  };

  const handleSaveSLTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPosition) return;
    const sl = editSL ? parseFloat(editSL) : undefined;
    const tgt = editTarget ? parseFloat(editTarget) : undefined;
    await modifyPaperPositionSLTarget(editingPosition.id, sl, tgt);
    setEditingPosition(null);
  };

  const handleOpenContractNote = (order: PaperOrder) => {
    setSelectedContractNoteOrder(order);
    setIsContractNoteModalOpen(true);
  };

  const handleTradeSymbol = (symbol: string) => {
    setSelectedStockForOrder(symbol);
    setIsPlaceOrderModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header & Ticker Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl font-extrabold text-text-primary tracking-tight">
              Virtual Paper Trading Terminal
            </h2>
            <Badge variant="accent" size="sm">
              SEBI 5x MIS Leverage
            </Badge>
            <Badge variant="neutral" size="sm">
              Official Tax & Charges Engine
            </Badge>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Live simulated trading with Angel One & Zerodha Kite execution, real-time brokerage, STT & Electronic Contract Notes.
          </p>
        </div>

        {/* Global Terminal Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={handleReset}
          >
            Reset
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={<Wallet className="w-3.5 h-3.5" />}
            onClick={() => setIsAddFundsModalOpen(true)}
          >
            + Add Funds
          </Button>

          {livePositions.length > 0 && (
            <Button
              variant="danger"
              size="sm"
              icon={<Zap className="w-3.5 h-3.5" />}
              isLoading={isSquaringAll}
              onClick={handleSquareOffAll}
            >
              Square Off All ({livePositions.length})
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => {
              setSelectedStockForOrder(null);
              setIsPlaceOrderModalOpen(true);
            }}
          >
            Place New Order
          </Button>
        </div>
      </div>

      {/* Kite / Angel One Metric Highlights Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Overall P&L */}
        <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted">Total Net P&L</span>
            {isOverallPositive ? (
              <span className="p-1 rounded-md bg-brand-positive/10 text-brand-positive">
                <TrendingUp className="w-4 h-4" />
              </span>
            ) : (
              <span className="p-1 rounded-md bg-brand-negative/10 text-brand-negative">
                <TrendingDown className="w-4 h-4" />
              </span>
            )}
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={\`text-2xl font-black \${isOverallPositive ? 'text-brand-positive' : 'text-brand-negative'}\`}>
              {isOverallPositive ? '+₹' : '-₹'}{Math.abs(totalGrossPnL).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-border-subtle/60 flex items-center justify-between text-[11px] text-text-secondary">
            <span>Realized: <b className={paperPortfolio.realizedPnL >= 0 ? 'text-brand-positive' : 'text-brand-negative'}>
              {paperPortfolio.realizedPnL >= 0 ? '+₹' : '-₹'}{Math.abs(Math.round(paperPortfolio.realizedPnL)).toLocaleString('en-IN')}
            </b></span>
            <span>Open: <b className={totalUnrealizedPnL >= 0 ? 'text-brand-positive' : 'text-brand-negative'}>
              {totalUnrealizedPnL >= 0 ? '+₹' : '-₹'}{Math.abs(Math.round(totalUnrealizedPnL)).toLocaleString('en-IN')}
            </b></span>
          </div>
        </div>

        {/* Available Margin (Cash Balance) */}
        <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted">Available Margin</span>
            <span className="p-1 rounded-md bg-brand-accent/10 text-brand-accent">
              <Wallet className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-text-primary">
            ₹{Math.round(paperPortfolio.cashBalance).toLocaleString('en-IN')}
          </div>
          <div className="mt-2 pt-2 border-t border-border-subtle/60 flex items-center justify-between text-[11px] text-text-secondary">
            <span>Total Capital:</span>
            <span className="font-bold font-mono text-text-primary">
              ₹{Math.round(paperPortfolio.totalPortfolioValue).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Used Margin & Utilization Bar */}
        <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted">Used Margin (5x MIS)</span>
            <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-bg-secondary text-text-primary border border-border-subtle">
              {marginUtilizedPct}% Used
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-text-primary">
            ₹{Math.round(paperPortfolio.usedMargin).toLocaleString('en-IN')}
          </div>
          <div className="mt-3 w-full bg-bg-secondary rounded-full h-1.5 overflow-hidden border border-border-subtle">
            <div
              className={\`h-full transition-all duration-300 \${marginUtilizedPct > 80 ? 'bg-brand-negative' : 'bg-brand-accent'}\`}
              style={{ width: \`\${marginUtilizedPct}%\` }}
            />
          </div>
        </div>

        {/* Regulatory Taxes & Brokerage Friction */}
        <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted">Taxes & Charges Paid</span>
            <span className="p-1 rounded-md bg-amber-500/10 text-amber-500">
              <FileText className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-text-primary">
            ₹{(paperPortfolio.totalChargesPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 pt-2 border-t border-border-subtle/60 flex items-center justify-between text-[11px] text-text-secondary">
            <span>STT, GST, SEBI & Brokerage</span>
            <button
              onClick={() => setActiveTab('funds')}
              className="text-brand-accent font-semibold hover:underline flex items-center gap-0.5"
            >
              Tax Ledger &rarr;
            </button>
          </div>
        </div>
      </div>
`);
chunks.push(`
      {/* Angel One & Zerodha Style Terminal Tabs */}
      <div className="flex border-b border-border-subtle gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('positions')}
          className={\`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap \${
            activeTab === 'positions'
              ? 'border-brand-accent text-brand-accent bg-brand-accent/5'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }\`}
        >
          <Layers className="w-4 h-4" />
          Positions ({livePositions.length})
        </button>

        <button
          onClick={() => setActiveTab('holdings')}
          className={\`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap \${
            activeTab === 'holdings'
              ? 'border-brand-accent text-brand-accent bg-brand-accent/5'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }\`}
        >
          <Briefcase className="w-4 h-4" />
          Holdings ({holdingsPositions.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={\`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap \${
            activeTab === 'orders'
              ? 'border-brand-accent text-brand-accent bg-brand-accent/5'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }\`}
        >
          <Clock className="w-4 h-4" />
          Order Book ({paperOrders.length})
        </button>

        <button
          onClick={() => setActiveTab('funds')}
          className={\`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap \${
            activeTab === 'funds'
              ? 'border-brand-accent text-brand-accent bg-brand-accent/5'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }\`}
        >
          <Wallet className="w-4 h-4" />
          Funds & Taxes
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: POSITIONS (KITE / ANGEL ONE TERMINAL)            */}
      {/* ======================================================== */}
      {activeTab === 'positions' && (
        <div className="space-y-4">
          {/* Controls / Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-bg-card p-3 rounded-2xl border border-border-subtle">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search instrument..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-bg-secondary border border-border-subtle text-text-primary focus:outline-none focus:border-brand-accent"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <div className="inline-flex p-1 rounded-xl bg-bg-secondary border border-border-subtle text-xs">
                {(['ALL', 'MIS', 'CNC'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setProductFilter(p)}
                    className={\`px-3 py-1 rounded-lg font-semibold transition-all \${
                      productFilter === p
                        ? 'bg-brand-accent text-white shadow-sm'
                        : 'text-text-secondary hover:text-text-primary'
                    }\`}
                  >
                    {p === 'MIS' ? 'MIS (5x Intraday)' : p === 'CNC' ? 'CNC (Delivery)' : 'All Products'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Positions Table / Cards */}
          {filteredPositions.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-bg-card border border-border-subtle space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-bg-secondary text-text-muted mx-auto flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-text-primary">No Open Positions</h3>
              <p className="text-xs text-text-muted max-w-sm mx-auto">
                You do not have any active MIS or CNC trades. Open the order pad to execute a trade with 5x intraday margin or delivery.
              </p>
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => setIsPlaceOrderModalOpen(true)}
                >
                  Place New Order
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl bg-bg-card border border-border-subtle shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-bg-elevated/70 border-b border-border-subtle text-text-muted text-[11px] uppercase tracking-wider font-semibold">
                      <th className="p-3.5">Instrument</th>
                      <th className="p-3.5">Product</th>
                      <th className="p-3.5">Side</th>
                      <th className="p-3.5 text-right">Qty</th>
                      <th className="p-3.5 text-right">Avg. Price</th>
                      <th className="p-3.5 text-right">LTP</th>
                      <th className="p-3.5 text-right">Margin Blocked</th>
                      <th className="p-3.5 text-right">Unrealized P&L</th>
                      <th className="p-3.5 text-right">Est. Net P&L</th>
                      <th className="p-3.5 text-center">SL / Target</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle/50">
                    {filteredPositions.map(pos => {
                      const isProfit = pos.unrealizedPnL >= 0;
                      const isNetProfit = (pos.netPnL || 0) >= 0;
                      const isMIS = pos.productType === 'INTRADAY (MIS)';

                      return (
                        <tr key={pos.id} className="hover:bg-bg-elevated/30 transition-colors group">
                          {/* Instrument */}
                          <td className="p-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openStockModal(pos.stockSymbol)}
                                className="font-bold text-text-primary hover:text-brand-accent text-sm text-left flex items-center gap-1"
                              >
                                {pos.stockSymbol}
                                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-brand-accent" />
                              </button>
                            </div>
                            <div className="text-[10px] text-text-muted truncate max-w-[130px]">
                              {pos.stockName}
                            </div>
                          </td>

                          {/* Product Badge */}
                          <td className="p-3.5 whitespace-nowrap">
                            {isMIS ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-bold font-mono">
                                ⚡ MIS 5x
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold font-mono">
                                CNC 1x
                              </span>
                            )}
                          </td>

                          {/* Side */}
                          <td className="p-3.5 whitespace-nowrap">
                            <Badge variant={pos.direction === 'BUY' ? 'positive' : 'negative'} size="sm">
                              {pos.direction}
                            </Badge>
                          </td>

                          {/* Qty */}
                          <td className="p-3.5 text-right font-mono font-bold text-text-primary whitespace-nowrap">
                            {pos.quantity}
                          </td>

                          {/* Avg Price */}
                          <td className="p-3.5 text-right font-mono text-text-secondary whitespace-nowrap">
                            ₹{pos.avgPrice.toFixed(2)}
                          </td>

                          {/* LTP */}
                          <td className="p-3.5 text-right font-mono font-bold text-text-primary whitespace-nowrap">
                            ₹{pos.currentPrice.toFixed(2)}
                          </td>

                          {/* Margin Blocked */}
                          <td className="p-3.5 text-right whitespace-nowrap">
                            <div className="font-mono font-bold text-text-primary">
                              ₹{Math.round(pos.marginAllocated).toLocaleString('en-IN')}
                            </div>
                            {isMIS && (
                              <div className="text-[10px] text-purple-400 font-mono">
                                (20% Upfront)
                              </div>
                            )}
                          </td>

                          {/* Gross Unrealized P&L */}
                          <td className="p-3.5 text-right whitespace-nowrap">
                            <div className={\`font-mono font-bold text-sm \${isProfit ? 'text-brand-positive' : 'text-brand-negative'}\`}>
                              {isProfit ? '+₹' : '-₹'}{Math.abs(pos.unrealizedPnL).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </div>
                            <div className={\`text-[10px] font-mono \${isProfit ? 'text-brand-positive' : 'text-brand-negative'}\`}>
                              {isProfit ? '+' : ''}{pos.unrealizedPnLPercent}%
                            </div>
                          </td>

                          {/* Estimated Net P&L after taxes */}
                          <td className="p-3.5 text-right whitespace-nowrap">
                            <div className={\`font-mono font-semibold \${isNetProfit ? 'text-brand-positive/90' : 'text-brand-negative/90'}\`}>
                              {isNetProfit ? '+₹' : '-₹'}{Math.abs(pos.netPnL || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-[9px] text-text-muted">
                              after ~₹{Math.round(pos.buyCharges + (pos.estimatedExitCharges || 0))} charges
                            </div>
                          </td>

                          {/* Stop Loss & Target */}
                          <td className="p-3.5 text-center whitespace-nowrap">
                            <div className="inline-flex flex-col items-center gap-0.5">
                              <button
                                onClick={() => handleOpenModifyModal(pos)}
                                className="text-[11px] font-mono hover:text-brand-accent underline text-text-secondary flex items-center gap-1"
                                title="Click to set/modify Stop Loss and Target"
                              >
                                <span>SL: {pos.stopLoss ? \`₹\${pos.stopLoss}\` : '--'}</span>
                                <span>•</span>
                                <span>Tgt: {pos.targetPrice ? \`₹\${pos.targetPrice}\` : '--'}</span>
                              </button>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="p-3.5 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleTradeSymbol(pos.stockSymbol)}
                                title="Add more shares to this position"
                              >
                                + Add
                              </Button>

                              <Button
                                variant="danger"
                                size="sm"
                                disabled={closingId === pos.id}
                                isLoading={closingId === pos.id}
                                onClick={() => handleClose(pos.id)}
                              >
                                Square Off
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Summary Footer */}
              <div className="p-4 bg-bg-elevated/40 border-t border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-6 flex-wrap text-text-secondary">
                  <div>
                    <span>Total Invested: </span>
                    <span className="font-bold font-mono text-text-primary">
                      ₹{Math.round(totalInvestedValue).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span>Total Margin Blocked: </span>
                    <span className="font-bold font-mono text-purple-400">
                      ₹{Math.round(totalMarginBlocked).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span>Open Gross P&L: </span>
                    <span className={\`font-extrabold font-mono \${totalUnrealizedPnL >= 0 ? 'text-brand-positive' : 'text-brand-negative'}\`}>
                      {totalUnrealizedPnL >= 0 ? '+₹' : '-₹'}{Math.abs(Math.round(totalUnrealizedPnL)).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <Button
                  variant="danger"
                  size="sm"
                  icon={<Zap className="w-3.5 h-3.5" />}
                  isLoading={isSquaringAll}
                  onClick={handleSquareOffAll}
                >
                  Square Off All Positions
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
`);
chunks.push(`
      {/* ======================================================== */}
      {/* TAB 2: HOLDINGS (DELIVERY CNC PORTFOLIO)                 */}
      {/* ======================================================== */}
      {activeTab === 'holdings' && (
        <div className="space-y-4">
          {/* Holdings Info Banner */}
          <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 text-xs flex items-start gap-3">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-text-primary">Delivery (CNC) Equity Portfolio</p>
              <p className="text-text-muted leading-relaxed">
                Cash & Carry (CNC) trades require 100% upfront capital (no leverage as per SEBI regulations).
                Stocks held in CNC are not auto-squared off at 3:15 PM and can be held overnight for short, medium, or long-term investment.
              </p>
            </div>
          </div>

          {holdingsPositions.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-bg-card border border-border-subtle space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-bg-secondary text-text-muted mx-auto flex items-center justify-center">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-text-primary">No CNC Delivery Holdings</h3>
              <p className="text-xs text-text-muted max-w-sm mx-auto">
                You currently don't hold any delivery stocks in your demat. Buy stocks with CNC product type to build an equity portfolio.
              </p>
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => setIsPlaceOrderModalOpen(true)}
                >
                  Buy for Delivery (CNC)
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl bg-bg-card border border-border-subtle shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-bg-elevated/70 border-b border-border-subtle text-text-muted text-[11px] uppercase tracking-wider font-semibold">
                      <th className="p-3.5">Instrument</th>
                      <th className="p-3.5 text-right">Qty</th>
                      <th className="p-3.5 text-right">Avg. Cost</th>
                      <th className="p-3.5 text-right">LTP</th>
                      <th className="p-3.5 text-right">Current Value</th>
                      <th className="p-3.5 text-right">P&L (₹)</th>
                      <th className="p-3.5 text-right">Net Change</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle/50">
                    {holdingsPositions.map(pos => {
                      const isProfit = pos.unrealizedPnL >= 0;
                      const currentValue = pos.currentPrice * pos.quantity;

                      return (
                        <tr key={pos.id} className="hover:bg-bg-elevated/30 transition-colors">
                          <td className="p-3.5 whitespace-nowrap">
                            <div className="font-bold text-text-primary text-sm">{pos.stockSymbol}</div>
                            <div className="text-[10px] text-text-muted">{pos.stockName}</div>
                          </td>
                          <td className="p-3.5 text-right font-mono font-bold text-text-primary whitespace-nowrap">
                            {pos.quantity}
                          </td>
                          <td className="p-3.5 text-right font-mono text-text-secondary whitespace-nowrap">
                            ₹{pos.avgPrice.toFixed(2)}
                          </td>
                          <td className="p-3.5 text-right font-mono font-bold text-text-primary whitespace-nowrap">
                            ₹{pos.currentPrice.toFixed(2)}
                          </td>
                          <td className="p-3.5 text-right font-mono font-bold text-text-primary whitespace-nowrap">
                            ₹{Math.round(currentValue).toLocaleString('en-IN')}
                          </td>
                          <td className="p-3.5 text-right whitespace-nowrap font-mono font-bold">
                            <span className={isProfit ? 'text-brand-positive' : 'text-brand-negative'}>
                              {isProfit ? '+₹' : '-₹'}{Math.abs(pos.unrealizedPnL).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          </td>
                          <td className="p-3.5 text-right whitespace-nowrap font-mono font-bold">
                            <span className={isProfit ? 'text-brand-positive' : 'text-brand-negative'}>
                              {isProfit ? '+' : ''}{pos.unrealizedPnLPercent}%
                            </span>
                          </td>
                          <td className="p-3.5 text-right whitespace-nowrap">
                            <Button
                              variant="danger"
                              size="sm"
                              disabled={closingId === pos.id}
                              onClick={() => handleClose(pos.id)}
                            >
                              Sell (Exit)
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: ORDER BOOK & ELECTRONIC CONTRACT NOTES            */}
      {/* ======================================================== */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Order Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-bg-card p-3 rounded-2xl border border-border-subtle">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Filter orders by scrip..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-bg-secondary border border-border-subtle text-text-primary focus:outline-none focus:border-brand-accent"
              />
            </div>

            <div className="inline-flex p-1 rounded-xl bg-bg-secondary border border-border-subtle text-xs">
              {(['ALL', 'EXECUTED', 'PENDING', 'CANCELLED'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setOrderStatusFilter(st)}
                  className={\`px-3 py-1 rounded-lg font-semibold transition-all \${
                    orderStatusFilter === st
                      ? 'bg-brand-accent text-white shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }\`}
                >
                  {st === 'ALL' ? 'All Orders' : st}
                </button>
              ))}
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-bg-card border border-border-subtle space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-bg-secondary text-text-muted mx-auto flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-text-primary">No Orders Found</h3>
              <p className="text-xs text-text-muted max-w-sm mx-auto">
                Orders placed in the terminal will appear here with complete audit trail and official electronic contract notes.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl bg-bg-card border border-border-subtle shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-bg-elevated/70 border-b border-border-subtle text-text-muted text-[11px] uppercase tracking-wider font-semibold">
                      <th className="p-3.5">Time</th>
                      <th className="p-3.5">Instrument</th>
                      <th className="p-3.5">Product</th>
                      <th className="p-3.5">Order Type</th>
                      <th className="p-3.5">Side</th>
                      <th className="p-3.5 text-right">Qty</th>
                      <th className="p-3.5 text-right">Price / Trigger</th>
                      <th className="p-3.5 text-right">Turnover</th>
                      <th className="p-3.5 text-right">Taxes & Charges</th>
                      <th className="p-3.5 text-center">Status</th>
                      <th className="p-3.5 text-right">Contract Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle/50">
                    {filteredOrders.map(ord => {
                      const charges = ord.charges || {
                        totalCharges: 25.57,
                        brokerage: 20,
                        stt: 0,
                        exchangeCharges: 0.88,
                        gst: 3.76,
                        sebiCharges: 0.03,
                        stampDuty: 0.90
                      };
                      const turnover = ord.turnover || (ord.price * ord.quantity);

                      return (
                        <tr key={ord.id} className="hover:bg-bg-elevated/30 transition-colors">
                          {/* Time */}
                          <td className="p-3.5 whitespace-nowrap text-text-muted font-mono text-[11px]">
                            {new Date(ord.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </td>

                          {/* Instrument */}
                          <td className="p-3.5 whitespace-nowrap font-bold text-text-primary">
                            {ord.stockSymbol}
                          </td>

                          {/* Product */}
                          <td className="p-3.5 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-bg-secondary text-text-secondary border border-border-subtle font-semibold">
                              {ord.productType === 'INTRADAY (MIS)' ? 'MIS (5x)' : 'CNC'}
                            </span>
                          </td>

                          {/* Order Type */}
                          <td className="p-3.5 whitespace-nowrap font-mono text-text-secondary">
                            {ord.orderType}
                          </td>

                          {/* Side */}
                          <td className="p-3.5 whitespace-nowrap">
                            <Badge variant={ord.direction === 'BUY' ? 'positive' : 'negative'} size="sm">
                              {ord.direction}
                            </Badge>
                          </td>

                          {/* Qty */}
                          <td className="p-3.5 text-right font-mono font-bold text-text-primary whitespace-nowrap">
                            {ord.quantity}
                          </td>

                          {/* Price */}
                          <td className="p-3.5 text-right font-mono whitespace-nowrap">
                            <div className="text-text-primary font-bold">₹{ord.price.toFixed(2)}</div>
                            {ord.triggerPrice && (
                              <div className="text-[10px] text-amber-500">Trig: ₹{ord.triggerPrice}</div>
                            )}
                          </td>

                          {/* Turnover */}
                          <td className="p-3.5 text-right font-mono text-text-secondary whitespace-nowrap">
                            ₹{Math.round(turnover).toLocaleString('en-IN')}
                          </td>

                          {/* Charges */}
                          <td className="p-3.5 text-right font-mono font-semibold text-amber-500 whitespace-nowrap">
                            ₹{charges.totalCharges.toFixed(2)}
                          </td>

                          {/* Status */}
                          <td className="p-3.5 text-center whitespace-nowrap">
                            <Badge
                              variant={
                                ord.status === 'EXECUTED' ? 'positive' :
                                ord.status === 'PENDING' ? 'warning' : 'negative'
                              }
                              size="sm"
                            >
                              {ord.status}
                            </Badge>
                          </td>

                          {/* Actions: View Contract Note */}
                          <td className="p-3.5 text-right whitespace-nowrap">
                            {ord.status === 'PENDING' ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => cancelPaperOrder(ord.id)}
                              >
                                Cancel
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<FileText className="w-3.5 h-3.5 text-brand-accent" />}
                                onClick={() => handleOpenContractNote(ord)}
                                className="text-brand-accent hover:bg-brand-accent/10"
                              >
                                Tax Invoice
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
`);
chunks.push(`
      {/* ======================================================== */}
      {/* TAB 4: FUNDS, MARGINS & TAX LEDGER                       */}
      {/* ======================================================== */}
      {activeTab === 'funds' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Margin Summary Card */}
            <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-brand-accent" />
                  Margin Summary (Equity)
                </h3>
                <Badge variant="positive" size="sm">SEBI Compliant</Badge>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-xs py-2 border-b border-border-subtle">
                  <span className="text-text-secondary">Total Virtual Capital</span>
                  <span className="font-bold font-mono text-text-primary">
                    ₹{Math.round(paperPortfolio.totalPortfolioValue).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs py-2 border-b border-border-subtle">
                  <span className="text-text-secondary">Available Cash Margin</span>
                  <span className="font-bold font-mono text-emerald-400 text-sm">
                    ₹{Math.round(paperPortfolio.cashBalance).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs py-2 border-b border-border-subtle">
                  <span className="text-text-secondary">Used Margin (5x MIS Leverage)</span>
                  <span className="font-bold font-mono text-purple-400">
                    ₹{Math.round(paperPortfolio.usedMargin).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs py-2 border-b border-border-subtle">
                  <span className="text-text-secondary">Total Realized Profit/Loss</span>
                  <span className={\`font-bold font-mono \${paperPortfolio.realizedPnL >= 0 ? 'text-brand-positive' : 'text-brand-negative'}\`}>
                    {paperPortfolio.realizedPnL >= 0 ? '+₹' : '-₹'}{Math.abs(Math.round(paperPortfolio.realizedPnL)).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs py-2 border-b border-border-subtle">
                  <span className="text-text-secondary">Total Cumulative Taxes Paid</span>
                  <span className="font-bold font-mono text-amber-500">
                    ₹{(paperPortfolio.totalChargesPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Quick Add Funds Buttons */}
              <div className="pt-3 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  Quick Deposit Virtual Funds:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[25000, 50000, 100000].map(amt => (
                    <Button
                      key={amt}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAddFunds(amt)}
                      className="font-mono text-xs"
                    >
                      +₹{(amt / 1000)}k
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Indian Regulatory Levies & Charges Breakdown */}
            <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-sm space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-brand-accent" />
                    Regulatory Levies & Brokerage Schedule
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    Exact statutory fee schedule modeled on Zerodha & Angel One rates
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                <div className="p-3.5 rounded-2xl bg-bg-secondary border border-border-subtle space-y-2">
                  <div className="font-bold text-text-primary flex items-center justify-between">
                    <span>Brokerage Charges</span>
                    <Badge variant="accent" size="sm">₹20 / order</Badge>
                  </div>
                  <p className="text-text-muted text-[11px] leading-relaxed">
                    Flat ₹20 or 0.03% (whichever is lower) per executed order for Intraday (MIS). Delivery (CNC) equity is zero or flat ₹20 depending on broker tariff plan.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-bg-secondary border border-border-subtle space-y-2">
                  <div className="font-bold text-text-primary flex items-center justify-between">
                    <span>STT / CTT</span>
                    <Badge variant="neutral" size="sm">Govt Tax</Badge>
                  </div>
                  <p className="text-text-muted text-[11px] leading-relaxed">
                    Securities Transaction Tax: 0.025% on Intraday SELL turnover; 0.1% on both BUY and SELL turnover for Delivery (CNC).
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-bg-secondary border border-border-subtle space-y-2">
                  <div className="font-bold text-text-primary flex items-center justify-between">
                    <span>Exchange Turnover Charges</span>
                    <Badge variant="neutral" size="sm">NSE: 0.00297%</Badge>
                  </div>
                  <p className="text-text-muted text-[11px] leading-relaxed">
                    Exchange transaction charges levied by the National Stock Exchange of India (NSE) or BSE on aggregate turnover.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-bg-secondary border border-border-subtle space-y-2">
                  <div className="font-bold text-text-primary flex items-center justify-between">
                    <span>Goods & Services Tax (GST)</span>
                    <Badge variant="neutral" size="sm">18%</Badge>
                  </div>
                  <p className="text-text-muted text-[11px] leading-relaxed">
                    18% GST levied on (Brokerage + Exchange Transaction Charges + SEBI Charges). Not applied on turnover or STT.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-bg-secondary border border-border-subtle space-y-2">
                  <div className="font-bold text-text-primary flex items-center justify-between">
                    <span>SEBI Turnover Fees</span>
                    <Badge variant="neutral" size="sm">₹10 / Crore</Badge>
                  </div>
                  <p className="text-text-muted text-[11px] leading-relaxed">
                    Regulatory charges paid to the Securities and Exchange Board of India for market surveillance.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-bg-secondary border border-border-subtle space-y-2">
                  <div className="font-bold text-text-primary flex items-center justify-between">
                    <span>Stamp Duty (Stamp Act)</span>
                    <Badge variant="neutral" size="sm">0.003% / 0.015%</Badge>
                  </div>
                  <p className="text-text-muted text-[11px] leading-relaxed">
                    Govt Stamp Duty charged only on the BUY leg: 0.003% for Intraday (MIS) and 0.015% for Delivery (CNC).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SEBI 5x Peak Margin Rule Educational Alert */}
          <div className="p-5 rounded-3xl bg-bg-card border border-border-subtle space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-text-primary">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              SEBI Peak Margin Regulations in Indian Markets
            </div>
            <p className="text-text-secondary leading-relaxed">
              Under SEBI circular SEBI/HO/MRD2/DCAP/CIR/P/2020/127, brokers in India are restricted from offering unlimited intraday leverage.
              The maximum leverage for Intraday MIS equity is capped at <b>5x</b> (i.e. minimum <b>20% upfront Value at Risk + Extreme Loss margin</b>).
              TRADEWISE accurately enforces this 5x cap to teach beginners disciplined position sizing and prevent margin deficit penalties.
            </p>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: MODIFY SL & TARGET FOR OPEN POSITION              */}
      {/* ======================================================== */}
      {editingPosition && (
        <Modal
          isOpen={!!editingPosition}
          onClose={() => setEditingPosition(null)}
          title={
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-brand-accent" />
              <span>Modify Stop Loss & Target</span>
            </div>
          }
          subtitle={\`\${editingPosition.stockSymbol} • \${editingPosition.productType} • Qty: \${editingPosition.quantity}\`}
          maxWidth="md"
        >
          <form onSubmit={handleSaveSLTarget} className="space-y-4">
            <div className="p-3 rounded-xl bg-bg-secondary border border-border-subtle flex justify-between text-xs">
              <div>
                <span className="text-text-muted">Entry Avg: </span>
                <span className="font-bold font-mono text-text-primary">₹{editingPosition.avgPrice.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-text-muted">LTP: </span>
                <span className="font-bold font-mono text-text-primary">₹{editingPosition.currentPrice.toFixed(2)}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Stop Loss Price (₹)
              </label>
              <Input
                type="number"
                step="0.05"
                placeholder="e.g. 2450.00"
                value={editSL}
                onChange={e => setEditSL(e.target.value)}
              />
              <p className="text-[11px] text-text-muted mt-1">
                {editingPosition.direction === 'BUY'
                  ? 'Exit to limit losses if stock drops below this price'
                  : 'Exit to limit losses if stock rises above this price'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Target / Take Profit Price (₹)
              </label>
              <Input
                type="number"
                step="0.05"
                placeholder="e.g. 2600.00"
                value={editTarget}
                onChange={e => setEditTarget(e.target.value)}
              />
              <p className="text-[11px] text-text-muted mt-1">
                Lock in profits when price achieves your target objective
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => setEditingPosition(null)}
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Update Bracket
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD CUSTOM VIRTUAL FUNDS                          */}
      {/* ======================================================== */}
      {isAddFundsModalOpen && (
        <Modal
          isOpen={isAddFundsModalOpen}
          onClose={() => setIsAddFundsModalOpen(false)}
          title={
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-brand-accent" />
              <span>Add Virtual Capital</span>
            </div>
          }
          subtitle="Deposit virtual funds to practice sizing with larger account sizes"
          maxWidth="md"
        >
          <form onSubmit={handleCustomAddFunds} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-text-secondary">
                Select Quick Amount
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[25000, 50000, 100000, 200000, 500000, 1000000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCustomFundAmount(amt.toString())}
                    className={\`p-2.5 rounded-xl border text-xs font-mono font-bold transition-all \${
                      customFundAmount === amt.toString()
                        ? 'bg-brand-accent text-white border-brand-accent'
                        : 'bg-bg-secondary text-text-primary border-border-subtle hover:border-border-default'
                    }\`}
                  >
                    +₹{(amt / 100000) >= 1 ? \`\${amt / 100000} Lakh\` : \`\${amt / 1000}k\`}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Or Enter Custom Deposit Amount (₹)
              </label>
              <Input
                type="number"
                min="100"
                step="100"
                placeholder="e.g. 50000"
                value={customFundAmount}
                onChange={e => setCustomFundAmount(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => setIsAddFundsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Add Virtual Cash
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
`);

fs.writeFileSync('src/pages/PaperTradingPage.tsx', chunks.join(''), 'utf8');
console.log('Successfully written src/pages/PaperTradingPage.tsx from chunks!');
