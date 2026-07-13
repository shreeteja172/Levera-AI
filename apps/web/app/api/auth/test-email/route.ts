import { NextResponse } from "next/server";
import { sendOtpEmail } from "@/lib/brevo";

export async function GET() {
  await sendOtpEmail(
    "teja.debugs172@gmail.com",
    "123456"
  );

  return NextResponse.json({
    message: "Email sent",
  });
}