import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

function createSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const savedProblems = await prisma.savedProblem.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        problem: true,
      },
    });

    return NextResponse.json(savedProblems);
  } catch (error) {
    console.error("Fetch saved problems error:", error);

    return NextResponse.json(
      {
        error: (error as Error).message || "Failed to fetch saved problems",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, language, brute, better, optimal, hints } = await req.json();

    if (!title || !language) {
      return NextResponse.json(
        { error: "Title and language are required" },
        { status: 400 },
      );
    }

    const slug = createSlug(title);

    const problem = await prisma.problem.upsert({
      where: {
        slug,
      },
      update: {},
      create: {
        title,
        slug,
      },
    });

    const savedProblem = await prisma.savedProblem.upsert({
      where: {
        userId_problemId: {
          userId: session.user.id,
          problemId: problem.id,
        },
      },
      update: {
        language,
        brute,
        better,
        optimal,
        hints: hints || undefined,
      },
      create: {
        userId: session.user.id,
        problemId: problem.id,
        language,
        brute,
        better,
        optimal,
        hints: hints || undefined,
      },
      include: {
        problem: true,
      },
    });

    return NextResponse.json(savedProblem);
  } catch (error) {
    console.error("Save problem error:", error);

    return NextResponse.json(
      {
        error: (error as Error).message || "Failed to save problem",
      },
      {
        status: 500,
      },
    );
  }
}
