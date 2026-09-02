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
  checkRateLimit,
} from "@/lib/rateLimit";

export async function GET(req: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit") ?? 20), 100);
    const cursor = searchParams.get("cursor");

    const chats = await prisma.chatSession.findMany({
      take: limit + 1,
      ...(cursor && {
        cursor: {
          id: cursor,
        },
      }),
      where: {
        userId: session.user.id,
      },
      orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    let nextCursor: string | undefined = undefined;
    let hasMore = false;

    if (chats.length > limit) {
      hasMore = true;
      const nextItem = chats.pop();
      nextCursor = nextItem?.id;
    }

    return NextResponse.json({
      data: chats,
      pagination: {
        nextCursor,
        hasMore,
      },
    });
  } catch (error) {
    logger.error({ err: error }, "Error fetching chats:");
    return NextResponse.json(
      { error: "Failed to fetch chats" },
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

    const { success } = await checkRateLimit(chatRateLimit, session.user.id);
    if (!success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 },
      );
    }

    const dailyQuota = await checkRateLimit(chatDailyLimit, session.user.id);
    if (!dailyQuota.success) {
      return NextResponse.json(
        { error: "Daily message limit reached. Try again tomorrow." },
        { status: 429 },
      );
    }

    const body = await req.json();
    const createChatSchema = z.object({
      title: z.string().min(1, "Title is required").max(200),
      message: z.string().max(12000, "Message is too long").optional(),
      provider: z.string().max(40).default("groq"),
      model: z.string().max(120).default("openai/gpt-oss-120b"),
      hintMode: z.boolean().default(false),
    });

    const parsed = createChatSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 },
      );
    }

    const { title, message, provider, model, hintMode } = parsed.data;

    if (isPremiumModel(provider, model)) {
      const premiumQuota = await checkRateLimit(
        premiumModelDailyLimit,
        session.user.id,
      );
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
          prompt: message,
          temperature: 0.7,
          maxOutputTokens: 2048,
          onFinish: async ({ text }) => {
            after(async () => {
              try {
                await withRetry(() =>
                  prisma.chatSession.update({
                    where: {
                      id: newSession.id,
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

        return result.toTextStreamResponse({
          headers: {
            "x-chat-id": newSession.id,
            "x-chat-title": encodeURIComponent(newSession.title || title),
          },
        });
      } catch (err) {
        logger.error({ err: err }, "AI generation error:");
        const errorMsg =
          (err as Error).message || "Failed to contact the AI model.";
        try {
          await withRetry(() =>
            prisma.chatSession.update({
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
    }

    return NextResponse.json(newSession);
  } catch (error) {
    logger.error({ err: error }, "Error creating chat:");
    return NextResponse.json(
      { error: "Failed to create chat" },
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
    logger.error({ err: error }, "Error deleting all chats:");
    return NextResponse.json(
      { error: "Failed to delete all chats" },
      { status: 500 },
    );
  }
}
