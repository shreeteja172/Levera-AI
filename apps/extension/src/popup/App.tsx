import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
// @ts-ignore
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// @ts-ignore
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

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
    <div className="popup-container">
      <header className="header">
        <div className="logo-container">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#FF5A1F" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="#FF5A1F" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="#FF5A1F" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
          <span className="logo-text">Levera<span>.</span></span>
        </div>
      </header>

      <button
        onClick={analyze}
        disabled={loading || !currentSlug}
        className={`btn-analyze ${loading ? "loading" : ""}`}
      >
        {loading ? (
          <>
            <span className="spinner" />
            Analyzing...
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
            </svg>
            Analyze Problem
          </>
        )}
      </button>

      {error && (
        <div className="error-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{error}</span>
        </div>
      )}

      {!problem && !loading && !error && (
        <div className="welcome-container">
          <div className="welcome-icon-wrapper">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
          <h3 className="welcome-title">Welcome to Levera</h3>
          <p className="welcome-subtitle">
            {currentSlug
              ? "Ready to analyze the current LeetCode problem. Click 'Analyze Problem' to receive optimal solutions and AI walkthroughs."
              : "Please navigate to a LeetCode problem page to begin analysis."}
          </p>
        </div>
      )}

      {problem && (
        <div className="card">
          <div className="problem-header">
            <h3 className="problem-title">{problem.title}</h3>
            <span className={`badge ${problem.difficulty.toLowerCase()}`}>
              {problem.difficulty}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span className="problem-description-label">Description</span>
            <p className="problem-description">{problem.description}</p>
          </div>
        </div>
      )}

      {answer && (
        <div className="card">
          <div className="ai-analysis-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF5A1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
            </svg>
            <h3 className="ai-analysis-title">AI Analysis</h3>
          </div>
          <div className="markdown-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || "");
                  const isInline = !match;
                  return !isInline ? (
                    <SyntaxHighlighter
                      style={oneDark}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{
                        background: "#09090b",
                        border: "none",
                        borderRadius: "6px",
                        margin: "10px 0",
                        padding: "12px",
                        fontSize: "11px",
                        fontFamily: "'Fira Code', monospace"
                      }}
                      {...props}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {answer}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
