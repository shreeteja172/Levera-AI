import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

const DEFAULT_PROBLEMS = [
  { title: "Two Sum", slug: "two-sum", difficulty: "Easy" },
  { title: "Reverse Linked List", slug: "reverse-linked-list", difficulty: "Easy" },
  { title: "Valid Parentheses", slug: "valid-parentheses", difficulty: "Easy" },
  { title: "Binary Search", slug: "binary-search", difficulty: "Easy" },
  { title: "Longest Substring Without Repeating Characters", slug: "longest-substring", difficulty: "Medium" },
  { title: "Container With Most Water", slug: "container-with-most-water", difficulty: "Medium" },
  { title: "3Sum", slug: "3sum", difficulty: "Medium" },
  { title: "Merge Intervals", slug: "merge-intervals", difficulty: "Medium" },
  { title: "Merge k Sorted Lists", slug: "merge-k-sorted-lists", difficulty: "Hard" },
  { title: "Trapping Rain Water", slug: "trapping-rain-water", difficulty: "Hard" },
];

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const problemsCount = await prisma.problem.count();
    if (problemsCount === 0) {
      await prisma.problem.createMany({
        data: DEFAULT_PROBLEMS,
      });
    }

    const { searchParams } = new URL(req.url);
    const difficulty = searchParams.get("difficulty");
    const status = searchParams.get("status");
    const saved = searchParams.get("saved");

    const problems = await prisma.problem.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        saves: session?.user?.id ? { where: { userId: session.user.id } } : false,
        solves: session?.user?.id ? { where: { userId: session.user.id } } : false,
      },
    });

    let formattedProblems = problems.map((p) => {
      const isSaved = session?.user?.id ? p.saves.length > 0 : false;
      const isSolved = session?.user?.id ? p.solves.length > 0 : false;
      return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        difficulty: p.difficulty || "Easy",
        isSaved,
        isSolved,
      };
    });

    if (difficulty && difficulty !== "All") {
      formattedProblems = formattedProblems.filter(
        (p) => p.difficulty.toLowerCase() === difficulty.toLowerCase()
      );
    }

    if (status && status !== "All") {
      const wantSolved = status.toLowerCase() === "solved";
      formattedProblems = formattedProblems.filter(
        (p) => p.isSolved === wantSolved
      );
    }

    if (saved && saved !== "All") {
      const wantSaved = saved === "true";
      formattedProblems = formattedProblems.filter(
        (p) => p.isSaved === wantSaved
      );
    }

    return NextResponse.json({ problems: formattedProblems });
  } catch (error: any) {
    console.error("Error fetching problems:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch problems" },
      { status: 500 }
    );
  }
}
