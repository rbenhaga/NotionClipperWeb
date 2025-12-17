import { Fragment } from 'react';
import { Check, Minus, Crown, Zap, Smartphone, Wifi, FileText, HardDrive, CreditCard } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const ComparisonSection = () => {
  const { t } = useTranslation('landing');
  const features = [
    {
      name: t('comparison.features.price'),
      notion: t('comparison.values.free'),
      copy: '7,99 €',
      clipper: '1,99 €*',
      highlight: true,
      icon: CreditCard
    },
    {
      name: t('comparison.features.latency'),
      notion: '~2.0s',
      copy: '~1.2s',
      clipper: '180ms',
      highlight: true,
      icon: Zap
    },
    {
      name: t('comparison.features.desktopApp'),
      notion: false,
      copy: false,
      clipper: true,
      icon: Smartphone
    },
    {
      name: t('comparison.features.offlineMode'),
      notion: false,
      copy: false,
      clipper: true,
      icon: Wifi
    },
    {
      name: t('comparison.features.parsing'),
      notion: t('comparison.values.basic'),
      copy: t('comparison.values.good'),
      clipper: t('comparison.values.advanced'),
      icon: FileText
    },
    {
      name: t('comparison.features.localStorage'),
      notion: false,
      copy: false,
      clipper: true,
      icon: HardDrive
    },
  ];

  const renderCell = (content: string | boolean, isHighlight = false) => {
    if (typeof content === 'boolean') {
      return content ? (
        <div className="flex justify-center">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20">
            <Check className="w-3.5 h-3.5 text-emerald-500" strokeWidth={3} />
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
           <Minus className="w-4 h-4 text-gray-300 dark:text-gray-600" />
        </div>
      );
    }
    return (
      <span className={`text-sm ${isHighlight ? 'font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600' : 'font-medium text-gray-600 dark:text-gray-300 font-mono'}`}>
        {content}
      </span>
    );
  };

  // Render cell for mobile - more compact
  const renderMobileCell = (content: string | boolean, isHighlight = false) => {
    if (typeof content === 'boolean') {
      return content ? (
        <Check className="w-4 h-4 text-emerald-500 mx-auto" strokeWidth={3} />
      ) : (
        <Minus className="w-4 h-4 text-gray-300 dark:text-gray-600 mx-auto" />
      );
    }
    return (
      <span className={`text-xs ${isHighlight ? 'font-bold text-violet-600 dark:text-violet-400' : 'font-medium text-gray-600 dark:text-gray-400'}`}>
        {content}
      </span>
    );
  };

  return (
    <section id="comparatif" className="max-w-6xl mx-auto px-4 sm:px-6 mb-20 sm:mb-24 pt-12 sm:pt-16">
      
      <div className="text-center mb-8 sm:mb-12 md:mb-20">
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-semibold text-gray-900 dark:text-white tracking-tight mb-4 sm:mb-6">
          {t('comparison.title')}{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">
            {t('comparison.titleHighlight')}
          </span>
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
          {t('comparison.subtitle')}
        </p>
        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-3 sm:mt-4">
          {t('comparison.founderNote')}
        </p>
      </div>

      <div className="relative">
        {/* Glow Effect Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5 blur-3xl -z-10 rounded-[100px]" />

        {/* VERSION MOBILE : Tableau compact */}
        <div className="md:hidden">
          <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-4 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
              <div className="p-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wide"></div>
              <div className="p-3 text-center text-[10px] font-medium text-gray-500 dark:text-gray-400">Notion</div>
              <div className="p-3 text-center text-[10px] font-medium text-gray-500 dark:text-gray-400">Copy</div>
              <div className="p-3 text-center bg-violet-50 dark:bg-violet-500/10 border-l border-violet-100 dark:border-violet-500/20">
                <div className="flex items-center justify-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400">Pro</span>
                </div>
              </div>
            </div>
            
            {/* Data rows */}
            {features.map((feature, i) => (
              <div key={i} className={`grid grid-cols-4 ${i !== features.length - 1 ? 'border-b border-gray-100 dark:border-white/5' : ''}`}>
                <div className="p-3 flex items-center gap-1.5">
                  <feature.icon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 leading-tight">
                    {feature.name}
                  </span>
                </div>
                <div className="p-3 flex items-center justify-center">
                  {renderMobileCell(feature.notion)}
                </div>
                <div className="p-3 flex items-center justify-center">
                  {renderMobileCell(feature.copy)}
                </div>
                <div className="p-3 flex items-center justify-center bg-violet-50/50 dark:bg-violet-500/5 border-l border-violet-100 dark:border-violet-500/10">
                  {renderMobileCell(feature.clipper, feature.highlight)}
                </div>
              </div>
            ))}
          </div>
          
          {/* Footer note */}
          <p className="text-[10px] text-center text-gray-500 dark:text-gray-400 mt-3">
            {t('comparison.founderNote')}
          </p>
        </div>

        {/* VERSION DESKTOP : Tableau classique */}
        <div className="hidden md:block w-full overflow-hidden rounded-3xl border border-gray-200 dark:border-white/10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl">
          <div className="grid grid-cols-[1.5fr_1fr_1fr_1.2fr]">
            
            {/* --- HEADER ROW --- */}
            <div className="p-6 text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-end border-b border-gray-200 dark:border-white/5">
              {t('comparison.header')}
            </div>
            <div className="p-6 text-center text-sm font-medium text-gray-500 dark:text-gray-400 flex flex-col justify-end gap-2 border-b border-gray-200 dark:border-white/5">
              <span>Notion Web Clipper</span>
            </div>
            <div className="p-6 text-center text-sm font-medium text-gray-500 dark:text-gray-400 flex flex-col justify-end gap-2 border-b border-gray-200 dark:border-white/5">
              <span>Copy to Notion</span>
            </div>
            <div className="p-6 text-center relative bg-violet-50/50 dark:bg-white/5 border-l border-r border-b border-violet-100 dark:border-white/5 flex flex-col justify-end gap-2">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500" />
              <div className="flex items-center justify-center gap-2 text-gray-900 dark:text-white font-bold text-lg">
                <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />
                Clipper Pro
              </div>
            </div>

            {/* --- DATA ROWS --- */}
            {features.map((feature, i) => (
              <Fragment key={i}>
                {/* Feature Name */}
                <div className="p-6 flex items-center gap-3 border-b border-gray-100 dark:border-white/5 bg-transparent group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                  <feature.icon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {feature.name}
                  </span>
                </div>

                {/* Notion Data */}
                <div className="p-6 flex items-center justify-center border-b border-gray-100 dark:border-white/5 group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                  {renderCell(feature.notion)}
                </div>

                {/* Copy to Notion Data */}
                <div className="p-6 flex items-center justify-center border-b border-gray-100 dark:border-white/5 group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                  {renderCell(feature.copy)}
                </div>

                {/* Clipper Pro Data (Highlighted Column) */}
                <div className="p-6 flex items-center justify-center border-b border-violet-100 dark:border-white/5 bg-violet-50/30 dark:bg-white/5 border-l border-r relative group hover:bg-violet-50/50 dark:hover:bg-white/10 transition-colors">
                  {renderCell(feature.clipper, feature.highlight)}
                </div>
              </Fragment>
            ))}

          </div>
        </div>
      </div>
    </section>
  );
};