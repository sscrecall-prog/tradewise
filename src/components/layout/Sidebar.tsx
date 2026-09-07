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
  X
} from "lucide-react";
import { useApp } from "../../context/AppContext";

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    discipline,
    journal,
    paperPositions,
    academyLessons,
    isSidebarCollapsed,
    toggleSidebar,
    isMobileSidebarOpen,
    toggleMobileSidebar
  } = useApp();

  const unreadLessons = academyLessons.filter(l => !l.isCompleted).length;
  const openTradesCount = journal.filter(t => t.status === "OPEN").length;

  const mainNavItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
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

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    if (isMobileSidebarOpen) {
      toggleMobileSidebar();
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
            <div className="w-9 h-9 rounded-xl bg-brand-accent/15 border border-brand-accent/30 flex items-center justify-center text-brand-accent shadow-sm">
              <TrendingUp className="w-5 h-5 text-brand-positive" />
            </div>
            <div>
              <h1 className="text-base font-bold text-text-primary tracking-wider flex items-center gap-1.5">
                TRADEWISE
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-accent/20 text-brand-positive font-semibold uppercase">
                  Pro
                </span>
              </h1>
              <p className="text-[11px] text-text-muted">Discipline & Companion</p>
            </div>
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
          <div className="px-3 pb-2 text-[10px] font-bold text-text-muted uppercase tracking-wider">
            Core Modules
          </div>
          {mainNavItems.map(item => {
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
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
                      isActive ? "bg-dark-950/20 text-dark-950" : "bg-brand-accent/15 text-brand-positive"
                    }`}
                  >
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
            <span className="text-xs font-black text-brand-positive">{discipline.overallScore}/100</span>
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
          <div
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-3 cursor-pointer group ${
              isSidebarCollapsed ? "justify-center" : ""
            }`}
            title="TradeWise Pro Dashboard"
          >
            <div className="w-9 h-9 rounded-xl bg-brand-accent/15 border border-brand-accent/30 flex items-center justify-center text-brand-positive shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-brand-positive" />
            </div>
            {!isSidebarCollapsed && (
              <div className="overflow-hidden">
                <h1 className="text-base font-bold text-text-primary tracking-wider flex items-center gap-1.5 whitespace-nowrap">
                  TRADEWISE
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-accent/20 text-brand-positive font-semibold uppercase">
                    Pro
                  </span>
                </h1>
                <p className="text-[11px] text-text-muted whitespace-nowrap">Discipline & Companion</p>
              </div>
            )}
          </div>

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
            <div className="px-3 pb-2 text-[10px] font-bold text-text-muted uppercase tracking-wider">
              Core Modules
            </div>
          )}

          {mainNavItems.map(item => {
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
                      className={`px-2 py-0.5 text-[10px] rounded-full font-bold whitespace-nowrap ${
                        isActive ? "bg-dark-950/20 text-dark-950" : "bg-brand-accent/15 text-brand-positive"
                      }`}
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
          <div className="p-4 border border-border-subtle bg-bg-card m-3 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-text-secondary">Discipline Score</span>
              <span className="text-xs font-black text-brand-positive">{discipline.overallScore}/100</span>
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
        ) : (
          <div
            onClick={() => setActiveTab("psychology")}
            className="p-2.5 mx-auto mb-4 rounded-2xl bg-bg-card border border-border-subtle cursor-pointer hover:border-brand-accent/40 transition-colors flex flex-col items-center group relative shadow-sm"
            title={`Discipline Score: ${discipline.overallScore}/100`}
          >
            <ShieldAlert className="w-4 h-4 text-brand-positive" />
            <span className="text-[10px] font-black text-brand-positive mt-1">
              {discipline.overallScore}
            </span>

            {/* Tooltip */}
            <div className="absolute left-full ml-3 bottom-2 px-3 py-1.5 rounded-xl bg-dark-950 text-white text-xs font-bold border border-border-subtle shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              Discipline Score: {discipline.overallScore}/100
            </div>
          </div>
        )}
      </aside>
    </>
  );
};