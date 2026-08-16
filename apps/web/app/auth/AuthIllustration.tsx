"use client";

import { useEffect, useState } from "react";

const STEP_MS = 2600;
const ORANGE = "#FF5A1F";
const BLUE = "#0ea5e9";

type Role = "left" | "right" | "mid";

type Frame = {
  active: Record<number, Role>;
  dim: number[];
  caption: string;
  found: boolean;
};

type Demo = {
  heading: string;
  array: number[];
  pattern: string;
  complexity: string;
  frames: Frame[];
};

const DEMOS: Record<"two-pointers" | "binary-search", Demo> = {
  "two-pointers": {
    heading: "You see the reasoning, not just the result.",
    array: [2, 7, 11, 15, 19, 24],
    pattern: "Two pointers",
    complexity: "O(n)",
    frames: [
      {
        active: { 0: "left", 5: "right" },
        dim: [],
        caption: "2 + 24 = 26 — too high, pull the right pointer in",
        found: false,
      },
      {
        active: { 0: "left", 4: "right" },
        dim: [5],
        caption: "2 + 19 = 21 — too low, push the left pointer up",
        found: false,
      },
      {
        active: { 1: "left", 4: "right" },
        dim: [0, 5],
        caption: "7 + 19 = 26 — too high, pull the right pointer in",
        found: false,
      },
      {
        active: { 1: "left", 3: "right" },
        dim: [0, 4, 5],
        caption: "7 + 15 = 22 — target found",
        found: true,
      },
    ],
  },
  "binary-search": {
    heading: "Every step halves what's left to check.",
    array: [3, 8, 14, 21, 27, 33, 41, 52],
    pattern: "Binary search",
    complexity: "O(log n)",
    frames: [
      {
        active: { 3: "mid" },
        dim: [],
        caption: "mid = 21 — less than 41, discard the left half",
        found: false,
      },
      {
        active: { 5: "mid" },
        dim: [0, 1, 2, 3],
        caption: "mid = 33 — less than 41, discard the left half",
        found: false,
      },
      {
        active: { 6: "mid" },
        dim: [0, 1, 2, 3, 4, 5],
        caption: "mid = 41 — target found",
        found: true,
      },
    ],
  },
};

export type AuthIllustrationVariant = keyof typeof DEMOS;

export default function AuthIllustration({
  variant = "two-pointers",
}: {
  variant?: AuthIllustrationVariant;
}) {
  const demo = DEMOS[variant];
  const frames = demo.frames;

  const [frameIndex, setFrameIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (!playing) return;
    if (frameIndex >= frames.length - 1) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => setFrameIndex((i) => i + 1), STEP_MS);
    return () => clearTimeout(timer);
  }, [playing, frameIndex, frames.length]);

  const frame = frames[frameIndex] ?? frames[0]!;
  const finished = !playing && frameIndex >= frames.length - 1;

  function replay() {
    setFrameIndex(0);
    setPlaying(true);
  }

  return (
    <div className="w-[55%] relative overflow-hidden flex flex-col justify-between bg-[#0B0F17] p-12 max-[1024px]:w-full max-[1024px]:h-[440px] max-[1024px]:p-8 max-[480px]:p-6">
      <div
        className="absolute -top-32 -right-24 w-[420px] h-[420px] rounded-full bg-[#0ea5e9]/10 blur-[110px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-32 -left-20 w-[360px] h-[360px] rounded-full bg-[#FF5A1F]/10 blur-[110px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-[0.35em] uppercase text-white/40">
          Levera — Dry run
        </span>
        <span className="font-mono text-[10px] tracking-[0.2em] text-white/30">
          {String(frameIndex + 1).padStart(2, "0")} / {String(frames.length).padStart(2, "0")}
        </span>
      </div>

      <div className="relative flex flex-col gap-10 my-auto py-6">
        <p className="text-[1.65rem] leading-[1.25] tracking-[-0.02em] text-white max-w-[17ch] max-[480px]:text-[1.35rem]">
          {demo.heading}
        </p>

        <div className="flex flex-col gap-6">
          <div className="flex gap-2.5 max-[480px]:gap-1.5">
            {demo.array.map((n, i) => {
              const role = frame.active[i];
              const isDim = frame.dim.includes(i);
              const color = frame.found
                ? BLUE
                : role === "right"
                  ? BLUE
                  : ORANGE;
              return (
                <div
                  key={n}
                  className={`flex-1 aspect-square rounded-lg border flex items-center justify-center font-mono text-sm ease-out max-[480px]:text-xs ${
                    reduced ? "transition-none" : "transition-all duration-700"
                  } ${
                    role
                      ? "text-white border-transparent"
                      : isDim
                        ? "text-white/15 border-white/5 bg-white/[0.01]"
                        : "text-white/40 border-white/12 bg-white/[0.03]"
                  }`}
                  style={role ? { backgroundColor: color } : undefined}
                >
                  {n}
                </div>
              );
            })}
          </div>

          <p
            className={`font-mono text-[11px] leading-relaxed max-[480px]:text-[10px] ${
              reduced ? "" : "transition-colors duration-500"
            }`}
            style={{ color: frame.found ? BLUE : "rgba(255,255,255,0.5)" }}
            aria-live="polite"
          >
            {frame.caption}
          </p>
        </div>
      </div>

      <div className="relative flex items-center justify-between gap-4">
        <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/30">
          {demo.pattern} · {demo.complexity}
        </span>

        <button
          type="button"
          onClick={replay}
          className={`flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] uppercase rounded-full border px-3.5 py-2 transition-all duration-300 ${
            finished
              ? "text-white/70 border-white/20 hover:text-white hover:border-white/40 hover:bg-white/5"
              : "text-white/25 border-white/10 cursor-default"
          }`}
          disabled={!finished}
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 12a9 9 0 1 0 3-6.7" />
            <polyline points="3 4 3 10 9 10" />
          </svg>
          Replay
        </button>
      </div>
    </div>
  );
}
