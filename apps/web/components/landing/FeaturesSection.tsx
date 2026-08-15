"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

const features = [
  {
    title: "Multiple Solutions",
    description:
      "Get brute force, better, and optimal solutions in one response with full explanations and complexity analysis.",
    icon: "1",
    color: "text-[#FF5A1F]",
    bg: "bg-[#FF5A1F]/10",
    border: "border-[#FF5A1F]/20",
  },
  {
    title: "Step-by-Step Explanations",
    description:
      "Understand how to think about the problem, recognize patterns, and why each data structure is chosen.",
    icon: "2",
    color: "text-[#0ea5e9]",
    bg: "bg-[#0ea5e9]/10",
    border: "border-[#0ea5e9]/20",
  },
  {
    title: "Dry Run Visualization",
    description:
      "Watch every iteration with variable updates, pointer movement, stack operations, and DP table construction.",
    icon: "3",
    color: "text-[#10B981]",
    bg: "bg-[#10B981]/10",
    border: "border-[#10B981]/20",
  },
  {
    title: "Pattern Detection",
    description:
      "Automatically identifies DSA patterns like sliding window, two pointers, DP, and more.",
    icon: "4",
    color: "text-[#8B5CF6]",
    bg: "bg-[#8B5CF6]/10",
    border: "border-[#8B5CF6]/20",
  },
  {
    title: "Interview Mode",
    description:
      "Practice with an AI interviewer that asks follow-ups, requests optimization, and evaluates your answers.",
    icon: "5",
    color: "text-[#F59E0B]",
    bg: "bg-[#F59E0B]/10",
    border: "border-[#F59E0B]/20",
  },
  {
    title: "Hint Mode",
    description:
      "Progressively reveal hints from subtle nudges to pseudo code to full solutions.",
    icon: "6",
    color: "text-[#EC4899]",
    bg: "bg-[#EC4899]/10",
    border: "border-[#EC4899]/20",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};
const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};
export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="py-32 px-6 md:px-12 lg:px-24 bg-[#EAE7DF] dark:bg-zinc-950 font-sans relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-4xl md:text-6xl font-instrument text-zinc-900 dark:text-white tracking-tight mb-6"
          >
            Everything You Need to Master DSA
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto font-light leading-relaxed"
          >
            Build your intuition for algorithms with tools designed specifically
            for technical interview preparation.
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white dark:bg-zinc-900/40 border border-black/10 dark:border-zinc-800/50 hover:border-black/20 dark:hover:border-zinc-700 rounded-3xl p-8 transition-all duration-300 ease-out flex flex-col gap-5 group"
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${feature.bg} ${feature.border} border transition-colors duration-300`}
              >
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white transition-colors">
                {feature.title}
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-base leading-relaxed group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
