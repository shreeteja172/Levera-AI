"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Lock,
  HelpCircle,
  Lightbulb,
  GitMerge,
  FileCode,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

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

export function HintsBlock({
  hints,
  markdownComponents,
  unlockedLevel,
  onUpdateUnlockedLevel,
}: HintsBlockProps) {
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
            className="rounded bg-zinc-900/85 px-1.5 py-0.5 text-orange-400 font-mono text-[11px] before:content-none after:content-none"
            {...props}
          >
            {children}
          </code>
        );
      }
      return (
        <pre className="bg-zinc-950 border border-zinc-900 rounded-xl p-3.5 overflow-x-auto text-[11px] font-mono text-zinc-300">
          <code {...props}>{children}</code>
        </pre>
      );
    }
  };

  const componentsToUse = markdownComponents || defaultComponents;

  const steps = [
    {
      id: 1,
      name: "Hint 1 (Direction)",
      icon: HelpCircle,
      content: hints?.hint1,
      color: "from-blue-500/10 via-blue-500/5 to-transparent",
      borderColor: "border-blue-500/20",
      glowColor: "group-hover:border-blue-500/40",
      textColor: "text-blue-400",
    },
    {
      id: 2,
      name: "Hint 2 (Observation)",
      icon: Lightbulb,
      content: hints?.hint2,
      color: "from-cyan-500/10 via-cyan-500/5 to-transparent",
      borderColor: "border-cyan-500/20",
      glowColor: "group-hover:border-cyan-500/40",
      textColor: "text-cyan-400",
    },
    {
      id: 3,
      name: "Algorithmic Pattern",
      icon: GitMerge,
      content: hints?.pattern,
      color: "from-amber-500/10 via-amber-500/5 to-transparent",
      borderColor: "border-amber-500/20",
      glowColor: "group-hover:border-amber-500/40",
      textColor: "text-amber-400",
    },
    {
      id: 4,
      name: "Optimal Pseudocode",
      icon: FileCode,
      content: hints?.pseudocode,
      color: "from-emerald-500/10 via-emerald-500/5 to-transparent",
      borderColor: "border-emerald-500/20",
      glowColor: "group-hover:border-emerald-500/40",
      textColor: "text-emerald-400",
      isCode: true,
    },
  ].filter((step) => !!step.content);

  const updateUnlockLevel = (level: number) => {
    onUpdateUnlockedLevel(level);
  };

  const handleUnlockNext = () => {
    if (unlockedLevel < steps.length) {
      updateUnlockLevel(unlockedLevel + 1);
    }
  };

  const handleRevealAll = () => {
    updateUnlockLevel(steps.length);
  };

  if (!hints || steps.length === 0) return null;

  return (
    <div className="w-full my-6 bg-zinc-950/20 border border-zinc-900 rounded-2xl p-5 md:p-6 backdrop-blur-sm shadow-2xl relative overflow-hidden animate-in fade-in duration-300">

      <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
          <h3 className="text-xs font-black tracking-widest text-zinc-400 uppercase font-mono">
            Progressive Clues
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {unlockedLevel < steps.length && (
            <button
              onClick={handleRevealAll}
              className="text-[10px] font-bold text-zinc-500 hover:text-zinc-350 px-2 py-1 rounded bg-zinc-900 border border-zinc-850 hover:border-zinc-800 transition-all cursor-pointer font-mono"
            >
              Reveal All
            </button>
          )}
          <span className="text-[10px] text-zinc-500 font-mono bg-zinc-900 px-2 py-0.5 rounded border border-zinc-850">
            {unlockedLevel} / {steps.length} Unlocked
          </span>
        </div>
      </div>

      <div className="relative ml-3.5 pl-6 space-y-6">
        <div className="absolute left-[3px] top-4 bottom-4 w-px bg-zinc-900" />
        <div
          className="absolute left-[3px] top-4 w-px bg-gradient-to-b from-orange-500 to-amber-500 transition-all duration-700 ease-out"
          style={{
            height:
              unlockedLevel === 0
                ? "0%"
                : unlockedLevel >= steps.length
                  ? "calc(100% - 32px)"
                  : `${((unlockedLevel - 0.5) / (steps.length - 1)) * 90}%`,
          }}
        />

        {steps.map((step, idx) => {
          const isUnlocked = unlockedLevel >= step.id;
          const isCurrent = unlockedLevel === step.id - 1;
          const Icon = step.icon;

          return (
            <div key={step.id} className="relative group">
              <div
                className={`absolute -left-[35px] top-1.5 flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-500 ${
                  isUnlocked
                    ? "bg-zinc-950 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/20"
                    : isCurrent
                      ? "bg-zinc-900 border-orange-500/50 text-orange-500 animate-pulse scale-105"
                      : "bg-zinc-950 border-zinc-900 text-zinc-700"
                }`}
              >
                {isUnlocked ? (
                  <CheckCircle2 size={12} className="stroke-[2.5]" />
                ) : (
                  <span className="text-[9px] font-bold font-mono">{step.id}</span>
                )}
              </div>

              <div
                className={`rounded-xl border p-4 transition-all duration-300 backdrop-blur-sm ${
                  isUnlocked
                    ? `bg-gradient-to-br ${step.color} ${step.borderColor} ${step.glowColor} text-zinc-200 shadow-lg shadow-black/10`
                    : isCurrent
                      ? "bg-zinc-900/40 border-zinc-850 hover:border-zinc-800 text-zinc-400 cursor-pointer hover:shadow-md hover:shadow-black/5"
                      : "bg-zinc-950/20 border-zinc-900/50 text-zinc-650 opacity-40 pointer-events-none select-none"
                }`}
                onClick={isCurrent ? handleUnlockNext : undefined}
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <Icon
                      size={15}
                      className={isUnlocked ? step.textColor : "text-zinc-500"}
                    />
                    <span
                      className={`text-[11px] font-bold tracking-wider uppercase font-mono ${
                        isUnlocked ? "text-zinc-200" : "text-zinc-550"
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>

                  {!isUnlocked && (
                    <div className="flex items-center gap-1 text-[9px] text-zinc-500 bg-zinc-950/80 px-2 py-0.5 rounded border border-zinc-900">
                      <Lock size={9} />
                      <span className="font-semibold tracking-wider font-mono">LOCKED</span>
                    </div>
                  )}
                </div>

                {isUnlocked ? (
                  <div className="prose prose-invert prose-sm max-w-none text-xs leading-relaxed mt-2 text-zinc-300 transition-all duration-500 animate-in fade-in slide-in-from-top-1">
                    {step.isCode ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={componentsToUse}
                      >
                        {step.content?.includes("```")
                          ? step.content
                          : `\`\`\`pseudocode\n${step.content}\n\`\`\``}
                      </ReactMarkdown>
                    ) : (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={componentsToUse}
                      >
                        {step.content || ""}
                      </ReactMarkdown>
                    )}
                  </div>
                ) : (
                  <div className="mt-2.5 flex items-center justify-between">
                    <p className="text-[11px] text-zinc-500 italic select-none">
                      {isCurrent
                        ? "Reveal clues step-by-step..."
                        : "Complete the previous step to unlock."}
                    </p>
                    {isCurrent && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnlockNext();
                        }}
                        className="flex items-center gap-1 text-[9px] font-bold text-orange-500 hover:text-orange-400 uppercase tracking-widest bg-orange-500/10 hover:bg-orange-500/15 border border-orange-500/25 px-2.5 py-1.5 rounded-lg transition-all"
                      >
                        <span>Unlock</span>
                        <ChevronRight size={9} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
