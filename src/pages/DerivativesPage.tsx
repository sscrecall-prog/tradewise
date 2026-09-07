import React, { useState, useMemo } from "react";
import { useMarketData } from "../context/MarketDataContext";
import { DerivativesService } from "../services/DerivativesService";
import { DerivativesHeader } from "../components/derivatives/DerivativesHeader";
import { VixRiskBanner } from "../components/derivatives/VixRiskBanner";
import { DerivativesMacroCards } from "../components/derivatives/DerivativesMacroCards";
import { OptionChainTable } from "../components/derivatives/OptionChainTable";
import { OiVisualizerChart } from "../components/derivatives/OiVisualizerChart";
import { MaxPainVisualizer } from "../components/derivatives/MaxPainVisualizer";
import { Layers, BarChart3, Target } from "lucide-react";

export const DerivativesPage: React.FC = () => {
  const { indices } = useMarketData();

  const [selectedUnderlying, setSelectedUnderlying] = useState<'NIFTY' | 'BANKNIFTY' | 'FINNIFTY' | 'SENSEX'>('NIFTY');
  const [selectedExpiry, setSelectedExpiry] = useState<string>('10-Sep-2026 (Weekly)');
  const [customVix, setCustomVix] = useState<number>(13.4);
  const [activeSubTab, setActiveSubTab] = useState<'CHAIN' | 'OI_CHARTS' | 'MAX_PAIN'>('CHAIN');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Retrieve current live spot price from market indices if available
  const liveSpotPrice = useMemo(() => {
    const matchedIndex = indices.find(idx => {
      if (selectedUnderlying === 'NIFTY') return idx.symbol === 'NIFTY' || idx.name.includes('NIFTY 50');
      if (selectedUnderlying === 'BANKNIFTY') return idx.symbol === 'BANKNIFTY' || idx.name.includes('BANK');
      if (selectedUnderlying === 'FINNIFTY') return idx.symbol === 'FINNIFTY';
      if (selectedUnderlying === 'SENSEX') return idx.symbol === 'SENSEX';
      return false;
    });
    return matchedIndex?.price;
  }, [indices, selectedUnderlying]);

  // Generate Option Chain
  const chainData = useMemo(() => {
    return DerivativesService.generateOptionChain(
      selectedUnderlying,
      selectedExpiry,
      liveSpotPrice,
      customVix
    );
  }, [selectedUnderlying, selectedExpiry, liveSpotPrice, customVix]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Primary Header: Index & Expiry Controls */}
      <DerivativesHeader
        data={chainData}
        selectedUnderlying={selectedUnderlying}
        onSelectUnderlying={setSelectedUnderlying}
        selectedExpiry={selectedExpiry}
        onSelectExpiry={setSelectedExpiry}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* 2. India VIX Dynamic Risk Sizing Engine Banner */}
      <VixRiskBanner
        vixRisk={chainData.vixRisk}
        vixValue={customVix}
        onVixChange={setCustomVix}
      />

      {/* 3. Macro Derivatives Analytics Cards: PCR, Max Pain, Walls */}
      <DerivativesMacroCards data={chainData} />

      {/* 4. Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveSubTab('CHAIN')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'CHAIN'
              ? 'bg-brand-accent text-bg-primary shadow-md shadow-lime-400/20 scale-[1.02]'
              : 'bg-bg-card text-text-secondary hover:text-text-primary hover:bg-bg-elevated border border-border-subtle'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Option Chain Matrix</span>
        </button>

        <button
          onClick={() => setActiveSubTab('OI_CHARTS')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'OI_CHARTS'
              ? 'bg-brand-accent text-bg-primary shadow-md shadow-lime-400/20 scale-[1.02]'
              : 'bg-bg-card text-text-secondary hover:text-text-primary hover:bg-bg-elevated border border-border-subtle'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Open Interest (OI) Bar Charts</span>
        </button>

        <button
          onClick={() => setActiveSubTab('MAX_PAIN')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'MAX_PAIN'
              ? 'bg-brand-accent text-bg-primary shadow-md shadow-lime-400/20 scale-[1.02]'
              : 'bg-bg-card text-text-secondary hover:text-text-primary hover:bg-bg-elevated border border-border-subtle'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Max Pain Curve Analytics</span>
        </button>
      </div>

      {/* 5. Sub Tab Content */}
      {activeSubTab === 'CHAIN' && (
        <OptionChainTable data={chainData} />
      )}

      {activeSubTab === 'OI_CHARTS' && (
        <OiVisualizerChart data={chainData} />
      )}

      {activeSubTab === 'MAX_PAIN' && (
        <MaxPainVisualizer data={chainData} />
      )}
    </div>
  );
};
