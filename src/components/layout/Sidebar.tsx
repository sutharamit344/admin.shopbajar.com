import React from "react";
import { NavLink } from "react-router-dom";
import {
  HomeIcon,
  BuildingStorefrontIcon,
  CalendarDaysIcon,
  TagIcon,
  MapIcon,
  UsersIcon,
  ShieldCheckIcon,
  MegaphoneIcon,
  ChartBarIcon,
  MapPinIcon,
  ChevronLeftIcon,
} from "@heroicons/react/24/outline";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { toggleCollapsed } from "./sidebarSlice";

const navigation = [
  { label: "Dashboard", path: "/", icon: HomeIcon },
  { label: "Shops", path: "/shops", icon: BuildingStorefrontIcon },
  { label: "Table Bookings", path: "/bookings", icon: CalendarDaysIcon },
  { label: "Categories", path: "/categories", icon: TagIcon },
  { label: "Subcategories", path: "/subcategories", icon: TagIcon },
  { label: "Locations", path: "/locations", icon: MapPinIcon },
  { label: "Clusters", path: "/clusters", icon: MapIcon },
  { label: "Features Master", path: "/features", icon: TagIcon },
  { label: "Blogs", path: "/marketing/blogs", icon: MegaphoneIcon },
  { label: "Inquiries", path: "/reports/inquiries", icon: ChartBarIcon },
  { label: "Activity Logs", path: "/reports/logs", icon: ShieldCheckIcon },
  { label: "Database", path: "/database", icon: HomeIcon }, // Using HomeIcon as placeholder for DB
];

export const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { collapsed } = useAppSelector((state) => state.sidebar);

  const handleToggleSidebar = () => {
    dispatch(toggleCollapsed());
  };

  return (
    <aside
      className={`bg-gray-900 text-white h-screen fixed left-0 top-0 transition-all duration-300 flex flex-col z-20 ${collapsed ? "w-16" : "w-64"
        }`}
    >
      {/* Logo */}
      <div
        className={`flex items-center h-16 border-b border-gray-800 ${!collapsed ? "px-5 justify-between" : "justify-center"
          }`}
      >
        {!collapsed ? (
          <span className="text-xl font-bold text-white">Shop Bajar Admin</span>
        ) : (
          <span
            onClick={handleToggleSidebar}
            className="text-xl font-bold text-white bg-primary-800 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer"
          >
            S
          </span>
        )}
        {!collapsed && (
          <button
            onClick={handleToggleSidebar}
            className="p-1 rounded-md hover:bg-gray-800 cursor-pointer"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {navigation.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 transition-colors ${isActive
                ? "bg-primary-800 text-white border-l-4 border-secondary-500"
                : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && (
              <span className="text-sm font-medium">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer / User Placeholder */}
      <div className="border-t border-gray-800 p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
            <UsersIcon className="w-4 h-4 text-gray-400" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">Admin User</div>
              <div className="text-xs text-gray-400 truncate">Super Admin</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
