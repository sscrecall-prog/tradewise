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
  Bookmark,
  Flame,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronLeft,
  ChevronRight,
  X,
  Layers,
  Compass,
  Target,
  Lock,
  Clock,
  Sparkles,
  Sun,
  Moon
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { useTheme } from "../../context/ThemeContext";
import { BrandLogo } from "../common/BrandLogo";

export const Sidebar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const {
    activeTab,
    setActiveTab,
    profile,
    discipline,
    journal,
    paperPositions,
    academyLessons,
    isSidebarCollapsed,
    toggleSidebar,
    isMobileSidebarOpen,
    toggleMobileSidebar,
    openAnalyticsTab,
    setIsTiltLockModalOpen,
    isTiltLocked,
    analyticsActiveTab
  } = useApp();

  const unreadLessons = academyLessons.filter(l => !l.isCompleted).length;
  const openTradesCount = journal.filter(t => t.status === "OPEN").length;

  const mainNavItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    {
      id: "derivatives",
      label: "F&O Option Chain",
      icon: <Layers className="w-4 h-4 text-purple-400" />,
      badge: "Live OI"
    },
    {
      id: "time-mae",
      label: "Time & MAE/MFE Edge",
      icon: <Target className="w-4 h-4 text-brand-positive" />,
      badge: "Edge"
    },
    {
      id: "fii-dii",
      label: "FII / DII Flow Radar",
      icon: <Compass className="w-4 h-4 text-cyan-400" />,
      badge: "Smart Money"
    },
    {
      id: "tilt-lock",
      label: "Tilt Lock Shield",
      icon: <Lock className={`w-4 h-4 ${isTiltLocked ? "text-rose-500 animate-pulse" : "text-rose-400"}`} />,
      badge: isTiltLocked ? "LOCKED 🛑" : "Discipline"
    },
    {
      id: "tradepulse",
      label: "NIFTY 50 Analyzer",
      icon: <Flame className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />,
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

  const isItemActive = (id: string) => {
    if (id === "time-mae") {
      return activeTab === "analytics" && (analyticsActiveTab === "TIME_OF_DAY" || analyticsActiveTab === "MFE_MAE");
    }
    if (id === "analytics") {
      return activeTab === "analytics" && (analyticsActiveTab === "OVERVIEW" || analyticsActiveTab === "COST_INDISCIPLINE");
    }
    if (id === "tilt-lock") {
      return false;
    }
    return activeTab === id;
  };

  const handleNavClick = (id: string) => {
    if (id === "time-mae") {
      openAnalyticsTab("TIME_OF_DAY");
    } else if (id === "tilt-lock") {
      setIsTiltLockModalOpen(true);
    } else {
      setActiveTab(id);
    }
    if (isMobileSidebarOpen) {
      toggleMobileSidebar();
    }
  };

  const getBadgeStyle = (id: string, isActive: boolean) => {
    if (isActive) return "bg-dark-950/20 text-dark-950";
    switch (id) {
      case "derivatives":
        return "bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30";
      case "time-mae":
        return "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-brand-positive border border-emerald-200 dark:border-emerald-500/30";
      case "fii-dii":
        return "bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30";
      case "tilt-lock":
        return "bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30";
      case "tradepulse":
        return "bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30";
      default:
        return "bg-emerald-100 dark:bg-brand-accent/15 text-emerald-800 dark:text-brand-positive border border-emerald-200 dark:border-brand-accent/20";
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileSidebarOpen && (
        <div
          onClick={toggleMobileSidebar}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 md:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-bg-secondary border-r border-border-subtle z-50 md:hidden flex flex-col shadow-2xl transition-transform duration-300 ease-in-out select-none ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        }`}
      >
        {/* Mobile Header with Close Button */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <BrandLogo
              size="md"
              showText={true}
              onClick={() => {
                setActiveTab("dashboard");
                toggleMobileSidebar();
              }}
            />
          </div>
          <button
            onClick={toggleMobileSidebar}
            className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Nav Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
          <div className="px-3 pb-2 text-[10px] font-black text-text-secondary dark:text-text-muted uppercase tracking-wider">
            Core Modules
          </div>
          {mainNavItems.map(item => {
            const isActive = isItemActive(item.id);
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-brand-accent text-dark-950 font-black shadow-md shadow-lime-400/20 scale-[1.01]"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? "text-dark-950" : "text-text-secondary"}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${getBadgeStyle(item.id, isActive)}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-4 px-3 pb-2 text-[10px] font-black text-text-secondary dark:text-text-muted uppercase tracking-wider">
            System
          </div>
          {secondaryNavItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-brand-accent text-dark-950 font-black shadow-md shadow-lime-400/20 scale-[1.01]"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? "text-dark-950" : "text-text-secondary"}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Mobile Bottom Discipline Card */}
        <div className="p-4 border border-border-subtle bg-bg-card m-3 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-text-secondary">Discipline Score</span>
            <span className="text-xs font-black text-emerald-700 dark:text-brand-positive">{discipline.overallScore}/100</span>
          </div>
          <div className="w-full bg-bg-elevated h-2 rounded-full overflow-hidden mb-2 p-0.5 border border-border-subtle">
            <div
              className="gradient-lime-bar h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${discipline.overallScore}%` }}
            />
          </div>
          <p className="text-[11px] text-text-muted leading-tight">
            Process &gt; Profits. Stick to your risk rules today.
          </p>
        </div>

        {/* Mobile Profile & Theme Switcher Bar */}
        <div className="p-3 mx-3 mb-4 rounded-2xl bg-bg-card border border-border-subtle space-y-2.5 shadow-sm">
          {/* User Profile Summary */}
          <div
            onClick={() => {
              setActiveTab("settings");
              toggleMobileSidebar();
            }}
            className="flex items-center justify-between p-1.5 rounded-xl hover:bg-bg-elevated cursor-pointer transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-400 to-lime-300 text-dark-950 font-black text-xs flex items-center justify-center border border-amber-500/40 shadow-xs">
                  {profile.name ? profile.name.slice(0, 2).toUpperCase() : "TR"}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-bg-card" />
              </div>
              <div>
                <div className="text-xs font-black text-text-primary group-hover:text-brand-accent transition-colors">
                  {profile.name || "Trader Profile"}
                </div>
                <div className="text-[10px] text-text-muted font-medium">Pro Terminal • Settings</div>
              </div>
            </div>
            <Settings className="w-4 h-4 text-text-muted group-hover:text-brand-accent transition-colors" />
          </div>

          {/* Theme Mode Segmented Switch */}
          <div className="flex items-center p-1 rounded-xl bg-bg-elevated border border-border-subtle text-xs font-bold">
            <button
              onClick={() => theme !== "light" && toggleTheme()}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
                theme === "light"
                  ? "bg-white text-indigo-700 shadow-sm border border-indigo-200 font-extrabold"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Light Mode</span>
            </button>
            <button
              onClick={() => theme !== "dark" && toggleTheme()}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
                theme === "dark"
                  ? "bg-amber-500/20 text-amber-300 shadow-sm border border-amber-500/40 font-extrabold"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Dark Mode</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Desktop Collapsible Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-bg-secondary border-r border-border-subtle h-screen sticky top-0 z-30 select-none transition-[width] duration-300 ease-in-out relative ${
          isSidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Floating Border Edge Chevron Handle */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-7 z-40 w-6 h-6 rounded-full bg-bg-card hover:bg-bg-elevated text-text-secondary hover:text-brand-accent border border-border-subtle shadow-md flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          title={isSidebarCollapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
          )}
        </button>

        {/* Brand Header */}
        <div
          className={`flex items-center py-5 border-b border-border-subtle ${
            isSidebarCollapsed ? "flex-col justify-center px-2 gap-2" : "justify-between px-5"
          }`}
        >
          <BrandLogo
            size={isSidebarCollapsed ? "sm" : "md"}
            showText={!isSidebarCollapsed}
            onClick={() => setActiveTab("dashboard")}
          />

          {/* Header Toggle Button */}
          {!isSidebarCollapsed ? (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-xl hover:bg-bg-elevated text-text-secondary hover:text-brand-accent transition-colors flex-shrink-0"
              title="Collapse sidebar (Ctrl+B)"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-xl hover:bg-bg-elevated text-text-secondary hover:text-brand-accent transition-colors mt-1"
              title="Expand sidebar (Ctrl+B)"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="w-4 h-4 text-brand-positive" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1.5 custom-scrollbar overflow-x-hidden">
          {!isSidebarCollapsed && (
            <div className="px-3 pb-2 text-[10px] font-black text-text-secondary dark:text-text-muted uppercase tracking-wider">
              Core Modules
            </div>
          )}

          {mainNavItems.map(item => {
            const isActive = isItemActive(item.id);
            return (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center rounded-2xl text-xs font-semibold transition-all duration-150 ${
                    isSidebarCollapsed
                      ? "h-11 justify-center px-0"
                      : "justify-between px-3.5 py-2.5"
                  } ${
                    isActive
                      ? "bg-brand-accent text-dark-950 font-black shadow-md shadow-lime-400/20 scale-[1.01]"
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                  }`}
                >
                  <div className={`flex items-center ${isSidebarCollapsed ? "justify-center relative" : "gap-3"}`}>
                    <span className={isActive ? "text-dark-950" : "text-text-secondary"}>
                      {item.icon}
                    </span>
                    {!isSidebarCollapsed && <span className="whitespace-nowrap">{item.label}</span>}

                    {/* Dot badge on collapsed mode */}
                    {isSidebarCollapsed && item.badge && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-brand-accent" />
                    )}
                  </div>

                  {!isSidebarCollapsed && item.badge && (
                    <span
                      className={`px-2 py-0.5 text-[10px] rounded-full font-bold whitespace-nowrap ${getBadgeStyle(item.id, isActive)}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>

                {/* Floating Tooltip in Collapsed Mode */}
                {isSidebarCollapsed && (
                  <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-dark-950 text-white text-xs font-bold border border-border-subtle shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 flex items-center gap-2">
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 rounded-full bg-brand-accent/20 text-brand-accent text-[9px] font-black">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <div className="pt-3">
            {!isSidebarCollapsed ? (
              <div className="px-3 pb-2 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                System
              </div>
            ) : (
              <div className="w-8 mx-auto border-t border-border-subtle my-2" />
            )}
          </div>

          {secondaryNavItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center rounded-2xl text-xs font-semibold transition-all duration-150 ${
                    isSidebarCollapsed
                      ? "h-11 justify-center px-0"
                      : "justify-between px-3.5 py-2.5"
                  } ${
                    isActive
                      ? "bg-brand-accent text-dark-950 font-black shadow-md shadow-lime-400/20 scale-[1.01]"
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                  }`}
                >
                  <div className={`flex items-center ${isSidebarCollapsed ? "justify-center" : "gap-3"}`}>
                    <span className={isActive ? "text-dark-950" : "text-text-secondary"}>
                      {item.icon}
                    </span>
                    {!isSidebarCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
                  </div>
                </button>

                {/* Floating Tooltip in Collapsed Mode */}
                {isSidebarCollapsed && (
                  <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-dark-950 text-white text-xs font-bold border border-border-subtle shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Discipline Card */}
        {!isSidebarCollapsed ? (
          <>
            <div className="p-4 border border-border-subtle bg-bg-card m-3 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-text-secondary">Discipline Score</span>
                <span className="text-xs font-black text-emerald-700 dark:text-brand-positive">{discipline.overallScore}/100</span>
              </div>
              <div className="w-full bg-bg-elevated h-2 rounded-full overflow-hidden mb-2 p-0.5 border border-border-subtle">
                <div
                  className="gradient-lime-bar h-full rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${discipline.overallScore}%` }}
                />
              </div>
              <p className="text-[11px] text-text-muted leading-tight">
                Process &gt; Profits. Stick to your risk rules today.
              </p>
            </div>

            {/* Desktop Profile & Theme Bar */}
            <div className="p-3 mx-3 mb-4 rounded-2xl bg-bg-card border border-border-subtle space-y-2.5 shadow-sm">
              {/* User Profile Summary */}
              <div
                onClick={() => setActiveTab("settings")}
                className="flex items-center justify-between p-1.5 rounded-xl hover:bg-bg-elevated cursor-pointer transition-colors group"
                title="Open Trader Profile & Settings"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-400 to-lime-300 text-dark-950 font-black text-xs flex items-center justify-center border border-amber-500/40 shadow-xs">
                      {profile.name ? profile.name.slice(0, 2).toUpperCase() : "TR"}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-bg-card" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-black text-text-primary group-hover:text-brand-accent transition-colors truncate">
                      {profile.name || "Trader Profile"}
                    </div>
                    <div className="text-[10px] text-emerald-700 dark:text-brand-positive font-mono font-bold">Pro Terminal</div>
                  </div>
                </div>
                <Settings className="w-4 h-4 text-text-muted group-hover:text-brand-accent transition-colors flex-shrink-0" />
              </div>

              {/* Desktop Theme Mode Switch */}
              <div className="flex items-center p-1 rounded-xl bg-bg-elevated border border-border-subtle text-xs font-bold">
                <button
                  onClick={() => theme !== "light" && toggleTheme()}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
                    theme === "light"
                      ? "bg-white text-indigo-700 shadow-sm border border-indigo-200 font-extrabold"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                  title="Switch to Light Theme"
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Light</span>
                </button>
                <button
                  onClick={() => theme !== "dark" && toggleTheme()}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
                    theme === "dark"
                      ? "bg-amber-500/20 text-amber-300 shadow-sm border border-amber-500/40 font-extrabold"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                  title="Switch to Dark Theme"
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Dark</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 mb-4">
            {/* Discipline Score Icon */}
            <div
              onClick={() => setActiveTab("psychology")}
              className="p-2 rounded-2xl bg-bg-card border border-border-subtle cursor-pointer hover:border-brand-accent/40 transition-colors flex flex-col items-center group relative shadow-sm"
              title={`Discipline Score: ${discipline.overallScore}/100`}
            >
              <ShieldAlert className="w-4 h-4 text-brand-positive" />
              <span className="text-[9px] font-black text-brand-positive mt-0.5">
                {discipline.overallScore}
              </span>
              <div className="absolute left-full ml-3 bottom-0 px-3 py-1.5 rounded-xl bg-dark-950 text-white text-xs font-bold border border-border-subtle shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Discipline Score: {discipline.overallScore}/100
              </div>
            </div>

            {/* Collapsed Theme Toggle Icon */}
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-2xl border transition-all cursor-pointer group relative shadow-sm ${
                theme === "dark"
                  ? "bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25"
                  : "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
              }`}
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400 fill-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600 fill-indigo-600" />}
              <div className="absolute left-full ml-3 bottom-0 px-3 py-1.5 rounded-xl bg-dark-950 text-white text-xs font-bold border border-border-subtle shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                {theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              </div>
            </button>

            {/* Collapsed Profile Avatar */}
            <div
              onClick={() => setActiveTab("settings")}
              className="p-1 rounded-full bg-bg-card border border-border-subtle cursor-pointer hover:border-brand-accent/60 transition-colors group relative shadow-sm"
              title="Trader Profile & Settings"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-400 to-lime-300 text-dark-950 font-black text-[10px] flex items-center justify-center border border-amber-500/40">
                {profile.name ? profile.name.slice(0, 2).toUpperCase() : "TR"}
              </div>
              <div className="absolute left-full ml-3 bottom-0 px-3 py-1.5 rounded-xl bg-dark-950 text-white text-xs font-bold border border-border-subtle shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Profile: {profile.name || "Trader"} (Settings)
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};