"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const ORANGE = "#FF5A1F";
const BLUE = "#0ea5e9";

const SOLUTION_ROWS = [
  { label: "Brute force", cx: "O(n²)", width: "100%", color: ORANGE },
  { label: "Better", cx: "O(n log n)", width: "44%", color: "#a1a1aa" },
  { label: "Optimal", cx: "O(n)", width: "17%", color: BLUE },
];

function MultipleSolutions() {
  return (
    <div className="flex flex-col gap-5">
      {SOLUTION_ROWS.map((row, i) => (
        <div key={row.label} className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-zinc-700 dark:text-zinc-300">{row.label}</span>
            <span className="font-mono text-xs" style={{ color: row.color }}>
              {row.cx}
            </span>
          </div>
          <div className="h-px w-full bg-zinc-900/10 dark:bg-white/10">
            <motion.div
              className="h-px"
              style={{ backgroundColor: row.color }}
              initial={{ width: 0 }}
              animate={{ width: row.width }}
              transition={{ duration: 0.7, delay: 0.08 * i, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

const STEPS = [
  "Sorted input rules out a hash map.",
  "Two pointers converge from both ends.",
  "Each step discards half the search space.",
];

function StepByStep() {
  return (
    <ol className="flex flex-col gap-5">
      {STEPS.map((step, i) => (
        <li key={step} className="flex gap-4">
          <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-600 pt-1 shrink-0">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {step}
          </span>
        </li>
      ))}
    </ol>
  );
}

const CELLS = [2, 7, 11, 15];

function DryRun() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2">
        {CELLS.map((n, i) => {
          const active = i === 0 || i === 2;
          return (
            <div
              key={n}
              className={`flex-1 aspect-square rounded-md flex items-center justify-center font-mono text-sm border ${
                active
                  ? "border-transparent text-white dark:text-black"
                  : "border-zinc-900/12 dark:border-white/12 text-zinc-500"
              }`}
              style={active ? { backgroundColor: i === 0 ? ORANGE : BLUE } : undefined}
            >
              {n}
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between font-mono text-xs">
        <span style={{ color: ORANGE }}>left = 0</span>
        <span className="text-zinc-500">2 + 11 = 13</span>
        <span style={{ color: BLUE }}>right = 2</span>
      </div>
    </div>
  );
}

const PATTERNS = [
  { name: "Two Pointers", score: "94%", active: true },
  { name: "Binary Search", score: "38%", active: false },
  { name: "Sliding Window", score: "12%", active: false },
];

function PatternDetection() {
  return (
    <div className="flex flex-col gap-3">
      {PATTERNS.map((p) => (
        <div
          key={p.name}
          className={`flex items-center justify-between px-4 py-3 rounded-lg border ${
            p.active
              ? "border-[#0ea5e9]/40 bg-[#0ea5e9]/[0.06]"
              : "border-zinc-900/10 dark:border-white/10"
          }`}
        >
          <span
            className={`text-sm ${
              p.active ? "text-zinc-900 dark:text-white" : "text-zinc-500"
            }`}
          >
            {p.name}
          </span>
          <span
            className="font-mono text-xs"
            style={{ color: p.active ? BLUE : undefined }}
          >
            <span className={p.active ? "" : "text-zinc-400 dark:text-zinc-600"}>
              {p.score}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}

function InterviewMode() {
  const reduceMotion = useReducedMotion();
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-600">
          Interviewer
        </span>
        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          That works. Can you get it under O(n²) without extra space?
        </p>
      </div>
      <div className="h-px w-full bg-zinc-900/10 dark:bg-white/10" />
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-600">
          You
        </span>
        <div className="flex gap-1.5 pt-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600"
              animate={reduceMotion ? undefined : { opacity: [0.25, 1, 0.25] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.18 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const HINTS = [
  { level: "Nudge", text: "What does sorted order let you rule out?", open: true },
  { level: "Approach", text: "Converge two pointers from both ends.", open: false },
  { level: "Solution", text: "Full implementation with complexity.", open: false },
];

function HintMode() {
  return (
    <div className="flex flex-col gap-3">
      {HINTS.map((h) => (
        <div
          key={h.level}
          className="flex flex-col gap-1.5 px-4 py-3 rounded-lg border border-zinc-900/10 dark:border-white/10"
        >
          <span
            className="font-mono text-[10px] tracking-[0.2em] uppercase"
            style={{ color: h.open ? ORANGE : undefined }}
          >
            <span className={h.open ? "" : "text-zinc-400 dark:text-zinc-600"}>
              {h.level}
            </span>
          </span>
          <span
            className={`text-sm ${
              h.open
                ? "text-zinc-700 dark:text-zinc-300"
                : "text-zinc-400 dark:text-zinc-700 blur-[3px] select-none"
            }`}
          >
            {h.text}
          </span>
        </div>
      ))}
    </div>
  );
}

const features = [
  {
    title: "Multiple Solutions",
    description:
      "Brute force, better, and optimal in a single response — each with its own complexity, so you can see what the trade-off actually costs.",
    Preview: MultipleSolutions,
  },
  {
    title: "Step-by-Step Reasoning",
    description:
      "Not just what the answer is, but why it holds — which property of the input made this approach possible.",
    Preview: StepByStep,
  },
  {
    title: "Dry Run Visualization",
    description:
      "Every iteration, with pointer movement, variable updates, stack operations, and DP tables as they fill.",
    Preview: DryRun,
  },
  {
    title: "Pattern Detection",
    description:
      "Names the underlying pattern and ranks how confidently it applies, so problems start grouping themselves.",
    Preview: PatternDetection,
  },
  {
    title: "Interview Mode",
    description:
      "An AI interviewer that pushes back, asks for optimizations, and evaluates your reasoning out loud.",
    Preview: InterviewMode,
  },
  {
    title: "Hint Mode",
    description:
      "Reveal exactly as much as you need — a nudge, an approach, or the full solution. Never more.",
    Preview: HintMode,
  },
];

export default function FeaturesSection() {
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();
  const current = features[active]!;
  const Preview = current.Preview;

  return (
    <section
      id="features"
      className="relative py-28 md:py-36 px-6 md:px-14 lg:px-20 bg-[#EAE7DF] dark:bg-zinc-950"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-baseline gap-6 mb-16 md:mb-24">
          <span className="font-mono text-[10px] md:text-[11px] tracking-[0.35em] uppercase text-zinc-500 shrink-0">
            01 — 06
          </span>
          <div className="h-px flex-1 bg-zinc-900/12 dark:bg-white/12" />
          <h2 className="font-instrument text-[clamp(1.6rem,3vw,2.4rem)] tracking-tight text-zinc-900 dark:text-white shrink-0">
            What it does
          </h2>
        </div>

        <div className="grid md:grid-cols-[1fr_1fr] lg:grid-cols-[1fr_1.1fr] gap-10 md:gap-16 lg:gap-24 items-start">
          <ul role="tablist" aria-label="Capabilities" className="flex flex-col">
            {features.map((f, i) => {
              const isActive = i === active;
              return (
                <li key={f.title}>
                  <button
                    role="tab"
                    aria-selected={isActive}
                    aria-controls="feature-panel"
                    id={`feature-tab-${i}`}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => setActive(i)}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                        e.preventDefault();
                        setActive((i + 1) % features.length);
                      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                        e.preventDefault();
                        setActive((i - 1 + features.length) % features.length);
                      }
                    }}
                    className="group w-full text-left flex items-baseline gap-5 py-5 border-b border-zinc-900/10 dark:border-white/10 outline-none"
                  >
                    <span
                      className={`font-mono text-[10px] shrink-0 transition-colors duration-300 ${
                        isActive
                          ? "text-[#FF5A1F]"
                          : "text-zinc-400 dark:text-zinc-600"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`font-instrument text-[clamp(1.35rem,2.6vw,1.9rem)] leading-tight tracking-tight transition-colors duration-300 ${
                        isActive
                          ? "text-zinc-900 dark:text-white"
                          : "text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-600 dark:group-hover:text-zinc-400"
                      }`}
                    >
                      {f.title}
                    </span>
                    <span
                      className={`ml-auto shrink-0 h-px transition-all duration-500 ease-out ${
                        isActive ? "w-8 bg-[#FF5A1F]" : "w-0 bg-transparent"
                      }`}
                    />
                  </button>
                </li>
              );
            })}
          </ul>

          <div
            id="feature-panel"
            role="tabpanel"
            aria-labelledby={`feature-tab-${active}`}
            className="md:sticky md:top-28 rounded-2xl border border-zinc-900/10 dark:border-white/10 bg-white dark:bg-zinc-900/40 p-7 md:p-9 min-h-[340px] flex flex-col"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.28,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="flex flex-col h-full"
              >
                <p className="text-zinc-600 dark:text-zinc-400 text-[0.95rem] leading-relaxed mb-9">
                  {current.description}
                </p>
                <div className="mt-auto">
                  <Preview />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
