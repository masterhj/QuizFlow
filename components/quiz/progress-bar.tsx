"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
  animated?: boolean;
}

export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ current, total, showLabel = true, animated = true }, ref) => {
    const percentage = Math.round((current / total) * 100);
    const isComplete = percentage === 100;

    return (
      <div ref={ref} className="space-y-2">
        <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={animated ? { width: 0 } : { width: `${percentage}%` }}
            animate={{ width: `${percentage}%` }}
            transition={animated ? { type: "spring", stiffness: 200, damping: 20 } : {}}
            className={cn(
              "h-full rounded-full transition-colors",
              isComplete ? "bg-emerald-500" : "bg-indigo-500"
            )}
          />
        </div>

        {showLabel && (
          <p className="text-xs font-medium text-slate-600">
            {current} of {total} questions
          </p>
        )}
      </div>
    );
  }
);

ProgressBar.displayName = "ProgressBar";
