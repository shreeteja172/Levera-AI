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

export async function POST() {
  const deviceCode = crypto.randomBytes(16).toString("hex");
  const userCode = crypto.randomBytes(4).toString("hex").toUpperCase();

  await prisma.deviceCode.create({
    data: {
      deviceCode,
      userCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  return Response.json(
    {
      deviceCode,
      userCode,
      verifyUrl: `${process.env.BETTER_AUTH_URL}/auth/extension?code=${userCode}`,
      expiresIn: 600,
    },
    { headers: corsHeaders }
  );
}