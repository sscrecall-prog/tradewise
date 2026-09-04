import React from "react";

interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: "positive" | "negative" | "warning" | "accent" | "dynamic";
  size?: "sm" | "md" | "lg";
  label?: string;
  showValue?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  variant = "accent",
  size = "md",
  label,
  showValue = false,
  className = ""
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  let heightClass = "h-2";
  if (size === "sm") heightClass = "h-1.5";
  else if (size === "lg") heightClass = "h-3.5";

  let barColor = "bg-brand-accent";
  if (variant === "positive") barColor = "bg-brand-positive";
  else if (variant === "negative") barColor = "bg-brand-negative";
  else if (variant === "warning") barColor = "bg-brand-warning";
  else if (variant === "dynamic") {
    if (percentage > 80) barColor = "bg-brand-negative";
    else if (percentage > 50) barColor = "bg-brand-warning";
    else barColor = "bg-brand-positive";
  }

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs text-text-secondary mb-1.5">
          {label && <span>{label}</span>}
          {showValue && <span className="font-semibold text-text-primary">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className={`w-full bg-bg-elevated rounded-full overflow-hidden border border-border-subtle/50 ${heightClass}`}>
        <div
          className={`${barColor} ${heightClass} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};