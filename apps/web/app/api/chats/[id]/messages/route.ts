import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { streamText } from "ai";
import { getModel } from "@/lib/ai/models";
import { LEVERA_SYSTEM_PROMPT } from "@/lib/ai/prompt";
import { PROGRAMMING_LANGUAGES } from "@/lib/constants/programming-languages";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: sessionId } = await params;
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chat = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId: session.user.id,
      },
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const {
      content,
      provider = "groq",
      model = "openai/gpt-oss-120b",
    } = await req.json();

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 },
      );
    }

    await prisma.chatSession.update({
      where: {
        id: sessionId,
      },
      data: {
        updatedAt: new Date(),
        messages: {
          create: {
            role: "user",
            content,
          },
        },
      },
    });

    const existingMessages = await prisma.chatMessage.findMany({
      where: {
        sessionId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const aiModel = getModel(provider, model);

    try {
      const userPref = (session.user as { preferredLanguage?: string }).preferredLanguage;
      const systemPromptContent =
        LEVERA_SYSTEM_PROMPT +
        (userPref
          ? `\n\nThe user's preferred programming language is ${
              PROGRAMMING_LANGUAGES.find((l) => l.value === userPref)?.label ||
              userPref
            }. Unless the user explicitly requests another programming language in their current message, generate all code examples using this language.`
          : "");

      const result = await streamText({
        model: aiModel,
        system: systemPromptContent,
        messages: existingMessages.map((msg) => ({
          role: (msg.role === "assistant" ? "assistant" : "user") as
            "assistant" | "user",
          content: msg.content,
        })),
        temperature: 0.7,
        maxOutputTokens: 2048,
        onFinish: async ({ text }) => {
          try {
            await prisma.chatSession.update({
              where: {
                id: sessionId,
              },
              data: {
                updatedAt: new Date(),
                messages: {
                  create: {
                    role: "assistant",
                    content: text,
                  },
                },
              },
            });
          } catch (dbErr) {
            console.error("Failed to save assistant message to DB:", dbErr);
          }
        },
      });

      return result.toTextStreamResponse();
    } catch (err) {
      console.error("AI Error in messages route:", err);
      const errorMsg = (err as Error).message || "Failed to contact the AI model.";
      try {
        await prisma.chatSession.update({
          where: {
            id: sessionId,
          },
          data: {
            updatedAt: new Date(),
            messages: {
              create: {
                role: "assistant",
                content: `Error: ${errorMsg}`,
              },
            },
          },
        });
      } catch (dbErr) {
        console.error("Failed to save error assistant message to DB:", dbErr);
      }
      return NextResponse.json({ error: errorMsg }, { status: 500 });
    }
  } catch (error) {
    console.error("Error appending message:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to append message" },
      { status: 500 },
    );
  }
}
