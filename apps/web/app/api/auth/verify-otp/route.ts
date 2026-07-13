import { NextRequest, NextResponse } from 'next/server';
import { verifyOtp } from '@/lib/otp';

export async function POST(req: NextRequest) {
  const { email, code } = await req.json();
  if (!email || !code) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const valid = verifyOtp(email, code);
  if (!valid) return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });

  return NextResponse.json({ success: true });
}