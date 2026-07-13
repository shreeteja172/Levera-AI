"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { authClient, sendOtp } from "@/lib/auth-client";
import AuthIllustration from "../AuthIllustration";
import styles from "../auth.module.css";

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
        callbackURL: "/home",
      });

      if (result.error) {
        toast.error(result.error.message || "Verification failed");
      } else {
        toast.success("Signed in successfully!");
        router.push("/home");
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
    <div className={styles.leftContent}>
      <h1 className={styles.heroHeading}>
        Verify <span className={styles.orangeAccent}>Your Email</span>.
      </h1>
      <p className={styles.supportingText}>
        We sent a 6-digit verification code to <strong style={{ color: "#111" }}>{email || "your email"}</strong>.
        Please enter it below to access your account.
      </p>

      <div className={styles.authCard}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            verifyCode(code.join(""));
          }}
          className={styles.formFields}
        >
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>6-Digit Verification Code</label>
            <div className={styles.otpInputContainer}>
              {code.map((digit, idx) => (
                <input
                  key={idx}
                  ref={inputRefs[idx]}
                  type="text"
                  maxLength={1}
                  pattern="\d*"
                  inputMode="numeric"
                  className={styles.otpInput}
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
            className={styles.primaryButton}
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </form>

        <p className={styles.toggleText}>
          Didn&apos;t receive the code?{" "}
          {countdown > 0 ? (
            <span style={{ fontWeight: 600, color: "#64748B" }}>
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
                fontWeight: 700,
                cursor: "pointer",
                padding: 0,
                fontFamily: "inherit",
              }}
            >
              {resending ? "Resending..." : "Resend Code"}
            </button>
          )}
        </p>

        <p className={styles.toggleText}>
          <Link href="/auth/sign-in" className={styles.toggleLink} style={{ marginLeft: 0 }}>
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function OTPVerificationPage() {
  return (
    <main className={styles.pageWrapper}>
      <div className={styles.authContainer}>
        <section className={styles.leftSection}>
          <div className={styles.logoContainer}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.logoSymbol}
            >
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
              <circle cx="12" cy="12" r="2.5" fill="currentColor" />
            </svg>
            <span>Levera</span>
          </div>

          <Suspense
            fallback={
              <div className={styles.leftContent} style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
                <p className={styles.supportingText}>Loading verification details...</p>
              </div>
            }
          >
            <OTPVerificationForm />
          </Suspense>

          <div className={styles.badgesContainer}>
            <div className={styles.badge}>
              <span className={styles.badgeSymbol}>🌲</span>
              <span>DSA</span>
            </div>
            <div className={styles.badge}>
              <span className={styles.badgeSymbol}>🏆</span>
              <span>Competitive Programming</span>
            </div>
            <div className={styles.badge}>
              <span className={styles.badgeSymbol}>👔</span>
              <span>Interview Prep</span>
            </div>
          </div>
        </section>

        <AuthIllustration />
      </div>
    </main>
  );
}
