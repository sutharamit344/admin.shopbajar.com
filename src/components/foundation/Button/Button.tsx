import React from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "danger"
  | "ghost"
  | "success"
  | "warning"
  | "info";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  isCompact?: boolean;
  leftIcon?: React.ReactNode | React.ElementType;
  rightIcon?: React.ReactNode | React.ElementType;
  children: React.ReactNode;
}

const baseClasses =
  "inline-flex items-center justify-center gap-1.5 font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap rounded-md shadow-2xs";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[#FF6A00] text-white hover:bg-[#FF6A00]/90 shadow-md shadow-[#FF6A00]/20",

  secondary:
    "bg-[#0A0A0F] text-white hover:bg-[#0A0A0F]/90 shadow-md",

  outline:
    "bg-white border border-black/[0.08] text-[#0A0A0F] hover:border-black/[0.2] hover:bg-black/[0.02]",

  danger:
    "bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-500/20",

  ghost:
    "text-[#0A0A0F]/70 hover:bg-black/[0.04] hover:text-[#0A0A0F] shadow-none",

  success:
    "bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/20",

  warning:
    "bg-amber-500 text-white hover:bg-amber-600 shadow-md shadow-amber-500/20",

  info:
    "bg-blue-500 text-white hover:bg-blue-600 shadow-md shadow-blue-500/20",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-[12px] h-8",
  md: "px-4 py-2 text-[13px] h-10",
  lg: "px-6 py-3 text-[15px] h-12",
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  isCompact = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className = "",
  disabled,
  ...props
}) => {
  const renderIcon = (IconProp: React.ReactNode | React.ElementType) => {
    if (!IconProp) return null;
    if (React.isValidElement(IconProp)) {
      return IconProp;
    }
    const IconComponent = IconProp as React.ElementType;
    return <IconComponent size={16} className="flex-shrink-0" />;
  };

  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${isCompact ? "!h-8 !px-2.5 !text-[11px]" : sizeClasses[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-4 w-4 text-current flex-shrink-0" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        renderIcon(LeftIcon)
      )}
      <span>{children}</span>
      {!isLoading && renderIcon(RightIcon)}
    </button>
  );
};
