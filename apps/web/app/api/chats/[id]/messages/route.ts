import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

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

    const { content } = await req.json();

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
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

    const completionMessages = [
      {
        role: "system" as const,
        content:
          "You are a helpful, accurate AI assistant. Answer clearly and avoid making up facts. If you're unsure, say so.",
      },
      ...existingMessages.map((msg) => ({
        role: (msg.role === "assistant" ? "assistant" : "user") as "assistant" | "user",
        content: msg.content,
      })),
    ];

    let reply = "";
    try {
      const completion = await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages: completionMessages,
        temperature: 0.7,
        max_completion_tokens: 2048,
        top_p: 1,
        stream: false,
        reasoning_effort: "medium",
      });

      reply = completion.choices[0]?.message?.content ?? "";
    } catch (err: any) {
      console.error("Groq Error in messages route:", err);
      reply = `Error: ${err.message || "Failed to contact the AI model."}`;
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
  } catch (error: any) {
    console.error("Error appending message:", error);
    return NextResponse.json(
      { error: error.message || "Failed to append message" },
      { status: 500 }
    );
  }
}
