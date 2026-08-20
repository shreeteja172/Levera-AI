import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { after } from "next/server";
import { z } from "zod";
import { getServerSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { streamText } from "ai";
import { withRetry } from "@/lib/retry";
import { getModel, isPremiumModel } from "@/lib/ai/models";
import { LEVERA_SYSTEM_PROMPT } from "@/lib/ai/prompt";
import { PROGRAMMING_LANGUAGES } from "@/lib/constants/programming-languages";
import {
  chatRateLimit,
  chatDailyLimit,
  premiumModelDailyLimit,
} from "@/lib/rateLimit";

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

    const { success } = await chatRateLimit.limit(session.user.id);
    if (!success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 },
      );
    }

    const dailyQuota = await chatDailyLimit.limit(session.user.id);
    if (!dailyQuota.success) {
      return NextResponse.json(
        { error: "Daily message limit reached. Try again tomorrow." },
        { status: 429 },
      );
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
      content: z
        .string()
        .min(1, "Content is required")
        .max(12000, "Message is too long"),
      provider: z.string().max(40).default("groq"),
      model: z.string().max(120).default("openai/gpt-oss-120b"),
      hintMode: z.boolean().default(false),
    });

    const parsed = createMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 },
      );
    }

    const { content, provider, model, hintMode } = parsed.data;

    if (isPremiumModel(provider, model)) {
      const premiumQuota = await premiumModelDailyLimit.limit(session.user.id);
      if (!premiumQuota.success) {
        return NextResponse.json(
          {
            error:
              "Daily limit reached for this model. Switch to a GPT OSS or Qwen model, or try again tomorrow.",
          },
          { status: 429 },
        );
      }
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
          after(async () => {
            try {
              await withRetry(() =>
                prisma.chatSession.update({
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
                }),
              );
            } catch (dbErr) {
              logger.error(
                { err: dbErr },
                "Failed to save assistant message to DB:",
              );
            }
          });
        },
      });

      return result.toTextStreamResponse();
    } catch (err) {
      logger.error({ err: err }, "AI Error in messages route:");
      const errorMsg =
        (err as Error).message || "Failed to contact the AI model.";
      try {
        await withRetry(() =>
          prisma.chatSession.update({
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
          }),
        );
      } catch (dbErr) {
        logger.error(
          { err: dbErr },
          "Failed to save error assistant message to DB:",
        );
      }
      return NextResponse.json({ error: errorMsg }, { status: 500 });
    }
  } catch (error) {
    logger.error({ err: error }, "Error appending message:");
    return NextResponse.json(
      { error: "Failed to append message" },
      { status: 500 },
    );
  }
}
