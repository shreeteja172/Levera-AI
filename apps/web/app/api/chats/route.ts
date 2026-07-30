import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateText } from "ai";
import { getModel } from "@/lib/ai/models";
import { LEVERA_SYSTEM_PROMPT } from "@/lib/ai/prompt";
import { PROGRAMMING_LANGUAGES } from "@/lib/constants/programming-languages";

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
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch chats" },
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
        const userPref = (session.user as any).preferredLanguage;
        const systemPromptContent =
          LEVERA_SYSTEM_PROMPT +
          (userPref
            ? `\n\nThe user's preferred programming language is ${
                PROGRAMMING_LANGUAGES.find((l) => l.value === userPref)
                  ?.label || userPref
              }. Unless the user explicitly requests another programming language in their current message, generate all code examples using this language.`
            : "");

        const { text: reply } = await generateText({
          model: aiModel,
          system: systemPromptContent,
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
      } catch (err) {
        console.error("AI generation error:", err);
        const errorMsg =
          (err as Error).message || "Failed to contact the AI model.";
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
  } catch (error) {
    console.error("Error creating chat:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to create chat" },
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
  } catch (error) {
    console.error("Error deleting all chats:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to delete all chats" },
      { status: 500 },
    );
  }
}
