"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function WhyChooseUsSection() {
  return (
    <section className="relative py-24 px-8 md:px-16 bg-linear-to-br from-[#090D1A] to-[#03050B] text-white overflow-hidden font-sans">
      {/* Workspace Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundSize: "40px 40px",
          backgroundImage: "linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)",
          maskImage: "radial-gradient(circle at center, black, transparent 80%)",
          WebkitMaskImage: "radial-gradient(circle at center, black, transparent 80%)",
        }}
      />

      {/* Abstract Glowing Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#0ea5e9]/10 rounded-full blur-[80px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FF5A1F]/10 rounded-full blur-[80px] pointer-events-none animate-pulse" style={{ animationDelay: "2s" }} />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="md:w-1/2"
          >
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">
              Why Choose <span className="text-[#FF5A1F]">Levera?</span>
            </h2>
            <p className="text-[#94A3B8] text-lg leading-relaxed mb-8">
              We focus on building intuition, not just giving you the final answer. 
              Our interactive terminal environment and visual workspace make abstract 
              data structures tangible and easy to understand.
            </p>
            
            <ul className="space-y-4 mb-10">
              {["Visual Dry Runs for every algorithm", "Instant Complexity Analysis", "Pattern Matching & Concept Linking"].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-[#E2E8F0]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/auth/sign-up"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#111111] hover:bg-[#FAF9F6] rounded-xl font-bold transition-all shadow-[0_4px_12px_rgba(255,255,255,0.1)] hover:-translate-y-0.5"
            >
              Start Free Trial
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="md:w-1/2 w-full"
          >
            {/* Glassmorphism Card mimicking terminal UI */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
              <div className="flex gap-2 mb-4 border-b border-white/10 pb-4">
                <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
                <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                <div className="w-3 h-3 rounded-full bg-[#10B981]" />
              </div>
              <div className="font-mono text-sm text-[#E2E8F0] space-y-2">
                <p><span className="text-[#F43F5E]">function</span> <span className="text-[#0EA5E9]">binarySearch</span>(arr, target) {"{"}</p>
                <p className="pl-4">let left = <span className="text-[#10B981]">0</span>;</p>
                <p className="pl-4">let right = arr.length - <span className="text-[#10B981]">1</span>;</p>
                <p className="pl-4 text-[#64748B]">// AI Agent: &quot;Notice how we cut the search space in half...&quot;</p>
                <p className="pl-4"><span className="text-[#F43F5E]">while</span> (left &lt;= right) {"{"}</p>
                <p className="pl-8">let mid = Math.<span className="text-[#0EA5E9]">floor</span>((left + right) / <span className="text-[#10B981]">2</span>);</p>
                <p className="pl-8 text-white"><span className="inline-block w-2 h-4 bg-white animate-pulse align-middle" /> {/* Cursor */}</p>
                <p className="pl-4">{"}"}</p>
                <p>{"}"}</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
