"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { authClient, sendOtp } from "@/lib/auth-client";
import AuthIllustration from "../AuthIllustration";

function OTPVerificationForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";

  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [resending, setResending] = useState(false);

  // Refs for focusing inputs
  const inputRefs: [
    React.RefObject<HTMLInputElement | null>,
    React.RefObject<HTMLInputElement | null>,
    React.RefObject<HTMLInputElement | null>,
    React.RefObject<HTMLInputElement | null>,
    React.RefObject<HTMLInputElement | null>,
    React.RefObject<HTMLInputElement | null>,
  ] = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Focus the first input on load
  useEffect(() => {
    inputRefs[0]?.current?.focus();
  }, []);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Handle auto-submitting when all 6 digits are entered
  useEffect(() => {
    if (code.every((digit) => digit !== "")) {
      verifyCode(code.join(""));
    }
  }, [code]);

  const handleInputChange = (value: string, index: number) => {
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs[index + 1]?.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (!code[index] && index > 0) {
        const newCode = [...code];
        newCode[index - 1] = "";
        setCode(newCode);
        inputRefs[index - 1]?.current?.focus();
      } else {
        const newCode = [...code];
        newCode[index] = "";
        setCode(newCode);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(pastedData)) {
      toast.error("Please paste a 6-digit number");
      return;
    }
    const digits = pastedData.split("");
    setCode(digits);
    inputRefs[5]?.current?.focus();
  };

  const verifyCode = async (otpValue: string) => {
    if (!email) {
      toast.error("No email address provided");
      return;
    }
    try {
      setLoading(true);
      const result = await authClient.signIn.emailOtp({
        email,
        otp: otpValue,
        callbackURL: "/dashboard",
      });

      if (result.error) {
        toast.error(result.error.message || "Verification failed");
      } else {
        toast.success("Signed in successfully!");
        router.push("/dashboard");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("No email specified");
      return;
    }
    try {
      setResending(true);
      await sendOtp(email);
      setCountdown(60);
      toast.success("OTP sent to your email!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 my-auto py-4 desktop-short:gap-4">
      <h1 className="text-[2.15rem] leading-[1.15] font-normal text-[#111111] tracking-[-0.03em] max-[480px]:text-[1.75rem] desktop-short:text-[1.85rem]">
        Verify <span className="text-[#FF5A1F] relative inline-block">Your Email</span>.
      </h1>
      <p className="text-[0.95rem] leading-[1.5] text-[#64748B] max-w-[95%] mb-2">
        We sent a 6-digit verification code to <strong style={{ color: "#111" }}>{email || "your email"}</strong>.
        Please enter it below to access your account.
      </p>

      <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[16px] p-6 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.03),0_4px_12px_-4px_rgba(0,0,0,0.02)] flex flex-col gap-4 max-[480px]:p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            verifyCode(code.join(""));
          }}
          className="flex flex-col gap-[14px]"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.75rem] font-normal text-[#64748b] uppercase tracking-[0.05em]">6-Digit Verification Code</label>
            <div className="flex justify-between gap-2 mt-3 mb-5 mx-0">
              {code.map((digit, idx) => (
                <input
                  key={idx}
                  ref={inputRefs[idx]}
                  type="text"
                  maxLength={1}
                  pattern="\d*"
                  inputMode="numeric"
                  className="w-[46px] h-[54px] rounded-[12px] border border-[rgba(0,0,0,0.12)] bg-[#FAF9F6] text-[#1E293B] text-[1.5rem] font-normal text-center font-['JetBrains_Mono',monospace] transition-all duration-200 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] focus:outline-none focus:border-[#FF5A1F] focus:shadow-[0_0_0_3px_rgba(255,90,31,0.12)] focus:bg-white"
                  value={digit}
                  onChange={(e) => handleInputChange(e.target.value, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  onPaste={handlePaste}
                  disabled={loading}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || code.some((d) => !d)}
            className="w-full rounded-[10px] border-none bg-[#111111] text-white p-3.5 text-[0.95rem] font-normal cursor-pointer transition-all duration-200 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] flex justify-center items-center gap-2 hover:bg-[#222222] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] active:translate-y-0 disabled:bg-[#94A3B8] disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </form>

        <p className="text-[0.85rem] text-[#64748B] text-center mt-1">
          Didn&apos;t receive the code?{" "}
          {countdown > 0 ? (
            <span style={{ fontWeight: 400, color: "#64748B" }}>
              Resend in {countdown}s
            </span>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              style={{
                background: "none",
                border: "none",
                color: "#FF5A1F",
                fontWeight: 400,
                cursor: "pointer",
                padding: 0,
                fontFamily: "inherit",
              }}
            >
              {resending ? "Resending..." : "Resend Code"}
            </button>
          )}
        </p>

        <div className="flex items-center justify-center gap-3 mt-2 pt-4 border-t border-[rgba(0,0,0,0.06)] text-[0.85rem]">
          <span className="text-[#64748B]">Changed your mind?</span>
          <Link
            href="/auth/sign-in"
            className="px-4 py-1.5 bg-[#111111] hover:bg-[#FF5A1F] rounded-full text-white font-medium text-[0.8rem] transition-all duration-200 shadow-[0_2px_4px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(255,90,31,0.2)] hover:-translate-y-0.5 active:translate-y-0"
            style={{ color: "#ffffff" }}
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OTPVerificationPage() {
  return (
    <main className="flex justify-center items-center bg-[#EAE7DF] p-6 min-h-screen box-border font-sans max-[480px]:p-3 relative">
      <Link
        href="/"
        className="absolute top-6 left-6 z-50 flex items-center h-11 w-11 hover:w-[120px] rounded-full bg-white/90 hover:bg-white text-[#1A1A1A] border border-[rgba(0,0,0,0.08)] shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group overflow-hidden max-[1024px]:top-4 max-[1024px]:left-4 cursor-pointer"
      >
        <div className="flex items-center justify-start w-full pl-[13px] gap-2.5 whitespace-nowrap">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transform group-hover:-translate-x-0.5 transition-transform duration-300 text-[#FF5A1F] shrink-0"
          >
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[0.8rem] font-semibold tracking-wide text-[#1A1A1A]">
            Go Home
          </span>
        </div>
      </Link>
      <div className="max-w-[1200px] w-full h-[min(800px,calc(100vh-48px))] min-h-[600px] bg-white rounded-[24px] border border-[rgba(0,0,0,0.12)] shadow-[0_24px_70px_-12px_rgba(0,0,0,0.18),0_8px_24px_-8px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.8)] flex overflow-hidden relative transition-all duration-300 ease max-[1024px]:h-auto max-[1024px]:min-h-[700px] max-[1024px]:flex-col max-[1024px]:max-w-[550px] desktop-short:h-[calc(100vh-48px)] desktop-short:min-h-[550px]">
        <section className="w-[45%] bg-[#F5F3EE] p-[clamp(24px,4vh,48px)] flex flex-col justify-between relative overflow-y-auto box-border [scrollbar-width:thin] [scrollbar-color:rgba(0,0,0,0.1)_transparent] [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-thumb]:bg-[rgba(0,0,0,0.1)] [&::-webkit-scrollbar-thumb]:rounded-[2px] max-[1024px]:w-full max-[1024px]:p-8 max-[480px]:px-4 max-[480px]:py-6">
          <div className="flex items-center gap-[10px] font-normal text-[1.35rem] text-[#1A1A1A] tracking-[-0.02em]">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="flex items-center justify-center text-[#FF5A1F]"
            >
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
              <circle cx="12" cy="12" r="2.5" fill="currentColor" />
            </svg>
            <span>Levera</span>
          </div>

          <Suspense
            fallback={
              <div className="flex flex-col gap-5 my-auto py-4 desktop-short:gap-4" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
                <p className="text-[0.95rem] leading-[1.5] text-[#64748B] max-w-[95%] mb-2">Loading verification details...</p>
              </div>
            }
          >
            <OTPVerificationForm />
          </Suspense>
        </section>

        <AuthIllustration />
      </div>
    </main>
  );
}
