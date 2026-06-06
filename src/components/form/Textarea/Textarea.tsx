import { forwardRef, type TextareaHTMLAttributes } from "react";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, fullWidth = true, disabled, className = "", id, ...props }, ref) => {
    const textareaId = id || label?.replace(/\s+/g, '-').toLowerCase();

    return (
      <div className={`flex flex-col gap-1 ${fullWidth ? "w-full" : ""}`}>
        {label && (
          <label htmlFor={textareaId} className="text-[11px] font-bold text-[#0A0A0F]/60 uppercase tracking-wider px-0.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          className={`
            w-full min-h-[80px] p-3 rounded-md bg-black/[0.02] border text-xs font-medium text-[#0A0A0F] placeholder:text-[#0A0A0F]/30 focus:outline-none focus:bg-white transition-all custom-scrollbar
            ${error
              ? "border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/20 bg-red-500/[0.01]"
              : "border-black/[0.08] hover:border-black/[0.18] focus:border-[#FF6A00]/40 focus:ring-1 focus:ring-[#FF6A00]/10"
            }
            ${disabled ? "bg-black/[0.04] text-[#0A0A0F]/30 cursor-not-allowed border-black/[0.04]" : ""}
            ${className}
          `}
          {...props}
        />
        {error ? (
          <span className="text-[10px] font-semibold text-red-500 px-0.5">{error}</span>
        ) : helperText ? (
          <span className="text-[10px] font-medium text-[#0A0A0F]/40 px-0.5">{helperText}</span>
        ) : null}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";
