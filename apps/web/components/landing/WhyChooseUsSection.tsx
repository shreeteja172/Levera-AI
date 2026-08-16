"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const proofs = [
  {
    kicker: "Breadth",
    title: "Every approach, not just the winner",
    body: "You see the brute force next to the optimal, so the trade-off you're making is visible instead of assumed.",
  },
  {
    kicker: "Transparency",
    title: "The reasoning stays on the surface",
    body: "Dry runs and complexity sit beside the code, not buried beneath it. Nothing is asserted without being shown.",
  },
  {
    kicker: "Transfer",
    title: "Patterns outlast problems",
    body: "Each answer names the pattern it belongs to and links the problems that share it, so solving one earns you many.",
  },
];

export default function WhyChooseUsSection() {
  return (
    <section className="relative py-28 md:py-36 px-6 md:px-14 lg:px-20 bg-[#EAE7DF] dark:bg-zinc-950 border-b border-black/10 dark:border-white/10">
      <div className="max-w-5xl mx-auto">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="block font-mono text-[10px] md:text-[11px] tracking-[0.35em] uppercase text-zinc-500 mb-12 md:mb-16"
        >
          Why Levera
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="font-instrument text-[clamp(2rem,5.2vw,3.9rem)] leading-[1.08] tracking-[-0.02em] text-zinc-900 dark:text-white max-w-[20ch]"
        >
          The answer is the easy part. Knowing{" "}
          <span className="relative inline-block">
            <span className="italic text-[#0ea5e9]">why it works</span>
            <motion.span
              className="absolute left-0 -bottom-0.5 h-px w-full origin-left bg-[#0ea5e9]/50"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            />
          </span>{" "}
          is what you take into the room.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 md:mt-12 md:ml-[28%] max-w-lg text-zinc-600 dark:text-zinc-400 text-base md:text-lg leading-relaxed"
        >
          Levera is built around the reasoning rather than the output. Every
          response keeps the approach, the trade-off, and the pattern visible —
          because that is the part that survives past the problem in front of
          you.
        </motion.p>

        <div className="mt-20 md:mt-28 grid md:grid-cols-3 gap-x-10 gap-y-12">
          {proofs.map((p, i) => (
            <motion.div
              key={p.kicker}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{
                duration: 0.6,
                delay: i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="border-t border-zinc-900/15 dark:border-white/15 pt-6"
            >
              <span className="block font-mono text-[10px] tracking-[0.3em] uppercase text-[#FF5A1F] mb-5">
                {p.kicker}
              </span>
              <h3 className="font-instrument text-xl md:text-2xl leading-snug tracking-tight text-zinc-900 dark:text-white mb-4">
                {p.title}
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                {p.body}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20 md:mt-28 flex flex-wrap items-center gap-7"
        >
          <Link
            href="/auth/sign-up"
            className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white! dark:text-black! text-sm transition-transform duration-300 hover:-translate-y-0.5"
          >
            Start free
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
          <span className="font-mono text-[11px] text-zinc-500">
            No card required
          </span>
        </motion.div>
      </div>
    </section>
  );
}
