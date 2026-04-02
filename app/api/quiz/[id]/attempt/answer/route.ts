import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { submitAnswerSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse } from "@/types";

/**
 * POST /api/quiz/[id]/attempt/answer
 * Submit an answer for a question
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = submitAnswerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Invalid input: " + validation.error.message },
        { status: 400 }
      );
    }

    const { questionId, userAnswer, timeSpentSeconds } = validation.data;

    // Get attempt to verify ownership
    const attemptId = body.attemptId;

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      select: {
        id: true,
        userId: true,
        quizId: true,
      },
    });

    if (!attempt) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Attempt not found" },
        { status: 404 }
      );
    }

    if (attempt.userId !== session.user.id) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Access denied" },
        { status: 403 }
      );
    }

    // Get question with correct answer
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: {
        id: true,
        correctAnswer: true,
        quizId: true,
      },
    });

    if (!question || question.quizId !== attempt.quizId) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Question not found" },
        { status: 404 }
      );
    }

    // Check if answer is correct (case-insensitive comparison)
    const isCorrect =
      userAnswer.toLowerCase().trim() ===
      question.correctAnswer.toLowerCase().trim();

    // Create attempt answer record
    await prisma.attemptAnswer.create({
      data: {
        attemptId,
        questionId,
        userAnswer,
        isCorrect,
        timeSpentSeconds,
      },
    });

    return NextResponse.json<
      ApiResponse<{
        isCorrect: boolean;
        correctAnswer: string;
      }>
    >(
      {
        data: {
          isCorrect,
          correctAnswer: question.correctAnswer,
        },
        error: null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/quiz/[id]/attempt/answer]", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        data: null,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
