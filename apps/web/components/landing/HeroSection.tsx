"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative w-full flex flex-col md:flex-row items-center justify-between py-32 px-6 md:px-12 lg:px-24 min-h-[90vh] bg-zinc-950 overflow-hidden font-sans">

      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-[#FF5A1F]/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] bg-[#0ea5e9]/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>


      <div className="z-10 flex flex-col items-start max-w-3xl mt-12 md:mt-0 relative">
        

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-instrument text-white leading-[1.1] tracking-tight mb-8"
        >
          From <span className="bg-gradient-to-r from-[#FF5A1F] to-orange-400 bg-clip-text text-transparent">Brute Force</span> to <span className="bg-gradient-to-r from-[#0ea5e9] to-cyan-300 bg-clip-text text-transparent">Optimal</span>, Instantly.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-xl text-zinc-400 mb-12 max-w-2xl leading-relaxed font-light"
        >
          Levera teaches you how to think about algorithms. Get multiple solutions, visual dry runs, pattern detection, and interview practice — all in one cohesive workspace.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto"
        >
          <Link
            href="/auth/sign-up"
            className="group flex items-center justify-center px-8 py-4 bg-zinc-100 hover:bg-white text-black rounded-xl transition-all duration-300 ease-out shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] hover:-translate-y-1"
            style={{ color: "#09090b" }}
          >
            Start Learning Free
            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <Link
            href="#features"
            className="flex items-center justify-center px-8 py-4 bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-xl transition-all duration-300 ease-out backdrop-blur-sm"
            style={{ color: "#d4d4d8" }}
          >
            Explore Features
          </Link>
        </motion.div>
      </div>


      <div className="relative w-full md:w-1/2 h-[500px] mt-20 md:mt-0 flex justify-center items-center">

        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#0ea5e9]/10 rounded-full blur-[80px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#FF5A1F]/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />
        

        <motion.div
          animate={{ y: [-15, 15, -15], rotate: [-3, 3, -3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute z-30 bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 shadow-[0_20px_40px_rgba(0,0,0,0.4)] w-80 -translate-x-12 -translate-y-12 ring-1 ring-white/5"
        >
          <div className="flex items-center gap-4 border-b border-zinc-800/50 pb-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#FF5A1F]/20 flex items-center justify-center text-[#FF5A1F] font-mono text-sm border border-[#FF5A1F]/30 shadow-[0_0_15px_rgba(255,90,31,0.2)]">O(N)</div>
            <span className="font-bold text-xs uppercase tracking-widest text-zinc-300">Optimal Solution</span>
          </div>
          <div className="space-y-3">
            <div className="h-2.5 bg-zinc-800 rounded-full w-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#FF5A1F] to-orange-400 w-full" />
            </div>
            <div className="h-2.5 bg-zinc-800 rounded-full w-4/5" />
            <div className="h-2.5 bg-zinc-800 rounded-full w-5/6" />
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [15, -15, 15], rotate: [3, -3, 3] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute z-20 bg-zinc-900/80 backdrop-blur-2xl border border-zinc-800/80 rounded-2xl p-6 shadow-[0_30px_60px_rgba(0,0,0,0.6)] w-80 translate-x-16 translate-y-16 ring-1 ring-white/5"
        >
          <div className="flex items-center gap-4 border-b border-zinc-800/50 pb-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#0ea5e9]/20 flex items-center justify-center text-[#0ea5e9] font-mono font-bold text-sm border border-[#0ea5e9]/30 shadow-[0_0_15px_rgba(14,165,233,0.2)]">dp</div>
            <span className="font-bold text-xs uppercase tracking-widest text-zinc-300">Pattern Detected</span>
          </div>
          <div className="flex gap-3 items-end h-16 pt-2">
            <div className="w-1/4 bg-zinc-800 rounded-t-md h-1/3 transition-all hover:h-1/2 cursor-pointer" />
            <div className="w-1/4 bg-zinc-700 rounded-t-md h-2/3 transition-all hover:h-full cursor-pointer" />
            <div className="w-1/4 bg-zinc-600 rounded-t-md h-full transition-all hover:bg-zinc-500 cursor-pointer" />
            <div className="w-1/4 bg-gradient-to-t from-[#0ea5e9] to-cyan-400 rounded-t-md h-4/5 shadow-[0_0_20px_rgba(14,165,233,0.4)] transition-all hover:h-full cursor-pointer relative group">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">O(N²)</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
