import React from "react";
import { Trash2 } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface ChatHeaderProps {
  activeChatId: string | null;
  onDeleteChat: (id: string) => void;
}

export function ChatHeader({ activeChatId, onDeleteChat }: ChatHeaderProps) {
  return (
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
          onClick={() => onDeleteChat(activeChatId)}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-400 hover:bg-red-500/10 px-2.5 py-1.5 rounded-lg border border-zinc-900 hover:border-red-500/20 transition-all cursor-pointer"
          title="Delete this conversation"
        >
          <Trash2 size={13} />
          <span className="hidden sm:inline">Delete Chat</span>
        </button>
      )}
    </header>
  );
}
