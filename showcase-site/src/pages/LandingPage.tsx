/**
 * LandingPage - Premium Conversion-Optimized
 * Clean design (Linear/Notion style) + proven conversion elements
 */

import { useState, useEffect } from 'react';
import {
  Navigation,
  HeroSection,
  DemoSection,
  HowItWorksSection,
  ComparisonSection,
  UseCasesSection,
  PricingSection,
  FAQSection,
  WaitlistSection,
  LandingFooter,
  AnimatedBackground,
  SectionDivider
} from '../components/landing';
import { CookieBanner } from '../components/CookieBanner';
import { ScrollProgress } from '../components/ScrollProgress';

export default function LandingPage() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      // Default to light mode, only use dark if explicitly set
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true';
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-gray-100 transition-colors relative">
      {/* Premium Animated Background Blobs */}
      <AnimatedBackground />

      <ScrollProgress />
      <Navigation darkMode={darkMode} setDarkMode={setDarkMode} />

      <main className="relative">
        <HeroSection />
        <SectionDivider />
        <DemoSection />
        <SectionDivider />
        <HowItWorksSection />
        <SectionDivider />
        <ComparisonSection />
        <SectionDivider />
        <UseCasesSection />
        <SectionDivider />
        <PricingSection />
        <SectionDivider />
        <FAQSection />
        <SectionDivider />
        <WaitlistSection />
      </main>

      <div className="relative z-10">
        <LandingFooter />
      </div>
      <CookieBanner />
    </div>
  );
}
