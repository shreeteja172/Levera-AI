"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function WhyChooseUsSection() {
  return (
    <section className="relative py-32 px-6 md:px-12 lg:px-24 bg-zinc-950 text-zinc-200 overflow-hidden font-sans border-b border-zinc-900">

      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundSize: "40px 40px",
          backgroundImage: "linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
          maskImage: "radial-gradient(circle at center, black, transparent 80%)",
          WebkitMaskImage: "radial-gradient(circle at center, black, transparent 80%)",
        }}
      />


      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#0ea5e9]/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#FF5A1F]/10 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDelay: "2s" }} />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-16">
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex-1 w-full"
          >
            <h2 className="text-4xl md:text-6xl font-instrument tracking-tight mb-8 text-white">
              Why Choose <span className="bg-gradient-to-r from-[#FF5A1F] to-orange-400 bg-clip-text text-transparent">Levera?</span>
            </h2>
            <p className="text-zinc-400 text-lg md:text-xl leading-relaxed mb-10 font-light">
              We focus on building intuition, not just giving you the final answer. 
              Our interactive terminal environment and visual workspace make abstract 
              data structures tangible and easy to understand.
            </p>
            
            <ul className="space-y-5 mb-12">
              {["Visual Dry Runs for every algorithm", "Instant Complexity Analysis", "Pattern Matching & Concept Linking"].map((item, idx) => (
                <li key={idx} className="flex items-center gap-4 text-zinc-300">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#10B981]/10 flex items-center justify-center border border-[#10B981]/20">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <span className="font-medium text-lg">{item}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/auth/sign-up"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-black hover:bg-zinc-100 rounded-xl transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:-translate-y-1"
              style={{ color: "#09090b" }}
            >
              Start Free Trial
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="flex-1 w-full max-w-[600px] mx-auto"
          >

            <div className="bg-zinc-900/60 backdrop-blur-2xl border border-zinc-800/80 rounded-2xl p-6 shadow-[0_30px_60px_rgba(0,0,0,0.6)] ring-1 ring-white/5">
              <div className="flex gap-2 mb-6 border-b border-zinc-800/50 pb-4">
                <div className="w-3.5 h-3.5 rounded-full bg-zinc-700/50 hover:bg-[#EF4444] transition-colors cursor-pointer" />
                <div className="w-3.5 h-3.5 rounded-full bg-zinc-700/50 hover:bg-[#F59E0B] transition-colors cursor-pointer" />
                <div className="w-3.5 h-3.5 rounded-full bg-zinc-700/50 hover:bg-[#10B981] transition-colors cursor-pointer" />
              </div>
              <div className="font-mono text-sm md:text-base text-zinc-300 space-y-3 leading-relaxed">
                <p><span className="text-[#F43F5E]">function</span> <span className="text-[#0EA5E9]">binarySearch</span>(arr, target) {"{"}</p>
                <p className="pl-6">let left = <span className="text-[#10B981]">0</span>;</p>
                <p className="pl-6">let right = arr.length - <span className="text-[#10B981]">1</span>;</p>
                <p className="pl-6 text-zinc-500">// AI Agent: &quot;Notice how we cut the search space in half...&quot;</p>
                <p className="pl-6"><span className="text-[#F43F5E]">while</span> (left &lt;= right) {"{"}</p>
                <p className="pl-12">let mid = Math.<span className="text-[#0EA5E9]">floor</span>((left + right) / <span className="text-[#10B981]">2</span>);</p>
                <p className="pl-12 text-white"><span className="inline-block w-2.5 h-5 bg-zinc-400 animate-pulse align-middle" /></p>
                <p className="pl-6">{"}"}</p>
                <p>{"}"}</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
