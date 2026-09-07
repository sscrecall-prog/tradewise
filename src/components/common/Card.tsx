import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "glass" | "bordered" | "ivory";
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  className = "",
  ...props
}) => {
  let baseClass = "rounded-3xl transition-all duration-200 p-5 ";
  if (variant === "default") {
    baseClass += "bg-bg-card border border-border-subtle shadow-sm ";
  } else if (variant === "elevated") {
    baseClass += "bg-bg-elevated border border-border-subtle/80 shadow-md ";
  } else if (variant === "glass") {
    baseClass += "glass-panel shadow-glass ";
  } else if (variant === "bordered") {
    baseClass += "bg-transparent border border-border-subtle ";
  } else if (variant === "ivory") {
    baseClass += "card-ivory-highlight shadow-xl ";
  }

  return (
    <div className={`${baseClass} ${className}`} {...props}>
      {children}
    </div>
  );
};