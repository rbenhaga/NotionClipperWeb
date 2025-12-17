import { motion } from 'framer-motion';
import { ArrowRight, Play, ChevronDown, Sparkles } from 'lucide-react';
import { useReducedMotion, getMotionVariants } from '../../hooks/useReducedMotion';
import { useTranslation } from 'react-i18next';

export const HeroSection = () => {
  const { t } = useTranslation('landing');
  const prefersReducedMotion = useReducedMotion();
  const { staggerContainer, fadeInUp } = getMotionVariants(prefersReducedMotion);

  // Animation variants pour une séquence fluide
  const containerVariants = staggerContainer;
  const itemVariants = fadeInUp;

  return (
    <section className="relative px-4 sm:px-6 bg-transparent text-gray-900 dark:text-white min-h-[92svh] xl:min-h-screen flex flex-col justify-center overflow-hidden">
      
      {/* Giant ClipperLogo Background - Hero only with zoom-out animation */}
      <motion.div 
        initial={{ scale: prefersReducedMotion ? 1 : 2.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          duration: prefersReducedMotion ? 0.3 : 1.8, 
          ease: [0.16, 1, 0.3, 1],
          opacity: { duration: 0.8 }
        }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-visible"
      >
        {/* SVG gradient definition */}
        <svg width="0" height="0" className="absolute">
          <defs>
            <linearGradient id="heroSparklesGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Desktop only (xl: 1280px+) - hidden on mobile/tablet for clean look */}
        <Sparkles
          strokeWidth={0.4}
          className="hidden xl:block"
          style={{
            stroke: 'url(#heroSparklesGradient)',
            width: '3000vmax',
            height: '3000vmax',
            minWidth: '3000px',
            minHeight: '3000px',
          }}
        />
      </motion.div>

      {/* Fond : Grille subtile - Desktop only */}
      <div className="absolute inset-0 pointer-events-none hidden sm:block" style={{ transform: 'translate3d(0,0,0)' }}>
        <div 
          className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"
          style={{ 
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 60%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 60%, transparent 100%)',
            transform: 'translate3d(0,0,0)',
          }}
        ></div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto text-center relative z-10"
      >
        {/* Badge d'annonce - Offre de lancement */}
        <motion.div variants={itemVariants} className="flex justify-center mb-6 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-200 dark:border-violet-500/20 shadow-[0_2px_10px_rgba(124,58,237,0.15)] backdrop-blur-md transition-transform hover:scale-[1.02] cursor-default">
            <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-gradient-to-r from-violet-500 to-fuchsia-500"></span>
            </span>
            <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">{t('hero.badge')}</span> {t('hero.badgeSuffix')}
            </span>
          </div>
        </motion.div>

        {/* Headline avec Tracking Tight & Gradient */}
        <motion.h1 variants={itemVariants} className="text-3xl sm:text-5xl lg:text-7xl font-semibold tracking-tight text-gray-900 dark:text-white mb-5 sm:mb-8 leading-[1.1]">
          {t('hero.title.line1')}
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 bg-[length:200%_auto] animate-gradient-x">{t('hero.title.line2')}</span>
        </motion.h1>

        {/* Subheadline Épurée */}
        <motion.p variants={itemVariants} className="text-base sm:text-xl lg:text-2xl text-gray-500 dark:text-gray-400 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed font-medium px-2">
          {t('hero.subtitle')}
        </motion.p>

        {/* CTAs : Matériaux Nobles */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-2">
          <a
            href="#waitlist"
            className="group relative w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 bg-gray-900 dark:bg-white text-white dark:text-black font-semibold text-base sm:text-lg rounded-xl sm:rounded-2xl hover:shadow-2xl hover:shadow-violet-500/20 transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 overflow-hidden focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity" />
            <span>{t('hero.cta.primary')}</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
          </a>
          
          <a
            href="#demo"
            className="group w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 bg-white dark:bg-white/5 text-gray-600 dark:text-gray-200 font-medium text-base sm:text-lg rounded-xl sm:rounded-2xl border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-0.5 text-gray-900 dark:text-white fill-current" />
            </div>
            <span>{t('hero.cta.secondary')}</span>
          </a>
        </motion.div>

      </motion.div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-6 sm:bottom-8 inset-x-0 flex justify-center"
      >
        <a 
          href="#demo" 
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none rounded-full"
          aria-label="Scroll to demo"
        >
          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />
          </motion.div>
        </a>
      </motion.div>
    </section>
  );
};