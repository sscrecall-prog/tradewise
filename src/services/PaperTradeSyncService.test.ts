import { describe, it, expect } from 'vitest';
import { PaperTradeSyncService } from './PaperTradeSyncService';
import { MarketDataService } from './MarketDataService';
import { ClosedPaperTrade, PaperPosition, PaperOrder, MarketQuote } from '../types';

describe('PaperTradeSyncService', () => {
  const sampleClosedTrade: ClosedPaperTrade = {
    id: 'cpt-hindalco-1',
    stockSymbol: 'HINDALCO',
    stockName: 'Hindalco Industries Limited',
    direction: 'BUY',
    productType: 'INTRADAY (MIS)',
    quantity: 250,
    entryPrice: 145.50,
    exitPrice: 182.00,
    stopLoss: 125.00,
    targetPrice: 190.00,
    openedAt: '2026-09-08T09:30:00Z',
    closedAt: '2026-09-08T09:47:00Z',
    holdingMinutes: 17,
    grossPnL: 9125,
    netPnL: 9082.50,
    charges: 42.50,
    maePrice: 138.00,
    mfePrice: 195.00
  };

  const sampleActivePosition: PaperPosition = {
    id: 'pos-reliance-1',
    stockSymbol: 'RELIANCE',
    stockName: 'Reliance Industries Ltd.',
    direction: 'BUY',
    quantity: 20,
    avgPrice: 2950.00,
    currentPrice: 2980.00,
    stopLoss: 2930.00,
    targetPrice: 3000.00,
    unrealizedPnL: 600,
    unrealizedPnLPercent: 1.01,
    productType: 'INTRADAY (MIS)',
    openedAt: new Date(Date.now() - 25 * 60000).toISOString(),
    marginAllocated: 11800,
    leverage: 5,
    buyCharges: 15.50
  };

  it('correctly normalizes a closed paper trade for Journal auto-fill', () => {
    const syncData = PaperTradeSyncService.fromClosedPosition(sampleClosedTrade);

    expect(syncData.stockSymbol).toBe('HINDALCO');
    expect(syncData.quantity).toBe(250);
    expect(syncData.entryPrice).toBe(145.50);
    expect(syncData.exitPrice).toBe(182.00);
    expect(syncData.stopLoss).toBe(125.00);
    expect(syncData.targetPrice).toBe(190.00);
    expect(syncData.holdingMinutes).toBe(17);
    expect(syncData.direction).toBe('BUY');
    expect(syncData.segment).toBe('EQUITY_MIS');
    expect(syncData.tradeStatus).toBe('CLOSED');
    expect(syncData.maePrice).toBe(138.00);
    expect(syncData.mfePrice).toBe(195.00);
  });

  it('correctly finds today paper trade for a given symbol', () => {
    const result = PaperTradeSyncService.getLatestPaperTradeForSymbol('HINDALCO', {
      closedPaperTrades: [sampleClosedTrade],
      paperPositions: [sampleActivePosition],
      paperOrders: []
    });

    expect(result).not.toBeNull();
    expect(result?.stockSymbol).toBe('HINDALCO');
    expect(result?.entryPrice).toBe(145.50);
    expect(result?.exitPrice).toBe(182.00);
    expect(result?.quantity).toBe(250);
    expect(result?.holdingMinutes).toBe(17);
  });

  it('prioritizes closed paper trade over open active position if both exist', () => {
    const activeHindalco: PaperPosition = {
      id: 'pos-hindalco-active',
      stockSymbol: 'HINDALCO',
      stockName: 'Hindalco Industries Limited',
      direction: 'BUY',
      quantity: 100,
      avgPrice: 150.00,
      currentPrice: 155.00,
      productType: 'INTRADAY (MIS)',
      openedAt: new Date().toISOString(),
      marginAllocated: 3000,
      leverage: 5,
      buyCharges: 10,
      unrealizedPnL: 500,
      unrealizedPnLPercent: 3.3
    };

    const result = PaperTradeSyncService.getLatestPaperTradeForSymbol('HINDALCO', {
      closedPaperTrades: [sampleClosedTrade],
      paperPositions: [activeHindalco],
      paperOrders: []
    });

    // Should return closed position with exact 250 qty and 145.50 entry
    expect(result?.source).toBe('CLOSED_POSITION');
    expect(result?.quantity).toBe(250);
    expect(result?.entryPrice).toBe(145.50);
  });

  it('returns active position when no closed position exists', () => {
    const result = PaperTradeSyncService.getLatestPaperTradeForSymbol('RELIANCE', {
      closedPaperTrades: [],
      paperPositions: [sampleActivePosition],
      paperOrders: []
    });

    expect(result).not.toBeNull();
    expect(result?.stockSymbol).toBe('RELIANCE');
    expect(result?.entryPrice).toBe(2950.00);
    expect(result?.quantity).toBe(20);
    expect(result?.stopLoss).toBe(2930.00);
    expect(result?.targetPrice).toBe(3000.00);
  });

  it('aggregates all today paper trades across closed and active sources without duplicates', () => {
    const all = PaperTradeSyncService.getTodayPaperTrades({
      closedPaperTrades: [sampleClosedTrade],
      paperPositions: [sampleActivePosition],
      paperOrders: []
    });

    expect(all.length).toBe(2);
    const symbols = all.map(t => t.stockSymbol);
    expect(symbols).toContain('HINDALCO');
    expect(symbols).toContain('RELIANCE');
  });
});

describe('Auto Square-Off Breach Conditions', () => {
  const buyPos: PaperPosition = {
    id: 'pos-test-buy',
    stockSymbol: 'ADANIPORTS',
    stockName: 'Adani Ports Ltd.',
    direction: 'BUY',
    quantity: 100,
    avgPrice: 1700.00,
    currentPrice: 1700.00,
    stopLoss: 1650.00,
    targetPrice: 1800.00,
    unrealizedPnL: 0,
    unrealizedPnLPercent: 0,
    productType: 'INTRADAY (MIS)',
    openedAt: new Date().toISOString(),
    marginAllocated: 34000,
    leverage: 5,
    buyCharges: 20
  };

  const sellPos: PaperPosition = {
    id: 'pos-test-sell',
    stockSymbol: 'TATASTEEL',
    stockName: 'Tata Steel Ltd.',
    direction: 'SELL',
    quantity: 200,
    avgPrice: 150.00,
    currentPrice: 150.00,
    stopLoss: 160.00,
    targetPrice: 140.00,
    unrealizedPnL: 0,
    unrealizedPnLPercent: 0,
    productType: 'INTRADAY (MIS)',
    openedAt: new Date().toISOString(),
    marginAllocated: 6000,
    leverage: 5,
    buyCharges: 10
  };

  function checkBreach(pos: PaperPosition, price: number): 'TARGET' | 'STOP_LOSS' | null {
    if (pos.direction === 'BUY') {
      if (pos.targetPrice && price >= pos.targetPrice) return 'TARGET';
      if (pos.stopLoss && price <= pos.stopLoss) return 'STOP_LOSS';
    } else {
      if (pos.targetPrice && price <= pos.targetPrice) return 'TARGET';
      if (pos.stopLoss && price >= pos.stopLoss) return 'STOP_LOSS';
    }
    return null;
  }

  it('triggers TARGET on BUY position when price touches or exceeds targetPrice', () => {
    expect(checkBreach(buyPos, 1750.00)).toBeNull();
    expect(checkBreach(buyPos, 1800.00)).toBe('TARGET');
    expect(checkBreach(buyPos, 1805.00)).toBe('TARGET');
  });

  it('triggers STOP_LOSS on BUY position when price touches or falls below stopLoss', () => {
    expect(checkBreach(buyPos, 1660.00)).toBeNull();
    expect(checkBreach(buyPos, 1650.00)).toBe('STOP_LOSS');
    expect(checkBreach(buyPos, 1640.00)).toBe('STOP_LOSS');
  });

  it('triggers TARGET on SELL position when price touches or falls below targetPrice', () => {
    expect(checkBreach(sellPos, 145.00)).toBeNull();
    expect(checkBreach(sellPos, 140.00)).toBe('TARGET');
    expect(checkBreach(sellPos, 138.00)).toBe('TARGET');
  });

  it('triggers STOP_LOSS on SELL position when price touches or rises above stopLoss', () => {
    expect(checkBreach(sellPos, 155.00)).toBeNull();
    expect(checkBreach(sellPos, 160.00)).toBe('STOP_LOSS');
    expect(checkBreach(sellPos, 165.00)).toBe('STOP_LOSS');
  });
});

describe('Live MarketDataService Micro-Tick Engine', () => {
  const sampleQuote: MarketQuote = {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd.',
    price: 1300.00,
    change: 0,
    changePercent: 0,
    open: 1300.00,
    high: 1310.00,
    low: 1290.00,
    close: 1300.00,
    prevClose: 1300.00,
    volume: 5000000,
    high52W: 1600.00,
    low52W: 1200.00,
    sector: 'Energy',
    sparkline: [1300, 1300, 1300],
    lastUpdated: '10:00:00 AM'
  };

  it('applies realistic micro-ticks within boundary constraints', () => {
    const ticked = MarketDataService.applyMicroTick([sampleQuote]);
    expect(ticked.length).toBe(1);
    const q = ticked[0];
    expect(q.price).toBeGreaterThan(sampleQuote.prevClose * 0.90);
    expect(q.price).toBeLessThan(sampleQuote.prevClose * 1.10);
    expect(q.sparkline.length).toBeGreaterThan(0);
  });
});
