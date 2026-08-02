import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ error: "Missing slug parameter" }, { status: 400 });
    }

    const progress = await prisma.hintProgress.findUnique({
      where: {
        userId_problemSlug: {
          userId: session.user.id,
          problemSlug: slug,
        },
      },
    });

    return NextResponse.json({
      unlockedLevel: progress?.unlockedLevel ?? 0,
      revealedLevel: progress?.revealedLevel ?? 0,
    });
  } catch (error) {
    console.error("Get hint progress error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch progress" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { problemSlug, unlockedLevel, revealedLevel } = body;

    if (!problemSlug) {
      return NextResponse.json({ error: "Missing problemSlug" }, { status: 400 });
    }

    const updateData: { unlockedLevel?: number; revealedLevel?: number } = {};
    if (typeof unlockedLevel === "number") updateData.unlockedLevel = unlockedLevel;
    if (typeof revealedLevel === "number") updateData.revealedLevel = revealedLevel;

    const progress = await prisma.hintProgress.upsert({
      where: {
        userId_problemSlug: {
          userId: session.user.id,
          problemSlug,
        },
      },
      update: updateData,
      create: {
        userId: session.user.id,
        problemSlug,
        unlockedLevel: unlockedLevel ?? 0,
        revealedLevel: revealedLevel ?? 0,
      },
    });

    return NextResponse.json({
      unlockedLevel: progress.unlockedLevel,
      revealedLevel: progress.revealedLevel,
    });
  } catch (error) {
    console.error("Save hint progress error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to save progress" },
      { status: 500 }
    );
  }
}
