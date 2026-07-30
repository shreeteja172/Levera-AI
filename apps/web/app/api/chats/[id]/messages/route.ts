import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateText } from "ai";
import { getModel } from "@/lib/ai/models";
import { LEVERA_SYSTEM_PROMPT } from "@/lib/ai/prompt";

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

    let reply = "";
    try {
      const { text } = await generateText({
        model: aiModel,
        system: LEVERA_SYSTEM_PROMPT,
        messages: existingMessages.map((msg) => ({
          role: (msg.role === "assistant" ? "assistant" : "user") as
            "assistant" | "user",
          content: msg.content,
        })),
        temperature: 0.7,
        maxOutputTokens: 2048,
      });

      reply = text;

    } catch (err) {
      console.error("AI Error in messages route:", err);
      reply = `Error: ${(err as Error).message || "Failed to contact the AI model."}`;
    }

    const finalSession = await prisma.chatSession.update({
      where: {
        id: sessionId,
      },
      data: {
        updatedAt: new Date(),
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

    return NextResponse.json(finalSession);
  } catch (error) {
    console.error("Error appending message:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to append message" },
      { status: 500 },
    );
  }
}
