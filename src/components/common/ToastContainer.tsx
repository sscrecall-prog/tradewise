import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[99999] flex flex-col gap-2.5 pointer-events-none max-w-sm w-full px-3">
      {toasts.map(toast => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        const borderColor = isSuccess
          ? 'border-emerald-500/30 bg-emerald-500/5'
          : isError
          ? 'border-rose-500/30 bg-rose-500/5'
          : isWarning
          ? 'border-amber-500/30 bg-amber-500/5'
          : 'border-blue-500/30 bg-blue-500/5';

        const icon = isSuccess ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
        ) : isError ? (
          <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
        ) : isWarning ? (
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        ) : (
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        );

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border bg-bg-card/95 backdrop-blur-md shadow-2xl transition-all duration-300 transform translate-y-0 opacity-100 animate-fadeIn ${borderColor}`}
            role="alert"
          >
            {icon}
            <div className="flex-1 min-w-0 pr-1">
              <h4 className="text-xs font-bold text-text-primary leading-tight">
                {toast.title}
              </h4>
              {toast.message && (
                <p className="text-[11px] text-text-secondary mt-0.5 leading-snug break-words">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-text-muted hover:text-text-primary p-0.5 rounded-md transition-colors"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
