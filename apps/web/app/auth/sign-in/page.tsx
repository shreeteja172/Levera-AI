"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { signInWithEmail, signInWithGoogle, sendOtp } from "@/lib/auth-client";
import AuthIllustration from "../AuthIllustration";
import AuthRedirectOverlay from "../AuthRedirectOverlay";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("password");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState<string | null>(null);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      if (loginMethod === "password") {
        await signInWithEmail(email, password, "/dashboard");
        toast.success("Signed in successfully!");
        setRedirecting("Preparing your workspace");
        router.push("/dashboard");
      } else {
        await sendOtp(email);
        toast.success("OTP sent to your email!");
        setRedirecting("Sending your code");
        router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to sign in");
      setLoading(false);
    }
  }

  if (redirecting) {
    return <AuthRedirectOverlay label={redirecting} />;
  }

  return (
    <main className="flex justify-center items-center bg-[#EAE7DF] p-6 min-h-dvh box-border font-sans max-[480px]:p-3 relative">
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

          <div className="flex flex-col gap-5 my-auto py-4 desktop-short:gap-4">
            <h1 className="text-[2.15rem] leading-[1.15] font-normal text-[#111111] tracking-[-0.03em] max-[480px]:text-[1.75rem] desktop-short:text-[1.85rem]">
              Master <span className="text-[#FF5A1F] relative inline-block">Data Structures</span>.
              <br />
              Build Better <span className="text-[#0ea5e9] relative inline-block">Algorithms</span>.
            </h1>
            <p className="text-[0.95rem] leading-[1.5] text-[#64748B] max-w-[95%] mb-2">
              Practice coding problems, understand concepts deeply, and become a
              better problem solver.
            </p>

            <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[16px] p-6 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.03),0_4px_12px_-4px_rgba(0,0,0,0.02)] flex flex-col gap-4 max-[480px]:p-4">
              <div className="flex bg-[#FAF9F6] border border-[rgba(0,0,0,0.08)] rounded-[12px] p-1 mb-1">
                <button
                  type="button"
                  className={`flex-1 border-none bg-transparent py-2 px-3 text-[0.85rem] font-normal text-[#64748B] cursor-pointer rounded-[8px] transition-all duration-200 ease-in-out ${
                    loginMethod === "password" ? "bg-white text-[#111111] shadow-[0_2px_8px_rgba(0,0,0,0.05)]" : ""
                  }`}
                  onClick={() => setLoginMethod("password")}
                >
                  Password
                </button>
                <button
                  type="button"
                  className={`flex-1 border-none bg-transparent py-2 px-3 text-[0.85rem] font-normal text-[#64748B] cursor-pointer rounded-[8px] transition-all duration-200 ease-in-out ${
                    loginMethod === "otp" ? "bg-white text-[#111111] shadow-[0_2px_8px_rgba(0,0,0,0.05)]" : ""
                  }`}
                  onClick={() => setLoginMethod("otp")}
                >
                  Email OTP
                </button>
              </div>

              <form onSubmit={handleSignIn} className="flex flex-col gap-[14px]">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-[0.75rem] font-normal text-[#64748b] uppercase tracking-[0.05em]">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="name@company.com"
                    className="w-full rounded-[10px] border border-[rgba(0,0,0,0.12)] py-3 px-4 text-[0.92rem] transition-all duration-200 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] bg-[#FAF9F6] text-[#1E293B] box-border focus:outline-none focus:border-[#FF5A1F] focus:shadow-[0_0_0_3px_rgba(255,90,31,0.12)] focus:bg-white"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {loginMethod === "password" && (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <label htmlFor="password" className="text-[0.75rem] font-normal text-[#64748b] uppercase tracking-[0.05em]">
                        Password
                      </label>
                      <Link href="/auth/forgot-password" className="text-[0.78rem] text-[#FF5A1F]! font-normal transition-opacity duration-200 hover:underline hover:opacity-90">
                        Forgot password?
                      </Link>
                    </div>
                    <input
                      id="password"
                      type="password"
                      required
                      placeholder="••••••••"
                      className="w-full rounded-[10px] border border-[rgba(0,0,0,0.12)] py-3 px-4 text-[0.92rem] transition-all duration-200 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] bg-[#FAF9F6] text-[#1E293B] box-border focus:outline-none focus:border-[#FF5A1F] focus:shadow-[0_0_0_3px_rgba(255,90,31,0.12)] focus:bg-white"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-[10px] border-none bg-[#111111] text-white p-3.5 text-[0.95rem] font-normal cursor-pointer transition-all duration-200 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] flex justify-center items-center gap-2 hover:bg-[#222222] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] active:translate-y-0 disabled:bg-[#94A3B8] disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                >
                  {loading
                    ? loginMethod === "password"
                      ? "Signing in..."
                      : "Sending code..."
                    : loginMethod === "password"
                      ? "Continue Learning"
                      : "Send Verification Code"}
                </button>
              </form>

              <div className="flex items-center justify-center gap-3 my-0.5">
                <div className="flex-1 h-px bg-[rgba(0,0,0,0.08)]" />
                <span className="text-[0.72rem] font-normal text-[#94A3B8] tracking-[0.08em]">OR</span>
                <div className="flex-1 h-px bg-[rgba(0,0,0,0.08)]" />
              </div>

              <button
                type="button"
                onClick={() => {
                  setRedirecting("Redirecting to Google");
                  signInWithGoogle("/dashboard");
                }}
                className="w-full rounded-[10px] border border-[rgba(0,0,0,0.12)] bg-white text-[#1E293B] p-3 text-[0.92rem] font-normal cursor-pointer transition-all duration-200 ease-in-out flex justify-center items-center gap-2.5 hover:bg-[#FAF9F6] hover:border-[rgba(0,0,0,0.2)]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center justify-center gap-3 mt-2 pt-4 border-t border-[rgba(0,0,0,0.06)] text-[0.85rem]">
                <span className="text-[#64748B]">Don&apos;t have an account?</span>
                <Link
                  href="/auth/sign-up"
                  className="px-4 py-1.5 bg-[#111111] hover:bg-[#FF5A1F] rounded-full text-white font-medium text-[0.8rem] transition-all duration-200 shadow-[0_2px_4px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(255,90,31,0.2)] hover:-translate-y-0.5 active:translate-y-0"
                  style={{ color: "#ffffff" }}
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </section>

        <AuthIllustration />
      </div>
    </main>
  );
}