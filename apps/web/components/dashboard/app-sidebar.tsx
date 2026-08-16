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
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SettingsDialog } from "@/components/dashboard/SettingsDialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { SkeletonBlock } from "@/components/ui/skeleton-block";

interface ChatMessage {
  id: string;
  role: string;
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
}

const GROUP_LABEL =
  "text-[10px] tracking-[0.18em] uppercase text-zinc-400 dark:text-zinc-600 px-3";

const navItems: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Levera AI", icon: MessageSquare },
  { href: "/problems", label: "Problems", icon: BookOpen },
  { href: "/dashboard/recent-chats", label: "Recent Chats", icon: History },
];

function NavRow({
  href,
  label,
  icon: Icon,
  active,
  compact,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  compact?: boolean;
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        render={<Link href={href} />}
        isActive={active}
        className={cn(
          "group relative w-full flex items-center gap-3 rounded-lg transition-colors duration-200",
          compact ? "px-3 py-2 text-[13px]" : "px-3 py-2 text-sm",
          active
            ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-900! dark:text-white!"
            : "text-zinc-500! dark:text-zinc-400! hover:bg-zinc-100/70 dark:hover:bg-zinc-900/50 hover:text-zinc-900! dark:hover:text-zinc-200!",
        )}
      >
        <span
          className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 w-[2px] rounded-r-full bg-[#FF5A1F] transition-all duration-200",
            active ? "h-4 opacity-100" : "h-0 opacity-0",
          )}
          aria-hidden="true"
        />
        <Icon
          size={compact ? 14 : 16}
          className={cn(
            "shrink-0 transition-colors",
            active ? "text-[#FF5A1F]" : "text-zinc-400 dark:text-zinc-600",
          )}
        />
        <span className="truncate">{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: sessionData, isPending: sessionPending } = useSession();
  const user = sessionData?.user;
  const { toggleSidebar } = useSidebar();

  const [settingsOpen, setSettingsOpen] = useState(false);
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
        const res = await axios.get("/api/chats?limit=7");
        const chats = res.data.data || [];
        if (typeof window !== "undefined") {
          localStorage.setItem("levera:lastChatCount", String(chats.length));
        }
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime < 200) {
          await new Promise((resolve) =>
            setTimeout(resolve, 200 - elapsedTime),
          );
        }
        setRecentChats(chats.slice(0, 7));
      } catch (e) {
        console.error("Failed to load chats from database:", e);
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime < 200) {
          await new Promise((resolve) =>
            setTimeout(resolve, 200 - elapsedTime),
          );
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

  const isChatHome =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/chat/");

  return (
    <Sidebar className="border-r border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-200">
      <SidebarHeader className="h-16 px-4 flex flex-row items-center justify-between border-b border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 text-zinc-900! dark:text-white!"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[#FF5A1F]"
            aria-hidden="true"
          >
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
          </svg>
          <span className="font-instrument text-lg tracking-tight">Levera</span>
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            onClick={toggleSidebar}
            aria-label="Collapse sidebar"
            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white md:hidden p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            <PanelLeft size={17} />
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-5 bg-white dark:bg-zinc-950 space-y-7">
        <div className="px-2">
          <button
            onClick={handleNewChat}
            className="group w-full flex items-center justify-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black py-2.5 px-4 rounded-lg text-sm transition-all duration-200 hover:bg-zinc-800 dark:hover:bg-white"
          >
            <Plus
              size={15}
              className="transition-transform duration-300 group-hover:rotate-90"
            />
            <span>New Chat</span>
          </button>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className={GROUP_LABEL}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="mt-2 space-y-1">
              {navItems.map((item) => (
                <NavRow
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  active={
                    item.href === "/dashboard"
                      ? isChatHome
                      : pathname === item.href
                  }
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {loading ? (
          <SidebarGroup>
            <SidebarGroupLabel className={GROUP_LABEL}>
              Recents
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="mt-2 space-y-2 px-3">
                {[...Array(skeletonCount)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2.5 py-1.5">
                    <SkeletonBlock
                      width="13px"
                      height="13px"
                      rounded="rounded"
                      className="shrink-0 bg-zinc-200 dark:bg-zinc-800"
                    />
                    <SkeletonBlock
                      width={
                        i === 0
                          ? "70%"
                          : i === 1
                            ? "85%"
                            : i === 2
                              ? "60%"
                              : "75%"
                      }
                      height="12px"
                      rounded="rounded"
                      className="bg-zinc-200/50 dark:bg-zinc-800/50"
                    />
                  </div>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : recentChats.length > 0 ? (
          <SidebarGroup>
            <SidebarGroupLabel className={GROUP_LABEL}>
              Recents
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="mt-2 space-y-1">
                {recentChats.map((chat) => (
                  <NavRow
                    key={chat.id}
                    href={`/dashboard/chat/${chat.id}`}
                    label={chat.title}
                    icon={MessageSquare}
                    active={pathname === `/dashboard/chat/${chat.id}`}
                    compact
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950">
        {!mounted || sessionPending ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 px-1">
              <SkeletonBlock
                width="30px"
                height="30px"
                rounded="rounded-full"
                className="bg-zinc-200 dark:bg-zinc-800 shrink-0"
              />
              <div className="flex-1 min-w-0 space-y-1.5">
                <SkeletonBlock
                  width="60%"
                  height="13px"
                  className="bg-zinc-200 dark:bg-zinc-800"
                />
                <SkeletonBlock
                  width="85%"
                  height="10px"
                  className="bg-zinc-200/60 dark:bg-zinc-800/60"
                />
              </div>
            </div>
            <SkeletonBlock
              width="100%"
              height="30px"
              rounded="rounded-lg"
              className="bg-zinc-100 dark:bg-zinc-900"
            />
          </div>
        ) : user ? (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-3 px-1">
              {user.image ? (
                <Image
                  src={user.image}
                  width={30}
                  height={30}
                  alt={user.name || "Profile"}
                  referrerPolicy="no-referrer"
                  className="w-[30px] h-[30px] rounded-full object-cover border border-zinc-200 dark:border-white/10"
                />
              ) : (
                <div className="w-[30px] h-[30px] rounded-full bg-[#FF5A1F] flex items-center justify-center text-xs text-white shrink-0">
                  {user.name?.[0]?.toUpperCase() || "U"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-zinc-900 dark:text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-600 truncate">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setSettingsOpen(true)}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 py-2 rounded-lg transition-colors cursor-pointer"
              >
                <Settings size={13} />
                <span>Settings</span>
              </button>
              <span
                className="w-px h-4 bg-zinc-200 dark:bg-white/10"
                aria-hidden="true"
              />
              <button
                onClick={handleLogout}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 py-2 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut size={13} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        ) : (
          <Link
            href="/auth/sign-in"
            className="w-full flex items-center justify-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white! dark:text-black! py-2.5 px-4 rounded-lg text-sm transition-colors hover:bg-zinc-800 dark:hover:bg-white"
          >
            <User size={15} />
            <span>Sign In</span>
          </Link>
        )}
        <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      </SidebarFooter>
    </Sidebar>
  );
}
