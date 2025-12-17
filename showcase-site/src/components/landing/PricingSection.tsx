import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const PricingSection = () => {
  const { t } = useTranslation('landing');
  const plans = [
    {
      name: t('pricing.free.name'),
      price: t('pricing.free.price'),
      period: t('pricing.free.period'),
      description: t('pricing.free.description'),
      features: t('pricing.free.features', { returnObjects: true }) as string[],
      cta: t('pricing.free.cta'),
      highlighted: false,
      containerStyle: 'bg-white/95 dark:bg-gray-900/95 border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20',
      buttonStyle: 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20',
      textStyle: 'text-gray-900 dark:text-white',
      subTextStyle: 'text-gray-500 dark:text-gray-400',
      iconColor: 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300'
    },
    {
      name: t('pricing.pro.name'),
      price: t('pricing.pro.price'),
      originalPrice: t('pricing.pro.originalPrice'),
      period: t('pricing.pro.period'),
      description: t('pricing.pro.description'),
      features: t('pricing.pro.features', { returnObjects: true }) as string[],
      cta: t('pricing.pro.cta'),
      highlighted: true,
      badge: { text: t('pricing.pro.badge'), icon: Sparkles },
      containerStyle: 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-violet-500/50 shadow-2xl shadow-violet-500/20 ring-4 ring-violet-500/5',
      buttonStyle: 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40',
      textStyle: 'text-gray-900 dark:text-white',
      subTextStyle: 'text-gray-600 dark:text-gray-300',
      iconColor: 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-md shadow-violet-500/30'
    }
  ];

  return (
    <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 mb-20 sm:mb-24 pt-12 sm:pt-16 relative">
        {/* Background Atmosphere - Optimisé */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl bg-gradient-to-tr from-violet-500/8 via-fuchsia-500/4 to-transparent blur-[60px] rounded-full pointer-events-none -z-10" />

      {/* Header */}
      <div className="text-center mb-10 sm:mb-16 space-y-4 sm:space-y-6">
        <h2 className="text-2xl sm:text-4xl md:text-6xl font-semibold text-gray-900 dark:text-white tracking-tight">
          {t('pricing.title')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">{t('pricing.titleHighlight')}</span>
        </h2>
        <p className="text-base sm:text-xl text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto">
          {t('pricing.subtitle')}
        </p>
      </div>

      {/* Mobile: Pro first, Desktop: Free first */}
      <div className="grid md:grid-cols-2 gap-4 sm:gap-8 max-w-5xl mx-auto items-start">
        
        {/* Reverse order on mobile: show Pro plan first */}
        {[...plans].sort((a, b) => {
          // On mobile (handled by CSS order), we want highlighted first
          // This sort puts highlighted plan first in the array
          if (a.highlighted && !b.highlighted) return -1;
          if (!a.highlighted && b.highlighted) return 1;
          return 0;
        }).map((plan, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
            className={`relative flex flex-col p-6 sm:p-10 rounded-2xl sm:rounded-[32px] border transition-all duration-500 group ${plan.containerStyle} ${plan.highlighted ? 'md:-mt-8 md:mb-8 z-10 scale-[1.02] md:order-2' : 'md:order-1'}`}
          >
            {/* Gloss Effect overlay (Subtil reflet) */}
            <div className="absolute inset-0 rounded-2xl sm:rounded-[32px] bg-gradient-to-b from-white/40 to-transparent dark:from-white/5 pointer-events-none opacity-50" />

            {/* Badge - Only for highlighted plan */}
            {plan.badge && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xl backdrop-blur-md border bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-transparent">
                  <plan.badge.icon className="w-3.5 h-3.5 text-white" />
                  {plan.badge.text}
                </div>
              </div>
            )}

            {/* Header */}
            <div className="text-center mb-6 sm:mb-8 mt-2 sm:mt-4 relative z-10">
              <h3 className={`text-lg sm:text-xl font-bold mb-3 sm:mb-4 ${plan.textStyle}`}>
                {plan.name}
              </h3>
              <div className="flex items-baseline justify-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                {'originalPrice' in plan && (
                  <span className="text-xl sm:text-2xl font-medium text-gray-400 line-through">
                    {plan.originalPrice}€
                  </span>
                )}
                <span className={`text-4xl sm:text-6xl font-bold tracking-tighter ${plan.highlighted ? 'text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600' : plan.textStyle}`}>
                  {plan.price}€
                </span>
                <span className={`text-base sm:text-lg font-medium ${plan.subTextStyle}`}>
                  {plan.period}
                </span>
              </div>
              <p className={`text-xs sm:text-sm font-medium leading-relaxed ${plan.subTextStyle}`}>
                {plan.description}
              </p>
            </div>

            {/* Divider */}
            <div className={`h-px w-full mb-6 sm:mb-8 ${plan.highlighted ? 'bg-gradient-to-r from-transparent via-violet-200 dark:via-violet-800 to-transparent' : 'bg-gradient-to-r from-transparent via-gray-200 dark:via-white/10 to-transparent'}`} />

            {/* Features */}
            <ul className="space-y-3 sm:space-y-5 mb-6 sm:mb-10 flex-1 relative z-10">
              {plan.features.map((feature, j) => (
                <li key={j} className="flex items-start gap-3 sm:gap-4">
                  <div className={`mt-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center flex-shrink-0 ${plan.iconColor}`}>
                    <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" strokeWidth={3} />
                  </div>
                  <span className={`text-xs sm:text-sm font-medium ${plan.subTextStyle}`}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <a
              href="#waitlist"
              className={`block w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl text-center font-bold text-sm transition-all duration-300 transform active:scale-[0.98] relative z-10 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:outline-none ${plan.buttonStyle}`}
            >
              {plan.cta}
            </a>

          </motion.div>
        ))}
      </div>
    </section>
  );
};