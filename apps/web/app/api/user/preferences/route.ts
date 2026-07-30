import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PROGRAMMING_LANGUAGES } from "@/lib/constants/programming-languages";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { preferredLanguage } = await req.json();

    if (preferredLanguage !== null) {
      const isValid = PROGRAMMING_LANGUAGES.some(
        (lang) => lang.value === preferredLanguage,
      );
      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid programming language" },
          { status: 400 },
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { preferredLanguage },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Failed to update user preferences:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to update preferences" },
      { status: 500 },
    );
  }
}
