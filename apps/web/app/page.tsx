import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import WhyChooseUsSection from "@/components/landing/WhyChooseUsSection";
import TestimonialsFAQSection from "@/components/landing/TestimonialsFAQSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#EAE7DF] dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 font-instrument selection:bg-[#FF5A1F]/30 selection:text-white">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <WhyChooseUsSection />
      <TestimonialsFAQSection />

      <footer className="py-12 text-center text-zinc-500 text-sm bg-[#EAE7DF] dark:bg-zinc-950 border-t border-black/10 dark:border-zinc-900/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-sans">
            Built with 🧡 by{" "}
            <a
              href="https://shreeteja.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-800! dark:text-zinc-200! hover:text-[#FF5A1F]! transition-colors duration-200"
            >
              Shreeteja
            </a>{" "}
            — mostly for Shreeteja, who is still bad at DSA and still learning
            his way out of it. It&apos;s helping, slowly. You&apos;re welcome to
            borrow it.
          </p>
          <p className="opacity-70">
            &copy; {new Date().getFullYear()} Levera. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
