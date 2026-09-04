import React, { useEffect, useRef, memo } from "react";

interface TradingViewWidgetProps {
  symbol: string;
  theme?: "dark" | "light";
  height?: string | number;
}

export const TradingViewWidget: React.FC<TradingViewWidgetProps> = memo(({
  symbol,
  theme = "dark"
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const getCleanTVSymbol = (sym: string): string => {
    const s = sym.toUpperCase().trim();
    if (s === "NIFTY" || s === "NIFTY 50") return "NSE:NIFTY";
    if (s === "BANKNIFTY" || s === "BANK NIFTY") return "NSE:BANKNIFTY";
    if (s === "FINNIFTY") return "NSE:FINNIFTY";
    if (s === "SENSEX") return "BSE:SENSEX";
    if (s === "TMCV" || s === "TATAMOTORS") return "NSE:TATAMOTORS";
    if (s === "ETERNAL" || s === "ZOMATO") return "NSE:ETERNAL";
    if (s.includes(":")) return s;
    return `NSE:${s}`;
  };

  const tvSymbol = getCleanTVSymbol(symbol);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Reset container contents
    container.innerHTML = "";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    widgetDiv.style.height = "100%";
    widgetDiv.style.width = "100%";
    container.appendChild(widgetDiv);

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;

    const widgetConfig = {
      autosize: true,
      symbol: tvSymbol,
      interval: "D",
      timezone: "Asia/Kolkata",
      theme: theme,
      style: "1",
      locale: "en",
      allow_symbol_change: true,
      calendar: false,
      support_host: "https://www.tradingview.com",
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: true,
      withdateranges: true,
      hide_side_toolbar: false
    };

    script.innerHTML = JSON.stringify(widgetConfig);
    container.appendChild(script);

    return () => {
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [tvSymbol, theme]);

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container w-full h-full"
      style={{ height: "100%", width: "100%" }}
    />
  );
});
