import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Card } from "../components/common/Card";
import { StatCard } from "../components/common/StatCard";
import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";
import { PlaceOrderModal } from "../components/modals/PlaceOrderModal";
import {
  Briefcase,
  Plus,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck
} from "lucide-react";

export const PaperTradingPage: React.FC = () => {
  const {
    paperPortfolio,
    paperPositions,
    paperOrders,
    closePaperPosition,
    resetPaperTrading,
    setIsPlaceOrderModalOpen,
    setSelectedStockForOrder
  } = useApp();

  const [closingId, setClosingId] = useState<string | null>(null);

  const handleClose = async (positionId: string) => {
    setClosingId(positionId);
    try {
      await closePaperPosition(positionId);
    } finally {
      setClosingId(null);
    }
  };

  const handleReset = async () => {
    if (window.confirm("Are you sure you want to reset your Paper Trading account? Balance will return to ₹1,00,000.")) {
      await resetPaperTrading();
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-text-primary tracking-tight">
            Virtual Paper Trading Terminal
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Test and refine Indian stock & option setups without risking real capital
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={handleReset}
          >
            Reset Account
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => {
              setSelectedStockForOrder(null);
              setIsPlaceOrderModalOpen(true);
            }}
          >
            Place New Order
          </Button>
        </div>
      </div>

      {/* Portfolio Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Portfolio Value"
          value={`₹${Math.round(paperPortfolio.totalPortfolioValue).toLocaleString("en-IN")}`}
          subtitle="Virtual Capital"
          icon={<Briefcase className="w-4 h-4 text-brand-accent" />}
        />

        <StatCard
          title="Available Cash Balance"
          value={`₹${Math.round(paperPortfolio.cashBalance).toLocaleString("en-IN")}`}
          subtitle={`Margin Used: ₹${Math.round(paperPortfolio.usedMargin).toLocaleString("en-IN")}`}
          icon={<ShieldCheck className="w-4 h-4 text-brand-accent" />}
        />

        <StatCard
          title="Realized P&L"
          value={
            <span className={paperPortfolio.realizedPnL >= 0 ? "text-brand-positive" : "text-brand-negative"}>
              {paperPortfolio.realizedPnL >= 0 ? "+₹" : "-₹"}
              {Math.abs(Math.round(paperPortfolio.realizedPnL)).toLocaleString("en-IN")}
            </span>
          }
          subtitle="Closed positions profit"
          icon={<TrendingUp className="w-4 h-4" />}
        />

        <StatCard
          title="Unrealized Open P&L"
          value={
            <span className={paperPortfolio.unrealizedPnL >= 0 ? "text-brand-positive" : "text-brand-negative"}>
              {paperPortfolio.unrealizedPnL >= 0 ? "+₹" : "-₹"}
              {Math.abs(Math.round(paperPortfolio.unrealizedPnL)).toLocaleString("en-IN")}
            </span>
          }
          subtitle={`${paperPositions.length} active open positions`}
          icon={<TrendingDown className="w-4 h-4" />}
        />
      </div>

      {/* Open Positions Table */}
      <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-text-primary">Active Positions</h3>
            <p className="text-xs text-text-muted">Live tracking with Indian 5x MIS leverage or 1x CNC</p>
          </div>
          <span className="text-xs font-semibold text-text-secondary">{paperPositions.length} Positions</span>
        </div>

        {paperPositions.length === 0 ? (
          <div className="text-center py-10 text-xs text-text-muted">
            No open paper positions. Click "Place New Order" to simulate a trade.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border-subtle text-text-muted uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="pb-2.5 font-semibold">Instrument</th>
                  <th className="pb-2.5 font-semibold">Product</th>
                  <th className="pb-2.5 font-semibold">Side</th>
                  <th className="pb-2.5 font-semibold">Qty</th>
                  <th className="pb-2.5 font-semibold">Avg Price</th>
                  <th className="pb-2.5 font-semibold">LTP (₹)</th>
                  <th className="pb-2.5 font-semibold">Unrealized P&L</th>
                  <th className="pb-2.5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50">
                {paperPositions.map(pos => {
                  const isPos = pos.unrealizedPnL >= 0;
                  return (
                    <tr key={pos.id} className="hover:bg-bg-elevated/40 transition-colors">
                      <td className="py-3 font-bold text-text-primary text-sm whitespace-nowrap">
                        {pos.stockSymbol}
                      </td>
                      <td className="py-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-bg-secondary text-[10px] text-text-muted border border-border-subtle font-mono">
                          {pos.productType}
                        </span>
                      </td>
                      <td className="py-3 whitespace-nowrap">
                        <Badge variant={pos.direction === "BUY" ? "positive" : "negative"} size="sm">
                          {pos.direction}
                        </Badge>
                      </td>
                      <td className="py-3 font-semibold text-text-primary whitespace-nowrap">
                        {pos.quantity}
                      </td>
                      <td className="py-3 text-text-secondary whitespace-nowrap">
                        ₹{pos.avgPrice.toFixed(2)}
                      </td>
                      <td className="py-3 font-bold text-text-primary whitespace-nowrap">
                        ₹{pos.currentPrice.toFixed(2)}
                      </td>
                      <td className="py-3 whitespace-nowrap">
                        <span className={`font-extrabold ${isPos ? "text-brand-positive" : "text-brand-negative"}`}>
                          {isPos ? "+₹" : "-₹"}{Math.abs(Math.round(pos.unrealizedPnL)).toLocaleString("en-IN")}
                          {" "}({isPos ? "+" : ""}{pos.unrealizedPnLPercent}%)
                        </span>
                      </td>
                      <td className="py-3 text-right whitespace-nowrap">
                        <Button
                          variant="danger"
                          size="sm"
                          disabled={closingId === pos.id}
                          onClick={() => handleClose(pos.id)}
                        >
                          {closingId === pos.id ? "Closing..." : "Square Off"}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Book History */}
      <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle space-y-4">
        <h3 className="text-sm font-bold text-text-primary">Order Book</h3>

        {paperOrders.length === 0 ? (
          <div className="text-center py-6 text-xs text-text-muted">
            No orders placed yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border-subtle text-text-muted uppercase text-[10px]">
                <tr>
                  <th className="pb-2 font-semibold">Time</th>
                  <th className="pb-2 font-semibold">Instrument</th>
                  <th className="pb-2 font-semibold">Type</th>
                  <th className="pb-2 font-semibold">Side</th>
                  <th className="pb-2 font-semibold">Qty</th>
                  <th className="pb-2 font-semibold">Price</th>
                  <th className="pb-2 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50">
                {paperOrders.slice(0, 10).map(ord => (
                  <tr key={ord.id}>
                    <td className="py-2.5 text-text-muted whitespace-nowrap">
                      {new Date(ord.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="py-2.5 font-bold text-text-primary whitespace-nowrap">
                      {ord.stockSymbol}
                    </td>
                    <td className="py-2.5 text-text-muted whitespace-nowrap">
                      {ord.orderType}
                    </td>
                    <td className="py-2.5 whitespace-nowrap">
                      <Badge variant={ord.direction === "BUY" ? "positive" : "negative"} size="sm">
                        {ord.direction}
                      </Badge>
                    </td>
                    <td className="py-2.5 text-text-primary whitespace-nowrap">{ord.quantity}</td>
                    <td className="py-2.5 font-semibold text-text-primary whitespace-nowrap">₹{ord.price}</td>
                    <td className="py-2.5 text-right whitespace-nowrap">
                      <Badge variant="positive" size="sm">{ord.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <PlaceOrderModal />
    </div>
  );
};
