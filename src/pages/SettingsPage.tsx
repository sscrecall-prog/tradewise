import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";
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
  Lock
} from "lucide-react";

export const SettingsPage: React.FC = () => {
  const {
    profile,
    updateProfile,
    preferences,
    updatePreferences,
    exportDataJSON,
    importDataJSON,
    resetAllDemoData
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
    setTimeout(() => setSavedSuccess(false), 2000);
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
      setTimeout(() => setImportStatus(null), 3000);
    }
  };

  const handleResetData = async () => {
    if (
      window.confirm(
        "Are you sure you want to reset all data? This will restore initial realistic Indian stock and F&O trades."
      )
    ) {
      await resetAllDemoData();
      alert("TradeWise demo data restored successfully!");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-text-primary tracking-tight">
          System Settings & Risk Parameters
        </h2>
        <p className="text-xs text-text-secondary mt-0.5">
          Configure capital rules, Indian broker defaults, circuit breaker limits, and local backup
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-brand-positive/15 border border-brand-positive/30 text-brand-positive text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>Settings saved successfully!</span>
        </div>
      )}

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
              Privacy & Local Backup
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

          {/* Reset Demo Data */}
          <div className="p-4 rounded-2xl bg-bg-secondary border border-border-subtle space-y-3">
            <span className="text-xs font-bold text-brand-negative block">
              Restore Indian Trader Demo Data
            </span>
            <p className="text-xs text-text-muted leading-relaxed">
              Resets journal with realistic Indian F&O & Equity sample trades, NIFTY options, and discipline scores.
            </p>
            <Button
              variant="danger"
              size="sm"
              icon={<RotateCcw className="w-4 h-4" />}
              onClick={handleResetData}
            >
              Restore Sample Trades
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
    </div>
  );
};
