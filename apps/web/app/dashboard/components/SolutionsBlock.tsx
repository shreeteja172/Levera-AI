import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Cpu, Zap, Trophy, Lock } from "lucide-react";
import { type ParsedContent } from "@/lib/chat-utils";

interface SolutionsBlockProps {
  part: ParsedContent;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  markdownComponents: any;
  hasHints: boolean;
  revealedLevel: number;
  onUpdateRevealedLevel: (level: number) => void;
}

export function SolutionsBlock({
  part,
  markdownComponents,
  hasHints,
  revealedLevel,
  onUpdateRevealedLevel,
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
  const [showConfirmUnlock, setShowConfirmUnlock] = useState(false);

  useEffect(() => {
    setShowConfirmUnlock(false);
  }, [activeTab]);

  if (tabs.length === 0) return null;

  const activeTabDetails = tabs.find((t) => t.id === activeTab) || tabs[0]!;
  const activeContent = part[
    activeTabDetails.id as keyof ParsedContent
  ] as string;

  const isCurrentTabLocked =
    hasHints &&
    ((activeTab === "brute" && revealedLevel < 1) ||
      (activeTab === "better" && revealedLevel < 2) ||
      (activeTab === "optimal" && revealedLevel < 3));

  const canUnlockActiveTab =
    (activeTab === "brute" && revealedLevel === 0) ||
    (activeTab === "better" && revealedLevel === 1) ||
    (activeTab === "optimal" && revealedLevel === 2);

  const targetLevel =
    activeTab === "brute" ? 1 : activeTab === "better" ? 2 : 3;

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

          const isLocked =
            hasHints &&
            ((tab.id === "brute" && revealedLevel < 1) ||
              (tab.id === "better" && revealedLevel < 2) ||
              (tab.id === "optimal" && revealedLevel < 3));

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
              <span>{tab.label}</span>
              {isLocked && <Lock size={10} className="text-orange-500 shrink-0 ml-0.5" />}
            </button>
          );
        })}
      </div>

      <div
        className={`p-5 md:p-6 bg-gradient-to-b ${colors.gradient} space-y-4`}
      >
        {isCurrentTabLocked ? (
          <div className="relative min-h-[180px] flex items-center justify-center p-6 text-center">
            {showConfirmUnlock ? (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 max-w-sm w-full space-y-4 animate-in zoom-in-95 duration-200">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 mx-auto">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-zinc-200 uppercase tracking-wide">
                    Have you attempted the problem?
                  </p>
                  <p className="text-[10px] text-zinc-500">
                    We highly recommend attempting to write your own solution before checking the model code.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-1">
                  <button
                    onClick={() => {
                      onUpdateRevealedLevel(targetLevel);
                      setShowConfirmUnlock(false);
                    }}
                    className="px-4 py-2 bg-[#ff7d00] hover:bg-[#ff7d00]/90 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Yes, reveal
                  </button>
                  <button
                    onClick={() => setShowConfirmUnlock(false)}
                    className="px-4 py-2 bg-zinc-950 border border-zinc-850 hover:border-zinc-850 text-zinc-450 hover:text-zinc-200 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Not yet
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-w-xs">
                <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-850 flex items-center justify-center text-zinc-550 shadow-lg mx-auto">
                  <Lock className="w-4 h-4 text-orange-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                    {activeTabDetails.label} Locked
                  </p>
                  <p className="text-[10px] text-zinc-500 leading-relaxed">
                    {canUnlockActiveTab
                      ? `Practice active recall! Try implementing the ${activeTabDetails.label.toLowerCase()} approach first.`
                      : `Please unlock the previous approach first to follow the progression.`}
                  </p>
                </div>
                {canUnlockActiveTab && (
                  <button
                    onClick={() => setShowConfirmUnlock(true)}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-orange-650/10 hover:bg-orange-650/20 text-orange-500 border border-orange-500/20 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Unlock {activeTabDetails.label}
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm prose prose-invert prose-sm max-w-none prose-pre:my-0">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {activeContent}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
