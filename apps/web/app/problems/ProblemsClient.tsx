"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useSession } from "@/lib/auth-client";
import { useQueryClient } from "@tanstack/react-query";
import {
  useProblems,
  useToggleSaveProblem,
  useToggleSolveProblem,
  useSeedProblems,
  problemsKeys,
  Problem,
} from "@/hooks/use-problems";
import Image from "next/image";

export default function ProblemsClient() {
  const queryClient = useQueryClient();
  const { data: sessionData, isPending: sessionPending } = useSession();
  const user = sessionData?.user;

  const [difficulty, setDifficulty] = useState<string>("All");
  const [status, setStatus] = useState<string>("All");
  const [savedOnly, setSavedOnly] = useState<string>("All");

  const filters = {
    difficulty,
    status,
    saved:
      savedOnly === "Saved"
        ? "true"
        : savedOnly === "Unsaved"
          ? "false"
          : "All",
  };

  const {
    data: problems = [],
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
    dataUpdatedAt,
  } = useProblems(filters);

  const toggleSaveMutation = useToggleSaveProblem();
  const toggleSolveMutation = useToggleSolveProblem();
  const seedMutation = useSeedProblems();

  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);

  const [isStale, setIsStale] = useState<boolean>(true);
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState<number>(0);

  useEffect(() => {
    if (!dataUpdatedAt) return;

    const checkStaleness = () => {
      const elapsed = Date.now() - dataUpdatedAt;
      setSecondsSinceUpdate(Math.round(elapsed / 1000));
      setIsStale(elapsed >= 10000);
    };

    checkStaleness();
    const interval = setInterval(checkStaleness, 1000);
    return () => clearInterval(interval);
  }, [dataUpdatedAt]);

  const handleToggleSave = async (problemId: string) => {
    if (!user) {
      toast.error("Please sign in to save problems.");
      return;
    }
    try {
      await toggleSaveMutation.mutateAsync(problemId);
      toast.success("Bookmark updated!");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update bookmark.");
    }
  };

  const handleToggleSolve = async (problemId: string) => {
    if (!user) {
      toast.error("Please sign in to track solved problems.");
      return;
    }
    try {
      await toggleSolveMutation.mutateAsync(problemId);
      toast.success("Status updated!");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update status.");
    }
  };

  const handleSeedProblems = async () => {
    try {
      await seedMutation.mutateAsync();
      toast.success("DSA Problems populated successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to seed data.");
    }
  };

  const handleInvalidateCache = () => {
    queryClient.invalidateQueries({ queryKey: problemsKeys.lists() });
    toast.success("Query cache invalidated!");
  };

  const clearFilters = () => {
    setDifficulty("All");
    setStatus("All");
    setSavedOnly("All");
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-orange-500/30 selection:text-white font-sans">
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2.5 font-extrabold text-xl text-white tracking-tight">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-orange-500"
            >
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
            </svg>
            <span>Levera</span>
          </div>

          <nav className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              Levera AI
            </Link>
            <Link
              href="/problems"
              className="text-sm font-semibold text-orange-500 hover:text-orange-400 transition-colors"
            >
              Problems
            </Link>
            <div className="h-4 w-px bg-zinc-800" />
            {sessionPending ? (
              <div className="h-6 w-16 bg-zinc-900 rounded animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-800 py-1.5 px-3 rounded-full">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || "User Profile"}
                    width={20}
                    height={20}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-orange-600 flex items-center justify-center text-[10px] font-bold text-white">
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
                <span className="text-xs font-medium text-zinc-300 max-w-25 truncate">
                  {user.name}
                </span>
              </div>
            ) : (
              <Link
                href="/auth/sign-in"
                className="text-xs font-semibold bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg transition-all"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
              DSA Practice Dashboard
            </h1>
            <p className="text-zinc-400 max-w-xl">
              Track problems, save bookmarks, and solve structures. Uses direct,
              real-time optimistic state management.
            </p>
          </div>

          {!user && !sessionPending && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3 max-w-md">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-amber-500 shrink-0 mt-0.5"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <div>
                <h4 className="text-sm font-semibold text-amber-400">
                  Guest Mode
                </h4>
                <p className="text-xs text-zinc-400 mt-1 leading-normal">
                  You are not signed in. You can browse problems, but logging
                  progress and bookmarking requires an account.
                </p>
                <Link
                  href="/auth/sign-in"
                  className="inline-block text-xs font-bold text-amber-400 hover:text-amber-300 underline mt-2"
                >
                  Sign In Now &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-4 flex items-center justify-between">
                <span>Cache Monitor</span>
                <span className="relative flex h-2 w-2">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isFetching ? "bg-emerald-400" : "bg-orange-400"}`}
                  ></span>
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${isFetching ? "bg-emerald-500" : "bg-orange-500"}`}
                  ></span>
                </span>
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-zinc-800/60">
                  <span className="text-zinc-500 font-medium">
                    Cache Staleness
                  </span>
                  <div className="flex items-center gap-1.5 font-semibold">
                    {isLoading ? (
                      <span className="text-zinc-400">Loading...</span>
                    ) : isStale ? (
                      <span className="text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                        Stale (Needs Sync)
                      </span>
                    ) : (
                      <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Fresh
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-zinc-800/60">
                  <span className="text-zinc-500 font-medium">
                    Background Sync
                  </span>
                  <div className="flex items-center gap-1.5">
                    {isFetching && !isLoading ? (
                      <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                        <svg
                          className="animate-spin h-3.5 w-3.5"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span>Syncing...</span>
                      </div>
                    ) : (
                      <span className="text-zinc-500">Idle</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-zinc-800/60">
                  <span className="text-zinc-500 font-medium">
                    Last Sync Duration
                  </span>
                  <span className="font-mono text-zinc-300">
                    {dataUpdatedAt ? `${secondsSinceUpdate}s ago` : "Never"}
                  </span>
                </div>

                <div className="py-2 border-b border-zinc-800/60">
                  <span className="text-zinc-500 font-medium block mb-1.5">
                    Active Query Key
                  </span>
                  <code className="block bg-zinc-950 p-2 rounded text-[10px] text-zinc-400 font-mono overflow-x-auto border border-zinc-800/80">
                    {JSON.stringify(problemsKeys.list(filters))}
                  </code>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    onClick={() => refetch()}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold py-2 px-3 rounded-lg border border-zinc-700/50 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                    </svg>
                    Force Refetch
                  </button>

                  <button
                    onClick={handleInvalidateCache}
                    className="w-full bg-zinc-850 hover:bg-zinc-800 text-orange-400 font-semibold py-2 px-3 rounded-lg border border-orange-500/25 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                      <line x1="12" y1="2" x2="12" y2="12" />
                    </svg>
                    Invalidate Cache
                  </button>

                  <button
                    onClick={handleSeedProblems}
                    disabled={seedMutation.isPending}
                    className="w-full bg-orange-600/10 hover:bg-orange-600/20 text-orange-400 font-semibold py-2 px-3 rounded-lg border border-orange-500/30 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {seedMutation.isPending ? (
                      <span>Resetting...</span>
                    ) : (
                      <>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                          <line x1="4" y1="22" x2="4" y2="15" />
                        </svg>
                        Reset & Seed Data
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-5 space-y-3">
              <h4 className="text-xs font-bold text-zinc-300">
                How Server State Works
              </h4>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                By modeling query keys like{" "}
                <code className="text-zinc-400 font-mono">
                  ["problems", "list", filters]
                </code>
                , changing filters automatically triggers cache fetches.
              </p>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Bookmarking/solving updates the UI cache optimistically. If the
                server fails, changes roll back instantly with automatic
                synchronization.
              </p>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 flex flex-wrap items-center justify-between gap-4 backdrop-blur-sm">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-orange-500"
                  >
                    <option value="All">All Difficulty</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-orange-500"
                  >
                    <option value="All">All Status</option>
                    <option value="Solved">Solved</option>
                    <option value="Unsolved">Unsolved</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Bookmarks
                  </label>
                  <select
                    value={savedOnly}
                    onChange={(e) => setSavedOnly(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-orange-500"
                  >
                    <option value="All">All Bookmarks</option>
                    <option value="Saved">Saved Only</option>
                    <option value="Unsaved">Unsaved Only</option>
                  </select>
                </div>
              </div>

              {(difficulty !== "All" ||
                status !== "All" ||
                savedOnly !== "All") && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-bold text-orange-500 hover:text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 overflow-hidden min-h-[400px] flex flex-col">
              {isLoading ? (
                <div className="p-6 space-y-4 flex-1">
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                    <div className="h-4 w-32 bg-zinc-800 rounded animate-pulse" />
                    <div className="h-4 w-20 bg-zinc-800 rounded animate-pulse" />
                  </div>
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 border border-zinc-900 bg-zinc-900/30 rounded-xl"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="h-8 w-8 bg-zinc-800 rounded-full animate-pulse" />
                        <div className="space-y-2 flex-1 max-w-sm">
                          <div className="h-4 w-full bg-zinc-850 rounded animate-pulse" />
                          <div className="h-3 w-24 bg-zinc-850 rounded animate-pulse" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-6 w-16 bg-zinc-800 rounded animate-pulse" />
                        <div className="h-8 w-8 bg-zinc-800 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : isError ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-zinc-950">
                  <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-4 shadow-[0_0_20px_rgba(244,63,94,0.1)]">
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Failed to Sync State
                  </h3>
                  <p className="text-zinc-400 text-sm max-w-md mb-6">
                    {error instanceof Error
                      ? error.message
                      : "An unexpected server error occurred while retrieving problems."}
                  </p>
                  <button
                    onClick={() => refetch()}
                    className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                    </svg>
                    Retry Loading
                  </button>
                </div>
              ) : problems.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-zinc-950">
                  <div className="w-16 h-16 rounded-full bg-zinc-800/40 border border-zinc-700/50 flex items-center justify-center text-zinc-400 mb-4">
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <line x1="9" y1="9" x2="15" y2="9" />
                      <line x1="9" y1="13" x2="15" y2="13" />
                      <line x1="9" y1="17" x2="13" y2="17" />
                    </svg>
                  </div>

                  {difficulty !== "All" ||
                  status !== "All" ||
                  savedOnly !== "All" ? (
                    <>
                      <h3 className="text-xl font-bold text-white mb-2">
                        No Matching Problems
                      </h3>
                      <p className="text-zinc-500 text-sm max-w-sm mb-6 leading-relaxed">
                        No challenges match your selected difficulty, status, or
                        bookmark filters.
                      </p>
                      <button
                        onClick={clearFilters}
                        className="bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs px-5 py-2.5 rounded-lg transition-colors"
                      >
                        Reset Filter Criteria
                      </button>
                    </>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold text-white mb-2">
                        Database is Empty
                      </h3>
                      <p className="text-zinc-500 text-sm max-w-sm mb-6 leading-relaxed">
                        No DSA challenges found in the database. Populate sample
                        Leetcode-style problems to start practicing.
                      </p>
                      <button
                        onClick={handleSeedProblems}
                        disabled={seedMutation.isPending}
                        className="bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {seedMutation.isPending
                          ? "Generating problems..."
                          : "Populate DSA Problems"}
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex-1 overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-zinc-900/30 text-xs font-bold uppercase tracking-wider text-zinc-500">
                        <th className="py-4 px-6 w-12 text-center">Solve</th>
                        <th className="py-4 px-6">Problem Title</th>
                        <th className="py-4 px-6 w-32">Difficulty</th>
                        <th className="py-4 px-6 w-16 text-center">Save</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900 bg-zinc-950/20">
                      {problems.map((p) => {
                        const isToggleSavePending =
                          toggleSaveMutation.isPending &&
                          toggleSaveMutation.variables === p.id;
                        const isToggleSolvePending =
                          toggleSolveMutation.isPending &&
                          toggleSolveMutation.variables === p.id;

                        return (
                          <tr
                            key={p.id}
                            className={`group hover:bg-zinc-900/30 transition-colors border-b border-zinc-900 ${
                              selectedProblem?.id === p.id
                                ? "bg-zinc-900/40"
                                : ""
                            }`}
                          >
                            <td className="py-4 px-6 text-center">
                              <button
                                onClick={() => handleToggleSolve(p.id)}
                                disabled={isToggleSolvePending || !user}
                                className={`mx-auto flex h-6 w-6 items-center justify-center rounded-md border text-xs transition-all ${
                                  p.isSolved
                                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                                    : "border-zinc-700 hover:border-zinc-500 text-transparent"
                                } disabled:opacity-50`}
                                title={
                                  !user
                                    ? "Login required"
                                    : p.isSolved
                                      ? "Mark unsolved"
                                      : "Mark solved"
                                }
                              >
                                {isToggleSolvePending ? (
                                  <svg
                                    className="animate-spin h-3.5 w-3.5 text-zinc-400"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    />
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                  </svg>
                                ) : (
                                  "✓"
                                )}
                              </button>
                            </td>

                            <td className="py-4 px-6">
                              <button
                                onClick={() => setSelectedProblem(p)}
                                className="font-semibold text-zinc-100 group-hover:text-orange-500 text-sm transition-colors text-left hover:underline"
                              >
                                {p.title}
                              </button>
                              <span className="block text-[11px] text-zinc-500 font-mono mt-0.5">
                                slug: /{p.slug}
                              </span>
                            </td>

                            <td className="py-4 px-6">
                              {p.difficulty === "Easy" ? (
                                <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                                  Easy
                                </span>
                              ) : p.difficulty === "Medium" ? (
                                <span className="inline-flex items-center rounded-full bg-amber-500/10 border border-amber-500/25 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
                                  Medium
                                </span>
                              ) : (
                                <span className="inline-flex items-center rounded-full bg-rose-500/10 border border-rose-500/25 px-2.5 py-0.5 text-xs font-semibold text-rose-400">
                                  Hard
                                </span>
                              )}
                            </td>

                            <td className="py-4 px-6 text-center">
                              <button
                                onClick={() => handleToggleSave(p.id)}
                                disabled={isToggleSavePending || !user}
                                className={`text-zinc-500 hover:text-orange-400 transition-colors p-1.5 rounded-lg hover:bg-zinc-800/40 ${
                                  p.isSaved ? "text-orange-500" : ""
                                } disabled:opacity-50`}
                                title={
                                  !user
                                    ? "Login required"
                                    : p.isSaved
                                      ? "Remove bookmark"
                                      : "Add bookmark"
                                }
                              >
                                {isToggleSavePending ? (
                                  <svg
                                    className="animate-spin h-4 w-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    />
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                  </svg>
                                ) : (
                                  <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill={p.isSaved ? "currentColor" : "none"}
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                  >
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                  </svg>
                                )}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {selectedProblem && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 max-w-xl w-full rounded-2xl p-6 shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
              <button
                onClick={() => setSelectedProblem(null)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              <div>
                <span
                  className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full mb-3 ${
                    selectedProblem.difficulty === "Easy"
                      ? "bg-emerald-500/10 border border-emerald-500/25 text-emerald-400"
                      : selectedProblem.difficulty === "Medium"
                        ? "bg-amber-500/10 border border-amber-500/25 text-amber-400"
                        : "bg-rose-500/10 border border-rose-500/25 text-rose-400"
                  }`}
                >
                  {selectedProblem.difficulty}
                </span>

                <h3 className="text-2xl font-bold text-white mb-2">
                  {selectedProblem.title}
                </h3>
                <p className="text-zinc-500 font-mono text-xs">
                  Problem ID: {selectedProblem.id}
                </p>
              </div>

              <div className="border-t border-zinc-800 pt-4 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Status Tracker
                </h4>
                <div className="flex gap-4">
                  <div className="flex-1 bg-zinc-950 p-4 rounded-xl border border-zinc-850 flex items-center justify-between">
                    <span className="text-xs text-zinc-400">Solved Status</span>
                    <span
                      className={`text-xs font-bold ${selectedProblem.isSolved ? "text-emerald-400" : "text-zinc-500"}`}
                    >
                      {selectedProblem.isSolved ? "COMPLETED" : "UNSOLVED"}
                    </span>
                  </div>

                  <div className="flex-1 bg-zinc-950 p-4 rounded-xl border border-zinc-850 flex items-center justify-between">
                    <span className="text-xs text-zinc-400">
                      Bookmark Saved
                    </span>
                    <span
                      className={`text-xs font-bold ${selectedProblem.isSaved ? "text-orange-400" : "text-zinc-500"}`}
                    >
                      {selectedProblem.isSaved ? "BOOKMARKED" : "NO"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Practice Instructions
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Go to{" "}
                  <code className="text-zinc-300 font-mono bg-zinc-950 px-1 py-0.5 rounded">
                    Levera AI Chat
                  </code>{" "}
                  and ask for assistance to solve this topic. You will receive
                  customized mentoring feedback, code skeletons, and optimal
                  complexity verification.
                </p>
              </div>

              <div className="flex justify-end gap-3 border-t border-zinc-800 pt-4">
                <button
                  onClick={() => setSelectedProblem(null)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors"
                >
                  Close Detail
                </button>
                <Link
                  href={`/dashboard?problem=${selectedProblem.slug}`}
                  onClick={() => setSelectedProblem(null)}
                  className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors"
                >
                  Discuss with AI Mentor
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
