"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Search,
  BookOpen,
  MessageSquare,
  Code2,
  ChevronRight,
} from "lucide-react";
import { isDue, isTomorrow, getReviewDayDifference } from "@/lib/review";

interface SavedProblemItem {
  id: string;
  language: string;
  brute: unknown;
  better: unknown;
  optimal: unknown;
  nextReviewAt: string;
  lastReviewedAt: string | null;
  reviewCount: number;
  problem?: {
    title: string;
    slug: string;
  };
}

export default function ProblemsPage() {
  const [problems, setProblems] = useState<SavedProblemItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "due" | "upcoming">("all");

  const fetchProblems = async () => {
    try {
      const { data } = await axios.get("/api/saved-problems");
      setProblems(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load saved problems");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const filteredProblems = problems.filter((item) => {
    const matchesSearch =
      item.problem?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.language?.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filter === "due") {
      return isDue(item.nextReviewAt);
    }
    if (filter === "upcoming") {
      return !isDue(item.nextReviewAt);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
      <header className="h-16 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between px-6 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-zinc-500! dark:text-zinc-400! hover:text-zinc-900! dark:hover:text-white! px-3 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-800 text-xs font-semibold tracking-wide transition-all cursor-pointer"
          >
            <MessageSquare size={13} className="text-orange-500" />
            <span>Go to Chatbot</span>
          </Link>
          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-orange-500" />
            <span className="font-semibold text-sm tracking-wide">
              Saved Problems
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-8 space-y-8 animate-in fade-in duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-sans tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
              Saved Problems
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Your personalized, AI-curated DSA notebook. Learn from your
              mistakes and track optimal solutions.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between w-full">
          <div className="relative w-full max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              size={16}
            />
            <input
              type="text"
              placeholder="Search problems by title or language..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-850 hover:border-zinc-300 dark:hover:border-zinc-800 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 rounded-xl py-2.5 pl-10 pr-4 text-sm text-zinc-900 dark:text-zinc-200 outline-none transition-all placeholder:text-zinc-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-zinc-100/60 dark:bg-zinc-900/30 p-1 border border-zinc-200 dark:border-zinc-900 rounded-xl w-full sm:w-auto">
            {(["all", "due", "upcoming"] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer text-center ${
                  filter === opt
                    ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800"
                    : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 border border-transparent"
                }`}
              >
                {opt === "all"
                  ? "All"
                  : opt === "due"
                    ? "Due Today"
                    : "Upcoming"}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="border border-zinc-200 dark:border-zinc-900 bg-zinc-100/40 dark:bg-zinc-900/10 rounded-2xl p-5 space-y-4 animate-pulse"
              >
                <div className="h-6 w-2/3 bg-zinc-200 dark:bg-zinc-900 rounded-lg" />
                <div className="h-4 w-1/4 bg-zinc-200 dark:bg-zinc-900 rounded" />
                <div className="flex gap-2">
                  <div className="h-6 w-14 bg-zinc-200 dark:bg-zinc-900 rounded-full" />
                  <div className="h-6 w-14 bg-zinc-200 dark:bg-zinc-900 rounded-full" />
                  <div className="h-6 w-14 bg-zinc-200 dark:bg-zinc-900 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProblems.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 items-start">
            {filteredProblems.map((sp) => (
              <Link
                key={sp.id}
                href={`/problems/${sp.id}`}
                className="group block"
              >
                <div className="bg-zinc-50/60 dark:bg-zinc-900/20 hover:bg-zinc-100 dark:hover:bg-zinc-900/40 border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 rounded-2xl p-5 flex flex-col transition-colors duration-200">
                  <div className="space-y-3.5">
                    <div className="flex items-start justify-between gap-4">
                      <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors line-clamp-1">
                        {sp.problem?.title || "Unknown Problem"}
                      </h2>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                        <Code2 size={13} className="text-zinc-500" />
                        <span className="bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
                          {sp.language?.toUpperCase()}
                        </span>
                      </div>

                      {(() => {
                        const diff = getReviewDayDifference(sp.nextReviewAt);
                        if (diff <= 0) {
                          return (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                              Due Today
                            </span>
                          );
                        }
                        if (diff === 1) {
                          return (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                              Tomorrow
                            </span>
                          );
                        }
                        return (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            In {diff} days
                          </span>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 mt-5 pt-3.5 border-t border-zinc-200/70 dark:border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-2">
                        {!!sp.brute && (
                          <span className="text-[10px] tracking-wide uppercase px-2 py-0.5 rounded-md bg-[#FF5A1F]/10 text-[#FF5A1F] border border-[#FF5A1F]/20">
                            Brute
                          </span>
                        )}
                        {!!sp.better && (
                          <span className="text-[10px] tracking-wide uppercase px-2 py-0.5 rounded-md bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 border border-zinc-500/20">
                            Better
                          </span>
                        )}
                        {!!sp.optimal && (
                          <span className="text-[10px] tracking-wide uppercase px-2 py-0.5 rounded-md bg-[#0ea5e9]/10 text-[#0ea5e9] border border-[#0ea5e9]/20">
                            Optimal
                          </span>
                        )}
                      </div>
                      {sp.reviewCount > 0 && (
                        <span className="text-[10px] text-zinc-500">
                          • Reviewed {sp.reviewCount}{" "}
                          {sp.reviewCount === 1 ? "time" : "times"}
                        </span>
                      )}
                    </div>

                    <span className="text-xs text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 flex items-center gap-0.5 transition-colors font-medium">
                      View details
                      <ChevronRight
                        size={14}
                        className="group-hover:translate-x-0.5 transition-transform"
                      />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-100/30 dark:bg-zinc-900/5 rounded-3xl p-12 text-center max-w-lg mx-auto mt-8">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 mb-4">
              <BookOpen size={22} />
            </div>
            <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
              {searchQuery
                ? "No problems match your search"
                : "No saved problems yet"}
            </h3>
            <p className="text-sm text-zinc-500 mt-2 max-w-sm">
              {searchQuery
                ? "Try searching with a different keyword or language tag."
                : "When solving coding challenges, ask Levera AI for optimization and click 'Save as Problem' to start building your notebook."}
            </p>
            {!searchQuery && (
              <Link
                href="/dashboard"
                className="mt-6 inline-flex items-center gap-2 bg-[#FF5A1F] hover:bg-[#ff6b33] text-white! text-sm px-5 py-2.5 rounded-xl transition-colors"
              >
                <MessageSquare size={15} />
                Ask Levera AI
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
