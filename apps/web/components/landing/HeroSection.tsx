"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  animate,
  motion,
  useMotionValue,
  useMotionTemplate,
  useReducedMotion,
} from "framer-motion";

const MIN_PCT = 8;
const MAX_PCT = 92;
const REST_PCT = 46;
const START_PCT = 100;

const BRUTE_PATH =
  "M0,250 L25,198 L50,280 L75,183 L100,265 L125,168 L150,250 L175,153 L200,235 L225,138 L250,220 L275,123 L300,205 L325,108 L350,190 L375,93 L400,175 L425,78 L450,160 L475,63 L500,145 L525,48 L550,130 L575,33 L600,70";
const OPTIMAL_PATH = "M0,250 C200,240 380,150 600,70";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function HeroSection() {
  const bandRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const reduceMotion = useReducedMotion();

  const percent = useMotionValue(REST_PCT);

  const clipLeft = useMotionTemplate`polygon(0% 0%, ${percent}% 0%, ${percent}% 100%, 0% 100%)`;
  const clipRight = useMotionTemplate`polygon(${percent}% 0%, 100% 0%, 100% 100%, ${percent}% 100%)`;
  const seamLeft = useMotionTemplate`${percent}%`;

  useEffect(() => {
    if (reduceMotion) {
      percent.set(REST_PCT);
      return;
    }
    const controls = animate(percent, [START_PCT, REST_PCT], {
      duration: 1.3,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => {
      controls.stop();
      percent.set(REST_PCT);
    };
  }, [reduceMotion, percent]);

  function setFromPointer(clientX: number) {
    const rect = bandRef.current?.getBoundingClientRect();
    if (!rect) return;
    percent.set(
      clamp(((clientX - rect.left) / rect.width) * 100, MIN_PCT, MAX_PCT),
    );
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    draggingRef.current = true;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      draggingRef.current = true;
    }
    setFromPointer(e.clientX);
  }
  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (draggingRef.current) setFromPointer(e.clientX);
  }
  function onPointerUp() {
    draggingRef.current = false;
  }
  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const step = e.key === "ArrowLeft" ? -6 : 6;
    percent.set(clamp(percent.get() + step, MIN_PCT, MAX_PCT));
  }

  return (
    <section className="relative w-full min-h-[100svh] flex flex-col overflow-hidden bg-[#EAE7DF] dark:bg-zinc-950">
      <div
        ref={bandRef}
        className="relative flex-1 min-h-[140px] md:min-h-[180px] mt-28 md:mt-32"
      >
        <motion.div
          className="absolute inset-0"
          style={{ clipPath: clipLeft }}
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 600 300"
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            <path
              d={BRUTE_PATH}
              fill="none"
              stroke="#FF5A1F"
              strokeWidth="1.25"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <span className="absolute left-6 md:left-14 lg:left-20 bottom-0 font-mono text-[10px] tracking-[0.2em] text-[#FF5A1F]">
            O(n²)
          </span>
        </motion.div>

        <motion.div
          className="absolute inset-0"
          style={{ clipPath: clipRight }}
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 600 300"
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            <path
              d={OPTIMAL_PATH}
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="1.75"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <span className="absolute right-6 md:right-14 lg:right-20 top-0 font-mono text-[10px] tracking-[0.2em] text-[#0ea5e9]">
            O(n log n)
          </span>
        </motion.div>

        <motion.div
          role="slider"
          tabIndex={0}
          aria-label="Reveal the optimal solution"
          aria-valuemin={MIN_PCT}
          aria-valuemax={MAX_PCT}
          aria-valuenow={REST_PCT}
          className="absolute inset-y-0 w-11 -ml-[22px] flex items-center justify-center cursor-ew-resize touch-none outline-none group"
          style={{ left: seamLeft }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={onKeyDown}
        >
          <div className="absolute inset-y-0 w-px bg-zinc-900/15 dark:bg-white/15" />
          <div className="relative w-7 h-7 rounded-full bg-[#EAE7DF] dark:bg-zinc-950 border border-zinc-900/20 dark:border-white/20 flex items-center justify-center transition-transform duration-200 group-hover:scale-110 group-focus-visible:scale-110">
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              className="stroke-zinc-900/60 dark:stroke-white/60"
            >
              <path d="M9 6l-5 6 5 6" />
              <path d="M15 6l5 6-5 6" />
            </svg>
          </div>
        </motion.div>
      </div>

      <div className="relative z-10 shrink-0 px-6 md:px-14 lg:px-20 pt-8 pb-12 md:pb-14">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="block font-mono text-[10px] md:text-[11px] tracking-[0.35em] uppercase text-zinc-500 dark:text-zinc-500 mb-6 md:mb-8"
        >
          Levera — AI DSA Mentor
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="font-instrument text-[clamp(2.4rem,6.5vw,4.8rem)] leading-[1] tracking-[-0.02em] text-zinc-900 dark:text-white max-w-[15ch]"
        >
          From <span className="text-[#FF5A1F]">brute force</span>
          <br />
          to <span className="italic text-[#0ea5e9]">optimal</span>.
        </motion.h1>

        <div className="mt-8 md:mt-10 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="text-zinc-600 dark:text-zinc-400 text-base md:text-lg leading-relaxed max-w-md"
          >
            Every approach, ranked — with complexity analysis, visual dry runs,
            and the pattern underneath.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-7 shrink-0"
          >
            <Link
              href="/auth/sign-up"
              className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white! dark:text-black! text-sm transition-transform duration-300 hover:-translate-y-0.5"
            >
              Start solving
              <svg
                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.75}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
            <a
              href="#features"
              className="text-sm text-zinc-500! hover:text-zinc-900! dark:hover:text-white! transition-colors border-b border-transparent hover:border-current pb-0.5"
            >
              How it works
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
