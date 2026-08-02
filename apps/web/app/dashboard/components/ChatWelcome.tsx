import React from "react";
import { ArrowRight } from "lucide-react";

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
