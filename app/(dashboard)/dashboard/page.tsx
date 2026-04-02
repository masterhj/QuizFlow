import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MetricCard } from "@/components/dashboard/metric-card";
import { MasteryRing } from "@/components/quiz/mastery-ring";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { ActivityHeatmap } from "@/components/dashboard/activity-heatmap";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Flame, Plus, BarChart3, AlertCircle, BookOpen, Target, Zap, Star, Users, Calendar } from "lucide-react";

interface StudentDashboardData {
  recentAttempts: Array<{
    id: string;
    quizTitle: string;
    score: number;
    completedAt: Date;
  }>;
  topicMastery: Array<{
    id: string;
    topic: string;
    masteryLevel: number;
    nextReviewDate: Date;
  }>;
  dueReviewsCount: number;
  performanceData: Array<{
    date: string;
    avgScore: number;
  }>;
  recommendedQuizzes: Array<{
    id: string;
    title: string;
    subject: string;
    difficulty: number;
    questionCount: number;
  }>;
  totalQuizzes: number;
  avgScore: number;
  currentStreak: number;
  totalXP: number;
  nextLevelXP: number;
}

interface TeacherDashboardData {
  quizzes: Array<{
    id: string;
    title: string;
    attemptCount: number;
    avgScore: number;
    publishedAt: Date;
  }>;
  totalStudents: number;
  classAvgScore: number;
  quizzesThisMonth: number;
  strugglingStudents: Array<{
    id: string;
    name: string;
    email: string;
    image?: string;
    avgScore: number;
  }>;
  recentActivity: Array<{
    quizId: string;
    quizTitle: string;
    attemptsToday: number;
    avgScore: number;
  }>;
  performanceData: Array<{
    quizTitle: string;
    avgScore: number;
  }>;
}

async function fetchStudentData(userId: string): Promise<StudentDashboardData> {
  const [
    recentAttempts,
    topicMastery,
    performanceMetrics,
    recommendedQuizzes,
    userStats,
  ] = await Promise.all([
    // Recent attempts
    prisma.attempt.findMany({
      where: { userId },
      include: { quiz: { select: { title: true } } },
      orderBy: { completedAt: "desc" },
      take: 5,
    }),
    // Topic mastery sorted by nextReviewDate
    prisma.topicMastery.findMany({
      where: { userId },
      orderBy: { nextReviewDate: "asc" },
    }),
    // Performance data for last 7 days
    prisma.attempt.groupBy({
      by: ["completedAt"],
      where: {
        userId,
        completedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      _avg: { score: true },
    }),
    // Recommended quizzes where mastery < 60%
    prisma.quiz.findMany({
      where: {
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        subject: true,
        difficulty: true,
        _count: { select: { questions: true } },
      },
      take: 3,
    }),
    // User stats
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        xp: true,
        streak: true,
        _count: { select: { attempts: true } },
      },
    }),
  ]);

  const dueReviewsCount = topicMastery.filter(
    (m) => m.nextReviewDate <= new Date()
  ).length;

  const performanceData = performanceMetrics.map((metric) => ({
    date: new Date(metric.completedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    avgScore: Math.round(metric._avg.score || 0),
  }));

  const avgScore =
    recentAttempts.length > 0
      ? Math.round(
          recentAttempts.reduce((sum, a) => sum + a.score, 0) /
            recentAttempts.length
        )
      : 0;

  return {
    recentAttempts: recentAttempts.map((a) => ({
      id: a.id,
      quizTitle: a.quiz.title,
      score: a.score,
      completedAt: a.completedAt,
    })),
    topicMastery,
    dueReviewsCount,
    performanceData,
    recommendedQuizzes: recommendedQuizzes.map((q) => ({
      id: q.id,
      title: q.title,
      subject: q.subject,
      difficulty: q.difficulty,
      questionCount: q._count.questions,
    })),
    totalQuizzes: userStats?._count.attempts || 0,
    avgScore,
    currentStreak: userStats?.streak || 0,
    totalXP: userStats?.xp || 0,
    nextLevelXP: Math.ceil((userStats?.xp || 0) / 500) * 500 + 500,
  };
}

async function fetchTeacherData(userId: string): Promise<TeacherDashboardData> {
  const [quizzes, strugglingStudents, recentActivity] = await Promise.all([
    // Teacher's published quizzes with stats
    prisma.quiz.findMany({
      where: { creatorId: userId, isPublished: true },
      include: {
        _count: { select: { attempts: true } },
        attempts: {
          select: { score: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    // Students with avg score < 60% on this teacher's quizzes
    prisma.user.findMany({
      where: {
        attempts: {
          some: {
            quiz: { creatorId: userId },
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
      take: 5,
    }),
    // Recent quiz activity
    prisma.attempt.groupBy({
      by: ["quizId"],
      where: {
        quiz: { creatorId: userId },
        completedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      _avg: { score: true },
      _count: true,
    }),
  ]);

  // Enrich struggling students with avg scores
  const strugglingWithScores = await Promise.all(
    strugglingStudents.map(async (student) => {
      const avgScore = await prisma.attempt.aggregate({
        where: {
          userId: student.id,
          quiz: { creatorId: userId },
        },
        _avg: { score: true },
      });
      return {
        ...student,
        avgScore: Math.round(avgScore._avg.score || 0),
      };
    })
  );

  // Filter to only those < 60%
  const struggling = strugglingWithScores.filter((s) => s.avgScore < 60);

  // Get quiz titles for recent activity
  const recentActivityEnriched = await Promise.all(
    recentActivity.map(async (activity) => {
      const quiz = await prisma.quiz.findUnique({
        where: { id: activity.quizId },
        select: { title: true },
      });
      return {
        quizId: activity.quizId,
        quizTitle: quiz?.title || "Unknown Quiz",
        attemptsToday: activity._count,
        avgScore: Math.round(activity._avg.score || 0),
      };
    })
  );

  const totalStudents = strugglingWithScores.length;
  const classAvgScore =
    quizzes.length > 0
      ? Math.round(
          quizzes.reduce((sum, q) => {
            const qAvg =
              q.attempts.length > 0
                ? q.attempts.reduce((s, a) => s + a.score, 0) /
                  q.attempts.length
                : 0;
            return sum + qAvg;
          }, 0) / quizzes.length
        )
      : 0;

  const quizzesThisMonth = quizzes.filter((q) => {
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return q.createdAt >= monthAgo;
  }).length;

  return {
    quizzes: quizzes.map((q) => ({
      id: q.id,
      title: q.title,
      attemptCount: q._count.attempts,
      avgScore:
        q.attempts.length > 0
          ? Math.round(
              q.attempts.reduce((sum, a) => sum + a.score, 0) /
                q.attempts.length
            )
          : 0,
      publishedAt: q.createdAt,
    })),
    totalStudents,
    classAvgScore,
    quizzesThisMonth,
    strugglingStudents: struggling,
    recentActivity: recentActivityEnriched,
    performanceData: quizzes.map((q) => ({
      quizTitle: q.title,
      avgScore:
        q.attempts.length > 0
          ? Math.round(
              q.attempts.reduce((sum, a) => sum + a.score, 0) /
                q.attempts.length
            )
          : 0,
    })),
  };
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role as "STUDENT" | "TEACHER";

  if (role === "STUDENT") {
    const data = await fetchStudentData(session.user.id);

    const xpProgress = ((data.totalXP % 500) / 500) * 100;
    const currentLevel = Math.floor(data.totalXP / 500) + 1;

    return (
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Good morning, {session.user.name?.split(" ")[0]}!
            </h1>
            <p className="text-muted-foreground mt-1">
              {data.dueReviewsCount > 0
                ? `You have ${data.dueReviewsCount} topics due for review`
                : "Keep up the great work!"}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-yellow-500/10 px-4 py-2 rounded-lg">
            <Flame className="w-5 h-5 text-yellow-500" />
            <span className="font-bold text-yellow-600 dark:text-yellow-400">
              {data.currentStreak} day streak
            </span>
          </div>
        </div>

        {/* XP Progress Bar */}
        <Card className="p-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">XP Progress to Next Level</h3>
              <span className="text-sm text-muted-foreground">
                Level {currentLevel}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all duration-300"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{data.totalXP % 500} XP</span>
              <span>500 XP</span>
            </div>
          </div>
        </Card>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Quizzes"
            value={data.totalQuizzes}
            icon={BookOpen}
            color="indigo"
          />
          <MetricCard
            title="Average Score"
            value={`${data.avgScore}%`}
            icon={Target}
            color="emerald"
          />
          <MetricCard
            title="Current Streak"
            value={data.currentStreak}
            icon={Zap}
            color="amber"
          />
          <MetricCard
            title="Total XP"
            value={data.totalXP}
            icon={Star}
            color="indigo"
          />
        </div>

        {/* Due for Review Section */}
        <div>
          <h2 className="text-xl font-bold mb-4">Due for Review</h2>
          {data.dueReviewsCount === 0 ? (
            <Card className="p-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="font-semibold">All caught up!</p>
              <p className="text-sm text-muted-foreground mt-1">
                No topics due for review right now
              </p>
            </Card>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {data.topicMastery
                .filter((m) => m.nextReviewDate <= new Date())
                .map((mastery) => (
                  <div key={mastery.id} className="flex-shrink-0">
                    <MasteryRing
                      topic={mastery.topic}
                      masteryLevel={mastery.masteryLevel}
                      nextReviewDate={mastery.nextReviewDate}
                    />
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Performance Chart */}
        <div>
          <h2 className="text-xl font-bold mb-4">Performance (Last 7 Days)</h2>
          <Card className="p-6">
            <PerformanceChart data={data.performanceData} />
          </Card>
        </div>

        {/* Continue Learning */}
        <div>
          <h2 className="text-xl font-bold mb-4">Continue Learning</h2>
          {data.recentAttempts.length > 0 && !data.recentAttempts[0] ? (
            <Card className="p-6">
              <p className="text-muted-foreground">
                No incomplete attempts. Start a new quiz!
              </p>
            </Card>
          ) : (
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">
                    {data.recentAttempts[0]?.quizTitle || "Get started"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Score: {data.recentAttempts[0]?.score || 0}%
                  </p>
                </div>
                <Button>Continue</Button>
              </div>
            </Card>
          )}
        </div>

        {/* Recommended Quizzes */}
        {data.recommendedQuizzes.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Recommended for You</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.recommendedQuizzes.map((quiz) => (
                <Card key={quiz.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="space-y-2">
                    <h3 className="font-semibold line-clamp-2">{quiz.title}</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      {quiz.subject}
                    </p>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs">
                        {quiz.questionCount} questions
                      </span>
                      <span className="text-xs font-medium">
                        {"★".repeat(quiz.difficulty)}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // TEACHER DASHBOARD
  const data = await fetchTeacherData(session.user.id);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {session.user.name}!</h1>
        <p className="text-muted-foreground mt-1">
          Manage your quizzes and track your class performance
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Quizzes"
          value={data.quizzes.length}
          icon={BookOpen}
          color="indigo"
        />
        <MetricCard
          title="Total Students"
          value={data.totalStudents}
          icon={Users}
          color="emerald"
        />
        <MetricCard
          title="Class Average"
          value={`${data.classAvgScore}%`}
          icon={Target}
          color="amber"
        />
        <MetricCard
          title="This Month"
          value={data.quizzesThisMonth}
          icon={Calendar}
          color="red"
        />
      </div>

      {/* Performance Chart */}
      <Card className="p-6">
        <h2 className="text-lg font-bold mb-4">Quiz Performance</h2>
        <PerformanceChart data={data.performanceData} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Struggling Students */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-bold mb-4">Students Needing Support</h2>
          {data.strugglingStudents.length === 0 ? (
            <Card className="p-6 text-center">
              <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                All students are performing well!
              </p>
            </Card>
          ) : (
            <Card className="divide-y">
              {data.strugglingStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      {student.image ? (
                        <img
                          src={student.image}
                          alt={student.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-bold">
                          {student.name?.charAt(0) || "S"}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {student.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold text-red-600 dark:text-red-400">
                        {student.avgScore}%
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      Send Reminder
                    </Button>
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold">Quick Actions</h2>
          <div className="space-y-3">
            <Button className="w-full" size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Create New Quiz
            </Button>
            <Button className="w-full" size="lg" variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              View All Analytics
            </Button>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <Card className="p-6">
        <h2 className="text-lg font-bold mb-4">Recent Activity (Today)</h2>
        {data.recentActivity.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No activity today
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Quiz</th>
                  <th className="text-left py-3 px-4 font-semibold">
                    Attempts
                  </th>
                  <th className="text-left py-3 px-4 font-semibold">
                    Avg Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.recentActivity.map((activity) => (
                  <tr key={activity.quizId} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">{activity.quizTitle}</td>
                    <td className="py-3 px-4">{activity.attemptsToday}</td>
                    <td className="py-3 px-4">
                      <span
                        className={
                          activity.avgScore >= 70
                            ? "text-green-600 dark:text-green-400 font-semibold"
                            : "text-red-600 dark:text-red-400 font-semibold"
                        }
                      >
                        {activity.avgScore}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
