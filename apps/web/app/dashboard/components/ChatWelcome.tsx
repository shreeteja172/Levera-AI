import React from "react";
import { ArrowRight } from "lucide-react";

interface ChatWelcomeProps {
  greeting: string;
  displayName: string;
  renderChatInput: (className?: string) => React.ReactNode;
  reviewStats: {
    due: number;
    completed: number;
    nextDueProblemId: string | null;
    streak: number;
    totalReviewed: number;
  } | null;
  onStartReview: (id: string) => void;
  onSelectSuggestion: (suggestion: string) => void;
}

export function ChatWelcome({
  greeting,
  displayName,
  renderChatInput,
  reviewStats,
  onStartReview,
  onSelectSuggestion,
}: ChatWelcomeProps) {
  return (
    <div className="max-w-2xl mx-auto h-full flex flex-col justify-center items-center text-center space-y-6 py-12 animate-in fade-in duration-300">
      <div className="space-y-3">
        <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-zinc-100">
          {greeting}, {displayName}.
        </h1>
        <p className="text-sm text-zinc-400 max-w-md mx-auto">
          How can Levera AI help you today? Ask about DSA concepts, code solutions, or complexity analysis.
        </p>
      </div>

      <div className="w-full">{renderChatInput("max-w-3xl")}</div>

      {reviewStats && (
        <div className="w-full max-w-xl bg-zinc-900/40 border border-zinc-900 rounded-2xl p-5 text-left space-y-4 shadow-lg backdrop-blur-sm transition-all">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-1.5">
                Today's Reviews
              </h3>
              <p className="text-xs text-zinc-500">
                {reviewStats.due > 0
                  ? `${reviewStats.due} ${reviewStats.due === 1 ? "problem" : "problems"} due`
                  : "All caught up for today!"}
                {reviewStats.streak > 0 && ` • ${reviewStats.streak} day streak`}
              </p>
            </div>

            {reviewStats.due > 0 && reviewStats.nextDueProblemId && (
              <button
                onClick={() => onStartReview(reviewStats.nextDueProblemId!)}
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs transition-all shadow-md cursor-pointer flex items-center gap-1"
              >
                Start Review <ArrowRight size={12} />
              </button>
            )}
          </div>

          <div className="space-y-2">
            <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-900">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    reviewStats.due + reviewStats.completed > 0
                      ? (reviewStats.completed / (reviewStats.due + reviewStats.completed)) * 100
                      : 100
                  }%`,
                }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono font-semibold">
              <span>
                {reviewStats.completed} / {reviewStats.due + reviewStats.completed} completed today
              </span>
              {reviewStats.totalReviewed > 0 && (
                <span>{reviewStats.totalReviewed} total reviews</span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl pt-2">
        {[
          "Explain the intuition behind Binary Search",
          "How do I analyze time complexity of Recursion?",
          "Provide optimal C++ solution for Two Sum",
          "Explain how a stack differs from a queue",
        ].map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onSelectSuggestion(suggestion)}
            className="flex items-center justify-between p-4 rounded-xl border border-zinc-900 bg-zinc-900/30 hover:bg-zinc-900/60 hover:border-zinc-800 text-left text-xs text-zinc-300 transition-all duration-200 cursor-pointer"
          >
            <span>{suggestion}</span>
            <ArrowRight
              size={14}
              className="text-zinc-600 group-hover:text-zinc-400 shrink-0 ml-2"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
