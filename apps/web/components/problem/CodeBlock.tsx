"use client";

import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import { WrapText } from "lucide-react";

type CodeBlockProps = {
  language: string;
  filename: string;
  code: string;
  highlightLines?: number[];
};

export const CodeBlock = ({
  language,
  filename,
  code,
}: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const [wrapLines, setWrapLines] = useState(true);

  const copyToClipboard = async () => {
    if (code) {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getPrismLanguage = (lang: string) => {
    const lowercase = lang.toLowerCase();
    if (lowercase === "c++" || lowercase === "cpp") return "cpp";
    if (lowercase === "python" || lowercase === "py") return "python";
    if (lowercase === "javascript" || lowercase === "js") return "javascript";
    if (lowercase === "typescript" || lowercase === "ts") return "typescript";
    return lowercase;
  };

  return (
    <div className="relative w-full rounded-xl bg-zinc-950 border border-zinc-900/80 font-mono text-sm overflow-hidden flex flex-col group/code">
      <div className="flex justify-between items-center px-4 py-2.5 bg-zinc-950/80 border-b border-zinc-900/60 select-none">
        <div className="text-xs font-semibold text-zinc-400 font-sans flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500/80" />
          <span className="hover:text-zinc-200 transition-colors">{filename}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setWrapLines(!wrapLines)}
            className={`p-1.5 rounded hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-all font-sans text-xs flex items-center gap-1 cursor-pointer ${
              wrapLines ? "bg-orange-500/10 text-orange-400 hover:text-orange-300 border border-orange-500/10" : "border border-transparent"
            }`}
            title="Toggle Word Wrap"
          >
            <WrapText size={14} />
          </button>
          
          <button
            onClick={copyToClipboard}
            className="p-1.5 rounded hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-transparent transition-all font-sans text-xs flex items-center gap-1 cursor-pointer"
            title="Copy Code"
          >
            {copied ? (
              <IconCheck size={14} className="text-emerald-500" />
            ) : (
              <IconCopy size={14} />
            )}
          </button>
        </div>
      </div>

      <div className="relative flex-1 overflow-auto max-h-[30rem] custom-scrollbar bg-zinc-950/30 p-4 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.05)_transparent]">
        <SyntaxHighlighter
          language={getPrismLanguage(language)}
          style={atomDark}
          customStyle={{
            margin: 0,
            padding: 0,
            background: "transparent",
            fontSize: "0.825rem",
            lineHeight: "1.6",
          }}
          wrapLines={wrapLines}
          wrapLongLines={wrapLines}
          showLineNumbers={true}
          PreTag="div"
        >
          {String(code)}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};
