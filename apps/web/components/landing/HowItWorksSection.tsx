"use client";

import { motion } from "framer-motion";

const steps = [
  {
    title: "Ask a DSA Problem",
    description:
      "Paste a problem statement or describe the algorithmic challenge you're working on.",
    color: "#FF5A1F",
  },
  {
    title: "Explore Solutions",
    description:
      "Walk through brute force to optimal with detailed explanations, complexity analysis, and dry runs.",
    color: "#0ea5e9",
  },
  {
    title: "Master the Pattern",
    description:
      "Understand the underlying pattern, get related problems, and apply it confidently in interviews.",
    color: "#10B981",
  },
];

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="py-32 px-6 md:px-12 lg:px-24 bg-zinc-900 font-sans relative overflow-hidden border-y border-zinc-800"
    >
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-6xl font-instrument text-white tracking-tight mb-6"
          >
            How It Works
          </motion.h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-[#FF5A1F] to-orange-400 mx-auto rounded-full" />
        </div>

        <div className="relative">
          <div className="absolute left-8 md:left-1/2 top-10 bottom-10 w-0.5 bg-zinc-800 md:-ml-0.5 -z-10" />

          {steps.map((step, i) => {
            const isEven = i % 2 === 0;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                className={`flex flex-col md:flex-row items-start md:items-center justify-between mb-24 last:mb-0 ${
                  isEven ? "md:flex-row" : "md:flex-row-reverse"
                } group`}
              >
                <div
                  className={`md:w-[45%] pl-24 md:pl-0 ${isEven ? "md:text-right md:pr-16" : "md:text-left md:pl-16"} w-full relative`}
                >
                  <div
                    className="md:hidden shrink-0 absolute left-4 top-0 w-12 h-12 rounded-full bg-zinc-950 border-2 flex items-center justify-center font-bold text-lg shadow-lg transition-transform duration-300 group-hover:scale-110"
                    style={{ borderColor: step.color, color: step.color }}
                  >
                    {i + 1}
                  </div>

                  <h3 className="text-2xl md:text-3xl font-bold text-zinc-100 mb-4 group-hover:text-white transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-zinc-400 text-lg leading-relaxed font-light">
                    {step.description}
                  </p>
                </div>

                <div
                  className="hidden md:flex shrink-0 absolute left-1/2 -ml-8 w-16 h-16 rounded-full bg-zinc-950 border-4 border-solid items-center justify-center font-bold text-xl z-10 transition-transform duration-300 group-hover:scale-110"
                  style={{ borderColor: step.color, color: step.color }}
                >
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
