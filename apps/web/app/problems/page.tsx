"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Search, Trash2, BookOpen, MessageSquare, Code2, ChevronRight } from "lucide-react";

interface SavedProblemItem {
  id: string;
  language: string;
  brute: unknown;
  better: unknown;
  optimal: unknown;
  problem?: {
    title: string;
    slug: string;
  };
}

export default function ProblemsPage() {
  const [problems, setProblems] = useState<SavedProblemItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleDelete = async (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();

    const deletePromise = axios.delete(`/api/saved-problems/${id}`);

    await toast.promise(deletePromise, {
      loading: `Deleting "${title}"...`,
      success: `Deleted "${title}" successfully`,
      error: "Failed to delete problem",
    });

    fetchProblems();
  };

  const filteredProblems = problems.filter((item) =>
    item.problem?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.language?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <header className="h-16 border-b border-zinc-900 flex items-center justify-between px-6 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 text-xs font-semibold tracking-wide transition-all cursor-pointer"
          >
            <MessageSquare size={13} className="text-orange-500" />
            <span>Go to Chatbot</span>
          </Link>
          <div className="h-4 w-px bg-zinc-800" />
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-orange-500" />
            <span className="font-semibold text-sm tracking-wide">Saved Problems</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-8 space-y-8 animate-in fade-in duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
              Saved Problems
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Your personalized, AI-curated DSA notebook. Learn from your mistakes and track optimal solutions.
            </p>
          </div>
        </div>

        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <input
            type="text"
            placeholder="Search problems by title or language..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/60 border border-zinc-850 hover:border-zinc-800 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 rounded-xl py-2.5 pl-10 pr-4 text-sm text-zinc-200 outline-none transition-all placeholder:text-zinc-500"
          />
        </div>

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border border-zinc-900 bg-zinc-900/10 rounded-2xl p-5 space-y-4 animate-pulse">
                <div className="h-6 w-2/3 bg-zinc-900 rounded-lg" />
                <div className="h-4 w-1/4 bg-zinc-900 rounded" />
                <div className="flex gap-2">
                  <div className="h-6 w-14 bg-zinc-900 rounded-full" />
                  <div className="h-6 w-14 bg-zinc-900 rounded-full" />
                  <div className="h-6 w-14 bg-zinc-900 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProblems.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2">
            {filteredProblems.map((sp) => (
              <Link key={sp.id} href={`/problems/${sp.id}`} className="group block">
                <div className="h-full bg-zinc-900/20 hover:bg-zinc-900/40 border border-zinc-900 hover:border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 shadow-lg hover:shadow-black/20 hover:-translate-y-[2px]">
                  <div className="space-y-3.5">
                    <div className="flex items-start justify-between gap-4">
                      <h2 className="text-lg font-semibold text-zinc-100 group-hover:text-white transition-colors line-clamp-1">
                        {sp.problem?.title || "Unknown Problem"}
                      </h2>
                      <button
                        onClick={(e) => handleDelete(e, sp.id, sp.problem?.title || "Problem")}
                        className="text-zinc-500 hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Delete problem"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <Code2 size={13} className="text-zinc-500" />
                      <span>Language:</span>
                      <span className="font-mono bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 text-zinc-300">
                        {sp.language?.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-900/50">
                    <div className="flex gap-2">
                      {!!sp.brute && (
                        <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/10">
                          Brute
                        </span>
                      )}
                      {!!sp.better && (
                        <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/10">
                          Better
                        </span>
                      )}
                      {!!sp.optimal && (
                        <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
                          Optimal
                        </span>
                      )}
                    </div>

                    <span className="text-xs text-zinc-500 group-hover:text-zinc-300 flex items-center gap-0.5 transition-colors font-medium">
                      View details
                      <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center border border-dashed border-zinc-800 bg-zinc-900/5 rounded-3xl p-12 text-center max-w-lg mx-auto mt-8">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-4">
              <BookOpen size={22} />
            </div>
            <h3 className="text-lg font-semibold text-zinc-200">
              {searchQuery ? "No problems match your search" : "No saved problems yet"}
            </h3>
            <p className="text-sm text-zinc-500 mt-2 max-w-sm">
              {searchQuery
                ? "Try searching with a different keyword or language tag."
                : "When solving coding challenges, ask Levera AI for optimization and click 'Save as Problem' to start building your notebook."}
            </p>
            {!searchQuery && (
              <Link
                href="/dashboard"
                className="mt-6 inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-medium text-sm px-4.5 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-orange-500/20"
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
