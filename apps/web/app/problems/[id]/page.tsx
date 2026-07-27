"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { SolutionDisplay } from "@/components/problem/SolutionDisplay";
import { ArrowLeft } from "lucide-react";

interface SavedProblem {
  id: string;
  language: string;
  brute: string | null;
  better: string | null;
  optimal: string | null;
  createdAt: string;
  notes: string | null;
  problem: {
    title: string;
  };
}

export default function ProblemPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [problem, setProblem] = useState<SavedProblem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProblem() {
      try {
        const { data } = await axios.get(`/api/saved-problems/${id}`);
        setProblem(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load problem details");
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
    const confirmDelete = window.confirm(`Are you sure you want to delete "${problem.problem.title}"?`);
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
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
        <div className="h-16 border-b border-zinc-900 flex items-center px-6 bg-zinc-950/50">
          <div className="h-6 w-32 bg-zinc-900 rounded animate-pulse" />
        </div>
        <div className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-8 space-y-8 animate-pulse">
          <div className="h-4 w-16 bg-zinc-900 rounded" />
          <div className="space-y-3">
            <div className="h-10 w-2/3 bg-zinc-900 rounded-lg" />
            <div className="h-5 w-1/3 bg-zinc-900 rounded" />
          </div>
          <div className="h-12 w-full bg-zinc-900 rounded-xl" />
          <div className="h-64 w-full bg-zinc-900 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center flex-col gap-4">
        <p className="text-zinc-400">Problem not found.</p>
        <button
          onClick={() => router.push("/problems")}
          className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-850 px-4 py-2 border border-zinc-800 rounded-xl transition-all cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Problems
        </button>
      </div>
    );
  }

  return <SolutionDisplay problem={problem} onDelete={handleDelete} />;
}
