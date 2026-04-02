import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createQuizSchema, paginationSchema, searchQuizzesSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse, PaginatedResponse, QuizWithAttempts } from "@/types";
import { UserRole } from "@prisma/client";

/**
 * GET /api/quiz
 * Fetch quizzes with pagination and filters
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

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const subject = searchParams.get("subject") || undefined;
    const search = searchParams.get("search") || undefined;
    const published = searchParams.get("published");

    // Validate pagination
    const paginationValidation = paginationSchema.safeParse({ page, pageSize });
    if (!paginationValidation.success) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    // Build query filter
    const whereClause: any = {};

    if (session.user.role === UserRole.STUDENT) {
      // Students only see published quizzes
      whereClause.isPublished = true;
    } else if (session.user.role === UserRole.TEACHER) {
      // Teachers see their own quizzes (published + drafts)
      whereClause.creatorId = session.user.id;
    }

    if (subject) {
      whereClause.subject = {
        contains: subject,
        mode: "insensitive",
      };
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (published !== null && published !== undefined) {
      whereClause.isPublished = published === "true";
    }

    // Get total count
    const total = await prisma.quiz.count({ where: whereClause });

    // Fetch paginated quizzes
    const quizzes = await prisma.quiz.findMany({
      where: whereClause,
      include: {
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
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json<PaginatedResponse<QuizWithAttempts[]>>(
      {
        data: quizzes as QuizWithAttempts[],
        error: null,
        meta: {
          total,
          page,
          pageSize,
          totalPages,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[GET /api/quiz]", error);
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
 * POST /api/quiz
 * Create a new quiz (teachers only)
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

    if (session.user.role !== UserRole.TEACHER) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Only teachers can create quizzes" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = createQuizSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Invalid input: " + validation.error.message },
        { status: 400 }
      );
    }

    // Create quiz
    const quiz = await prisma.quiz.create({
      data: {
        ...validation.data,
        creatorId: session.user.id,
      },
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

    return NextResponse.json<ApiResponse<typeof quiz>>(
      { data: quiz, error: null },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/quiz]", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        data: null,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
