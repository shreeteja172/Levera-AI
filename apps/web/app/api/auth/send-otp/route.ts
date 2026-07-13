import { NextRequest, NextResponse } from 'next/server';
import { generateOtp } from '@/lib/otp';
import { sendOtpEmail } from '@/lib/brevo';

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

  const otp = generateOtp(email);

  try {
    await sendOtpEmail(email, otp);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}