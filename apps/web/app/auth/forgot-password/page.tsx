"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { requestPasswordReset } from "@/lib/auth-client";
import AuthIllustration from "../AuthIllustration";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      await requestPasswordReset(email);
      setSent(true);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send reset link"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex justify-center items-center bg-[#EAE7DF] p-6 min-h-dvh box-border font-sans max-[480px]:p-3 relative">
      <Link
        href="/auth/sign-in"
        className="absolute top-6 left-6 z-50 flex items-center h-11 w-11 hover:w-[130px] rounded-full bg-white/90 hover:bg-white text-[#1A1A1A] border border-[rgba(0,0,0,0.08)] shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group overflow-hidden max-[1024px]:top-4 max-[1024px]:left-4 cursor-pointer"
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
            Back to sign in
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
              {sent ? (
                <>
                  Check your <span className="text-[#0ea5e9]">inbox</span>.
                </>
              ) : (
                <>
                  Forgot your <span className="text-[#FF5A1F]">password</span>?
                </>
              )}
            </h1>
            <p className="text-[0.95rem] leading-[1.5] text-[#64748B] max-w-[95%] mb-2">
              {sent
                ? "If an account exists for that address, we've sent a link to reset your password. The link expires in 1 hour."
                : "Enter the email you signed up with and we'll send you a link to set a new password."}
            </p>

            <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[16px] p-6 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.03),0_4px_12px_-4px_rgba(0,0,0,0.02)] flex flex-col gap-4 max-[480px]:p-4">
              {sent ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-3 rounded-[12px] bg-[#FAF9F6] border border-[rgba(0,0,0,0.08)] p-4">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#0ea5e9"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mt-0.5 shrink-0"
                    >
                      <path d="M4 4h16v16H4z" opacity="0" />
                      <path d="M22 6l-10 7L2 6" />
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                    </svg>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[0.85rem] text-[#111111]">
                        Sent to {email}
                      </span>
                      <span className="text-[0.78rem] text-[#64748B]">
                        Check your spam folder if it doesn&apos;t arrive.
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSent(false)}
                    className="w-full rounded-[10px] border border-[rgba(0,0,0,0.12)] bg-white text-[#1E293B] p-3 text-[0.92rem] font-normal cursor-pointer transition-all duration-200 ease-in-out hover:bg-[#FAF9F6] hover:border-[rgba(0,0,0,0.2)]"
                  >
                    Use a different email
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-[14px]">
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="email"
                      className="text-[0.75rem] font-normal text-[#64748b] uppercase tracking-[0.05em]"
                    >
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      autoFocus
                      placeholder="name@company.com"
                      className="w-full rounded-[10px] border border-[rgba(0,0,0,0.12)] py-3 px-4 text-[0.92rem] transition-all duration-200 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] bg-[#FAF9F6] text-[#1E293B] box-border focus:outline-none focus:border-[#FF5A1F] focus:shadow-[0_0_0_3px_rgba(255,90,31,0.12)] focus:bg-white"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-[10px] border-none bg-[#111111] text-white p-3.5 text-[0.95rem] font-normal cursor-pointer transition-all duration-200 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] flex justify-center items-center gap-2 hover:bg-[#222222] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] active:translate-y-0 disabled:bg-[#94A3B8] disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                  >
                    {loading ? "Sending link..." : "Send reset link"}
                  </button>
                </form>
              )}

              <div className="flex items-center justify-center gap-3 mt-2 pt-4 border-t border-[rgba(0,0,0,0.06)] text-[0.85rem]">
                <span className="text-[#64748B]">Remembered it?</span>
                <Link
                  href="/auth/sign-in"
                  className="px-4 py-1.5 bg-[#111111] hover:bg-[#FF5A1F] rounded-full text-white font-medium text-[0.8rem] transition-all duration-200 shadow-[0_2px_4px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(255,90,31,0.2)] hover:-translate-y-0.5 active:translate-y-0"
                  style={{ color: "#ffffff" }}
                >
                  Sign In
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
