import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  prefixNode?: React.ReactNode;
  suffixNode?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  helperText,
  error,
  prefixNode,
  suffixNode,
  className = "",
  ...props
}) => {
  return (
    <div className="w-full">
      {label && <label className="block text-xs font-medium text-text-secondary mb-1.5">{label}</label>}
      <div className="relative flex items-center">
        {prefixNode && (
          <div className="absolute left-3.5 flex items-center text-text-secondary pointer-events-none">
            {prefixNode}
          </div>
        )}
        <input
          className={`w-full bg-bg-secondary border rounded-xl py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand-accent focus:border-brand-accent transition-colors ${
            prefixNode ? "pl-10 " : "pl-3.5 "
          }${suffixNode ? "pr-10 " : "pr-3.5 "}${
            error ? "border-brand-negative " : "border-border-subtle "
          }${className}`}
          {...props}
        />
        {suffixNode && (
          <div className="absolute right-3.5 flex items-center text-text-secondary pointer-events-none">
            {suffixNode}
          </div>
        )}
      </div>
      {error ? (
        <p className="text-[11px] text-brand-negative mt-1 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-text-muted mt-1">{helperText}</p>
      ) : null}
    </div>
  );
};