import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Check } from "lucide-react";
import { SkeletonBlock } from "@/components/ui/skeleton-block";
import { useSession } from "@/lib/auth-client";
import {
  parseMessageContent,
  extractProblemData,
  createSlug,
} from "@/lib/chat-utils";
import { SolutionsBlock } from "./SolutionsBlock";
import { HintsBlock } from "@/components/problem/HintsBlock";

function LeveraMark() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-[#FF5A1F]"
      aria-hidden="true"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
}

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  chatLoading: boolean;
  chatError: string | null;
  sessionPending: boolean;
  mounted: boolean;
  chatId: string | null;
  isThinking: boolean;
  thinkingWord: string;
  chatTitle: string | null;
  savedProblemSlugs: string[];
  onSaveProblem: (content: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  markdownComponents: any;
}

export function MessageList({
  messages,
  loading,
  chatLoading,
  chatError,
  sessionPending,
  mounted,
  chatId,
  isThinking,
  thinkingWord,
  chatTitle,
  savedProblemSlugs,
  onSaveProblem,
  messagesEndRef,
  markdownComponents,
}: MessageListProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id || "guest";

  const [hintProgressMap, setHintProgressMap] = useState<
    Record<string, { unlockedLevel: number; revealedLevel: number }>
  >({});

  useEffect(() => {
    if (!userId || userId === "guest") return;

    const fetchProgress = async () => {
      const foundSlugs: string[] = [];
      messages.forEach((msg) => {
        if (msg.role === "assistant") {
          const problemData = extractProblemData(msg.content);
          if (problemData.title && problemData.title !== "Unknown Problem") {
            const slug = createSlug(problemData.title);
            if (!foundSlugs.includes(slug)) {
              foundSlugs.push(slug);
            }
          }
        }
      });

      const slugsToFetch = foundSlugs.filter(
        (slug) => hintProgressMap[slug] === undefined,
      );

      if (slugsToFetch.length === 0) return;

      setHintProgressMap((prev) => {
        const next = { ...prev };
        slugsToFetch.forEach((slug) => {
          next[slug] = { unlockedLevel: 0, revealedLevel: 0 };
        });
        return next;
      });

      const updates: Record<
        string,
        { unlockedLevel: number; revealedLevel: number }
      > = {};
      await Promise.all(
        slugsToFetch.map(async (slug) => {
          try {
            const res = await fetch(`/api/hints/progress?slug=${slug}`);
            if (res.ok) {
              const data = await res.json();
              updates[slug] = data;
            }
          } catch (e) {
            console.error("Failed to load progress for slug", slug, e);
          }
        }),
      );

      if (Object.keys(updates).length > 0) {
        setHintProgressMap((prev) => ({ ...prev, ...updates }));
      }
    };

    fetchProgress();
  }, [messages, userId]);

  const handleUpdateProgress = async (
    slug: string,
    unlockedLevel: number,
    revealedLevel: number,
  ) => {
    setHintProgressMap((prev) => ({
      ...prev,
      [slug]: { unlockedLevel, revealedLevel },
    }));

    try {
      await fetch("/api/hints/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          problemSlug: slug,
          unlockedLevel,
          revealedLevel,
        }),
      });
    } catch (e) {
      console.error("Failed to sync progress to server:", e);
    }
  };

  if (!mounted || sessionPending || chatLoading) {
    if (chatId) {
      return (
        <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
          <div className="flex flex-col items-end">
            <div className="flex items-start gap-3 max-w-[85%]">
              <div className="flex flex-col items-end gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl px-5 py-3.5 w-64">
                <SkeletonBlock
                  width="100%"
                  height="14px"
                  rounded="rounded-md"
                />
                <SkeletonBlock width="60%" height="14px" rounded="rounded-md" />
              </div>
              <SkeletonBlock
                width="32px"
                height="32px"
                rounded="rounded-full"
                className="shrink-0"
              />
            </div>
          </div>

          <div className="flex flex-col items-start w-full">
            <div className="flex items-start gap-3 w-full">
              <SkeletonBlock
                width="32px"
                height="32px"
                rounded="rounded-full"
                className="shrink-0"
              />
              <div className="flex-1 space-y-2.5 bg-zinc-100/40 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-900 rounded-2xl rounded-bl-none p-5">
                <SkeletonBlock width="80%" height="14px" rounded="rounded-md" />
                <SkeletonBlock width="95%" height="14px" rounded="rounded-md" />
                <SkeletonBlock width="45%" height="14px" rounded="rounded-md" />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <div className="flex items-start gap-3 max-w-[85%]">
              <div className="flex flex-col items-end gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl px-5 py-3.5 w-80">
                <SkeletonBlock
                  width="100%"
                  height="14px"
                  rounded="rounded-md"
                />
                <SkeletonBlock width="40%" height="14px" rounded="rounded-md" />
              </div>
              <SkeletonBlock
                width="32px"
                height="32px"
                rounded="rounded-full"
                className="shrink-0"
              />
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="max-w-3xl mx-auto min-h-full flex flex-col justify-center items-center py-8 animate-pulse">
          <div className="w-full flex flex-col items-center gap-3 mb-10">
            <SkeletonBlock
              width="min(340px, 70%)"
              height="44px"
              rounded="rounded-lg"
              className="bg-zinc-200 dark:bg-zinc-800"
            />
            <SkeletonBlock
              width="min(300px, 60%)"
              height="16px"
              rounded="rounded-lg"
              className="bg-zinc-200/60 dark:bg-zinc-800/60"
            />
          </div>

          <div className="w-full h-[104px] bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 rounded-2xl p-4 flex flex-col justify-between">
            <SkeletonBlock
              width="40%"
              height="14px"
              rounded="rounded-md"
              className="bg-zinc-200 dark:bg-zinc-800"
            />
            <div className="flex justify-between items-center pt-2 border-t border-zinc-200/50 dark:border-white/10">
              <SkeletonBlock
                width="120px"
                height="24px"
                rounded="rounded-lg"
                className="bg-zinc-200 dark:bg-zinc-800"
              />
              <div className="w-9 h-9 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </div>

          <div className="w-full mt-10">
            <div className="flex items-center gap-4 mb-3.5">
              <SkeletonBlock
                width="72px"
                height="10px"
                rounded="rounded"
                className="bg-zinc-200/60 dark:bg-zinc-800/60"
              />
              <div className="h-px flex-1 bg-zinc-200 dark:bg-white/10" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-2.5 px-4 py-3.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50/60 dark:bg-white/[0.02]"
                >
                  <div className="flex items-center justify-between w-full">
                    <SkeletonBlock
                      width="64px"
                      height="10px"
                      rounded="rounded"
                      className="bg-zinc-200/60 dark:bg-zinc-800/60"
                    />
                    <div className="w-3.5 h-3.5 rounded bg-zinc-200 dark:bg-zinc-800 shrink-0" />
                  </div>
                  <SkeletonBlock
                    width={i % 2 === 0 ? "85%" : "70%"}
                    height="13px"
                    rounded="rounded-md"
                    className="bg-zinc-200/60 dark:bg-zinc-800/60"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
  }

  if (chatError) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col items-start pt-10">
        <h2 className="font-instrument text-2xl tracking-tight text-zinc-900 dark:text-white mb-3">
          We couldn&apos;t load this conversation.
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6 max-w-md">
          {chatError} Your messages are still saved — try reloading, or start a
          new chat below.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black text-sm transition-transform duration-300 hover:-translate-y-0.5 cursor-pointer"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {messages.map((msg, index) => {
        if (
          index === messages.length - 1 &&
          msg.role === "assistant" &&
          isThinking
        ) {
          return null;
        }

        return (
          <div
            key={index}
            className={`flex flex-col ${
              msg.role === "user" ? "items-end" : "items-start"
            }`}
          >
            <span className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-600 mb-2 px-1">
              {msg.role === "assistant" && <LeveraMark />}
              {msg.role === "user" ? "You" : "Levera AI"}
            </span>

            <div
              className={
                msg.role === "user"
                  ? "max-w-[80%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100"
                  : "w-full text-zinc-900 dark:text-zinc-100 prose prose-base dark:prose-invert max-w-none"
              }
            >
              {msg.role === "assistant" ? (
                <div className="space-y-4 w-full">
                  {(() => {
                    const problemData = extractProblemData(msg.content);
                    const title = problemData.title;

                    const slug =
                      title === "Unknown Problem"
                        ? `unmatched-${chatId ?? "local"}-${index}`
                        : createSlug(title);

                    const hasHints =
                      !!problemData.hints &&
                      (!!problemData.hints.hint1 ||
                        !!problemData.hints.hint2 ||
                        !!problemData.hints.pattern ||
                        !!problemData.hints.pseudocode);
                    const progress = hintProgressMap[slug] || {
                      unlockedLevel: 0,
                      revealedLevel: 0,
                    };
                    const parts = parseMessageContent(msg.content);
                    const solutionsStarted =
                      msg.content.includes("<solutions>") ||
                      msg.content.includes("<brute>") ||
                      msg.content.includes("<better>") ||
                      msg.content.includes("<optimal>");
                    const isLastMessage = index === messages.length - 1;

                    return (
                      <div className="space-y-2">
                        {parts.map((part, partIdx) => {
                          if (part.type === "text") {
                            return (
                              <ReactMarkdown
                                key={partIdx}
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeRaw]}
                                components={markdownComponents}
                              >
                                {part.text}
                              </ReactMarkdown>
                            );
                          } else if (part.type === "hints") {
                            return (
                              <HintsBlock
                                key={partIdx}
                                hints={problemData.hints}
                                markdownComponents={markdownComponents}
                                unlockedLevel={progress.unlockedLevel}
                                onUpdateUnlockedLevel={(lvl) =>
                                  handleUpdateProgress(
                                    slug,
                                    lvl,
                                    progress.revealedLevel,
                                  )
                                }
                              />
                            );
                          } else {
                            return (
                              <SolutionsBlock
                                key={partIdx}
                                part={part}
                                markdownComponents={markdownComponents}
                                hasHints={hasHints}
                                revealedLevel={progress.revealedLevel}
                                onUpdateRevealedLevel={(lvl) =>
                                  handleUpdateProgress(
                                    slug,
                                    progress.unlockedLevel,
                                    lvl,
                                  )
                                }
                              />
                            );
                          }
                        })}

                        {hasHints &&
                          !solutionsStarted &&
                          isLastMessage &&
                          chatLoading && (
                            <div className="w-full my-6 bg-[#001524]/5 dark:bg-[#001524]/20 border border-[#15616d]/20 rounded-2xl p-5 space-y-4 animate-pulse">
                              <div className="flex items-center gap-2">
                                <div className="h-4 w-4 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
                                <div className="h-3 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
                              </div>
                              <div className="h-24 bg-zinc-100/60 dark:bg-zinc-900/40 rounded-xl flex items-center justify-center">
                                <span className="text-[10px] text-zinc-500 tracking-wider uppercase animate-pulse">
                                  AI is formulating solutions approaches...
                                </span>
                              </div>
                            </div>
                          )}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="whitespace-pre-wrap">{msg.content}</div>
              )}
            </div>

            {msg.role === "assistant" &&
              msg.content.includes("<solutions>") &&
              (() => {
                const problemData = extractProblemData(msg.content);
                if (problemData.title === "Unknown Problem") return null;
                const title = problemData.title;
                const slug = createSlug(title);
                const isSaved = savedProblemSlugs.includes(slug);
                return (
                  <button
                    onClick={() => !isSaved && onSaveProblem(msg.content)}
                    disabled={isSaved}
                    className={`mt-2.5 text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
                      isSaved
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 cursor-default font-medium"
                        : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
                    }`}
                  >
                    {isSaved ? (
                      <>
                        <Check size={12} className="text-emerald-400" />
                        <span>Saved to Problems</span>
                      </>
                    ) : (
                      <span>Save as Problem</span>
                    )}
                  </button>
                );
              })()}

          </div>
        );
      })}

      {isThinking && (
        <div className="flex flex-col items-start">
          <span className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-600 mb-2 px-1">
            <LeveraMark />
            Levera AI
          </span>
          <div className="flex items-center gap-2.5 px-1">
            <div className="flex items-center gap-1">
              {[0, 150, 300].map((delay) => (
                <div
                  key={delay}
                  className="w-1.5 h-1.5 bg-[#FF5A1F] rounded-full animate-bounce"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-500">
              {thinkingWord}
            </span>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
