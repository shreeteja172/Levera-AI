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

interface PendingLogin {
  deviceCode: string;
  userCode: string;
  verifyUrl: string;
  expiresIn: number;
  expiresAt: number;
}

interface LocalAuthStorage {
  token?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user?: any;
  pendingLogin?: PendingLogin;
}

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

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

  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [deviceCodeInfo, setDeviceCodeInfo] = useState<PendingLogin | null>(
    null,
  );
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    async function init() {
      try {
        setAuthLoading(true);
        const stored = await chrome.storage.local.get<LocalAuthStorage>([
          "token",
          "user",
          "pendingLogin",
        ]);
        
        if (stored.token) {
          const res = await fetch(`${apiUrl}/api/extension/me`, {
            headers: {
              Authorization: `Bearer ${stored.token}`,
            },
          });
          if (res.ok) {
            const data = await res.json();
            setToken(stored.token);
            setUser(data.user || stored.user);
          } else {
            await chrome.storage.local.remove(["token", "user"]);
            setToken(null);
            setUser(null);
          }
        } else if (stored.pendingLogin) {
          if (Date.now() < stored.pendingLogin.expiresAt) {
            setDeviceCodeInfo(stored.pendingLogin);
            chrome.runtime.sendMessage({ type: "START_LOGIN_POLL" });
          } else {
            await chrome.storage.local.remove("pendingLogin");
          }
        }
      } catch (err) {
        console.error("Auth verification failed:", err);
      } finally {
        setAuthLoading(false);
      }

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

        const storedSession = await chrome.storage.session.get(slug);
        const data = storedSession[slug] as any;
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
    function handleStorageChange(
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) {
      if (areaName === "local") {
        if (changes.token) {
          setToken((changes.token.newValue as string | undefined) ?? null);
        }
        if (changes.user) {
          setUser(changes.user.newValue);
        }
        if (changes.pendingLogin) {
          setDeviceCodeInfo(
            (changes.pendingLogin.newValue as PendingLogin | undefined) ??
              null,
          );
        }
      }
    }

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
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

  async function startLogin() {
    try {
      setAuthLoading(true);
      setAuthError("");
      const res = await fetch(`${apiUrl}/api/extension/device-code`, {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error("Failed to generate verification code");
      }
      const data = await res.json();
      
      const pendingLogin = {
        deviceCode: data.deviceCode,
        userCode: data.userCode,
        verifyUrl: data.verifyUrl,
        expiresAt: Date.now() + data.expiresIn * 1000,
        expiresIn: data.expiresIn,
      };

      await chrome.storage.local.set({ pendingLogin });
      setDeviceCodeInfo(pendingLogin);
      
      chrome.runtime.sendMessage({ type: "START_LOGIN_POLL" });

      if (data.verifyUrl) {
        chrome.tabs.create({ url: data.verifyUrl });
      }
    } catch (err: any) {
      setAuthError(err.message || "Something went wrong starting login.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function cancelLogin() {
    try {
      await chrome.storage.local.remove("pendingLogin");
      setDeviceCodeInfo(null);
    } catch (err) {
      console.error("Cancel login failed:", err);
    }
  }

  async function logout() {
    try {
      setAuthLoading(true);
      await chrome.storage.local.remove(["token", "user"]);
      setToken(null);
      setUser(null);
      setProblem(null);
      setAnswer("");
      setError("");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setAuthLoading(false);
    }
  }

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
        token: token,
      });
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  }

  if (authLoading && !token && !deviceCodeInfo) {
    return (
      <div className="popup-container auth-loading-screen">
        <span className="spinner" style={{ width: 24, height: 24 }} />
        <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Verifying authentication status...</span>
      </div>
    );
  }

  if (!token) {
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

        <div className="auth-container">
          <div className="auth-icon-wrapper">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
          </div>
          
          <h3 className="auth-title">Link Levera Account</h3>
          <p className="auth-description">
            Connect your extension to synchronize solved problems and access personalized AI mentorship dashboard.
          </p>

          {authError && (
            <div className="error-banner" style={{ width: "100%", justifyContent: "center" }}>
              <span>{authError}</span>
            </div>
          )}

          {!deviceCodeInfo ? (
            <button onClick={startLogin} className="btn-analyze" disabled={authLoading}>
              {authLoading ? (
                <>
                  <span className="spinner" />
                  Generating code...
                </>
              ) : (
                "Sign In with Browser"
              )}
            </button>
          ) : (
            <div className="auth-code-container">
              <span className="auth-code-label">Verification Code</span>
              <div className="auth-code-box">{deviceCodeInfo.userCode}</div>
              
              <div className="auth-status" style={{ margin: "10px 0" }}>
                <span className="spinner" style={{ width: 14, height: 14 }} />
                <span>Waiting for browser approval...</span>
              </div>

              <button 
                onClick={() => chrome.tabs.create({ url: deviceCodeInfo.verifyUrl })}
                className="btn-analyze"
                style={{ marginBottom: 8 }}
              >
                Open Verification URL
              </button>

              <button onClick={cancelLogin} className="btn-secondary">
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    );
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

        <div className="user-profile">
          {user?.image ? (
            <img src={user.image} alt={user.name || "User"} className="user-avatar" />
          ) : (
            <div className="user-avatar" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: "bold", color: "var(--primary-accent)" }}>
              {user?.name?.slice(0, 2).toUpperCase() || user?.email?.slice(0, 2).toUpperCase() || "US"}
            </div>
          )}
          <span className="user-name">{user?.name || user?.email?.split("@")[0]}</span>
          <button onClick={logout} className="btn-icon" title="Sign Out">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
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
                      codeTagProps={{
                        style: {
                          backgroundColor: "transparent",
                          padding: 0,
                          borderRadius: 0,
                        }
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
