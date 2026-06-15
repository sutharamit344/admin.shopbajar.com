import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchDashboardStats } from "./dashboardSlice";
import { StatCard } from "../../components/common/StatCard";
import {
  BuildingStorefrontIcon,
  QueueListIcon,
  MapPinIcon,
  ExclamationCircleIcon,
  EnvelopeIcon,
  ArrowPathIcon,
  PlusIcon,
  ArrowTopRightOnSquareIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

export const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { stats, isLoading } = useAppSelector((state) => state.dashboard);
  const [activeTab, setActiveTab] = useState<"shops" | "inquiries" | "logs">("shops");

  const handleRefresh = () => {
    dispatch(fetchDashboardStats());
  };

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const totalShopsAll = stats.totalShops + stats.pendingShops;
  const approvedPercentage = totalShopsAll > 0 ? Math.round((stats.totalShops / totalShopsAll) * 100) : 0;

  const statCards = [
    {
      title: "Approved Shops",
      value: stats.totalShops,
      icon: <BuildingStorefrontIcon />,
      color: "success",
      trend: { value: approvedPercentage, label: "of total listings", positive: true },
    },
    {
      title: "Pending Approval",
      value: stats.pendingShops,
      icon: <ExclamationCircleIcon />,
      color: "warning",
      trend: { value: stats.pendingShops, label: "need review", positive: stats.pendingShops === 0 },
    },
    {
      title: "Categories",
      value: stats.totalCategories,
      icon: <QueueListIcon />,
      color: "info",
    },
    {
      title: "Clusters",
      value: stats.totalClusters,
      icon: <MapPinIcon />,
      color: "secondary",
    },
    {
      title: "Unread Messages",
      value: stats.totalInquiries,
      icon: <EnvelopeIcon />,
      color: "primary",
    },
  ];

  const timeAgo = (dateStr: any) => {
    if (!dateStr) return "Just now";
    try {
      const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
      if (seconds < 0) return "Just now";

      let interval = Math.floor(seconds / 31536000);
      if (interval >= 1) return interval === 1 ? "1y ago" : `${interval}y ago`;

      interval = Math.floor(seconds / 2592000);
      if (interval >= 1) return interval === 1 ? "1m ago" : `${interval}m ago`;

      interval = Math.floor(seconds / 86400);
      if (interval >= 1) return interval === 1 ? "1d ago" : `${interval}d ago`;

      interval = Math.floor(seconds / 3600);
      if (interval >= 1) return interval === 1 ? "1h ago" : `${interval}h ago`;

      interval = Math.floor(seconds / 60);
      if (interval >= 1) return interval === 1 ? "1m ago" : `${interval}m ago`;

      return "Just now";
    } catch {
      return "N/A";
    }
  };

  const getSystemDate = () => {
    return new Date().toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-zinc-900/50 backdrop-blur-sm p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/80 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-primary-500 animate-pulse" />
            Console Overview
          </h1>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
            System performance audit for {getSystemDate()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/50 dark:border-zinc-700/50 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <ArrowPathIcon className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, index) => (
          <StatCard
            key={index}
            title={card.title}
            value={isLoading ? "..." : card.value}
            icon={card.icon}
            color={card.color}
            trend={"trend" in card ? card.trend : undefined}
          />
        ))}
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Activity Feeds (Tabs) */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900/50 backdrop-blur-sm p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/80 shadow-xs flex flex-col min-h-[400px]">
          {/* Tab selectors */}
          <div className="flex border-b border-zinc-100 dark:border-zinc-800/80 pb-3 mb-4 justify-between items-center flex-wrap gap-2">
            <div className="flex gap-1.5 bg-zinc-50 dark:bg-zinc-950/40 p-1 rounded-lg border border-zinc-200/20 dark:border-zinc-800/20">
              <button
                onClick={() => setActiveTab("shops")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  activeTab === "shops"
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-xs border border-zinc-200/50 dark:border-zinc-700/50"
                    : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                }`}
              >
                Recent Shops
              </button>
              <button
                onClick={() => setActiveTab("inquiries")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  activeTab === "inquiries"
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-xs border border-zinc-200/50 dark:border-zinc-700/50"
                    : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                }`}
              >
                Inquiries
              </button>
              <button
                onClick={() => setActiveTab("logs")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  activeTab === "logs"
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-xs border border-zinc-200/50 dark:border-zinc-700/50"
                    : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                }`}
              >
                Audit Logs
              </button>
            </div>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest bg-zinc-50 dark:bg-zinc-900 px-2 py-0.5 rounded">
              Feed Mode: Live
            </span>
          </div>

          {/* Feed Content */}
          <div className="flex-1">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="animate-pulse flex items-center gap-4 py-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4" />
                      <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Shops Tab */}
                {activeTab === "shops" && (
                  stats.recentShops.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-zinc-400 dark:text-zinc-500 py-12 text-xs font-semibold uppercase tracking-widest">
                      No recent shop registrations
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                      {stats.recentShops.map((shop) => (
                        <div key={shop.id} className="py-3.5 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center text-zinc-600 dark:text-zinc-400 font-bold border border-zinc-100 dark:border-zinc-800 text-sm">
                              {shop.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-zinc-950 dark:text-zinc-50">
                                {shop.name}
                              </div>
                              <div className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                                {shop.category || "General"} • {shop.city || "N/A"}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${
                                shop.status === "approved"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                  : shop.status === "pending"
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                  : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                              }`}
                            >
                              {shop.status}
                            </span>
                            <Link
                              to={`/shops/edit/${shop.id}`}
                              className="p-1 rounded bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-primary-500 dark:hover:text-primary-400 border border-zinc-200/50 dark:border-zinc-700/50 hover:border-primary-500/20 transition-all cursor-pointer"
                              title="Edit shop details"
                            >
                              <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {/* Inquiries Tab */}
                {activeTab === "inquiries" && (
                  stats.recentInquiries.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-zinc-400 dark:text-zinc-500 py-12 text-xs font-semibold uppercase tracking-widest">
                      No customer inquiries found
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                      {stats.recentInquiries.map((inquiry) => (
                        <div key={inquiry.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                  inquiry.status === "new" ? "bg-primary-500 animate-pulse" : "bg-zinc-300 dark:bg-zinc-700"
                                }`}
                              />
                              <div className="text-xs font-semibold text-zinc-950 dark:text-zinc-50 truncate">
                                {inquiry.subject || "No Subject"}
                              </div>
                            </div>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                              {inquiry.message}
                            </p>
                            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                              From: {inquiry.name} ({inquiry.email})
                            </p>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-3 text-right">
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                              {timeAgo(inquiry.createdAt)}
                            </span>
                            <Link
                              to="/reports/inquiries"
                              className="p-1 rounded bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-primary-500 dark:hover:text-primary-400 border border-zinc-200/50 dark:border-zinc-700/50 hover:border-primary-500/20 transition-all cursor-pointer"
                            >
                              <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {/* Audit Logs Tab */}
                {activeTab === "logs" && (
                  stats.recentLogs.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-zinc-400 dark:text-zinc-500 py-12 text-xs font-semibold uppercase tracking-widest">
                      No admin operations recorded
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                      {stats.recentLogs.map((log) => (
                        <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-zinc-950 dark:text-zinc-50 flex flex-wrap items-center gap-1.5">
                              <span className="px-1.5 py-0.5 rounded bg-zinc-50 dark:bg-zinc-800 font-mono text-[9px] font-bold text-zinc-500 dark:text-zinc-400 border border-zinc-100 dark:border-zinc-700">
                                {log.action}
                              </span>
                              <span className="truncate">{log.details}</span>
                            </div>
                            <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
                              By: {log.performedBy || "System"} • Object: {log.entityType}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                              {timeAgo(log.timestamp)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Side: Quick Action Terminal & Ratio Progress */}
        <div className="space-y-6">
          {/* Quick Actions Panel */}
          <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-sm p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/80 shadow-xs">
            <h2 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-1">
              <CpuChipIcon className="w-4 h-4 text-primary-500" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 gap-2">
              <Link
                to="/shops/add"
                className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/50 dark:border-zinc-700/50 rounded-lg hover:border-primary-500/30 hover:bg-zinc-100 dark:hover:bg-zinc-700/80 transition-all group cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <PlusIcon className="w-4 h-4 text-zinc-400 group-hover:text-primary-500" />
                  Add New Shop
                </span>
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">New</span>
              </Link>
              <Link
                to="/shops"
                className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/50 dark:border-zinc-700/50 rounded-lg hover:border-primary-500/30 hover:bg-zinc-100 dark:hover:bg-zinc-700/80 transition-all group cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <BuildingStorefrontIcon className="w-4 h-4 text-zinc-400 group-hover:text-primary-500" />
                  Moderate Shops
                </span>
                {stats.pendingShops > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[9px] font-bold">
                    {stats.pendingShops}
                  </span>
                )}
              </Link>
              <Link
                to="/categories"
                className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/50 dark:border-zinc-700/50 rounded-lg hover:border-primary-500/30 hover:bg-zinc-100 dark:hover:bg-zinc-700/80 transition-all group cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <QueueListIcon className="w-4 h-4 text-zinc-400 group-hover:text-primary-500" />
                  Configure Categories
                </span>
              </Link>
              <Link
                to="/marketing/blogs/add"
                className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/50 dark:border-zinc-700/50 rounded-lg hover:border-primary-500/30 hover:bg-zinc-100 dark:hover:bg-zinc-700/80 transition-all group cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <DocumentTextIcon className="w-4 h-4 text-zinc-400 group-hover:text-primary-500" />
                  Write Blog Post
                </span>
              </Link>
              <Link
                to="/reports/logs"
                className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/50 dark:border-zinc-700/50 rounded-lg hover:border-primary-500/30 hover:bg-zinc-100 dark:hover:bg-zinc-700/80 transition-all group cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheckIcon className="w-4 h-4 text-zinc-400 group-hover:text-primary-500" />
                  Audit Operations
                </span>
              </Link>
            </div>
          </div>

          {/* System Health Panel */}
          <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-sm p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/80 shadow-xs space-y-4">
            <div>
              <h2 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3">
                Listing Distribution
              </h2>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  <span>Approved ratio</span>
                  <span>{approvedPercentage}%</span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${approvedPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-zinc-400 dark:text-zinc-500">
                  <span>{stats.totalShops} Approved</span>
                  <span>{stats.pendingShops} Pending</span>
                </div>
              </div>
            </div>

            <hr className="border-zinc-100 dark:border-zinc-800/80" />

            <div>
              <h3 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2">
                Operational Status
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500 dark:text-zinc-400">Firestore Database</span>
                  <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                    Online
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500 dark:text-zinc-400">Firebase Auth</span>
                  <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                    Secure
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500 dark:text-zinc-400">Admin Environment</span>
                  <span className="font-mono text-[10px] font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200/50 dark:border-zinc-700/50">
                    Production
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
