import { NextResponse } from "next/server";
import { z } from "zod";
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
        error: "Failed to fetch saved problems",
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

    const body = await req.json();
    const saveProblemSchema = z.object({
      title: z.string().min(1, "Title is required"),
      language: z.string().min(1, "Language is required"),
      brute: z.any().optional(),
      better: z.any().optional(),
      optimal: z.any().optional(),
      hints: z.any().optional(),
    });

    const parsed = saveProblemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { title, language, brute, better, optimal, hints } = parsed.data;

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
        error: "Failed to save problem",
      },
      {
        status: 500,
      },
    );
  }
}
