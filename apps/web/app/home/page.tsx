"use client";

import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  async function askAI() {
    if (!message.trim()) return;

    setLoading(true);
    setReply("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setReply(data.error || "Something went wrong.");
      } else {
        setReply(data.reply);
      }
    } catch {
      setReply("Failed to contact the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col p-8">
        <h1 className="mb-2 text-5xl font-bold">
          OpenRouter AI Playground
        </h1>

        <p className="mb-8 text-slate-400">
          Test any OpenRouter model directly from your Next.js app.
        </p>

        <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-6 shadow-2xl">
          <label className="mb-3 block text-sm font-semibold text-slate-300">
            Prompt
          </label>

          <textarea
            rows={7}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask anything..."
            className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 p-4 text-white outline-none transition focus:border-blue-500"
          />

          <button
            onClick={askAI}
            disabled={loading}
            className="mt-5 rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Thinking..." : "Generate"}
          </button>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-900/60 shadow-2xl">
          <div className="border-b border-slate-700 px-6 py-4">
            <h2 className="text-xl font-semibold">
              AI Response
            </h2>
          </div>

          <div className="max-h-[600px] overflow-auto p-6">
            {loading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 w-2/3 rounded bg-slate-700" />
                <div className="h-4 w-full rounded bg-slate-700" />
                <div className="h-4 w-5/6 rounded bg-slate-700" />
                <div className="h-4 w-1/2 rounded bg-slate-700" />
              </div>
            ) : reply ? (
              <pre className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-100">
                {reply}
              </pre>
            ) : (
              <div className="py-16 text-center text-slate-500">
                Your AI response will appear here.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}