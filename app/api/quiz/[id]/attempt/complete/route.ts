import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  calculateScore,
  calculateXPGained,
  updateMastery,
} from "@/lib/adaptive";
import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse, AttemptWithAnswers } from "@/types";

interface CompleteAttemptRequest {
  attemptId: string;
}

/**
 * POST /api/quiz/[id]/attempt/complete
 * Complete a quiz attempt and calculate final score
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: CompleteAttemptRequest = await request.json();
    const { attemptId } = body;

    // Fetch attempt with all answers
    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!attempt) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Attempt not found" },
        { status: 404 }
      );
    }

    if (attempt.userId !== session.user.id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Calculate score and update attempt
    const score = calculateScore(attempt.answers);
    const completedAt = new Date();

    const updatedAttempt = await prisma.attempt.update({
      where: { id: attemptId },
      data: {
        score,
        completedAt,
      },
    });

    // Calculate XP gained
    const xpGained = calculateXPGained(score, attempt.answers.length);

    // Update user XP
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        xp: { increment: xpGained },
      },
    });

    // Update mastery for topics
    const quizTopics = new Set(
      attempt.answers.map((a) => a.question.subject).filter(Boolean)
    );

    for (const topic of quizTopics) {
      await updateMastery(session.user.id, topic, score);
    }

    return NextResponse.json<ApiResponse<AttemptWithAnswers>>(
      {
        success: true,
        data: {
          ...updatedAttempt,
          answers: attempt.answers,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[POST /api/quiz/[id]/attempt/complete]", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
