import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ProblemData {
  title: string;
  slug: string;
  difficulty: string;
  description: string;
  examples: string[];
  constraints: string[];
  url: string;
}

function getSlugFromUrl(url?: string): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "leetcode.com" && parsed.hostname !== "www.leetcode.com") {
      return null;
    }
    const pathParts = parsed.pathname.split("/").filter(Boolean);
    if (pathParts[0] === "problems" && pathParts[1]) {
      return pathParts[1];
    }
  } catch (e) {
    console.error("Error parsing URL:", e);
  }
  return null;
}

export default function App() {
  const [problem, setProblem] = useState<ProblemData | null>(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentSlug, setCurrentSlug] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });

        if (!tab?.id || !tab.url) {
          setError("No active tab found.");
          return;
        }

        const slug = getSlugFromUrl(tab.url);
        if (!slug) {
          setError("Please navigate to a LeetCode problem page to use Levera.");
          return;
        }

        setCurrentSlug(slug);

        const stored = await chrome.storage.session.get(slug);
        const data = stored[slug] as any;
        if (data) {
          const EXPIRY_MS = 24 * 60 * 60 * 1000;
          if (Date.now() - (data.timestamp || 0) > EXPIRY_MS) {
            await chrome.storage.session.remove(slug);
          } else {
            setProblem(data.problem || null);
            setAnswer(data.answer || "");
            setError(data.error || "");
            setLoading(data.status === "loading");
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to initialize.");
      }
    }

    init();
  }, []);

  useEffect(() => {
    if (!currentSlug) return;
    const slug = currentSlug;

    function handleStorageChange(
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) {
      if (areaName === "session" && changes[slug]) {
        const newValue = changes[slug].newValue as any;
        if (newValue) {
          setProblem(newValue.problem || null);
          setAnswer(newValue.answer || "");
          setError(newValue.error || "");
          setLoading(newValue.status === "loading");
        } else {
          setProblem(null);
          setAnswer("");
          setError("");
          setLoading(false);
        }
      }
    }

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, [currentSlug]);

  async function analyze() {
    try {
      setLoading(true);
      setError("");

      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab?.id || !tab.url) throw new Error("No active tab");

      const slug = getSlugFromUrl(tab.url);
      if (!slug) {
        throw new Error("Please open a LeetCode problem page.");
      }

      chrome.runtime.sendMessage({
        type: "START_ANALYSIS",
        slug,
        tabId: tab.id,
      });
    } catch (err: any) {
      setError(err.message || "Something went wrong");
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
        disabled={loading || !currentSlug}
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
