// src/components/common/IconButton.tsx
import React from "react";

export type IconButtonColor =
  | "orange"
  | "red"
  | "blue"
  | "green"
  | "gray"
  | "primary"
  | "secondary"
  | "purple"
  | "pink"
  | "indigo"
  | "teal"
  | "cyan"
  | "amber"
  | "lime"
  | "emerald"
  | "rose"
  | "fuchsia"
  | "violet"
  | "sky"
  | "yellow"
  | "slate"
  | "zinc"
  | "neutral"
  | "stone"
  | "brown"
  | "crimson"
  | "gold"
  | "silver"
  | "bronze"
  | "navy"
  | "maroon"
  | "olive"
  | "coral"
  | "salmon"
  | "khaki"
  | "plum"
  | "orchid"
  | "lavender"
  | "mint"
  | "turquoise";

export type IconButtonSize = "xs" | "sm" | "md" | "lg";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  isActive?: boolean;
  icon: React.ReactNode;
  size?: IconButtonSize;
  color?: IconButtonColor;
  isLoading?: boolean;
  refresh?: boolean;
  rounded?: boolean;
  label?: string;
  tooltip?: string;
  variant?: "solid" | "outline" | "ghost";
  toggle?: any;
  action?: string;
}

const baseClasses =
  "inline-flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

const solidColorClasses: Partial<Record<IconButtonColor, string>> = {
  primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500",
  secondary: "bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-secondary-500",
  orange: "bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-400",
  red: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-400",
  blue: "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-400",
  green: "bg-green-500 text-white hover:bg-green-600 focus:ring-green-400",
  purple: "bg-purple-500 text-white hover:bg-purple-600 focus:ring-purple-400",
  pink: "bg-pink-500 text-white hover:bg-pink-600 focus:ring-pink-400",
  indigo: "bg-indigo-500 text-white hover:bg-indigo-600 focus:ring-indigo-400",
  teal: "bg-teal-500 text-white hover:bg-teal-600 focus:ring-teal-400",
  cyan: "bg-cyan-500 text-white hover:bg-cyan-600 focus:ring-cyan-400",
  amber: "bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-400",
  lime: "bg-lime-500 text-white hover:bg-lime-600 focus:ring-lime-400",
  emerald: "bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-400",
  rose: "bg-rose-500 text-white hover:bg-rose-600 focus:ring-rose-400",
  fuchsia: "bg-fuchsia-500 text-white hover:bg-fuchsia-600 focus:ring-fuchsia-400",
  violet: "bg-violet-500 text-white hover:bg-violet-600 focus:ring-violet-400",
  sky: "bg-sky-500 text-white hover:bg-sky-600 focus:ring-sky-400",
  yellow: "bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-400",
  crimson: "bg-red-700 text-white hover:bg-red-800 focus:ring-red-600",
  gold: "bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500",
  navy: "bg-blue-900 text-white hover:bg-blue-950 focus:ring-blue-800",
  maroon: "bg-red-800 text-white hover:bg-red-900 focus:ring-red-700",
  coral: "bg-orange-400 text-white hover:bg-orange-500 focus:ring-orange-300",
  salmon: "bg-red-400 text-white hover:bg-red-500 focus:ring-red-300",
};

const outlineColorClasses: Partial<Record<IconButtonColor, string>> = {
  primary: "border border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500",
  secondary: "border border-secondary-500 text-secondary-500 hover:bg-secondary-50 focus:ring-secondary-500",
  orange: "border border-orange-500 text-orange-500 hover:bg-orange-50 focus:ring-orange-400",
  red: "border border-red-500 text-red-500 hover:bg-red-50 focus:ring-red-400",
  blue: "border border-blue-500 text-blue-500 hover:bg-blue-50 focus:ring-blue-400",
  green: "border border-green-500 text-green-500 hover:bg-green-50 focus:ring-green-400",
  purple: "border border-purple-500 text-purple-500 hover:bg-purple-50 focus:ring-purple-400",
  pink: "border border-pink-500 text-pink-500 hover:bg-pink-50 focus:ring-pink-400",
  gray: "border border-gray-500 text-gray-500 hover:bg-gray-50 focus:ring-gray-400",
  slate: "border border-slate-500 text-slate-500 hover:bg-slate-50 focus:ring-slate-400",
  brown: "border border-amber-800 text-amber-800 hover:bg-amber-50 focus:ring-amber-700",
  gold: "border border-yellow-600 text-yellow-600 hover:bg-yellow-50 focus:ring-yellow-500",
};

const ghostColorClasses: Record<IconButtonColor, string> = {
  orange: "text-orange-500 bg-transparent hover:text-orange-600 hover:bg-orange-50 focus:ring-orange-400",
  red: "text-red-500 bg-transparent hover:text-red-600 hover:bg-red-50 focus:ring-red-400",
  blue: "text-blue-500 bg-transparent hover:text-blue-600 hover:bg-blue-50 focus:ring-blue-400",
  green: "text-green-500 bg-transparent hover:text-green-600 hover:bg-green-50 focus:ring-green-400",
  gray: "text-gray-700 bg-transparent hover:text-gray-800 hover:bg-gray-200 focus:ring-gray-400",
  primary: "text-primary-600 bg-transparent hover:text-primary-700 hover:bg-primary-50 focus:ring-primary-500",
  secondary: "text-gray-500 bg-transparent hover:text-gray-600 hover:bg-gray-200 focus:ring-gray-500",
  purple: "text-purple-500 bg-transparent hover:text-purple-600 hover:bg-purple-50 focus:ring-purple-400",
  pink: "text-pink-500 bg-transparent hover:text-pink-600 hover:bg-pink-50 focus:ring-pink-400",
  indigo: "text-indigo-500 bg-transparent hover:text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-400",
  teal: "text-teal-500 bg-transparent hover:text-teal-600 hover:bg-teal-50 focus:ring-teal-400",
  cyan: "text-cyan-500 bg-transparent hover:text-cyan-600 hover:bg-cyan-50 focus:ring-cyan-400",
  amber: "text-amber-500 bg-transparent hover:text-amber-600 hover:bg-amber-50 focus:ring-amber-400",
  lime: "text-lime-500 bg-transparent hover:text-lime-600 hover:bg-lime-50 focus:ring-lime-400",
  emerald: "text-emerald-500 bg-transparent hover:text-emerald-600 hover:bg-emerald-50 focus:ring-emerald-400",
  rose: "text-rose-500 bg-transparent hover:text-rose-600 hover:bg-rose-50 focus:ring-rose-400",
  fuchsia: "text-fuchsia-500 bg-transparent hover:text-fuchsia-600 hover:bg-fuchsia-50 focus:ring-fuchsia-400",
  violet: "text-violet-500 bg-transparent hover:text-violet-600 hover:bg-violet-100 focus:ring-violet-400",
  sky: "text-sky-500 bg-transparent hover:text-sky-600 hover:bg-sky-50 focus:ring-sky-400",
  yellow: "text-yellow-500 bg-transparent hover:text-yellow-600 hover:bg-yellow-50 focus:ring-yellow-400",
  slate: "text-slate-500 bg-transparent hover:text-slate-600 hover:bg-slate-50 focus:ring-slate-400",
  zinc: "text-zinc-500 bg-transparent hover:text-zinc-600 hover:bg-zinc-50 focus:ring-zinc-400",
  neutral: "text-neutral-500 bg-transparent hover:text-neutral-600 hover:bg-neutral-50 focus:ring-neutral-400",
  stone: "text-stone-500 bg-transparent hover:text-stone-600 hover:bg-stone-50 focus:ring-stone-400",
  brown: "text-amber-800 bg-transparent hover:text-amber-900 hover:bg-amber-50 focus:ring-amber-700",
  crimson: "text-red-700 bg-transparent hover:text-red-800 hover:bg-red-50 focus:ring-red-600",
  gold: "text-yellow-600 bg-transparent hover:text-yellow-700 hover:bg-yellow-50 focus:ring-yellow-500",
  silver: "text-gray-400 bg-transparent hover:text-gray-500 hover:bg-gray-50 focus:ring-gray-300",
  bronze: "text-amber-600 bg-transparent hover:text-amber-700 hover:bg-amber-50 focus:ring-amber-500",
  navy: "text-blue-800 bg-transparent hover:text-blue-900 hover:bg-blue-50 focus:ring-blue-700",
  maroon: "text-red-800 bg-transparent hover:text-red-900 hover:bg-red-50 focus:ring-red-700",
  olive: "text-green-700 bg-transparent hover:text-green-800 hover:bg-green-50 focus:ring-green-600",
  coral: "text-orange-400 bg-transparent hover:text-orange-500 hover:bg-orange-50 focus:ring-orange-300",
  salmon: "text-red-400 bg-transparent hover:text-red-500 hover:bg-red-50 focus:ring-red-300",
  khaki: "text-amber-500 bg-transparent hover:text-amber-600 hover:bg-amber-50 focus:ring-amber-400",
  plum: "text-purple-600 bg-transparent hover:text-purple-700 hover:bg-purple-50 focus:ring-purple-500",
  orchid: "text-purple-400 bg-transparent hover:text-purple-500 hover:bg-purple-50 focus:ring-purple-300",
  lavender: "text-purple-300 bg-transparent hover:text-purple-400 hover:bg-purple-50 focus:ring-purple-200",
  mint: "text-green-300 bg-transparent hover:text-green-400 hover:bg-green-50 focus:ring-green-200",
  turquoise: "text-teal-400 bg-transparent hover:text-teal-500 hover:bg-teal-50 focus:ring-teal-300",
};

const sizeClasses: Record<IconButtonSize, string> = {
  xs: "p-1 rounded-sm",
  sm: "p-1 rounded-md",
  md: "p-2.5 rounded-md",
  lg: "p-3 rounded-md",
};

const iconSizeClasses: Record<IconButtonSize, string> = {
  xs: "text-[18px]",
  sm: "text-[18px]",
  md: "text-[24px]",
  lg: "text-[28px]",
};

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  size = "md",
  color = "gray",
  isLoading = false,
  rounded = true,
  label,
  tooltip,
  variant = "ghost",
  className = "",
  disabled,
  ...props
}) => {
  const getColorClass = () => {
    if (variant === "solid") {
      return (
        solidColorClasses[color] ||
        solidColorClasses.primary ||
        solidColorClasses.gray
      );
    } else if (variant === "outline") {
      return (
        outlineColorClasses[color] ||
        outlineColorClasses.primary ||
        "border border-gray-500 text-gray-500 hover:bg-gray-50 focus:ring-gray-400"
      );
    } else {
      return ghostColorClasses[color] || ghostColorClasses.gray;
    }
  };

  return (
    <button
      className={`
        cursor-pointer
        ${baseClasses}
        ${getColorClass()}
        ${sizeClasses[size]}
        ${rounded ? "rounded-full" : ""}
        ${className}
      `}
      disabled={disabled || isLoading}
      aria-label={label || tooltip}
      title={tooltip}
      {...props}
    >
      {isLoading ? (
        <svg
          className={`animate-spin ${iconSizeClasses[size]} text-current`}
          viewBox="0 0 24 24"
        >
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
        <span className={iconSizeClasses[size]}>{icon}</span>
      )}
    </button>
  );
};
