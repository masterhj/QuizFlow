import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { explainAnswer } from "@/lib/ai";
import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse } from "@/types";

interface ExplainRequest {
  questionId: string;
  userAnswer: string;
}

/**
 * POST /api/ai/explain
 * Get or generate explanation for an answer
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

    const body: ExplainRequest = await request.json();
    const { questionId, userAnswer } = body;

    if (!questionId || !userAnswer) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Question ID and user answer are required" },
        { status: 400 }
      );
    }

    // Fetch question from DB
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: {
        id: true,
        text: true,
        correctAnswer: true,
        explanation: true,
        difficulty: true,
        quiz: {
          select: {
            subject: true,
          },
        },
      },
    });

    if (!question) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Question not found" },
        { status: 404 }
      );
    }

    // Return cached explanation if it exists
    if (question.explanation) {
      return NextResponse.json<ApiResponse<{ explanation: string }>>(
        {
          data: { explanation: question.explanation },
          error: null,
        },
        { status: 200 }
      );
    }

    // Generate new explanation using AI
    let explanation: string;
    try {
      explanation = await explainAnswer(
        question.text,
        question.correctAnswer,
        userAnswer,
        question.quiz.subject
      );
    } catch (aiError) {
      console.error("AI explanation generation failed:", aiError);
      // Provide fallback explanation
      explanation =
        "The correct answer is: " +
        question.correctAnswer +
        ". Review the concept and try similar problems to strengthen your understanding.";
    }

    // Save explanation to DB for caching
    try {
      await prisma.question.update({
        where: { id: questionId },
        data: {
          explanation,
        },
      });
    } catch (updateError) {
      console.error("Failed to save explanation to DB:", updateError);
      // Don't fail the request, just don't cache
    }

    return NextResponse.json<ApiResponse<{ explanation: string }>>(
      {
        data: { explanation },
        error: null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[POST /api/ai/explain]", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        data: null,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
