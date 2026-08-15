"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function WhyChooseUsSection() {
  return (
    <section className="relative py-32 px-6 md:px-12 lg:px-24 bg-[#EAE7DF] dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 overflow-hidden font-sans border-b border-black/10 dark:border-zinc-900">

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-16">

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex-1 w-full"
          >
            <h2 className="text-4xl md:text-6xl font-instrument tracking-tight mb-8 text-zinc-900 dark:text-white">
              Why Choose <span className="bg-gradient-to-r from-[#FF5A1F] to-orange-400 bg-clip-text text-transparent">Levera?</span>
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg md:text-xl leading-relaxed mb-10 font-light">
              We focus on building intuition, not just giving you the final answer.
              Our interactive terminal environment and visual workspace make abstract
              data structures tangible and easy to understand.
            </p>

            <ul className="space-y-5 mb-12">
              {["Visual Dry Runs for every algorithm", "Instant Complexity Analysis", "Pattern Matching & Concept Linking"].map((item, idx) => (
                <li key={idx} className="flex items-center gap-4 text-zinc-700 dark:text-zinc-300">
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
              className="inline-flex items-center justify-center px-8 py-4 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white! dark:text-black! rounded-xl transition-all duration-300 hover:-translate-y-0.5"
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

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <div className="flex gap-2 mb-6 border-b border-zinc-800/50 pb-4">
                <div className="w-3.5 h-3.5 rounded-full bg-zinc-700/50 hover:bg-[#EF4444] transition-colors cursor-pointer" />
                <div className="w-3.5 h-3.5 rounded-full bg-zinc-700/50 hover:bg-[#F59E0B] transition-colors cursor-pointer" />
                <div className="w-3.5 h-3.5 rounded-full bg-zinc-700/50 hover:bg-[#10B981] transition-colors cursor-pointer" />
              </div>
              <div className="font-mono text-sm md:text-base text-zinc-300 space-y-3 leading-relaxed">
                <p><span className="text-[#F43F5E]">function</span> <span className="text-[#0EA5E9]">binarySearch</span>(arr, target) {"{"}</p>
                <p className="pl-6">let left = <span className="text-[#10B981]">0</span>;</p>
                <p className="pl-6">let right = arr.length - <span className="text-[#10B981]">1</span>;</p>
                <p className="pl-6 text-zinc-500">{"// AI Agent: \"Notice how we cut the search space in half...\""}</p>
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
