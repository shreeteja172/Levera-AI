"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";

interface SavedProblem {
  id: string;
  language: string;
  brute: string | null;
  better: string | null;
  optimal: string | null;
  problem: {
    title: string;
  };
}

export default function ProblemPage() {
  const { id } = useParams<{ id: string }>();

  const [problem, setProblem] = useState<SavedProblem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProblem() {
      try {
        const { data } = await axios.get(`/api/saved-problems/${id}`);
        setProblem(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchProblem();
    }
  }, [id]);

  if (loading) {
    return <div className="max-w-5xl mx-auto py-10">Loading...</div>;
  }

  if (!problem) {
    return <div className="max-w-5xl mx-auto py-10">Problem not found.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{problem.problem.title}</h1>
        <p className="text-muted-foreground mt-2">
          Language: {problem.language.toUpperCase()}
        </p>
      </div>

      <SolutionSection title="Brute Force" code={problem.brute} />
      <SolutionSection title="Better" code={problem.better} />
      <SolutionSection title="Optimal" code={problem.optimal} />
    </div>
  );
}

function SolutionSection({
  title,
  code,
}: {
  title: string;
  code: string | null;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold">{title}</h2>

      <pre className="rounded-xl border bg-zinc-950 p-5 overflow-x-auto text-sm">
        <code>{code ?? "No solution available."}</code>
      </pre>
    </section>
  );
}
