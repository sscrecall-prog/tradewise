import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  error?: string;
  helperText?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  helperText,
  className = "",
  ...props
}) => {
  return (
    <div className="w-full">
      {label && <label className="block text-xs font-medium text-text-secondary mb-1.5">{label}</label>}
      <select
        className={`w-full bg-bg-secondary border rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent focus:border-brand-accent transition-colors ${
          error ? "border-brand-negative " : "border-border-subtle "
        }${className}`}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} className="bg-bg-card text-text-primary">
            {opt.label}
          </option>
        ))}
      </select>
      {error ? (
        <p className="text-[11px] text-brand-negative mt-1 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-text-muted mt-1">{helperText}</p>
      ) : null}
    </div>
  );
};