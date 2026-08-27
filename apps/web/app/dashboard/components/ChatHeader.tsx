import React from "react";
import { Trash2 } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface ChatHeaderProps {
  activeChatId: string | null;
  chatTitle?: string | null;
  onDeleteChat: (id: string) => void;
}

export function ChatHeader({
  activeChatId,
  chatTitle,
  onDeleteChat,
}: ChatHeaderProps) {
  const label = activeChatId
    ? chatTitle?.trim() || "Active Chat Session"
    : "New Conversation";

  return (
    <header className="flex h-14 items-center justify-between gap-2 sm:gap-3 border-b border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-950 px-3 sm:px-6 shrink-0 z-20">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <SidebarTrigger className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white shrink-0" />
        <div className="hidden sm:block h-4 w-px bg-zinc-200 dark:bg-white/10 shrink-0" />
        <span
          className="text-sm tracking-wide text-zinc-700 dark:text-zinc-300 truncate"
          title={label}
        >
          {label}
        </span>
      </div>

      {activeChatId && (
        <button
          onClick={() => {
            const ok = window.confirm(
              `Delete "${label}"? This can't be undone.`,
            );
            if (ok) onDeleteChat(activeChatId);
          }}
          aria-label="Delete this conversation"
          title="Delete this conversation"
          className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
        >
          <Trash2 size={15} />
        </button>
      )}
    </header>
  );
}
