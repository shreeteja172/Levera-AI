import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import Groq from "groq-sdk";
import { validateBearerToken } from "@/lib/extension-auth";
import prisma from "@/lib/prisma";
import { PROGRAMMING_LANGUAGES } from "@/lib/constants/programming-languages";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const analyzeSchema = z.object({
      slug: z.string().optional(),
      title: z.string().optional(),
      difficulty: z.string().optional(),
      description: z.string().optional(),
    });

    const parsed = analyzeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400, headers: { "Access-Control-Allow-Origin": "*" } },
      );
    }
    const problem = parsed.data;

    const authResult = await validateBearerToken(req);
    if (authResult && problem.slug) {
      const { user } = authResult;
      try {
        const dbProblem = await prisma.problem.upsert({
          where: { slug: problem.slug },
          update: {
            title: problem.title || "",
            difficulty: problem.difficulty || "",
          },
          create: {
            slug: problem.slug,
            title: problem.title || "",
            difficulty: problem.difficulty || "",
          },
        });

        await prisma.solveHistory.upsert({
          where: {
            userId_problemId: {
              userId: user.id,
              problemId: dbProblem.id,
            },
          },
          update: {
            solvedAt: new Date(),
          },
          create: {
            userId: user.id,
            problemId: dbProblem.id,
          },
        });
      } catch (dbError) {
        logger.error({ err: dbError }, "Failed to save solve history:");
      }
    }

    const prompt = `
You are an expert competitive programmer.

Solve ONLY using the optimal approach.

Problem Title:
${problem.title}

Difficulty:
${problem.difficulty}

Problem Description:
${problem.description}

Rules:
- Return ONLY markdown.
- Do NOT include brute force.
- Do NOT include better approach.
- Be concise.
- Use the following format exactly.

# Intuition

Explain the idea.

# Algorithm

Explain the steps.

# Time Complexity

# Space Complexity

# C++ Solution

Provide clean, interview-quality C++ code.

# Dry Run

Walk through the sample input briefly.
Return valid GitHub Markdown.

Use headings like:

# Intuition

# Algorithm

# Time Complexity

# Space Complexity

# C++ Solution

Do NOT wrap headings in **bold**.
Do NOT write **# Heading**.
Write proper markdown only.
`;

    const systemPromptContent =
      "You are an expert competitive programming assistant. Always provide the optimal solution only." +
      (authResult?.user?.preferredLanguage
        ? `\n\nThe user's preferred programming language is ${
            PROGRAMMING_LANGUAGES.find(
              (l) => l.value === authResult.user.preferredLanguage,
            )?.label || authResult.user.preferredLanguage
          }. Unless the user explicitly asks for another language, generate all code examples in this language.`
        : "");

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: systemPromptContent,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const answer = completion.choices.at(0)?.message?.content;

    if (!answer) {
      return NextResponse.json(
        {
          error: "Groq returned an empty response.",
        },
        {
          status: 500,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    return NextResponse.json(
      {
        answer,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  } catch (error) {
    logger.error({ err: error }, "Groq Error:");

    return NextResponse.json(
      {
        error: "Failed to analyze problem.",
      },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }
}
