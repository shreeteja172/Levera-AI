"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { House, ArrowRight, LayoutDashboard, Clock, Terminal } from "lucide-react";
import { useSession } from "@/lib/auth-client";

const treeNodes = [
  { id: "root", x: 150, y: 28, r: 16, label: "50", state: "path" as const },
  { id: "l1", x: 78, y: 92, r: 15, label: "24", state: "idle" as const },
  { id: "r1", x: 222, y: 92, r: 15, label: "76", state: "path" as const },
  { id: "l2", x: 40, y: 156, r: 13, label: "10", state: "idle" as const },
  { id: "r2", x: 116, y: 156, r: 13, label: "31", state: "idle" as const },
  { id: "l3", x: 184, y: 156, r: 13, label: "61", state: "path" as const },
  { id: "r3", x: 260, y: 156, r: 13, label: "89", state: "idle" as const },
];

const treeEdges: [string, string][] = [
  ["root", "l1"],
  ["root", "r1"],
  ["l1", "l2"],
  ["l1", "r2"],
  ["r1", "l3"],
  ["r1", "r3"],
];

const nodeById = Object.fromEntries(treeNodes.map((n) => [n.id, n]));

function BinarySearchVisual() {
  return (
    <svg
      viewBox="0 0 300 210"
      className="w-full max-w-[300px] h-auto"
      aria-hidden="true"
    >
      {treeEdges.map(([from, to], i) => {
        const a = nodeById[from]!;
        const b = nodeById[to]!;
        const onPath = a.state === "path" && b.state === "path";
        return (
          <motion.line
            key={`${from}-${to}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke={onPath ? "#FF5A1F" : "#3f3f46"}
            strokeWidth={onPath ? 2 : 1.5}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 + i * 0.08, ease: "easeOut" }}
          />
        );
      })}

      <motion.line
        x1={184}
        y1={156}
        x2={184}
        y2={196}
        stroke="#f43f5e"
        strokeWidth={1.5}
        strokeDasharray="3 4"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 1.0 }}
      />

      {treeNodes.map((node, i) => (
        <motion.g
          key={node.id}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.15 + i * 0.08, ease: "backOut" }}
        >
          <circle
            cx={node.x}
            cy={node.y}
            r={node.r}
            fill={node.state === "path" ? "#FF5A1F1a" : "#18181b"}
            stroke={node.state === "path" ? "#FF5A1F" : "#3f3f46"}
            strokeWidth={node.state === "path" ? 2 : 1.5}
          />
          <text
            x={node.x}
            y={node.y + 4}
            textAnchor="middle"
            fontSize="11"
            fontFamily="var(--font-geist-mono), monospace"
            fill={node.state === "path" ? "#FF5A1F" : "#a1a1aa"}
          >
            {node.label}
          </text>
        </motion.g>
      ))}

      <motion.g
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: 1, scale: [1, 1.12, 1] }}
        transition={{
          opacity: { duration: 0.3, delay: 1.15 },
          scale: { duration: 1.6, delay: 1.3, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <circle
          cx={184}
          cy={196}
          r={11}
          fill="#f43f5e1a"
          stroke="#f43f5e"
          strokeWidth={2}
          strokeDasharray="3 3"
        />
        <path
          d="M180 192l8 8m0-8l-8 8"
          stroke="#f43f5e"
          strokeWidth={1.75}
          strokeLinecap="round"
        />
      </motion.g>
    </svg>
  );
}

export default function NotFound() {
  const pathname = usePathname();
  const { data: session, isPending } = useSession();

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-zinc-950 text-zinc-200 font-instrument px-6 py-24">
      <div className="relative z-10 w-full max-w-4xl flex flex-col md:flex-row items-center gap-12 md:gap-16">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-start text-left flex-1 font-sans"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex items-center gap-2 mb-6 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 font-mono text-xs text-zinc-400"
          >
            <Terminal size={13} className="text-zinc-500 shrink-0" />
            <span className="truncate max-w-[220px] sm:max-w-none">
              GET {pathname || "/this-route"}
            </span>
            <span className="text-rose-400 font-semibold">404</span>
            <span className="w-[6px] h-[13px] bg-zinc-500 animate-pulse" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
            className="font-instrument text-7xl md:text-8xl leading-none tracking-tight mb-5 bg-gradient-to-r from-[#FF5A1F] to-rose-500 bg-clip-text text-transparent"
          >
            404
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
            className="text-lg md:text-xl text-white font-medium mb-3 max-w-md"
          >
            We ran a binary search across every route.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            className="text-zinc-400 leading-relaxed mb-8 max-w-md"
          >
            This one still returned null. The page you're looking for was
            either moved, renamed, or never existed in this array.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35, ease: "easeOut" }}
            className="flex items-center gap-2 mb-9 text-xs font-mono"
          >
            <span className="flex items-center gap-1.5 px-2.5 py-1 border rounded-lg bg-rose-950/30 text-rose-400 border-rose-900/30 font-semibold tracking-wide">
              <Clock className="w-3.5 h-3.5 shrink-0 opacity-80" />
              Status: 404
            </span>
            <span className="px-2.5 py-1 border rounded-lg bg-zinc-900/50 text-zinc-300 border-zinc-800 font-semibold tracking-wide">
              Time: O(1)
            </span>
            <span className="px-2.5 py-1 border rounded-lg bg-zinc-900/50 text-zinc-300 border-zinc-800 font-semibold tracking-wide">
              Result: null
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <Link
              href="/"
              className="group flex items-center justify-center gap-2 px-6 py-3.5 bg-zinc-100 hover:bg-white text-black rounded-xl transition-all duration-300 ease-out hover:-translate-y-0.5"
              style={{ color: "#09090b" }}
            >
              <House size={17} />
              Back to Home
              <ArrowRight className="w-4 h-4 ml-0.5 group-hover:translate-x-1 transition-transform" />
            </Link>
            {!isPending && session?.user ? (
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-xl transition-all duration-300 ease-out"
              >
                <LayoutDashboard size={17} />
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/auth/sign-in"
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-xl transition-all duration-300 ease-out"
              >
                Sign In
              </Link>
            )}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="shrink-0 w-full max-w-[300px] bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-6"
        >
          <BinarySearchVisual />
        </motion.div>
      </div>
    </main>
  );
}
