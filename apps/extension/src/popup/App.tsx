import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import axios from "axios";

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

export default function App() {
  const [problem, setProblem] = useState<ProblemData | null>(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyze() {
    try {
      setLoading(true);

      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab?.id) throw new Error("No active tab");

      let problem;

      try {
        problem = await chrome.tabs.sendMessage(tab.id, {
          type: "GET_PROBLEM",
        });
      } catch {
        throw new Error(
          "Content script not loaded. Refresh the LeetCode page and try again.",
        );
      }

      setProblem(problem);

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/ai/analyze`,
        problem,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      setAnswer(res.data.answer);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error ||
        (err instanceof Error ? err.message : "Something went wrong");
      alert(errorMsg);
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
            padding: 16,
          }}
        >
          <h3>🤖 AI Analysis</h3>

          <ReactMarkdown remarkPlugins={[remarkGfm]}>{answer}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
