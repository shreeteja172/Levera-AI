"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { SolutionCard } from "./SolutionCard";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Cpu,
  Zap,
  Trophy,
  ArrowRight,
  Lock,
} from "lucide-react";
import {
  REVIEW_INTERVALS,
  type ReviewRating,
  isDue,
  getReviewDayDifference,
} from "@/lib/review";
import { HintsBlock } from "./HintsBlock";
import { createSlug } from "@/lib/chat-utils";

interface SavedProblem {
  id: string;
  userId: string;
  language: string;
  brute: string | null;
  better: string | null;
  optimal: string | null;
  hints: any;
  createdAt: string;
  nextReviewAt: string;
  lastReviewedAt: string | null;
  reviewCount: number;
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

  const [nextReviewAt, setNextReviewAt] = useState<string>(
    problem.nextReviewAt,
  );
  const [reviewCount, setReviewCount] = useState<number>(problem.reviewCount);
  const [lastReviewedAt, setLastReviewedAt] = useState<string | null>(
    problem.lastReviewedAt,
  );
  const [undoState, setUndoState] = useState<{
    nextReviewAt: string;
    reviewCount: number;
    lastReviewedAt: string | null;
    showUndo: boolean;
  } | null>(null);
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const problemSlug = createSlug(problem.problem.title);
  const [unlockedLevel, setUnlockedLevel] = useState<number>(0);
  const [revealedLevel, setRevealedLevel] = useState<number>(0);
  const [activeUnlockRequest, setActiveUnlockRequest] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch(`/api/hints/progress?slug=${problemSlug}`);
        if (res.ok) {
          const data = await res.json();
          setUnlockedLevel(data.unlockedLevel);
          setRevealedLevel(data.revealedLevel);
        }
      } catch (e) {
        console.error("Failed to load progress:", e);
      }
    };
    fetchProgress();
  }, [problemSlug]);

  const handleUpdateProgress = async (unlocked: number, revealed: number) => {
    setUnlockedLevel(unlocked);
    setRevealedLevel(revealed);

    try {
      await fetch("/api/hints/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          problemSlug,
          unlockedLevel: unlocked,
          revealedLevel: revealed,
        }),
      });
    } catch (e) {
      console.error("Failed to save progress:", e);
    }
  };

  const hints = problem.hints as {
    hint1?: string | null;
    hint2?: string | null;
    pattern?: string | null;
    pseudocode?: string | null;
  } | null;

  const hasHints =
    !!hints &&
    (!!hints.hint1 ||
      !!hints.hint2 ||
      !!hints.pattern ||
      !!hints.pseudocode);

  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    };
  }, []);

  const handleRate = async (rating: ReviewRating) => {
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = null;
    }

    setUndoState({
      nextReviewAt,
      reviewCount,
      lastReviewedAt,
      showUndo: true,
    });

    const days = REVIEW_INTERVALS[rating];
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + days);

    const nextStr = newDate.toISOString();
    const countVal = reviewCount + 1;
    const reviewedVal = new Date().toISOString();

    setNextReviewAt(nextStr);
    setReviewCount(countVal);
    setLastReviewedAt(reviewedVal);

    try {
      await axios.patch(`/api/saved-problems/${problem.id}/review`, { rating });
      toast.success("Review recorded!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to record review");
      setNextReviewAt(nextReviewAt);
      setReviewCount(reviewCount);
      setLastReviewedAt(lastReviewedAt);
      setUndoState(null);
      return;
    }

    undoTimeoutRef.current = setTimeout(() => {
      setUndoState(null);
    }, 5000);
  };

  const handleUndo = async () => {
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = null;
    }

    if (!undoState) return;

    const prevNextReviewAt = undoState.nextReviewAt;
    const prevReviewCount = undoState.reviewCount;
    const prevLastReviewedAt = undoState.lastReviewedAt;

    setNextReviewAt(prevNextReviewAt);
    setReviewCount(prevReviewCount);
    setLastReviewedAt(prevLastReviewedAt);
    setUndoState(null);

    try {
      await axios.patch(`/api/saved-problems/${problem.id}`, {
        nextReviewAt: prevNextReviewAt,
        reviewCount: prevReviewCount,
        lastReviewedAt: prevLastReviewedAt,
      });
      toast.success("Review undone!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to undo review on server");
    }
  };

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const parseSolution = (
    markdown: string | null,
    type: "brute" | "better" | "optimal",
  ) => {
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

    let timeComplexity = timeMatch && timeMatch[1] ? timeMatch[1].trim() : "";
    let spaceComplexity =
      spaceMatch && spaceMatch[1] ? spaceMatch[1].trim() : "";

    timeComplexity = timeComplexity.replace(/[*$`]/g, "").trim();
    spaceComplexity = spaceComplexity.replace(/[*$`]/g, "").trim();

    if (!timeComplexity) {
      timeComplexity =
        type === "brute" ? "O(N²)" : type === "better" ? "O(N log N)" : "O(N)";
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

    let explanation = markdown
      .replace(/```(?:\w+)?\n([\s\S]*?)```/g, "")
      .trim();

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
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
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

  interface ActiveSolutionItem {
    type: "Brute Force" | "Better" | "Optimal";
    parsed: {
      code: string;
      explanation: string;
      timeComplexity: string;
      spaceComplexity: string;
      exists: boolean;
    };
    icon: React.ReactNode;
    accentColor: string;
    borderColor: string;
    initialUserNotes: string;
    noteType: "bruteNotes" | "betterNotes" | "optimalNotes";
  }

  const activeSolutions: ActiveSolutionItem[] = [
    {
      type: "Brute Force" as const,
      parsed: bruteParsed,
      icon: <Cpu className="text-red-400 w-5 h-5" />,
      accentColor: "text-red-400",
      borderColor: "border-red-500/80",
      initialUserNotes: problem.bruteNotes || "",
      noteType: "bruteNotes" as const,
    },
    {
      type: "Better" as const,
      parsed: betterParsed,
      icon: <Zap className="text-amber-400 w-5 h-5" />,
      accentColor: "text-amber-400",
      borderColor: "border-amber-500/80",
      initialUserNotes: problem.betterNotes || "",
      noteType: "betterNotes" as const,
    },
    {
      type: "Optimal" as const,
      parsed: optimalParsed,
      icon: <Trophy className="text-emerald-400 w-5 h-5" />,
      accentColor: "text-emerald-400",
      borderColor: "border-emerald-500/80",
      initialUserNotes: problem.optimalNotes || "",
      noteType: "optimalNotes" as const,
    },
  ].filter((s) => s.parsed.exists);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans">
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-10 overflow-x-hidden">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/problems")}
              className="flex items-center gap-2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors group cursor-pointer text-sm font-medium"
            >
              <ArrowLeft
                size={16}
                className="group-hover:-translate-x-0.5 transition-transform"
              />
              Back to Saved Problems
            </button>

            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-950 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 hover:border-red-300 dark:hover:border-red-900 text-xs font-semibold tracking-wide transition-all cursor-pointer"
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
            <div className="flex flex-wrap items-center justify-center gap-2">
              <div className="inline-flex items-center gap-1.5 text-xs text-zinc-500 bg-zinc-100/60 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-900 px-3 py-1 rounded-full font-mono">
                <span>Language:</span>
                <span className="text-zinc-700 dark:text-zinc-300 uppercase font-bold">
                  {problem.language}
                </span>
              </div>
              {reviewCount > 0 && (
                <div className="inline-flex items-center gap-1.5 text-xs text-zinc-500 bg-zinc-100/60 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-900 px-3 py-1 rounded-full font-mono">
                  <span>Reviewed:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {reviewCount} {reviewCount === 1 ? "time" : "times"}
                  </span>
                </div>
              )}
              {!isDue(nextReviewAt) && (
                <div className="inline-flex items-center gap-1.5 text-xs text-zinc-500 bg-zinc-100/60 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-900 px-3 py-1 rounded-full font-mono">
                  <span>Next Review:</span>
                  <span className="text-zinc-700 dark:text-zinc-300 font-bold">
                    {getReviewDayDifference(nextReviewAt) === 1
                      ? "Tomorrow"
                      : `In ${getReviewDayDifference(nextReviewAt)} days`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {(() => {
          const due = isDue(nextReviewAt);
          const showUndo = undoState?.showUndo;

          if (!due && !showUndo) return null;

          return (
            <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-900 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl backdrop-blur-sm animate-in fade-in duration-300 max-w-4xl mx-auto w-full">
              <div className="space-y-1 text-center md:text-left">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center justify-center md:justify-start gap-2">
                  <span>Time to Review</span>
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {showUndo
                    ? `Next review scheduled ${getReviewDayDifference(nextReviewAt) === 1 ? "tomorrow" : `in ${getReviewDayDifference(nextReviewAt)} days`}.`
                    : "Can you still solve this problem? How difficult was it?"}
                </p>
              </div>

              {showUndo ? (
                <button
                  onClick={handleUndo}
                  className="flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-all cursor-pointer shadow-md"
                >
                  Undo
                </button>
              ) : (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {(["again", "hard", "good", "easy"] as const).map(
                    (rating) => {
                      const ratingLabels = {
                        again: {
                          label: "Again",
                          class:
                            "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/10",
                        },
                        hard: {
                          label: "Hard",
                          class:
                            "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/10",
                        },
                        good: {
                          label: "Good",
                          class:
                            "bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/10",
                        },
                        easy: {
                          label: "Easy",
                          class:
                            "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/10",
                        },
                      };
                      const item = ratingLabels[rating];
                      return (
                        <button
                          key={rating}
                          onClick={() => handleRate(rating)}
                          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold tracking-wide transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98] ${item.class}`}
                        >
                          <span>{item.label}</span>
                        </button>
                      );
                    },
                  )}
                </div>
              )}
            </div>
          );
        })()}

        {hasHints && (
          <HintsBlock
            hints={hints}
            markdownComponents={null}
            unlockedLevel={unlockedLevel}
            onUpdateUnlockedLevel={(lvl) => handleUpdateProgress(lvl, revealedLevel)}
          />
        )}

        <section className="space-y-4 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 font-semibold text-sm">
              <span className="w-1.5 h-6 bg-orange-500 rounded-full" />
              <h2>Solution Approaches Progression</h2>
            </div>

            <div className="hidden lg:flex items-center gap-1.5">
              <button
                disabled={!showLeftArrow}
                onClick={() => scroll("left")}
                className={`p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-all select-none ${
                  showLeftArrow
                    ? "text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
                    : "text-zinc-300 dark:text-zinc-700 opacity-40 cursor-not-allowed"
                }`}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={!showRightArrow}
                onClick={() => scroll("right")}
                className={`p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-all select-none ${
                  showRightArrow
                    ? "text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
                    : "text-zinc-300 dark:text-zinc-700 opacity-40 cursor-not-allowed"
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
              {activeSolutions.map((sol, index) => {
                const isLocked =
                  hasHints &&
                  ((sol.type === "Brute Force" && revealedLevel < 1) ||
                    (sol.type === "Better" && revealedLevel < 2) ||
                    (sol.type === "Optimal" && revealedLevel < 3));

                const canUnlock =
                  (sol.type === "Brute Force" && revealedLevel === 0) ||
                  (sol.type === "Better" && revealedLevel === 1) ||
                  (sol.type === "Optimal" && revealedLevel === 2);

                const targetLevel =
                  sol.type === "Brute Force" ? 1 : sol.type === "Better" ? 2 : 3;

                return (
                  <React.Fragment key={sol.type}>
                    <div className="relative shrink-0 w-full md:w-[480px]">
                      <div
                        className={
                          isLocked
                            ? "filter blur-sm pointer-events-none select-none opacity-20 transition-all duration-300"
                            : "transition-all duration-300"
                        }
                      >
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
                      </div>

                      {isLocked && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-900/50 rounded-2xl p-6 text-center space-y-4 backdrop-blur-xs z-10">
                          {activeUnlockRequest === sol.type ? (
                            <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-850 rounded-xl p-4 w-full max-w-sm text-center space-y-3 shadow-xl animate-in zoom-in-95 duration-200">
                              <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 mx-auto">
                                <Lock className="w-4 h-4" />
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wide">
                                  Have you attempted the problem?
                                </p>
                                <p className="text-[10px] text-zinc-500">
                                  We highly recommend attempting to write your own solution before checking the model code.
                                </p>
                              </div>
                              <div className="flex items-center justify-center gap-3 pt-1">
                                <button
                                  onClick={() => {
                                    handleUpdateProgress(unlockedLevel, targetLevel);
                                    setActiveUnlockRequest(null);
                                  }}
                                  className="px-4 py-2 bg-[#ff7d00] hover:bg-[#ff7d00]/90 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                                >
                                  Yes, reveal
                                </button>
                                <button
                                  onClick={() => setActiveUnlockRequest(null)}
                                  className="px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 hover:border-zinc-300 dark:hover:border-zinc-850 text-zinc-500 dark:text-zinc-450 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                                >
                                  Not yet
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3 max-w-xs">
                              <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 flex items-center justify-center text-zinc-500 shadow-lg mx-auto">
                                <Lock className="w-4 h-4 text-orange-500" />
                              </div>
                              <div className="space-y-1">
                                <h4 className="text-xs font-black tracking-wide text-zinc-800 dark:text-zinc-200 uppercase font-mono">
                                  {sol.type === "Brute Force"
                                    ? "Brute Force"
                                    : sol.type === "Better"
                                      ? "Better Approach"
                                      : "Optimal Solution"}{" "}
                                  Locked
                                </h4>
                                <p className="text-[10px] text-zinc-500 leading-relaxed">
                                  {canUnlock
                                    ? `Practice active recall! Try implementing this approach first.`
                                    : `Please unlock the previous approach first to follow the progression.`}
                                </p>
                              </div>
                              {canUnlock && (
                                <button
                                  onClick={() => setActiveUnlockRequest(sol.type)}
                                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-orange-650/10 hover:bg-orange-650/20 text-orange-500 border border-orange-500/20 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                                >
                                  Unlock approach
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {index < activeSolutions.length - 1 && (
                      <div className="hidden lg:flex items-center justify-center shrink-0 self-center px-2 select-none">
                        <div className="flex flex-col items-center gap-1">
                          <ArrowRight className="w-6 h-6 text-zinc-700 animate-pulse" />
                          <span className="text-[10px] font-bold text-zinc-600 tracking-widest uppercase">
                            Optimizing
                          </span>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
