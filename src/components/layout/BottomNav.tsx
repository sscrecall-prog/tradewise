import React from "react";
import {
  LayoutDashboard,
  TrendingUp,
  Calculator,
  BookOpen,
  Briefcase,
  User
} from "lucide-react";
import { useApp } from "../../context/AppContext";

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const navItems = [
    { id: "dashboard", label: "Home", icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: "markets", label: "Markets", icon: <TrendingUp className="w-5 h-5" /> },
    { id: "planner", label: "Trade", icon: <Calculator className="w-5 h-5" /> },
    { id: "journal", label: "Journal", icon: <BookOpen className="w-5 h-5" /> },
    { id: "paper", label: "Paper", icon: <Briefcase className="w-5 h-5" /> },
    { id: "settings", label: "Profile", icon: <User className="w-5 h-5" /> }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg-secondary/95 backdrop-blur-lg border-t border-border-subtle px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-inset-bottom">
      {navItems.map(item => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-150 ${
              isActive ? "text-brand-accent font-semibold" : "text-text-muted hover:text-text-secondary"
            }`}
          >
            <div className={`p-1 rounded-lg ${isActive ? "bg-brand-accent/15" : ""}`}>{item.icon}</div>
            <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};