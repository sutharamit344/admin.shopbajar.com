import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchDashboardStats } from "./dashboardSlice";
import { StatCard } from "../../components/common/StatCard";
import {
  BuildingStorefrontIcon,
  QueueListIcon,
  MapPinIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

export const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { stats, isLoading } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const statCards = [
    {
      title: "Total Approved Shops",
      value: stats.totalShops,
      icon: <BuildingStorefrontIcon />,
      color: "primary",
      trend: { value: 12, label: "vs last month", positive: true },
    },
    {
      title: "Pending Approval",
      value: stats.pendingShops,
      icon: <ExclamationCircleIcon />,
      color: "warning",
      trend: { value: 5, label: "new requests", positive: false },
    },
    {
      title: "Active Categories",
      value: stats.totalCategories,
      icon: <QueueListIcon />,
      color: "success",
    },
    {
      title: "Business Clusters",
      value: stats.totalClusters,
      icon: <MapPinIcon />,
      color: "info",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500">Real-time performance and management metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <StatCard
            key={index}
            title={card.title}
            value={isLoading ? "..." : card.value}
            icon={card.icon}
            color={card.color}
            trend={card.trend}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-md border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {/* Placeholder for activity log */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-0">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <BuildingStorefrontIcon className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">New Shop Registered</p>
                  <p className="text-xs text-gray-500">2 hours ago • "Modern Bakery"</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-md border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-primary-50 text-primary-800 rounded-md font-medium hover:bg-primary-100 transition-colors text-left">
              Manage Shops
            </button>
            <button className="p-4 bg-success-50 text-success-800 rounded-md font-medium hover:bg-success-100 transition-colors text-left">
              Approve Categories
            </button>
            <button className="p-4 bg-info-50 text-info-800 rounded-md font-medium hover:bg-info-100 transition-colors text-left">
              Update Banners
            </button>
            <button className="p-4 bg-warning-50 text-warning-800 rounded-md font-medium hover:bg-warning-100 transition-colors text-left">
              View Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
