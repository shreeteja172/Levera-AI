import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
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

    const existingSolve = await prisma.solveHistory.findUnique({
      where: {
        userId_problemId: {
          userId,
          problemId,
        },
      },
    });

    let isSolved = false;

    if (existingSolve) {
      await prisma.solveHistory.delete({
        where: {
          id: existingSolve.id,
        },
      });
    } else {
      await prisma.solveHistory.create({
        data: {
          userId,
          problemId,
        },
      });
      isSolved = true;
    }

    return NextResponse.json({ isSolved });
  } catch (error: any) {
    console.error("Error solving/unsolving problem:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update solved status" },
      { status: 500 },
    );
  }
}
