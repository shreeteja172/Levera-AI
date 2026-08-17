import React from "react";
import { ArrowRight } from "lucide-react";

const SUGGESTIONS = [
  { kicker: "Concept", prompt: "Explain the intuition behind Binary Search" },
  {
    kicker: "Complexity",
    prompt: "How do I analyze time complexity of Recursion?",
  },
  { kicker: "Code", prompt: "Provide optimal C++ solution for Two Sum" },
  { kicker: "Compare", prompt: "Explain how a stack differs from a queue" },
];

interface ChatWelcomeProps {
  greeting: string;
  displayName: string;
  renderChatInput: (className?: string) => React.ReactNode;
  onSelectSuggestion: (suggestion: string) => void;
}

export function ChatWelcome({
  greeting,
  displayName,
  renderChatInput,
  onSelectSuggestion,
}: ChatWelcomeProps) {
  return (
    <div className="max-w-3xl mx-auto min-h-full flex flex-col justify-center items-center py-8 animate-in fade-in duration-300">
      <div className="w-full flex flex-col items-center text-center gap-3 mb-10">
        <h1 className="font-instrument text-4xl md:text-5xl tracking-tight text-zinc-900 dark:text-zinc-100">
          {greeting}, {displayName}.
        </h1>
        <p className="text-[15px] text-zinc-500 dark:text-zinc-400 max-w-md">
          Ask about a concept, paste a problem, or start from one of these.
        </p>
      </div>

      <div className="w-full">{renderChatInput("max-w-3xl")}</div>

      <div className="w-full mt-10">
        <div className="flex items-center gap-4 mb-3.5">
          <span className="text-[11px] tracking-[0.18em] uppercase text-zinc-500 dark:text-zinc-500 shrink-0">
            Start with
          </span>
          <div className="h-px flex-1 bg-zinc-200 dark:bg-white/10" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {SUGGESTIONS.map(({ kicker, prompt }) => (
            <button
              key={prompt}
              onClick={() => onSelectSuggestion(prompt)}
              className="group flex flex-col gap-2.5 px-4 py-3.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50/60 dark:bg-white/[0.02] hover:bg-white dark:hover:bg-white/[0.04] hover:border-zinc-300 dark:hover:border-white/20 text-left transition-colors duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] tracking-[0.18em] uppercase text-zinc-500 dark:text-zinc-500 group-hover:text-[#FF5A1F] transition-colors duration-200">
                  {kicker}
                </span>
                <ArrowRight
                  size={14}
                  className="shrink-0 text-zinc-300 dark:text-zinc-600 group-hover:text-[#FF5A1F] group-hover:translate-x-0.5 transition-all duration-200"
                />
              </div>
              <span className="text-sm leading-snug text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors duration-200">
                {prompt}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
