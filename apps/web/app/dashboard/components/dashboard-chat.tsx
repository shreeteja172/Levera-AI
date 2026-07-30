"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import axios from "axios";
import toast from "react-hot-toast";
import { SkeletonBlock } from "@/components/ui/skeleton-block";
import {
  Send,
  Trash2,
  ArrowRight,
  Copy,
  Check,
  ChevronDown,
} from "lucide-react";
import "highlight.js/styles/github-dark.css";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useSession } from "@/lib/auth-client";
import { SUPPORTED_MODELS, type ModelOption } from "@/lib/ai/model-list";
import { OnboardingLanguageModal } from "@/components/dashboard/OnboardingLanguageModal";
import {
  ModelSelector,
  ModelSelectorTrigger,
  ModelSelectorContent,
  ModelSelectorInput,
  ModelSelectorList,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorItem,
  ModelSelectorName,
  ModelSelectorLogo,
} from "@/components/ai-elements/model-selector";

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
}

function PreBlock({ children }: { children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const extractText = (node: any): string => {
    if (!node) return "";
    if (typeof node === "string") return node;
    if (typeof node === "number") return String(node);
    if (Array.isArray(node)) return node.map(extractText).join("");
    if (node?.props?.children) return extractText(node.props.children);
    return "";
  };

  const handleCopy = async () => {
    const codeText = extractText(children);
    if (!codeText) return;
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code: ", err);
    }
  };

  return (
    <pre className="relative my-4 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 group">
      <div className="absolute right-3 top-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg hover:bg-zinc-850 transition-all font-sans font-medium cursor-pointer"
        >
          {copied ? (
            <>
              <Check size={12} className="text-green-500" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      {children}
    </pre>
  );
}

interface ParsedContent {
  type: "text" | "solutions";
  text?: string;
  brute?: string;
  better?: string;
  optimal?: string;
}

function parseMessageContent(content: string): ParsedContent[] {
  const cleanContent = content.replace(/<problem>([\s\S]*?)<\/problem>/g, "").trim();
  const parts: ParsedContent[] = [];
  const regex = /<solutions>([\s\S]*?)<\/solutions>/g;

  let lastIndex = 0;
  let match;

  while ((match = regex.exec(cleanContent)) !== null) {
    const textBefore = cleanContent.substring(lastIndex, match.index);
    if (textBefore.trim()) {
      parts.push({ type: "text", text: textBefore });
    }

    const solutionsContent = match[1] ?? "";

    const bruteMatch = /<brute>([\s\S]*?)<\/brute>/.exec(solutionsContent);
    const betterMatch = /<better>([\s\S]*?)<\/better>/.exec(solutionsContent);
    const optimalMatch = /<optimal>([\s\S]*?)<\/optimal>/.exec(
      solutionsContent,
    );

    parts.push({
      type: "solutions",
      brute: bruteMatch?.[1]?.trim(),
      better: betterMatch?.[1]?.trim(),
      optimal: optimalMatch?.[1]?.trim(),
    });

    lastIndex = regex.lastIndex;
  }

  const textAfter = cleanContent.substring(lastIndex);
  if (textAfter.trim()) {
    parts.push({ type: "text", text: textAfter });
  }

  if (parts.length === 0) {
    parts.push({ type: "text", text: cleanContent });
  }

  return parts;
}

function createSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

function extractProblemData(content: string) {
  const problemMatch = /<problem>([\s\S]*?)<\/problem>/.exec(content);

  const solutions = parseMessageContent(content).find(
    (part) => part.type === "solutions",
  );

  let language = "cpp";
  const solutionText = solutions?.optimal || solutions?.better || solutions?.brute;
  if (solutionText) {
    const langMatch = /```(\w+)/.exec(solutionText);
    if (langMatch?.[1]) {
      const parsedLang = langMatch[1].toLowerCase();
      if (parsedLang === "py") {
        language = "python";
      } else if (parsedLang === "js") {
        language = "javascript";
      } else if (parsedLang === "ts") {
        language = "typescript";
      } else if (parsedLang === "cs") {
        language = "csharp";
      } else {
        language = parsedLang;
      }
    }
  }

  return {
    title: problemMatch?.[1]?.trim() || "Unknown Problem",
    brute: solutions?.brute || null,
    better: solutions?.better || null,
    optimal: solutions?.optimal || null,
    language,
  };
}

export function DashboardChat({ chatId }: { chatId: string | null }) {
  const router = useRouter();

  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatTitle, setChatTitle] = useState<string | null>(null);
  const [savedProblemSlugs, setSavedProblemSlugs] = useState<string[]>([]);

  const fetchSavedProblems = useCallback(async () => {
    try {
      const res = await axios.get("/api/saved-problems");
      if (Array.isArray(res.data)) {
        const slugs = res.data.map((sp: { problem?: { slug?: string } }) => sp.problem?.slug).filter(Boolean) as string[];
        setSavedProblemSlugs(slugs);
      }
    } catch (e) {
      console.error("Failed to fetch saved problems:", e);
    }
  }, []);

  useEffect(() => {
    fetchSavedProblems();
  }, [fetchSavedProblems]);


  const [selectedModel, setSelectedModel] = useState<ModelOption>(
    SUPPORTED_MODELS[0]!,
  );
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: session, isPending: sessionPending, refetch: refetchSession } = useSession();
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  useEffect(() => {
    if (!sessionPending && session?.user && !(session.user as any).preferredLanguage) {
      setOnboardingOpen(true);
    }
  }, [session, sessionPending]);
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good morning");
    } else if (hour < 18) {
      setGreeting("Good afternoon");
    } else {
      setGreeting("Good evening");
    }
  }, []);

  const firstName = session?.user?.name ? session.user.name.split(" ")[0] : "";
  const displayName = firstName || "there";

  const [thinkingWord, setThinkingWord] = useState("thinking");

  useEffect(() => {
    if (!loading) {
      setThinkingWord("thinking");
      return;
    }

    const words = [
      "thinking",
      "cogitating",
      "sleuthing",
      "mulling",
      "weighing",
      "honing",
      "fathoming",
      "sifting",
      "crystalising",
      "musing",
      "pondering",
      "contemplating",
      "figuring",
      "reckoning",
      "untangling",
      "triangluating",
      "picturing",
    ];

    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % words.length;
      setThinkingWord(words[currentIndex]!);
    }, 1500);

    return () => clearInterval(interval);
  }, [loading]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const latestChatIdRef = useRef<string | null>(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const fetchChatSession = useCallback(
    async (id: string | null) => {
      latestChatIdRef.current = id;
      setChatError(null);
      if (!id) {
        setMessages([]);
        setActiveChatId(null);
        setChatTitle(null);
        setChatLoading(false);
        return;
      }
      setChatLoading(true);
      setMessages([]);
      const startTime = Date.now();
      try {
        const res = await axios.get(`/api/chats/${id}`);
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime < 200) {
          await new Promise((resolve) =>
            setTimeout(resolve, 200 - elapsedTime),
          );
        }
        if (latestChatIdRef.current !== id) return;
        if (res.data && !res.data.notFound) {
          setMessages(res.data.messages);
          setActiveChatId(id);
          setChatTitle(res.data.title || null);
        } else {
          router.push("/dashboard");
        }
      } catch (e) {
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime < 200) {
          await new Promise((resolve) =>
            setTimeout(resolve, 200 - elapsedTime),
          );
        }
        if (latestChatIdRef.current !== id) return;
        let msg = "Failed to load the conversation.";
        if (axios.isAxiosError(e) && e.response?.data?.error) {
          msg = e.response.data.error;
        }
        setChatError(msg);
      } finally {
        if (latestChatIdRef.current === id) {
          setChatLoading(false);
        }
      }
    },
    [router],
  );

  useEffect(() => {
    fetchChatSession(chatId);
  }, [chatId, fetchChatSession]);

  useEffect(() => {
    const handleNewChatEvent = () => {
      setMessages([]);
      setActiveChatId(null);
      setInputMessage("");
    };

    window.addEventListener("levera_new_chat", handleNewChatEvent);
    return () => {
      window.removeEventListener("levera_new_chat", handleNewChatEvent);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [inputMessage]);

  const saveProblem = async (content: string) => {
    try {
      const problem = extractProblemData(content);

      if (problem.title === "Unknown Problem" && chatTitle) {
        problem.title = chatTitle;
      }

      console.log("Saving:", problem);

      const savePromise = axios.post("/api/saved-problems", problem);

      await toast.promise(savePromise, {
        loading: "Saving problem...",
        success: "Problem saved successfully!",
        error: "Failed to save problem.",
      });

      fetchSavedProblems();
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  const deleteChat = async (id: string) => {
    try {
      await axios.delete(`/api/chats/${id}`);
      window.dispatchEvent(new CustomEvent("levera_chats_updated"));
      if (activeChatId === id) {
        router.push("/dashboard");
      }
    } catch (e) {
      console.error("Failed to delete chat:", e);
    }
  };

  async function sendMessage(textToSend?: string) {
    const prompt = (textToSend || inputMessage).trim();
    if (!prompt) return;

    setInputMessage("");

    setLoading(true);

    const userMessage: Message = { role: "user", content: prompt };
    const tempMessages = [...messages, userMessage];
    setMessages(tempMessages);

    let currentId = activeChatId;

    try {
      if (!currentId) {
        const title =
          prompt.length > 35 ? prompt.substring(0, 35) + "..." : prompt;
        const createRes = await axios.post("/api/chats", {
          title,
          message: prompt,
          provider: selectedModel.provider,
          model: selectedModel.id,
        });
        console.log(createRes);
        currentId = createRes.data.id;
        setMessages(createRes.data.messages);
        setActiveChatId(currentId);
        setChatTitle(createRes.data.title || title);
        window.dispatchEvent(new CustomEvent("levera_chats_updated"));
        window.history.replaceState(null, "", `/dashboard/chat/${currentId}`);
      } else {
        const appendRes = await axios.post(`/api/chats/${currentId}/messages`, {
          content: prompt,
          provider: selectedModel.provider,
          model: selectedModel.id,
        });
        // console.log(appendRes);
        setMessages(appendRes.data.messages);
        setChatTitle(appendRes.data.title || chatTitle);
        window.dispatchEvent(new CustomEvent("levera_chats_updated"));
      }
    } catch (err) {
      const errorMsg =
        axios.isAxiosError(err)
          ? err.response?.data?.error || err.message
          : err instanceof Error ? err.message : "Failed to contact the server.";
      const errorAssistantMessage: Message = {
        role: "assistant",
        content: `Error: ${errorMsg}`,
      };
      setMessages([...tempMessages, errorAssistantMessage]);
    } finally {
      setLoading(false);
    }
  }

  function renderChatInput(className = "max-w-5xl") {
    const isLanguageUnset = !sessionPending && session?.user && !(session.user as any).preferredLanguage;

    return (
      <div
        className={`w-full ${className} mx-auto relative flex flex-col bg-zinc-900 border border-zinc-850 rounded-2xl p-2 focus-within:border-zinc-800 transition-all pointer-events-auto shadow-2xl`}
      >
        <textarea
          ref={textareaRef}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          disabled={!mounted || loading || chatLoading || sessionPending || isLanguageUnset}
          placeholder={isLanguageUnset ? "Select a preferred programming language to start chatting..." : "Type a message or paste a DSA problem description..."}
          rows={1}
          className="w-full max-h-32 resize-none outline-none border-none bg-transparent py-2.5 px-3 text-sm text-zinc-200 placeholder-zinc-500 focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <div className="flex items-center justify-between border-t border-zinc-850/50 mt-1 pt-2 px-2">
          <ModelSelector
            open={isModelSelectorOpen}
            onOpenChange={
              chatLoading || sessionPending ? () => {} : setIsModelSelectorOpen
            }
          >
            <ModelSelectorTrigger
              render={
                <button
                  disabled={!mounted || chatLoading || loading || sessionPending}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-zinc-850 hover:border-zinc-700 bg-zinc-950 text-zinc-400 hover:text-white text-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ModelSelectorLogo
                    provider={selectedModel.logoProvider}
                    className="size-3.5"
                  />
                  <span className="font-medium">{selectedModel.name}</span>
                  <ChevronDown size={12} className="text-zinc-500" />
                </button>
              }
            />
            <ModelSelectorContent className="w-[300px]">
              <ModelSelectorInput placeholder="Search models..." />
              <ModelSelectorList>
                <ModelSelectorEmpty>No model found.</ModelSelectorEmpty>
                <ModelSelectorGroup heading="Available Models">
                  {SUPPORTED_MODELS.map((model) => (
                    <ModelSelectorItem
                      key={model.id}
                      value={model.name}
                      onSelect={() => {
                        setSelectedModel(model);
                        setIsModelSelectorOpen(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 cursor-pointer rounded-md hover:bg-zinc-900/60 transition-colors text-zinc-300 hover:text-white data-[selected=true]:bg-zinc-900/80 data-[selected=true]:text-white"
                    >
                      <ModelSelectorLogo
                        provider={model.logoProvider}
                        className="size-3.5"
                      />
                      <ModelSelectorName>{model.name}</ModelSelectorName>
                    </ModelSelectorItem>
                  ))}
                </ModelSelectorGroup>
              </ModelSelectorList>
            </ModelSelectorContent>
          </ModelSelector>

          {isLanguageUnset ? (
            <button
              onClick={() => setOnboardingOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold transition-all cursor-pointer shadow-lg shadow-orange-600/10"
            >
              Select Language
            </button>
          ) : (
            <button
              onClick={() => sendMessage()}
              disabled={
                !mounted || loading || chatLoading || sessionPending || !inputMessage.trim()
              }
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-600 text-white hover:bg-orange-500 disabled:opacity-30 disabled:hover:bg-orange-600 transition-colors shadow-lg shadow-orange-600/10"
            >
              <Send size={14} />
            </button>
          )}
        </div>
      </div>
    );
  }

  const markdownComponents = {
    pre({ children }: React.ComponentPropsWithoutRef<"pre">) {
      return <PreBlock>{children}</PreBlock>;
    },
    code({ className, children, ...props }: React.ComponentPropsWithoutRef<"code">) {
      const inline = !className;
      if (inline) {
        return (
          <code
            className="rounded bg-zinc-800/80 px-1.5 py-0.5 text-orange-400 font-mono text-xs before:content-none after:content-none"
            {...props}
          >
            {children}
          </code>
        );
      }
      return (
        <code
          className={`${className} block overflow-x-auto p-4 text-xs font-mono before:content-none after:content-none`}
          {...props}
        >
          {children}
        </code>
      );
    },
    h1: ({ children }: React.ComponentPropsWithoutRef<"h1">) => (
      <h1 className="mb-4 mt-6 text-xl font-bold text-white border-b border-zinc-900 pb-1">
        {children}
      </h1>
    ),
    h2: ({ children }: React.ComponentPropsWithoutRef<"h2">) => (
      <h2 className="mb-3 mt-5 text-lg font-semibold text-white">{children}</h2>
    ),
    p: ({ children }: React.ComponentPropsWithoutRef<"p">) => (
      <p className="my-3 leading-relaxed text-zinc-300">{children}</p>
    ),
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-white relative">
      <header className="flex h-14 items-center justify-between border-b border-zinc-900 bg-zinc-950 px-6 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-zinc-400 hover:text-white" />
          <div className="h-4 w-px bg-zinc-800" />
          <span className="text-sm font-medium tracking-wide text-zinc-300">
            {activeChatId ? "Active Chat Session" : "New Conversation"}
          </span>
        </div>
        {activeChatId && (
          <button
            onClick={() => deleteChat(activeChatId)}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-400 hover:bg-red-500/10 px-2.5 py-1.5 rounded-lg border border-zinc-900 hover:border-red-500/20 transition-all"
            title="Delete this conversation"
          >
            <Trash2 size={13} />
            <span className="hidden sm:inline">Delete Chat</span>
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 pt-6 pb-32 space-y-6">
        {!mounted || sessionPending || chatLoading ? (
          chatId ? (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="flex flex-col items-end">
                <div className="flex items-start gap-3 max-w-[85%]">
                  <div className="flex flex-col items-end gap-2 bg-zinc-900 border border-zinc-850 rounded-2xl rounded-br-none px-5 py-3.5 w-64">
                    <SkeletonBlock
                      width="100%"
                      height="14px"
                      rounded="rounded-md"
                    />
                    <SkeletonBlock
                      width="60%"
                      height="14px"
                      rounded="rounded-md"
                    />
                  </div>
                  <SkeletonBlock
                    width="32px"
                    height="32px"
                    rounded="rounded-full"
                    className="shrink-0"
                  />
                </div>
              </div>

              <div className="flex flex-col items-start w-full">
                <div className="flex items-start gap-3 w-full">
                  <SkeletonBlock
                    width="32px"
                    height="32px"
                    rounded="rounded-full"
                    className="shrink-0"
                  />
                  <div className="flex-1 space-y-2.5 bg-zinc-900/20 border border-zinc-900 rounded-2xl rounded-bl-none p-5">
                    <SkeletonBlock
                      width="80%"
                      height="14px"
                      rounded="rounded-md"
                    />
                    <SkeletonBlock
                      width="95%"
                      height="14px"
                      rounded="rounded-md"
                    />
                    <SkeletonBlock
                      width="45%"
                      height="14px"
                      rounded="rounded-md"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <div className="flex items-start gap-3 max-w-[85%]">
                  <div className="flex flex-col items-end gap-2 bg-zinc-900 border border-zinc-850 rounded-2xl rounded-br-none px-5 py-3.5 w-80">
                    <SkeletonBlock
                      width="100%"
                      height="14px"
                      rounded="rounded-md"
                    />
                    <SkeletonBlock
                      width="40%"
                      height="14px"
                      rounded="rounded-md"
                    />
                  </div>
                  <SkeletonBlock
                    width="32px"
                    height="32px"
                    rounded="rounded-full"
                    className="shrink-0"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto h-full flex flex-col justify-center items-center text-center space-y-6 py-12 animate-pulse">
              <div className="space-y-3 flex flex-col items-center">
                <SkeletonBlock
                  width="320px"
                  height="40px"
                  rounded="rounded-lg"
                  className="bg-zinc-800"
                />
                <SkeletonBlock
                  width="440px"
                  height="16px"
                  rounded="rounded-lg"
                  className="bg-zinc-800/60"
                />
              </div>

              <div className="w-full max-w-3xl">
                <div className="w-full h-24 bg-zinc-900/50 border border-zinc-850 rounded-2xl p-4 flex flex-col justify-between">
                  <SkeletonBlock
                    width="40%"
                    height="14px"
                    rounded="rounded-md"
                    className="bg-zinc-800"
                  />
                  <div className="flex justify-between items-center pt-2 border-t border-zinc-850/50">
                    <SkeletonBlock
                      width="120px"
                      height="24px"
                      rounded="rounded-lg"
                      className="bg-zinc-800"
                    />
                    <div className="w-9 h-9 rounded-xl bg-zinc-850" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl pt-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-xl border border-zinc-900 bg-zinc-900/10 h-12"
                  >
                    <SkeletonBlock
                      width="75%"
                      height="12px"
                      rounded="rounded-md"
                      className="bg-zinc-800/60"
                    />
                    <div className="w-3.5 h-3.5 rounded bg-zinc-800 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )
        ) : chatError ? (
          <div className="max-w-md mx-auto flex flex-col items-center justify-center p-6 border border-red-500/20 bg-red-500/5 rounded-2xl text-center space-y-4 my-12">
            <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
              <svg
                width="20"
                height="20"
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
            <div className="space-y-1">
              <h3 className="font-semibold text-sm text-zinc-200">
                Failed to load chat
              </h3>
              <p className="text-xs text-zinc-500">{chatError}</p>
            </div>
            <button
              onClick={() => fetchChatSession(chatId)}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-medium text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div className="max-w-2xl mx-auto h-full flex flex-col justify-center items-center text-center space-y-6 py-12">
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-zinc-100">
                {greeting}, {displayName}.
              </h1>
              <p className="text-sm text-zinc-400 max-w-md mx-auto">
                How can Levera AI help you today? Ask about DSA concepts, code
                solutions, or complexity analysis.
              </p>
            </div>

            <div className="w-full">{renderChatInput("max-w-3xl")}</div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl pt-2">
              {[
                "Explain the intuition behind Binary Search",
                "How do I analyze time complexity of Recursion?",
                "Provide optimal C++ solution for Two Sum",
                "Explain how a stack differs from a queue",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    sendMessage(suggestion);
                  }}
                  className="flex items-center justify-between p-4 rounded-xl border border-zinc-900 bg-zinc-900/30/30 hover:bg-zinc-900/60 hover:border-zinc-800 text-left text-xs text-zinc-300 transition-all duration-200"
                >
                  <span>{suggestion}</span>
                  <ArrowRight
                    size={14}
                    className="text-zinc-600 group-hover:text-zinc-400 shrink-0 ml-2"
                  />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`rounded-2xl px-5 py-3.5 text-sm ${
                    msg.role === "user"
                      ? "max-w-[85%] bg-zinc-900 border border-zinc-850 text-white rounded-br-none"
                      : "w-full max-w-none bg-zinc-900/40 border border-zinc-900 text-zinc-100 rounded-bl-none prose prose-invert prose-sm"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="space-y-4 w-full">
                      {parseMessageContent(msg.content).map((part, partIdx) => {
                        if (part.type === "text") {
                          return (
                            <ReactMarkdown
                              key={partIdx}
                              remarkPlugins={[remarkGfm]}
                              rehypePlugins={[rehypeHighlight]}
                              components={markdownComponents}
                            >
                              {part.text}
                            </ReactMarkdown>
                          );
                        } else {
                          return (
                            <div
                              key={partIdx}
                              className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full my-4"
                            >
                              {part.brute && (
                                <div className="flex flex-col bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-4 space-y-3 shadow-xl hover:border-zinc-700/80 transition-all">
                                  <div className="flex items-center">
                                    <span className="text-xs font-medium uppercase tracking-wider text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/10">
                                      Brute Force
                                    </span>
                                  </div>
                                  <div className="text-sm prose prose-invert prose-sm max-w-none">
                                    <ReactMarkdown
                                      remarkPlugins={[remarkGfm]}
                                      rehypePlugins={[rehypeHighlight]}
                                      components={markdownComponents}
                                    >
                                      {part.brute}
                                    </ReactMarkdown>
                                  </div>
                                </div>
                              )}

                              {part.better && (
                                <div className="flex flex-col bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-4 space-y-3 shadow-xl hover:border-zinc-700/80 transition-all">
                                  <div className="flex items-center">
                                    <span className="text-xs font-medium uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/10">
                                      Better Approach
                                    </span>
                                  </div>
                                  <div className="text-sm prose prose-invert prose-sm max-w-none">
                                    <ReactMarkdown
                                      remarkPlugins={[remarkGfm]}
                                      rehypePlugins={[rehypeHighlight]}
                                      components={markdownComponents}
                                    >
                                      {part.better}
                                    </ReactMarkdown>
                                  </div>
                                </div>
                              )}

                              {part.optimal && (
                                <div className="flex flex-col bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-4 space-y-3 shadow-xl hover:border-zinc-700/80 transition-all">
                                  <div className="flex items-center">
                                    <span className="text-xs font-medium uppercase tracking-wider text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/10">
                                      Optimal Solution
                                    </span>
                                  </div>
                                  <div className="text-sm prose prose-invert prose-sm max-w-none">
                                    <ReactMarkdown
                                      remarkPlugins={[remarkGfm]}
                                      rehypePlugins={[rehypeHighlight]}
                                      components={markdownComponents}
                                    >
                                      {part.optimal}
                                    </ReactMarkdown>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        }
                      })}
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  )}
                </div>

                {msg.role === "assistant" && msg.content.includes("</solutions>") && (() => {
                  const problemData = extractProblemData(msg.content);
                  const title = problemData.title === "Unknown Problem" && chatTitle ? chatTitle : problemData.title;
                  const slug = createSlug(title);
                  const isSaved = savedProblemSlugs.includes(slug);
                  return (
                    <button
                      onClick={() => !isSaved && saveProblem(msg.content)}
                      disabled={isSaved}
                      className={`mt-2.5 text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
                        isSaved
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 cursor-default font-medium"
                          : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 hover:bg-zinc-850 cursor-pointer"
                      }`}
                    >
                      {isSaved ? (
                        <>
                          <Check size={12} className="text-emerald-400" />
                          <span>Saved to Problems</span>
                        </>
                      ) : (
                        <span>Save as Problem</span>
                      )}
                    </button>
                  );
                })()}

                <span className="text-[10px] text-zinc-600 mt-1 px-1.5 uppercase font-medium">
                  {msg.role === "user" ? "You" : "Levera AI"}
                </span>
              </div>
            ))}

            {loading && (
              <div className="flex flex-col items-start">
                <div className="rounded-2xl rounded-bl-none px-5 py-3.5 bg-zinc-900/40 border border-zinc-900 flex items-center gap-2">
                  <div
                    className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
                <span className="text-[10px] text-zinc-600 mt-1 px-1.5 uppercase font-medium">
                  {thinkingWord}
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {(!mounted || messages.length > 0 || chatLoading || sessionPending) && (
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent z-20 pointer-events-none">
          <div className="max-w-3xl mx-auto pointer-events-auto">
            {renderChatInput("max-w-3xl")}
          </div>
        </div>
      )}
      <OnboardingLanguageModal
        open={onboardingOpen}
        onOpenChange={setOnboardingOpen}
        onSuccess={() => refetchSession()}
      />
    </div>
  );
}
