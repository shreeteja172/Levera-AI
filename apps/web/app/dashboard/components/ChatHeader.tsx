import React from "react";
import { Trash2 } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface ChatHeaderProps {
  activeChatId: string | null;
  onDeleteChat: (id: string) => void;
}

export function ChatHeader({ activeChatId, onDeleteChat }: ChatHeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 px-6 shrink-0 z-20">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white" />
        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
        <span className="text-sm font-medium tracking-wide text-zinc-700 dark:text-zinc-300">
          {activeChatId ? "Active Chat Session" : "New Conversation"}
        </span>
      </div>
    </header>
  );
}
