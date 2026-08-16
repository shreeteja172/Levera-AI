"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  MessageSquare,
  Trash2,
  ExternalLink,
  Calendar,
  Search,
  Trash,
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SkeletonBlock } from "@/components/ui/skeleton-block";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

export default function RecentChatsPage() {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadChats = async () => {
    setError(null);
    setLoading(true);
    const startTime = Date.now();
    try {
      const res = await axios.get("/api/chats?limit=20");
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < 200) {
        await new Promise((resolve) => setTimeout(resolve, 200 - elapsedTime));
      }
      setChats(res.data.data || []);
      setNextCursor(res.data.pagination?.nextCursor || null);
      setHasMore(res.data.pagination?.hasMore || false);
    } catch (e) {
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < 200) {
        await new Promise((resolve) => setTimeout(resolve, 200 - elapsedTime));
      }
      let msg = "Failed to load chat history.";
      if (axios.isAxiosError(e) && e.response?.data?.error) {
        msg = e.response.data.error;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChats();
  }, []);

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await axios.get(`/api/chats?limit=20&cursor=${nextCursor}`);
      setChats((prev) => [...prev, ...(res.data.data || [])]);
      setNextCursor(res.data.pagination?.nextCursor || null);
      setHasMore(res.data.pagination?.hasMore || false);
    } catch (e) {
      console.error("Failed to load more chats:", e);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/chats/${id}`);
      setChats((prev) => prev.filter((c) => c.id !== id));
      window.dispatchEvent(new CustomEvent("levera_chats_updated"));
    } catch (e) {
      console.error("Failed to delete chat:", e);
    }
  };

  const handleClearAll = async () => {
    if (
      confirm(
        "Are you sure you want to delete all chat history? This action cannot be undone.",
      )
    ) {
      try {
        await axios.delete("/api/chats");
        setChats([]);
        window.dispatchEvent(new CustomEvent("levera_chats_updated"));
      } catch (e) {
        console.error("Failed to clear history:", e);
      }
    }
  };

  const filteredChats = chats.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.messages.some((m) =>
        m.content.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white">
      <header className="flex h-14 items-center justify-between border-b border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 px-6 shrink-0">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white" />
          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
          <span className="text-sm font-medium tracking-wide text-zinc-700 dark:text-zinc-300">
            Recent Chats History
          </span>
        </div>
        {chats.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/25 transition-all"
          >
            <Trash size={13} />
            <span>Clear History</span>
          </button>
        )}
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-zinc-900 dark:text-white mb-2">
            Conversation History
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Search, manage, or reload your past Levera AI troubleshooting
            sessions.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-900 p-4 rounded-2xl">
          <div className="relative w-full sm:flex-1">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              type="text"
              placeholder="Search chat titles or contents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm text-zinc-900 dark:text-zinc-200 placeholder-zinc-500 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:ring-0 transition-all"
            />
          </div>
          <div className="text-xs text-zinc-500 shrink-0 font-medium self-end sm:self-center">
            Total Sessions:{" "}
            <span className="text-zinc-700 dark:text-zinc-300 font-medium">{chats.length}</span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex flex-col justify-between p-5 rounded-2xl border border-zinc-200 dark:border-zinc-900 bg-zinc-100/40 dark:bg-zinc-900/10 animate-pulse space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 w-full">
                      <div className="p-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-800 w-7 h-7" />
                      <SkeletonBlock
                        width="45%"
                        height="16px"
                        rounded="rounded-md"
                      />
                    </div>
                    <SkeletonBlock
                      width="48px"
                      height="18px"
                      rounded="rounded"
                    />
                  </div>
                  <div className="space-y-2">
                    <SkeletonBlock
                      width="100%"
                      height="12px"
                      rounded="rounded-md"
                    />
                    <SkeletonBlock
                      width="75%"
                      height="12px"
                      rounded="rounded-md"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-5 pt-3 border-t border-zinc-200/60 dark:border-zinc-900/60">
                  <SkeletonBlock
                    width="70px"
                    height="14px"
                    rounded="rounded-md"
                  />
                  <div className="flex items-center gap-1.5">
                    <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                    <div className="w-16 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-red-500/20 bg-red-500/5 min-h-[300px]">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-4">
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
            <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">
              Failed to load conversations
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mb-6">{error}</p>
            <button
              onClick={loadChats}
              className="bg-red-500/25 hover:bg-red-500/40 text-red-200 border border-red-500/30 font-medium text-xs px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950 min-h-[300px]">
            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 mb-4 animate-pulse">
              <MessageSquare size={20} />
            </div>
            <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-1">
              {searchQuery ? "No matching chats found" : "No chats yet"}
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm">
              {searchQuery
                ? "Try adjusting your search keywords to find what you're looking for."
                : "Ask Levera AI questions to build up your troubleshooting history."}
            </p>
            {!searchQuery && (
              <Link
                href="/dashboard"
                className="mt-6 bg-orange-600 hover:bg-orange-500 text-white! font-medium text-xs px-5 py-2.5 rounded-lg transition-colors"
              >
                Start Chatting
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  className="group relative flex flex-col justify-between p-5 rounded-2xl border border-zinc-200 dark:border-zinc-900 bg-zinc-50/60 dark:bg-zinc-900/20 hover:bg-zinc-100 dark:hover:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-800 transition-all duration-200"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-orange-600/10 text-orange-600 dark:text-orange-500 shrink-0 border border-orange-500/10">
                          <MessageSquare size={14} />
                        </div>
                        <h3 className="font-medium text-sm text-zinc-800 dark:text-zinc-200 line-clamp-1 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">
                          {chat.title}
                        </h3>
                      </div>
                      <span className="text-[10px] bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border border-zinc-200 dark:border-zinc-800/80 px-2 py-0.5 rounded">
                        {chat.messages.length} msgs
                      </span>
                    </div>

                    <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed h-8">
                      {chat.messages[0]?.content || "Empty conversation."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-5 pt-3 border-t border-zinc-200/60 dark:border-zinc-900/60">
                    <span className="flex items-center gap-1 text-[10px] text-zinc-500 font-medium">
                      <Calendar size={11} />
                      {new Date(chat.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleDelete(chat.id)}
                        className="p-2 rounded-lg text-zinc-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 border border-zinc-200 dark:border-zinc-900 hover:border-red-500/25 transition-all"
                        title="Delete chat"
                      >
                        <Trash2 size={13} />
                      </button>
                      <Link
                        href={`/dashboard/chat/${chat.id}`}
                        className="flex items-center gap-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-white! px-3 py-2 rounded-lg border border-zinc-700/30 transition-all font-medium"
                      >
                        <span>Open</span>
                        <ExternalLink size={11} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {hasMore && !searchQuery && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-6 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loadingMore ? (
                    <>
                      <div className="w-4 h-4 border-2 border-zinc-400 dark:border-zinc-500 border-t-zinc-700 dark:border-t-zinc-200 rounded-full animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
