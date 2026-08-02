import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check } from "lucide-react";
import { SkeletonBlock } from "@/components/ui/skeleton-block";
import {
  parseMessageContent,
  extractProblemData,
  createSlug,
} from "@/lib/chat-utils";
import { SolutionsBlock } from "./SolutionsBlock";

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
  if (!mounted || sessionPending || chatLoading) {
    if (chatId) {
      return (
        <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
          <div className="flex flex-col items-end">
            <div className="flex items-start gap-3 max-w-[85%]">
              <div className="flex flex-col items-end gap-2 bg-zinc-900 border border-zinc-850 rounded-2xl rounded-br-none px-5 py-3.5 w-64">
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
              <div className="flex-1 space-y-2.5 bg-zinc-900/20 border border-zinc-900 rounded-2xl rounded-bl-none p-5">
                <SkeletonBlock width="80%" height="14px" rounded="rounded-md" />
                <SkeletonBlock width="95%" height="14px" rounded="rounded-md" />
                <SkeletonBlock width="45%" height="14px" rounded="rounded-md" />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <div className="flex items-start gap-3 max-w-[85%]">
              <div className="flex flex-col items-end gap-2 bg-zinc-900 border border-zinc-850 rounded-2xl rounded-br-none px-5 py-3.5 w-80">
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
        <div className="max-w-2xl mx-auto h-full flex flex-col justify-center items-center text-center space-y-6 py-12 animate-pulse">
          <div className="space-y-3 flex flex-col items-center">
            <SkeletonBlock
              width="320px"
              height="40px"
              rounded="rounded-lg"
              className="bg-zinc-800"
            />
            <SkeletonBlock
              width="440px"
              height="16px"
              rounded="rounded-lg"
              className="bg-zinc-800/60"
            />
          </div>

          <div className="w-full max-w-3xl">
            <div className="w-full h-24 bg-zinc-900/50 border border-zinc-850 rounded-2xl p-4 flex flex-col justify-between">
              <SkeletonBlock
                width="40%"
                height="14px"
                rounded="rounded-md"
                className="bg-zinc-800"
              />
              <div className="flex justify-between items-center pt-2 border-t border-zinc-850/50">
                <SkeletonBlock
                  width="120px"
                  height="24px"
                  rounded="rounded-lg"
                  className="bg-zinc-800"
                />
                <div className="w-9 h-9 rounded-xl bg-zinc-850" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl pt-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 rounded-xl border border-zinc-900 bg-zinc-900/10 h-12"
              >
                <SkeletonBlock
                  width="75%"
                  height="12px"
                  rounded="rounded-md"
                  className="bg-zinc-800/60"
                />
                <div className="w-3.5 h-3.5 rounded bg-zinc-800 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      );
    }
  }

  if (chatError) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`flex flex-col ${
            msg.role === "user" ? "items-end" : "items-start"
          }`}
        >
          <div
            className={`rounded-2xl px-5 py-3.5 text-sm ${
              msg.role === "user"
                ? "max-w-[85%] bg-zinc-900 border border-zinc-850 text-white rounded-br-none"
                : "w-full max-w-none bg-zinc-900/40 border border-zinc-900 text-zinc-100 rounded-bl-none prose prose-invert prose-sm"
            }`}
          >
            {msg.role === "assistant" ? (
              <div className="space-y-4 w-full">
                {parseMessageContent(msg.content).map((part, partIdx) => {
                  if (part.type === "text") {
                    return (
                      <ReactMarkdown
                        key={partIdx}
                        remarkPlugins={[remarkGfm]}
                        components={markdownComponents}
                      >
                        {part.text}
                      </ReactMarkdown>
                    );
                  } else {
                    return (
                      <SolutionsBlock
                        key={partIdx}
                        part={part}
                        markdownComponents={markdownComponents}
                      />
                    );
                  }
                })}
              </div>
            ) : (
              <div className="whitespace-pre-wrap">{msg.content}</div>
            )}
          </div>

          {msg.role === "assistant" &&
            msg.content.includes("<solutions>") &&
            (() => {
              const problemData = extractProblemData(msg.content);
              const title =
                problemData.title === "Unknown Problem" && chatTitle
                  ? chatTitle
                  : problemData.title;
              const slug = createSlug(title);
              const isSaved = savedProblemSlugs.includes(slug);
              return (
                <button
                  onClick={() => !isSaved && onSaveProblem(msg.content)}
                  disabled={isSaved}
                  className={`mt-2.5 text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
                    isSaved
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 cursor-default font-medium"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 hover:bg-zinc-850 cursor-pointer"
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

          <span className="text-[10px] text-zinc-600 mt-1 px-1.5 uppercase font-medium">
            {msg.role === "user" ? "You" : "Levera AI"}
          </span>
        </div>
      ))}

      {isThinking && (
        <div className="flex flex-col items-start">
          <div className="rounded-2xl rounded-bl-none px-5 py-3.5 bg-zinc-900/40 border border-zinc-900 flex items-center gap-2">
            <div
              className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
          <span className="text-[10px] text-zinc-600 mt-1 px-1.5 uppercase font-medium">
            {thinkingWord}
          </span>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
