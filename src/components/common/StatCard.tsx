import React from "react";

const iconColorClasses: Record<string, string> = {
  primary: "bg-primary-100 text-primary-800",
  secondary: "bg-secondary-100 text-secondary-600",
  success: "bg-success-100 text-success-800",
  warning: "bg-warning-100 text-warning-800",
  danger: "bg-danger-100 text-danger-800",
  info: "bg-info-100 text-info-800",
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
    <div className="bg-white rounded-md border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>

          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={`text-xs font-bold flex items-center ${trend.positive ? "text-success-500" : "text-danger-500"
                  }`}
              >
                {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-400">{trend.label}</span>
            </div>
          )}
        </div>

        <div className={`p-3 rounded-md ${iconColorClasses[color] || iconColorClasses.primary}`}>
          <div className="w-6 h-6">{icon}</div>
        </div>
      </div>
    </div>
  );
};
