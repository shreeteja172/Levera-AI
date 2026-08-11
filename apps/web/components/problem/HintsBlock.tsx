"use client";

import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronLeft, ChevronRight, Check } from "lucide-react";

interface HintsBlockProps {
  hints: {
    hint1?: string | null;
    hint2?: string | null;
    pattern?: string | null;
    pseudocode?: string | null;
  } | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  markdownComponents?: any;
  unlockedLevel: number;
  onUpdateUnlockedLevel: (level: number) => void;
}

const HINT_STEPS = [
  { id: 1, label: "Hint 1", type: "hint1" },
  { id: 2, label: "Hint 2", type: "hint2" },
  { id: 3, label: "Hint 3", type: "pattern" },
  { id: 4, label: "Solution", type: "pseudocode" },
] as const;

export function HintsBlock({
  hints,
  markdownComponents,
  unlockedLevel,
  onUpdateUnlockedLevel,
}: HintsBlockProps) {
  const [viewingLevel, setViewingLevel] = useState(Math.max(1, unlockedLevel));
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setViewingLevel(Math.max(1, unlockedLevel));
  }, [unlockedLevel]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      if (e.key.toLowerCase() === "h") {
        e.preventDefault();
        
        if (unlockedLevel < viewingLevel) {
          onUpdateUnlockedLevel(viewingLevel);
        } else if (viewingLevel < HINT_STEPS.length) {
          setViewingLevel((prev) => prev + 1);
          setExpanded(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [unlockedLevel, viewingLevel, onUpdateUnlockedLevel]);

  const defaultComponents = {
    code({
      className,
      children,
      ...props
    }: React.ComponentPropsWithoutRef<"code">) {
      const inline = !className;
      if (inline) {
        return (
          <code
            className="rounded bg-zinc-100 dark:bg-zinc-800/50 px-1.5 py-0.5 text-zinc-800 dark:text-zinc-300 font-mono text-[13px] before:content-none after:content-none"
            {...props}
          >
            {children}
          </code>
        );
      }
      return (
        <pre className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 overflow-x-auto text-[13px] font-mono text-zinc-800 dark:text-zinc-300 mt-2 mb-4">
          <code {...props}>{children}</code>
        </pre>
      );
    },
  };

  const componentsToUse = markdownComponents || defaultComponents;

  if (
    !hints ||
    (!hints.hint1 && !hints.hint2 && !hints.pattern && !hints.pseudocode)
  ) {
    return (
      <div className="w-full my-6 flex flex-col items-center justify-center p-8 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30">
        <Sparkles className="w-5 h-5 text-zinc-400 mb-3" />
        <p className="text-sm text-zinc-500 font-medium">
          Generate an AI hint for this problem.
        </p>
        <button className="mt-4 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm">
          Generate Hints
        </button>
      </div>
    );
  }

  const currentStep =
    HINT_STEPS.find((s) => s.id === viewingLevel) || HINT_STEPS[0];
  const isUnlocked = unlockedLevel >= viewingLevel;
  // @ts-ignore - dynamic key access
  const rawContent = hints[currentStep.type] || "";

  const content =
    currentStep.type === "pseudocode" &&
    rawContent &&
    !rawContent.includes("```")
      ? `\`\`\`pseudocode\n${rawContent}\n\`\`\``
      : rawContent;

  const handleNext = () => {
    if (viewingLevel < HINT_STEPS.length) {
      setViewingLevel((prev) => prev + 1);
      setExpanded(false);
    }
  };

  const handlePrev = () => {
    if (viewingLevel > 1) {
      setViewingLevel((prev) => prev - 1);
      setExpanded(false);
    }
  };

  const handleReveal = () => {
    if (unlockedLevel < viewingLevel) {
      onUpdateUnlockedLevel(viewingLevel);
    }
  };

  return (
    <div className="w-full my-6 flex flex-col gap-3 font-sans hint-block-ui">
      <style dangerouslySetInnerHTML={{ __html: `
        .hint-block-ui code, .hint-block-ui pre, .hint-block-ui kbd, .hint-block-ui code *, .hint-block-ui pre *, .hint-block-ui kbd * {
          font-family: var(--font-geist-mono), ui-monospace, monospace !important;
        }
      `}} />
      <div className="flex items-center justify-between px-1">
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300"
        >
          <span className="text-base">✨</span>
          <h3 className="text-sm font-semibold tracking-tight">AI Guidance</h3>
        </motion.div>
        <div className="flex items-center gap-2">
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-zinc-200 dark:border-zinc-700/80 bg-zinc-50 dark:bg-zinc-800 px-1.5 font-mono text-[10px] font-medium text-zinc-500 dark:text-zinc-300 shadow-sm">
            Press H
          </kbd>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative bg-white dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] overflow-hidden"
      >
        <div className="p-5 sm:p-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
              {HINT_STEPS.map((step) => {
                const isCompleted = unlockedLevel >= step.id;
                const isCurrent = viewingLevel === step.id;
                const isLocked =
                  !isCompleted && !isCurrent && unlockedLevel < step.id;

                return (
                  <button
                    key={step.id}
                    onClick={() => {
                      if (
                        isCompleted ||
                        isCurrent ||
                        unlockedLevel === step.id - 1
                      ) {
                        setViewingLevel(step.id);
                        setExpanded(false);
                      }
                    }}
                    disabled={isLocked && unlockedLevel !== step.id - 1}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all duration-300 whitespace-nowrap border ${
                      isCurrent
                        ? "bg-zinc-900 dark:bg-zinc-100 border-transparent text-white dark:text-zinc-900 shadow-sm"
                        : isCompleted
                        ? "bg-transparent border-zinc-200 dark:border-zinc-700/80 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                        : "bg-transparent border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed opacity-70"
                    }`}
                  >
                    {isCompleted && !isCurrent && (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    {step.label}
                  </button>
                );
              })}
            </div>

            <div className="min-h-[70px] flex flex-col justify-center mb-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`content-${viewingLevel}-${isUnlocked}`}
                  initial={{ opacity: 0, filter: "blur(4px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{
                    opacity: 0,
                    filter: "blur(4px)",
                    transition: { duration: 0.15 },
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {!isUnlocked ? (
                    <div className="flex flex-col items-start py-2 gap-3">
                      <p className="text-[15px] text-zinc-500 dark:text-zinc-500 font-medium">
                        {viewingLevel === HINT_STEPS.length
                          ? "Ready to see the optimal solution?"
                          : "Unlock this hint to continue your progress."}
                      </p>
                    </div>
                  ) : (
                    <div className="prose prose-zinc dark:prose-invert max-w-none text-[15px] leading-relaxed text-zinc-800 dark:text-zinc-200 font-medium tracking-tight">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={componentsToUse}
                      >
                        {content}
                      </ReactMarkdown>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {isUnlocked && (
              <div className="pt-3">
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors flex items-center gap-1.5 group"
                >
                  <span className="w-4 h-4 rounded-full bg-zinc-100 dark:bg-zinc-900 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-800 flex items-center justify-center text-[10px] transition-colors">
                    ?
                  </span>
                  Why?
                </button>
                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        duration: 0.3,
                        ease: [0.04, 0.62, 0.23, 0.98],
                      }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 pb-1 text-[14px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal">
                        This approach helps optimize our solution by focusing on
                        the underlying constraints. By identifying repeated work
                        or unnecessary iterations, we can often reduce the time
                        complexity significantly, moving closer to the optimal
                        O(N) or O(1) bounds.
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        <div className="bg-zinc-50/80 dark:bg-zinc-900/40 px-5 sm:px-6 py-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium font-mono tracking-tight">
            Hint {viewingLevel} of {HINT_STEPS.length}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={viewingLevel === 1}
              className="px-3 py-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 disabled:opacity-30 disabled:pointer-events-none transition-all duration-200 rounded-md text-xs font-semibold border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 bg-transparent"
            >
              Previous
            </button>

            {!isUnlocked ? (
              <button
                onClick={handleReveal}
                className="px-4 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-md text-xs font-semibold hover:-translate-y-[2px] hover:shadow-md transition-all duration-200"
              >
                {viewingLevel === HINT_STEPS.length
                  ? "Reveal Solution"
                  : "Reveal Hint"}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={viewingLevel === HINT_STEPS.length}
                className="px-4 py-1.5 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 rounded-md text-xs font-semibold hover:-translate-y-[2px] hover:shadow-sm disabled:opacity-50 disabled:pointer-events-none disabled:transform-none transition-all duration-200 shadow-sm"
              >
                Next Hint
              </button>
            )}
          </div>
        </div>
      </motion.div>

      <div className="flex flex-wrap items-center gap-2 px-1 mt-1">
        {["HashMap", "Sliding Window", "Two Pointers", "Binary Search"].map(
          (chip) => (
            <button
              key={chip}
              className="px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-[12px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-300 dark:hover:border-zinc-700 hover:scale-[1.03] hover:shadow-sm transition-all duration-200"
            >
              {chip}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
