import { describe, it, expect } from 'vitest';
import { IntradayConfirmationService } from './IntradayConfirmationService';
import { MarketQuote } from '../types';

describe('IntradayConfirmationService', () => {
  const mockBullishStock: MarketQuote = {
    symbol: 'TATASTEEL',
    name: 'Tata Steel Ltd.',
    price: 154.50,
    change: 4.80,
    changePercent: 3.21,
    open: 149.70,
    high: 155.00,
    low: 149.70, // Open = Low Pavitra Setup
    close: 154.50,
    prevClose: 149.70,
    volume: 12500000,
    high52W: 180.00,
    low52W: 115.00,
    sector: 'Metals & Mining',
    sparkline: [150, 151, 152, 153, 154.5],
    lastUpdated: '11:15:00'
  };

  const mockBearishStock: MarketQuote = {
    symbol: 'WIPRO',
    name: 'Wipro Ltd.',
    price: 460.00,
    change: -15.00,
    changePercent: -3.16,
    open: 475.00,
    high: 475.00, // Open = High Pavitra Setup
    low: 458.00,
    close: 460.00,
    prevClose: 475.00,
    volume: 8500000,
    high52W: 580.00,
    low52W: 420.00,
    sector: 'Information Tech',
    sparkline: [475, 470, 465, 462, 460],
    lastUpdated: '11:15:00'
  };

  it('should generate a STRONG_BUY verdict for a stock with Open=Low, positive VWAP, and high Alpha', () => {
    const report = IntradayConfirmationService.analyzeStock(mockBullishStock, 0.5, 1.2);

    expect(report.symbol).toBe('TATASTEEL');
    expect(report.openDrive).toBe('OPEN_LOW');
    expect(report.score).toBeGreaterThanOrEqual(80);
    expect(report.verdict).toBe('STRONG_BUY');
    expect(report.pillars.length).toBe(6);

    // VWAP should be below price
    expect(report.price).toBeGreaterThan(report.vwap);

    // Blueprint should be BUY with valid targets
    expect(report.blueprint.action).toBe('BUY');
    expect(report.blueprint.target1).toBeGreaterThan(report.blueprint.entryPrice);
    expect(report.blueprint.stopLoss).toBeLessThan(report.blueprint.entryPrice);
    expect(report.blueprint.riskRewardRatio).toBe('1 : 1.5');
    expect(report.blueprint.netProfitTarget1).toBeGreaterThan(0);
  });

  it('should generate a STRONG_SELL verdict for a stock with Open=High and negative trend', () => {
    const report = IntradayConfirmationService.analyzeStock(mockBearishStock, 0.5, -1.5);

    expect(report.symbol).toBe('WIPRO');
    expect(report.openDrive).toBe('OPEN_HIGH');
    expect(report.score).toBeLessThanOrEqual(25);
    expect(report.verdict).toBe('STRONG_SELL');

    // VWAP should be above price
    expect(report.price).toBeLessThan(report.vwap);

    // Blueprint should be SELL with SL above price
    expect(report.blueprint.action).toBe('SELL');
    expect(report.blueprint.stopLoss).toBeGreaterThan(report.blueprint.entryPrice);
    expect(report.blueprint.target1).toBeLessThan(report.blueprint.entryPrice);
  });

  it('should calculate Central Pivot Range (CPR) and Camarilla levels accurately', () => {
    const report = IntradayConfirmationService.analyzeStock(mockBullishStock);

    expect(report.cpr.pivot).toBeGreaterThan(0);
    expect(report.cpr.bottomCPR).toBeGreaterThan(0);
    expect(report.cpr.topCPR).toBeGreaterThan(0);
    expect(['NARROW', 'MODERATE', 'WIDE']).toContain(report.cpr.cprType);

    expect(report.camarilla.h4).toBeGreaterThan(report.camarilla.h3);
    expect(report.camarilla.l3).toBeGreaterThan(report.camarilla.l4);
  });

  it('should rank top buys and top sells in scanTopSetups', () => {
    const quotes = [mockBullishStock, mockBearishStock];
    const { topBuys, topSells } = IntradayConfirmationService.scanTopSetups(quotes, 0.5);

    expect(topBuys.length).toBeGreaterThanOrEqual(1);
    expect(topBuys[0].symbol).toBe('TATASTEEL');

    expect(topSells.length).toBeGreaterThanOrEqual(1);
    expect(topSells[0].symbol).toBe('WIPRO');
  });
});
