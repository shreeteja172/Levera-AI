import crypto from "crypto";
import prisma from "@/lib/prisma";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: Request) {
  const { deviceCode } = await request.json();

  if (!deviceCode) {
    return Response.json(
      { error: "missing_device_code" },
      { status: 400, headers: corsHeaders },
    );
  }

  const record = await prisma.deviceCode.findUnique({ where: { deviceCode } });

  if (!record || record.expiresAt < new Date()) {
    if (record) await prisma.deviceCode.delete({ where: { id: record.id } });
    return Response.json(
      { error: "expired_or_invalid" },
      { status: 410, headers: corsHeaders },
    );
  }

  if (record.status === "PENDING") {
    return Response.json(
      { status: "pending" },
      { status: 202, headers: corsHeaders },
    );
  }

  const session = await prisma.session.create({
    data: {
      token: crypto.randomBytes(32).toString("hex"),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      userId: record.userId!,
      ipAddress: request.headers.get("x-forwarded-for") || "extension",
      userAgent: request.headers.get("user-agent") || "Levera Extension",
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: record.userId! },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      isPro: true,
      preferredLanguage: true,
    },
  });

  await prisma.deviceCode.delete({ where: { id: record.id } });

  return Response.json(
    { token: session.token, user },
    { headers: corsHeaders },
  );
}
