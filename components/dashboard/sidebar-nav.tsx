"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  BarChart2,
  Brain,
  Settings,
  LucideIcon,
} from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface SidebarNavProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
  roles: ("STUDENT" | "TEACHER")[];
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", roles: ["STUDENT", "TEACHER"] },
  { icon: BookOpen, label: "My Quizzes", href: "/quizzes", roles: ["TEACHER"] },
  { icon: BookOpen, label: "Browse Quizzes", href: "/quizzes", roles: ["STUDENT"] },
  { icon: PlusCircle, label: "Create Quiz", href: "/quizzes/create", roles: ["TEACHER"] },
  { icon: BarChart2, label: "Analytics", href: "/analytics", roles: ["STUDENT", "TEACHER"] },
  { icon: Brain, label: "Review", href: "/review", roles: ["STUDENT"] },
  { icon: Settings, label: "Settings", href: "/settings", roles: ["STUDENT", "TEACHER"] },
];

export const SidebarNav = React.forwardRef<HTMLDivElement, SidebarNavProps>(
  ({ collapsed, onToggle }, ref) => {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = useSession();

    const userRole = (session?.user?.role as "STUDENT" | "TEACHER") || "STUDENT";

    const filteredItems = navItems.filter((item) => item.roles.includes(userRole));

    return (
      <motion.div
        ref={ref}
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-screen bg-white border-r border-slate-200 flex flex-col overflow-hidden z-40"
      >
        {/* Header with Collapse Toggle */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          {!collapsed && (
            <h1 className="text-xl font-bold text-indigo-600">QuizFlow</h1>
          )}
          <button
            onClick={onToggle}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <div key={item.href} className="relative group">
                <button
                  onClick={() => router.push(item.href)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    isActive
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && (
                    <span className="text-sm font-medium whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                </button>

                {/* Tooltip for Collapsed State */}
                {collapsed && (
                  <div className="absolute left-16 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Profile at Bottom */}
        {session?.user && (
          <div className="p-4 border-t border-slate-200">
            <div className="flex items-center gap-3">
              <Avatar
                name={session.user.name || "User"}
                src={session.user.image || undefined}
                size="md"
              />
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {userRole === "STUDENT" ? "Student" : "Teacher"}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    );
  }
);

SidebarNav.displayName = "SidebarNav";
