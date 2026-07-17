"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

import "highlight.js/styles/github-dark.css";

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
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-5xl p-8">
        <h1 className="mb-2 text-5xl font-bold">OpenRouter Playground</h1>

        <p className="mb-8 text-zinc-400">Test your OpenRouter models.</p>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask anything..."
            rows={6}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-4 outline-none"
          />

          <button
            onClick={askAI}
            disabled={loading}
            className="mt-4 rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? "Thinking..." : "Generate"}
          </button>
        </div>

        <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900">
          <div className="border-b border-zinc-800 px-6 py-4 text-xl font-semibold">
            Response
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-zinc-400">Thinking...</div>
            ) : (
              <article className="prose prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    pre({ children }) {
                      return (
                        <div className="my-6 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950">
                          {children}
                        </div>
                      );
                    },

                    code({ className, children, ...props }) {
                      const inline = !className;

                      if (inline) {
                        return (
                          <code
                            className="rounded bg-zinc-800 px-1.5 py-0.5 text-pink-400"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      }

                      return (
                        <code
                          className={`${className} block overflow-x-auto p-4 text-sm`}
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },

                    h1: ({ children }) => (
                      <h1 className="mb-5 mt-8 text-4xl font-bold">
                        {children}
                      </h1>
                    ),

                    h2: ({ children }) => (
                      <h2 className="mb-4 mt-8 text-3xl font-semibold">
                        {children}
                      </h2>
                    ),

                    h3: ({ children }) => (
                      <h3 className="mb-3 mt-6 text-2xl font-semibold">
                        {children}
                      </h3>
                    ),

                    p: ({ children }) => (
                      <p className="my-4 leading-8 text-zinc-200">{children}</p>
                    ),

                    ul: ({ children }) => (
                      <ul className="my-4 list-disc space-y-2 pl-6">
                        {children}
                      </ul>
                    ),

                    ol: ({ children }) => (
                      <ol className="my-4 list-decimal space-y-2 pl-6">
                        {children}
                      </ol>
                    ),

                    blockquote: ({ children }) => (
                      <blockquote className="my-4 border-l-4 border-blue-500 pl-4 italic text-zinc-400">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {reply}
                </ReactMarkdown>
              </article>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
