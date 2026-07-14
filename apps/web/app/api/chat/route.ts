import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const completion = await client.chat.completions.create({
      model: "openai/gpt-oss-20b:free",
      messages: [{ role: "user", content: message }],
      max_tokens: 300,
    });

    return NextResponse.json({
      reply: completion.choices[0]?.message?.content ?? "",
    });
  } catch (err: any) {
    console.error(err);

    if (err.status === 429) {
      return NextResponse.json(
        {
          error: "The free model is currently busy. Please try again in a few seconds.",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: err.message,
      },
      { status: 500 }
    );
  }
}