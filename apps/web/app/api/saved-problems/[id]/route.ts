import { NextResponse } from "next/server";
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
        error: (error as Error).message || "Failed to delete saved problem",
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

    const { notes, language, bruteNotes, betterNotes, optimalNotes } =
      await req.json();

    const updateData: Record<string, string | undefined> = {};
    if (notes !== undefined) updateData.notes = notes;
    if (language !== undefined) updateData.language = language;
    if (bruteNotes !== undefined) updateData.bruteNotes = bruteNotes;
    if (betterNotes !== undefined) updateData.betterNotes = betterNotes;
    if (optimalNotes !== undefined) updateData.optimalNotes = optimalNotes;

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
        error: (error as Error).message || "Failed to update saved problem",
      },
      {
        status: 500,
      },
    );
  }
}
