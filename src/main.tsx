import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "./context/ThemeContext";
import { MarketDataProvider } from "./context/MarketDataContext";
import { AppProvider } from "./context/AppContext";
import { App } from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <MarketDataProvider>
        <AppProvider>
          <App />
        </AppProvider>
      </MarketDataProvider>
    </ThemeProvider>
  </React.StrictMode>
);
