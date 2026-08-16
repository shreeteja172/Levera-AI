"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { resetPassword } from "@/lib/auth-client";
import AuthIllustration from "../AuthIllustration";

const MIN_LENGTH = 8;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const linkError = searchParams.get("error");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const invalidLink = !token || linkError;
  const mismatch = confirm.length > 0 && password !== confirm;
  const tooShort = password.length > 0 && password.length < MIN_LENGTH;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (password.length < MIN_LENGTH) {
      toast.error(`Password must be at least ${MIN_LENGTH} characters`);
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords don't match");
      return;
    }
    try {
      setLoading(true);
      await resetPassword(password, token);
      toast.success("Password updated. You can sign in now.");
      router.push("/auth/sign-in");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to reset password"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="text-[2.15rem] leading-[1.15] font-normal text-[#111111] tracking-[-0.03em] max-[480px]:text-[1.75rem] desktop-short:text-[1.85rem]">
        {invalidLink ? (
          <>
            This link has <span className="text-[#FF5A1F]">expired</span>.
          </>
        ) : (
          <>
            Choose a new <span className="text-[#0ea5e9]">password</span>.
          </>
        )}
      </h1>
      <p className="text-[0.95rem] leading-[1.5] text-[#64748B] max-w-[95%] mb-2">
        {invalidLink
          ? "Reset links are valid for one hour and can only be used once. Request a fresh one to continue."
          : `Pick something at least ${MIN_LENGTH} characters long. You'll use it to sign in from now on.`}
      </p>

      <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[16px] p-6 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.03),0_4px_12px_-4px_rgba(0,0,0,0.02)] flex flex-col gap-4 max-[480px]:p-4">
        {invalidLink ? (
          <Link
            href="/auth/forgot-password"
            className="w-full text-center rounded-[10px] border-none bg-[#111111] text-white! p-3.5 text-[0.95rem] font-normal transition-all duration-200 hover:bg-[#222222] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
          >
            Request a new link
          </Link>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-[14px]">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-[0.75rem] font-normal text-[#64748b] uppercase tracking-[0.05em]"
              >
                New Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoFocus
                placeholder="••••••••"
                className="w-full rounded-[10px] border border-[rgba(0,0,0,0.12)] py-3 px-4 text-[0.92rem] transition-all duration-200 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] bg-[#FAF9F6] text-[#1E293B] box-border focus:outline-none focus:border-[#FF5A1F] focus:shadow-[0_0_0_3px_rgba(255,90,31,0.12)] focus:bg-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {tooShort && (
                <span className="text-[0.75rem] text-[#DC2626]">
                  At least {MIN_LENGTH} characters
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="confirm"
                className="text-[0.75rem] font-normal text-[#64748b] uppercase tracking-[0.05em]"
              >
                Confirm Password
              </label>
              <input
                id="confirm"
                type="password"
                required
                placeholder="••••••••"
                className="w-full rounded-[10px] border border-[rgba(0,0,0,0.12)] py-3 px-4 text-[0.92rem] transition-all duration-200 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] bg-[#FAF9F6] text-[#1E293B] box-border focus:outline-none focus:border-[#FF5A1F] focus:shadow-[0_0_0_3px_rgba(255,90,31,0.12)] focus:bg-white"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              {mismatch && (
                <span className="text-[0.75rem] text-[#DC2626]">
                  Passwords don&apos;t match
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-[10px] border-none bg-[#111111] text-white p-3.5 text-[0.95rem] font-normal cursor-pointer transition-all duration-200 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] flex justify-center items-center gap-2 hover:bg-[#222222] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] active:translate-y-0 disabled:bg-[#94A3B8] disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              {loading ? "Updating password..." : "Update password"}
            </button>
          </form>
        )}

        <div className="flex items-center justify-center gap-3 mt-2 pt-4 border-t border-[rgba(0,0,0,0.06)] text-[0.85rem]">
          <span className="text-[#64748B]">Back to</span>
          <Link
            href="/auth/sign-in"
            className="px-4 py-1.5 bg-[#111111] hover:bg-[#FF5A1F] rounded-full text-white font-medium text-[0.8rem] transition-all duration-200 shadow-[0_2px_4px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(255,90,31,0.2)] hover:-translate-y-0.5 active:translate-y-0"
            style={{ color: "#ffffff" }}
          >
            Sign In
          </Link>
        </div>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex justify-center items-center bg-[#EAE7DF] p-6 min-h-screen box-border font-sans max-[480px]:p-3 relative">
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
            <Suspense
              fallback={
                <div className="h-[300px] flex items-center text-[0.9rem] text-[#64748B]">
                  Loading...
                </div>
              }
            >
              <ResetPasswordForm />
            </Suspense>
          </div>
        </section>

        <AuthIllustration variant="binary-search" />
      </div>
    </main>
  );
}
