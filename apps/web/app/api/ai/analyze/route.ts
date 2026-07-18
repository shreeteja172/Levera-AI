import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const problem = await req.json();

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

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You are an expert competitive programming assistant. Always provide the optimal solution only.",
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
    console.error("Groq Error:", error);

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
