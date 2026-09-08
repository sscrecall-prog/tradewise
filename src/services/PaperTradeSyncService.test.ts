import { describe, it, expect } from 'vitest';
import { PaperTradeSyncService } from './PaperTradeSyncService';
import { ClosedPaperTrade, PaperPosition, PaperOrder } from '../types';

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
