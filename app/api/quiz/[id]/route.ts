import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateQuizSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse, QuizWithQuestions } from "@/types";
import { UserRole } from "@prisma/client";

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/quiz/[id]
 * Fetch a single quiz with all questions
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      include: {
        questions: {
          orderBy: {
            order: "asc",
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            attempts: true,
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

    // Check visibility permissions
    if (!quiz.isPublished && quiz.creator.id !== session.user.id) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Access denied" },
        { status: 403 }
      );
    }

    return NextResponse.json<ApiResponse<QuizWithQuestions>>(
      { data: quiz as QuizWithQuestions, error: null },
      { status: 200 }
    );
  } catch (error) {
    console.error("[GET /api/quiz/[id]]", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        data: null,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/quiz/[id]
 * Update a quiz (owner only)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check ownership
    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      select: { creatorId: true },
    });

    if (!quiz) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Quiz not found" },
        { status: 404 }
      );
    }

    if (quiz.creatorId !== session.user.id) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Access denied" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = updateQuizSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Invalid input: " + validation.error.message },
        { status: 400 }
      );
    }

    // Update quiz
    const updatedQuiz = await prisma.quiz.update({
      where: { id: params.id },
      data: validation.data,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json<ApiResponse<typeof updatedQuiz>>(
      { data: updatedQuiz, error: null },
      { status: 200 }
    );
  } catch (error) {
    console.error("[PATCH /api/quiz/[id]]", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        data: null,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/quiz/[id]
 * Delete a quiz (owner only)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check ownership
    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      select: { creatorId: true },
    });

    if (!quiz) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Quiz not found" },
        { status: 404 }
      );
    }

    if (quiz.creatorId !== session.user.id) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Access denied" },
        { status: 403 }
      );
    }

    // Delete quiz (cascade deletes questions and attempts via Prisma)
    await prisma.quiz.delete({
      where: { id: params.id },
    });

    return NextResponse.json<ApiResponse<{ deleted: boolean }>>(
      { data: { deleted: true }, error: null },
      { status: 200 }
    );
  } catch (error) {
    console.error("[DELETE /api/quiz/[id]]", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        data: null,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
