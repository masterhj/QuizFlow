import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateProfileSchema } from "@/lib/validations";
import { ApiResponse } from "@/types";

export async function PATCH(request: NextRequest) {
  try {
    // Get authenticated session
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validation = updateProfileSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Invalid input",
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { name, bio, image } = validation.data;

    // Update user profile
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...(name && { name }),
        ...(bio && { bio }),
        ...(image && { image }),
      },
    });

    return NextResponse.json<ApiResponse<typeof user>>(
      {
        success: true,
        data: user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[PROFILE_ROUTE]", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Allow": "PATCH",
    },
  });
}
