"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "Is Levera suitable for absolute beginners?",
    answer: "Yes, Levera breaks down problems into manageable hints and visualizes every step, making it perfect for beginners learning DSA patterns."
  },
  {
    question: "Do you support languages other than JavaScript/Python?",
    answer: "Currently, our explanations are language-agnostic using clean pseudo-code, but we provide concrete solutions in Python, JavaScript, Java, and C++."
  },
  {
    question: "How does the AI Interviewer work?",
    answer: "It simulates a real interview environment by asking follow-up questions, edge cases, and asking you to optimize your solution step-by-step."
  }
];

export default function TestimonialsFAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 px-8 md:px-16 bg-[#EAE7DF] font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#111111] tracking-tight mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-[#64748B]">
            Everything you need to know about Levera.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index} 
                className="bg-white border border-black/5 rounded-2xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)]"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
                >
                  <span className="font-bold text-[#111111] text-lg">{faq.question}</span>
                  <span className="text-[#FF5A1F] text-2xl font-light transform transition-transform duration-300" style={{ transform: isOpen ? 'rotate(45deg)' : 'none' }}>
                    +
                  </span>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-6 text-[#64748B] leading-relaxed">
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
