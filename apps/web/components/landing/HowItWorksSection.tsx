"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const steps = [
  {
    label: "You bring the problem",
    title: "Ask in plain language",
    description:
      "Paste a problem statement or just describe what you're stuck on. No format, no setup, no boilerplate.",
    artifact: "› sorted array — return the indices that sum to target",
    color: "#FF5A1F",
  },
  {
    label: "Levera opens it up",
    title: "See every approach, ranked",
    description:
      "Brute force first, then what improves it, then the optimal — each with complexity, a dry run, and the reasoning that connects them.",
    artifact: "brute force  →  binary search  →  two pointers  ·  O(n)",
    color: "#0ea5e9",
  },
  {
    label: "You keep the pattern",
    title: "Recognize it next time",
    description:
      "The solution is the smaller half. What you leave with is the pattern underneath it and the problems it unlocks.",
    artifact: "pattern: two pointers  ·  12 related problems queued",
    color: "currentColor",
  },
];

export default function HowItWorksSection() {
  const listRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 75%", "end 65%"],
  });
  const railScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      id="how-it-works"
      className="py-28 md:py-36 px-6 md:px-14 lg:px-20 bg-[#F5F3EE] dark:bg-zinc-900 border-y border-black/10 dark:border-white/10"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-baseline gap-6 mb-16 md:mb-24">
          <h2 className="font-instrument text-[clamp(1.6rem,3vw,2.4rem)] tracking-tight text-zinc-900 dark:text-white shrink-0">
            How it works
          </h2>
          <div className="h-px flex-1 bg-zinc-900/12 dark:bg-white/12" />
          <span className="font-mono text-[10px] md:text-[11px] tracking-[0.35em] uppercase text-zinc-500 shrink-0">
            Three steps
          </span>
        </div>

        <ol ref={listRef} className="relative flex flex-col gap-20 md:gap-28">
          <div
            className="absolute left-[5px] top-2 bottom-2 w-px bg-zinc-900/12 dark:bg-white/12"
            aria-hidden="true"
          />
          <motion.div
            className="absolute left-[5px] top-2 bottom-2 w-px origin-top bg-gradient-to-b from-[#FF5A1F] via-[#0ea5e9] to-zinc-900 dark:to-white"
            style={{ scaleY: railScale }}
            aria-hidden="true"
          />

          {steps.map((step, i) => (
            <li key={step.title} className="relative pl-12 md:pl-20">
              <motion.span
                className="absolute left-0 top-1.5 w-[11px] h-[11px] rounded-full border-2 bg-[#F5F3EE] dark:bg-zinc-900 text-zinc-900 dark:text-white"
                style={{ borderColor: step.color }}
                initial={{ scale: 0.5, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, margin: "-20%" }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                aria-hidden="true"
              />

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-15%" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="block font-mono text-[10px] tracking-[0.3em] uppercase text-zinc-500 mb-4">
                  {String(i + 1).padStart(2, "0")} — {step.label}
                </span>

                <h3 className="font-instrument text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.1] tracking-tight text-zinc-900 dark:text-white mb-5">
                  {step.title}
                </h3>

                <p className="text-zinc-600 dark:text-zinc-400 text-base md:text-lg leading-relaxed max-w-xl mb-8">
                  {step.description}
                </p>

                <div className="font-mono text-[11px] md:text-xs text-zinc-500 dark:text-zinc-500 border-l border-zinc-900/15 dark:border-white/15 pl-4 py-1.5 overflow-x-auto">
                  <span className="whitespace-nowrap">{step.artifact}</span>
                </div>
              </motion.div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
