"use client";

import React, { useState } from "react";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Sun, Moon, ChevronRight, LogOut, User, Settings } from "lucide-react";
import Link from "next/link";

import { Avatar } from "@/components/ui/avatar";
import { userStore } from "@/stores/userStore";
import { cn } from "@/lib/utils";

export interface TopNavProps {
  breadcrumbs: { label: string; href?: string }[];
}

export const TopNav = React.forwardRef<HTMLDivElement, TopNavProps>(
  ({ breadcrumbs }, ref) => {
    const { theme, setTheme } = useTheme();
    const { data: session } = useSession();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const notifications = userStore((state) => state.notifications);

    return (
      <div
        ref={ref}
        className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-4"
      >
        <div className="flex items-center justify-between">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1 text-sm">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="h-4 w-4 text-slate-400 mx-1" />}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-slate-900 font-semibold">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Notifications Bell */}
            <div className="relative">
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors relative">
                <Bell className="h-5 w-5 text-slate-600" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
                )}
              </button>
            </div>

            {/* Theme Toggle */}
            <motion.button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <AnimatePresence mode="wait">
                {theme === "dark" ? (
                  <motion.div
                    key="moon"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="h-5 w-5 text-slate-600" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="sun"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="h-5 w-5 text-slate-600" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* User Avatar Dropdown */}
            {session?.user && (
              <div className="relative">
                <motion.button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2"
                >
                  <Avatar
                    name={session.user.name || "User"}
                    src={session.user.image || undefined}
                    size="md"
                  />
                </motion.button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-slate-200">
                        <p className="text-sm font-semibold text-slate-900">
                          {session.user.name}
                        </p>
                        <p className="text-xs text-slate-500">{session.user.email}</p>
                      </div>

                      <div className="py-2">
                        <Link
                          href="/profile"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User className="h-4 w-4" />
                          Profile
                        </Link>

                        <Link
                          href="/settings"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Settings className="h-4 w-4" />
                          Settings
                        </Link>
                      </div>

                      <div className="border-t border-slate-200 py-2">
                        <button
                          onClick={async () => {
                            setShowUserMenu(false);
                            await signOut({ redirectTo: "/login" });
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

TopNav.displayName = "TopNav";
