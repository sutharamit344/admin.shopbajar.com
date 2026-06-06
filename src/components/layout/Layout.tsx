import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { setCollapsed } from "./sidebarSlice";
import useWindowSize from "../../hooks/useWindowSize";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export const Layout: React.FC = () => {
  const dispatch = useAppDispatch();
  const { collapsed } = useAppSelector((state) => state.sidebar);
  const windowSize = useWindowSize();

  // Handle window resize - auto collapse on mobile
  useEffect(() => {
    if (windowSize.width < 1024) {
      dispatch(setCollapsed(true));
    } else {
      dispatch(setCollapsed(false));
    }
  }, [windowSize.width, dispatch]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <main
        className={`transition-all duration-300 min-h-screen flex flex-col ${
          collapsed ? "ml-16" : "ml-64"
        }`}
      >
        <Header />

        <div className="p-6 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
