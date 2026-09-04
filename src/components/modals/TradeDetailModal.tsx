import React from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { Badge } from "../common/Badge";
import { JournalEntry } from "../../types";
import { useApp } from "../../context/AppContext";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar,
  DollarSign,
  Tag,
  Smile,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  ExternalLink,
  ShieldCheck
} from "lucide-react";

interface TradeDetailModalProps {
  trade: JournalEntry | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TradeDetailModal: React.FC<TradeDetailModalProps> = ({
  trade,
  isOpen,
  onClose
}) => {
  const { deleteJournalEntry } = useApp();

  if (!trade) return null;

  const isWin = trade.netPnL > 0;
  const isLoss = trade.netPnL < 0;

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete trade for ${trade.stockSymbol}?`)) {
      await deleteJournalEntry(trade.id);
      onClose();
    }
  };

  // Parse chart snapshot url from notes if present
  let chartSnapshotUrl: string | null = null;
  let cleanNotes = trade.notes;
  const match = trade.notes.match(/\[Chart Snapshot\]:\s*(https?:\/\/[^\s]+)/);
  if (match) {
    chartSnapshotUrl = match[1];
    cleanNotes = trade.notes.replace(/\[Chart Snapshot\]:\s*(https?:\/\/[^\s]+)/, "").trim();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <span className="font-bold text-lg text-text-primary">{trade.stockSymbol}</span>
          <Badge variant={trade.direction === "BUY" ? "positive" : "negative"} size="sm">
            {trade.direction}
          </Badge>
          <Badge variant={trade.status === "CLOSED" ? "neutral" : "warning"} size="sm">
            {trade.status}
          </Badge>
        </div>
      }
      subtitle={trade.stockName}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Net P&L Hero Card */}
        <div className="p-5 rounded-2xl bg-bg-elevated border border-border-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Net Realized P&L
            </span>
            <div
              className={`text-3xl font-extrabold tracking-tight mt-0.5 ${
                isWin ? "text-brand-positive" : isLoss ? "text-brand-negative" : "text-text-secondary"
              }`}
            >
              {trade.netPnL >= 0 ? "+₹" : "-₹"}
              {Math.abs(trade.netPnL).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-3 text-xs text-text-muted mt-1.5">
              <span>Gross: ₹{trade.grossPnL.toLocaleString("en-IN")}</span>
              <span>•</span>
              <span className="text-amber-400">Charges & Taxes: -₹{trade.estimatedCharges}</span>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-bg-secondary border border-border-subtle text-right">
              <span className="text-[10px] text-text-muted block">Risk:Reward Multiple</span>
              <span
                className={`text-sm font-bold ${
                  trade.rMultiple > 0
                    ? "text-brand-positive"
                    : trade.rMultiple < 0
                    ? "text-brand-negative"
                    : "text-text-secondary"
                }`}
              >
                {trade.rMultiple > 0 ? `+${trade.rMultiple}R` : `${trade.rMultiple}R`}
              </span>
            </div>
            {trade.holdingTimeMinutes && (
              <span className="text-xs text-text-muted flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {trade.holdingTimeMinutes} mins held
              </span>
            )}
          </div>
        </div>

        {/* Execution Details Table */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-bg-secondary border border-border-subtle">
            <span className="text-[11px] text-text-muted block">Entry Price</span>
            <span className="text-sm font-bold text-text-primary">₹{trade.entryPrice.toFixed(2)}</span>
          </div>

          <div className="p-3 rounded-xl bg-bg-secondary border border-border-subtle">
            <span className="text-[11px] text-text-muted block">Exit Price</span>
            <span className="text-sm font-bold text-text-primary">
              {trade.exitPrice ? `₹${trade.exitPrice.toFixed(2)}` : "Open"}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-bg-secondary border border-border-subtle">
            <span className="text-[11px] text-text-muted block">Quantity / Lots</span>
            <span className="text-sm font-bold text-text-primary">{trade.quantity}</span>
          </div>

          <div className="p-3 rounded-xl bg-bg-secondary border border-border-subtle">
            <span className="text-[11px] text-text-muted block">Stop Loss</span>
            <span className="text-sm font-bold text-brand-negative">
              {trade.stopLoss ? `₹${trade.stopLoss.toFixed(2)}` : "None"}
            </span>
          </div>
        </div>

        {/* Behavioral & Psychology Badges */}
        <div className="p-4 rounded-2xl bg-bg-elevated/40 border border-border-subtle space-y-3">
          <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
            Psychology & Execution Quality
          </span>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-bg-secondary border border-border-subtle text-xs">
              <Tag className="w-3.5 h-3.5 text-brand-accent" />
              <span className="text-text-muted">Setup:</span>
              <span className="font-semibold text-text-primary">{trade.setup}</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-bg-secondary border border-border-subtle text-xs">
              <Smile className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-text-muted">Emotion:</span>
              <span className="font-semibold text-text-primary">{trade.emotion}</span>
            </div>

            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs ${
                trade.mistake === "None"
                  ? "bg-brand-positive/10 border-brand-positive/20 text-brand-positive"
                  : "bg-brand-negative/10 border-brand-negative/20 text-brand-negative"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="text-text-muted">Mistake:</span>
              <span className="font-semibold">{trade.mistake}</span>
            </div>

            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs ${
                trade.planFollowed
                  ? "bg-brand-positive/10 border-brand-positive/20 text-brand-positive"
                  : "bg-brand-negative/10 border-brand-negative/20 text-brand-negative"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{trade.planFollowed ? "Plan Followed" : "Plan Violated"}</span>
            </div>
          </div>
        </div>

        {/* Notes & Chart */}
        {cleanNotes && (
          <div>
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1.5">
              Trader Notes & Thesis
            </span>
            <div className="p-3.5 rounded-xl bg-bg-secondary border border-border-subtle text-xs text-text-primary whitespace-pre-wrap leading-relaxed">
              {cleanNotes}
            </div>
          </div>
        )}

        {/* Chart Snapshot preview */}
        {chartSnapshotUrl && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                TradingView Chart Snapshot
              </span>
              <a
                href={chartSnapshotUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-brand-accent hover:underline flex items-center gap-1"
              >
                Open in new tab <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="rounded-xl overflow-hidden border border-border-subtle bg-bg-secondary">
              <img
                src={chartSnapshotUrl}
                alt="Trade chart snapshot"
                className="w-full max-h-72 object-contain bg-black/40"
                onError={e => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
          </div>
        )}

        {/* Trade Timestamp & Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border-subtle text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>Executed on {trade.date} at {trade.time} IST</span>
          </div>

          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 className="w-3.5 h-3.5" />}
            onClick={handleDelete}
          >
            Delete Trade
          </Button>
        </div>
      </div>
    </Modal>
  );
};
