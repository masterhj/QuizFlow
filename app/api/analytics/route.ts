import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse } from "@/types";
import { UserRole } from "@prisma/client";

interface AnalyticsResponse {
  overview: {
    totalQuizzes: number;
    avgScore: number;
    currentStreak: number;
    totalXP: number;
  };
  performanceOverTime: Array<{
    date: string;
    score: number;
    count: number;
  }>;
  topicMasteries: Array<{
    subject: string;
    mastery: number;
    nextReview: Date;
  }>;
  weakestTopics: Array<{
    subject: string;
    mastery: number;
  }>;
  strongestTopics: Array<{
    subject: string;
    mastery: number;
  }>;
  recentAttempts: any[];
  activityHeatmap: Array<{
    date: string;
    count: number;
  }>;
}

/**
 * GET /api/analytics
 * Fetch user analytics data
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const rangeParam = request.nextUrl.searchParams.get("range") || "30d";
    const range = ["7d", "30d", "90d", "all"].includes(rangeParam)
      ? rangeParam
      : "30d";

    // Calculate date range
    const now = new Date();
    let dateFrom = new Date();

    if (range === "7d") {
      dateFrom.setDate(dateFrom.getDate() - 7);
    } else if (range === "30d") {
      dateFrom.setDate(dateFrom.getDate() - 30);
    } else if (range === "90d") {
      dateFrom.setDate(dateFrom.getDate() - 90);
    } else {
      // all - set to very old date
      dateFrom = new Date("2020-01-01");
    }

    // Execute all queries in a transaction for performance
    const analytics = await prisma.$transaction(async (tx) => {
      // Determine userId for query
      let queryUserId = session.user.id;
      let isTeacher = session.user.role === UserRole.TEACHER;

      // Get all attempts in date range
      const attempts = await tx.attempt.findMany({
        where: {
          userId: queryUserId,
          completedAt: {
            gte: dateFrom,
            lte: now,
          },
        },
        include: {
          quiz: {
            select: {
              subject: true,
              difficulty: true,
            },
          },
          answers: true,
        },
        orderBy: {
          completedAt: "desc",
        },
      });

      // Overview metrics
      const totalQuizzes = attempts.length;
      const avgScore =
        attempts.length > 0
          ? Math.round(
              attempts.reduce((sum, a) => sum + (a.score || 0), 0) /
                attempts.length
            )
          : 0;

      // Get current user
      const user = await tx.user.findUnique({
        where: { id: queryUserId },
        select: {
          xp: true,
          streak: true,
        },
      });

      // Performance over time (grouped by day)
      const performanceMap = new Map<string, { scores: number[]; count: number }>();

      attempts.forEach((attempt) => {
        if (attempt.completedAt) {
          const dateStr = attempt.completedAt.toISOString().split("T")[0];
          const existing = performanceMap.get(dateStr);

          if (existing) {
            existing.scores.push(attempt.score || 0);
            existing.count += 1;
          } else {
            performanceMap.set(dateStr, {
              scores: [attempt.score || 0],
              count: 1,
            });
          }
        }
      });

      const performanceOverTime = Array.from(performanceMap.entries())
        .map(([date, data]) => ({
          date,
          score: Math.round(
            data.scores.reduce((a, b) => a + b, 0) / data.scores.length
          ),
          count: data.count,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Topic masteries
      const masteries = await tx.topicMastery.findMany({
        where: {
          userId: queryUserId,
        },
        orderBy: {
          mastery: "desc",
        },
      });

      const topicMasteries = masteries.map((m) => ({
        subject: m.subject,
        mastery: Math.round(m.mastery * 100),
        nextReview: m.nextReviewDate,
      }));

      // Weakest and strongest topics
      const weakestTopics = masteries.slice(-3).map((m) => ({
        subject: m.subject,
        mastery: Math.round(m.mastery * 100),
      }));

      const strongestTopics = masteries.slice(0, 3).map((m) => ({
        subject: m.subject,
        mastery: Math.round(m.mastery * 100),
      }));

      // Recent attempts (last 10)
      const recentAttempts = attempts.slice(0, 10);

      // Activity heatmap (last 365 days)
      const heatmapMap = new Map<string, number>();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      attempts.forEach((attempt) => {
        if (attempt.completedAt && attempt.completedAt >= oneYearAgo) {
          const dateStr = attempt.completedAt.toISOString().split("T")[0];
          heatmapMap.set(dateStr, (heatmapMap.get(dateStr) || 0) + 1);
        }
      });

      const activityHeatmap = Array.from(heatmapMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return {
        overview: {
          totalQuizzes,
          avgScore,
          currentStreak: user?.streak || 0,
          totalXP: user?.xp || 0,
        },
        performanceOverTime,
        topicMasteries,
        weakestTopics,
        strongestTopics,
        recentAttempts,
        activityHeatmap,
      };
    });

    return NextResponse.json<ApiResponse<AnalyticsResponse>>(
      { data: analytics, error: null },
      { status: 200 }
    );
  } catch (error) {
    console.error("[GET /api/analytics]", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        data: null,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
