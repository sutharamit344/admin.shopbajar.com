import React from "react";

export type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: "sm" | "md";
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-black/[0.04] border border-black/[0.06] text-[#0A0A0F]/70",
  primary: "bg-[#FF6A00]/10 border border-[#FF6A00]/20 text-[#FF6A00]",
  success: "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600",
  warning: "bg-amber-500/10 border border-amber-500/20 text-amber-600",
  danger: "bg-red-500/10 border border-red-500/20 text-red-600",
  info: "bg-blue-500/10 border border-blue-500/20 text-blue-600",
  neutral: "bg-white border border-black/[0.08] text-[#0A0A0F] shadow-2xs",
};

const sizeClasses = {
  sm: "px-2 py-0.5 text-[10px] tracking-wider uppercase font-extrabold",
  md: "px-2.5 py-1 text-[12px] font-bold",
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  size = "md",
  className = "",
}) => {
  return (
    <span
      className={`inline-flex items-center rounded-md transition-all backdrop-blur-md ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </span>
  );
};
