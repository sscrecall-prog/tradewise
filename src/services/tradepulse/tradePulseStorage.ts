import { DailySnapshot, PaperTrade } from '../../types/tradepulse';
import { DEFAULT_NIFTY_CSV, DEFAULT_NIFTY_100_CSV } from './defaultData';

const SNAPSHOTS_KEY = 'nifty_multi_snapshots_v2';
const ACTIVE_SNAPSHOT_KEY = 'nifty_multi_active_snapshot_v2';
const WATCHLIST_KEY = 'nifty_multi_watchlist_v2';

export const TradePulseStorage = {
  /**
   * Initializes default snapshot if storage is empty.
   */
  initStorage(): { snapshots: DailySnapshot[]; activeId: string } {
    try {
      const stored = localStorage.getItem(SNAPSHOTS_KEY);
      if (stored) {
        const snapshots: DailySnapshot[] = JSON.parse(stored);
        const activeId = localStorage.getItem(ACTIVE_SNAPSHOT_KEY) || snapshots[0]?.id || 'nifty-100-today';
        return { snapshots, activeId };
      }
    } catch (e) {
      console.error('Failed to load snapshots from storage', e);
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Snapshot 1: Official NIFTY 100 (100 stocks)
    const nifty100Snapshot: DailySnapshot = {
      id: 'nifty-100-today',
      dateStr: `NIFTY 100 Master (${todayStr})`,
      timestamp: Date.now() + 10,
      rawCsv: DEFAULT_NIFTY_100_CSV,
      stocksCount: 100,
      isCustom: false
    };

    // Snapshot 2: Official NIFTY 50 (50 stocks)
    const nifty50Snapshot: DailySnapshot = {
      id: 'nifty-50-today',
      dateStr: `NIFTY 50 Benchmark (${todayStr})`,
      timestamp: Date.now(),
      rawCsv: DEFAULT_NIFTY_CSV,
      stocksCount: 50,
      isCustom: false
    };

    const initial = [nifty100Snapshot, nifty50Snapshot];
    try {
      localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(initial));
      localStorage.setItem(ACTIVE_SNAPSHOT_KEY, nifty100Snapshot.id);
    } catch (e) {
      console.error('Storage write error', e);
    }

    return { snapshots: initial, activeId: nifty100Snapshot.id };
  },

  /**
   * Saves a new or updated snapshot.
   */
  saveSnapshot(snapshot: DailySnapshot): DailySnapshot[] {
    const { snapshots } = this.initStorage();
    const existingIndex = snapshots.findIndex(s => s.id === snapshot.id);

    let updated: DailySnapshot[];
    if (existingIndex >= 0) {
      updated = [...snapshots];
      updated[existingIndex] = snapshot;
    } else {
      updated = [snapshot, ...snapshots];
    }

    try {
      localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(updated));
      localStorage.setItem(ACTIVE_SNAPSHOT_KEY, snapshot.id);
    } catch (e) {
      console.error('Error saving snapshot', e);
    }

    return updated;
  },

  /**
   * Sets active snapshot ID.
   */
  setActiveSnapshotId(id: string): void {
    try {
      localStorage.setItem(ACTIVE_SNAPSHOT_KEY, id);
    } catch (e) {
      console.error('Error setting active snapshot', e);
    }
  },

  /**
   * Deletes a snapshot by ID.
   */
  deleteSnapshot(id: string): DailySnapshot[] {
    const { snapshots, activeId } = this.initStorage();
    const updated = snapshots.filter(s => s.id !== id);

    try {
      localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(updated));
      if (activeId === id && updated.length > 0) {
        localStorage.setItem(ACTIVE_SNAPSHOT_KEY, updated[0].id);
      }
    } catch (e) {
      console.error('Error deleting snapshot', e);
    }

    return updated;
  },

  /**
   * Watchlist functions
   */
  getWatchlist(): string[] {
    try {
      const stored = localStorage.getItem(WATCHLIST_KEY);
      return stored ? JSON.parse(stored) : ['RELIANCE', 'HDFCBANK', 'TATASTEEL', 'JSWSTEEL'];
    } catch (e) {
      return ['RELIANCE', 'HDFCBANK', 'TATASTEEL', 'JSWSTEEL'];
    }
  },

  toggleWatchlist(symbol: string): string[] {
    const list = this.getWatchlist();
    const exists = list.includes(symbol);
    const updated = exists ? list.filter(s => s !== symbol) : [...list, symbol];

    try {
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error writing watchlist', e);
    }

    return updated;
  },

  /**
   * Paper Trading functions
   */
  getPaperTrades(): PaperTrade[] {
    try {
      const stored = localStorage.getItem('nifty_paper_trades_v1');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  },

  addPaperTrade(trade: PaperTrade): PaperTrade[] {
    const trades = this.getPaperTrades();
    const updated = [trade, ...trades];
    try {
      localStorage.setItem('nifty_paper_trades_v1', JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving paper trade', e);
    }
    return updated;
  },

  deletePaperTrade(id: string): PaperTrade[] {
    const trades = this.getPaperTrades();
    const updated = trades.filter(t => t.id !== id);
    try {
      localStorage.setItem('nifty_paper_trades_v1', JSON.stringify(updated));
    } catch (e) {
      console.error('Error deleting paper trade', e);
    }
    return updated;
  }
};

export const StorageService = TradePulseStorage;
