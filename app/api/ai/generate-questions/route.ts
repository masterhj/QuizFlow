import { auth } from "@/lib/auth";
import { generateQuestions } from "@/lib/ai";
import { generateQuestionsSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";

// Simple in-memory rate limiting: Map<userId, { count, resetAt }>
const rateLimitMap = new Map<
  string,
  { count: number; resetAt: number }
>();

const RATE_LIMIT = 20; // 20 requests per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in ms

function checkRateLimit(userId: string): { allowed: boolean; resetIn: number } {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetAt) {
    // Reset or first request
    rateLimitMap.set(userId, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW,
    });
    return { allowed: true, resetIn: RATE_LIMIT_WINDOW };
  }

  if (userLimit.count < RATE_LIMIT) {
    userLimit.count++;
    return { allowed: true, resetIn: userLimit.resetAt - now };
  }

  return { allowed: false, resetIn: userLimit.resetAt - now };
}

/**
 * POST /api/ai/generate-questions
 * Stream generated quiz questions (teachers only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { data: null, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== UserRole.TEACHER) {
      return NextResponse.json(
        { data: null, error: "Only teachers can generate questions" },
        { status: 403 }
      );
    }

    // Check rate limit
    const rateLimit = checkRateLimit(session.user.id);
    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil(rateLimit.resetIn / 1000);
      return NextResponse.json(
        {
          data: null,
          error: `Rate limited. Retry after ${retryAfter} seconds`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": retryAfter.toString(),
          },
        }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = generateQuestionsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { data: null, error: "Invalid input: " + validation.error.message },
        { status: 400 }
      );
    }

    // Create streaming response
    const encoder = new TextEncoder();
    let questionCount = 0;

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const question of generateQuestions(validation.data)) {
            // Send question as NDJSON (newline-delimited JSON)
            const line = JSON.stringify(question) + "\n";
            controller.enqueue(encoder.encode(line));
            questionCount++;
          }

          // Send completion marker
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                _type: "complete",
                totalGenerated: questionCount,
              }) + "\n"
            )
          );
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Generation failed";
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                _type: "error",
                error: errorMessage,
              }) + "\n"
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("[POST /api/ai/generate-questions]", error);
    return NextResponse.json(
      {
        data: null,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
