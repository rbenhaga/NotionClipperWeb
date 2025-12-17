import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Globe } from 'lucide-react';
import { ClipperLogo } from './ClipperLogo';
import { useTranslation } from 'react-i18next';

// Animated Burger/X Icon
const MenuToggle = ({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="md:hidden relative w-10 h-10 flex items-center justify-center"
    aria-label="Menu"
  >
    <div className="w-5 h-4 relative flex flex-col justify-center items-center">
      <motion.span
        animate={isOpen ? { rotate: 45, y: 0 } : { rotate: 0, y: -4 }}
        transition={{ duration: 0.2 }}
        className="absolute block h-0.5 w-5 bg-gray-800 dark:bg-white rounded-full"
      />
      <motion.span
        animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.1 }}
        className="absolute block h-0.5 w-5 bg-gray-800 dark:bg-white rounded-full"
      />
      <motion.span
        animate={isOpen ? { rotate: -45, y: 0 } : { rotate: 0, y: 4 }}
        transition={{ duration: 0.2 }}
        className="absolute block h-0.5 w-5 bg-gray-800 dark:bg-white rounded-full"
      />
    </div>
  </button>
);

// --- NAVIGATION COMPONENT ---
interface NavigationProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export const Navigation = ({ darkMode, setDarkMode }: NavigationProps) => {
  const { t, i18n } = useTranslation('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const currentLang = i18n.language?.startsWith('fr') ? 'fr' : 'en';

  const toggleLanguage = () => {
    const newLang = currentLang === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLang);
  };

  // Close menu on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (mobileMenuOpen) setMobileMenuOpen(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mobileMenuOpen]);

  // Detect scroll for refined border/blur
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: t('nav.demo'), href: '#demo' },
    { label: t('nav.features'), href: '#comment-ça-marche' },
    { label: t('nav.comparison'), href: '#comparatif' },
    { label: t('nav.pricing'), href: '#pricing' },
    { label: t('nav.faq'), href: '#faq' },
  ];

  return (
    <>
      <nav 
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled 
            ? 'bg-white/70 dark:bg-black/70 backdrop-blur-xl border-b border-black/5 dark:border-white/10' 
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between relative">
          
          {/* 1. LOGO (Left) */}
          <div className="flex-shrink-0 z-20">
            <a href="#" className="flex items-center gap-3 group">
              <ClipperLogo size={28} className="group-hover:scale-105 transition-transform" />
              <span className="font-semibold text-base tracking-tight text-gray-900 dark:text-white">Clipper Pro</span>
            </a>
          </div>

          {/* 2. LINKS (Absolute Center) */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-1 max-w-xl">
            {navLinks.map((item) => (
              <a 
                key={item.label}
                href={item.href} 
                className="px-3 py-2 text-[13px] font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors rounded-full hover:bg-black/5 dark:hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* 3. ACTIONS (Right) */}
          <div className="flex-shrink-0 z-20 flex items-center gap-1">
            {/* Language Switcher */}
            <button 
              onClick={toggleLanguage}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors hover:bg-black/5 dark:hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:outline-none"
              aria-label={t('nav.changeLanguage')}
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase">{currentLang}</span>
            </button>

            <button 
              onClick={() => setDarkMode(!darkMode)} 
              className="p-2.5 rounded-full text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:outline-none"
              aria-label={darkMode ? t('nav.lightMode') : t('nav.darkMode')}
            >
              {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
            
            <a 
              href="#waitlist" 
              className="hidden md:inline-flex items-center justify-center h-9 px-5 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-semibold hover:opacity-80 transition-opacity focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              {t('nav.betaAccess')}
            </a>

            <MenuToggle isOpen={mobileMenuOpen} onClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
          </div>
        </div>
      </nav>

      {/* Mobile Dropdown Menu - Integrated & Minimal */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Subtle backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Dropdown Panel - Glass effect matching navbar */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed top-14 left-0 right-0 z-50 md:hidden bg-white/70 dark:bg-black/70 backdrop-blur-xl border-b border-black/5 dark:border-white/10"
            >
              <div className="max-w-7xl mx-auto px-4 py-3">
                {/* Navigation Links */}
                <div className="space-y-0.5">
                  {navLinks.map((item) => (
                    <a 
                      key={item.label}
                      href={item.href}
                      className="block px-3 py-2.5 rounded-lg text-[15px] font-medium text-gray-800 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/10 active:bg-black/10 dark:active:bg-white/15 transition-colors" 
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
                
                {/* Divider */}
                <div className="my-3 h-px bg-black/10 dark:bg-white/10" />
                
                {/* Settings Row */}
                <div className="flex items-center justify-between px-3 py-2">
                  {/* Language */}
                  <button 
                    onClick={toggleLanguage}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    <span className="text-sm font-medium uppercase">{currentLang}</span>
                  </button>
                  
                  {/* Dark Mode */}
                  <button 
                    onClick={() => setDarkMode(!darkMode)}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    <span className="text-sm font-medium">{darkMode ? 'Light' : 'Dark'}</span>
                  </button>
                </div>
                
                {/* CTA */}
                <div className="mt-3 pt-3 border-t border-black/10 dark:border-white/10">
                  <a 
                    href="#waitlist" 
                    className="flex items-center justify-center w-full py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold text-sm hover:opacity-90 transition-opacity" 
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.joinBeta')}
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};