"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ActivityHeatmapProps {
  data: { date: string; count: number }[];
}

const getColorIntensity = (count: number): string => {
  if (count === 0) return "bg-slate-100";
  if (count === 1) return "bg-indigo-200";
  if (count <= 3) return "bg-indigo-400";
  return "bg-indigo-600";
};

const formatTooltip = (date: string, count: number): string => {
  if (count === 0) return `No activity on ${date}`;
  return `${count} quiz${count > 1 ? "zes" : ""} on ${date}`;
};

export const ActivityHeatmap = React.forwardRef<HTMLDivElement, ActivityHeatmapProps>(
  ({ data }, ref) => {
    const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

    // Group data into weeks (last 52 weeks × 7 days)
    const weekData: Array<Array<{ date: string; count: number } | null>> = [];

    // Create a map of dates to counts for quick lookup
    const dataMap = new Map(data.map((d) => [d.date, d.count]));

    // Get the start date (52 weeks ago from today)
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 365);

    // Fill in the heatmap grid
    let currentWeek: Array<{ date: string; count: number } | null> = [];
    let currentDate = new Date(startDate);

    while (currentDate <= today) {
      const dayOfWeek = currentDate.getDay();

      const dateStr = currentDate.toISOString().split("T")[0];
      const count = dataMap.get(dateStr) || 0;

      currentWeek.push({ date: dateStr, count });

      if (dayOfWeek === 6 || currentDate.getTime() === today.getTime()) {
        weekData.push([...currentWeek]);
        currentWeek = [];
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      weekData.push(currentWeek);
    }

    // Get month labels
    const monthLabels = new Map<number, string>();
    currentDate = new Date(startDate);
    while (currentDate <= today) {
      const month = currentDate.toLocaleString("default", { month: "short" });
      const monthKey = currentDate.getMonth();
      if (!monthLabels.has(monthKey)) {
        monthLabels.set(monthKey, month);
      }
      currentDate.setDate(currentDate.getDate() + 7);
    }

    return (
      <div ref={ref} className="relative">
        {/* Heatmap Grid */}
        <div className="overflow-x-auto">
          <div className="inline-block">
            {/* Days of week labels */}
            <div className="flex gap-1 mb-2">
              <div className="w-12" />
              <div className="flex flex-col gap-1">
                {["Mon", "Wed", "Fri"].map((day) => (
                  <div key={day} className="h-3 text-xs text-slate-500 flex items-center justify-center">
                    {day}
                  </div>
                ))}
              </div>
            </div>

            {/* Main grid */}
            <div className="flex gap-1">
              {weekData.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-1">
                  {week.map((day, dayIdx) => {
                    if (!day) {
                      return <div key={dayIdx} className="h-3 w-3" />;
                    }

                    return (
                      <motion.button
                        key={day.date}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.95 }}
                        onMouseEnter={() => {
                          const text = formatTooltip(day.date, day.count);
                          setTooltip({
                            text,
                            x: weekIdx * 16,
                            y: dayIdx * 16,
                          });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                        className={cn(
                          "h-3 w-3 rounded-sm cursor-pointer transition-all",
                          getColorIntensity(day.count)
                        )}
                        title={formatTooltip(day.date, day.count)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tooltip */}
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed bg-slate-900 text-white text-xs rounded px-2.5 py-1.5 pointer-events-none z-50 whitespace-nowrap"
            style={{
              left: `${tooltip.x}px`,
              top: `${tooltip.y}px`,
              transform: "translate(-50%, -120%)",
            }}
          >
            {tooltip.text}
          </motion.div>
        )}

        {/* Legend */}
        <div className="mt-6 flex items-center gap-3">
          <span className="text-xs font-medium text-slate-600">Less</span>
          <div className="flex gap-1">
            {["bg-slate-100", "bg-indigo-200", "bg-indigo-400", "bg-indigo-600"].map(
              (color) => (
                <div
                  key={color}
                  className={cn("h-3 w-3 rounded-sm", color)}
                />
              )
            )}
          </div>
          <span className="text-xs font-medium text-slate-600">More</span>
        </div>
      </div>
    );
  }
);

ActivityHeatmap.displayName = "ActivityHeatmap";
