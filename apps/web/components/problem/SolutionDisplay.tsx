"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SolutionCard } from "./SolutionCard";
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Cpu, 
  Zap, 
  Trophy,
  ArrowRight
} from "lucide-react";

interface SavedProblem {
  id: string;
  language: string;
  brute: string | null;
  better: string | null;
  optimal: string | null;
  createdAt: string;
  notes: string | null;
  bruteNotes: string | null;
  betterNotes: string | null;
  optimalNotes: string | null;
  problem: {
    title: string;
  };
}

interface SolutionDisplayProps {
  problem: SavedProblem;
  onDelete: () => void;
}

export function SolutionDisplay({ problem, onDelete }: SolutionDisplayProps) {
  const router = useRouter();
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const parseSolution = (markdown: string | null, type: "brute" | "better" | "optimal") => {
    if (!markdown) {
      return {
        code: "",
        explanation: "",
        timeComplexity: "",
        spaceComplexity: "",
        exists: false,
      };
    }

    const timeMatch = /Time\s*Complexity\s*:\s*\*?([^\n\r]+)/i.exec(markdown);
    const spaceMatch = /Space\s*Complexity\s*:\s*\*?([^\n\r]+)/i.exec(markdown);

    let timeComplexity = (timeMatch && timeMatch[1]) ? timeMatch[1].trim() : "";
    let spaceComplexity = (spaceMatch && spaceMatch[1]) ? spaceMatch[1].trim() : "";

    timeComplexity = timeComplexity.replace(/[*$`]/g, "").trim();
    spaceComplexity = spaceComplexity.replace(/[*$`]/g, "").trim();

    if (!timeComplexity) {
      timeComplexity = type === "brute" ? "O(N²)" : type === "better" ? "O(N log N)" : "O(N)";
    }
    if (!spaceComplexity) {
      spaceComplexity = "O(1)";
    }

    const codeBlocks: string[] = [];
    const regex = /```(?:\w+)?\n([\s\S]*?)```/g;
    let match;
    while ((match = regex.exec(markdown)) !== null) {
      if (match[1]) codeBlocks.push(match[1].trim());
    }

    let explanation = markdown.replace(/```(?:\w+)?\n([\s\S]*?)```/g, "").trim();

    explanation = explanation
      .replace(/Time\s*Complexity\s*:\s*[^\n\r]+/i, "")
      .replace(/Space\s*Complexity\s*:\s*[^\n\r]+/i, "")
      .trim();

    return {
      code: codeBlocks[0] || "",
      explanation: explanation || markdown,
      timeComplexity,
      spaceComplexity,
      exists: true,
    };
  };

  const bruteParsed = parseSolution(problem.brute, "brute");
  const betterParsed = parseSolution(problem.better, "better");
  const optimalParsed = parseSolution(problem.optimal, "optimal");

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener("scroll", handleScroll);
      handleScroll();
    }
    return () => {
      if (el) el.removeEventListener("scroll", handleScroll);
    };
  }, [problem]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 480;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const activeSolutions = [
    { 
      type: "Brute Force" as const, 
      parsed: bruteParsed, 
      icon: <Cpu className="text-red-400 w-5 h-5" />, 
      accentColor: "text-red-400", 
      borderColor: "border-red-500/80",
      initialUserNotes: problem.bruteNotes || "",
      noteType: "bruteNotes" as const
    },
    { 
      type: "Better" as const, 
      parsed: betterParsed, 
      icon: <Zap className="text-amber-400 w-5 h-5" />, 
      accentColor: "text-amber-400", 
      borderColor: "border-amber-500/80",
      initialUserNotes: problem.betterNotes || "",
      noteType: "betterNotes" as const
    },
    { 
      type: "Optimal" as const, 
      parsed: optimalParsed, 
      icon: <Trophy className="text-emerald-400 w-5 h-5" />, 
      accentColor: "text-emerald-400", 
      borderColor: "border-emerald-500/80",
      initialUserNotes: problem.optimalNotes || "",
      noteType: "optimalNotes" as const
    },
  ].filter(s => s.parsed.exists);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-10 overflow-x-hidden">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/problems")}
              className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors group cursor-pointer text-sm font-medium"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              Back to Saved Problems
            </button>

            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-950 bg-red-950/20 text-red-400 hover:bg-red-950/40 hover:border-red-900 text-xs font-semibold tracking-wide transition-all cursor-pointer"
              title="Delete saved problem"
            >
              <Trash2 size={13} />
              <span>Delete This Problem</span>
            </button>
          </div>

          <div className="text-center space-y-3 py-4">
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-orange-400 via-red-500 to-amber-500 bg-clip-text text-transparent tracking-tight font-exo2">
              {problem.problem.title}
            </h1>
            <div className="inline-flex items-center gap-1.5 text-xs text-zinc-500 bg-zinc-900/30 border border-zinc-900 px-3 py-1 rounded-full font-mono">
              <span>Language:</span>
              <span className="text-zinc-300 uppercase font-bold">{problem.language}</span>
            </div>
          </div>
        </div>


        <section className="space-y-4 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-400 font-semibold text-sm">
              <span className="w-1.5 h-6 bg-orange-500 rounded-full" />
              <h2>Solution Approaches Progression</h2>
            </div>
            
            <div className="hidden lg:flex items-center gap-1.5">
              <button
                disabled={!showLeftArrow}
                onClick={() => scroll("left")}
                className={`p-2 rounded-lg border border-zinc-800 bg-zinc-950 transition-all select-none ${
                  showLeftArrow 
                    ? "text-zinc-300 hover:text-white hover:bg-zinc-900 cursor-pointer" 
                    : "text-zinc-700 opacity-40 cursor-not-allowed"
                }`}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={!showRightArrow}
                onClick={() => scroll("right")}
                className={`p-2 rounded-lg border border-zinc-800 bg-zinc-950 transition-all select-none ${
                  showRightArrow 
                    ? "text-zinc-300 hover:text-white hover:bg-zinc-900 cursor-pointer" 
                    : "text-zinc-700 opacity-40 cursor-not-allowed"
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="relative">
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto gap-6 pb-6 pt-2 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none]"
              style={{ scrollbarWidth: "none" }}
            >
              {activeSolutions.map((sol, index) => (
                <React.Fragment key={sol.type}>
                  <SolutionCard
                    title={problem.problem.title}
                    type={sol.type}
                    icon={sol.icon}
                    code={sol.parsed.code}
                    explanation={sol.parsed.explanation}
                    language={problem.language}
                    timeComplexity={sol.parsed.timeComplexity}
                    spaceComplexity={sol.parsed.spaceComplexity}
                    accentColor={sol.accentColor}
                    borderColor={sol.borderColor}
                    problemId={problem.id}
                    initialUserNotes={sol.initialUserNotes}
                    noteType={sol.noteType}
                  />
                  {index < activeSolutions.length - 1 && (
                    <div className="hidden lg:flex items-center justify-center shrink-0 self-center px-2 select-none">
                      <div className="flex flex-col items-center gap-1">
                        <ArrowRight className="w-6 h-6 text-zinc-700 animate-pulse" />
                        <span className="text-[10px] font-bold text-zinc-600 tracking-widest uppercase">Optimizing</span>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
