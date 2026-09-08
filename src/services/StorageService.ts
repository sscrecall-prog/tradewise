import {
  TradePlan,
  JournalEntry,
  PaperOrder,
  PaperPosition,
  PaperPortfolio,
  ClosedPaperTrade,
  TradingPreferences,
  UserProfile,
  AppSettings,
  AcademyLesson
} from '../types';

const DB_NAME = 'tradewise_db';
const DB_VERSION = 2;

export class StorageService {
  private static dbPromise: Promise<IDBDatabase> | null = null;

  private static getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not supported'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result as IDBDatabase;
        const stores = [
          'watchlist',
          'journal',
          'tradePlans',
          'paperOrders',
          'paperPositions',
          'paperPortfolio',
          'closedPaperTrades',
          'preferences',
          'profile',
          'settings',
          'academy'
        ];

        stores.forEach(store => {
          if (!db.objectStoreNames.contains(store)) {
            db.createObjectStore(store, { keyPath: 'id' });
          }
        });
      };

      request.onsuccess = (event: any) => {
        resolve(event.target.result);
      };

      request.onerror = (event: any) => {
        reject(event.target.error);
      };
    });

    return this.dbPromise;
  }

  // Fallback to localStorage if IndexedDB fails or is unavailable
  private static setFallback(key: string, data: any) {
    try {
      localStorage.setItem(`tw_${key}`, JSON.stringify(data));
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }
  }

  private static getFallback<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(`tw_${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  // Generic Save / Get / Update / Delete
  static async save<T extends { id: string }>(storeName: string, item: T): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const req = store.put(item);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      const list = this.getFallback<T[]>(storeName, []);
      const idx = list.findIndex(i => i.id === item.id);
      if (idx >= 0) list[idx] = item;
      else list.push(item);
      this.setFallback(storeName, list);
    }
  }

  static async saveAll<T extends { id: string }>(storeName: string, items: T[]): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        store.clear();
        items.forEach(item => store.put(item));
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      this.setFallback(storeName, items);
    }
  }

  static async getAll<T>(storeName: string): Promise<T[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return this.getFallback<T[]>(storeName, []);
    }
  }

  static async delete(storeName: string, id: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      const list = this.getFallback<any[]>(storeName, []);
      this.setFallback(storeName, list.filter(i => i.id !== id));
    }
  }

  static async clearStore(storeName: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const req = store.clear();
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      this.setFallback(storeName, []);
    }
  }

  // Export full application state as JSON
  static async exportAllData(): Promise<string> {
    const stores = [
      'watchlist',
      'journal',
      'tradePlans',
      'paperOrders',
      'paperPositions',
      'paperPortfolio',
      'closedPaperTrades',
      'preferences',
      'profile',
      'settings',
      'academy'
    ];

    const backup: Record<string, any> = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      data: {}
    };

    for (const store of stores) {
      backup.data[store] = await this.getAll(store);
    }

    return JSON.stringify(backup, null, 2);
  }

  // Import JSON backup
  static async importAllData(jsonString: string): Promise<{ success: boolean; message: string }> {
    try {
      const backup = JSON.parse(jsonString);
      if (!backup || !backup.data) {
        return { success: false, message: 'Invalid backup file structure.' };
      }

      for (const [store, items] of Object.entries(backup.data)) {
        if (Array.isArray(items)) {
          await this.saveAll(store, items);
        }
      }

      return { success: true, message: 'Data imported successfully!' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Failed to import backup.' };
    }
  }
}
