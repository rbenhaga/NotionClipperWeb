import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const FAQ_KEYS = ['security', 'offline', 'difference', 'founder', 'platforms', 'cancel', 'hosting'];

export const FAQSection = () => {
  const { t } = useTranslation('landing');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6 mb-20 sm:mb-24 pt-12 sm:pt-16">
      <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-12 border border-gray-200/50 dark:border-white/10 shadow-sm">
      
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white tracking-tight">
          {t('faq.title')}{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">
            {t('faq.titleHighlight')}
          </span>
        </h2>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-white/10">
        {FAQ_KEYS.map((key, i) => (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            key={key}
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between py-4 sm:py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 rounded-lg group"
              aria-expanded={openIndex === i}
            >
              <span className={`text-sm sm:text-[15px] font-medium transition-colors pr-4 ${openIndex === i ? 'text-violet-600 dark:text-violet-400' : 'text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400'}`}>
                {t(`faq.questions.${key}.question`)}
              </span>
              <div className="flex-shrink-0">
                {openIndex === i ? (
                  <Minus className="w-4 h-4 text-violet-500" />
                ) : (
                  <Plus className="w-4 h-4 text-gray-400 group-hover:text-violet-500 transition-colors" />
                )}
              </div>
            </button>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <p className="pb-5 text-sm text-gray-600 dark:text-gray-300 leading-relaxed pr-8">
                    {t(`faq.questions.${key}.answer`)}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
      </div>
    </section>
  );
};
