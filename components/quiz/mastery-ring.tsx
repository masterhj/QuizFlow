"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface MasteryRingProps {
  subject: string;
  mastery: number;
  size?: "sm" | "md" | "lg";
}

const sizeConfig = {
  sm: { radius: 40, circumference: 251.2, fontSize: "text-sm", labelSize: "text-xs" },
  md: { radius: 60, circumference: 376.8, fontSize: "text-2xl", labelSize: "text-sm" },
  lg: { radius: 80, circumference: 502.4, fontSize: "text-4xl", labelSize: "text-base" },
};

const getMasteryColor = (mastery: number): string => {
  if (mastery < 40) return "url(#redGradient)";
  if (mastery < 70) return "url(#amberGradient)";
  return "url(#emeraldGradient)";
};

const getMasteryLabel = (mastery: number): string => {
  if (mastery < 40) return "Novice";
  if (mastery < 70) return "Proficient";
  return "Expert";
};

export const MasteryRing = React.forwardRef<SVGSVGElement, MasteryRingProps>(
  ({ subject, mastery, size = "md" }, ref) => {
    const config = sizeConfig[size];
    const clampedMastery = Math.min(Math.max(mastery, 0), 100);
    const strokeDashoffset = config.circumference - (clampedMastery / 100) * config.circumference;

    const svgSize = size === "sm" ? 100 : size === "md" ? 150 : 200;
    const strokeWidth = size === "sm" ? 3 : size === "md" ? 4 : 5;
    const centerX = svgSize / 2;
    const centerY = svgSize / 2;

    return (
      <div className="flex flex-col items-center gap-3">
        <svg
          ref={ref}
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className="drop-shadow-sm"
        >
          <defs>
            <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
            <linearGradient id="amberGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>

          {/* Background Circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r={config.radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
          />

          {/* Progress Circle */}
          <motion.circle
            cx={centerX}
            cy={centerY}
            r={config.radius}
            fill="none"
            stroke={getMasteryColor(clampedMastery)}
            strokeWidth={strokeWidth}
            strokeDasharray={config.circumference}
            strokeDashoffset={config.circumference}
            strokeLinecap="round"
            initial={{ strokeDashoffset: config.circumference }}
            animate={{ strokeDashoffset }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
            style={{ transformOrigin: `${centerX}px ${centerY}px`, transform: "rotate(-90deg)" }}
          />

          {/* Center Text */}
          <text
            x={centerX}
            y={centerY}
            textAnchor="middle"
            dy="0.3em"
            className={cn(
              "font-bold fill-slate-900",
              config.fontSize
            )}
          >
            {clampedMastery}%
          </text>
          <text
            x={centerX}
            y={centerY + 20}
            textAnchor="middle"
            className="text-xs fill-slate-500"
          >
            {getMasteryLabel(clampedMastery)}
          </text>
        </svg>

        {/* Subject Label */}
        <div className={cn("font-medium text-slate-900 text-center", config.labelSize)}>
          {subject}
        </div>
      </div>
    );
  }
);

MasteryRing.displayName = "MasteryRing";
