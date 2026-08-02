import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import WhyChooseUsSection from "@/components/landing/WhyChooseUsSection";
import TestimonialsFAQSection from "@/components/landing/TestimonialsFAQSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-200 font-instrument selection:bg-[#FF5A1F]/30 selection:text-white">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <WhyChooseUsSection />
      <TestimonialsFAQSection />
      

      <footer className="py-12 text-center text-zinc-500 text-sm bg-zinc-950 border-t border-zinc-900/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-zinc-400 font-sans">Handcrafted with 🧡 by <a href="https://shreeteja.vercel.app" target="_blank" rel="noopener noreferrer" className="text-zinc-200 font-medium hover:text-[#ff7d00] transition-colors duration-200">Shreeteja</a> to help students conquer Data Structures & Algorithms</p>
          <p className="opacity-70">&copy; {new Date().getFullYear()} Levera. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
