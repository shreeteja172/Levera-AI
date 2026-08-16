"use client";

export default function AuthRedirectOverlay({
  label = "Preparing your workspace",
}: {
  label?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[100] bg-[#EAE7DF] flex flex-col items-center justify-center gap-8"
    >
      <div className="flex items-center gap-[10px] text-[1.35rem] text-[#1A1A1A] tracking-[-0.02em]">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[#FF5A1F]"
          aria-hidden="true"
        >
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
          <circle cx="12" cy="12" r="2.5" fill="currentColor" />
        </svg>
        <span>Levera</span>
      </div>

      <div className="flex flex-col items-center gap-5">
        <span
          className="w-6 h-6 rounded-full border-2 border-[rgba(0,0,0,0.12)] border-t-[#FF5A1F] animate-spin"
          aria-hidden="true"
        />
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#64748B]">
          {label}
        </span>
      </div>
    </div>
  );
}
