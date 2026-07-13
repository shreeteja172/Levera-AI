type OtpEntry = { code: string; expiresAt: number };
const otpStore = new Map<string, OtpEntry>();

export function generateOtp(email: string) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email, { code, expiresAt: Date.now() + 5 * 60 * 1000 });
  return code;
}

export function verifyOtp(email: string, code: string) {
  const entry = otpStore.get(email);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(email);
    return false;
  }
  const valid = entry.code === code;
  if (valid) otpStore.delete(email);
  return valid;
}