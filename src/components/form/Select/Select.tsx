import React, { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

export interface SelectOption {
  value: any;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  icon?: React.ReactNode;
  helperText?: string;
  clearable?: boolean;
  onClear?: () => void;
  fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      options,
      placeholder,
      icon,
      helperText,
      clearable,
      onClear,
      fullWidth = true,
      className = "",
      value,
      onChange,
      disabled,
      required,
      id,
      ...props
    },
    ref,
  ) => {
    const selectId = id || label?.replace(/\s+/g, '-').toLowerCase();

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onClear) {
        onClear();
      }
    };

    return (
      <div className={`flex flex-col gap-1 ${fullWidth ? "w-full" : ""}`}>
        {label && (
          <label htmlFor={selectId} className="text-[11px] font-bold text-[#0A0A0F]/60 uppercase tracking-wider px-0.5">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-2.5 text-[#0A0A0F]/40 pointer-events-none z-10 flex items-center justify-center">
              {icon}
            </div>
          )}

          <select
            ref={ref}
            id={selectId}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`
              w-full h-8.5 px-3 rounded-md bg-black/[0.02] border text-xs font-medium text-[#0A0A0F] focus:outline-none focus:bg-white transition-all appearance-none cursor-pointer
              ${icon ? "pl-9" : ""}
              ${error
                ? "border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/20 bg-red-500/[0.01]"
                : "border-black/[0.08] hover:border-black/[0.18] focus:border-[#FF6A00]/40 focus:ring-1 focus:ring-[#FF6A00]/10"
              }
              ${disabled ? "bg-black/[0.04] text-[#0A0A0F]/30 cursor-not-allowed border-black/[0.04]" : ""}
              ${className}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="text-[#0A0A0F]/40 font-medium text-xs">
                {placeholder}
              </option>
            )}

            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="text-[#0A0A0F] font-medium bg-white py-1 text-xs"
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Dropdown icon */}
          <div className="absolute right-3.5 text-[#0A0A0F]/40 pointer-events-none flex items-center justify-center">
            <ChevronDownIcon className="w-3.5 h-3.5" />
          </div>

          {/* Clear button */}
          {clearable && value && onClear && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-8 w-5 h-5 rounded-full flex items-center justify-center text-[#0A0A0F]/40 hover:text-[#0A0A0F] hover:bg-black/[0.04] z-10 transition-all"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
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

Select.displayName = "Select";
