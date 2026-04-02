"use client";

import React, { useState, useEffect } from "react";
import { SessionUser } from "@/types";
import { SidebarNav } from "./sidebar-nav";
import { TopNav } from "./top-nav";

export interface DashboardShellProps {
  user: SessionUser;
  children: React.ReactNode;
}

export const DashboardShell = ({ user, children }: DashboardShellProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load collapsed state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored !== null) {
      setCollapsed(JSON.parse(stored));
    }
    setMounted(true);
  }, []);

  // Save collapsed state to localStorage
  const handleToggleCollapse = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem("sidebar-collapsed", JSON.stringify(newState));
  };

  if (!mounted) {
    return null; // Avoid hydration mismatch
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex">
      {/* Sidebar - Hidden on mobile */}
      <div className="hidden md:flex flex-shrink-0">
        <SidebarNav
          collapsed={collapsed}
          onToggle={handleToggleCollapse}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <TopNav
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
          ]}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <div className="fixed md:hidden bottom-0 left-0 right-0 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 px-4 py-2 flex justify-around z-50">
        <button className="flex flex-col items-center gap-1 px-3 py-2 text-slate-600 dark:text-slate-400">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
          </svg>
          <span className="text-xs">Home</span>
        </button>

        <button className="flex flex-col items-center gap-1 px-3 py-2 text-slate-600 dark:text-slate-400">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
          </svg>
          <span className="text-xs">Browse</span>
        </button>

        <button className="flex flex-col items-center gap-1 px-3 py-2 text-slate-600 dark:text-slate-400">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          <span className="text-xs">Create</span>
        </button>

        <button className="flex flex-col items-center gap-1 px-3 py-2 text-slate-600 dark:text-slate-400">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z" />
          </svg>
          <span className="text-xs">Analytics</span>
        </button>

        <button className="flex flex-col items-center gap-1 px-3 py-2 text-slate-600 dark:text-slate-400">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.64l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.22-.07.5.12.64l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.64l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.5-.12-.64l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
          </svg>
          <span className="text-xs">Settings</span>
        </button>
      </div>

      {/* Mobile bottom padding to avoid content overlap */}
      <div className="md:hidden h-20" />
    </div>
  );
};
