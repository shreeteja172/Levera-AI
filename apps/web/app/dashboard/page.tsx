"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import axios from "axios";
import { Send, Trash2, ArrowRight, Copy, Check } from "lucide-react";
import "highlight.js/styles/github-dark.css";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function PreBlock({ children }: { children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);

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

function DashboardChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatId = searchParams.get("chatId");

  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchChatSession = async () => {
      if (chatId) {
        try {
          const res = await axios.get(`/api/chats/${chatId}`);
          if (res.data && !res.data.notFound) {
            setMessages(res.data.messages);
            setActiveChatId(chatId);
            return;
          } else {
            router.push("/dashboard");
          }
        } catch (e) {
          console.error("Error loading chat session:", e);
        }
      }
      setMessages([]);
      setActiveChatId(null);
    };

    fetchChatSession();
  }, [chatId]);

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
        const title = prompt.length > 35 ? prompt.substring(0, 35) + "..." : prompt;
        const createRes = await axios.post("/api/chats", {
          title,
          message: prompt,
        });
        currentId = createRes.data.id;
        setMessages(createRes.data.messages);
        setActiveChatId(currentId);
        window.dispatchEvent(new CustomEvent("levera_chats_updated"));
        router.push(`/dashboard?chatId=${currentId}`);
      } else {
        const appendRes = await axios.post(`/api/chats/${currentId}/messages`, {
          content: prompt,
        });
        setMessages(appendRes.data.messages);
        window.dispatchEvent(new CustomEvent("levera_chats_updated"));
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Failed to contact the server.";
      const errorAssistantMessage: Message = {
        role: "assistant",
        content: `Error: ${errorMsg}`,
      };
      setMessages([...tempMessages, errorAssistantMessage]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-white relative">
      <header className="flex h-14 items-center justify-between border-b border-zinc-900 bg-zinc-950 px-6 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-zinc-400 hover:text-white" />
          <div className="h-4 w-px bg-zinc-800" />
          <span className="text-sm font-semibold tracking-wide text-zinc-300">
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

      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="max-w-2xl mx-auto h-full flex flex-col justify-center items-center text-center space-y-8 py-12">
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-500">
                How can Levera AI help?
              </h1>
              <p className="text-sm text-zinc-400 max-w-md mx-auto">
                Ask about DSA concepts, request code dry runs, or get help with problem complexity analysis.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
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
                  className="flex items-center justify-between p-4 rounded-xl border border-zinc-900 bg-zinc-900/30 hover:bg-zinc-900/60 hover:border-zinc-800 text-left text-xs text-zinc-300 transition-all duration-200"
                >
                  <span>{suggestion}</span>
                  <ArrowRight size={14} className="text-zinc-600 group-hover:text-zinc-400 shrink-0 ml-2" />
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
                  className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm ${
                    msg.role === "user"
                      ? "bg-zinc-900 border border-zinc-850 text-white rounded-br-none"
                      : "bg-zinc-900/40 border border-zinc-900 text-zinc-100 rounded-bl-none prose prose-invert prose-sm"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                      components={{
                        pre({ children }) {
                          return <PreBlock>{children}</PreBlock>;
                        },
                        code({ className, children, ...props }) {
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
                        h1: ({ children }) => (
                          <h1 className="mb-4 mt-6 text-xl font-bold text-white border-b border-zinc-900 pb-1">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="mb-3 mt-5 text-lg font-semibold text-white">
                            {children}
                          </h2>
                        ),
                        p: ({ children }) => (
                          <p className="my-3 leading-relaxed text-zinc-300">{children}</p>
                        ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  )}
                </div>
                <span className="text-[10px] text-zinc-600 mt-1 px-1.5 uppercase font-semibold">
                  {msg.role === "user" ? "You" : "Levera AI"}
                </span>
              </div>
            ))}

            {loading && (
              <div className="flex flex-col items-start">
                <div className="rounded-2xl rounded-bl-none px-5 py-3.5 bg-zinc-900/40 border border-zinc-900 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-[10px] text-zinc-600 mt-1 px-1.5 uppercase font-semibold">
                  Thinking
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="p-4 md:p-6 border-t border-zinc-900 bg-zinc-950 shrink-0 z-20">
        <div className="max-w-3xl mx-auto relative flex items-center bg-zinc-900 border border-zinc-850 rounded-2xl p-2 focus-within:border-zinc-800 transition-all">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type a message or paste a DSA problem description..."
            rows={1}
            className="flex-1 max-h-32 resize-none outline-none border-none bg-transparent py-2.5 px-3 text-sm text-zinc-200 placeholder-zinc-500 [scrollbar-width:none] focus:ring-0"
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !inputMessage.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-600 text-white hover:bg-orange-500 disabled:opacity-30 disabled:hover:bg-orange-600 transition-colors shadow-lg shadow-orange-600/10"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardChatPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        Loading Levera AI...
      </div>
    }>
      <DashboardChatContent />
    </Suspense>
  );
}