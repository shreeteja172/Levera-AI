import { useState } from "react";

interface ProblemData {
  title: string;
  slug: string;
  difficulty: string;
  description: string;
  examples: string[];
  constraints: string[];
  url: string;
}

interface AIResponse {
  answer: string;
}
const apiUrl = import.meta.env.VITE_API_URL;

export default function App() {
  const [problem, setProblem] = useState<ProblemData | null>(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyze() {
    setLoading(true);
    setError("");
    setAnswer("");

    try {
      // Get active tab
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab?.id) {
        throw new Error("No active tab found.");
      }

      const scrapedProblem = (await chrome.tabs.sendMessage(tab.id, {
        type: "GET_PROBLEM",
      })) as ProblemData;

      if (!scrapedProblem?.title) {
        throw new Error("Not on a valid LeetCode problem page.");
      }

      setProblem(scrapedProblem);

      const res = await fetch(`${apiUrl}/api/ai/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scrapedProblem),
      });

      if (!res.ok) {
        throw new Error("AI request failed.");
      }

      const data = (await res.json()) as AIResponse;

      setAnswer(data.answer);
    } catch (err) {
      console.error(err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        width: 380,
        padding: 20,
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h2 style={{ marginBottom: 16 }}>🚀 Levera</h2>

      <button
        onClick={analyze}
        disabled={loading}
        style={{
          width: "100%",
          padding: 12,
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        {loading ? "Analyzing..." : "Analyze Problem"}
      </button>

      {error && (
        <div
          style={{
            marginTop: 16,
            color: "red",
            fontSize: 14,
          }}
        >
          {error}
        </div>
      )}

      {problem && (
        <div
          style={{
            marginTop: 20,
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: 12,
          }}
        >
          <h3>{problem.title}</h3>

          <p>
            <strong>Difficulty:</strong> {problem.difficulty}
          </p>

          <p>
            <strong>Slug:</strong> {problem.slug}
          </p>

          <p>
            <strong>Description:</strong>
          </p>

          <p
            style={{
              maxHeight: 120,
              overflowY: "auto",
              whiteSpace: "pre-wrap",
            }}
          >
            {problem.description}
          </p>
        </div>
      )}

      {answer && (
        <div
          style={{
            marginTop: 20,
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: 12,
          }}
        >
          <h3>🤖 AI Analysis</h3>

          <pre
            style={{
              whiteSpace: "pre-wrap",
              fontFamily: "inherit",
            }}
          >
            {answer}
          </pre>
        </div>
      )}
    </div>
  );
}
