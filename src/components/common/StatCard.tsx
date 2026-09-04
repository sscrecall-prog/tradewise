import React from "react";
import { Card } from "./Card";

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number | string;
    isPositive: boolean;
    label?: string;
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  className = ""
}) => {
  return (
    <Card className={`flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-text-secondary">{title}</span>
        {icon && <div className="p-2 rounded-xl bg-bg-elevated text-brand-accent">{icon}</div>}
      </div>
      <div>
        <div className="text-2xl font-bold tracking-tight text-text-primary">{value}</div>
        <div className="flex items-center gap-2 mt-1.5">
          {trend && (
            <span
              className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                trend.isPositive ? "text-brand-positive bg-brand-positive/10" : "text-brand-negative bg-brand-negative/10"
              }`}
            >
              {trend.isPositive ? "+" : ""}{trend.value}%
            </span>
          )}
          {subtitle && <span className="text-xs text-text-muted truncate">{subtitle}</span>}
        </div>
      </div>
    </Card>
  );
};