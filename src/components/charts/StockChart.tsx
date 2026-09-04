import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { HistoricalPrice, TimeFrame } from "../../types";
import {
  BarChart3,
  TrendingUp,
  SlidersHorizontal,
  Plus,
  Minus,
  RotateCcw,
  Sparkles,
  Eye,
  EyeOff,
  Activity,
  Layers,
  Crosshair
} from "lucide-react";

interface StockChartProps {
  data: HistoricalPrice[];
  symbol: string;
  timeframe: TimeFrame;
  onTimeframeChange: (tf: TimeFrame) => void;
  height?: number;
  className?: string;
}

type ChartType = "candle" | "line" | "heikin";

export const StockChart: React.FC<StockChartProps> = ({
  data,
  symbol,
  timeframe,
  onTimeframeChange,
  height = 420,
  className = ""
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [chartType, setChartType] = useState<ChartType>("candle");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Technical Indicators State
  const [showEMA9, setShowEMA9] = useState(true);
  const [showEMA20, setShowEMA20] = useState(true);
  const [showEMA50, setShowEMA50] = useState(false);
  const [showBollinger, setShowBollinger] = useState(false);
  const [showVolumeMA, setShowVolumeMA] = useState(true);

  // Custom Horizontal Support/Resistance levels placed by user
  const [horizontalLevels, setHorizontalLevels] = useState<number[]>([]);

  const timeframes: TimeFrame[] = ["1D", "1W", "1M", "3M", "1Y"];

  // Calculate Heikin-Ashi candles if selected
  const processedData = useMemo(() => {
    if (chartType !== "heikin" || data.length === 0) return data;

    const haData: HistoricalPrice[] = [];
    for (let i = 0; i < data.length; i++) {
      const curr = data[i];
      const haClose = (curr.open + curr.high + curr.low + curr.close) / 4;
      const haOpen = i === 0 ? (curr.open + curr.close) / 2 : (haData[i - 1].open + haData[i - 1].close) / 2;
      const haHigh = Math.max(curr.high, haOpen, haClose);
      const haLow = Math.min(curr.low, haOpen, haClose);

      haData.push({
        ...curr,
        open: Math.round(haOpen * 100) / 100,
        high: Math.round(haHigh * 100) / 100,
        low: Math.round(haLow * 100) / 100,
        close: Math.round(haClose * 100) / 100
      });
    }
    return haData;
  }, [data, chartType]);

  // Calculate EMAs
  const ema9 = useMemo(() => calculateEMA(processedData, 9), [processedData]);
  const ema20 = useMemo(() => calculateEMA(processedData, 20), [processedData]);
  const ema50 = useMemo(() => calculateEMA(processedData, 50), [processedData]);

  // Calculate Bollinger Bands (20-period SMA, 2 std dev)
  const bollinger = useMemo(() => {
    if (!showBollinger || processedData.length < 20) return null;
    const period = 20;
    const upper: (number | null)[] = [];
    const middle: (number | null)[] = [];
    const lower: (number | null)[] = [];

    for (let i = 0; i < processedData.length; i++) {
      if (i < period - 1) {
        upper.push(null);
        middle.push(null);
        lower.push(null);
        continue;
      }
      const slice = processedData.slice(i - period + 1, i + 1).map(d => d.close);
      const mean = slice.reduce((a, b) => a + b, 0) / period;
      const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period;
      const stdDev = Math.sqrt(variance);

      middle.push(mean);
      upper.push(mean + 2 * stdDev);
      lower.push(mean - 2 * stdDev);
    }
    return { upper, middle, lower };
  }, [processedData, showBollinger]);

  // Main Canvas Rendering
  const drawChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !processedData || processedData.length === 0) return;
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

    const topPadding = 25;
    const bottomPadding = 45;
    const rightPadding = 65;
    const leftPadding = 10;

    const chartWidth = width - leftPadding - rightPadding;
    const chartHeight = height - topPadding - bottomPadding;
    const volumeHeight = chartHeight * 0.20;
    const priceHeight = chartHeight - volumeHeight - 15;

    // Calculate Min & Max Prices
    let minPrice = Math.min(...processedData.map(d => d.low));
    let maxPrice = Math.max(...processedData.map(d => d.high));

    if (bollinger) {
      bollinger.upper.forEach(u => {
        if (u !== null && u > maxPrice) maxPrice = u;
      });
      bollinger.lower.forEach(l => {
        if (l !== null && l < minPrice) minPrice = l;
      });
    }

    const priceRange = maxPrice - minPrice || 1;
    const maxVolume = Math.max(...processedData.map(d => d.volume)) || 1;

    // Horizontal Price Grid Lines & Labels
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = gridColor;
    ctx.font = "10px Inter, sans-serif";
    ctx.fillStyle = textColor;
    ctx.textAlign = "left";

    const gridCount = 6;
    for (let i = 0; i <= gridCount; i++) {
      const y = topPadding + (i / gridCount) * priceHeight;
      const priceVal = maxPrice - (i / gridCount) * priceRange;

      ctx.beginPath();
      ctx.moveTo(leftPadding, y);
      ctx.lineTo(width - rightPadding, y);
      ctx.stroke();

      ctx.fillText(`₹${priceVal.toFixed(1)}`, width - rightPadding + 8, y + 3.5);
    }

    const candleWidth = Math.max(2.5, (chartWidth / processedData.length) * 0.72);
    const stepX = chartWidth / processedData.length;

    // Draw Bollinger Bands Channel
    if (bollinger) {
      ctx.fillStyle = "rgba(59, 130, 246, 0.08)";
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < processedData.length; i++) {
        const u = bollinger.upper[i];
        if (u !== null) {
          const x = leftPadding + i * stepX + stepX / 2;
          const y = topPadding + priceHeight - ((u - minPrice) / priceRange) * priceHeight;
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      }
      for (let i = processedData.length - 1; i >= 0; i--) {
        const l = bollinger.lower[i];
        if (l !== null) {
          const x = leftPadding + i * stepX + stepX / 2;
          const y = topPadding + priceHeight - ((l - minPrice) / priceRange) * priceHeight;
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fill();

      // Band Borders
      drawCurve(ctx, processedData, bollinger.upper, minPrice, priceRange, priceHeight, topPadding, leftPadding, stepX, "rgba(59, 130, 246, 0.4)", 1, [2, 2]);
      drawCurve(ctx, processedData, bollinger.lower, minPrice, priceRange, priceHeight, topPadding, leftPadding, stepX, "rgba(59, 130, 246, 0.4)", 1, [2, 2]);
      drawCurve(ctx, processedData, bollinger.middle, minPrice, priceRange, priceHeight, topPadding, leftPadding, stepX, "rgba(245, 158, 11, 0.6)", 1);
    }

    // Draw Main Chart (Line vs Candles)
    if (chartType === "line") {
      ctx.beginPath();
      processedData.forEach((d, i) => {
        const x = leftPadding + i * stepX + stepX / 2;
        const y = topPadding + priceHeight - ((d.close - minPrice) / priceRange) * priceHeight;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // Gradient Fill below line
      ctx.lineTo(leftPadding + (processedData.length - 1) * stepX + stepX / 2, topPadding + priceHeight);
      ctx.lineTo(leftPadding + stepX / 2, topPadding + priceHeight);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, topPadding, 0, topPadding + priceHeight);
      grad.addColorStop(0, "rgba(56, 189, 248, 0.28)");
      grad.addColorStop(1, "rgba(56, 189, 248, 0.0)");
      ctx.fillStyle = grad;
      ctx.fill();
    } else {
      // Candlesticks (Standard or Heikin-Ashi)
      processedData.forEach((d, i) => {
        const x = leftPadding + i * stepX + stepX / 2;
        const isGreen = d.close >= d.open;
        const color = isGreen ? "#35C98A" : "#F05D5E";

        const openY = topPadding + priceHeight - ((d.open - minPrice) / priceRange) * priceHeight;
        const closeY = topPadding + priceHeight - ((d.close - minPrice) / priceRange) * priceHeight;
        const highY = topPadding + priceHeight - ((d.high - minPrice) / priceRange) * priceHeight;
        const lowY = topPadding + priceHeight - ((d.low - minPrice) / priceRange) * priceHeight;

        // Wick
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.3;
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.stroke();

        // Body
        const bodyY = Math.min(openY, closeY);
        const bodyHeight = Math.max(2, Math.abs(closeY - openY));
        ctx.fillStyle = color;
        ctx.fillRect(x - candleWidth / 2, bodyY, candleWidth, bodyHeight);

        // Volume Bar
        const volBarHeight = (d.volume / maxVolume) * volumeHeight;
        const volY = height - bottomPadding - volBarHeight;
        ctx.fillStyle = isGreen ? "rgba(53, 201, 138, 0.35)" : "rgba(240, 93, 94, 0.35)";
        ctx.fillRect(x - candleWidth / 2, volY, candleWidth, volBarHeight);
      });
    }

    // Draw EMAs
    if (showEMA9) {
      drawCurve(ctx, processedData, ema9, minPrice, priceRange, priceHeight, topPadding, leftPadding, stepX, "#38bdf8", 1.8);
    }
    if (showEMA20) {
      drawCurve(ctx, processedData, ema20, minPrice, priceRange, priceHeight, topPadding, leftPadding, stepX, "#f59e0b", 1.8);
    }
    if (showEMA50) {
      drawCurve(ctx, processedData, ema50, minPrice, priceRange, priceHeight, topPadding, leftPadding, stepX, "#a855f7", 1.8);
    }

    // Draw User Horizontal Support/Resistance Levels
    horizontalLevels.forEach(lvl => {
      const y = topPadding + priceHeight - ((lvl - minPrice) / priceRange) * priceHeight;
      if (y >= topPadding && y <= topPadding + priceHeight) {
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = "#C9A227";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(leftPadding, y);
        ctx.lineTo(width - rightPadding, y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Tag
        ctx.fillStyle = "#C9A227";
        ctx.fillRect(width - rightPadding, y - 8, rightPadding - 5, 16);
        ctx.fillStyle = "#090A0F";
        ctx.font = "bold 9px Inter, sans-serif";
        ctx.fillText(`S/R ₹${lvl.toFixed(1)}`, width - rightPadding + 4, y + 3.5);
      }
    });

    // Time Axis Labels
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    const labelStep = Math.max(1, Math.floor(processedData.length / 6));
    for (let i = 0; i < processedData.length; i += labelStep) {
      const x = leftPadding + i * stepX + stepX / 2;
      ctx.fillText(processedData[i].time, x, height - 12);
    }

    // Interactive Crosshair on Hover
    if (hoveredIndex !== null && hoveredIndex >= 0 && hoveredIndex < processedData.length) {
      const hoverItem = processedData[hoveredIndex];
      const hx = leftPadding + hoveredIndex * stepX + stepX / 2;
      const hy = topPadding + priceHeight - ((hoverItem.close - minPrice) / priceRange) * priceHeight;

      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.45)" : "rgba(0, 0, 0, 0.35)";
      ctx.lineWidth = 1;

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(hx, topPadding);
      ctx.lineTo(hx, height - bottomPadding);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(leftPadding, hy);
      ctx.lineTo(width - rightPadding, hy);
      ctx.stroke();
      ctx.setLineDash([]);

      // Price tag on Right Axis
      ctx.fillStyle = "#C9A227";
      ctx.fillRect(width - rightPadding, hy - 9, rightPadding - 4, 18);
      ctx.fillStyle = "#090A0F";
      ctx.font = "bold 10px Inter, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`₹${hoverItem.close.toFixed(1)}`, width - rightPadding + 4, hy + 3.5);

      // Date/Time tag on Bottom Axis
      const tw = ctx.measureText(hoverItem.time).width;
      ctx.fillStyle = isDark ? "#1E293B" : "#E2E8F0";
      ctx.fillRect(hx - tw / 2 - 6, height - bottomPadding, tw + 12, 18);
      ctx.fillStyle = isDark ? "#F8FAFC" : "#0F172A";
      ctx.textAlign = "center";
      ctx.fillText(hoverItem.time, hx, height - bottomPadding + 12);
    }
  }, [
    processedData,
    chartType,
    height,
    hoveredIndex,
    showEMA9,
    showEMA20,
    showEMA50,
    showBollinger,
    ema9,
    ema20,
    ema50,
    bollinger,
    horizontalLevels
  ]);

  useEffect(() => {
    drawChart();
    const handleResize = () => drawChart();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [drawChart]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !processedData || processedData.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - 10;
    const chartWidth = rect.width - 75;
    const stepX = chartWidth / processedData.length;
    const index = Math.floor(mouseX / stepX);
    if (index >= 0 && index < processedData.length) {
      setHoveredIndex(index);
    } else {
      setHoveredIndex(null);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !processedData || processedData.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;

    const topPadding = 25;
    const bottomPadding = 45;
    const chartHeight = height - topPadding - bottomPadding;
    const volumeHeight = chartHeight * 0.20;
    const priceHeight = chartHeight - volumeHeight - 15;

    let minPrice = Math.min(...processedData.map(d => d.low));
    let maxPrice = Math.max(...processedData.map(d => d.high));
    const priceRange = maxPrice - minPrice || 1;

    if (mouseY >= topPadding && mouseY <= topPadding + priceHeight) {
      const clickedPrice = maxPrice - ((mouseY - topPadding) / priceHeight) * priceRange;
      setHorizontalLevels(prev => [...prev, Math.round(clickedPrice * 10) / 10]);
    }
  };

  const hoveredData = hoveredIndex !== null && processedData[hoveredIndex] ? processedData[hoveredIndex] : processedData[processedData.length - 1];

  return (
    <div ref={containerRef} className={`w-full bg-bg-card rounded-2xl border border-border-subtle p-3 sm:p-4 ${className}`}>
      {/* Top Controls Toolbar: Symbol, OHLCV, Indicators, Chart Styles */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-2.5 pb-2.5 border-b border-border-subtle">
        {/* Left: Symbol & Live OHLCV Floating Tooltip */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-extrabold text-text-primary tracking-wide">{symbol}</span>
          {hoveredData && (
            <div className="hidden lg:flex items-center gap-2.5 text-xs font-mono">
              <span className="text-text-muted">O: <strong className="text-text-primary">₹{hoveredData.open}</strong></span>
              <span className="text-text-muted">H: <strong className="text-brand-positive">₹{hoveredData.high}</strong></span>
              <span className="text-text-muted">L: <strong className="text-brand-negative">₹{hoveredData.low}</strong></span>
              <span className="text-text-muted">C: <strong className="text-text-primary">₹{hoveredData.close}</strong></span>
              <span className="text-text-muted">Vol: <strong className="text-text-secondary">{(hoveredData.volume / 1000).toFixed(1)}k</strong></span>
            </div>
          )}
        </div>

        {/* Right: Technical Indicators & Chart Type */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Technical Indicators Toggle Pills */}
          <div className="flex items-center bg-bg-secondary p-0.5 rounded-xl border border-border-subtle text-[11px] font-bold">
            <button
              onClick={() => setShowEMA9(!showEMA9)}
              className={`px-2 py-1 rounded-lg transition-colors ${
                showEMA9 ? "bg-sky-500/20 text-sky-400 border border-sky-500/30" : "text-text-muted hover:text-text-primary"
              }`}
            >
              EMA 9
            </button>
            <button
              onClick={() => setShowEMA20(!showEMA20)}
              className={`px-2 py-1 rounded-lg transition-colors ${
                showEMA20 ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "text-text-muted hover:text-text-primary"
              }`}
            >
              EMA 20
            </button>
            <button
              onClick={() => setShowEMA50(!showEMA50)}
              className={`px-2 py-1 rounded-lg transition-colors ${
                showEMA50 ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "text-text-muted hover:text-text-primary"
              }`}
            >
              EMA 50
            </button>
            <button
              onClick={() => setShowBollinger(!showBollinger)}
              className={`px-2 py-1 rounded-lg transition-colors ${
                showBollinger ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "text-text-muted hover:text-text-primary"
              }`}
            >
              BBands
            </button>
          </div>

          {/* Chart Style Switcher */}
          <div className="flex items-center bg-bg-secondary p-0.5 rounded-xl border border-border-subtle text-xs">
            <button
              onClick={() => setChartType("candle")}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                chartType === "candle" ? "bg-bg-elevated text-brand-accent font-bold" : "text-text-muted hover:text-text-primary"
              }`}
              title="Candlestick Chart"
            >
              Candles
            </button>
            <button
              onClick={() => setChartType("heikin")}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                chartType === "heikin" ? "bg-bg-elevated text-brand-accent font-bold" : "text-text-muted hover:text-text-primary"
              }`}
              title="Heikin Ashi Smoothed Candles"
            >
              Heikin
            </button>
            <button
              onClick={() => setChartType("line")}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                chartType === "line" ? "bg-bg-elevated text-brand-accent font-bold" : "text-text-muted hover:text-text-primary"
              }`}
              title="Line Chart"
            >
              Line
            </button>
          </div>

          {/* Clear S/R Levels */}
          {horizontalLevels.length > 0 && (
            <button
              onClick={() => setHorizontalLevels([])}
              className="text-[11px] px-2 py-1 rounded-lg bg-bg-secondary text-brand-negative hover:bg-brand-negative/10 transition-colors font-semibold"
            >
              Clear S/R ({horizontalLevels.length})
            </button>
          )}
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredIndex(null)}
          onClick={handleCanvasClick}
          className="w-full cursor-crosshair"
          style={{ height }}
        />

        {/* Floating Quick Hint */}
        <div className="absolute top-2 left-3 pointer-events-none text-[10px] text-text-muted bg-bg-primary/70 backdrop-blur-xs px-2 py-0.5 rounded border border-border-subtle/40">
          Click canvas to place Horizontal S/R line • Hover to inspect candle
        </div>
      </div>
    </div>
  );
};

// Helper: Calculate Exponential Moving Average
function calculateEMA(data: HistoricalPrice[], period: number): (number | null)[] {
  if (data.length < period) return data.map(() => null);

  const k = 2 / (period + 1);
  const result: (number | null)[] = [];

  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i].close;
    result.push(null);
  }

  let prevEMA = sum / period;
  result[period - 1] = prevEMA;

  for (let i = period; i < data.length; i++) {
    const currentEMA = data[i].close * k + prevEMA * (1 - k);
    result.push(currentEMA);
    prevEMA = currentEMA;
  }

  return result;
}

// Helper: Draw continuous curve on canvas
function drawCurve(
  ctx: CanvasRenderingContext2D,
  data: HistoricalPrice[],
  values: (number | null)[],
  minPrice: number,
  priceRange: number,
  priceHeight: number,
  topPadding: number,
  leftPadding: number,
  stepX: number,
  color: string,
  lineWidth = 1.5,
  lineDash: number[] = []
) {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.setLineDash(lineDash);

  let started = false;
  for (let i = 0; i < data.length; i++) {
    const val = values[i];
    if (val !== null) {
      const x = leftPadding + i * stepX + stepX / 2;
      const y = topPadding + priceHeight - ((val - minPrice) / priceRange) * priceHeight;
      if (!started) {
        ctx.moveTo(x, y);
        started = true;
      } else {
        ctx.lineTo(x, y);
      }
    }
  }
  ctx.stroke();
  ctx.setLineDash([]);
}