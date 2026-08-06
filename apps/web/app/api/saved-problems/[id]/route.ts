import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const problem = await prisma.savedProblem.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        problem: true,
      },
    });

    if (!problem) {
      return NextResponse.json(
        {
          error: "Problem not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(problem);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to fetch problem",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.savedProblem.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete saved problem error:", error);

    return NextResponse.json(
      {
        error: "Failed to delete saved problem",
      },
      {
        status: 500,
      },
    );
  }
}

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
    const updateProblemSchema = z.object({
      notes: z.string().optional(),
      language: z.string().optional(),
      bruteNotes: z.string().nullable().optional(),
      betterNotes: z.string().nullable().optional(),
      optimalNotes: z.string().nullable().optional(),
      nextReviewAt: z.union([z.string(), z.date(), z.null()]).optional(),
      lastReviewedAt: z.union([z.string(), z.date(), z.null()]).optional(),
      reviewCount: z.number().optional(),
    });

    const parsed = updateProblemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const {
      notes,
      language,
      bruteNotes,
      betterNotes,
      optimalNotes,
      nextReviewAt,
      lastReviewedAt,
      reviewCount,
    } = parsed.data;

    const updateData: Record<string, any> = {};
    if (notes !== undefined) updateData.notes = notes;
    if (language !== undefined) updateData.language = language;
    if (bruteNotes !== undefined) updateData.bruteNotes = bruteNotes;
    if (betterNotes !== undefined) updateData.betterNotes = betterNotes;
    if (optimalNotes !== undefined) updateData.optimalNotes = optimalNotes;
    if (nextReviewAt !== undefined)
      updateData.nextReviewAt = nextReviewAt ? new Date(nextReviewAt) : null;
    if (lastReviewedAt !== undefined)
      updateData.lastReviewedAt = lastReviewedAt
        ? new Date(lastReviewedAt)
        : null;
    if (reviewCount !== undefined) updateData.reviewCount = reviewCount;

    const updated = await prisma.savedProblem.update({
      where: {
        id,
        userId: session.user.id,
      },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Patch saved problem error:", error);

    return NextResponse.json(
      {
        error: "Failed to update saved problem",
      },
      {
        status: 500,
      },
    );
  }
}
