import { Groq } from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 },
      );
    }

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

    return NextResponse.json({
      reply: completion.choices[0]?.message?.content ?? "",
      finish_reason: completion.choices[0]?.finish_reason,
      usage: completion.usage,
    });
  } catch (err: any) {
    console.error("Groq Error:", err);

    return NextResponse.json(
      {
        error: err.message || "Something went wrong.",
      },
      { status: err.status || 500 },
    );
  }
}
