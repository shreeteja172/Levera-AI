import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

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
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, message } = await req.json();

    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const newSession = await prisma.chatSession.create({
      data: {
        title,
        userId: session.user.id,
        messages: message ? {
          create: {
            role: "user",
            content: message,
          },
        } : undefined,
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
        const completion = await groq.chat.completions.create({
          model: "openai/gpt-oss-120b",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful, accurate AI assistant. Answer clearly and avoid making up facts. If you're unsure, say so.",
            },
            {
              role: "user",
              content: message,
            },
          ],
          temperature: 0.7,
          max_completion_tokens: 2048,
          top_p: 1,
          stream: false,
          reasoning_effort: "medium",
        });

        const reply = completion.choices[0]?.message?.content ?? "";

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
        console.error("Groq Error on session creation:", err);
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
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

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
      { status: 500 }
    );
  }
}
