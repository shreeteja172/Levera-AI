import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateText } from "ai";
import { getModel } from "@/lib/ai/models";
import { LEVERA_SYSTEM_PROMPT } from "@/lib/ai/prompt";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chats = await prisma.chatSession.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    return NextResponse.json(chats);
  } catch (error: any) {
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch chats" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      title,
      message,
      provider = "groq",
      model = "openai/gpt-oss-120b",
    } = await req.json();

    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    const aiModel = getModel(provider, model);

    const newSession = await prisma.chatSession.create({
      data: {
        title,
        userId: session.user.id,
        messages: message
          ? {
              create: {
                role: "user",
                content: message,
              },
            }
          : undefined,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (message) {
      try {
        const { text: reply } = await generateText({
          model: aiModel,
          system: LEVERA_SYSTEM_PROMPT,
          prompt: message,
          temperature: 0.7,
          maxOutputTokens: 2048,
        });
        const updatedSession = await prisma.chatSession.update({
          where: {
            id: newSession.id,
          },
          data: {
            messages: {
              create: {
                role: "assistant",
                content: reply,
              },
            },
          },
          include: {
            messages: {
              orderBy: {
                createdAt: "asc",
              },
            },
          },
        });

        return NextResponse.json(updatedSession);
      } catch (err: any) {
        console.error("AI generation error:", err);
        const errorMsg = err.message || "Failed to contact the AI model.";
        const updatedSession = await prisma.chatSession.update({
          where: {
            id: newSession.id,
          },
          data: {
            messages: {
              create: {
                role: "assistant",
                content: `Error: ${errorMsg}`,
              },
            },
          },
          include: {
            messages: {
              orderBy: {
                createdAt: "asc",
              },
            },
          },
        });
        return NextResponse.json(updatedSession);
      }
    }

    return NextResponse.json(newSession);
  } catch (error: any) {
    console.error("Error creating chat:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create chat" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.chatSession.deleteMany({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting all chats:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete all chats" },
      { status: 500 },
    );
  }
}
