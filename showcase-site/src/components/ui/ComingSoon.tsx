import { Sparkles, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface ComingSoonProps {
  title?: string;
  description?: string;
  icon?: 'sparkles' | 'clock';
  variant?: 'default' | 'compact';
  className?: string;
}

export default function ComingSoon({
  title,
  description,
  icon = 'sparkles',
  variant = 'default',
  className = '',
}: ComingSoonProps) {
  const { t } = useTranslation('common');
  const IconComponent = icon === 'sparkles' ? Sparkles : Clock;
  
  const defaultTitle = t('common.soon', 'Soon');
  const defaultDescription = t('comingSoon.description', 'This feature is currently in development and will be available soon.');

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full border border-purple-200 dark:border-purple-800 ${className}`}>
        <IconComponent className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
          {t('common.soon', 'Soon')}
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl p-12 text-center ${className}`}
    >
      {/* Animated Background Gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100 dark:from-purple-900/20 dark:via-blue-900/10 dark:to-indigo-900/20"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />

      {/* Floating Orbs */}
      <motion.div
        className="absolute top-0 right-0 w-32 h-32 bg-purple-300/30 dark:bg-purple-600/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-32 h-32 bg-blue-300/30 dark:bg-blue-600/20 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.5, 0.3, 0.5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        <motion.div
          className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl mb-6 shadow-lg"
          animate={{
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <IconComponent className="w-10 h-10 text-white" />
        </motion.div>

        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {title || defaultTitle}
        </h3>

        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
          {description || defaultDescription}
        </p>

        <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex gap-1">
            <motion.div
              className="w-2 h-2 bg-purple-500 rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
            />
            <motion.div
              className="w-2 h-2 bg-blue-500 rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
            />
            <motion.div
              className="w-2 h-2 bg-indigo-500 rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
            />
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('common.soon', 'Soon')}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
