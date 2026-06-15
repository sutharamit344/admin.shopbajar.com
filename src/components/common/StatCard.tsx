import React from "react";

const iconColorClasses: Record<string, string> = {
  primary: "bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 border border-primary-100/50 dark:border-primary-900/30",
  secondary: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100/50 dark:border-amber-900/30",
  success: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/30",
  warning: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100/50 dark:border-amber-900/30",
  danger: "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-100/50 dark:border-red-900/30",
  info: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/30",
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    positive: boolean;
  };
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = "primary",
}) => {
  return (
    <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-100 dark:border-zinc-800/80 p-5 shadow-xs hover:shadow-md hover:border-zinc-200 dark:hover:border-zinc-700/80 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            {title}
          </p>
          <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight">{value}</p>

          {trend && (
            <div className="flex items-center gap-1.5 pt-1">
              <span
                className={`text-xs font-semibold flex items-center ${
                  trend.positive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                }`}
              >
                {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">{trend.label}</span>
            </div>
          )}
        </div>

        <div className={`p-2.5 rounded-lg ${iconColorClasses[color] || iconColorClasses.primary}`}>
          <div className="w-5 h-5">{icon}</div>
        </div>
      </div>
    </div>
  );
};
