import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Cpu, Zap, Trophy } from "lucide-react";
import { type ParsedContent } from "@/lib/chat-utils";

interface SolutionsBlockProps {
  part: ParsedContent;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  markdownComponents: any;
}

export function SolutionsBlock({
  part,
  markdownComponents,
}: SolutionsBlockProps) {
  const tabs = [];
  if (part.brute)
    tabs.push({ id: "brute", label: "Brute Force", icon: Cpu, color: "red" });
  if (part.better)
    tabs.push({
      id: "better",
      label: "Better Approach",
      icon: Zap,
      color: "orange",
    });
  if (part.optimal)
    tabs.push({
      id: "optimal",
      label: "Optimal Solution",
      icon: Trophy,
      color: "green",
    });

  const defaultTab = part.optimal
    ? "optimal"
    : part.better
      ? "better"
      : "brute";
  const [activeTab, setActiveTab] = useState(defaultTab);

  if (tabs.length === 0) return null;

  const activeTabDetails = tabs.find((t) => t.id === activeTab) || tabs[0]!;
  const activeContent = part[
    activeTabDetails.id as keyof ParsedContent
  ] as string;

  const colorMap = {
    red: {
      text: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      hoverBorder: "hover:border-red-500/35",
      activeBg: "bg-red-500/15",
      activeText: "text-red-300",
      badgeText: "text-red-400 bg-red-500/10 border-red-500/10",
      gradient: "from-red-500/5 via-transparent to-transparent",
    },
    orange: {
      text: "text-orange-400",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
      hoverBorder: "hover:border-orange-500/35",
      activeBg: "bg-orange-500/15",
      activeText: "text-orange-300",
      badgeText: "text-orange-400 bg-orange-500/10 border-orange-500/10",
      gradient: "from-orange-500/5 via-transparent to-transparent",
    },
    green: {
      text: "text-green-400",
      bg: "bg-green-500/10",
      border: "border-emerald-500/20",
      hoverBorder: "hover:border-emerald-500/35",
      activeBg: "bg-emerald-500/15",
      activeText: "text-emerald-300",
      badgeText: "text-green-400 bg-green-500/10 border-green-500/10",
      gradient: "from-emerald-500/5 via-transparent to-transparent",
    },
  };

  const colors = colorMap[activeTabDetails.color as keyof typeof colorMap];

  return (
    <div
      className={`w-full my-6 bg-zinc-950/40 border ${colors.border} ${colors.hoverBorder} rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm transition-all duration-300`}
    >
      <div className="flex border-b border-zinc-900 bg-zinc-950/80 p-2 gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const tabColors = colorMap[tab.color as keyof typeof colorMap];

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 border cursor-pointer select-none ${
                isActive
                  ? `${tabColors.activeBg} ${tabColors.text} ${tabColors.border} shadow-lg shadow-black/10 scale-[1.02]`
                  : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/60"
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        className={`p-5 md:p-6 bg-gradient-to-b ${colors.gradient} space-y-4`}
      >
        <div className="text-sm prose prose-invert prose-sm max-w-none prose-pre:my-0">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={markdownComponents}
          >
            {activeContent}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
