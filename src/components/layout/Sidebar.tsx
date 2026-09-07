import React from "react";
import {
  LayoutDashboard,
  TrendingUp,
  Calculator,
  Briefcase,
  BookOpen,
  LineChart,
  GraduationCap,
  HeartHandshake,
  Settings,
  ShieldAlert,
  Sparkles,
  Bookmark,
  Flame
} from "lucide-react";
import { useApp } from "../../context/AppContext";

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, discipline, journal, paperPositions, academyLessons } = useApp();

  const unreadLessons = academyLessons.filter(l => !l.isCompleted).length;
  const openTradesCount = journal.filter(t => t.status === "OPEN").length;

  const mainNavItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    {
      id: "tradepulse",
      label: "NIFTY 50 Analyzer",
      icon: <Flame className="w-4 h-4 text-emerald-400" />,
      badge: "AI Pro"
    },
    { id: "markets", label: "Markets", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "watchlist", label: "Watchlist", icon: <Bookmark className="w-4 h-4" /> },
    { id: "planner", label: "Trade Planner", icon: <Calculator className="w-4 h-4" /> },
    {
      id: "paper",
      label: "Paper Trading",
      icon: <Briefcase className="w-4 h-4" />,
      badge: paperPositions.length > 0 ? `${paperPositions.length} open` : undefined
    },
    {
      id: "journal",
      label: "Journal",
      icon: <BookOpen className="w-4 h-4" />,
      badge: openTradesCount > 0 ? `${openTradesCount} active` : undefined
    },
    { id: "psychology", label: "Psychology", icon: <HeartHandshake className="w-4 h-4" /> },
    { id: "analytics", label: "Analytics", icon: <LineChart className="w-4 h-4" /> },
    {
      id: "academy",
      label: "Academy",
      icon: <GraduationCap className="w-4 h-4" />,
      badge: unreadLessons > 0 ? `${unreadLessons} left` : undefined
    }
  ];

  const secondaryNavItems = [
    { id: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-bg-secondary border-r border-border-subtle h-screen sticky top-0 z-30 select-none">
      {/* Logo Brand Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border-subtle/80">
        <div className="w-9 h-9 rounded-xl bg-brand-accent/15 border border-brand-accent/30 flex items-center justify-center text-brand-accent shadow-sm">
          <TrendingUp className="w-5 h-5 text-brand-accent" />
        </div>
        <div>
          <h1 className="text-base font-bold text-text-primary tracking-wider flex items-center gap-1.5">
            TRADEWISE
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-accent/20 text-brand-accent font-semibold uppercase">
              Pro
            </span>
          </h1>
          <p className="text-[11px] text-text-muted">Discipline & Companion</p>
        </div>
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
        <div className="px-3 pb-2 text-[10px] font-bold text-text-muted uppercase tracking-wider">
          Core Modules
        </div>
        {mainNavItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-bg-elevated text-text-primary border border-border-subtle shadow-sm font-semibold text-brand-accent"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-card/70"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? "text-brand-accent" : "text-text-muted"}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-2 py-0.5 text-[10px] rounded-full bg-brand-accent/15 text-brand-accent font-semibold">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-4 px-3 pb-2 text-[10px] font-bold text-text-muted uppercase tracking-wider">
          System
        </div>
        {secondaryNavItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-bg-elevated text-text-primary border border-border-subtle shadow-sm font-semibold text-brand-accent"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-card/70"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? "text-brand-accent" : "text-text-muted"}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Mini Discipline Card */}
      <div className="p-4 border-t border-border-subtle/80 bg-bg-card/50 m-3 rounded-2xl border">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-text-secondary">Discipline Score</span>
          <span className="text-xs font-bold text-brand-positive">{discipline.overallScore}/100</span>
        </div>
        <div className="w-full bg-bg-secondary h-1.5 rounded-full overflow-hidden mb-2">
          <div
            className="bg-brand-positive h-full rounded-full transition-all duration-500"
            style={{ width: `${discipline.overallScore}%` }}
          />
        </div>
        <p className="text-[11px] text-text-muted leading-tight">
          Process &gt; Profits. Stick to your risk rules today.
        </p>
      </div>
    </aside>
  );
};