import React from "react";

interface BadgeProps {
  variant?: "positive" | "negative" | "warning" | "accent" | "neutral" | "info";
  size?: "sm" | "md";
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "neutral",
  size = "md",
  children,
  className = "",
  dot = false
}) => {
  let base = "inline-flex items-center font-bold rounded-full border tracking-tight ";
  if (size === "sm") base += "px-2.5 py-0.5 text-[10px] gap-1 ";
  else base += "px-3 py-1 text-xs gap-1.5 ";

  let dotColor = "";
  if (variant === "positive") {
    base += "bg-brand-positive/15 text-brand-positive border-brand-positive/30 ";
    dotColor = "bg-brand-positive";
  } else if (variant === "negative") {
    base += "bg-brand-negative/15 text-brand-negative border-brand-negative/30 ";
    dotColor = "bg-brand-negative";
  } else if (variant === "warning") {
    base += "bg-brand-warning/15 text-brand-warning border-brand-warning/30 ";
    dotColor = "bg-brand-warning";
  } else if (variant === "accent") {
    base += "bg-brand-accent/20 text-brand-accent border-brand-accent/40 shadow-sm shadow-lime-400/10 ";
    dotColor = "bg-brand-accent";
  } else if (variant === "info") {
    base += "bg-blue-500/15 text-blue-400 border-blue-500/25 ";
    dotColor = "bg-blue-400";
  } else {
    base += "bg-bg-elevated text-text-secondary border-border-subtle ";
    dotColor = "bg-text-muted";
  }

  return (
    <span className={`${base} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-pulse`} />}
      <span>{children}</span>
    </span>
  );
};