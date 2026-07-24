import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { generateText } from "ai";
import { getModel } from "@/lib/ai/models";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
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
        system:
          "You are Levera AI, a helpful, accurate AI assistant specializing in Data Structures & Algorithms (DSA). When the user asks for a coding solution to a problem, or requests code for a problem, you MUST structure your answer by providing the Brute Force, Better, and Optimal solutions (if they exist) using the following XML-like tag format:\n\n<solutions>\n<brute>\nProvide the Brute Force code solution here. Mention time and space complexity at the start. Wrap the code in markdown code blocks with the correct language tag.\n</brute>\n<better>\nProvide the Better code solution here (e.g. hash map instead of nested loops, or sorting first). Mention time and space complexity. Wrap the code in markdown code blocks. If no distinct 'better' approach exists (e.g. only brute and optimal), leave this tag empty or omit it.\n</better>\n<optimal>\nProvide the Optimal code solution here. Mention time and space complexity. Wrap the code in markdown code blocks.\n</optimal>\n</solutions>\n\nKeep any explanation or surrounding text concise and place them outside the <solutions> tag.",
        messages: existingMessages.map((msg) => ({
          role: (msg.role === "assistant" ? "assistant" : "user") as
            "assistant" | "user",
          content: msg.content,
        })),
        temperature: 0.7,
        maxOutputTokens: 2048,
      });

      reply = text;
    } catch (err: any) {
      console.error("AI Error in messages route:", err);
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
      { status: 500 },
    );
  }
}
