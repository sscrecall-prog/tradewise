import React, { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "lg"
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  let maxWidthClass = "max-w-lg";
  if (maxWidth === "sm") maxWidthClass = "max-w-sm";
  else if (maxWidth === "md") maxWidthClass = "max-w-md";
  else if (maxWidth === "lg") maxWidthClass = "max-w-lg";
  else if (maxWidth === "xl") maxWidthClass = "max-w-xl";
  else if (maxWidth === "2xl") maxWidthClass = "max-w-2xl";
  else if (maxWidth === "3xl") maxWidthClass = "max-w-3xl";
  else if (maxWidth === "4xl") maxWidthClass = "max-w-4xl";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Content */}
      <div className={`relative w-full ${maxWidthClass} max-h-[90vh] flex flex-col bg-bg-card border border-border-subtle rounded-3xl shadow-2xl overflow-hidden z-10 animate-scaleUp`}>
        {(title || subtitle) && (
          <div className="flex items-center justify-between px-6 py-5 border-b border-border-subtle bg-bg-card/50">
            <div>
              {typeof title === "string" ? (
                <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
              ) : (
                title
              )}
              {subtitle && <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">{children}</div>
      </div>
    </div>
  );
};