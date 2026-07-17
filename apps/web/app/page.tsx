import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import WhyChooseUsSection from "@/components/landing/WhyChooseUsSection";
import TestimonialsFAQSection from "@/components/landing/TestimonialsFAQSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#EAE7DF] text-[#111111] font-sans selection:bg-[#FF5A1F]/20 selection:text-[#FF5A1F]">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <WhyChooseUsSection />
      <TestimonialsFAQSection />
      
      {/* Footer */}
      <footer className="py-8 text-center text-[#64748B] text-sm bg-[#EAE7DF] border-t border-black/5">
        <p>Levera &mdash; Learn. Understand. Optimize. Master DSA.</p>
      </footer>
    </main>
  );
}
