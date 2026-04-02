import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse, ReviewSession } from "@/types";

/**
 * GET /api/review/schedule
 * Fetch all reviews due today for the authenticated user
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

    const now = new Date();

    // Fetch due reviews (scheduled and not yet completed)
    const reviews = await prisma.review.findMany({
      where: {
        userId: session.user.id,
        scheduledAt: {
          lte: now,
        },
        completedAt: null,
      },
      include: {
        question: {
          select: {
            id: true,
            text: true,
            type: true,
            options: true,
            correctAnswer: true,
            difficulty: true,
          },
        },
      },
      take: 20,
      orderBy: {
        scheduledAt: "asc",
      },
    });

    // Transform to ReviewSession format
    const reviewSessions: ReviewSession[] = reviews.map((review) => ({
      questionId: review.id,
      question: review.question.text,
      correctAnswer: review.question.correctAnswer,
      userGrade: null,
    }));

    return NextResponse.json<ApiResponse<ReviewSession[]>>(
      { data: reviewSessions, error: null },
      { status: 200 }
    );
  } catch (error) {
    console.error("[GET /api/review/schedule]", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        data: null,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
