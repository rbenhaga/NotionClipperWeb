import { motion } from 'framer-motion';
import { CheckCircle2, Command, ArrowDownToLine } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Real OS SVG Icons
const AppleLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);

const WindowsLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 12V6.75l6-1.32v6.48L3 12zm17-9v8.75l-10 .15V5.21L20 3zM3 13l6 .09v6.81l-6-1.15V13zm17 .25V22l-10-1.91V13.1l10 .15z"/>
  </svg>
);

const LinuxLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a.424.424 0 00-.11.135c-.26.268-.45.6-.663.839-.199.199-.485.267-.797.4-.313.136-.658.269-.864.68-.09.189-.136.394-.132.602 0 .199.027.4.055.536.058.399.116.728.04.97-.249.68-.28 1.145-.106 1.484.174.334.535.47.94.601.81.2 1.91.135 2.774.6.926.466 1.866.67 2.616.47.526-.116.97-.464 1.208-.946.587-.003 1.23-.269 2.26-.334.699-.058 1.574.267 2.577.2.025.134.063.198.114.333l.003.003c.391.778 1.113 1.132 1.884 1.071.771-.06 1.592-.536 2.257-1.306.631-.765 1.683-1.084 2.378-1.503.348-.199.629-.469.649-.853.023-.4-.2-.811-.714-1.376v-.097l-.003-.003c-.17-.2-.25-.535-.338-.926-.085-.401-.182-.786-.492-1.046h-.003c-.059-.054-.123-.067-.188-.135a.357.357 0 00-.19-.064c.431-1.278.264-2.55-.173-3.694-.533-1.41-1.465-2.638-2.175-3.483-.796-1.005-1.576-1.957-1.56-3.368.026-2.152.236-6.133-3.544-6.139zm.529 3.405h.013c.213 0 .396.062.584.198.19.135.33.332.438.533.105.259.158.459.166.724 0-.02.006-.04.006-.06v.105a.086.086 0 01-.004-.021l-.004-.024a1.807 1.807 0 01-.15.706.953.953 0 01-.213.335.71.71 0 00-.088-.042c-.104-.045-.198-.064-.284-.133a1.312 1.312 0 00-.22-.066c.05-.06.146-.133.183-.198.053-.128.082-.264.088-.402v-.02a1.21 1.21 0 00-.061-.4c-.045-.134-.101-.2-.183-.333-.084-.066-.167-.132-.267-.132h-.016c-.093 0-.176.03-.262.132a.8.8 0 00-.205.334 1.18 1.18 0 00-.09.4v.019c.002.089.008.179.02.267-.193-.067-.438-.135-.607-.202a1.635 1.635 0 01-.018-.2v-.02a1.772 1.772 0 01.15-.768c.082-.22.232-.406.43-.533a.985.985 0 01.594-.2zm-2.962.059h.036c.142 0 .27.048.399.135.146.129.264.288.344.465.09.199.14.4.153.667v.004c.007.134.006.2-.002.266v.08c-.03.007-.056.018-.083.024-.152.055-.274.135-.393.2.012-.09.013-.18.003-.267v-.015c-.012-.133-.04-.2-.082-.333a.613.613 0 00-.166-.267.248.248 0 00-.183-.064h-.021c-.071.006-.13.04-.186.132a.552.552 0 00-.12.27.944.944 0 00-.023.33v.015c.012.135.037.2.08.334.046.134.098.2.166.268.01.009.02.018.034.024-.07.057-.117.07-.176.136a.304.304 0 01-.131.068 2.62 2.62 0 01-.275-.402 1.772 1.772 0 01-.155-.667 1.759 1.759 0 01.08-.668 1.43 1.43 0 01.283-.535c.128-.133.26-.2.418-.2zm1.37 1.706c.332 0 .733.065 1.216.399.293.2.523.269 1.052.468h.003c.255.136.405.266.478.399v-.131a.571.571 0 01.016.47c-.123.31-.516.643-1.063.842v.002c-.268.135-.501.333-.775.465-.276.135-.588.292-1.012.267a1.139 1.139 0 01-.448-.067 3.566 3.566 0 01-.322-.198c-.195-.135-.363-.332-.612-.465v-.005h-.005c-.4-.246-.616-.512-.686-.71-.07-.268-.005-.47.193-.6.224-.135.38-.271.483-.336.104-.074.143-.102.176-.131h.002v-.003c.169-.202.436-.47.839-.601.139-.036.294-.065.466-.065zm2.8 2.142c.358 1.417 1.196 3.475 1.735 4.473.286.534.855 1.659 1.102 3.024.156-.005.33.018.513.064.646-1.671-.546-3.467-1.089-3.966-.22-.2-.232-.335-.123-.335.59.534 1.365 1.572 1.646 2.757.13.535.16 1.104.021 1.67.067.028.135.06.205.067 1.032.534 1.413.938 1.23 1.537v-.002c-.06-.135-.12-.2-.18-.264-.14-.135-.276-.135-.415-.2.045.066.09.135.121.2.346.933.174 1.735-.188 2.265-.405.6-1.006 1.003-1.57 1.07-.728.135-1.49-.133-1.983-.801-.114-.2-.14-.334-.106-.467.034-.135.14-.2.29-.265.134-.067.267-.135.4-.2.132-.065.264-.135.336-.265.08-.135.073-.333-.06-.465a.548.548 0 00-.42-.2.727.727 0 00-.467.2c-.201.134-.4.267-.6.4-.205.135-.41.267-.615.334-.4.135-.8.135-1.2-.002-.398-.135-.8-.4-1.2-.8-.18-.135-.4-.2-.6-.2-.2 0-.4.065-.6.2-.2.135-.4.267-.6.4-.2.135-.4.267-.6.334-.2.067-.4.067-.6 0-.2-.067-.4-.2-.6-.334-.2-.135-.4-.267-.6-.4a.727.727 0 00-.467-.2.548.548 0 00-.42.2c-.133.132-.14.33-.06.465.072.13.204.2.336.265.133.065.266.133.4.2.15.065.256.13.29.265.034.133.008.267-.106.467-.493.668-1.255.936-1.983.801-.564-.067-1.165-.47-1.57-1.07-.362-.53-.534-1.332-.188-2.265.031-.065.076-.134.121-.2-.139.065-.275.065-.415.2-.06.064-.12.129-.18.264v.002c-.183-.6.198-1.003 1.23-1.537.07-.007.138-.039.205-.067-.139-.566-.109-1.135.021-1.67.281-1.185 1.056-2.223 1.646-2.757.109 0 .097.135-.123.335-.543.499-1.735 2.295-1.089 3.966.183-.046.357-.069.513-.064.247-1.365.816-2.49 1.102-3.024.539-.998 1.377-3.056 1.735-4.473z"/>
  </svg>
);

export const HowItWorksSection = () => {
  const { t } = useTranslation('landing');

  return (
    <section id="comment-ça-marche" className="max-w-7xl mx-auto px-4 sm:px-6 mb-20 sm:mb-24 pt-12 sm:pt-16">
      
      {/* Header Minimaliste & Centré */}
      <div className="text-center mb-8 sm:mb-12 space-y-3 sm:space-y-4">
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-semibold text-gray-900 dark:text-white tracking-tight">
          {t('howItWorks.title')}{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">
            {t('howItWorks.titleHighlight')}
          </span>
        </h2>
        <p className="text-base sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
          {t('howItWorks.subtitle')}
        </p>
      </div>
      
      {/* Grid "Apple Bento" */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        
        {/* Card 1: Installation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="group relative h-56 sm:h-72 md:h-80 bg-white dark:bg-[#111] rounded-2xl sm:rounded-[32px] p-4 sm:p-8 overflow-hidden border border-gray-100 dark:border-white/5 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-500"
        >
          {/* Subtle Inner Highlight */}
          <div className="absolute inset-0 rounded-[32px] ring-1 ring-inset ring-white/50 dark:ring-white/5 pointer-events-none" />
          
          {/* Visual: Floating Dock Icon */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative group-hover:-translate-y-2 transition-transform duration-500 ease-out">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-white dark:bg-[#111] rounded-[20px] sm:rounded-[24px] shadow-xl flex items-center justify-center border border-gray-100 dark:border-white/10 z-10">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 dark:bg-white/10 rounded-lg sm:rounded-xl flex items-center justify-center text-gray-900 dark:text-white">
                    <ArrowDownToLine className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
                  </div>
                  {/* Progress Indicator Fake */}
                  <div className="absolute bottom-2.5 sm:bottom-3 left-1/2 -translate-x-1/2 w-10 sm:w-8 h-1 bg-gray-200 dark:bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full w-2/3 bg-blue-500 rounded-full" />
                  </div>
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1.5 sm:mb-3 block opacity-80">{t('howItWorks.steps.install.label')}</span>
            <h3 className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-white mb-0.5 sm:mb-2">{t('howItWorks.steps.install.title')}</h3>
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              {t('howItWorks.steps.install.description')}
            </p>
          </div>
        </motion.div>

        {/* Card 2: Connection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="group relative h-56 sm:h-72 md:h-80 bg-white dark:bg-[#111] rounded-2xl sm:rounded-[32px] p-4 sm:p-8 overflow-hidden border border-gray-100 dark:border-white/5 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-500"
        >
          <div className="absolute inset-0 rounded-[32px] ring-1 ring-inset ring-white/50 dark:ring-white/5 pointer-events-none" />
          
          {/* Visual: Connected Pill */}
          <div className="flex-1 flex items-center justify-center">
             <div className="relative group-hover:scale-105 transition-transform duration-500">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="relative flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2 sm:py-3 bg-white dark:bg-[#111] rounded-full shadow-lg border border-gray-100 dark:border-white/10 z-10">
                  <div className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-emerald-500"></span>
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 tracking-tight">Connected to Notion</span>
                  <div className="pl-1.5 sm:pl-2 border-l border-gray-200 dark:border-white/10">
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                  </div>
               </div>
             </div>
          </div>

          <div className="relative z-10">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1.5 sm:mb-3 block opacity-80">{t('howItWorks.steps.connect.label')}</span>
            <h3 className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-white mb-0.5 sm:mb-2">{t('howItWorks.steps.connect.title')}</h3>
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              {t('howItWorks.steps.connect.description')}
            </p>
          </div>
        </motion.div>

        {/* Card 3: Capture (Darkened for contrast) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="group relative h-56 sm:h-72 md:h-80 bg-[#0B0F19] dark:bg-white rounded-2xl sm:rounded-[32px] p-4 sm:p-8 overflow-hidden flex flex-col justify-between shadow-2xl hover:scale-[1.02] transition-transform duration-500 border border-gray-800 dark:border-gray-200"
        >
          <div className="absolute inset-0 rounded-[32px] ring-1 ring-inset ring-white/10 dark:ring-black/5 pointer-events-none" />

          {/* Visual: Realistic Keyboard Keys */}
          <div className="flex-1 flex items-center justify-center gap-2 sm:gap-3">
             {/* Key 1: Cmd */}
             <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-b from-gray-700 to-gray-800 dark:from-gray-100 dark:to-gray-200 flex items-center justify-center border-b-[2px] sm:border-b-[3px] border-gray-950 dark:border-gray-300 shadow-xl transform group-hover:translate-y-1 transition-transform duration-300">
                <Command className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 dark:text-gray-600" />
             </div>
             {/* Key 2: Shift */}
             <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-b from-gray-700 to-gray-800 dark:from-gray-100 dark:to-gray-200 flex items-center justify-center border-b-[2px] sm:border-b-[3px] border-gray-950 dark:border-gray-300 shadow-xl transform group-hover:translate-y-1 transition-transform duration-300 delay-75">
                <span className="text-lg sm:text-xl font-bold text-gray-400 dark:text-gray-600">⇧</span>
             </div>
             {/* Key 3: C */}
             <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-b from-gray-700 to-gray-800 dark:from-gray-100 dark:to-gray-200 flex items-center justify-center border-b-[2px] sm:border-b-[3px] border-gray-950 dark:border-gray-300 shadow-xl transform group-hover:translate-y-1 transition-transform duration-300 delay-150">
                <span className="text-lg sm:text-xl font-bold text-white dark:text-gray-900">C</span>
             </div>
          </div>

          <div className="relative z-10">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5 sm:mb-3 block opacity-80">{t('howItWorks.steps.capture.label')}</span>
            <h3 className="text-lg sm:text-2xl font-semibold text-white dark:text-gray-900 mb-0.5 sm:mb-2">{t('howItWorks.steps.capture.title')}</h3>
            <p className="text-xs sm:text-sm font-medium text-gray-400 dark:text-gray-600 leading-relaxed">
              {t('howItWorks.steps.capture.description')}
            </p>
          </div>
        </motion.div>

      </div>

      {/* Features Killer */}
      <div id="features" className="mt-14 sm:mt-20 text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-semibold text-gray-900 dark:text-white tracking-tight">
          {t('howItWorks.features.title')}{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">
            {t('howItWorks.features.titleHighlight')}
          </span>
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {/* Feature 1: Speed - Giant number */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="group relative h-56 sm:h-72 md:h-80 bg-white dark:bg-[#111] rounded-2xl sm:rounded-[28px] p-4 sm:p-6 overflow-hidden border border-gray-100 dark:border-white/5 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-500"
        >
          <div className="absolute inset-0 rounded-2xl sm:rounded-[28px] ring-1 ring-inset ring-white/50 dark:ring-white/5 pointer-events-none" />

          {/* Visual: Giant stat */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative group-hover:-translate-y-2 transition-transform duration-500">
              <div className="absolute inset-0 bg-amber-500/20 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative z-10 text-center">
                <span className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tighter text-gray-900 dark:text-white">
                  &lt;1
                </span>
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-amber-500 ml-1">s</span>
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <h3 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-white mb-0.5 sm:mb-1">
              {t('howItWorks.features.speed.title')}
            </h3>
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
              {t('howItWorks.features.speed.description')}
            </p>
          </div>
        </motion.div>

        {/* Feature 2: Offline Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          className="group relative h-56 sm:h-72 md:h-80 bg-white dark:bg-[#111] rounded-2xl sm:rounded-[28px] p-4 sm:p-6 overflow-hidden border border-gray-100 dark:border-white/5 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-500"
        >
          <div className="absolute inset-0 rounded-2xl sm:rounded-[28px] ring-1 ring-inset ring-white/50 dark:ring-white/5 pointer-events-none" />

          {/* Visual: Wifi off icon */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative group-hover:scale-105 transition-transform duration-500">
              <div className="absolute inset-0 bg-emerald-500/20 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative w-14 h-14 sm:w-20 sm:h-20 bg-emerald-500/10 rounded-xl sm:rounded-2xl flex items-center justify-center">
                <svg className="w-7 h-7 sm:w-10 sm:h-10 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="1" y1="1" x2="23" y2="23" />
                  <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
                  <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
                  <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
                  <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
                  <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                  <line x1="12" y1="20" x2="12.01" y2="20" />
                </svg>
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <h3 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-white mb-0.5 sm:mb-1">
              {t('howItWorks.features.offline.title')}
            </h3>
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
              {t('howItWorks.features.offline.description')}
            </p>
          </div>
        </motion.div>

        {/* Feature 3: Advanced Parser */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
          className="group relative h-56 sm:h-72 md:h-80 bg-white dark:bg-[#111] rounded-2xl sm:rounded-[28px] p-4 sm:p-6 overflow-hidden border border-gray-100 dark:border-white/5 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-500"
        >
          <div className="absolute inset-0 rounded-2xl sm:rounded-[28px] ring-1 ring-inset ring-white/50 dark:ring-white/5 pointer-events-none" />

          {/* Visual: Code blocks */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative group-hover:-translate-y-2 transition-transform duration-500">
              <div className="absolute inset-0 bg-violet-500/20 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative z-10 space-y-1.5 sm:space-y-2">
                <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-white dark:bg-white/10 rounded-md sm:rounded-lg shadow-sm border border-gray-100 dark:border-white/10">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-violet-500" />
                  <span className="text-[10px] sm:text-xs font-mono text-gray-600 dark:text-gray-300"># Heading</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-white dark:bg-white/10 rounded-md sm:rounded-lg shadow-sm border border-gray-100 dark:border-white/10 ml-2 sm:ml-4">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-pink-500" />
                  <span className="text-[10px] sm:text-xs font-mono text-gray-600 dark:text-gray-300">**bold**</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-white dark:bg-white/10 rounded-md sm:rounded-lg shadow-sm border border-gray-100 dark:border-white/10">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500" />
                  <span className="text-[10px] sm:text-xs font-mono text-gray-600 dark:text-gray-300">[link]()</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <h3 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-white mb-0.5 sm:mb-1">
              {t('howItWorks.features.parser.title')}
            </h3>
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
              {t('howItWorks.features.parser.description')}
            </p>
          </div>
        </motion.div>

        {/* Feature 4: Multi-platform */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
          className="group relative h-56 sm:h-72 md:h-80 bg-[#0B0F19] dark:bg-white rounded-2xl sm:rounded-[28px] p-4 sm:p-6 overflow-hidden flex flex-col justify-between shadow-2xl hover:scale-[1.02] transition-transform duration-500 border border-gray-800 dark:border-gray-200"
        >
          <div className="absolute inset-0 rounded-2xl sm:rounded-[28px] ring-1 ring-inset ring-white/10 dark:ring-black/5 pointer-events-none" />

          {/* Visual: OS dock */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative">
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Windows */}
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-md sm:rounded-lg bg-gradient-to-b from-gray-700 to-gray-800 dark:from-gray-100 dark:to-gray-200 flex items-center justify-center shadow-lg transform group-hover:-translate-y-1 transition-transform duration-300">
                  <WindowsLogo className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 dark:text-gray-600" />
                </div>
                {/* macOS */}
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-md sm:rounded-lg bg-gradient-to-b from-gray-700 to-gray-800 dark:from-gray-100 dark:to-gray-200 flex items-center justify-center shadow-lg transform group-hover:-translate-y-1 transition-transform duration-300" style={{ transitionDelay: '50ms' }}>
                  <AppleLogo className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 dark:text-gray-600" />
                </div>
                {/* Linux */}
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-md sm:rounded-lg bg-gradient-to-b from-gray-700 to-gray-800 dark:from-gray-100 dark:to-gray-200 flex items-center justify-center shadow-lg transform group-hover:-translate-y-1 transition-transform duration-300" style={{ transitionDelay: '100ms' }}>
                  <LinuxLogo className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 dark:text-gray-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <h3 className="text-base sm:text-xl font-semibold text-white dark:text-gray-900 mb-0.5 sm:mb-1">
              {t('howItWorks.features.platforms.title')}
            </h3>
            <p className="text-xs sm:text-sm font-medium text-gray-400 dark:text-gray-600 leading-relaxed line-clamp-2">
              {t('howItWorks.features.platforms.description')}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};