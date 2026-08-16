"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "Is this useful if I'm just starting out?",
    answer:
      "Yes. Hint mode starts with a nudge rather than a solution, and every dry run is shown step by step, so you can work up to the answer instead of reading it.",
  },
  {
    question: "Won't this just make me dependent on it?",
    answer:
      "It's built to prevent that. You choose how much to reveal, interview mode asks you to justify your reasoning, and every answer names the pattern so the next problem gets easier without help.",
  },
  {
    question: "Which languages do you support?",
    answer:
      "Explanations are language-agnostic and use clean pseudo-code. Concrete implementations are available in Python, JavaScript, Java, and C++.",
  },
  {
    question: "How does the AI interviewer work?",
    answer:
      "It behaves like a real interviewer — asking follow-ups, probing edge cases, pushing for a better complexity, and evaluating how you explain your approach rather than just the final code.",
  },
];

export default function TestimonialsFAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="py-28 md:py-36 px-6 md:px-14 lg:px-20 bg-[#EAE7DF] dark:bg-zinc-950"
    >
      <div className="max-w-3xl mx-auto">
        <div className="flex items-baseline gap-6 mb-14 md:mb-20">
          <span className="font-mono text-[10px] md:text-[11px] tracking-[0.35em] uppercase text-zinc-500 shrink-0">
            Questions
          </span>
          <div className="h-px flex-1 bg-zinc-900/12 dark:bg-white/12" />
        </div>

        <ul className="border-t border-zinc-900/12 dark:border-white/12">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <li
                key={faq.question}
                className="border-b border-zinc-900/12 dark:border-white/12"
              >
                <h3>
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${index}`}
                    id={`faq-trigger-${index}`}
                    className="group w-full py-7 flex items-start justify-between gap-8 text-left outline-none"
                  >
                    <span
                      className={`font-instrument text-lg md:text-2xl leading-snug tracking-tight transition-colors duration-300 ${
                        isOpen
                          ? "text-zinc-900 dark:text-white"
                          : "text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white"
                      }`}
                    >
                      {faq.question}
                    </span>

                    <span
                      className="relative shrink-0 w-4 h-4 mt-2"
                      aria-hidden="true"
                    >
                      <span
                        className={`absolute top-1/2 left-0 w-4 h-px -translate-y-1/2 transition-colors duration-300 ${
                          isOpen
                            ? "bg-[#FF5A1F]"
                            : "bg-zinc-500 group-hover:bg-zinc-900 dark:group-hover:bg-white"
                        }`}
                      />
                      <span
                        className={`absolute left-1/2 top-0 h-4 w-px -translate-x-1/2 origin-center transition-all duration-300 ${
                          isOpen
                            ? "scale-y-0 bg-[#FF5A1F]"
                            : "scale-y-100 bg-zinc-500 group-hover:bg-zinc-900 dark:group-hover:bg-white"
                        }`}
                      />
                    </span>
                  </button>
                </h3>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-panel-${index}`}
                      role="region"
                      aria-labelledby={`faq-trigger-${index}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-8 pr-12 max-w-xl text-zinc-600 dark:text-zinc-400 text-[0.95rem] leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-24 md:mt-32 flex flex-col md:flex-row md:items-end md:justify-between gap-8"
        >
          <p className="font-instrument text-[clamp(1.6rem,3.4vw,2.6rem)] leading-[1.1] tracking-tight text-zinc-900 dark:text-white max-w-[16ch]">
            Still deciding? Bring one problem.
          </p>

          <div className="flex items-center gap-7 shrink-0">
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
          </div>
        </motion.div>
      </div>
    </section>
  );
}
