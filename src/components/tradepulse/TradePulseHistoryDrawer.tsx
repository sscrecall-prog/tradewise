import React from 'react';
import { DailySnapshot } from '../../types/tradepulse';
import { 
  X, 
  History, 
  Calendar, 
  CheckCircle2, 
  Trash2, 
  PlusCircle, 
  FileSpreadsheet 
} from 'lucide-react';

interface TradePulseHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  snapshots: DailySnapshot[];
  activeSnapshotId: string;
  onSelectSnapshot: (id: string) => void;
  onDeleteSnapshot: (id: string) => void;
  onOpenAddModal: () => void;
}

export const TradePulseHistoryDrawer: React.FC<TradePulseHistoryDrawerProps> = ({
  isOpen,
  onClose,
  snapshots,
  activeSnapshotId,
  onSelectSnapshot,
  onDeleteSnapshot,
  onOpenAddModal
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 dark:bg-dark-950/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-white dark:bg-dark-950 border-l border-slate-200 dark:border-dark-800 shadow-2xl h-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 dark:border-dark-800 flex items-center justify-between bg-slate-50 dark:bg-dark-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-trade-blue/10 border border-trade-blue/30 flex items-center justify-center text-trade-blue">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Daily Market History
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {snapshots.length} daily snapshots archived
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

        {/* Snapshot List */}
        <div className="p-5 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2 font-semibold">
            <span>SAVED DATES</span>
            <button
              onClick={() => {
                onClose();
                onOpenAddModal();
              }}
              className="text-trade-green hover:underline font-bold flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add New Day</span>
            </button>
          </div>

          {snapshots.map(snap => {
            const isActive = snap.id === activeSnapshotId;

            return (
              <div
                key={snap.id}
                onClick={() => {
                  onSelectSnapshot(snap.id);
                  onClose();
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isActive
                    ? 'bg-trade-green/10 border-trade-green/40 shadow-lg shadow-trade-green/10'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-slate-300 dark:bg-dark-900/70 dark:hover:bg-dark-850 dark:border-dark-800 dark:hover:border-dark-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Calendar className={`w-4 h-4 ${isActive ? 'text-trade-green' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {snap.dateStr}
                    </span>
                  </div>

                  {isActive && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-trade-green text-dark-950 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      ACTIVE
                    </span>
                  )}
                </div>

                <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                    <span>{snap.stocksCount} Equities</span>
                  </div>

                  {snap.isCustom && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete snapshot "${snap.dateStr}"?`)) {
                          onDeleteSnapshot(snap.id);
                        }
                      }}
                      className="p-1 rounded text-slate-400 hover:text-trade-red transition-colors"
                      title="Delete Snapshot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-900/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Data persists in LocalStorage</span>
          <button
            onClick={() => {
              onClose();
              onOpenAddModal();
            }}
            className="px-3 py-1.5 rounded-xl bg-trade-green text-dark-950 font-bold text-xs shadow-sm hover:bg-trade-green-light transition-all"
          >
            + New Date
          </button>
        </div>

      </div>
    </div>
  );
};
