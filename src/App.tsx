import React from "react";
import { useApp } from "./context/AppContext";
import { AppLayout } from "./components/layout/AppLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { JournalPage } from "./pages/JournalPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { PlannerPage } from "./pages/PlannerPage";
import { PsychologyPage } from "./pages/PsychologyPage";
import { MarketsPage } from "./pages/MarketsPage";
import { TradePulsePage } from "./pages/TradePulsePage";
import { WatchlistPage } from "./pages/WatchlistPage";
import { PaperTradingPage } from "./pages/PaperTradingPage";
import { AcademyPage } from "./pages/AcademyPage";
import { SettingsPage } from "./pages/SettingsPage";

import { NewTradeModal } from "./components/modals/NewTradeModal";
import { StockDetailModal } from "./components/modals/StockDetailModal";
import { PlaceOrderModal } from "./components/modals/PlaceOrderModal";
import { ContractNoteModal } from "./components/modals/ContractNoteModal";
import { TiltLockModal } from "./components/modals/TiltLockModal";

export const App: React.FC = () => {
  const {
    activeTab,
    selectedContractNoteOrder,
    isContractNoteModalOpen,
    setIsContractNoteModalOpen
  } = useApp();

  const renderActivePage = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardPage />;
      case "tradepulse":
        return <TradePulsePage />;
      case "markets":
        return <MarketsPage />;
      case "watchlist":
        return <WatchlistPage />;
      case "planner":
        return <PlannerPage />;
      case "paper":
        return <PaperTradingPage />;
      case "journal":
        return <JournalPage />;
      case "psychology":
        return <PsychologyPage />;
      case "analytics":
        return <AnalyticsPage />;
      case "academy":
        return <AcademyPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <AppLayout>
      {renderActivePage()}

      {/* Global Modals Mounted at Root */}
      <NewTradeModal />
      <StockDetailModal />
      <PlaceOrderModal />
      <ContractNoteModal
        order={selectedContractNoteOrder}
        isOpen={isContractNoteModalOpen}
        onClose={() => setIsContractNoteModalOpen(false)}
      />
      <TiltLockModal />
    </AppLayout>
  );
};
