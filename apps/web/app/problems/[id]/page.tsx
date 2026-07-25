"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Copy, Check } from "lucide-react";
import "highlight.js/styles/github-dark.css";

interface SavedProblem {
  id: string;
  language: string;
  brute: string | null;
  better: string | null;
  optimal: string | null;
  problem: {
    title: string;
  };
}

function PreBlock({ children }: { children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);

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

const markdownComponents = {
  pre({ children }: any) {
    return <PreBlock>{children}</PreBlock>;
  },
  code({ className, children, ...props }: any) {
    const inline = !className;
    if (inline) {
      return (
        <code
          className="rounded bg-zinc-800/80 px-1.5 py-0.5 text-orange-400 font-mono text-xs before:content-none after:content-none"
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code
        className={`${className} block overflow-x-auto p-4 text-xs font-mono before:content-none after:content-none`}
        {...props}
      >
        {children}
      </code>
    );
  },
  h1: ({ children }: any) => (
    <h1 className="mb-4 mt-6 text-xl font-bold text-white border-b border-zinc-900 pb-1">
      {children}
    </h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="mb-3 mt-5 text-lg font-semibold text-white">{children}</h2>
  ),
  p: ({ children }: any) => (
    <p className="my-3 leading-relaxed text-zinc-300">{children}</p>
  ),
};

export default function ProblemPage() {
  const { id } = useParams<{ id: string }>();

  const [problem, setProblem] = useState<SavedProblem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProblem() {
      try {
        const { data } = await axios.get(`/api/saved-problems/${id}`);
        setProblem(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchProblem();
    }
  }, [id]);

  if (loading) {
    return <div className="max-w-5xl mx-auto py-10">Loading...</div>;
  }

  if (!problem) {
    return <div className="max-w-5xl mx-auto py-10">Problem not found.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{problem.problem.title}</h1>
        <p className="text-muted-foreground mt-2">
          Language: {problem.language.toUpperCase()}
        </p>
      </div>

      <SolutionSection title="Brute Force" code={problem.brute} />
      <SolutionSection title="Better" code={problem.better} />
      <SolutionSection title="Optimal" code={problem.optimal} />
    </div>
  );
}

function SolutionSection({
  title,
  code,
}: {
  title: string;
  code: string | null;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold">{title}</h2>

      {code ? (
        <div className="text-sm prose prose-invert prose-sm max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={markdownComponents}
          >
            {code}
          </ReactMarkdown>
        </div>
      ) : (
        <pre className="rounded-xl border bg-zinc-950 p-5 overflow-x-auto text-sm">
          <code className="text-zinc-500">No solution available.</code>
        </pre>
      )}
    </section>
  );
}
