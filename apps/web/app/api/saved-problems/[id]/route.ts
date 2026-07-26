import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const problem = await prisma.savedProblem.findUnique({
      where: {
        id,
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
  } catch (error: any) {
    console.error("Delete saved problem error:", error);

    return NextResponse.json(
      {
        error: error.message || "Failed to delete saved problem",
      },
      {
        status: 500,
      },
    );
  }
}

