const fs = require('fs');
const lessons = fs.readFileSync('builder/data_lessons.json', 'utf8');
const journal = fs.readFileSync('builder/data_journal.json', 'utf8');

const code = `import {
  JournalEntry,
  PaperOrder,
  PaperPosition,
  PaperPortfolio,
  TradingPreferences,
  UserProfile,
  AppSettings,
  AcademyLesson,
  TradePlan
} from '../types';
import { StorageService } from './StorageService';

export class DemoDataSeeder {
  static getInitialWatchlist(): string[] {
    return ['RELIANCE', 'HDFCBANK', 'TCS', 'INFY', 'ICICIBANK', 'SBIN', 'TATAMOTORS'];
  }

  static getInitialPreferences(): TradingPreferences {
    return {
      defaultCapital: 100000,
      defaultRiskPercentage: 1.0,
      maxDailyLoss: 1000,
      maxTradesPerDay: 2,
      preferredSetup: 'Breakout',
      strictWarningThresholds: true,
      defaultBrokeragePerOrder: 20
    };
  }

  static getInitialProfile(): UserProfile {
    return {
      name: 'Rohan Sharma',
      tradingStyle: 'Intraday Trader',
      experienceLevel: 'Beginner (< 1 Year)',
      joinedDate: '2026-08-01'
    };
  }

  static getInitialSettings(): AppSettings {
    return {
      theme: 'dark',
      currency: 'INR',
      currencySymbol: '₹',
      soundEnabled: true,
      autoRefreshData: true,
      refreshIntervalSeconds: 5
    };
  }

  static getInitialJournal(): JournalEntry[] {
    return ${journal};
  }

  static getInitialPaperPortfolio(): PaperPortfolio {
    return {
      initialCapital: 100000,
      cashBalance: 78500,
      usedMargin: 21500,
      realizedPnL: 4250,
      unrealizedPnL: 580,
      totalPortfolioValue: 104830
    };
  }

  static getInitialPaperPositions(): PaperPosition[] {
    return [
      {
        id: 'pos-1',
        stockSymbol: 'RELIANCE',
        stockName: 'Reliance Industries Ltd.',
        direction: 'BUY',
        quantity: 5,
        avgPrice: 2960.00,
        currentPrice: 2985.40,
        stopLoss: 2940.00,
        targetPrice: 3000.00,
        unrealizedPnL: 127.00,
        unrealizedPnLPercent: 0.86,
        productType: 'INTRADAY (MIS)',
        openedAt: '2026-09-01T09:35:00Z'
      },
      {
        id: 'pos-2',
        stockSymbol: 'TATAMOTORS',
        stockName: 'Tata Motors Ltd.',
        direction: 'BUY',
        quantity: 20,
        avgPrice: 1002.10,
        currentPrice: 1024.75,
        stopLoss: 990.00,
        targetPrice: 1030.00,
        unrealizedPnL: 453.00,
        unrealizedPnLPercent: 2.26,
        productType: 'INTRADAY (MIS)',
        openedAt: '2026-09-01T10:05:00Z'
      }
    ];
  }

  static getInitialPaperOrders(): PaperOrder[] {
    return [
      {
        id: 'ord-1',
        stockSymbol: 'RELIANCE',
        stockName: 'Reliance Industries Ltd.',
        direction: 'BUY',
        orderType: 'MARKET',
        productType: 'INTRADAY (MIS)',
        quantity: 5,
        price: 2960.00,
        executedPrice: 2960.00,
        stopLoss: 2940.00,
        targetPrice: 3000.00,
        status: 'EXECUTED',
        timestamp: '2026-09-01 09:35:12'
      },
      {
        id: 'ord-2',
        stockSymbol: 'TATAMOTORS',
        stockName: 'Tata Motors Ltd.',
        direction: 'BUY',
        orderType: 'MARKET',
        productType: 'INTRADAY (MIS)',
        quantity: 20,
        price: 1002.10,
        executedPrice: 1002.10,
        stopLoss: 990.00,
        targetPrice: 1030.00,
        status: 'EXECUTED',
        timestamp: '2026-09-01 10:05:44'
      },
      {
        id: 'ord-3',
        stockSymbol: 'INFY',
        stockName: 'Infosys Ltd.',
        direction: 'BUY',
        orderType: 'LIMIT',
        productType: 'INTRADAY (MIS)',
        quantity: 15,
        price: 1830.00,
        stopLoss: 1815.00,
        targetPrice: 1860.00,
        status: 'PENDING',
        timestamp: '2026-09-01 11:20:00'
      }
    ];
  }

  static getInitialAcademyLessons(): AcademyLesson[] {
    return ${lessons};
  }

  static async seedInitialData(): Promise<void> {
    const existingWatchlist = await StorageService.getAll('watchlist');
    if (existingWatchlist.length === 0) {
      const watchlistItems = this.getInitialWatchlist().map(symbol => ({ id: symbol, symbol, addedAt: new Date().toISOString() }));
      await StorageService.saveAll('watchlist', watchlistItems);
    }

    const existingPrefs = await StorageService.getAll('preferences');
    if (existingPrefs.length === 0) {
      await StorageService.save('preferences', { id: 'user_prefs', ...this.getInitialPreferences() });
    }

    const existingProfile = await StorageService.getAll('profile');
    if (existingProfile.length === 0) {
      await StorageService.save('profile', { id: 'user_profile', ...this.getInitialProfile() });
    }

    const existingSettings = await StorageService.getAll('settings');
    if (existingSettings.length === 0) {
      await StorageService.save('settings', { id: 'app_settings', ...this.getInitialSettings() });
    }

    const existingJournal = await StorageService.getAll('journal');
    if (existingJournal.length === 0) {
      await StorageService.saveAll('journal', this.getInitialJournal());
    }

    const existingPaperPortfolio = await StorageService.getAll('paperPortfolio');
    if (existingPaperPortfolio.length === 0) {
      await StorageService.save('paperPortfolio', { id: 'portfolio_main', ...this.getInitialPaperPortfolio() });
    }

    const existingPaperPositions = await StorageService.getAll('paperPositions');
    if (existingPaperPositions.length === 0) {
      await StorageService.saveAll('paperPositions', this.getInitialPaperPositions());
    }

    const existingPaperOrders = await StorageService.getAll('paperOrders');
    if (existingPaperOrders.length === 0) {
      await StorageService.saveAll('paperOrders', this.getInitialPaperOrders());
    }

    const existingAcademy = await StorageService.getAll('academy');
    if (existingAcademy.length === 0) {
      await StorageService.saveAll('academy', this.getInitialAcademyLessons());
    }
  }

  static async resetToDemoData(): Promise<void> {
    const stores = [
      'watchlist',
      'journal',
      'tradePlans',
      'paperOrders',
      'paperPositions',
      'paperPortfolio',
      'preferences',
      'profile',
      'settings',
      'academy'
    ];
    for (const store of stores) {
      await StorageService.clearStore(store);
    }
    await this.seedInitialData();
  }
}
`;

fs.writeFileSync('src/services/DemoDataSeeder.ts', code);
console.log('src/services/DemoDataSeeder.ts generated successfully');
