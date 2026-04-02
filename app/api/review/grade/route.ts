import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateNextReview } from "@/lib/adaptive";
import { reviewGradeSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse } from "@/types";

/**
 * POST /api/review/grade
 * Submit a grade for a review question and schedule next review
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
    const validation = reviewGradeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Invalid input: " + validation.error.message },
        { status: 400 }
      );
    }

    const { reviewId, grade } = validation.data;

    // Fetch current review with question details
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        question: {
          select: {
            id: true,
            subject: { 
              select: { name: true } 
            },
          },
        },
      },
    });

    if (!review) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Review not found" },
        { status: 404 }
      );
    }

    if (review.userId !== session.user.id) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Access denied" },
        { status: 403 }
      );
    }

    // Calculate next review parameters using SM-2
    const nextReviewParams = calculateNextReview(
      review.easeFactor,
      review.intervalDays,
      grade as 0 | 1 | 2 | 3 | 4 | 5
    );

    // Update current review with completion and grade
    await prisma.review.update({
      where: { id: reviewId },
      data: {
        completedAt: new Date(),
        grade,
        easeFactor: nextReviewParams.newEaseFactor,
        intervalDays: nextReviewParams.newInterval,
      },
    });

    // Create next review with new scheduled date
    const question = await prisma.question.findUnique({
      where: { id: review.questionId },
      select: {
        quiz: {
          select: {
            subject: true,
          },
        },
      },
    });

    if (question) {
      await prisma.review.create({
        data: {
          userId: session.user.id,
          questionId: review.questionId,
          scheduledAt: nextReviewParams.nextReviewDate,
          easeFactor: nextReviewParams.newEaseFactor,
          intervalDays: nextReviewParams.newInterval,
        },
      });

      // Update TopicMastery with new ease factor and interval
      await prisma.topicMastery.update({
        where: {
          userId_subject: {
            userId: session.user.id,
            subject: question.quiz.subject,
          },
        },
        data: {
          easeFactor: nextReviewParams.newEaseFactor,
          intervalDays: nextReviewParams.newInterval,
          lastReviewedAt: new Date(),
          reviewCount: {
            increment: 1,
          },
        },
      });
    }

    return NextResponse.json<ApiResponse<{ nextReviewDate: Date }>>(
      {
        data: {
          nextReviewDate: nextReviewParams.nextReviewDate,
        },
        error: null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[POST /api/review/grade]", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        data: null,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
