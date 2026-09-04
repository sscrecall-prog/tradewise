import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickSeries,
  AreaSeries,
  HistogramSeries,
  LineSeries,
  ColorType,
  CrosshairMode,
  UTCTimestamp
} from "lightweight-charts";
import { HistoricalPrice, TimeFrame } from "../../types";
import {
  BarChart3,
  TrendingUp,
  RotateCcw,
  Plus,
  Minus,
  Trash2
} from "lucide-react";

interface TradingViewProChartProps {
  data: HistoricalPrice[];
  symbol: string;
  timeframe: TimeFrame;
  onTimeframeChange: (tf: TimeFrame) => void;
  height?: number;
  className?: string;
}

export const TradingViewProChart: React.FC<TradingViewProChartProps> = ({
  data,
  symbol,
  timeframe,
  onTimeframeChange,
  height = 500,
  className = ""
}) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartApiRef = useRef<IChartApi | null>(null);
  const mainSeriesRef = useRef<ISeriesApi<any> | null>(null);

  const [chartType, setChartType] = useState<"candle" | "area">("candle");
  const [showEMA9, setShowEMA9] = useState(true);
  const [showEMA20, setShowEMA20] = useState(true);
  const [showEMA50, setShowEMA50] = useState(false);
  const [showVolume, setShowVolume] = useState(true);

  // Floating Crosshair Inspection Data
  const [hoveredData, setHoveredData] = useState<{
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
    change?: number;
  } | null>(null);

  // User drawn horizontal S/R price lines
  const [priceLines, setPriceLines] = useState<number[]>([]);

  // Format and sort historical candle data for lightweight-charts
  const formattedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const map = new Map<number, HistoricalPrice>();
    data.forEach(d => {
      const sec = Math.floor(d.timestamp / 1000);
      if (!map.has(sec)) {
        map.set(sec, d);
      }
    });

    const sorted = Array.from(map.entries()).sort((a, b) => a[0] - b[0]);

    return sorted.map(([sec, d]) => ({
      time: sec as UTCTimestamp,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
      volume: d.volume,
      dateStr: d.time
    }));
  }, [data]);

  // Calculate EMA series data
  const ema9Data = useMemo(() => calculateEMA(formattedData, 9), [formattedData]);
  const ema20Data = useMemo(() => calculateEMA(formattedData, 20), [formattedData]);
  const ema50Data = useMemo(() => calculateEMA(formattedData, 50), [formattedData]);

  // Initialize and render the TradingView Lightweight Chart
  useEffect(() => {
    if (!chartContainerRef.current || formattedData.length === 0) return;

    if (chartApiRef.current) {
      chartApiRef.current.remove();
      chartApiRef.current = null;
    }

    const container = chartContainerRef.current;
    const width = container.clientWidth || 800;

    const chart = createChart(container, {
      width,
      height,
      layout: {
        background: { type: ColorType.Solid, color: "#090A0F" },
        textColor: "#94A3B8",
        fontFamily: "Inter, sans-serif"
      },
      grid: {
        vertLines: { color: "rgba(30, 41, 59, 0.4)" },
        horzLines: { color: "rgba(30, 41, 59, 0.4)" }
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: "rgba(201, 162, 39, 0.6)",
          width: 1,
          style: 3,
          labelBackgroundColor: "#C9A227"
        },
        horzLine: {
          color: "rgba(201, 162, 39, 0.6)",
          width: 1,
          style: 3,
          labelBackgroundColor: "#C9A227"
        }
      },
      rightPriceScale: {
        borderColor: "rgba(30, 41, 59, 0.6)",
        scaleMargins: {
          top: 0.1,
          bottom: 0.22
        }
      },
      timeScale: {
        borderColor: "rgba(30, 41, 59, 0.6)",
        timeVisible: true,
        secondsVisible: false
      }
    });

    chartApiRef.current = chart;

    // Main Series: Candlestick or Area (v5 syntax)
    if (chartType === "candle") {
      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: "#35C98A",
        downColor: "#F05D5E",
        borderUpColor: "#35C98A",
        borderDownColor: "#F05D5E",
        wickUpColor: "#35C98A",
        wickDownColor: "#F05D5E"
      });
      candleSeries.setData(
        formattedData.map(d => ({
          time: d.time,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close
        }))
      );
      mainSeriesRef.current = candleSeries;
    } else {
      const areaSeries = chart.addSeries(AreaSeries, {
        topColor: "rgba(56, 189, 248, 0.4)",
        bottomColor: "rgba(56, 189, 248, 0.0)",
        lineColor: "#38BDF8",
        lineWidth: 2
      });
      areaSeries.setData(
        formattedData.map(d => ({
          time: d.time,
          value: d.close
        }))
      );
      mainSeriesRef.current = areaSeries;
    }

    // Volume Histogram Series (lower 20% of chart)
    if (showVolume) {
      const volumeSeries = chart.addSeries(HistogramSeries, {
        color: "rgba(53, 201, 138, 0.35)",
        priceFormat: {
          type: "volume"
        },
        priceScaleId: ""
      });
      volumeSeries.priceScale().applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0
        }
      });
      volumeSeries.setData(
        formattedData.map(d => ({
          time: d.time,
          value: d.volume,
          color: d.close >= d.open ? "rgba(53, 201, 138, 0.35)" : "rgba(240, 93, 94, 0.35)"
        }))
      );
    }

    // EMA 9 Series (Sky Blue)
    if (showEMA9 && ema9Data.length > 0) {
      const ema9Series = chart.addSeries(LineSeries, {
        color: "#38BDF8",
        lineWidth: 2,
        title: "EMA 9"
      });
      ema9Series.setData(ema9Data);
    }

    // EMA 20 Series (Amber Gold)
    if (showEMA20 && ema20Data.length > 0) {
      const ema20Series = chart.addSeries(LineSeries, {
        color: "#F59E0B",
        lineWidth: 2,
        title: "EMA 20"
      });
      ema20Series.setData(ema20Data);
    }

    // EMA 50 Series (Purple)
    if (showEMA50 && ema50Data.length > 0) {
      const ema50Series = chart.addSeries(LineSeries, {
        color: "#A855F7",
        lineWidth: 2,
        title: "EMA 50"
      });
      ema50Series.setData(ema50Data);
    }

    // Add User S/R Price Lines
    if (mainSeriesRef.current) {
      priceLines.forEach(lvl => {
        mainSeriesRef.current!.createPriceLine({
          price: lvl,
          color: "#C9A227",
          lineWidth: 1,
          lineStyle: 2,
          axisLabelVisible: true,
          title: "S/R"
        });
      });
    }

    // Fit content
    chart.timeScale().fitContent();

    // Crosshair inspection listener
    chart.subscribeCrosshairMove(param => {
      if (!param || !param.time) {
        setHoveredData(null);
        return;
      }

      const match = formattedData.find(d => d.time === param.time);
      if (match) {
        const change = match.close - match.open;
        setHoveredData({
          time: match.dateStr,
          open: match.open,
          high: match.high,
          low: match.low,
          close: match.close,
          volume: match.volume,
          change: Math.round(change * 100) / 100
        });
      }
    });

    // Resize observer
    const handleResize = () => {
      if (chartContainerRef.current && chartApiRef.current) {
        chartApiRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartApiRef.current) {
        chartApiRef.current.remove();
        chartApiRef.current = null;
      }
    };
  }, [
    formattedData,
    chartType,
    height,
    showEMA9,
    showEMA20,
    showEMA50,
    showVolume,
    ema9Data,
    ema20Data,
    ema50Data,
    priceLines
  ]);

  const handleResetZoom = () => {
    if (chartApiRef.current) {
      chartApiRef.current.timeScale().fitContent();
    }
  };

  const handleAddCurrentPriceLine = () => {
    if (formattedData.length > 0) {
      const lastPrice = formattedData[formattedData.length - 1].close;
      setPriceLines(prev => [...prev, lastPrice]);
    }
  };

  const latestData = formattedData[formattedData.length - 1];
  const displayData = hoveredData || latestData;

  return (
    <div className={`w-full bg-[#090A0F] rounded-2xl border border-border-subtle flex flex-col ${className}`}>
      {/* Top Professional Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-4 py-2.5 border-b border-border-subtle/70 bg-[#0E1118]">
        {/* Left: Symbol & Live OHLCV Bar */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-extrabold text-text-primary tracking-wide flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-brand-positive animate-pulse" />
            {symbol}
          </span>

          {displayData && (
            <div className="hidden lg:flex items-center gap-2.5 text-xs font-mono">
              <span className="text-text-muted">O: <strong className="text-text-primary">₹{displayData.open}</strong></span>
              <span className="text-text-muted">H: <strong className="text-brand-positive">₹{displayData.high}</strong></span>
              <span className="text-text-muted">L: <strong className="text-brand-negative">₹{displayData.low}</strong></span>
              <span className="text-text-muted">C: <strong className="text-text-primary">₹{displayData.close}</strong></span>
              {displayData.volume !== undefined && (
                <span className="text-text-muted">Vol: <strong className="text-text-secondary">{(displayData.volume / 1000).toFixed(1)}k</strong></span>
              )}
            </div>
          )}
        </div>

        {/* Right: Technical Controls (Timeframes, Indicators, Styles) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe selector */}
          <div className="flex items-center bg-bg-card p-0.5 rounded-xl border border-border-subtle text-xs font-bold">
            {(["1D", "1W", "1M", "3M", "1Y"] as TimeFrame[]).map(tf => (
              <button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  timeframe === tf
                    ? "bg-brand-accent text-bg-primary shadow-xs"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Indicator Toggles */}
          <div className="flex items-center bg-bg-card p-0.5 rounded-xl border border-border-subtle text-[11px] font-bold">
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
              onClick={() => setShowVolume(!showVolume)}
              className={`px-2 py-1 rounded-lg transition-colors ${
                showVolume ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-text-muted hover:text-text-primary"
              }`}
            >
              Volume
            </button>
          </div>

          {/* Chart Style Switcher (Candles vs Area Line) */}
          <div className="flex items-center bg-bg-card p-0.5 rounded-xl border border-border-subtle">
            <button
              onClick={() => setChartType("candle")}
              className={`p-1.5 rounded-lg transition-colors ${
                chartType === "candle" ? "bg-bg-elevated text-brand-accent shadow-xs" : "text-text-muted hover:text-text-primary"
              }`}
              title="Candlestick View"
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartType("area")}
              className={`p-1.5 rounded-lg transition-colors ${
                chartType === "area" ? "bg-bg-elevated text-brand-accent shadow-xs" : "text-text-muted hover:text-text-primary"
              }`}
              title="Area Line View"
            >
              <TrendingUp className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* S/R Price Line Creator */}
          <button
            onClick={handleAddCurrentPriceLine}
            className="px-2.5 py-1 text-xs font-semibold rounded-xl bg-bg-card hover:bg-bg-elevated text-text-secondary hover:text-brand-accent border border-border-subtle transition-colors flex items-center gap-1"
            title="Mark Horizontal Support/Resistance Level"
          >
            + S/R Line
          </button>

          {priceLines.length > 0 && (
            <button
              onClick={() => setPriceLines([])}
              className="p-1.5 rounded-xl bg-bg-card hover:bg-brand-negative/10 text-text-muted hover:text-brand-negative transition-colors"
              title="Clear S/R Lines"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Reset Zoom */}
          <button
            onClick={handleResetZoom}
            className="p-1.5 rounded-xl bg-bg-card hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-colors"
            title="Reset Chart Zoom & Scale"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Chart Container */}
      <div className="relative w-full flex-1 min-h-[360px] overflow-hidden">
        <div ref={chartContainerRef} className="w-full h-full" />
      </div>
    </div>
  );
};

// Calculate Exponential Moving Average
function calculateEMA(
  data: { time: UTCTimestamp; close: number }[],
  period: number
): { time: UTCTimestamp; value: number }[] {
  if (data.length < period) return [];

  const k = 2 / (period + 1);
  const result: { time: UTCTimestamp; value: number }[] = [];

  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i].close;
  }

  let prevEMA = sum / period;
  result.push({
    time: data[period - 1].time,
    value: Math.round(prevEMA * 100) / 100
  });

  for (let i = period; i < data.length; i++) {
    const currentEMA = data[i].close * k + prevEMA * (1 - k);
    result.push({
      time: data[i].time,
      value: Math.round(currentEMA * 100) / 100
    });
    prevEMA = currentEMA;
  }

  return result;
}
