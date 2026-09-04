import React, { useState } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { Badge } from "../common/Badge";
import { useApp } from "../../context/AppContext";
import { JournalEntry, TradeDirection, SetupType, EmotionType, MistakeType } from "../../types";
import { TradingCalculationService } from "../../services/TradingCalculationService";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Download,
  Sparkles,
  ArrowRight,
  TrendingUp,
  TrendingDown
} from "lucide-react";

interface BrokerImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedTradeCandidate {
  date: string;
  time: string;
  stockSymbol: string;
  stockName: string;
  direction: TradeDirection;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  grossPnL: number;
  estimatedCharges: number;
  netPnL: number;
  selected: boolean;
}

const SAMPLE_CSV = `Date,Time,Symbol,Direction,EntryPrice,ExitPrice,Quantity,Setup,Emotion
2026-08-10,09:30,NIFTY 24600 CE,BUY,135,172,50,Breakout,Calm
2026-08-11,10:15,BANKNIFTY 51400 PE,BUY,240,210,30,Pullback,Neutral
2026-08-12,13:45,RELIANCE,BUY,2890,2935,20,Trend Continuation,Calm
2026-08-13,11:00,HDFCBANK,BUY,1610,1632,35,Support/Resistance,Disciplined`;

export const BrokerImportModal: React.FC<BrokerImportModalProps> = ({
  isOpen,
  onClose
}) => {
  const { addJournalEntry } = useApp();

  const [broker, setBroker] = useState<"ZERODHA" | "GROWW" | "ANGEL" | "UPSTOX" | "DHAN" | "GENERIC">("ZERODHA");
  const [csvContent, setCsvContent] = useState("");
  const [parsedTrades, setParsedTrades] = useState<ParsedTradeCandidate[]>([]);
  const [step, setStep] = useState<"INPUT" | "PREVIEW">("INPUT");
  const [errorMessage, setErrorMessage] = useState("");
  const [importing, setImporting] = useState(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const text = evt.target?.result as string;
      if (text) {
        setCsvContent(text);
      }
    };
    reader.readAsText(file);
  };

  const loadSampleData = () => {
    setCsvContent(SAMPLE_CSV);
    setErrorMessage("");
  };

  const parseCsv = () => {
    setErrorMessage("");
    if (!csvContent.trim()) {
      setErrorMessage("Please paste or upload CSV data.");
      return;
    }

    const lines = csvContent
      .trim()
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      setErrorMessage("CSV must contain a header row and at least one data row.");
      return;
    }

    const header = lines[0].toLowerCase().split(",").map(h => h.trim().replace(/['"]/g, ""));

    // Find column indexes
    const symbolIdx = header.findIndex(h => h.includes("symbol") || h.includes("script") || h.includes("instrument"));
    const dirIdx = header.findIndex(h => h.includes("dir") || h.includes("type") || h.includes("side") || h.includes("buy/sell"));
    const entryIdx = header.findIndex(h => h.includes("entry") || h.includes("buy_price") || h.includes("avg_price") || h.includes("price"));
    const exitIdx = header.findIndex(h => h.includes("exit") || h.includes("sell_price"));
    const qtyIdx = header.findIndex(h => h.includes("qty") || h.includes("quantity") || h.includes("shares") || h.includes("lots"));
    const dateIdx = header.findIndex(h => h.includes("date") || h.includes("trade_date") || h.includes("timestamp"));
    const timeIdx = header.findIndex(h => h.includes("time"));

    if (symbolIdx === -1) {
      setErrorMessage("Could not identify 'Symbol' column in the CSV header.");
      return;
    }

    const candidates: ParsedTradeCandidate[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map(c => c.trim().replace(/['"]/g, ""));
      if (cols.length < 2) continue;

      const sym = cols[symbolIdx] || "UNKNOWN";
      let dir: TradeDirection = "BUY";
      if (dirIdx !== -1 && cols[dirIdx]) {
        const rawDir = cols[dirIdx].toUpperCase();
        if (rawDir.startsWith("S")) dir = "SELL";
      }

      const en = parseFloat(cols[entryIdx !== -1 ? entryIdx : 3]) || 100;
      let ex = exitIdx !== -1 ? parseFloat(cols[exitIdx]) : en * 1.02;
      if (isNaN(ex) || ex <= 0) ex = en;

      const qty = parseInt(cols[qtyIdx !== -1 ? qtyIdx : 4]) || 25;
      const date = dateIdx !== -1 && cols[dateIdx] ? cols[dateIdx] : new Date().toISOString().split("T")[0];
      const time = timeIdx !== -1 && cols[timeIdx] ? cols[timeIdx] : "09:30";

      const priceDiff = dir === "BUY" ? ex - en : en - ex;
      const grossPnL = Math.round(priceDiff * qty * 100) / 100;
      const charges = TradingCalculationService.calculateIndianCharges(en, ex, qty, true, 20);
      const netPnL = Math.round((grossPnL - charges.totalCharges) * 100) / 100;

      candidates.push({
        date,
        time,
        stockSymbol: sym,
        stockName: sym,
        direction: dir,
        entryPrice: en,
        exitPrice: ex,
        quantity: qty,
        grossPnL,
        estimatedCharges: charges.totalCharges,
        netPnL,
        selected: true
      });
    }

    if (candidates.length === 0) {
      setErrorMessage("No valid trades could be extracted from the provided CSV.");
      return;
    }

    setParsedTrades(candidates);
    setStep("PREVIEW");
  };

  const toggleSelect = (index: number) => {
    setParsedTrades(prev =>
      prev.map((t, i) => (i === index ? { ...t, selected: !t.selected } : t))
    );
  };

  const toggleAll = (select: boolean) => {
    setParsedTrades(prev => prev.map(t => ({ ...t, selected: select })));
  };

  const handleImport = async () => {
    const toImport = parsedTrades.filter(t => t.selected);
    if (toImport.length === 0) {
      setErrorMessage("Please select at least one trade to import.");
      return;
    }

    setImporting(true);
    let count = 0;
    for (const t of toImport) {
      await addJournalEntry({
        date: t.date,
        time: t.time,
        stockSymbol: t.stockSymbol,
        stockName: t.stockName,
        direction: t.direction,
        entryPrice: t.entryPrice,
        exitPrice: t.exitPrice,
        quantity: t.quantity,
        stopLoss: t.direction === "BUY" ? t.entryPrice * 0.98 : t.entryPrice * 1.02,
        targetPrice: t.direction === "BUY" ? t.entryPrice * 1.04 : t.entryPrice * 0.96,
        grossPnL: t.grossPnL,
        estimatedCharges: t.estimatedCharges,
        netPnL: t.netPnL,
        status: "CLOSED",
        setup: "Breakout",
        emotion: "Calm",
        planFollowed: true,
        movedStopLoss: false,
        overtraded: false,
        mistake: "None",
        notes: `Imported from ${broker} CSV tradebook.`,
        rMultiple: t.grossPnL >= 0 ? 1.5 : -1.0,
        holdingTimeMinutes: 40
      });
      count++;
    }

    setImporting(false);
    setSuccessCount(count);
    setTimeout(() => {
      setSuccessCount(null);
      setStep("INPUT");
      setCsvContent("");
      setParsedTrades([]);
      onClose();
    }, 1500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Broker Tradebook"
      subtitle="Zerodha Kite, Groww, Angel One, Upstox, Dhan or Generic CSV"
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-brand-negative/15 border border-brand-negative/30 text-brand-negative text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successCount !== null && (
          <div className="p-4 rounded-xl bg-brand-positive/20 border border-brand-positive/40 text-brand-positive text-sm font-semibold flex items-center gap-3 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>Successfully imported {successCount} trades into your Trade Journal!</span>
          </div>
        )}

        {step === "INPUT" && (
          <>
            {/* Broker Tabs */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                Select Your Indian Broker
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[
                  { id: "ZERODHA", label: "Zerodha" },
                  { id: "GROWW", label: "Groww" },
                  { id: "ANGEL", label: "Angel One" },
                  { id: "UPSTOX", label: "Upstox" },
                  { id: "DHAN", label: "Dhan" },
                  { id: "GENERIC", label: "Generic CSV" }
                ].map(b => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBroker(b.id as any)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                      broker === b.id
                        ? "bg-brand-accent/20 border-brand-accent text-brand-accent shadow-sm"
                        : "bg-bg-elevated border-border-subtle text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* File Upload Zone */}
            <div className="border-2 border-dashed border-border-subtle hover:border-brand-accent/60 rounded-2xl p-6 text-center transition-colors bg-bg-secondary/40">
              <UploadCloud className="w-8 h-8 text-brand-accent mx-auto mb-2" />
              <p className="text-sm font-semibold text-text-primary mb-1">
                Upload your {broker} Tradebook / Orders CSV
              </p>
              <p className="text-xs text-text-muted mb-3">
                Download your trade report from your broker console and drop it here
              </p>
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-elevated border border-border-subtle hover:bg-border-subtle text-xs font-semibold text-text-primary cursor-pointer transition-colors">
                <FileSpreadsheet className="w-4 h-4 text-brand-accent" />
                Browse File (.csv)
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Or Paste CSV */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Or Paste CSV Data Below
                </label>
                <button
                  type="button"
                  onClick={loadSampleData}
                  className="text-xs text-brand-accent hover:underline flex items-center gap-1 font-medium"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Load Sample Trades
                </button>
              </div>
              <textarea
                rows={6}
                value={csvContent}
                onChange={e => setCsvContent(e.target.value)}
                placeholder="Date,Time,Symbol,Direction,EntryPrice,ExitPrice,Quantity..."
                className="w-full bg-bg-secondary border border-border-subtle rounded-xl p-3 text-xs font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand-accent custom-scrollbar"
              />
            </div>

            {/* Next CTA */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={parseCsv}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Parse & Preview Trades
              </Button>
            </div>
          </>
        )}

        {step === "PREVIEW" && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-text-primary">
                  Review Detected Trades ({parsedTrades.filter(t => t.selected).length} of {parsedTrades.length} selected)
                </h4>
                <p className="text-xs text-text-muted">
                  Indian regulatory taxes & STT have been calculated automatically for each trade.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => toggleAll(true)}>
                  Select All
                </Button>
                <Button size="sm" variant="ghost" onClick={() => toggleAll(false)}>
                  Deselect All
                </Button>
              </div>
            </div>

            {/* Trades Preview List */}
            <div className="max-h-72 overflow-y-auto border border-border-subtle rounded-xl custom-scrollbar divide-y divide-border-subtle/60">
              {parsedTrades.map((t, idx) => (
                <div
                  key={idx}
                  onClick={() => toggleSelect(idx)}
                  className={`p-3 flex items-center justify-between text-xs cursor-pointer transition-colors ${
                    t.selected ? "bg-bg-elevated" : "opacity-40 hover:opacity-70"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={t.selected}
                      onChange={() => toggleSelect(idx)}
                      className="rounded text-brand-accent focus:ring-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-text-primary">{t.stockSymbol}</span>
                        <Badge variant={t.direction === "BUY" ? "positive" : "negative"} size="sm">
                          {t.direction}
                        </Badge>
                      </div>
                      <span className="text-[11px] text-text-muted">
                        {t.date} {t.time} • Qty: {t.quantity} • Entry: ₹{t.entryPrice} • Exit: ₹{t.exitPrice}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`font-bold ${t.netPnL >= 0 ? "text-brand-positive" : "text-brand-negative"}`}>
                      {t.netPnL >= 0 ? "+₹" : "-₹"}{Math.abs(t.netPnL).toLocaleString("en-IN")}
                    </div>
                    <span className="text-[10px] text-amber-400">
                      Taxes: -₹{t.estimatedCharges}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
              <Button variant="outline" onClick={() => setStep("INPUT")}>
                Back to Edit
              </Button>
              <Button
                variant="primary"
                disabled={importing || parsedTrades.filter(t => t.selected).length === 0}
                onClick={handleImport}
                icon={<Sparkles className="w-4 h-4" />}
              >
                {importing
                  ? "Importing..."
                  : `Import ${parsedTrades.filter(t => t.selected).length} Trades`}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
