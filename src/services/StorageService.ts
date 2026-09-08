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

const ALL_STORES = [
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

export class StorageService {
  private static dbPromise: Promise<IDBDatabase> | null = null;

  private static getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not supported'));
        return;
      }

      // Safety timeout: If IndexedDB is blocked or takes >1500ms, abort and fallback
      let isSettled = false;
      const timer = setTimeout(() => {
        if (!isSettled) {
          isSettled = true;
          console.warn('IndexedDB open timed out after 1500ms. Using localStorage fallback.');
          reject(new Error('IndexedDB open timeout'));
        }
      }, 1500);

      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        // Handle blocked database upgrades when other tabs/connections are open
        request.onblocked = () => {
          if (!isSettled) {
            isSettled = true;
            clearTimeout(timer);
            console.warn('IndexedDB upgrade blocked by open connection. Using localStorage fallback.');
            reject(new Error('IndexedDB upgrade blocked'));
          }
        };

        request.onupgradeneeded = (event: any) => {
          const db = event.target.result as IDBDatabase;
          ALL_STORES.forEach(store => {
            if (!db.objectStoreNames.contains(store)) {
              db.createObjectStore(store, { keyPath: 'id' });
            }
          });
        };

        request.onsuccess = (event: any) => {
          if (!isSettled) {
            isSettled = true;
            clearTimeout(timer);
            const db = event.target.result as IDBDatabase;

            // Auto-close connection if another tab needs to upgrade DB
            db.onversionchange = () => {
              try {
                db.close();
              } catch {}
              StorageService.dbPromise = null;
            };

            resolve(db);
          }
        };

        request.onerror = (event: any) => {
          if (!isSettled) {
            isSettled = true;
            clearTimeout(timer);
            reject(event.target.error || new Error('Failed to open IndexedDB'));
          }
        };
      } catch (err) {
        if (!isSettled) {
          isSettled = true;
          clearTimeout(timer);
          reject(err);
        }
      }
    });

    // If opening DB fails, reset promise so next invocation can retry or use fallback
    this.dbPromise.catch(() => {
      StorageService.dbPromise = null;
    });

    return this.dbPromise;
  }

  // Fallback to localStorage if IndexedDB fails, is blocked, or is unavailable
  private static setFallback(key: string, data: any) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(`tw_${key}`, JSON.stringify(data));
      }
    } catch (e) {
      console.warn('LocalStorage write error:', e);
    }
  }

  private static getFallback<T>(key: string, defaultValue: T): T {
    try {
      if (typeof localStorage !== 'undefined') {
        const item = localStorage.getItem(`tw_${key}`);
        return item ? JSON.parse(item) : defaultValue;
      }
      return defaultValue;
    } catch {
      return defaultValue;
    }
  }

  // Generic Save / Get / Update / Delete with timeout and automatic fallback
  static async save<T extends { id: string }>(storeName: string, item: T): Promise<void> {
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const txTimer = setTimeout(() => reject(new Error(`IndexedDB save timeout on ${storeName}`)), 1000);
        try {
          if (!db.objectStoreNames.contains(storeName)) {
            clearTimeout(txTimer);
            reject(new Error(`Store ${storeName} does not exist in DB`));
            return;
          }

          const tx = db.transaction(storeName, 'readwrite');
          const store = tx.objectStore(storeName);
          const req = store.put(item);

          req.onsuccess = () => {
            clearTimeout(txTimer);
            resolve();
          };
          req.onerror = () => {
            clearTimeout(txTimer);
            reject(req.error);
          };
          tx.onabort = () => {
            clearTimeout(txTimer);
            reject(tx.error || new Error('Transaction aborted'));
          };
          tx.onerror = () => {
            clearTimeout(txTimer);
            reject(tx.error || new Error('Transaction error'));
          };
        } catch (e) {
          clearTimeout(txTimer);
          reject(e);
        }
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
      await new Promise<void>((resolve, reject) => {
        const txTimer = setTimeout(() => reject(new Error(`IndexedDB saveAll timeout on ${storeName}`)), 1000);
        try {
          if (!db.objectStoreNames.contains(storeName)) {
            clearTimeout(txTimer);
            reject(new Error(`Store ${storeName} does not exist in DB`));
            return;
          }

          const tx = db.transaction(storeName, 'readwrite');
          const store = tx.objectStore(storeName);
          store.clear();
          items.forEach(item => store.put(item));

          tx.oncomplete = () => {
            clearTimeout(txTimer);
            resolve();
          };
          tx.onabort = () => {
            clearTimeout(txTimer);
            reject(tx.error || new Error('Transaction aborted'));
          };
          tx.onerror = () => {
            clearTimeout(txTimer);
            reject(tx.error || new Error('Transaction error'));
          };
        } catch (e) {
          clearTimeout(txTimer);
          reject(e);
        }
      });
    } catch {
      this.setFallback(storeName, items);
    }
  }

  static async getAll<T>(storeName: string): Promise<T[]> {
    try {
      const db = await this.getDB();
      return await new Promise<T[]>((resolve, reject) => {
        const txTimer = setTimeout(() => reject(new Error(`IndexedDB getAll timeout on ${storeName}`)), 1000);
        try {
          if (!db.objectStoreNames.contains(storeName)) {
            clearTimeout(txTimer);
            reject(new Error(`Store ${storeName} does not exist in DB`));
            return;
          }

          const tx = db.transaction(storeName, 'readonly');
          const store = tx.objectStore(storeName);
          const req = store.getAll();

          req.onsuccess = () => {
            clearTimeout(txTimer);
            resolve(req.result || []);
          };
          req.onerror = () => {
            clearTimeout(txTimer);
            reject(req.error);
          };
          tx.onabort = () => {
            clearTimeout(txTimer);
            reject(tx.error);
          };
          tx.onerror = () => {
            clearTimeout(txTimer);
            reject(tx.error);
          };
        } catch (e) {
          clearTimeout(txTimer);
          reject(e);
        }
      });
    } catch {
      return this.getFallback<T[]>(storeName, []);
    }
  }

  static async delete(storeName: string, id: string): Promise<void> {
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const txTimer = setTimeout(() => reject(new Error(`IndexedDB delete timeout on ${storeName}`)), 1000);
        try {
          if (!db.objectStoreNames.contains(storeName)) {
            clearTimeout(txTimer);
            reject(new Error(`Store ${storeName} does not exist in DB`));
            return;
          }

          const tx = db.transaction(storeName, 'readwrite');
          const store = tx.objectStore(storeName);
          const req = store.delete(id);

          req.onsuccess = () => {
            clearTimeout(txTimer);
            resolve();
          };
          req.onerror = () => {
            clearTimeout(txTimer);
            reject(req.error);
          };
          tx.onabort = () => {
            clearTimeout(txTimer);
            reject(tx.error);
          };
          tx.onerror = () => {
            clearTimeout(txTimer);
            reject(tx.error);
          };
        } catch (e) {
          clearTimeout(txTimer);
          reject(e);
        }
      });
    } catch {
      const list = this.getFallback<any[]>(storeName, []);
      this.setFallback(storeName, list.filter(i => i.id !== id));
    }
  }

  static async clearStore(storeName: string): Promise<void> {
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const txTimer = setTimeout(() => reject(new Error(`IndexedDB clear timeout on ${storeName}`)), 1000);
        try {
          if (!db.objectStoreNames.contains(storeName)) {
            clearTimeout(txTimer);
            reject(new Error(`Store ${storeName} does not exist in DB`));
            return;
          }

          const tx = db.transaction(storeName, 'readwrite');
          const store = tx.objectStore(storeName);
          const req = store.clear();

          req.onsuccess = () => {
            clearTimeout(txTimer);
            resolve();
          };
          req.onerror = () => {
            clearTimeout(txTimer);
            reject(req.error);
          };
          tx.onabort = () => {
            clearTimeout(txTimer);
            reject(tx.error);
          };
          tx.onerror = () => {
            clearTimeout(txTimer);
            reject(tx.error);
          };
        } catch (e) {
          clearTimeout(txTimer);
          reject(e);
        }
      });
    } catch {
      this.setFallback(storeName, []);
    }
  }

  // Export full application state as JSON
  static async exportAllData(): Promise<string> {
    const backup: Record<string, any> = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      data: {}
    };

    for (const store of ALL_STORES) {
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
