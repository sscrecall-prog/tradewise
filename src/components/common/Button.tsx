import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "success" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  icon,
  children,
  className = "",
  disabled,
  ...props
}) => {
  let base = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ";

  // Size
  if (size === "sm") base += "px-3 py-1.5 text-xs gap-1.5 ";
  else if (size === "md") base += "px-4 py-2.5 text-sm gap-2 ";
  else if (size === "lg") base += "px-6 py-3.5 text-base gap-2.5 ";

  // Variant
  if (variant === "primary") {
    base += "bg-brand-accent text-bg-primary hover:bg-brand-accentHover shadow-sm font-semibold ";
  } else if (variant === "secondary") {
    base += "bg-bg-elevated text-text-primary hover:bg-border-subtle border border-border-subtle ";
  } else if (variant === "outline") {
    base += "bg-transparent text-text-primary border border-border-subtle hover:border-brand-accent/60 hover:text-brand-accent ";
  } else if (variant === "danger") {
    base += "bg-brand-negative/15 text-brand-negative hover:bg-brand-negative/25 border border-brand-negative/30 font-medium ";
  } else if (variant === "success") {
    base += "bg-brand-positive/15 text-brand-positive hover:bg-brand-positive/25 border border-brand-positive/30 font-medium ";
  } else if (variant === "ghost") {
    base += "bg-transparent text-text-secondary hover:text-text-primary hover:bg-bg-elevated/60 ";
  }

  return (
    <button className={`${base} ${className}`} disabled={disabled} {...props}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};