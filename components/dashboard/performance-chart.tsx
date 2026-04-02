"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";

import { AnalyticsData } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export interface PerformanceChartProps {
  data: AnalyticsData[];
  range: string;
  isLoading?: boolean;
}

const CustomTooltip = (props: TooltipProps<number, string>) => {
  const { active, payload } = props;

  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-lg">
        <p className="text-sm font-semibold text-slate-900">
          {data.date}
        </p>
        <p className="text-sm text-indigo-600">
          Score: {payload[0].value}%
        </p>
      </div>
    );
  }

  return null;
};

export const PerformanceChart = React.forwardRef<HTMLDivElement, PerformanceChartProps>(
  ({ data, range, isLoading = false }, ref) => {
    return (
      <Card ref={ref} variant="elevated" padding="lg" className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Performance Trend</h3>
          <p className="text-sm text-slate-600">{range}</p>
        </div>

        {isLoading ? (
          <Skeleton variant="card" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                vertical={false}
              />

              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                style={{ fontSize: "12px" }}
              />

              <YAxis
                domain={[0, 100]}
                stroke="#94a3b8"
                style={{ fontSize: "12px" }}
                label={{ value: "Score (%)", angle: -90, position: "insideLeft" }}
              />

              <Tooltip content={<CustomTooltip />} />

              <Area
                type="monotone"
                dataKey="score"
                stroke="#4f46e5"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorScore)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Card>
    );
  }
);

PerformanceChart.displayName = "PerformanceChart";
