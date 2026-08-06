import { NextResponse } from "next/server";
import { z } from "zod";
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

    const body = await req.json();
    const createMessageSchema = z.object({
      content: z.string().min(1, "Content is required"),
      provider: z.string().default("groq"),
      model: z.string().default("openai/gpt-oss-120b"),
      hintMode: z.boolean().default(false),
    });

    const parsed = createMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { content, provider, model, hintMode } = parsed.data;

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
      const userPref = (session.user as { preferredLanguage?: string })
        .preferredLanguage;
      let systemPromptContent = LEVERA_SYSTEM_PROMPT;

      if (hintMode) {
        systemPromptContent += `\n\n=== PROGRESSIVE HINT MODE ACTIVE ===
You are in Progressive Hint Mode. When responding to a new problem (Mode A), you MUST include a <hints> block BEFORE the <solutions> block.
The <hints> block must contain exactly these tags, in this order:
<hints>
<hint1>
Give only a subtle nudge to guide the user's direction. Do NOT mention data structures, classes, or specific algorithms.
</hint1>
<hint2>
Reveal the important key observation or complexity target.
</hint2>
<pattern>
Mention the algorithmic technique or family only. Examples: Sliding Window, Binary Search, Hash Map, DP, Graph, Two Pointers.
</pattern>
<pseudocode>
High-level logic only. No programming syntax. No variable names. No language-specific keywords.
</pseudocode>
</hints>

Do not skip any tags. Ensure the <hints> block is placed before the <solutions> block.`;
      }

      systemPromptContent += userPref
        ? `\n\nThe user's preferred programming language is ${
            PROGRAMMING_LANGUAGES.find((l) => l.value === userPref)?.label ||
            userPref
          }. Unless the user explicitly requests another programming language in their current message, generate all code examples using this language.`
        : "";

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
      const errorMsg =
        (err as Error).message || "Failed to contact the AI model.";
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
      { error: "Failed to append message" },
      { status: 500 },
    );
  }
}
