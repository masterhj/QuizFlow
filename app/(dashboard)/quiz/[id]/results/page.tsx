import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { QuizResultsClient } from "@/components/quiz/quiz-results-client";

interface ResultsPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ attemptId?: string }>;
}

export default async function ResultsPage({
  params,
  searchParams,
}: ResultsPageProps) {
  const { id } = await params;
  const { attemptId } = await searchParams;
  const session = await auth();

  if (!session?.user || !attemptId) {
    notFound();
  }

  // Fetch attempt with all related data
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      quiz: {
        include: {
          questions: {
            include: {
              options: true,
            },
          },
        },
      },
      answers: {
        include: {
          question: {
            include: {
              options: true,
            },
          },
        },
      },
    },
  });

  if (!attempt || attempt.userId !== session.user.id || attempt.quizId !== id) {
    notFound();
  }

  // Calculate score
  const correctAnswers = attempt.answers.filter((a) => a.isCorrect).length;
  const totalQuestions = attempt.quiz.questions.length;
  const score = Math.round((correctAnswers / totalQuestions) * 100);

  // Calculate time taken
  const timeTakenSeconds = attempt.timeSpentSeconds || 0;
  const timeTakenMinutes = Math.round(timeTakenSeconds / 60);

  // Calculate XP gained (base 10 per question + bonus for correct)
  const baseXP = totalQuestions * 10;
  const correctBonus = correctAnswers * 5;
  const xpGained = baseXP + correctBonus;

  // Fetch mastery updates for each topic
  const topicMasteries = await prisma.topicMastery.findMany({
    where: {
      userId: session.user.id,
      topic: {
        in: attempt.quiz.questions
          .map((q) => q.subject)
          .filter((s) => s !== null) as string[],
      },
    },
  });

  // Fetch recommended quizzes in same subject
  const recommendedQuizzes = await prisma.quiz.findMany({
    where: {
      subject: attempt.quiz.subject,
      id: { not: id },
      published: true,
    },
    include: {
      _count: {
        select: { questions: true, attempts: true },
      },
    },
    take: 2,
  });

  return (
    <QuizResultsClient
      attempt={attempt}
      score={score}
      correctAnswers={correctAnswers}
      totalQuestions={totalQuestions}
      timeTakenMinutes={timeTakenMinutes}
      xpGained={xpGained}
      topicMasteries={topicMasteries}
      recommendedQuizzes={recommendedQuizzes}
      quizId={id}
    />
  );
}
