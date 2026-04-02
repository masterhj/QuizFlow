import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse, QuestionWithOptions } from "@/types";

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * POST /api/quiz/[id]/attempt
 * Start a new quiz attempt
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check quiz exists and is published
    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      include: {
        questions: {
          select: {
            id: true,
            text: true,
            type: true,
            options: true,
            difficulty: true,
            order: true,
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Quiz not found" },
        { status: 404 }
      );
    }

    if (!quiz.isPublished) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Quiz is not published" },
        { status: 403 }
      );
    }

    const totalQuestions = quiz.questions.length;

    if (totalQuestions === 0) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Quiz has no questions" },
        { status: 400 }
      );
    }

    // Create attempt record
    const attempt = await prisma.attempt.create({
      data: {
        userId: session.user.id,
        quizId: params.id,
        totalQuestions,
      },
    });

    // Shuffle questions for this attempt
    const shuffledQuestions = [...quiz.questions].sort(
      () => Math.random() - 0.5
    ) as QuestionWithOptions[];

    return NextResponse.json<
      ApiResponse<{
        attemptId: string;
        questions: QuestionWithOptions[];
      }>
    >(
      {
        data: {
          attemptId: attempt.id,
          questions: shuffledQuestions,
        },
        error: null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/quiz/[id]/attempt]", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        data: null,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
