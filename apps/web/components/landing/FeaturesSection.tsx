"use client";

import { motion } from "framer-motion";

const features = [
  {
    title: "Multiple Solutions",
    description: "Get brute force, better, and optimal solutions in one response with full explanations and complexity analysis.",
    icon: "🚀",
    color: "text-[#FF5A1F]",
    bg: "bg-[#FF5A1F]/10",
  },
  {
    title: "Step-by-Step Explanations",
    description: "Understand how to think about the problem, recognize patterns, and why each data structure is chosen.",
    icon: "🧠",
    color: "text-[#0ea5e9]",
    bg: "bg-[#0ea5e9]/10",
  },
  {
    title: "Dry Run Visualization",
    description: "Watch every iteration with variable updates, pointer movement, stack operations, and DP table construction.",
    icon: "👁️",
    color: "text-[#10B981]",
    bg: "bg-[#10B981]/10",
  },
  {
    title: "Pattern Detection",
    description: "Automatically identifies DSA patterns like sliding window, two pointers, DP, and more.",
    icon: "🧩",
    color: "text-[#8B5CF6]",
    bg: "bg-[#8B5CF6]/10",
  },
  {
    title: "Interview Mode",
    description: "Practice with an AI interviewer that asks follow-ups, requests optimization, and evaluates your answers.",
    icon: "👔",
    color: "text-[#F59E0B]",
    bg: "bg-[#F59E0B]/10",
  },
  {
    title: "Hint Mode",
    description: "Progressively reveal hints from subtle nudges to pseudo code to full solutions.",
    icon: "💡",
    color: "text-[#EC4899]",
    bg: "bg-[#EC4899]/10",
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

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-8 md:px-16 bg-[#F5F3EE] font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-5xl font-extrabold text-[#111111] tracking-tight mb-4"
          >
            Everything You Need to Master DSA
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-[#64748B] max-w-2xl mx-auto"
          >
            Build your intuition for algorithms with tools designed specifically for technical interview preparation.
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="bg-white border border-black/5 rounded-2xl p-8 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] transition-all flex flex-col gap-4"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${feature.bg}`}>
                {feature.icon}
              </div>
              <h3 className={`text-xl font-bold text-[#111111]`}>
                {feature.title}
              </h3>
              <p className="text-[#64748B] text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
