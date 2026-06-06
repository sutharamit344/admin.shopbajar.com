import React, { forwardRef, type InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  prefix?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, prefix, fullWidth = true, disabled, className = "", id, ...props }, ref) => {
    const inputId = id || label?.replace(/\s+/g, '-').toLowerCase();

    return (
      <div className={`flex flex-col gap-1 ${fullWidth ? "w-full" : ""}`}>
        {label && (
          <label htmlFor={inputId} className="text-[11px] font-bold text-[#0A0A0F]/60 uppercase tracking-wider px-0.5">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && !prefix && (
            <div className="absolute left-2.5 text-[#0A0A0F]/40 pointer-events-none z-10 flex items-center justify-center">
              {icon}
            </div>
          )}
          {prefix && (
            <div className="absolute left-2.5 text-xs font-bold text-[#0A0A0F]/40 border-r border-black/[0.08] pr-2 py-0.5 flex items-center z-10 pointer-events-none">
              {prefix}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={`
              w-full h-8.5 px-3 rounded-md bg-black/[0.02] border text-xs font-medium text-[#0A0A0F] placeholder:text-[#0A0A0F]/30 focus:outline-none focus:bg-white transition-all
              ${(icon || prefix) ? "pl-11" : ""}
              ${error
                ? "border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/20 bg-red-500/[0.01]"
                : "border-black/[0.08] hover:border-black/[0.18] focus:border-[#FF6A00]/40 focus:ring-1 focus:ring-[#FF6A00]/10"
              }
              ${disabled ? "bg-black/[0.04] text-[#0A0A0F]/30 cursor-not-allowed border-black/[0.04]" : ""}
              ${className}
            `}
            {...props}
          />
        </div>
        {error ? (
          <span className="text-[10px] font-semibold text-red-500 px-0.5">{error}</span>
        ) : helperText ? (
          <span className="text-[10px] font-medium text-[#0A0A0F]/40 px-0.5">{helperText}</span>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";
