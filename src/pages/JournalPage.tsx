import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";
import { TradeDetailModal } from "../components/modals/TradeDetailModal";
import { BrokerImportModal } from "../components/modals/BrokerImportModal";
import { JournalEntry, SetupType, EmotionType, TradeDirection } from "../types";
import {
  Search,
  Filter,
  Plus,
  Download,
  UploadCloud,
  ChevronDown,
  Trash2,
  ExternalLink,
  Tag,
  TrendingUp,
  TrendingDown,
  Clock,
  Sparkles
} from "lucide-react";

export const JournalPage: React.FC = () => {
  const { journal, setIsNewTradeModalOpen, deleteJournalEntry } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSegment, setSelectedSegment] = useState("ALL");
  const [selectedOutcome, setSelectedOutcome] = useState<"ALL" | "WIN" | "LOSS" | "OPEN">("ALL");
  const [selectedSetup, setSelectedSetup] = useState<string>("ALL");
  const [selectedEmotion, setSelectedEmotion] = useState<string>("ALL");
  const [sortField, setSortField] = useState<"date" | "netPnL" | "rMultiple">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [selectedTrade, setSelectedTrade] = useState<JournalEntry | null>(null);
  const [isBrokerImportOpen, setIsBrokerImportOpen] = useState(false);

  // Filtered & Sorted Trades
  const filteredTrades = useMemo(() => {
    return journal
      .filter(t => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesSym = t.stockSymbol.toLowerCase().includes(q);
          const matchesName = t.stockName.toLowerCase().includes(q);
          const matchesNotes = t.notes.toLowerCase().includes(q);
          if (!matchesSym && !matchesName && !matchesNotes) return false;
        }

        // Segment
        if (selectedSegment !== "ALL") {
          if (selectedSegment === "OPTIONS" && !t.stockSymbol.includes("CE") && !t.stockSymbol.includes("PE")) return false;
          if (selectedSegment === "FUTURES" && !t.stockSymbol.includes("FUT")) return false;
          if (selectedSegment === "EQUITY" && (t.stockSymbol.includes("CE") || t.stockSymbol.includes("PE") || t.stockSymbol.includes("FUT"))) return false;
        }

        // Outcome
        if (selectedOutcome === "WIN" && t.netPnL <= 0) return false;
        if (selectedOutcome === "LOSS" && t.netPnL >= 0) return false;
        if (selectedOutcome === "OPEN" && t.status !== "OPEN") return false;

        // Setup
        if (selectedSetup !== "ALL" && t.setup !== selectedSetup) return false;

        // Emotion
        if (selectedEmotion !== "ALL" && t.emotion !== selectedEmotion) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortField === "date") {
          const tA = new Date(`${a.date}T${a.time || "00:00"}`).getTime();
          const tB = new Date(`${b.date}T${b.time || "00:00"}`).getTime();
          return sortOrder === "desc" ? tB - tA : tA - tB;
        }
        if (sortField === "netPnL") {
          return sortOrder === "desc" ? b.netPnL - a.netPnL : a.netPnL - b.netPnL;
        }
        if (sortField === "rMultiple") {
          return sortOrder === "desc" ? b.rMultiple - a.rMultiple : a.rMultiple - b.rMultiple;
        }
        return 0;
      });
  }, [journal, searchQuery, selectedSegment, selectedOutcome, selectedSetup, selectedEmotion, sortField, sortOrder]);

  // Aggregate stats of current filtered view
  const filteredStats = useMemo(() => {
    const total = filteredTrades.length;
    const wins = filteredTrades.filter(t => t.netPnL > 0).length;
    const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
    const totalNetPnL = filteredTrades.reduce((acc, t) => acc + t.netPnL, 0);
    const totalGrossPnL = filteredTrades.reduce((acc, t) => acc + t.grossPnL, 0);
    const totalTaxes = filteredTrades.reduce((acc, t) => acc + t.estimatedCharges, 0);
    return { total, wins, winRate, totalNetPnL, totalGrossPnL, totalTaxes };
  }, [filteredTrades]);

  // Export CSV
  const handleExportCSV = () => {
    if (journal.length === 0) return;
    const headers = ["Date", "Time", "Symbol", "Name", "Direction", "EntryPrice", "ExitPrice", "Quantity", "GrossPnL", "Charges", "NetPnL", "Setup", "Emotion", "Mistake", "RMultiple", "Notes"];
    const rows = journal.map(t => [
      t.date,
      t.time,
      `"${t.stockSymbol}"`,
      `"${t.stockName}"`,
      t.direction,
      t.entryPrice,
      t.exitPrice || "",
      t.quantity,
      t.grossPnL,
      t.estimatedCharges,
      t.netPnL,
      t.setup,
      t.emotion,
      t.mistake,
      t.rMultiple,
      `"${t.notes.replace(/"/g, '""')}"`
    ]);

    const csvString = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tradewise_journal_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-text-primary tracking-tight">
            Indian Stock & F&O Trade Journal
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Detailed ledger of all your trades, execution quality, and exact Indian tax deductions
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={<UploadCloud className="w-3.5 h-3.5 text-brand-accent" />}
            onClick={() => setIsBrokerImportOpen(true)}
          >
            Import CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsNewTradeModalOpen(true)}
          >
            Log Trade
          </Button>
        </div>
      </div>

      {/* Filtered Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-bg-card border border-border-subtle">
          <span className="text-[11px] text-text-muted block">Filtered Trades</span>
          <span className="text-lg font-extrabold text-text-primary mt-0.5 block">
            {filteredStats.total} Trades
          </span>
          <span className="text-[10px] text-text-muted">
            {filteredStats.wins} Wins ({filteredStats.winRate}% Win Rate)
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-bg-card border border-border-subtle">
          <span className="text-[11px] text-text-muted block">Filtered Net Realized P&L</span>
          <span
            className={`text-lg font-extrabold mt-0.5 block ${
              filteredStats.totalNetPnL >= 0 ? "text-brand-positive" : "text-brand-negative"
            }`}
          >
            {filteredStats.totalNetPnL >= 0 ? "+₹" : "-₹"}
            {Math.abs(filteredStats.totalNetPnL).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-text-muted">After all charges</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-bg-card border border-border-subtle">
          <span className="text-[11px] text-text-muted block">Gross P&L</span>
          <span className="text-lg font-extrabold text-text-primary mt-0.5 block">
            ₹{filteredStats.totalGrossPnL.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-text-muted">Before taxes</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-bg-card border border-border-subtle">
          <span className="text-[11px] text-text-muted block">Taxes & Brokerage</span>
          <span className="text-lg font-extrabold text-amber-400 mt-0.5 block">
            -₹{filteredStats.totalTaxes.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-text-muted">STT, GST, Stamp, SEBI</span>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search by Symbol (e.g. NIFTY, 24500 CE, RELIANCE), setup, notes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-bg-secondary border border-border-subtle rounded-xl pl-9 pr-4 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand-accent"
            />
          </div>

          {/* Segment Selector */}
          <select
            value={selectedSegment}
            onChange={e => setSelectedSegment(e.target.value)}
            className="bg-bg-secondary border border-border-subtle rounded-xl px-3 py-2 text-xs font-semibold text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent"
          >
            <option value="ALL">All Segments</option>
            <option value="OPTIONS">Index Options (CE/PE)</option>
            <option value="EQUITY">Equity (MIS / CNC)</option>
            <option value="FUTURES">Futures</option>
          </select>

          {/* Outcome Filter */}
          <select
            value={selectedOutcome}
            onChange={e => setSelectedOutcome(e.target.value as any)}
            className="bg-bg-secondary border border-border-subtle rounded-xl px-3 py-2 text-xs font-semibold text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent"
          >
            <option value="ALL">All Outcomes</option>
            <option value="WIN">Winning Trades (Green)</option>
            <option value="LOSS">Losing Trades (Red)</option>
            <option value="OPEN">Open Positions</option>
          </select>

          {/* Setup Filter */}
          <select
            value={selectedSetup}
            onChange={e => setSelectedSetup(e.target.value)}
            className="bg-bg-secondary border border-border-subtle rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent"
          >
            <option value="ALL">All Setups</option>
            <option value="Breakout">Breakout</option>
            <option value="Pullback">Pullback</option>
            <option value="Support/Resistance">Support/Resistance</option>
            <option value="Reversal">Reversal</option>
            <option value="Trend Continuation">Trend Continuation</option>
            <option value="Range Bound">Range Bound</option>
            <option value="Gap Fill">Gap Fill</option>
          </select>

          {/* Emotion Filter */}
          <select
            value={selectedEmotion}
            onChange={e => setSelectedEmotion(e.target.value)}
            className="bg-bg-secondary border border-border-subtle rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent"
          >
            <option value="ALL">All Emotions</option>
            <option value="Calm">Calm & Disciplined</option>
            <option value="Neutral">Neutral</option>
            <option value="FOMO">FOMO</option>
            <option value="Revenge">Revenge</option>
            <option value="Impatient">Impatient</option>
            <option value="Overconfident">Overconfident</option>
          </select>
        </div>
      </div>

      {/* Trades Table */}
      <div className="rounded-3xl bg-bg-card border border-border-subtle overflow-hidden">
        {filteredTrades.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Tag className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-50" />
            <h4 className="text-sm font-bold text-text-primary mb-1">No Trades Found</h4>
            <p className="text-xs text-text-muted max-w-sm mx-auto mb-4">
              Try adjusting your search query or filters, or log a new trade to start tracking.
            </p>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsNewTradeModalOpen(true)}
            >
              Log New Trade
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg-secondary/70 border-b border-border-subtle text-text-muted uppercase text-[10px] tracking-wider select-none">
                <tr>
                  <th
                    className="py-3.5 px-4 font-semibold cursor-pointer hover:text-text-primary"
                    onClick={() => {
                      setSortField("date");
                      setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
                    }}
                  >
                    Date / Time {sortField === "date" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="py-3.5 px-4 font-semibold">Instrument & Contract</th>
                  <th className="py-3.5 px-4 font-semibold">Side</th>
                  <th className="py-3.5 px-4 font-semibold">Entry → Exit</th>
                  <th className="py-3.5 px-4 font-semibold">Qty</th>
                  <th className="py-3.5 px-4 font-semibold">Setup & Emotion</th>
                  <th className="py-3.5 px-4 font-semibold">Taxes & Brokerage</th>
                  <th
                    className="py-3.5 px-4 font-semibold text-right cursor-pointer hover:text-text-primary"
                    onClick={() => {
                      setSortField("netPnL");
                      setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
                    }}
                  >
                    Net P&L {sortField === "netPnL" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="py-3.5 px-4 font-semibold text-center cursor-pointer hover:text-text-primary"
                    onClick={() => {
                      setSortField("rMultiple");
                      setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
                    }}
                  >
                    R:R {sortField === "rMultiple" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50">
                {filteredTrades.map(t => {
                  const isWin = t.netPnL > 0;
                  const isLoss = t.netPnL < 0;
                  return (
                    <tr
                      key={t.id}
                      onClick={() => setSelectedTrade(t)}
                      className="hover:bg-bg-elevated cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 text-text-muted whitespace-nowrap">
                        <div className="font-medium text-text-primary">{t.date}</div>
                        <div className="text-[10px] flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" /> {t.time} IST
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-text-primary text-sm flex items-center gap-2">
                          {t.stockSymbol}
                          {t.notes && t.notes.includes("http") && (
                            <span className="text-[10px] text-brand-accent bg-brand-accent/10 px-1 rounded">
                              Chart
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-text-muted truncate max-w-[180px]">
                          {t.stockName}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge variant={t.direction === "BUY" ? "positive" : "negative"} size="sm">
                          {t.direction}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-text-secondary whitespace-nowrap">
                        <span className="font-medium text-text-primary">₹{t.entryPrice.toFixed(2)}</span>
                        <span className="text-text-muted mx-1.5">→</span>
                        <span className="font-medium text-text-primary">
                          {t.exitPrice ? `₹${t.exitPrice.toFixed(2)}` : "Open"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-text-primary whitespace-nowrap">
                        {t.quantity}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-bg-secondary border border-border-subtle text-[11px] font-medium text-text-primary">
                            {t.setup}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-bg-secondary border border-border-subtle text-[11px] text-text-muted">
                            {t.emotion}
                          </span>
                          {t.mistake !== "None" && (
                            <span className="px-1.5 py-0.5 rounded bg-brand-negative/15 text-brand-negative text-[10px] font-bold">
                              {t.mistake}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-amber-400 font-mono text-xs whitespace-nowrap">
                        -₹{t.estimatedCharges.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div
                          className={`text-sm font-extrabold ${
                            isWin ? "text-brand-positive" : isLoss ? "text-brand-negative" : "text-text-secondary"
                          }`}
                        >
                          {t.netPnL >= 0 ? "+₹" : "-₹"}
                          {Math.abs(t.netPnL).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] text-text-muted">
                          Gross: {t.grossPnL >= 0 ? "+" : ""}₹{t.grossPnL.toLocaleString("en-IN")}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
                            t.rMultiple > 0
                              ? "bg-brand-positive/10 text-brand-positive"
                              : t.rMultiple < 0
                              ? "bg-brand-negative/10 text-brand-negative"
                              : "bg-bg-secondary text-text-muted"
                          }`}
                        >
                          {t.rMultiple > 0 ? `+${t.rMultiple}R` : `${t.rMultiple}R`}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <TradeDetailModal
        trade={selectedTrade}
        isOpen={!!selectedTrade}
        onClose={() => setSelectedTrade(null)}
      />

      <BrokerImportModal
        isOpen={isBrokerImportOpen}
        onClose={() => setIsBrokerImportOpen(false)}
      />
    </div>
  );
};
