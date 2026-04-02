import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { QuizAttemptClient } from "@/components/quiz/quiz-attempt-client";

interface AttemptPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ attemptId?: string }>;
}

export default async function AttemptPage({
  params,
  searchParams,
}: AttemptPageProps) {
  const { id } = await params;
  const { attemptId: existingAttemptId } = await searchParams;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // If attemptId provided, fetch existing attempt
  let attempt = null;
  if (existingAttemptId) {
    attempt = await prisma.attempt.findUnique({
      where: { id: existingAttemptId },
      include: {
        answers: true,
      },
    });

    if (!attempt || attempt.userId !== session.user.id) {
      redirect(`/quiz/${id}`);
    }
  }

  // Fetch quiz with all questions
  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: {
          options: {
            orderBy: { order: "asc" },
          },
        },
      },
      creator: {
        select: { id: true, name: true },
      },
    },
  });

  if (!quiz) {
    redirect("/dashboard");
  }

  // If no existing attempt, create one
  if (!attempt) {
    attempt = await prisma.attempt.create({
      data: {
        quizId: id,
        userId: session.user.id,
        startedAt: new Date(),
      },
    });

    // Redirect to include attemptId
    redirect(`/quiz/${id}/attempt?attemptId=${attempt.id}`);
  }

  return (
    <QuizAttemptClient
      attemptId={attempt.id}
      quiz={quiz}
      existingAnswers={attempt.answers}
      userId={session.user.id}
    />
  );
}
