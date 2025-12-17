import { motion } from 'framer-motion';
import { Briefcase, Code, PenTool, GraduationCap, Users, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const USE_CASES_CONFIG = [
  {
    key: 'pm',
    icon: Briefcase,
    gradient: 'from-blue-500 to-cyan-500',
    iconBg: 'bg-blue-500/10 dark:bg-blue-500/20',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    key: 'developer',
    icon: Code,
    gradient: 'from-emerald-500 to-teal-500',
    iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    key: 'writer',
    icon: PenTool,
    gradient: 'from-amber-500 to-orange-500',
    iconBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    key: 'student',
    icon: GraduationCap,
    gradient: 'from-pink-500 to-rose-500',
    iconBg: 'bg-pink-500/10 dark:bg-pink-500/20',
    iconColor: 'text-pink-600 dark:text-pink-400',
  },
  {
    key: 'consultant',
    icon: Users,
    gradient: 'from-violet-500 to-purple-500',
    iconBg: 'bg-violet-500/10 dark:bg-violet-500/20',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
  {
    key: 'researcher',
    icon: Search,
    gradient: 'from-indigo-500 to-blue-500',
    iconBg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
];

export const UseCasesSection = () => {
  const { t } = useTranslation('landing');

  const useCases = USE_CASES_CONFIG.map(config => ({
    ...config,
    title: t(`useCases.cases.${config.key}.title`),
    description: t(`useCases.cases.${config.key}.description`),
    metric: t(`useCases.cases.${config.key}.metric`),
    label: t(`useCases.cases.${config.key}.label`),
  }));

  return (
    <section id="use-cases" className="max-w-7xl mx-auto px-4 sm:px-6 mb-20 sm:mb-24 pt-12 sm:pt-16">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-12 space-y-3 sm:space-y-4">
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-semibold text-gray-900 dark:text-white tracking-tight">
          {t('useCases.title')}{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">
            {t('useCases.titleHighlight')}
          </span>
        </h2>
        <p className="text-base sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
          {t('useCases.subtitle')}
        </p>
      </div>

      {/* Horizontal Scroll on Mobile, Grid on Desktop */}
      <div className="relative">
        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-6 gap-4">
          {useCases.map((useCase, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="group relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-3xl p-6 border border-gray-200/50 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl"
            >
              {/* Gradient accent line */}
              <div
                className={`absolute top-0 left-6 right-6 h-1 rounded-full bg-gradient-to-r ${useCase.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />

              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-2xl ${useCase.iconBg} ${useCase.iconColor} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
              >
                <useCase.icon className="w-6 h-6" strokeWidth={1.5} />
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                {useCase.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 leading-relaxed line-clamp-2">
                {useCase.description}
              </p>

              {/* Metric */}
              <div className="pt-4 border-t border-gray-100 dark:border-white/10">
                <div className="flex items-baseline gap-1.5">
                  <span
                    className={`text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${useCase.gradient}`}
                  >
                    {useCase.metric}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">
                  {useCase.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile Grid 2x3 */}
        <div className="md:hidden grid grid-cols-2 gap-3">
          {useCases.map((useCase, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="bg-white dark:bg-[#111] rounded-2xl p-4 border border-gray-200/50 dark:border-white/10"
            >
              {/* Icon */}
              <div
                className={`w-9 h-9 rounded-xl ${useCase.iconBg} ${useCase.iconColor} flex items-center justify-center mb-3`}
              >
                <useCase.icon className="w-4.5 h-4.5" strokeWidth={1.5} />
              </div>

              {/* Title */}
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1.5 leading-tight">
                {useCase.title}
              </h3>

              {/* Metric - compact */}
              <div className="flex items-baseline gap-1">
                <span
                  className={`text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r ${useCase.gradient}`}
                >
                  {useCase.metric}
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                  {useCase.label}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
