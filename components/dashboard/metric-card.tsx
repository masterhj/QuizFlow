"use client";

import React from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  color: "indigo" | "emerald" | "amber" | "red";
}

const colorConfig = {
  indigo: { bg: "bg-indigo-100", text: "text-indigo-600" },
  emerald: { bg: "bg-emerald-100", text: "text-emerald-600" },
  amber: { bg: "bg-amber-100", text: "text-amber-600" },
  red: { bg: "bg-red-100", text: "text-red-600" },
};

const AnimatedNumber = ({ value }: { value: number }) => {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 60,
    mass: 0.5,
    stiffness: 100,
  });

  React.useEffect(() => {
    motionValue.set(value);
  }, [motionValue, value]);

  return (
    <motion.span>
      {springValue}
    </motion.span>
  );
};

export const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({ title, value, change, icon: Icon, color }, ref) => {
    const config = colorConfig[color];
    const isPositiveChange = change ? change >= 0 : false;

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative bg-white rounded-lg border border-slate-200 p-6 hover:border-slate-300 transition-colors"
      >
        {/* Icon Circle - Top Right */}
        <div className={cn("absolute top-4 right-4 p-3 rounded-lg", config.bg)}>
          <Icon className={cn("h-6 w-6", config.text)} />
        </div>

        {/* Title */}
        <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>

        {/* Value */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <p className="text-3xl font-semibold text-slate-900">
            {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
          </p>
        </motion.div>

        {/* Change Badge */}
        {change !== undefined && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className={cn(
              "mt-4 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold",
              isPositiveChange
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            )}
          >
            {isPositiveChange ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {Math.abs(change)}%
          </motion.div>
        )}
      </motion.div>
    );
  }
);

MetricCard.displayName = "MetricCard";
