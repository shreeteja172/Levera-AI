import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PROGRAMMING_LANGUAGES } from "@/lib/constants/programming-languages";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const userPrefSchema = z.object({
      preferredLanguage: z.string().nullable().refine(
        (val) => val === null || PROGRAMMING_LANGUAGES.some((lang) => lang.value === val),
        "Invalid programming language"
      ).optional(),
    });

    const parsed = userPrefSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const preferredLanguage = parsed.data.preferredLanguage as any;

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { preferredLanguage },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Failed to update user preferences:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 },
    );
  }
}
