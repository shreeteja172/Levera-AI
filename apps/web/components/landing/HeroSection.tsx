"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative w-full flex flex-col md:flex-row items-center justify-between py-32 px-6 md:px-12 lg:px-24 min-h-[90vh] bg-zinc-950 overflow-hidden font-sans">
      <div className="z-10 flex flex-col items-start max-w-3xl mt-12 md:mt-0 relative">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-instrument text-white leading-[1.1] tracking-tight mb-8"
        >
          From{" "}
          <span className="bg-gradient-to-r from-[#FF5A1F] to-orange-400 bg-clip-text text-transparent">
            Brute Force
          </span>{" "}
          to{" "}
          <span className="bg-gradient-to-r from-[#0ea5e9] to-cyan-300 bg-clip-text text-transparent">
            Optimal
          </span>
          , Instantly.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-xl text-zinc-400 mb-12 max-w-2xl leading-relaxed font-light"
        >
          Levera teaches you how to think about algorithms. Get multiple
          solutions, visual dry runs, pattern detection, and interview practice
          — all in one cohesive workspace.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto"
        >
          <Link
            href="/auth/sign-up"
            className="group flex items-center justify-center px-8 py-4 bg-zinc-100 hover:bg-white text-black rounded-xl transition-all duration-300 ease-out hover:-translate-y-0.5"
            style={{ color: "#09090b" }}
          >
            Start Learning Free
            <svg
              className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
          <Link
            href="#features"
            className="flex items-center justify-center px-8 py-4 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-xl transition-all duration-300 ease-out"
            style={{ color: "#d4d4d8" }}
          >
            Explore Features
          </Link>
        </motion.div>
      </div>

      <div className="relative w-full md:w-1/2 h-[500px] mt-20 md:mt-0 flex justify-center items-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="relative z-30 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-[360px]"
        >
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-5">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex rounded-full h-2 w-2 bg-[#FF5A1F]" />
              <span className="font-bold text-xs uppercase tracking-widest text-zinc-300">
                Complexity Analysis
              </span>
            </div>
            <span className="font-mono text-[10px] text-zinc-500">
              n = 10&#8310;
            </span>
          </div>

          <svg viewBox="0 0 300 170" className="w-full h-auto">
            <line
              x1="28"
              y1="150"
              x2="290"
              y2="150"
              stroke="#3f3f46"
              strokeWidth="1"
            />
            <line
              x1="28"
              y1="150"
              x2="28"
              y2="15"
              stroke="#3f3f46"
              strokeWidth="1"
            />

            <motion.path
              d="M28,150 C110,148 190,110 280,20"
              fill="none"
              stroke="#FF5A1F"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, ease: "easeOut" }}
            />
            <motion.path
              d="M28,150 C110,138 190,120 280,95"
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, delay: 0.5, ease: "easeOut" }}
            />

            <motion.circle
              cx="280"
              cy="20"
              r="4"
              fill="#FF5A1F"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1.1 }}
            />
            <motion.circle
              cx="280"
              cy="95"
              r="4"
              fill="#0ea5e9"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1.6 }}
            />
          </svg>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5A1F] shrink-0" />
              <span className="text-xs text-zinc-400">Brute Force</span>
              <span className="font-mono text-xs text-[#FF5A1F] font-semibold">
                O(n&#178;)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0ea5e9] shrink-0" />
              <span className="text-xs text-zinc-400">Optimal</span>
              <span className="font-mono text-xs text-[#0ea5e9] font-semibold">
                O(n log n)
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.8, ease: "easeOut" }}
          className="absolute z-40 bottom-6 -right-2 md:right-0 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 flex items-center gap-2"
        >
          <svg
            className="w-4 h-4 text-emerald-400 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="text-xs font-medium text-zinc-200 whitespace-nowrap">
            1000x faster at scale
          </span>
        </motion.div>
      </div>
    </section>
  );
}
