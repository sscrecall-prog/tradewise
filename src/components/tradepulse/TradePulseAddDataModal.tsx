import React, { useState, useMemo } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Download,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { parseNiftyCsv } from '../../services/tradepulse/stockDataParser';
import { DEFAULT_NIFTY_CSV, DEFAULT_NIFTY_100_CSV } from '../../services/tradepulse/defaultData';
import { DailySnapshot } from '../../types/tradepulse';

export interface TradePulseAddDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSnapshot: (snapshot: DailySnapshot) => void;
}

export const TradePulseAddDataModal: React.FC<TradePulseAddDataModalProps> = ({
  isOpen,
  onClose,
  onSaveSnapshot
}) => {
  const [activeTab, setActiveTab] = useState<'PASTE' | 'UPLOAD'>('PASTE');
  const [csvText, setCsvText] = useState('');
  const [dateStr, setDateStr] = useState(() => new Date().toISOString().split('T')[0]);
  const [snapshotLabel, setSnapshotLabel] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Real-time preview of parsed data
  const parsedPreview = useMemo(() => {
    if (!csvText.trim()) return null;
    try {
      const rows = parseNiftyCsv(csvText);
      const indexRow = rows.find(r => r.symbol.includes('NIFTY'));
      const stockRows = rows.filter(r => !r.symbol.includes('NIFTY'));
      return {
        totalRows: rows.length,
        stockCount: stockRows.length,
        indexLtp: indexRow ? indexRow.ltp : null,
        sampleSymbols: stockRows.slice(0, 5).map(s => s.symbol)
      };
    } catch (e: any) {
      return null;
    }
  }, [csvText]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCsvText(content);
        if (!snapshotLabel) {
          setSnapshotLabel(file.name.replace('.csv', ''));
        }
      }
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read file. Please ensure it is a valid CSV text file.');
    };
    reader.readAsText(file);
  };

  const handleLoadNifty100 = () => {
    setCsvText(DEFAULT_NIFTY_100_CSV);
    setSnapshotLabel('Official NIFTY 100 Today');
    setErrorMsg('');
  };

  const handleLoadNifty50 = () => {
    setCsvText(DEFAULT_NIFTY_CSV);
    setSnapshotLabel('Official NIFTY 50 Today');
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!csvText.trim()) {
      setErrorMsg('Please paste CSV text or upload a CSV file.');
      return;
    }

    const rows = parseNiftyCsv(csvText);
    if (rows.length < 5) {
      setErrorMsg('Could not detect enough valid stock rows. Ensure the CSV contains columns like SYMBOL, OPEN, HIGH, LOW, LTP, etc.');
      return;
    }

    // Auto-detect index type
    const indexRow = rows.find(r => r.symbol.includes('NIFTY') || r.symbol.includes('INDEX'));
    const isIndexSymbol = (sym: string) => sym.includes('NIFTY') || sym.includes('INDEX') || sym.includes('SENSEX');
    const stockCount = rows.filter(r => !isIndexSymbol(r.symbol)).length;

    let detectedName = indexRow ? indexRow.symbol : (stockCount >= 180 ? 'NIFTY 200' : stockCount >= 85 ? 'NIFTY 100' : 'NIFTY 50');

    const id = `${detectedName.toLowerCase().replace(/\s+/g, '-')}-${dateStr || Date.now()}`;
    const label = snapshotLabel.trim() || `${detectedName} Bhavcopy (${dateStr})`;

    const newSnapshot: DailySnapshot = {
      id,
      dateStr: label,
      timestamp: Date.now(),
      rawCsv: csvText,
      stocksCount: stockCount,
      isCustom: true
    };

    onSaveSnapshot(newSnapshot);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-dark-950/80 backdrop-blur-md animate-fade-in">
      <div 
        className="glass-panel rounded-3xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-dark-700/80 shadow-2xl flex flex-col max-h-[90vh] bg-white dark:bg-dark-900"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-dark-800 flex items-center justify-between bg-slate-50 dark:bg-dark-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-trade-green/10 border border-trade-green/30 flex items-center justify-center text-trade-green">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Add Daily NIFTY 50 Data
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update market quotes with today's NSE Bhavcopy CSV or raw text
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* Metadata Row: Date & Label */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-trade-blue" />
                Snapshot Date
              </label>
              <input
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full bg-white dark:bg-dark-900 border border-slate-300 dark:border-dark-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-trade-green"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Display Label / Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 06 Sep 2026 Closing Bhavcopy"
                value={snapshotLabel}
                onChange={(e) => setSnapshotLabel(e.target.value)}
                className="w-full bg-white dark:bg-dark-900 border border-slate-300 dark:border-dark-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-trade-green"
              />
            </div>
          </div>

          {/* Mode Switcher: Paste vs Upload */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-dark-800 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('PASTE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'PASTE' 
                  ? 'bg-trade-green text-dark-950 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Paste Raw CSV Text</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('UPLOAD')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'UPLOAD' 
                  ? 'bg-trade-green text-dark-950 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload .CSV File</span>
            </button>

            <div className="flex-1 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleLoadNifty100}
                className="text-[11px] text-trade-green hover:underline font-bold flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Nifty 100 (100)</span>
              </button>

              <button
                type="button"
                onClick={handleLoadNifty50}
                className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline font-bold flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Nifty 50 (50)</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Paste Text */}
          {activeTab === 'PASTE' ? (
            <div>
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                <span>Paste raw CSV rows (including header):</span>
                <span className="font-mono text-[10px] text-slate-500">SYMBOL,OPEN,HIGH,LOW,PREV. CLOSE,LTP...</span>
              </div>
              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder={`SYMBOL,OPEN,HIGH,LOW,PREV. CLOSE,LTP,INDICATIVE CLOSE,CHANGE,% CHANGE,VOLUME (shares),VALUE (₹ Crores),52 WEEK HIGH,52 WEEK LOW,30 D %CHNG,365 D %CHNG\n"NIFTY 50","23,910.90","24,005.75","23,895.85","23,873.45","23,897.70","-","24.25","0.1","231396362","18,379.52","26,373.20","22,182.55","-2.91","-3.38"\n"RELIANCE","1,304.10","1,333.00","1,304.10","1,302.50","1,322.00","-","19.5","1.5","13031534","1,728.35","1,611.80","1,249.80","2.41","-2.74"`}
                rows={8}
                className="w-full bg-white dark:bg-dark-900 border border-slate-300 dark:border-dark-700/80 rounded-xl p-3 text-xs font-mono text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-trade-green"
              />
            </div>
          ) : (
            /* Tab 2: File Upload */
            <div className="border-2 border-dashed border-slate-300 dark:border-dark-700 hover:border-trade-green/50 rounded-2xl p-8 text-center bg-slate-50 dark:bg-dark-900/50 transition-colors">
              <Upload className="w-8 h-8 text-trade-green mx-auto mb-2 opacity-80" />
              <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                Drag & drop your NSE Nifty 50 Bhavcopy CSV file here
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4">
                Supports standard comma-delimited .csv files with quotes
              </p>
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-dark-800 hover:bg-slate-100 dark:hover:bg-dark-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-dark-600 transition-colors">
                <span>Browse Local Computer</span>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Validation Feedback & Preview */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-trade-red/10 border border-trade-red/30 flex items-center gap-2 text-xs text-trade-red font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {parsedPreview && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-dark-900/90 border border-slate-200 dark:border-dark-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-trade-green font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  Successfully Validated
                </span>
                <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">
                  {parsedPreview.stockCount} Equities Detected
                </span>
              </div>

              {parsedPreview.indexLtp && (
                <div className="text-xs text-slate-700 dark:text-slate-300">
                  NIFTY 50 Level: <strong className="text-slate-900 dark:text-white font-mono">₹{parsedPreview.indexLtp.toLocaleString('en-IN')}</strong>
                </div>
              )}

              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Sample Tickers: {parsedPreview.sampleSymbols.join(', ')}...
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-dark-850 dark:hover:bg-dark-800 dark:text-slate-400 dark:hover:text-slate-200 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-trade-green hover:bg-trade-green-light text-dark-950 font-bold text-xs shadow-lg shadow-trade-green/20 transition-all"
            >
              Import & Run Analysis
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
