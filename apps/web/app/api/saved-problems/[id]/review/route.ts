import { NextResponse } from "next/server";
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

    const { rating } = await req.json();

    if (!rating || !Object.keys(REVIEW_INTERVALS).includes(rating)) {
      return NextResponse.json(
        { error: "Invalid rating value" },
        { status: 400 },
      );
    }

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
    console.error("Failed to record review:", error);
    return NextResponse.json(
      { error: "Failed to record review" },
      { status: 500 },
    );
  }
}
