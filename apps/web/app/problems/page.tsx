"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ProblemsPage() {
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProblems() {
      try {
        const { data } = await axios.get("/api/saved-problems");
        setProblems(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchProblems();
  }, []);

  if (loading) {
    return <div className="p-10">Loading problems...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Saved Problems</h1>

        <p className="text-muted-foreground mt-2">Your AI DSA notebook</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {problems.map((problem) => (
          <Link key={problem.id} href={`/problems/${problem.id}`}>
            <div
              className="
              rounded-xl
              border
              p-5
              space-y-4
              hover:bg-muted/50
              transition
            "
            >
              <h2 className="text-xl font-semibold">{problem.problem.title}</h2>

              <p className="text-sm text-muted-foreground">
                Language: {problem.language.toUpperCase()}
              </p>

              <div className="flex gap-2">
                <span className="text-xs px-3 py-1 rounded-full bg-green-500/10">
                  Brute
                </span>

                <span className="text-xs px-3 py-1 rounded-full bg-blue-500/10">
                  Better
                </span>

                <span className="text-xs px-3 py-1 rounded-full bg-purple-500/10">
                  Optimal
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
