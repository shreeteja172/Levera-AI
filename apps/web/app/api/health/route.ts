import { NextResponse } from "next/server";

export async function GET() {
  const timestamp = new Date().toISOString();

  return NextResponse.json(
    {
      status: "ok",
      timestamp,
      uptime: process.uptime(),
    },
    { status: 200 }
  );
}
