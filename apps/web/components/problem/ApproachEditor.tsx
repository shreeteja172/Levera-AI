"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Edit3, Eye, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export interface ApproachEditorProps {
  problemId: string;
  initialValue: string;
}

type SaveStatus = "idle" | "typing" | "saving" | "saved" | "error";

export function ApproachEditor({ problemId, initialValue }: ApproachEditorProps) {
  const [value, setValue] = useState(initialValue);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialMount = useRef(true);

  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false;
      return;
    }

    setStatus("typing");

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      saveApproach(value);
    }, 800);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [value]);

  const saveApproach = async (content: string) => {
    setStatus("saving");
    try {
      await axios.patch(`/api/saved-problems/${problemId}`, {
        notes: content,
      });
      setStatus("saved");
      setErrorMessage("");
    } catch (error: any) {
      console.error("Autosave error:", error);
      setStatus("error");
      setErrorMessage(error.response?.data?.error || "Failed to autosave");
    }
  };

  return (
    <div className="w-full bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden shadow-2xl flex flex-col min-h-[14rem]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-900 bg-zinc-950/80 select-none">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("write")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === "write"
                ? "bg-zinc-900 border border-zinc-800 text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Edit3 size={13} />
            <span>Write</span>
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === "preview"
                ? "bg-zinc-900 border border-zinc-800 text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Eye size={13} />
            <span>Preview</span>
          </button>
        </div>

        <div className="text-[11px] font-medium flex items-center gap-1.5">
          {status === "typing" && (
            <span className="text-zinc-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500/80 animate-pulse" />
              Typing...
            </span>
          )}
          {status === "saving" && (
            <span className="text-orange-400 flex items-center gap-1">
              <Loader2 size={11} className="animate-spin text-orange-500" />
              Saving...
            </span>
          )}
          {status === "saved" && (
            <span className="text-emerald-500 flex items-center gap-1 font-semibold">
              <CheckCircle2 size={12} className="text-emerald-500" />
              ✓ Saved just now
            </span>
          )}
          {status === "error" && (
            <span className="text-red-500 flex items-center gap-1 font-semibold" title={errorMessage}>
              <AlertCircle size={12} className="text-red-500" />
              Error saving
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-[10rem]">
        {activeTab === "write" ? (
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter text or type '/' for commands..."
            className="flex-1 w-full bg-zinc-950/40 text-zinc-300 placeholder-zinc-600 p-4 border-none outline-none focus:ring-0 text-sm font-sans resize-y min-h-[10rem] custom-scrollbar focus:outline-none"
          />
        ) : (
          <div className="flex-1 p-4 bg-zinc-950/20 prose prose-invert max-w-none text-zinc-300 text-sm overflow-y-auto min-h-[10rem]">
            {value.trim() ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
            ) : (
              <p className="text-zinc-600 italic select-none">Nothing to preview yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
