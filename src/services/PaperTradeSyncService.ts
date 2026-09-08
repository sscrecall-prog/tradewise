import { TradeDirection, TradeStatus, ClosedPaperTrade, PaperPosition, PaperOrder } from '../types';
import { TradePulseStorage } from './tradepulse/tradePulseStorage';
import { PaperTrade } from '../types/tradepulse';

export interface PaperTradeSyncData {
  id: string;
  source: 'CLOSED_POSITION' | 'ACTIVE_POSITION' | 'ORDER_BOOK' | 'TRADEPULSE';
  sourceLabel: string;
  stockSymbol: string;
  stockName: string;
  direction: TradeDirection;
  segment: 'OPTIONS' | 'EQUITY_MIS' | 'EQUITY_CNC' | 'FUTURES';
  quantity: number;
  entryPrice: number;
  exitPrice?: number;
  stopLoss?: number;
  targetPrice?: number;
  holdingMinutes: number;
  tradeStatus: TradeStatus;
  tradeDate: string;
  tradeTime: string;
  maePrice?: number;
  mfePrice?: number;
  grossPnL?: number;
  netPnL?: number;
}

export class PaperTradeSyncService {
  /**
   * Convert a ClosedPaperTrade into normalized sync data
   */
  static fromClosedPosition(closed: ClosedPaperTrade): PaperTradeSyncData {
    const closedDate = closed.closedAt ? new Date(closed.closedAt) : new Date();
    const tradeDate = !isNaN(closedDate.getTime())
      ? closedDate.toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
    const tradeTime = !isNaN(closedDate.getTime())
      ? `${String(closedDate.getHours()).padStart(2, '0')}:${String(closedDate.getMinutes()).padStart(2, '0')}`
      : '14:30';

    return {
      id: closed.id,
      source: 'CLOSED_POSITION',
      sourceLabel: 'Closed Paper Trade',
      stockSymbol: closed.stockSymbol.toUpperCase(),
      stockName: closed.stockName,
      direction: closed.direction,
      segment: closed.productType === 'DELIVERY (CNC)' ? 'EQUITY_CNC' : 'EQUITY_MIS',
      quantity: closed.quantity,
      entryPrice: closed.entryPrice,
      exitPrice: closed.exitPrice,
      stopLoss: closed.stopLoss,
      targetPrice: closed.targetPrice,
      holdingMinutes: closed.holdingMinutes || 15,
      tradeStatus: 'CLOSED',
      tradeDate,
      tradeTime,
      maePrice: closed.maePrice,
      mfePrice: closed.mfePrice,
      grossPnL: closed.grossPnL,
      netPnL: closed.netPnL
    };
  }

  /**
   * Convert an Active PaperPosition into normalized sync data
   */
  static fromActivePosition(pos: PaperPosition, livePrice?: number): PaperTradeSyncData {
    const openedDate = pos.openedAt ? new Date(pos.openedAt) : new Date();
    const tradeDate = !isNaN(openedDate.getTime())
      ? openedDate.toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
    const tradeTime = !isNaN(openedDate.getTime())
      ? `${String(openedDate.getHours()).padStart(2, '0')}:${String(openedDate.getMinutes()).padStart(2, '0')}`
      : '10:15';

    const holdingMins = !isNaN(openedDate.getTime())
      ? Math.max(1, Math.round((Date.now() - openedDate.getTime()) / 60000))
      : 20;

    const currentPrice = livePrice || pos.currentPrice || pos.avgPrice;
    const priceDiff = pos.direction === 'BUY' ? currentPrice - pos.avgPrice : pos.avgPrice - currentPrice;
    const grossPnL = Math.round(priceDiff * pos.quantity * 100) / 100;

    // Realistic excursion estimates
    const isBuy = pos.direction === 'BUY';
    const estimatedMae = isBuy
      ? Math.round(Math.min(pos.avgPrice, pos.stopLoss || pos.avgPrice * 0.985) * 100) / 100
      : Math.round(Math.max(pos.avgPrice, pos.stopLoss || pos.avgPrice * 1.015) * 100) / 100;
    const estimatedMfe = isBuy
      ? Math.round(Math.max(currentPrice, pos.targetPrice || pos.avgPrice * 1.025) * 100) / 100
      : Math.round(Math.min(currentPrice, pos.targetPrice || pos.avgPrice * 0.975) * 100) / 100;

    return {
      id: pos.id,
      source: 'ACTIVE_POSITION',
      sourceLabel: 'Active Paper Position',
      stockSymbol: pos.stockSymbol.toUpperCase(),
      stockName: pos.stockName,
      direction: pos.direction,
      segment: pos.productType === 'DELIVERY (CNC)' ? 'EQUITY_CNC' : 'EQUITY_MIS',
      quantity: pos.quantity,
      entryPrice: pos.avgPrice,
      exitPrice: currentPrice,
      stopLoss: pos.stopLoss,
      targetPrice: pos.targetPrice,
      holdingMinutes: holdingMins,
      tradeStatus: 'CLOSED', // Default to CLOSED for quick journal logging
      tradeDate,
      tradeTime,
      maePrice: estimatedMae,
      mfePrice: estimatedMfe,
      grossPnL,
      netPnL: pos.netPnL || grossPnL
    };
  }

  /**
   * Convert an executed PaperOrder pair into normalized sync data
   */
  static fromOrder(order: PaperOrder, exitOrder?: PaperOrder, livePrice?: number): PaperTradeSyncData {
    const entryPrice = order.executedPrice || order.price;
    const exitPrice = exitOrder ? (exitOrder.executedPrice || exitOrder.price) : (livePrice || entryPrice);

    return {
      id: order.id,
      source: 'ORDER_BOOK',
      sourceLabel: 'Paper Order Book',
      stockSymbol: order.stockSymbol.toUpperCase(),
      stockName: order.stockName,
      direction: order.direction,
      segment: order.productType === 'DELIVERY (CNC)' ? 'EQUITY_CNC' : 'EQUITY_MIS',
      quantity: order.quantity,
      entryPrice,
      exitPrice,
      stopLoss: order.stopLoss,
      targetPrice: order.targetPrice,
      holdingMinutes: 25,
      tradeStatus: 'CLOSED',
      tradeDate: new Date().toISOString().split('T')[0],
      tradeTime: '11:30'
    };
  }

  /**
   * Convert a TradePulse PaperTrade into normalized sync data
   */
  static fromTradePulse(tp: PaperTrade, livePrice?: number): PaperTradeSyncData {
    const tradeDate = tp.dateStr || new Date().toISOString().split('T')[0];
    const holdingMinutes = tp.timestamp
      ? Math.max(1, Math.round((Date.now() - tp.timestamp) / 60000))
      : 18;

    return {
      id: tp.id,
      source: 'TRADEPULSE',
      sourceLabel: 'TradePulse Paper Trade',
      stockSymbol: tp.symbol.toUpperCase(),
      stockName: tp.symbol,
      direction: tp.action,
      segment: 'EQUITY_MIS',
      quantity: tp.quantity,
      entryPrice: tp.entryPrice,
      exitPrice: tp.target1 || livePrice || tp.entryPrice,
      stopLoss: tp.stopLoss,
      targetPrice: tp.target1 || tp.target2,
      holdingMinutes,
      tradeStatus: 'CLOSED',
      tradeDate,
      tradeTime: '10:00'
    };
  }

  /**
   * Get all paper trades available for auto-filling today
   */
  static getTodayPaperTrades(params: {
    closedPaperTrades: ClosedPaperTrade[];
    paperPositions: PaperPosition[];
    paperOrders: PaperOrder[];
    liveQuotes?: { symbol: string; price: number }[];
  }): PaperTradeSyncData[] {
    const { closedPaperTrades, paperPositions, paperOrders, liveQuotes = [] } = params;
    const results: PaperTradeSyncData[] = [];
    const seenSymbols = new Set<string>();

    // 1. Closed paper positions (Highest priority because user has completed & closed the trade)
    for (const closed of closedPaperTrades) {
      const sym = closed.stockSymbol.toUpperCase();
      if (!seenSymbols.has(sym)) {
        results.push(this.fromClosedPosition(closed));
        seenSymbols.add(sym);
      }
    }

    // 2. Active paper positions
    for (const pos of paperPositions) {
      const sym = pos.stockSymbol.toUpperCase();
      if (!seenSymbols.has(sym)) {
        const quote = liveQuotes.find(q => q.symbol.toUpperCase() === sym);
        results.push(this.fromActivePosition(pos, quote?.price));
        seenSymbols.add(sym);
      }
    }

    // 3. TradePulse paper trades
    try {
      const tpTrades = TradePulseStorage.getPaperTrades();
      for (const tp of tpTrades) {
        const sym = tp.symbol.toUpperCase();
        if (!seenSymbols.has(sym)) {
          const quote = liveQuotes.find(q => q.symbol.toUpperCase() === sym);
          results.push(this.fromTradePulse(tp, quote?.price));
          seenSymbols.add(sym);
        }
      }
    } catch {
      // TradePulse storage optional
    }

    // 4. Executed paper orders
    for (const order of paperOrders) {
      if (order.status === 'EXECUTED') {
        const sym = order.stockSymbol.toUpperCase();
        if (!seenSymbols.has(sym)) {
          const quote = liveQuotes.find(q => q.symbol.toUpperCase() === sym);
          results.push(this.fromOrder(order, undefined, quote?.price));
          seenSymbols.add(sym);
        }
      }
    }

    return results;
  }

  /**
   * Find the most relevant paper trade for a given symbol
   */
  static getLatestPaperTradeForSymbol(
    symbol: string,
    params: {
      closedPaperTrades: ClosedPaperTrade[];
      paperPositions: PaperPosition[];
      paperOrders: PaperOrder[];
      liveQuotes?: { symbol: string; price: number }[];
    }
  ): PaperTradeSyncData | null {
    if (!symbol) return null;
    const cleanSym = symbol.trim().toUpperCase();

    // 1. Check closed positions first (latest closed)
    const closed = params.closedPaperTrades.find(c => c.stockSymbol.toUpperCase() === cleanSym);
    if (closed) {
      return this.fromClosedPosition(closed);
    }

    // 2. Check active positions
    const pos = params.paperPositions.find(p => p.stockSymbol.toUpperCase() === cleanSym);
    if (pos) {
      const quote = params.liveQuotes?.find(q => q.symbol.toUpperCase() === cleanSym);
      return this.fromActivePosition(pos, quote?.price);
    }

    // 3. Check TradePulse trades
    try {
      const tpTrades = TradePulseStorage.getPaperTrades();
      const tp = tpTrades.find(t => t.symbol.toUpperCase() === cleanSym);
      if (tp) {
        const quote = params.liveQuotes?.find(q => q.symbol.toUpperCase() === cleanSym);
        return this.fromTradePulse(tp, quote?.price);
      }
    } catch {
      // Ignore
    }

    // 4. Check paper orders
    const executedOrders = params.paperOrders.filter(
      o => o.stockSymbol.toUpperCase() === cleanSym && o.status === 'EXECUTED'
    );
    if (executedOrders.length > 0) {
      const entryOrder = executedOrders[0];
      const exitOrder = executedOrders.length > 1 ? executedOrders[1] : undefined;
      const quote = params.liveQuotes?.find(q => q.symbol.toUpperCase() === cleanSym);
      return this.fromOrder(entryOrder, exitOrder, quote?.price);
    }

    return null;
  }
}
