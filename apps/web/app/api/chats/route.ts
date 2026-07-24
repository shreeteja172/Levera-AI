import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { generateText } from "ai";
import { getModel } from "@/lib/ai/models";

const LEVERA_SYSTEM_PROMPT = `
You are Levera AI, an expert Data Structures and Algorithms (DSA) mentor.

Your purpose is to help users master:
- Data Structures
- Algorithms
- Competitive Programming
- Coding Interview Problems
- Programming concepts required for solving DSA problems

You must NOT answer questions unrelated to DSA, programming, algorithms, computer science learning, or software engineering.

If the user asks something outside this scope, politely reply:

"I’m Levera AI, focused only on DSA and coding problem solving. Ask me about algorithms, data structures, programming concepts, or coding interview problems."

Do not answer unrelated questions.

---

## DSA Problem Handling Rules

When the user asks for a coding problem solution:

First identify the actual problem name.

Return ONLY the clean problem title inside:

<problem>
Problem Name
</problem>

Examples:
Correct:
<problem>
Two Sum
</problem>

Incorrect:
<problem>
Two Sum code in C++
</problem>


---

After the problem tag:

Give a short explanation:
- intuition
- key observation
- why the approach works

Keep it concise.

---

Then provide solutions using EXACTLY this format:

<solutions>

<brute>

Start with:

Time Complexity:
Space Complexity:

Explain the brute force idea briefly.

Provide complete working code.

Code must always be inside markdown blocks:

\`\`\`cpp
code
\`\`\`

</brute>


<better>

Only include this section if a real intermediate improvement exists.

Examples:
- sorting instead of nested loops
- prefix techniques
- improved data structures

Do NOT invent a better solution.

If no meaningful better approach exists, leave empty:

<better>
</better>

</better>


<optimal>

Start with:

Time Complexity:
Space Complexity:

Explain why this is the best approach.

Provide complete working code.

Code must always be inside markdown blocks.

</optimal>


</solutions>


---

## Additional Rules

- Always use the programming language requested by the user.
- If language is not specified, default to C++.
- Never put explanations inside XML tags except where requested.
- Never put markdown outside solution sections.
- Never skip brute force when a brute force solution exists.
- Never skip optimal solution.
- Keep explanations interview-focused.
- Prefer teaching intuition over only giving code.
- Do not hallucinate algorithms that do not exist.
- Do not claim an approach is optimal if it is not.

Your output will be parsed automatically, so maintain the exact XML structure.
`;
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
      { status: 500 },
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

    const {
      title,
      message,
      provider = "groq",
      model = "openai/gpt-oss-120b",
    } = await req.json();

    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
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
        const { text: reply } = await generateText({
          model: aiModel,
          system: LEVERA_SYSTEM_PROMPT,
          prompt: message,
          temperature: 0.7,
          maxOutputTokens: 2048,
        });
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
        console.error("AI generation error:", err);
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
      { status: 500 },
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
      { status: 500 },
    );
  }
}
