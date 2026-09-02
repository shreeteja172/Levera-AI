"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { notFound, useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { useSession } from "@/lib/auth-client";
import { SUPPORTED_MODELS, type ModelOption } from "@/lib/ai/model-list";
import { OnboardingLanguageModal } from "@/components/dashboard/OnboardingLanguageModal";
import { extractProblemData } from "@/lib/chat-utils";
import { cn } from "@/lib/utils";
import { useThinkingWord } from "../hooks/useThinkingWord";

import { PreBlock } from "./PreBlock";
import { ChatHeader } from "./ChatHeader";
import { ChatWelcome } from "./ChatWelcome";
import { ChatInput } from "./ChatInput";
import { MessageList } from "./MessageList";
import { CodeBlock } from "@/components/problem/CodeBlock";

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
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
        const slugs = res.data
          .map((sp: { problem?: { slug?: string } }) => sp.problem?.slug)
          .filter(Boolean) as string[];
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

  const [hintMode, setHintMode] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("levera_progressive_hints");
      setHintMode(saved === "true");
    }
  }, []);

  const handleToggleHintMode = (val: boolean) => {
    setHintMode(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("levera_progressive_hints", String(val));
    }
  };

  const {
    data: session,
    isPending: sessionPending,
    refetch: refetchSession,
  } = useSession();
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  useEffect(() => {
    if (
      !sessionPending &&
      session?.user &&
      !(session.user as { preferredLanguage?: string }).preferredLanguage
    ) {
      setOnboardingOpen(true);
    }
  }, [session, sessionPending]);

  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    const hour = new Date().getHours();
    let pool: string[];

    if (hour >= 5 && hour < 12) {
      pool = ["Good morning", "Morning", "Bright and early", "Up and at it"];
    } else if (hour < 17) {
      pool = ["Good afternoon", "Afternoon", "Back at it", "Hey there"];
    } else if (hour < 22) {
      pool = ["Good evening", "Evening", "Winding down", "Hey there"];
    } else {
      pool = [
        "Still up",
        "Burning the midnight oil",
        "Late one tonight",
        "One more problem",
      ];
    }

    setGreeting(pool[Math.floor(Math.random() * pool.length)] ?? "Hello");
  }, []);

  const firstName = session?.user?.name ? session.user.name.split(" ")[0] : "";
  const displayName = firstName || "there";

  const isThinking =
    loading &&
    (messages.length === 0 ||
      messages[messages.length - 1]?.content === "" ||
      (messages[messages.length - 1]?.role === "assistant" &&
        messages[messages.length - 1]?.content.includes("<think>") &&
        !messages[messages.length - 1]?.content.includes("</think>")));

  const thinkingWord = useThinkingWord(loading);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);
  const scrollRafRef = useRef<number | null>(null);
  const latestChatIdRef = useRef<string | null>(null);
  const chatTitleRef = useRef<string | null>(null);

  useEffect(() => {
    chatTitleRef.current = chatTitle;
  }, [chatTitle]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [missingChat, setMissingChat] = useState(false);

  const scrollToBottom = useCallback((force = false) => {
    if (force) shouldAutoScrollRef.current = true;
    else if (!shouldAutoScrollRef.current) return;

    if (scrollRafRef.current !== null) cancelAnimationFrame(scrollRafRef.current);
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = null;
      const container = scrollContainerRef.current;
      if (!container) return;

      if (force) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      } else {
        container.scrollTop = container.scrollHeight;
      }
    });
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const THRESHOLD = 150;

    const handleScroll = () => {
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      shouldAutoScrollRef.current = distanceFromBottom <= THRESHOLD;
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY < 0) shouldAutoScrollRef.current = false;
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? 0;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY ?? 0;
      if (y > touchStartY) shouldAutoScrollRef.current = false;
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    container.addEventListener("wheel", handleWheel, { passive: true });
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      container.removeEventListener("scroll", handleScroll);
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      if (scrollRafRef.current !== null) cancelAnimationFrame(scrollRafRef.current);
    };
  }, []);

  const fetchChatSession = useCallback(
    async (id: string | null) => {
      latestChatIdRef.current = id;
      setChatError(null);
      setMissingChat(false);
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
          setTimeout(() => scrollToBottom(true), 50);
        } else {
          setMissingChat(true);
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
    [scrollToBottom],
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
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom(false);
  }, [messages, loading, scrollToBottom]);

  const saveProblem = async (content: string) => {
    try {
      const problem = extractProblemData(content);

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
    if (loading) return;

    const prompt = (textToSend || inputMessage).trim();
    if (!prompt) return;

    setInputMessage("");
    setLoading(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const userMessage: Message = { role: "user", content: prompt };
    const assistantPlaceholder: Message = { role: "assistant", content: "" };
    const tempMessages = [...messages, userMessage, assistantPlaceholder];
    setMessages(tempMessages);

    setTimeout(() => scrollToBottom(true), 0);

    let currentId = activeChatId;

    try {
      let response: Response;
      if (!currentId) {
        const normalizedTitle = prompt.replace(/\s+/g, " ").trim();
        const title =
          normalizedTitle.length > 35
            ? normalizedTitle.substring(0, 35) + "..."
            : normalizedTitle;
        response = await fetch("/api/chats", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            message: prompt,
            provider: selectedModel.provider,
            model: selectedModel.id,
            hintMode,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          let errMsg = "Failed to create chat";
          try {
            const body = await response.json();
            errMsg = body.error || errMsg;
          } catch {
            // ignore
          }
          throw new Error(errMsg);
        }

        const newChatId = response.headers.get("x-chat-id");
        const rawChatTitle = response.headers.get("x-chat-title");
        let chatTitleVal: string | null = null;
        if (rawChatTitle) {
          try {
            chatTitleVal = decodeURIComponent(rawChatTitle);
          } catch {
            chatTitleVal = rawChatTitle;
          }
        }
        if (newChatId) {
          currentId = newChatId;
          setActiveChatId(currentId);
          setChatTitle(chatTitleVal || title);
          window.dispatchEvent(new CustomEvent("levera_chats_updated"));
          window.history.replaceState(null, "", `/dashboard/chat/${currentId}`);
        }
      } else {
        response = await fetch(`/api/chats/${currentId}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: prompt,
            provider: selectedModel.provider,
            model: selectedModel.id,
            hintMode,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          let errMsg = "Failed to append message";
          try {
            const body = await response.json();
            errMsg = body.error || errMsg;
          } catch {
            // ignore
          }
          throw new Error(errMsg);
        }
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body reader available.");
      }

      const decoder = new TextDecoder();
      let streamedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        streamedText += chunk;

        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0 && updated[lastIdx]?.role === "assistant") {
            updated[lastIdx] = {
              ...updated[lastIdx],
              content: streamedText,
            };
          }
          return updated;
        });
      }

      if (currentId) {
        const detected = extractProblemData(streamedText).title;
        if (
          detected &&
          detected !== "Unknown Problem" &&
          detected !== chatTitleRef.current
        ) {
          const nextTitle = detected.slice(0, 80);
          setChatTitle(nextTitle);
          try {
            await axios.patch(`/api/chats/${currentId}`, {
              title: nextTitle,
            });
            window.dispatchEvent(new CustomEvent("levera_chats_updated"));
          } catch (e) {
            console.error("Failed to rename chat:", e);
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }

      let errorMsg = "Failed to contact the server.";
      if (err instanceof Error) {
        errorMsg = err.message;
      }

      setMessages((prev) => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        const errMsgContent = `Error: ${errorMsg}\n\n⚠️ Response interrupted.`;
        if (lastIdx >= 0 && updated[lastIdx]?.role === "assistant") {
          updated[lastIdx] = {
            ...updated[lastIdx],
            content: errMsgContent,
          };
        } else {
          updated.push({
            role: "assistant",
            content: errMsgContent,
          });
        }
        return updated;
      });
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      setLoading(false);
    }
  }

  const isLanguageUnset =
    !sessionPending &&
    session?.user &&
    !(session.user as { preferredLanguage?: string }).preferredLanguage;

  function renderChatInput(className = "max-w-5xl") {
    return (
      <ChatInput
        className={className}
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        loading={loading}
        chatLoading={chatLoading}
        sessionPending={sessionPending}
        isLanguageUnset={!!isLanguageUnset}
        mounted={mounted}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        isModelSelectorOpen={isModelSelectorOpen}
        setIsModelSelectorOpen={setIsModelSelectorOpen}
        onSendMessage={sendMessage}
        setOnboardingOpen={setOnboardingOpen}
        hintMode={hintMode}
        onToggleHintMode={handleToggleHintMode}
      />
    );
  }

  const markdownComponents = {
    pre({ children }: React.ComponentPropsWithoutRef<"pre">) {
      const isCodeBlock = React.Children.toArray(children).some(
        (child: any) =>
          child &&
          child.type === "code" &&
          child.props &&
          child.props.className,
      );
      if (isCodeBlock) {
        return <>{children}</>;
      }
      return <PreBlock>{children}</PreBlock>;
    },
    code({
      className,
      children,
      ...props
    }: React.ComponentPropsWithoutRef<"code">) {
      const inline = !className;
      if (inline) {
        return (
          <code
            className="rounded bg-zinc-100 dark:bg-zinc-800/80 px-1.5 py-0.5 text-orange-600 dark:text-orange-400 font-mono text-xs before:content-none after:content-none"
            {...props}
          >
            {children}
          </code>
        );
      }

      const match = /language-(\w+)/.exec(className || "");
      const lang = match ? match[1]! : "text";
      const codeString = String(children).replace(/\n$/, "");

      return (
        <div className="my-4">
          <CodeBlock
            language={lang}
            filename={lang.toUpperCase()}
            code={codeString}
          />
        </div>
      );
    },
    table: ({ children }: React.ComponentPropsWithoutRef<"table">) => (
      <div className="my-4 w-full overflow-x-auto">
        <table className="w-full text-sm">{children}</table>
      </div>
    ),
    h1: ({ children }: React.ComponentPropsWithoutRef<"h1">) => (
      <h1 className="mb-4 mt-6 text-lg sm:text-xl font-bold text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-900 pb-1">
        {children}
      </h1>
    ),
    h2: ({ children }: React.ComponentPropsWithoutRef<"h2">) => (
      <h2 className="mb-3 mt-5 text-lg font-semibold text-zinc-900 dark:text-white">{children}</h2>
    ),
    p: ({ children }: React.ComponentPropsWithoutRef<"p">) => (
      <p className="my-3 leading-relaxed text-zinc-700 dark:text-zinc-300">{children}</p>
    ),
    // Suppress custom XML tags that may leak through rehypeRaw during streaming
    problem: () => null,
    think: () => null,
    hints: () => null,
    solutions: () => null,
    brute: () => null,
    better: () => null,
    optimal: () => null,
    hint1: () => null,
    hint2: () => null,
    pattern: () => null,
    pseudocode: () => null,
  };

  if (missingChat) {
    notFound();
  }

  const showWelcome =
    messages.length === 0 &&
    !chatError &&
    !chatLoading &&
    mounted &&
    !sessionPending;

  const welcomeSkeleton =
    !chatId && (!mounted || sessionPending || chatLoading);

  const centeredLayout = showWelcome || welcomeSkeleton;

  return (
    <div className="flex flex-col h-dvh bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white relative">
      <ChatHeader
        activeChatId={activeChatId}
        chatTitle={chatTitle}
        onDeleteChat={deleteChat}
      />

      <div
        ref={scrollContainerRef}
        className={cn(
          "flex-1 overflow-y-auto px-4 md:px-8 space-y-6",
          centeredLayout ? "py-0" : "pt-6 pb-32",
        )}
      >
        {showWelcome ? (
          <ChatWelcome
            greeting={greeting}
            displayName={displayName}
            renderChatInput={renderChatInput}
            onSelectSuggestion={sendMessage}
          />
        ) : (
          <MessageList
            messages={messages}
            loading={loading}
            chatLoading={chatLoading}
            chatError={chatError}
            sessionPending={sessionPending}
            mounted={mounted}
            chatId={chatId}
            isThinking={Boolean(isThinking)}
            thinkingWord={thinkingWord}
            chatTitle={chatTitle}
            savedProblemSlugs={savedProblemSlugs}
            onSaveProblem={saveProblem}
            messagesEndRef={messagesEndRef}
            markdownComponents={markdownComponents}
          />
        )}
      </div>

      {!centeredLayout && (
        <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-4 sm:p-4 md:p-6 bg-gradient-to-t from-zinc-50 dark:from-zinc-950 via-zinc-50/70 dark:via-zinc-950/70 to-transparent z-20 pointer-events-none">
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
