import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

export async function POST() {
  try {
    await prisma.savedProblem.deleteMany();
    await prisma.solveHistory.deleteMany();
    await prisma.problem.deleteMany();

    await prisma.problem.createMany({
      data: DEFAULT_PROBLEMS,
    });

    const problems = await prisma.problem.findMany({
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ success: true, problems });
  } catch (error: any) {
    console.error("Error seeding problems:", error);
    return NextResponse.json(
      { error: error.message || "Failed to seed problems" },
      { status: 500 }
    );
  }
}
