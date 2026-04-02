import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { DifficultyStars } from "@/components/quiz/difficulty-stars";
import { Clock, BookOpen, BarChart3 } from "lucide-react";

const SUBJECT_COLORS: Record<string, string> = {
  mathematics: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  science: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  history: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  literature:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  language: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  default: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

interface QuizPageProps {
  params: Promise<{ id: string }>;
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { id } = await params;
  const session = await auth();

  // Fetch quiz with relations
  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: {
      questions: {
        select: { text: true, subject: true },
        take: 100,
      },
      creator: {
        select: { id: true, name: true, image: true },
      },
      _count: {
        select: { attempts: true },
      },
    },
  });

  if (!quiz) {
    notFound();
  }

  // Check if unpublished and user is not creator
  if (!quiz.published && quiz.createdById !== session?.user?.id) {
    notFound();
  }

  // Fetch user's previous attempts
  const userAttempts = session?.user
    ? await prisma.attempt.findMany({
        where: {
          quizId: id,
          userId: session.user.id,
        },
        orderBy: { completedAt: "desc" },
      })
    : [];

  const bestScore =
    userAttempts.length > 0
      ? Math.max(...userAttempts.map((a) => a.score))
      : null;

  const avgScore =
    userAttempts.length > 0
      ? Math.round(
          userAttempts.reduce((sum: number, a) => sum + a.score, 0) /
            userAttempts.length
        )
      : 0;

  // Extract unique topics/subjects
  const uniqueTopics = Array.from(
    new Set(quiz.questions.map((q) => q.subject).filter(Boolean))
  );

  // Estimate time: ~2 minutes per question
  const estimatedTime = Math.ceil(quiz.questions.length * 2);

  // Get first 3 question previews
  const questionPreviews = quiz.questions.slice(0, 3);

  const subjectColor =
    SUBJECT_COLORS[quiz.subject?.toLowerCase()] || SUBJECT_COLORS.default;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge className={subjectColor}>{quiz.subject}</Badge>
          {quiz.published && (
            <Badge variant="outline" className="bg-green-50 dark:bg-green-950">
              Published
            </Badge>
          )}
        </div>

        <h1 className="text-4xl font-bold">{quiz.title}</h1>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            {quiz.creator.image ? (
              <img
                src={quiz.creator.image}
                alt={quiz.creator.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-sm font-bold">
                {quiz.creator.name?.charAt(0) || "C"}
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <p className="text-sm">
              by <span className="font-semibold">{quiz.creator.name}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(quiz.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            <span>
              <span className="font-semibold">{quiz.questions.length}</span>{" "}
              questions
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>Est. {estimatedTime} min</span>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <span>
              <span className="font-semibold">{quiz._count.attempts}</span>{" "}
              attempts
            </span>
          </div>
          {quiz._count.attempts > 0 && (
            <div>
              <span>
                Avg score:{" "}
                <span className="font-semibold">{avgScore}%</span>
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <DifficultyStars difficulty={quiz.difficulty} />
          <div className="flex flex-wrap gap-2">
            {quiz.tags?.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      {quiz.description && (
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-muted-foreground leading-relaxed">
            {quiz.description}
          </p>
        </div>
      )}

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Topics Covered */}
          {uniqueTopics.length > 0 && (
            <Card className="p-6">
              <h2 className="text-lg font-bold mb-4">Topics Covered</h2>
              <div className="space-y-2">
                {uniqueTopics.map((topic) => (
                  <div
                    key={topic}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    {topic}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* What You'll Be Tested On */}
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4">What You'll Be Tested On</h2>
            <div className="space-y-3">
              {questionPreviews.map((question, idx) => (
                <div key={idx} className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">
                    {idx + 1}. {question.text.substring(0, 150)}
                    {question.text.length > 150 ? "..." : ""}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Previous Attempts */}
          {userAttempts.length > 0 && (
            <Card className="p-6">
              <h2 className="text-lg font-bold mb-4">Your Attempts</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Date</th>
                      <th className="text-left py-3 px-4 font-semibold">Score</th>
                      <th className="text-left py-3 px-4 font-semibold">Time</th>
                      <th className="text-left py-3 px-4 font-semibold">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userAttempts.map((attempt) => {
                      const grade =
                        attempt.score >= 90
                          ? "A"
                          : attempt.score >= 80
                            ? "B"
                            : attempt.score >= 70
                              ? "C"
                              : attempt.score >= 60
                                ? "D"
                                : "F";
                      const gradeColor =
                        grade === "A"
                          ? "text-green-600 dark:text-green-400 font-bold"
                          : grade === "B"
                            ? "text-blue-600 dark:text-blue-400 font-bold"
                            : grade === "C"
                              ? "text-yellow-600 dark:text-yellow-400 font-bold"
                              : grade === "D"
                                ? "text-orange-600 dark:text-orange-400 font-bold"
                                : "text-red-600 dark:text-red-400 font-bold";

                      return (
                        <tr
                          key={attempt.id}
                          className="border-b hover:bg-muted/50"
                        >
                          <td className="py-3 px-4">
                            {new Date(attempt.completedAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </td>
                          <td className="py-3 px-4 font-semibold">
                            {attempt.score}%
                          </td>
                          <td className="py-3 px-4">
                            {attempt.timeSpentSeconds
                              ? Math.round(attempt.timeSpentSeconds / 60) + " min"
                              : "—"}
                          </td>
                          <td className={`py-3 px-4 ${gradeColor}`}>{grade}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column (1/3) - Sticky Card */}
        <div>
          <Card className="p-6 lg:sticky lg:top-24 space-y-4">
            {bestScore !== null ? (
              <>
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-1">
                    Your Best Score
                  </p>
                  <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                    {bestScore}%
                  </p>
                </div>
                <Button className="w-full" size="lg">
                  Retake Quiz
                </Button>
              </>
            ) : (
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700" size="lg">
                Start Quiz
              </Button>
            )}

            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Questions</span>
                <span className="font-semibold">{quiz.questions.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Est. Time</span>
                <span className="font-semibold">{estimatedTime} min</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Difficulty</span>
                <span className="font-semibold">
                  {quiz.difficulty}/5
                  {"★".repeat(quiz.difficulty)}
                </span>
              </div>
              {userAttempts.length > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Your Attempts</span>
                  <span className="font-semibold">{userAttempts.length}</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
