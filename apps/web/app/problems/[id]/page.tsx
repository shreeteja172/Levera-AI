"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Copy, Check, ArrowLeft, Trash2, Calendar, Code2 } from "lucide-react";
import toast from "react-hot-toast";
import "highlight.js/styles/github-dark.css";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface SavedProblem {
  id: string;
  language: string;
  brute: string | null;
  better: string | null;
  optimal: string | null;
  createdAt: string;
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
      toast.error("Failed to copy code");
    }
  };

  return (
    <pre className="relative my-4 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/80 group">
      <div className="absolute right-3 top-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg hover:bg-zinc-800 transition-all font-sans font-medium cursor-pointer"
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-500" />
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
      <div className="p-4 overflow-x-auto text-xs font-mono">{children}</div>
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
          className="rounded bg-zinc-900 px-1.5 py-0.5 text-orange-400 font-mono text-xs before:content-none after:content-none border border-zinc-800"
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code
        className={`${className} block text-zinc-250`}
        {...props}
      >
        {children}
      </code>
    );
  },
  h1: ({ children }: any) => (
    <h1 className="mb-4 mt-6 text-lg font-bold text-white border-b border-zinc-900 pb-1.5">
      {children}
    </h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="mb-3 mt-5 text-base font-semibold text-zinc-200">{children}</h2>
  ),
  p: ({ children }: any) => (
    <p className="my-3 leading-relaxed text-zinc-400 text-sm">{children}</p>
  ),
  ul: ({ children }: any) => (
    <ul className="list-disc pl-5 my-2 space-y-1 text-zinc-400 text-sm">{children}</ul>
  ),
  ol: ({ children }: any) => (
    <ol className="list-decimal pl-5 my-2 space-y-1 text-zinc-400 text-sm">{children}</ol>
  ),
};

export default function ProblemPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [problem, setProblem] = useState<SavedProblem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"brute" | "better" | "optimal">("optimal");

  useEffect(() => {
    async function fetchProblem() {
      try {
        const { data } = await axios.get(`/api/saved-problems/${id}`);
        setProblem(data);
        if (data.optimal) {
          setActiveTab("optimal");
        } else if (data.better) {
          setActiveTab("better");
        } else if (data.brute) {
          setActiveTab("brute");
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load problem details");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchProblem();
    }
  }, [id]);

  const handleDelete = async () => {
    if (!problem) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete "${problem.problem.title}"?`);
    if (!confirmDelete) return;

    try {
      await axios.delete(`/api/saved-problems/${problem.id}`);
      toast.success("Problem deleted successfully");
      router.push("/problems");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete problem");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
        <div className="h-16 border-b border-zinc-900 flex items-center px-6 bg-zinc-950/50">
          <div className="h-6 w-32 bg-zinc-900 rounded animate-pulse" />
        </div>
        <div className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-8 space-y-8 animate-pulse">
          <div className="h-4 w-16 bg-zinc-900 rounded" />
          <div className="space-y-3">
            <div className="h-10 w-2/3 bg-zinc-900 rounded-lg" />
            <div className="h-5 w-1/3 bg-zinc-900 rounded" />
          </div>
          <div className="h-12 w-full bg-zinc-900 rounded-xl" />
          <div className="h-64 w-full bg-zinc-900 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center flex-col gap-4">
        <p className="text-zinc-400">Problem not found.</p>
        <button
          onClick={() => router.push("/problems")}
          className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-850 px-4 py-2 border border-zinc-800 rounded-xl transition-all"
        >
          <ArrowLeft size={16} /> Back to Problems
        </button>
      </div>
    );
  }

  const availableTabs = [
    { id: "brute", label: "Brute Force", exists: !!problem.brute, color: "hover:text-red-400", activeBg: "bg-red-500/10 text-red-400 border-red-500/30" },
    { id: "better", label: "Better Approach", exists: !!problem.better, color: "hover:text-amber-400", activeBg: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
    { id: "optimal", label: "Optimal Solution", exists: !!problem.optimal, color: "hover:text-emerald-400", activeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
  ];

  const activeCode = problem[activeTab];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <header className="h-16 border-b border-zinc-900 flex items-center justify-between px-6 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-zinc-400 hover:text-white" />
          <div className="h-4 w-px bg-zinc-800" />
          <button
            onClick={() => router.push("/problems")}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-sm font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Problems</span>
          </button>
        </div>

        <button
          onClick={handleDelete}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-950 bg-red-950/20 text-red-400 hover:bg-red-950/40 hover:border-red-900 text-xs font-semibold tracking-wide transition-all cursor-pointer"
        >
          <Trash2 size={13} />
          <span>Delete Saved</span>
        </button>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-8 space-y-8 animate-in fade-in duration-300">

        <div className="space-y-4">
          <h1 className="text-3xl font-extrabold font-sans tracking-tight text-white flex items-center gap-2">
            {problem.problem.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-400 bg-zinc-900/20 border border-zinc-900 rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <Code2 size={15} className="text-zinc-500" />
              <span>Language:</span>
              <span className="font-mono bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 text-zinc-300 font-semibold">
                {problem.language.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar size={15} className="text-zinc-500" />
              <span>Saved on:</span>
              <span className="text-zinc-300 font-medium">
                {new Date(problem.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="border-b border-zinc-900 flex gap-2">
          {availableTabs.map((tab) => {
            if (!tab.exists) return null;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer relative -bottom-[2px] ${
                  isActive
                    ? `border-orange-500 text-white`
                    : "border-transparent text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <section className="bg-zinc-900/10 border border-zinc-900 rounded-3xl p-6 md:p-8 space-y-4 shadow-xl">
          {activeCode ? (
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={markdownComponents}
              >
                {activeCode}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="text-center py-12 text-zinc-500 text-sm">
              No content available for this solution level.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
