import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { REVIEW_INTERVALS, type ReviewRating } from "@/lib/review";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const reviewSchema = z.object({
      rating: z
        .string()
        .refine(
          (val) => Object.keys(REVIEW_INTERVALS).includes(val),
          "Invalid rating value",
        ),
    });

    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 },
      );
    }

    const { rating } = parsed.data;

    const problem = await prisma.savedProblem.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    const intervalDays = REVIEW_INTERVALS[rating as ReviewRating];
    const nextReviewAt = new Date();
    nextReviewAt.setDate(nextReviewAt.getDate() + intervalDays);

    const updated = await prisma.savedProblem.update({
      where: {
        id,
      },
      data: {
        nextReviewAt,
        lastReviewedAt: new Date(),
        reviewCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    logger.error({ err: error }, "Failed to record review:");
    return NextResponse.json(
      { error: "Failed to record review" },
      { status: 500 },
    );
  }
}
