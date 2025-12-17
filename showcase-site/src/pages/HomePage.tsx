import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Zap, WifiOff, TrendingUp, Chrome, Monitor, Apple,
  ArrowRight, Check, Download, Image, Play,
  FileText, Layers, Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Download Modal Component
function DownloadModal({ 
  isOpen, 
  onClose,
  t 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  t: (key: string) => string;
}) {
  const downloads = [
    { os: 'macOS', icon: Apple, available: true },
    { os: 'Windows', icon: Monitor, available: true },
    { os: 'Linux', icon: Monitor, available: true },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl p-8 max-w-md w-full border border-neutral-200 dark:border-neutral-800"
          onClick={e => e.stopPropagation()}
        >
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
            {t('home:download.title')}
          </h3>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-6">
            {t('home:download.subtitle')}
          </p>
          
          <div className="space-y-2">
            {downloads.map((item) => (
              <button
                key={item.os}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 hover:bg-violet-50 dark:hover:bg-violet-500/10 border border-transparent hover:border-violet-200 dark:hover:border-violet-800 transition-all"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                  <span className="font-medium text-neutral-900 dark:text-white">{item.os}</span>
                </div>
                <Download className="w-4 h-4 text-violet-600" />
              </button>
            ))}
          </div>
          
          <button
            onClick={onClose}
            className="w-full mt-6 py-3 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors text-sm"
          >
            {t('home:download.close')}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Media Placeholder Component
function MediaPlaceholder({ type, label, className = '' }: { type: 'image' | 'gif' | 'video'; label: string; className?: string }) {
  return (
    <div className={`relative rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 flex flex-col items-center justify-center ${className}`}>
      <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center mb-3">
        {type === 'video' || type === 'gif' ? (
          <Play className="w-5 h-5 text-neutral-400" />
        ) : (
          <Image className="w-5 h-5 text-neutral-400" />
        )}
      </div>
      <p className="text-sm text-neutral-500 font-medium">{label}</p>
      <p className="text-xs text-neutral-400 mt-1">{type.toUpperCase()}</p>
    </div>
  );
}

export default function HomePage() {
  const { t } = useTranslation(['home', 'common']);
  const [betaSpots, setBetaSpots] = useState({ remaining: 347, total: 500 });
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    fetch(`${apiUrl}/stripe/beta-spots`)
      .then(res => res.json())
      .then(data => {
        if (data.data) setBetaSpots({ remaining: data.data.remaining, total: data.data.total });
      })
      .catch(() => {});
  }, [apiUrl]);

  const features = [
    { icon: WifiOff, key: 'offline' },
    { icon: Zap, key: 'instant' },
    { icon: TrendingUp, key: 'analytics' },
    { icon: FileText, key: 'files' },
    { icon: Layers, key: 'multiselect' },
    { icon: Layout, key: 'modes' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <Header />
      <DownloadModal isOpen={showDownloadModal} onClose={() => setShowDownloadModal(false)} t={t} />

      {/* HERO */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <div>
              {/* Beta badge */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 rounded-full mb-8"
              >
                <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
                  {t('home:hero.badge', { remaining: betaSpots.remaining })}
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl sm:text-6xl font-semibold tracking-tight text-neutral-900 dark:text-white mb-6"
              >
                {t('home:hero.title.line1')}
                <br />
                <span className="text-violet-600 dark:text-violet-400">{t('home:hero.title.line2')}</span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-neutral-500 dark:text-neutral-400 mb-10 max-w-xl"
              >
                {t('home:hero.subtitle')}
              </motion.p>

              {/* CTAs */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-3 mb-6"
              >
                <button
                  onClick={() => setShowDownloadModal(true)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  {t('home:hero.cta.download')}
                </button>
                
                <a
                  href="https://chrome.google.com/webstore"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-medium hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
                >
                  <Chrome className="w-4 h-4" />
                  {t('home:hero.cta.extension')}
                </a>
              </motion.div>

              {/* Secondary CTA */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="mb-8"
              >
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-1 text-sm text-violet-600 dark:text-violet-400 font-medium hover:underline"
                >
                  {t('home:hero.cta.freeTrial')}
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </motion.div>

              {/* Trust */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-6 text-sm text-neutral-500"
              >
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-violet-500" />
                  {t('home:hero.trust.platforms')}
                </span>
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-violet-500" />
                  {t('home:hero.trust.offline')}
                </span>
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-violet-500" />
                  {t('home:hero.trust.free')}
                </span>
              </motion.div>
            </div>

            {/* Right: App Preview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <MediaPlaceholder 
                type="gif" 
                label="App Demo" 
                className="aspect-[4/3] p-8"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center px-6">
          <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
        </div>
        <div className="relative flex justify-center">
          <div className="bg-white dark:bg-neutral-950 px-4">
            <div className="w-2 h-2 rounded-full bg-violet-500/50" />
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-semibold text-neutral-900 dark:text-white mb-4">
              {t('home:sections.features.title')}
            </h2>
            <p className="text-lg text-neutral-500 max-w-2xl mx-auto">
              {t('home:sections.features.subtitle')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-violet-200 dark:hover:border-violet-800 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
                <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                  {t(`home:features.${feature.key}.title`)}
                </h3>
                <p className="text-neutral-500 text-sm">
                  {t(`home:features.${feature.key}.description`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* EXTENSION PREVIEW */}
      <section className="relative py-24 px-6 bg-neutral-50 dark:bg-neutral-900/50">
        {/* Top wave separator */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-300 dark:via-violet-700 to-transparent" />
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <MediaPlaceholder 
                type="gif" 
                label="Extension Demo" 
                className="aspect-video p-8"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 rounded-full mb-4">
                <Chrome className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
                  {t('home:sections.extension.badge')}
                </span>
              </div>
              <h2 className="text-3xl font-semibold text-neutral-900 dark:text-white mb-4">
                {t('home:sections.extension.title')}
              </h2>
              <p className="text-neutral-500 mb-6">
                {t('home:sections.extension.subtitle')}
              </p>
              <ul className="space-y-2 mb-6">
                {(t('home:sections.extension.features', { returnObjects: true }) as string[]).map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <Check className="w-4 h-4 text-violet-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href="https://chrome.google.com/webstore"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-medium hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
              >
                <Chrome className="w-4 h-4" />
                {t('home:sections.extension.cta')}
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* DESKTOP APP PREVIEW */}
      <section className="relative py-24 px-6">
        {/* Top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-300 dark:via-violet-700 to-transparent" />
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 rounded-full mb-4">
                <Monitor className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
                  {t('home:sections.desktop.badge')}
                </span>
              </div>
              <h2 className="text-3xl font-semibold text-neutral-900 dark:text-white mb-4">
                {t('home:sections.desktop.title')}
              </h2>
              <p className="text-neutral-500 mb-6">
                {t('home:sections.desktop.subtitle')}
              </p>
              <ul className="space-y-2 mb-6">
                {(t('home:sections.desktop.features', { returnObjects: true }) as string[]).map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <Check className="w-4 h-4 text-violet-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setShowDownloadModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                {t('home:sections.desktop.cta')}
              </button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <MediaPlaceholder 
                type="image" 
                label="Desktop App Screenshot" 
                className="aspect-[4/3] p-8"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative py-24 px-6 bg-neutral-50 dark:bg-neutral-900/50">
        {/* Top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-300 dark:via-violet-700 to-transparent" />
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-semibold text-neutral-900 dark:text-white mb-4">
              {t('home:sections.howItWorks.title')}
            </h2>
            <p className="text-lg text-neutral-500">
              {t('home:sections.howItWorks.subtitle')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {(t('home:sections.howItWorks.steps', { returnObjects: true }) as Array<{ title: string; desc: string }>).map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-violet-600 flex items-center justify-center text-white font-semibold">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">{item.title}</h3>
                <p className="text-neutral-500 text-sm mb-3">{item.desc}</p>
                {i === 0 && (
                  <kbd className="inline-flex px-2.5 py-1 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded text-xs font-mono border border-neutral-200 dark:border-neutral-700">
                    Ctrl+C
                  </kbd>
                )}
                {i === 2 && (
                  <kbd className="inline-flex px-2.5 py-1 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded text-xs font-mono border border-neutral-200 dark:border-neutral-700">
                    Ctrl+Shift+C
                  </kbd>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative py-24 px-6">
        {/* Top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-300 dark:via-violet-700 to-transparent" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
              {t('home:cta.spotsRemaining', { remaining: betaSpots.remaining })}
            </span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl font-semibold text-neutral-900 dark:text-white mb-4">
            {t('home:cta.title')}
          </h2>
          <p className="text-lg text-neutral-500 mb-8">
            {t('home:cta.subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setShowDownloadModal(true)}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              {t('home:cta.download')}
            </button>
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center px-8 py-4 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-xl font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            >
              {t('home:cta.pricing')}
            </Link>
          </div>
          
          <p className="text-neutral-400 text-sm mt-6">
            {t('home:cta.trust')}
          </p>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
