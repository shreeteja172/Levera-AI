"use client";

import Link from "next/link";
import { MessageSquare, History } from "lucide-react";

export default function ChatNotFound() {
  return (
    <main className="min-h-dvh bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-lg flex flex-col items-start">
        <div className="flex items-center gap-2 mb-8 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-xs text-zinc-500">
          <MessageSquare size={13} className="shrink-0 text-zinc-400" />
          <span>chats.find(id)</span>
          <span className="text-[#FF5A1F]">undefined</span>
        </div>

        <h1 className="font-instrument text-[clamp(1.9rem,4.5vw,2.75rem)] leading-[1.1] tracking-tight text-zinc-900 dark:text-white mb-4">
          This conversation isn&apos;t here.
        </h1>

        <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed mb-10">
          It was probably deleted, or the link belongs to a different account.
          Your other conversations are untouched.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link
            href="/dashboard"
            className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white! dark:text-black! text-sm transition-transform duration-300 hover:-translate-y-0.5"
          >
            <MessageSquare size={16} />
            Start a new chat
          </Link>

          <Link
            href="/dashboard/recent-chats"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/25 text-zinc-600! dark:text-zinc-300! text-sm transition-colors"
          >
            <History size={16} />
            Recent chats
          </Link>
        </div>
      </div>
    </main>
  );
}
