"use client";

import { motion } from "framer-motion";

const steps = [
  {
    title: "Ask a DSA Problem",
    description: "Paste a problem statement or describe the algorithmic challenge you're working on.",
    color: "#FF5A1F",
  },
  {
    title: "Explore Solutions",
    description: "Walk through brute force to optimal with detailed explanations, complexity analysis, and dry runs.",
    color: "#0ea5e9",
  },
  {
    title: "Master the Pattern",
    description: "Understand the underlying pattern, get related problems, and apply it confidently in interviews.",
    color: "#10B981",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-24 px-8 md:px-16 bg-white font-sans relative overflow-hidden">
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-5xl font-extrabold text-[#111111] tracking-tight mb-4"
          >
            How It Works
          </motion.h2>
          <div className="w-16 h-1 bg-[#FF5A1F] mx-auto rounded-full" />
        </div>

        <div className="relative">
          <div className="absolute left-8 md:left-1/2 top-10 bottom-10 w-0.5 bg-black/5 md:-ml-0.5 -z-10" />

          {steps.map((step, i) => {
            const isEven = i % 2 === 0;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                className={`flex flex-col md:flex-row items-start md:items-center justify-between mb-16 last:mb-0 ${
                  isEven ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                <div className={`md:w-[45%] pl-20 md:pl-0 ${isEven ? "md:text-right md:pr-12" : "md:text-left md:pl-12"} w-full relative`}>
                  <div className="md:hidden shrink-0 absolute left-4 top-2 w-10 h-10 rounded-full bg-white border-4 flex items-center justify-center font-bold text-sm shadow-sm" style={{ borderColor: step.color, color: step.color }}>
                    {i + 1}
                  </div>
                  
                  <h3 className="text-xl font-bold text-[#111111] mb-2">{step.title}</h3>
                  <p className="text-[#64748B] leading-relaxed">{step.description}</p>
                </div>

                <div className="hidden md:flex shrink-0 absolute left-1/2 -ml-6 w-12 h-12 rounded-full bg-white border-4 border-solid items-center justify-center font-bold text-lg shadow-[0_4px_12px_rgba(0,0,0,0.08)] z-10" style={{ borderColor: step.color, color: step.color }}>
                  {i + 1}
                </div>

                <div className="hidden md:block md:w-[45%]" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
