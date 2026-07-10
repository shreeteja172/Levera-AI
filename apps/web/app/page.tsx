import styles from "./page.module.css";

const features = [
  {
    title: "Multiple Solutions",
    description:
      "Get brute force, better, and optimal solutions in one response with full explanations and complexity analysis.",
  },
  {
    title: "Step-by-Step Explanations",
    description:
      "Understand how to think about the problem, recognize patterns, and why each data structure is chosen.",
  },
  {
    title: "Dry Run Visualization",
    description:
      "Watch every iteration with variable updates, pointer movement, stack operations, and DP table construction.",
  },
  {
    title: "Pattern Detection",
    description:
      "Automatically identifies DSA patterns like sliding window, two pointers, DP, and more.",
  },
  {
    title: "Interview Mode",
    description:
      "Practice with an AI interviewer that asks follow-ups, requests optimization, and evaluates your answers.",
  },
  {
    title: "Hint Mode",
    description:
      "Progressively reveal hints from subtle nudges to pseudo code to full solutions.",
  },
];

const steps = [
  {
    title: "Ask a DSA Problem",
    description:
      "Paste a problem statement or describe the algorithmic challenge you're working on.",
  },
  {
    title: "Explore Solutions",
    description:
      "Walk through brute force to optimal with detailed explanations, complexity analysis, and dry runs.",
  },
  {
    title: "Master the Pattern",
    description:
      "Understand the underlying pattern, get related problems, and apply it confidently in interviews.",
  },
];

export default function Home() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.badge}>
          AI-Powered DSA Mentor
        </div>
        <h1>
          From <span>Brute Force</span> to Optimal, Instantly
        </h1>
        <p>
          Levera teaches you how to think about algorithms. Get multiple
          solutions, visual dry runs, pattern detection, and interview practice
          — all in one place.
        </p>
        <div className={styles.ctas}>
          <a className={styles.ctaPrimary} href="#features">
            Explore Features
          </a>
          <a
            className={styles.ctaSecondary}
            href="https://github.com/shreeteja172/levera-ai"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
      </section>

      <section className={styles.features} id="features">
        <h2>Everything You Need to Master DSA</h2>
        <div className={styles.featureGrid}>
          {features.map((feature) => (
            <div key={feature.title} className={styles.featureCard}>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.howItWorks}>
        <h2>How It Works</h2>
        <div className={styles.steps}>
          {steps.map((step, i) => (
            <div key={step.title} className={styles.step}>
              <div className={styles.stepNumber}>{i + 1}</div>
              <div className={styles.stepContent}>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className={styles.footer}>
        Levera &mdash; Learn. Understand. Optimize. Master DSA.
      </footer>
    </div>
  );
}
