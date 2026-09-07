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

    // Draw background histogram bars (like in the Boostify mockup)
    const barStep = chartWidth / data.length;
    const barWidth = Math.max(3, Math.min(18, barStep * 0.45));
    data.forEach((pt, i) => {
      const cx = leftPadding + i * barStep + barStep / 2;
      const barHeight = Math.max(8, ((Math.abs(pt.cumulativePnL) + 500) / (range + 500)) * (chartHeight * 0.55));
      const barY = height - bottomPadding - barHeight;

      ctx.fillStyle = isDark ? "rgba(184, 243, 49, 0.08)" : "rgba(184, 243, 49, 0.18)";
      ctx.beginPath();
      // Rounded bar top
      ctx.roundRect ? ctx.roundRect(cx - barWidth / 2, barY, barWidth, barHeight, [4, 4, 0, 0]) : ctx.rect(cx - barWidth / 2, barY, barWidth, barHeight);
      ctx.fill();
    });

    // Zero line
    const zeroY = topPadding + chartHeight - ((0 - minPnL) / range) * chartHeight;
    ctx.strokeStyle = isDark ? "rgba(184, 243, 49, 0.15)" : "rgba(184, 243, 49, 0.25)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.moveTo(leftPadding, zeroY);
    ctx.lineTo(width - rightPadding, zeroY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Axis labels
    ctx.fillStyle = isDark ? "#849884" : "#64748B";
    ctx.font = "10px JetBrains Mono, monospace";
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

    ctx.strokeStyle = "#b8f331";
    ctx.lineWidth = 2.8;
    ctx.shadowColor = "rgba(184, 243, 49, 0.4)";
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0; // reset shadow

    // Gradient fill below equity line to zero
    ctx.lineTo(leftPadding + (data.length - 1) * stepX, zeroY);
    ctx.lineTo(leftPadding, zeroY);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, topPadding, 0, height - bottomPadding);
    grad.addColorStop(0, "rgba(184, 243, 49, 0.28)");
    grad.addColorStop(0.7, "rgba(184, 243, 49, 0.06)");
    grad.addColorStop(1, "rgba(184, 243, 49, 0.0)");
    ctx.fillStyle = grad;
    ctx.fill();

    // Draw glowing end dot on latest point
    if (data.length > 0) {
      const lastIdx = data.length - 1;
      const lastX = leftPadding + lastIdx * stepX;
      const lastY = topPadding + chartHeight - ((data[lastIdx].cumulativePnL - minPnL) / range) * chartHeight;

      // Glow halo
      ctx.beginPath();
      ctx.arc(lastX, lastY, 7, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(184, 243, 49, 0.25)";
      ctx.fill();

      // Solid outer point
      ctx.beginPath();
      ctx.arc(lastX, lastY, 4.5, 0, 2 * Math.PI);
      ctx.fillStyle = "#b8f331";
      ctx.fill();

      // Center white dot
      ctx.beginPath();
      ctx.arc(lastX, lastY, 2, 0, 2 * Math.PI);
      ctx.fillStyle = "#090e09";
      ctx.fill();
    }

    // Date labels
    ctx.fillStyle = isDark ? "#6d7f6d" : "#94A3B8";
    ctx.textAlign = "center";
    const labelStep = Math.max(1, Math.floor(data.length / 4));
    for (let i = 0; i < data.length; i += labelStep) {
      const x = leftPadding + i * stepX;
      ctx.fillText(data[i].date.substring(5), x, height - 8);
    }
  }, [data, height]);

  const [activeRange, setActiveRange] = React.useState<"Year" | "Quarter" | "Month" | "Week">("Month");
  const latestPnL = data.length > 0 ? data[data.length - 1].cumulativePnL : 0;

  return (
    <div className={`w-full bg-dark-900 rounded-3xl border border-border-subtle p-5 shadow-card-glow ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-text-primary uppercase tracking-wider">
              Account Equity & Growth Trajectory
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-accent/15 border border-brand-accent/30 text-brand-accent text-[11px] font-black">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
              Live Net
            </span>
          </div>
          <p className="text-[11px] text-text-muted mt-0.5">
            Realized cumulative P&L net of STT, exchange fees & brokerage
          </p>
        </div>

        {/* Time Selector Pills from Mockup (Year, Quarter, Month, Week) */}
        <div className="flex items-center gap-1 bg-dark-950 p-1 rounded-full border border-white/5 self-start sm:self-auto">
          {(["Year", "Quarter", "Month", "Week"] as const).map(range => (
            <button
              key={range}
              onClick={() => setActiveRange(range)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                activeRange === range
                  ? "bg-brand-accent text-dark-950 shadow-sm shadow-lime-400/20"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <canvas ref={canvasRef} style={{ height }} className="w-full block" />
      </div>
    </div>
  );
};