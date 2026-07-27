"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import axios from "axios";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Plus,
  MessageSquare,
  History,
  BookOpen,
  LogOut,
  User,
  PanelLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { SkeletonBlock } from "@/components/ui/skeleton-block";

interface ChatSession {
  id: string;
  title: string;
  messages: any[];
  createdAt: number;
}

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: sessionData, isPending: sessionPending } = useSession();
  const user = sessionData?.user;
  const { toggleSidebar } = useSidebar();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [recentChats, setRecentChats] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [skeletonCount, setSkeletonCount] = useState(4);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("levera:lastChatCount");
      if (cached) {
        const count = parseInt(cached, 10);
        if (!isNaN(count)) {
          setSkeletonCount(Math.min(Math.max(count, 1), 4));
        }
      }
    }

    const loadChats = async () => {
      setLoading(true);
      const startTime = Date.now();
      try {
        const res = await axios.get("/api/chats");
        const chats = res.data;
        if (typeof window !== "undefined") {
          localStorage.setItem("levera:lastChatCount", String(chats.length));
        }
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime < 200) {
          await new Promise((resolve) => setTimeout(resolve, 200 - elapsedTime));
        }
        setRecentChats(chats.slice(0, 7));
      } catch (e) {
        console.error("Failed to load chats from database:", e);
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime < 200) {
          await new Promise((resolve) => setTimeout(resolve, 200 - elapsedTime));
        }
      } finally {
        setLoading(false);
      }
    };

    loadChats();

    window.addEventListener("levera_chats_updated", loadChats);
    return () => {
      window.removeEventListener("levera_chats_updated", loadChats);
    };
  }, []);

  const handleNewChat = () => {
    router.push("/dashboard");
    window.dispatchEvent(new CustomEvent("levera_new_chat"));
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/auth/sign-in");
  };

  return (
    <Sidebar className="border-r border-zinc-900 bg-zinc-950 text-zinc-200">
      <SidebarHeader className="p-4 flex flex-row items-center justify-between border-b border-zinc-900/60 bg-zinc-950">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-medium text-lg text-white"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="text-orange-500"
          >
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
          </svg>
          <span className="tracking-tight">Levera</span>
        </Link>
        <button
          onClick={toggleSidebar}
          className="text-zinc-500 hover:text-zinc-300 md:hidden p-1 rounded hover:bg-zinc-900"
        >
          <PanelLeft size={18} />
        </button>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4 bg-zinc-950 space-y-6">
        <div className="px-2">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 bg-orange-600/10 hover:bg-orange-600/20 text-orange-500 border border-orange-500/20 font-medium py-2 px-4 rounded-xl transition-all duration-200"
          >
            <Plus size={16} />
            <span>New Chat</span>
          </button>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-zinc-500 text-[10px] font-medium tracking-wider uppercase px-3">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="mt-1 space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/dashboard" />}
                  isActive={pathname === "/dashboard" || pathname.startsWith("/dashboard/chat/")}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    (pathname === "/dashboard" || pathname.startsWith("/dashboard/chat/"))
                      ? "bg-zinc-900 text-white font-medium"
                      : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200",
                  )}
                >
                  <MessageSquare size={16} />
                  <span>Levera AI</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/problems" />}
                  isActive={pathname === "/problems"}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    pathname === "/problems"
                      ? "bg-zinc-900 text-white font-medium"
                      : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200",
                  )}
                >
                  <BookOpen size={16} />
                  <span>Problems</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/dashboard/recent-chats" />}
                  isActive={pathname === "/dashboard/recent-chats"}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    pathname === "/dashboard/recent-chats"
                      ? "bg-zinc-900 text-white font-medium"
                      : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200",
                  )}
                >
                  <History size={16} />
                  <span>Recent Chats</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {loading ? (
          <SidebarGroup>
            <SidebarGroupLabel className="text-zinc-500 text-[10px] font-medium tracking-wider uppercase px-3">
              Recents
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="mt-1 space-y-2 px-3">
                {[...Array(skeletonCount)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2.5 py-1.5">
                    <SkeletonBlock width="13px" height="13px" rounded="rounded" className="shrink-0 bg-zinc-800" />
                    <SkeletonBlock width={i === 0 ? "70%" : i === 1 ? "85%" : i === 2 ? "60%" : "75%"} height="12px" rounded="rounded" className="bg-zinc-800/50" />
                  </div>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : recentChats.length > 0 ? (
          <SidebarGroup>
            <SidebarGroupLabel className="text-zinc-500 text-[10px] font-medium tracking-wider uppercase px-3">
              Recents
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="mt-1 space-y-0.5">
                {recentChats.map((chat) => (
                  <SidebarMenuItem key={chat.id}>
                    <SidebarMenuButton
                      render={<Link href={`/dashboard/chat/${chat.id}`} />}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-colors truncate",
                        pathname === `/dashboard/chat/${chat.id}`
                          ? "bg-zinc-900/80 text-white font-medium"
                          : "text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-200",
                      )}
                    >
                      <MessageSquare
                        size={13}
                        className="shrink-0 text-zinc-500"
                      />
                      <span className="truncate max-w-[160px]">
                        {chat.title}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-zinc-900/60 bg-zinc-950">
        {!mounted || sessionPending ? (
          <div className="flex flex-col gap-3 animate-pulse">
            <div className="flex items-center gap-3">
              <SkeletonBlock width="32px" height="32px" rounded="rounded-full" className="bg-zinc-800 shrink-0" />
              <div className="flex-1 min-w-0 space-y-1.5">
                <SkeletonBlock width="60%" height="14px" className="bg-zinc-800" />
                <SkeletonBlock width="85%" height="10px" className="bg-zinc-800/60" />
              </div>
            </div>
            <SkeletonBlock width="100%" height="32px" rounded="rounded-xl" className="bg-zinc-900" />
          </div>
        ) : user ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              {user.image ? (
                <Image
                  src={user.image}
                  width={32}
                  height={32}
                  alt={user.name || "Profile"}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover border border-zinc-800"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center font-medium text-xs text-white">
                  {user.name?.[0]?.toUpperCase() || "U"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-zinc-500 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 text-xs font-medium text-zinc-400 hover:text-red-400 bg-zinc-900/50 hover:bg-red-500/10 border border-zinc-800 hover:border-red-500/20 py-2 rounded-xl transition-all"
            >
              <LogOut size={13} />
              <span>Log Out</span>
            </button>
          </div>
        ) : (
          <Link
            href="/auth/sign-in"
            className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-850 text-white font-medium py-2.5 px-4 rounded-xl border border-zinc-800 text-sm transition-all"
          >
            <User size={15} />
            <span>Sign In</span>
          </Link>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
