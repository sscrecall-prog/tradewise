import React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { useApp } from "../../context/AppContext";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { isSidebarCollapsed } = useApp();

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Desktop Sidebar Navigation (Collapsible) & Mobile Drawer */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8 transition-all duration-300">
        <Header />
        <main
          className={`flex-1 p-4 sm:p-6 lg:p-8 w-full mx-auto animate-fadeIn transition-all duration-300 ${
            isSidebarCollapsed ? "max-w-[1550px]" : "max-w-7xl"
          }`}
        >
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav />
    </div>
  );
};