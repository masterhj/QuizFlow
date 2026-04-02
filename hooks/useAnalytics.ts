import { useEffect, useState } from "react";
import type { AnalyticsData, TopicMasteryData } from "@/types";

interface UseAnalyticsReturn {
  data: AnalyticsData | null;
  masteries: TopicMasteryData[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching user analytics data
 * @param range Time range for analytics: '7d', '30d', '90d', or 'all'
 */
export function useAnalytics(
  range: "7d" | "30d" | "90d" | "all" = "30d"
): UseAnalyticsReturn {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [masteries, setMasteries] = useState<TopicMasteryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/analytics?range=${range}`);

      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const result = await response.json();
      setData(result.data);
      setMasteries(result.masteries || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch analytics";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  return {
    data,
    masteries,
    isLoading,
    error,
    refetch: fetchAnalytics,
  };
}

/**
 * Hook for getting summary statistics from analytics
 */
export function useAnalyticsSummary(range: "7d" | "30d" | "90d" | "all" = "30d") {
  const { data, masteries, isLoading, error } = useAnalytics(range);

  const summary = {
    totalQuizzes: data ? data.length : 0,
    averageScore: data
      ? Math.round(data.reduce((sum, d) => sum + d.score, 0) / data.length)
      : 0,
    totalQuestionsTaken: data ? data.reduce((sum, d) => sum + d.quizzesTaken, 0) : 0,
    bestSubject: masteries.length > 0
      ? masteries.reduce((best, m) => (m.mastery > best.mastery ? m : best)).subject
      : null,
    averageMastery:
      masteries.length > 0
        ? Math.round(
            masteries.reduce((sum, m) => sum + m.mastery, 0) / masteries.length * 100
          ) / 100
        : 0,
  };

  return {
    summary,
    isLoading,
    error,
  };
}
