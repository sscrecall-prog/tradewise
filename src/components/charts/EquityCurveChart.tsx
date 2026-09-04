import React, { useEffect, useRef } from "react";

interface EquityPoint {
  date: string;
  cumulativePnL: number;
  drawdown: number;
}

interface EquityCurveChartProps {
  data: EquityPoint[];
  height?: number;
  className?: string;
}

export const EquityCurveChart: React.FC<EquityCurveChartProps> = ({
  data,
  height = 240,
  className = ""
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const isDark = document.documentElement.classList.contains("dark");
    const gridColor = isDark ? "rgba(39, 44, 54, 0.45)" : "rgba(226, 232, 240, 0.8)";
    const textColor = isDark ? "#64748B" : "#94A3B8";

    const topPadding = 20;
    const bottomPadding = 30;
    const rightPadding = 65;
    const leftPadding = 15;

    const chartWidth = width - leftPadding - rightPadding;
    const chartHeight = height - topPadding - bottomPadding;

    const pnlValues = data.map(d => d.cumulativePnL);
    const minPnL = Math.min(0, ...pnlValues);
    const maxPnL = Math.max(1000, ...pnlValues);
    const range = maxPnL - minPnL || 1;

    // Zero line
    const zeroY = topPadding + chartHeight - ((0 - minPnL) / range) * chartHeight;
    ctx.strokeStyle = "rgba(201, 162, 39, 0.4)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(leftPadding, zeroY);
    ctx.lineTo(width - rightPadding, zeroY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Axis labels
    ctx.fillStyle = textColor;
    ctx.font = "10px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`+₹${maxPnL.toLocaleString("en-IN")}`, width - rightPadding + 6, topPadding + 10);
    ctx.fillText(`₹0`, width - rightPadding + 6, zeroY + 3);
    if (minPnL < 0) {
      ctx.fillText(`-₹${Math.abs(minPnL).toLocaleString("en-IN")}`, width - rightPadding + 6, height - bottomPadding);
    }

    // Plot equity line
    const stepX = chartWidth / (data.length - 1 || 1);
    ctx.beginPath();
    data.forEach((pt, i) => {
      const x = leftPadding + i * stepX;
      const y = topPadding + chartHeight - ((pt.cumulativePnL - minPnL) / range) * chartHeight;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.strokeStyle = "#35C98A";
    ctx.lineWidth = 2.4;
    ctx.stroke();

    // Gradient fill below equity line to zero
    ctx.lineTo(leftPadding + (data.length - 1) * stepX, zeroY);
    ctx.lineTo(leftPadding, zeroY);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, topPadding, 0, height - bottomPadding);
    grad.addColorStop(0, "rgba(53, 201, 138, 0.25)");
    grad.addColorStop(1, "rgba(53, 201, 138, 0.0)");
    ctx.fillStyle = grad;
    ctx.fill();

    // Date labels
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    const labelStep = Math.max(1, Math.floor(data.length / 4));
    for (let i = 0; i < data.length; i += labelStep) {
      const x = leftPadding + i * stepX;
      ctx.fillText(data[i].date.substring(5), x, height - 8);
    }
  }, [data, height]);

  return (
    <div className={`w-full bg-bg-card rounded-2xl border border-border-subtle p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-text-secondary">Cumulative Net Equity Curve</span>
        <span className="text-xs font-bold text-brand-positive">
          Net P&L: ₹{data.length > 0 ? data[data.length - 1].cumulativePnL.toLocaleString("en-IN") : "0"}
        </span>
      </div>
      <canvas ref={canvasRef} style={{ height }} className="w-full" />
    </div>
  );
};