import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

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

    const body = await req.json();
    const rawTitle = typeof body?.title === "string" ? body.title.trim() : "";

    if (!rawTitle) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const title = rawTitle.slice(0, 80);

    const chat = await prisma.chatSession.findFirst({
      where: { id, userId: session.user.id },
      select: { id: true },
    });

    if (!chat) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.chatSession.update({
      where: { id },
      data: { title },
      select: { id: true, title: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    logger.error({ err: error }, "Error updating chat title:");
    return NextResponse.json(
      { error: "Failed to update chat" },
      { status: 500 },
    );
  }
}

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

    const chat = await prisma.chatSession.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!chat) {
      return NextResponse.json({ notFound: true, messages: [] });
    }

    return NextResponse.json(chat);
  } catch (error) {
    logger.error({ err: error }, "Error fetching chat:");
    return NextResponse.json(
      { error: "Failed to fetch chat" },
      { status: 500 },
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

    const chat = await prisma.chatSession.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!chat) {
      return NextResponse.json({ notFound: true });
    }

    await prisma.chatSession.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error({ err: error }, "Error deleting chat:");
    return NextResponse.json(
      { error: "Failed to delete chat" },
      { status: 500 },
    );
  }
}
