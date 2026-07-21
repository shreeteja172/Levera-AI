import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: problemId } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
    });

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    const existingSave = await prisma.savedProblem.findUnique({
      where: {
        userId_problemId: {
          userId,
          problemId,
        },
      },
    });

    let isSaved = false;

    if (existingSave) {
      await prisma.savedProblem.delete({
        where: {
          id: existingSave.id,
        },
      });
    } else {
      await prisma.savedProblem.create({
        data: {
          userId,
          problemId,
        },
      });
      isSaved = true;
    }

    return NextResponse.json({ isSaved });
  } catch (error: any) {
    console.error("Error saving/unsaving problem:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update saved status" },
      { status: 500 }
    );
  }
}
