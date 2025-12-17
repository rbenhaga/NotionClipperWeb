import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Play, ArrowRight } from 'lucide-react';

export const DemoSection = () => {
  const { t } = useTranslation('landing');
  const [videoError, setVideoError] = useState(false);

  return (
    <section id="demo" className="max-w-6xl mx-auto px-4 sm:px-6 mb-20 sm:mb-24">
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 tracking-tight">
          {t('demo.title')}{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">
            {t('demo.titleHighlight')}
          </span>{' '}
          {t('demo.titleEnd')}
        </h2>
        <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium">
          {t('demo.subtitle')}
        </p>
      </div>

      <div className="relative max-w-5xl mx-auto">
        {/* Glow Effect behind the video container */}
        <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/30 to-fuchsia-600/30 rounded-2xl sm:rounded-[2rem] blur-xl opacity-50 transition duration-1000" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative aspect-video bg-[#0B0F19] rounded-xl sm:rounded-[28px] overflow-hidden shadow-2xl ring-1 ring-white/10"
        >
          {videoError ? (
            /* Fallback CTA when video not available */
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 backdrop-blur-sm">
              <div className="text-center p-6 sm:p-12">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white dark:bg-black mx-auto mb-4 sm:mb-6 flex items-center justify-center shadow-xl ring-1 ring-black/5 dark:ring-white/10">
                  <Play className="w-8 h-8 sm:w-10 sm:h-10 text-violet-600 ml-1" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                  {t('demo.comingSoon', 'Démo disponible bientôt')}
                </h3>
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-6 sm:mb-8 max-w-md mx-auto">
                  {t('demo.comingSoonDesc', 'Nous finalisons la vidéo de démo. En attendant, inscrivez-vous pour un accès anticipé.')}
                </p>
                <a
                  href="#waitlist"
                  className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-semibold text-sm sm:text-base hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  {t('demo.joinBeta', 'Rejoindre la beta')}
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          ) : (
            /* Video Player */
            <video
              className="w-full h-full object-cover"
              controls
              playsInline
              preload="metadata"
              poster="/ClipperProDemo-poster.jpg"
              onError={() => setVideoError(true)}
            >
              <source src="/ClipperProDemo.mp4" type="video/mp4" />
              {t('demo.videoFallback')}
            </video>
          )}
        </motion.div>
      </div>
    </section>
  );
};