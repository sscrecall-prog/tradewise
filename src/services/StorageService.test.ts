import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { StorageService } from './StorageService';
import { AudioService } from './AudioService';

// In-memory localStorage mock for node test runner
const memoryStore = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => memoryStore.get(key) || null,
  setItem: (key: string, value: string) => memoryStore.set(key, value),
  removeItem: (key: string) => memoryStore.delete(key),
  clear: () => memoryStore.clear()
};

beforeAll(() => {
  (globalThis as any).localStorage = localStorageMock;
});

describe('StorageService & Fallback Resiliency', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should save and retrieve items using fallback when indexedDB is mocked/absent', async () => {
    const testOrder = {
      id: 'test-ord-1',
      stockSymbol: 'COALINDIA',
      stockName: 'Coal India Ltd',
      direction: 'SELL' as const,
      orderType: 'MARKET' as const,
      productType: 'INTRADAY (MIS)' as const,
      quantity: 500,
      price: 418.60,
      executedPrice: 418.60,
      status: 'EXECUTED' as const,
      timestamp: '08/09/2026, 11:15:00 am'
    };

    await StorageService.save('paperOrders', testOrder);
    const orders = await StorageService.getAll<typeof testOrder>('paperOrders');

    expect(orders.length).toBe(1);
    expect(orders[0].id).toBe('test-ord-1');
    expect(orders[0].stockSymbol).toBe('COALINDIA');
    expect(orders[0].price).toBe(418.60);
  });

  it('should saveAll and clearStore reliably', async () => {
    const items = [
      { id: 'pos-1', stockSymbol: 'RELIANCE', quantity: 50 },
      { id: 'pos-2', stockSymbol: 'TCS', quantity: 20 }
    ];

    await StorageService.saveAll('paperPositions', items);
    let positions = await StorageService.getAll<{ id: string; stockSymbol: string }>('paperPositions');
    expect(positions.length).toBe(2);

    await StorageService.delete('paperPositions', 'pos-1');
    positions = await StorageService.getAll<{ id: string; stockSymbol: string }>('paperPositions');
    expect(positions.length).toBe(1);
    expect(positions[0].id).toBe('pos-2');

    await StorageService.clearStore('paperPositions');
    positions = await StorageService.getAll<{ id: string; stockSymbol: string }>('paperPositions');
    expect(positions.length).toBe(0);
  });

  it('should export all data and import backup cleanly', async () => {
    const testTrade = {
      id: 'cpt-123',
      stockSymbol: 'INFY',
      direction: 'BUY',
      quantity: 100
    };
    await StorageService.save('closedPaperTrades', testTrade as any);

    const jsonBackup = await StorageService.exportAllData();
    expect(jsonBackup).toContain('INFY');

    const result = await StorageService.importAllData(jsonBackup);
    expect(result.success).toBe(true);
  });
});

describe('AudioService', () => {
  it('should safely execute playOrderChime without throwing in headless environments', () => {
    expect(() => AudioService.playOrderChime()).not.toThrow();
  });

  it('should safely execute playSquareOffChime without throwing', () => {
    expect(() => AudioService.playSquareOffChime()).not.toThrow();
  });

  it('should safely execute playErrorSound without throwing', () => {
    expect(() => AudioService.playErrorSound()).not.toThrow();
  });
});
