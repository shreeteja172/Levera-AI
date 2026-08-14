"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "Is Levera suitable for absolute beginners?",
    answer:
      "Yes, Levera breaks down problems into manageable hints and visualizes every step, making it perfect for beginners learning DSA patterns.",
  },
  {
    question: "Do you support languages other than JavaScript/Python?",
    answer:
      "Currently, our explanations are language-agnostic using clean pseudo-code, but we provide concrete solutions in Python, JavaScript, Java, and C++.",
  },
  {
    question: "How does the AI Interviewer work?",
    answer:
      "It simulates a real interview environment by asking follow-up questions, edge cases, and asking you to optimize your solution step-by-step.",
  },
];

export default function TestimonialsFAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      id="faq"
      className="py-32 px-6 md:px-12 lg:px-24 bg-zinc-950 landing-light:bg-[#EAE7DF] font-sans relative overflow-hidden"
    >
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-instrument text-white landing-light:text-zinc-900 tracking-tight mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-lg md:text-xl text-zinc-400 landing-light:text-zinc-600 font-light">
            Everything you need to know about Levera.
          </p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`bg-zinc-900/40 landing-light:bg-white border ${isOpen ? "border-zinc-700 landing-light:border-black/20" : "border-zinc-800/50 landing-light:border-black/10"} rounded-2xl overflow-hidden transition-all duration-300 hover:border-zinc-700 landing-light:hover:border-black/20 group`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full px-8 py-6 text-left flex justify-between items-center focus:outline-none"
                >
                  <span
                    className={`font-semibold text-lg md:text-xl transition-colors ${isOpen ? "text-white! landing-light:text-black!" : "text-zinc-300! landing-light:text-zinc-700! group-hover:text-zinc-100! landing-light:group-hover:text-zinc-900!"}`}
                  >
                    {faq.question}
                  </span>
                  <span
                    className={`flex-shrink-0 ml-4 w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${isOpen ? "bg-[#FF5A1F] border-[#FF5A1F] text-white! rotate-45" : "border-zinc-700 landing-light:border-black/20 text-zinc-400! landing-light:text-zinc-500! group-hover:border-zinc-500 landing-light:group-hover:border-black/30 group-hover:text-zinc-300! landing-light:group-hover:text-zinc-700!"}`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </span>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-8 pb-8 text-zinc-400 landing-light:text-zinc-600 text-lg leading-relaxed font-light">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
