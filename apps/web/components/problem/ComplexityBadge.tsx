import React from "react";
import { Clock, Shield, Terminal } from "lucide-react";

interface ComplexityBadgeProps {
  time?: string;
  space?: string;
  language?: string;
  variant?: "brute" | "better" | "optimal";
}

export function ComplexityBadge({ time, space, language, variant }: ComplexityBadgeProps) {
  const getColors = () => {
    switch (variant) {
      case "brute":
        return {
          timeBg: "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/30",
          spaceBg: "bg-zinc-100/60 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800",
        };
      case "better":
        return {
          timeBg: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/30",
          spaceBg: "bg-zinc-100/60 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800",
        };
      case "optimal":
        return {
          timeBg: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30",
          spaceBg: "bg-zinc-100/60 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800",
        };
      default:
        return {
          timeBg: "bg-zinc-100/60 dark:bg-zinc-900/50 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800",
          spaceBg: "bg-zinc-100/60 dark:bg-zinc-900/50 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800",
        };
    }
  };

  const colors = getColors();

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {time && (
        <span className={`flex items-center gap-1.5 px-2.5 py-1 border rounded-lg font-mono font-semibold tracking-wide ${colors.timeBg}`}>
          <Clock className="w-3.5 h-3.5 shrink-0 opacity-80" />
          <span>{time}</span>
        </span>
      )}
      {space && (
        <span className={`flex items-center gap-1.5 px-2.5 py-1 border rounded-lg font-mono font-semibold tracking-wide ${colors.spaceBg}`}>
          <Shield className="w-3.5 h-3.5 shrink-0 opacity-80" />
          <span>{space}</span>
        </span>
      )}
      {language && (
        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 rounded-lg font-mono font-semibold tracking-wide uppercase">
          <Terminal className="w-3.5 h-3.5 shrink-0 opacity-80" />
          <span>{language}</span>
        </span>
      )}
    </div>
  );
}
