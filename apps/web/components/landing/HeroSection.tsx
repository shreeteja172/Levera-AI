"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative w-full flex flex-col md:flex-row items-center justify-between py-24 px-8 md:px-16 min-h-[90vh] bg-[#EAE7DF] overflow-hidden font-sans">
      {/* Left Content */}
      <div className="z-10 flex flex-col items-start max-w-2xl mt-12 md:mt-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 mb-8 bg-black/5 border border-black/10 rounded-full px-4 py-2"
        >
          <span className="text-[#FF5A1F] text-sm">✨</span>
          <span className="text-sm font-bold text-[#64748B] uppercase tracking-wider">AI-Powered DSA Mentor</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold text-[#111111] leading-tight tracking-tight mb-6"
        >
          From <span className="text-[#FF5A1F]">Brute Force</span> to <span className="text-[#0ea5e9]">Optimal</span>, Instantly
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-[#64748B] mb-10 max-w-xl leading-relaxed"
        >
          Levera teaches you how to think about algorithms. Get multiple solutions, visual dry runs, pattern detection, and interview practice — all in one cohesive workspace.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <Link
            href="/auth/sign-up"
            className="flex items-center justify-center px-8 py-4 bg-[#111111] hover:bg-[#222222] text-white rounded-xl font-bold transition-all shadow-[0_4px_12px_rgba(0,0,0,0.12)] hover:-translate-y-0.5"
          >
            Start Learning Free
          </Link>
          <Link
            href="#features"
            className="flex items-center justify-center px-8 py-4 bg-white border border-black/10 hover:bg-[#FAF9F6] text-[#1E293B] rounded-xl font-bold transition-all"
          >
            Explore Features
          </Link>
        </motion.div>
      </div>

      {/* Right Visual (Abstract Floating Cards mimicking Auth Illustration) */}
      <div className="relative w-full md:w-1/2 h-[500px] mt-16 md:mt-0 flex justify-center items-center">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#0ea5e9]/20 rounded-full blur-[60px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#FF5A1F]/20 rounded-full blur-[60px] animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Floating Glass Cards */}
        <motion.div
          animate={{ y: [-10, 10, -10], rotate: [-2, 2, -2] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute z-30 bg-white/40 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-2xl w-72 -translate-x-12 -translate-y-8"
        >
          <div className="flex items-center gap-3 border-b border-black/5 pb-3 mb-3">
            <div className="w-8 h-8 rounded bg-[#FF5A1F]/10 flex items-center justify-center text-[#FF5A1F]">O(N)</div>
            <span className="font-bold text-xs uppercase tracking-widest text-[#FF5A1F]">Optimal Solution</span>
          </div>
          <div className="space-y-2">
            <div className="h-2 bg-black/5 rounded w-full" />
            <div className="h-2 bg-black/5 rounded w-4/5" />
            <div className="h-2 bg-black/5 rounded w-5/6" />
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [10, -10, 10], rotate: [2, -2, 2] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute z-20 bg-[#111111] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl w-72 translate-x-16 translate-y-12"
        >
          <div className="flex items-center gap-3 border-b border-white/10 pb-3 mb-3">
            <div className="w-8 h-8 rounded bg-[#0ea5e9]/20 flex items-center justify-center text-[#0ea5e9]">dp</div>
            <span className="font-bold text-xs uppercase tracking-widest text-[#0ea5e9]">Pattern Detected</span>
          </div>
          <div className="flex gap-2 items-end h-12">
            <div className="w-1/4 bg-[#0ea5e9]/40 rounded-t h-1/3" />
            <div className="w-1/4 bg-[#0ea5e9]/60 rounded-t h-2/3" />
            <div className="w-1/4 bg-[#0ea5e9]/80 rounded-t h-full" />
            <div className="w-1/4 bg-[#FF5A1F] rounded-t h-1/2 shadow-[0_0_8px_rgba(255,90,31,0.4)]" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
