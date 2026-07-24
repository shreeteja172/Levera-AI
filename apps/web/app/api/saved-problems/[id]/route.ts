import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
