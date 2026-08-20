"use client";

import { useEffect, useState } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { SolutionDisplay } from "@/components/problem/SolutionDisplay";
import { ArrowLeft } from "lucide-react";

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

export default function ProblemPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [problem, setProblem] = useState<SavedProblem | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    async function fetchProblem() {
      try {
        const { data } = await axios.get(`/api/saved-problems/${id}`);
        setProblem(data);
      } catch (error) {
        const status = axios.isAxiosError(error)
          ? error.response?.status
          : undefined;

        if (status === 404) {
          setMissing(true);
        } else {
          console.error(error);
          setLoadFailed(true);
          toast.error("Failed to load problem details");
        }
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchProblem();
    }
  }, [id]);

  const handleDelete = async () => {
    if (!problem) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${problem.problem.title}"?`,
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`/api/saved-problems/${problem.id}`);
      toast.success("Problem deleted successfully");
      router.push("/problems");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete problem");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
        <div className="h-16 border-b border-zinc-200 dark:border-zinc-900 flex items-center px-6 bg-white/50 dark:bg-zinc-950/50">
          <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-900 rounded animate-pulse" />
        </div>
        <div className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-8 space-y-8 animate-pulse">
          <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-900 rounded" />
          <div className="space-y-3">
            <div className="h-10 w-2/3 bg-zinc-200 dark:bg-zinc-900 rounded-lg" />
            <div className="h-5 w-1/3 bg-zinc-200 dark:bg-zinc-900 rounded" />
          </div>
          <div className="h-12 w-full bg-zinc-200 dark:bg-zinc-900 rounded-xl" />
          <div className="h-64 w-full bg-zinc-200 dark:bg-zinc-900 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (missing) {
    notFound();
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex items-center justify-center px-6">
        <div className="w-full max-w-md flex flex-col items-start">
          <h1 className="font-instrument text-2xl md:text-3xl tracking-tight text-zinc-900 dark:text-white mb-3">
            {loadFailed
              ? "We couldn't load this problem."
              : "Nothing to show here."}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8">
            {loadFailed
              ? "The request didn't go through. Check your connection and try again — your saved problem is still safe."
              : "This problem couldn't be opened right now."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {loadFailed && (
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black text-sm transition-transform duration-300 hover:-translate-y-0.5 cursor-pointer"
              >
                Try again
              </button>
            )}
            <button
              onClick={() => router.push("/problems")}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/25 text-zinc-600 dark:text-zinc-300 text-sm transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} /> Back to Problems
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <SolutionDisplay problem={problem} onDelete={handleDelete} />;
}
