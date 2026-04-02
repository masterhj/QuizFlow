"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { ActivityHeatmap } from "@/components/dashboard/activity-heatmap";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronUp,
  ChevronDown,
  Search,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

type DateRange = "7d" | "30d" | "90d" | "all";

interface AnalyticsData {
  metrics: {
    totalQuizzes: number;
    avgScore: number;
    bestStreak: number;
    totalXP: number;
  };
  performanceData: Array<{ date: string; avgScore: number }>;
  topicMastery: Array<{ subject: string; mastery: number }>;
  attempts: Array<{
    id: string;
    quizTitle: string;
    subject: string;
    score: number;
    grade: string;
    timeSpentSeconds: number;
    completedAt: string;
  }>;
  activityData: Array<{ date: string; count: number }>;
}

type SortKey = "quiz" | "subject" | "score" | "grade" | "time" | "date";

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDesc, setSortDesc] = useState(true);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/analytics?range=${dateRange}`);
        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [dateRange]);

  const filteredAttempts = (data?.attempts || [])
    .filter((a) =>
      `${a.quizTitle} ${a.subject}`.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";

      switch (sortKey) {
        case "quiz":
          aVal = a.quizTitle;
          bVal = b.quizTitle;
          break;
        case "subject":
          aVal = a.subject;
          bVal = b.subject;
          break;
        case "score":
          aVal = a.score;
          bVal = b.score;
          break;
        case "time":
          aVal = a.timeSpentSeconds;
          bVal = b.timeSpentSeconds;
          break;
        case "date":
        default:
          aVal = new Date(a.completedAt).getTime();
          bVal = new Date(b.completedAt).getTime();
      }

      if (typeof aVal === "string") {
        return sortDesc
          ? bVal.localeCompare(aVal as string)
          : (aVal as string).localeCompare(bVal as string);
      }

      return sortDesc ? (bVal as number) - (aVal as number) : (aVal as number) - (bVal as number);
    });

  const topicsByMastery = [...(data?.topicMastery || [])].sort(
    (a, b) => b.mastery - a.mastery
  );
  const topTopics = topicsByMastery.slice(0, 3);
  const bottomTopics = topicsByMastery.slice(-3).reverse();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your Analytics</h1>

        {/* Date Range Selector */}
        <div className="flex gap-2">
          {(["7d", "30d", "90d", "all"] as DateRange[]).map((range) => (
            <Button
              key={range}
              onClick={() => setDateRange(range)}
              variant={dateRange === range ? "default" : "outline"}
              className={
                dateRange === range
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : ""
              }
            >
              {range === "7d"
                ? "7 days"
                : range === "30d"
                  ? "30 days"
                  : range === "90d"
                    ? "90 days"
                    : "All time"}
            </Button>
          ))}
        </div>
      </div>

      {/* Metrics Row */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-8 w-full mb-2" />
              <Skeleton className="h-6 w-2/3" />
            </Card>
          ))}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <MetricCard
              title="Total Quizzes"
              value={data?.metrics.totalQuizzes || 0}
              icon="book-open"
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <MetricCard
              title="Average Score"
              value={`${data?.metrics.avgScore || 0}%`}
              icon="target"
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <MetricCard
              title="Best Streak"
              value={data?.metrics.bestStreak || 0}
              icon="zap"
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <MetricCard
              title="Total XP"
              value={data?.metrics.totalXP || 0}
              icon="star"
            />
          </motion.div>
        </motion.div>
      )}

      {/* Performance Chart */}
      {loading ? (
        <Card className="p-6 h-80">
          <Skeleton className="h-full w-full" />
        </Card>
      ) : (
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4">Performance Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data?.performanceData || []}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="date"
                stroke="var(--muted-foreground)"
                fontSize={12}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={12}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--border)",
                }}
              />
              <Area
                type="monotone"
                dataKey="avgScore"
                stroke="#818cf8"
                fillOpacity={1}
                fill="url(#colorScore)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Two Column Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topic Mastery Radar */}
        {loading ? (
          <Card className="p-6 h-80">
            <Skeleton className="h-full w-full" />
          </Card>
        ) : (
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4">Topic Mastery</h2>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={data?.topicMastery || []}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis
                  dataKey="subject"
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                />
                <PolarRadiusAxis
                  stroke="var(--muted-foreground)"
                  domain={[0, 100]}
                  fontSize={12}
                />
                <Radar
                  name="Mastery"
                  dataKey="mastery"
                  stroke="#818cf8"
                  fill="#818cf8"
                  fillOpacity={0.6}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    border: "1px solid var(--border)",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Strongest vs Weakest */}
        {loading ? (
          <Card className="p-6 h-80">
            <Skeleton className="h-full w-full" />
          </Card>
        ) : (
          <Card className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                Strongest Topics
              </h3>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={topTopics} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    type="number"
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    domain={[0, 100]}
                  />
                  <YAxis
                    dataKey="subject"
                    type="category"
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--background)",
                      border: "1px solid var(--border)",
                    }}
                  />
                  <Bar dataKey="mastery" fill="#10b981" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-600" />
                Topics to Improve
              </h3>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={bottomTopics} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    type="number"
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    domain={[0, 100]}
                  />
                  <YAxis
                    dataKey="subject"
                    type="category"
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--background)",
                      border: "1px solid var(--border)",
                    }}
                  />
                  <Bar dataKey="mastery" fill="#ef4444" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
      </div>

      {/* Activity Heatmap */}
      {loading ? (
        <Card className="p-6 h-48">
          <Skeleton className="h-full w-full" />
        </Card>
      ) : (
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4">
            Your Activity Over the Past Year
          </h2>
          <ActivityHeatmap data={data?.activityData || []} />
        </Card>
      )}

      {/* Recent Attempts Table */}
      <Card className="p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold mb-4">Recent Attempts</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search quizzes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {[
                    { key: "quiz" as SortKey, label: "Quiz" },
                    { key: "subject" as SortKey, label: "Subject" },
                    { key: "score" as SortKey, label: "Score" },
                    { key: "grade" as SortKey, label: "Grade" },
                    { key: "time" as SortKey, label: "Time" },
                    { key: "date" as SortKey, label: "Date" },
                  ].map((col) => (
                    <th
                      key={col.key}
                      className="text-left py-3 px-4 font-semibold text-muted-foreground cursor-pointer hover:text-foreground"
                      onClick={() => {
                        if (sortKey === col.key) {
                          setSortDesc(!sortDesc);
                        } else {
                          setSortKey(col.key);
                          setSortDesc(true);
                        }
                      }}
                    >
                      <div className="flex items-center gap-1">
                        {col.label}
                        {sortKey === col.key && (
                          <div className="text-xs">
                            {sortDesc ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronUp className="w-4 h-4" />
                            )}
                          </div>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredAttempts.map((attempt) => (
                  <tr key={attempt.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium line-clamp-1">
                      {attempt.quizTitle}
                    </td>
                    <td className="py-3 px-4">{attempt.subject}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-6 bg-muted rounded overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 transition-all"
                            style={{ width: `${attempt.score}%` }}
                          />
                        </div>
                        <span className="font-semibold">{attempt.score}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        className={
                          attempt.grade === "A"
                            ? "bg-green-600"
                            : attempt.grade === "B"
                              ? "bg-blue-600"
                              : attempt.grade === "C"
                                ? "bg-yellow-600"
                                : attempt.grade === "D"
                                  ? "bg-orange-600"
                                  : "bg-red-600"
                        }
                      >
                        {attempt.grade}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {Math.round(attempt.timeSpentSeconds / 60)} min
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {new Date(attempt.completedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredAttempts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No attempts found
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
