import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

export function PreBlock({ children }: { children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const extractText = (node: any): string => {
    if (!node) return "";
    if (typeof node === "string") return node;
    if (typeof node === "number") return String(node);
    if (Array.isArray(node)) return node.map(extractText).join("");
    if (node?.props?.children) return extractText(node.props.children);
    return "";
  };

  const handleCopy = async () => {
    const codeText = extractText(children);
    if (!codeText) return;
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code: ", err);
    }
  };

  return (
    <pre className="relative my-4 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 group">
      <div className="absolute right-3 top-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg hover:bg-zinc-850 transition-all font-sans font-medium cursor-pointer"
        >
          {copied ? (
            <>
              <Check size={12} className="text-green-500" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      {children}
    </pre>
  );
}
