import React, { useEffect, useRef } from "react";

interface SparklineProps {
  data: number[];
  isPositive?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  isPositive = true,
  width = 110,
  height = 36,
  className = ""
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length < 2) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const padding = 4;
    const drawHeight = height - padding * 2;
    const stepX = (width - padding * 2) / (data.length - 1);

    const strokeColor = isPositive ? "#35C98A" : "#F05D5E";
    const fillColor = isPositive ? "rgba(53, 201, 138, 0.12)" : "rgba(240, 93, 94, 0.12)";

    ctx.beginPath();
    data.forEach((val, i) => {
      const x = padding + i * stepX;
      const y = height - padding - ((val - min) / range) * drawHeight;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    // Stroke line
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.8;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();

    // Fill gradient below line
    ctx.lineTo(width - padding, height);
    ctx.lineTo(padding, height);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
  }, [data, isPositive, width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height }}
      className={`inline-block flex-shrink-0 ${className}`}
    />
  );
};