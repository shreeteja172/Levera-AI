"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./CodeBlock";
import { ComplexityBadge } from "./ComplexityBadge";
import { ApproachEditor } from "./ApproachEditor";
import { Code2, BookOpen, Lightbulb, Terminal } from "lucide-react";

interface SolutionCardProps {
  title: string;
  type: "Brute Force" | "Better" | "Optimal";
  icon: React.ReactNode;
  code: string;
  explanation: string;
  language: string;
  timeComplexity: string;
  spaceComplexity: string;
  accentColor: string;
  borderColor: string;
  problemId: string;
  initialUserNotes: string;
  noteType: "bruteNotes" | "betterNotes" | "optimalNotes";
}

export function SolutionCard({
  title,
  type,
  icon,
  code,
  explanation,
  language,
  timeComplexity,
  spaceComplexity,
  borderColor,
  problemId,
  initialUserNotes,
  noteType,
}: SolutionCardProps) {
  const [activeTab, setActiveTab] = useState<"code" | "explanation">("code");

  const parseExplanationContent = (text: string) => {
    const mentorNotesIndex = text.search(/##?\s*(?:Mentor\s*Notes|💡\s*Mentor\s*Notes|Key\s*Insight|Why\s*this\s*works)/i);
    
    if (mentorNotesIndex !== -1) {
      return {
        mainExplanation: text.substring(0, mentorNotesIndex).trim(),
        mentorNotes: text.substring(mentorNotesIndex).trim(),
      };
    }

    return {
      mainExplanation: text,
      mentorNotes: "",
    };
  };

  const { mainExplanation, mentorNotes } = parseExplanationContent(explanation);

  const getVariant = () => {
    if (type === "Brute Force") return "brute";
    if (type === "Better") return "better";
    return "optimal";
  };

  return (
    <div
      className={`rounded-xl border-l-4 ${borderColor} bg-white dark:bg-zinc-900 border border-t-zinc-200 dark:border-t-zinc-800/80 border-r-zinc-200 dark:border-r-zinc-800/80 border-b-zinc-200 dark:border-b-zinc-800/80 transition-all duration-300 w-full lg:min-w-[28rem] lg:max-w-[32rem] flex flex-col shrink-0 snap-center`}
    >
      <div className="p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 bg-zinc-100/80 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 rounded-xl shrink-0">
              {icon}
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{type}</h3>
              <p className="text-xs text-zinc-500 font-medium">Approach Solution</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 px-2.5 py-1 shrink-0 bg-zinc-100/80 dark:bg-zinc-950/80 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 rounded-lg font-mono text-xs font-semibold tracking-wide uppercase">
            <Terminal className="w-3.5 h-3.5 shrink-0 opacity-80" />
            <span>{language}</span>
          </span>
        </div>

        <ComplexityBadge
          time={timeComplexity}
          space={spaceComplexity}
          variant={getVariant()}
        />
      </div>

      <div className="border-t border-zinc-200 dark:border-zinc-900 flex-1 flex flex-col min-h-[24rem]">
        <div className="flex bg-zinc-100 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-900 p-1 select-none">
          <button
            onClick={() => setActiveTab("code")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "code"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            <Code2 size={13} />
            Code
          </button>
          <button
            onClick={() => setActiveTab("explanation")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "explanation"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            <BookOpen size={13} />
            Explanation
          </button>
        </div>

        <div className="flex-1 p-5 flex flex-col bg-zinc-50/60 dark:bg-zinc-900/40 min-h-[22rem] max-h-[35rem] overflow-y-auto custom-scrollbar [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.05)_transparent]">
          {activeTab === "code" ? (
            <div className="flex-1 flex flex-col justify-center">
              {code.trim() ? (
                <CodeBlock
                  language={language}
                  filename={`${title.toLowerCase().replace(/\s+/g, "_")}_${getVariant()}.${language.toLowerCase() === "cpp" ? "cpp" : language.toLowerCase() === "python" ? "py" : language.toLowerCase()}`}
                  code={code}
                />
              ) : (
                <p className="text-center text-xs text-zinc-500 py-8 font-sans">No code available.</p>
              )}
            </div>
          ) : (
            <div className="flex-grow flex flex-col gap-6 text-sm">
              <div className="prose prose-sm dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed">
                {mainExplanation.trim() ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{mainExplanation}</ReactMarkdown>
                ) : (
                  <p className="text-zinc-500 italic">No explanation provided.</p>
                )}
              </div>

              {mentorNotes.trim() ? (
                <div className="mt-2 p-4 border border-orange-500/10 bg-orange-500/5 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-semibold text-xs tracking-wider uppercase">
                    <Lightbulb size={14} className="text-orange-600 dark:text-orange-400" />
                    <span>💡 Mentor Notes</span>
                  </div>
                  <div className="prose prose-sm dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 text-xs leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{mentorNotes}</ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-4 border border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-950/20 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 font-semibold text-xs tracking-wider uppercase">
                    <Lightbulb size={14} className="text-zinc-500 dark:text-zinc-400" />
                    <span>💡 Mentor Notes</span>
                  </div>
                  <div className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed">
                    <p>
                      Analyze the complexity bottlenecks. Consider how auxiliary space affects performance, and test with edge cases like empty arrays, single elements, and integer overflow.
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 font-semibold text-xs tracking-wider uppercase select-none">
                  <span className="w-1 h-3.5 bg-orange-500 rounded-full" />
                  <span>My Notes</span>
                </div>
                <ApproachEditor
                  problemId={problemId}
                  initialValue={initialUserNotes}
                  noteType={noteType}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
