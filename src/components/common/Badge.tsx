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
  let base = "inline-flex items-center font-medium rounded-lg border ";
  if (size === "sm") base += "px-2 py-0.5 text-[11px] gap-1 ";
  else base += "px-2.5 py-1 text-xs gap-1.5 ";

  let dotColor = "";
  if (variant === "positive") {
    base += "bg-brand-positive/10 text-brand-positive border-brand-positive/20 ";
    dotColor = "bg-brand-positive";
  } else if (variant === "negative") {
    base += "bg-brand-negative/10 text-brand-negative border-brand-negative/20 ";
    dotColor = "bg-brand-negative";
  } else if (variant === "warning") {
    base += "bg-brand-warning/10 text-brand-warning border-brand-warning/20 ";
    dotColor = "bg-brand-warning";
  } else if (variant === "accent") {
    base += "bg-brand-accent/10 text-brand-accent border-brand-accent/25 ";
    dotColor = "bg-brand-accent";
  } else if (variant === "info") {
    base += "bg-blue-500/10 text-blue-400 border-blue-500/20 ";
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