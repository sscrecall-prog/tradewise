import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";
import confetti from "canvas-confetti";
import {
  Settings as SettingsIcon,
  Shield,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  User,
  Sparkles,
  Lock,
  FilePlus2,
  Trash2,
  RefreshCw,
  Wallet,
  Compass,
  ArrowRight,
  Info
} from "lucide-react";

export const SettingsPage: React.FC = () => {
  const {
    profile,
    updateProfile,
    preferences,
    updatePreferences,
    exportDataJSON,
    importDataJSON,
    resetAllDemoData,
    startFreshBlankCanvas,
    journal,
    paperPortfolio,
    tradePlans
  } = useApp();

  // Local form state for preferences
  const [capital, setCapital] = useState(preferences.defaultCapital);
  const [riskPercent, setRiskPercent] = useState(preferences.defaultRiskPercentage);
  const [maxLoss, setMaxLoss] = useState(preferences.maxDailyLoss);
  const [maxTrades, setMaxTrades] = useState(preferences.maxTradesPerDay);
  const [brokerage, setBrokerage] = useState(preferences.defaultBrokeragePerOrder);

  // Profile
  const [name, setName] = useState(profile.name);
  const [tradingStyle, setTradingStyle] = useState(profile.tradingStyle);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [jsonImportText, setJsonImportText] = useState("");
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Blank Canvas Modal State
  const [isBlankCanvasModalOpen, setIsBlankCanvasModalOpen] = useState(false);
  const [freshCapital, setFreshCapital] = useState(preferences.defaultCapital || 100000);
  const [freshTraderName, setFreshTraderName] = useState(profile.name || "My Trading Account");
  const [freshSuccessMessage, setFreshSuccessMessage] = useState<string | null>(null);
  const [isProcessingFresh, setIsProcessingFresh] = useState(false);

  const isBlankCanvasActive = journal.length === 0;

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    await updatePreferences({
      defaultCapital: capital,
      defaultRiskPercentage: riskPercent,
      maxDailyLoss: maxLoss,
      maxTradesPerDay: maxTrades,
      defaultBrokeragePerOrder: brokerage
    });
    await updateProfile({
      name,
      tradingStyle
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExport = async () => {
    const jsonStr = await exportDataJSON();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tradewise_backup_${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    if (!jsonImportText.trim()) return;
    const res = await importDataJSON(jsonImportText);
    setImportStatus(res.message);
    if (res.success) {
      setJsonImportText("");
      setTimeout(() => setImportStatus(null), 3500);
    }
  };

  const handleRestoreDemoData = async () => {
    if (
      window.confirm(
        "Are you sure you want to restore demo data? This will load 30 realistic Indian stock, options, and F&O sample trades."
      )
    ) {
      await resetAllDemoData();
      setFreshSuccessMessage("Demo sample trades restored successfully!");
      setTimeout(() => setFreshSuccessMessage(null), 4000);
    }
  };

  const handleConfirmStartFresh = async () => {
    setIsProcessingFresh(true);
    try {
      await startFreshBlankCanvas({
        startingCapital: freshCapital,
        traderName: freshTraderName
      });

      // Update local form state as well
      setCapital(freshCapital);
      setName(freshTraderName);

      setIsBlankCanvasModalOpen(false);

      // Trigger celebration confetti for fresh start
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      setFreshSuccessMessage("✨ Blank Canvas Activated! Your journal is now 100% clean and ready for your real trades.");
      setTimeout(() => setFreshSuccessMessage(null), 5000);
    } catch (e) {
      console.error(e);
      alert("Failed to activate Blank Canvas. Please try again.");
    } finally {
      setIsProcessingFresh(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Mode Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-text-primary tracking-tight">
            System Settings & Risk Parameters
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Configure capital rules, start fresh with a blank canvas, or manage local backup
          </p>
        </div>

        {/* Current State Mode Badge */}
        <div className="flex items-center gap-2">
          {isBlankCanvasActive ? (
            <Badge variant="accent" size="md" className="flex items-center gap-1.5 px-3 py-1 bg-brand-accent/15 border-brand-accent/40 text-brand-accent">
              <Sparkles className="w-3.5 h-3.5" /> Blank Canvas Active (0 Trades)
            </Badge>
          ) : (
            <Badge variant="neutral" size="md" className="flex items-center gap-1.5 px-3 py-1">
              <Compass className="w-3.5 h-3.5 text-text-muted" /> Demo Mode ({journal.length} Sample Trades)
            </Badge>
          )}
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-brand-positive/15 border border-brand-positive/30 text-brand-positive text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {freshSuccessMessage && (
        <div className="p-4 rounded-2xl bg-brand-accent/15 border border-brand-accent/40 text-brand-accent text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
          <Sparkles className="w-4 h-4 flex-shrink-0" />
          <span>{freshSuccessMessage}</span>
        </div>
      )}

      {/* START FRESH (BLANK CANVAS) HERO FEATURE CARD */}
      <div className="relative p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-bg-card via-bg-card to-brand-accent/5 border-2 border-brand-accent/30 shadow-xl overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand-accent/20 border border-brand-accent/40 flex items-center justify-center text-brand-accent">
                <FilePlus2 className="w-4 h-4" />
              </div>
              <h3 className="text-base font-extrabold text-text-primary tracking-tight">
                Start Fresh (Blank Canvas) / शून्य से शुरुआत
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-accent text-bg-primary">
                Clean Slate
              </span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Apne personal live trading ke liye journal ko <strong>100% clean aur fresh</strong> banayein. Yeh option sabhi pre-seeded sample trades, demo notes aur dummy paper orders ko clear kar deta hai, taaki aap apna real trading journey zero se start kar sakein.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <div className="p-2 rounded-xl bg-bg-secondary/70 border border-border-subtle text-center">
                <span className="text-[10px] text-text-muted block">Journal Trades</span>
                <strong className="text-xs font-bold text-text-primary">₹0 P&L / 0 Trades</strong>
              </div>
              <div className="p-2 rounded-xl bg-bg-secondary/70 border border-border-subtle text-center">
                <span className="text-[10px] text-text-muted block">Discipline Score</span>
                <strong className="text-xs font-bold text-brand-positive">100% Clean</strong>
              </div>
              <div className="p-2 rounded-xl bg-bg-secondary/70 border border-border-subtle text-center">
                <span className="text-[10px] text-text-muted block">Starting Capital</span>
                <strong className="text-xs font-bold text-brand-accent">Custom Choice</strong>
              </div>
              <div className="p-2 rounded-xl bg-bg-secondary/70 border border-border-subtle text-center">
                <span className="text-[10px] text-text-muted block">Safety</span>
                <strong className="text-xs font-bold text-text-secondary">Reversible</strong>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => setIsBlankCanvasModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-brand-accent hover:bg-brand-accent/90 text-bg-primary font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-accent/20 hover:scale-[1.02] transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start Fresh (Blank Canvas)</span>
            </button>

            {!isBlankCanvasActive && (
              <span className="text-[10px] text-text-muted text-center">
                Currently {journal.length} demo trades loaded
              </span>
            )}
            {isBlankCanvasActive && (
              <span className="text-[10px] text-brand-positive font-bold text-center flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Canvas is clean & ready!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSavePreferences} className="space-y-6">
        {/* Profile Card */}
        <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle space-y-4">
          <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <User className="w-4 h-4 text-brand-accent" />
            Trader Profile & Specialization
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Trader Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-bg-secondary border border-border-subtle rounded-xl px-3 py-2 text-xs font-bold text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Trading Specialization</label>
              <select
                value={tradingStyle}
                onChange={e => setTradingStyle(e.target.value as any)}
                className="w-full bg-bg-secondary border border-border-subtle rounded-xl px-3 py-2 text-xs font-semibold text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent"
              >
                <option value="Intraday Trader">Intraday Trader (F&O / MIS)</option>
                <option value="Swing Trader">Swing Trader (Cash CNC / Positional)</option>
                <option value="Position Trader">Position Trader</option>
                <option value="Beginner Learner">Beginner Learner</option>
              </select>
            </div>
          </div>
        </div>

        {/* Risk Management & Circuit Breaker */}
        <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand-accent" />
              Risk Limits & Circuit Breaker Protection
            </h3>
            <Badge variant="accent" size="sm">Capital Guard</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Default Account Capital (₹)
              </label>
              <input
                type="number"
                step="5000"
                value={capital}
                onChange={e => setCapital(parseFloat(e.target.value) || 0)}
                className="w-full bg-bg-secondary border border-border-subtle rounded-xl px-3 py-2 text-xs font-bold text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Default Risk % per Trade
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="5"
                value={riskPercent}
                onChange={e => setRiskPercent(parseFloat(e.target.value) || 1)}
                className="w-full bg-bg-secondary border border-border-subtle rounded-xl px-3 py-2 text-xs font-bold text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Max Daily Loss Circuit Breaker (₹)
              </label>
              <input
                type="number"
                step="500"
                value={maxLoss}
                onChange={e => setMaxLoss(parseFloat(e.target.value) || 0)}
                className="w-full bg-bg-secondary border border-border-subtle rounded-xl px-3 py-2 text-xs font-bold text-brand-negative focus:outline-none focus:ring-1 focus:ring-brand-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Max Trades Allowed Per Day
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={maxTrades}
                onChange={e => setMaxTrades(parseInt(e.target.value) || 2)}
                className="w-full bg-bg-secondary border border-border-subtle rounded-xl px-3 py-2 text-xs font-bold text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Brokerage per Executed Order (₹)
              </label>
              <input
                type="number"
                min="0"
                value={brokerage}
                onChange={e => setBrokerage(parseFloat(e.target.value) || 20)}
                className="w-full bg-bg-secondary border border-border-subtle rounded-xl px-3 py-2 text-xs font-bold text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="primary" icon={<Sparkles className="w-4 h-4" />}>
              Save Risk Parameters
            </Button>
          </div>
        </div>
      </form>

      {/* Local Storage & Backup Management */}
      <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Lock className="w-4 h-4 text-brand-accent" />
              Privacy, Backup & Demo Restore
            </h3>
            <p className="text-xs text-text-muted">
              100% offline-first. Your financial trades and notes are never sent to third-party servers.
            </p>
          </div>
          <Badge variant="positive" size="sm">Local Device Only</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Export JSON */}
          <div className="p-4 rounded-2xl bg-bg-secondary border border-border-subtle space-y-3">
            <span className="text-xs font-bold text-text-primary block">
              Download Full Journal Backup (JSON)
            </span>
            <p className="text-xs text-text-muted leading-relaxed">
              Export all your trade entries, psychology logs, plans, and customized preferences as a single JSON file.
            </p>
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="w-4 h-4" />}
              onClick={handleExport}
            >
              Export JSON Backup
            </Button>
          </div>

          {/* Reset / Restore Demo Data */}
          <div className="p-4 rounded-2xl bg-bg-secondary border border-border-subtle space-y-3">
            <span className="text-xs font-bold text-text-secondary block">
              Restore Indian Trader Demo Data
            </span>
            <p className="text-xs text-text-muted leading-relaxed">
              Loads 30 realistic Indian F&O & Equity sample trades (Reliance, Nifty Options, Tata Motors) to explore reports.
            </p>
            <Button
              variant="secondary"
              size="sm"
              icon={<RotateCcw className="w-4 h-4" />}
              onClick={handleRestoreDemoData}
            >
              Restore Sample Trades (30 Trades)
            </Button>
          </div>
        </div>

        {/* Import JSON */}
        <div className="p-4 rounded-2xl bg-bg-secondary border border-border-subtle space-y-3">
          <span className="text-xs font-bold text-text-primary block">
            Import Backup JSON
          </span>
          {importStatus && (
            <div className="text-xs text-brand-accent font-semibold">{importStatus}</div>
          )}
          <textarea
            rows={3}
            value={jsonImportText}
            onChange={e => setJsonImportText(e.target.value)}
            placeholder="Paste your exported JSON backup content here..."
            className="w-full bg-bg-elevated border border-border-subtle rounded-xl p-3 text-xs font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand-accent custom-scrollbar"
          />
          <div className="flex justify-end">
            <Button
              variant="secondary"
              size="sm"
              icon={<Upload className="w-4 h-4" />}
              onClick={handleImport}
              disabled={!jsonImportText.trim()}
            >
              Restore from JSON
            </Button>
          </div>
        </div>
      </div>

      {/* START FRESH (BLANK CANVAS) CONFIRMATION MODAL */}
      {isBlankCanvasModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => !isProcessingFresh && setIsBlankCanvasModalOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-bg-card border border-border-subtle rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5 z-10 animate-scaleUp">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-accent/20 border border-brand-accent/30 flex items-center justify-center text-brand-accent">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-text-primary">
                  Start Fresh with a Blank Canvas
                </h3>
                <p className="text-xs text-text-muted">
                  Initialize a 100% clean journal for your personal trading
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-start gap-2.5">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Notice:</strong> All existing {journal.length} sample trades, trade plans, and paper positions will be erased. Your journal will be ready at ₹0 P&L.
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">
                  Your Trader Name / Display Name
                </label>
                <input
                  type="text"
                  value={freshTraderName}
                  onChange={e => setFreshTraderName(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-subtle rounded-xl px-3.5 py-2.5 text-xs font-bold text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent"
                  placeholder="e.g. Rahul Sharma"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">
                  Your Starting Trading Capital (₹)
                </label>
                <input
                  type="number"
                  step="5000"
                  value={freshCapital}
                  onChange={e => setFreshCapital(parseFloat(e.target.value) || 0)}
                  className="w-full bg-bg-secondary border border-border-subtle rounded-xl px-3.5 py-2.5 text-xs font-bold text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent"
                  placeholder="e.g. 50000 or 100000"
                />
                <span className="text-[11px] text-text-muted mt-1 block">
                  Used as the baseline capital for position sizing, risk rules, and paper trading.
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border-subtle">
              <button
                type="button"
                onClick={handleExport}
                className="text-xs text-text-muted hover:text-brand-accent flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save JSON Backup First</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBlankCanvasModalOpen(false)}
                  disabled={isProcessingFresh}
                  className="flex-1 sm:flex-initial"
                >
                  Cancel
                </Button>
                <button
                  type="button"
                  onClick={handleConfirmStartFresh}
                  disabled={isProcessingFresh}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-bg-primary font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-brand-accent/20 transition-all"
                >
                  {isProcessingFresh ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>Confirm & Start Fresh</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
