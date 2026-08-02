import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { todayStart } from "@/lib/review";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const now = new Date();

    const due = await prisma.savedProblem.count({
      where: {
        userId,
        nextReviewAt: {
          lte: now,
        },
      },
    });

    const completed = await prisma.savedProblem.count({
      where: {
        userId,
        lastReviewedAt: {
          gte: todayStart(),
        },
      },
    });

    const oldestDue = await prisma.savedProblem.findFirst({
      where: {
        userId,
        nextReviewAt: {
          lte: now,
        },
      },
      orderBy: {
        nextReviewAt: "asc",
      },
      select: {
        id: true,
      },
    });
    const nextDueProblemId = oldestDue?.id ?? null;

    const aggregate = await prisma.savedProblem.aggregate({
      where: {
        userId,
      },
      _sum: {
        reviewCount: true,
      },
    });
    const totalReviewed = aggregate._sum.reviewCount ?? 0;

    const reviewedProblems = await prisma.savedProblem.findMany({
      where: {
        userId,
        lastReviewedAt: {
          not: null,
        },
      },
      select: {
        lastReviewedAt: true,
      },
    });

    const uniqueDates = new Set<string>();
    for (const p of reviewedProblems) {
      if (p.lastReviewedAt) {
        uniqueDates.add(new Date(p.lastReviewedAt).toDateString());
      }
    }

    let streak = 0;
    const checkDate = new Date();
    if (uniqueDates.has(checkDate.toDateString())) {
      streak = 1;
      while (true) {
        checkDate.setDate(checkDate.getDate() - 1);
        if (uniqueDates.has(checkDate.toDateString())) {
          streak++;
        } else {
          break;
        }
      }
    } else {
      checkDate.setDate(checkDate.getDate() - 1);
      if (uniqueDates.has(checkDate.toDateString())) {
        streak = 1;
        while (true) {
          checkDate.setDate(checkDate.getDate() - 1);
          if (uniqueDates.has(checkDate.toDateString())) {
            streak++;
          } else {
            break;
          }
        }
      }
    }

    return NextResponse.json({
      due,
      completed,
      nextDueProblemId,
      totalReviewed,
      streak,
    });
  } catch (error) {
    console.error("Failed to fetch review stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch review stats" },
      { status: 500 },
    );
  }
}
