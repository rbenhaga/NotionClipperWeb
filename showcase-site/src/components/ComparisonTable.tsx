import { Check, X, Sparkles, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface ComparisonTableProps {
  variant?: 'condensed' | 'full';
}

// Status badge component
const StatusBadge = ({ status }: { status: 'ready' | 'soon' | 'planned' }) => {
  const { t } = useTranslation('common');
  
  if (status === 'ready') {
    return <Check className="w-5 h-5 mx-auto text-purple-600" strokeWidth={2.5} />;
  }
  
  if (status === 'soon') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/40 dark:to-blue-900/40 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
        <Clock className="w-3 h-3" />
        {t('common.soon', 'Soon')}
      </span>
    );
  }
  
  return (
    <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
  );
};

export default function ComparisonTable({ variant = 'condensed' }: ComparisonTableProps) {
  const { t } = useTranslation('common');
  const isCondensed = variant === 'condensed';

  // Données condensées pour Homepage (focus différenciation)
  const condensedFeatures = [
    {
      name: 'Price',
      icon: '💰',
      official: 'Free',
      saveToNotion: '$5.99/mo',
      copyToNotion: '$3.75-9/mo',
      clipperPro: '$2.99 early',
      clipperProStatus: 'ready' as const,
      highlight: true
    },
    {
      name: 'Desktop App',
      icon: '🖥️',
      official: false,
      saveToNotion: false,
      copyToNotion: false,
      clipperPro: 'macOS/Win/Linux',
      clipperProStatus: 'ready' as const,
      highlight: true
    },
    {
      name: 'Works Offline',
      icon: '📡',
      official: false,
      saveToNotion: false,
      copyToNotion: false,
      clipperPro: 'Queue + sync',
      clipperProStatus: 'ready' as const,
      highlight: true
    },
    {
      name: 'File Attachments',
      icon: '📎',
      official: false,
      saveToNotion: false,
      copyToNotion: false,
      clipperPro: true,
      clipperProStatus: 'ready' as const,
      highlight: true
    },
    {
      name: 'Templates',
      icon: '📋',
      official: false,
      saveToNotion: '4 max',
      copyToNotion: '1-5',
      clipperPro: 'Unlimited',
      clipperProStatus: 'ready' as const,
      highlight: true
    },
    {
      name: 'Multi-select DBs',
      icon: '🗂️',
      official: false,
      saveToNotion: true,
      copyToNotion: true,
      clipperPro: true,
      clipperProStatus: 'ready' as const,
      highlight: true
    },
    {
      name: 'Custom Shortcuts',
      icon: '⌨️',
      official: false,
      saveToNotion: false,
      copyToNotion: 'Limited',
      clipperPro: true,
      clipperProStatus: 'ready' as const,
      highlight: false
    }
  ];

  // Données complètes pour Pricing/Compare page
  const fullFeatures = [
    // Pricing
    { category: '💰 Pricing', name: 'Monthly', official: 'Free', saveToNotion: '$5.99', copyToNotion: '$9', clipperPro: '$2.99 early', clipperProStatus: 'ready' as const, highlight: true },
    { category: '💰 Pricing', name: 'Regular Price', official: 'Free', saveToNotion: '$5.99', copyToNotion: '$9', clipperPro: '$3.99', clipperProStatus: 'ready' as const, highlight: false },
    { category: '💰 Pricing', name: 'Free Tier', official: 'Unlimited', saveToNotion: 'Unlimited', copyToNotion: '75 clips', clipperPro: '100 clips/mo', clipperProStatus: 'ready' as const, highlight: false },
    { category: '💰 Pricing', name: 'Free Files', official: 'Unlimited', saveToNotion: 'Unlimited', copyToNotion: 'Limited', clipperPro: '10 files/mo', clipperProStatus: 'ready' as const, highlight: false },

    // Platform
    { category: '🖥️ Platform', name: 'Browser Extension', official: true, saveToNotion: true, copyToNotion: true, clipperPro: true, clipperProStatus: 'ready' as const, highlight: false },
    { category: '🖥️ Platform', name: 'Desktop App', official: false, saveToNotion: false, copyToNotion: false, clipperPro: 'macOS/Win/Linux', clipperProStatus: 'ready' as const, highlight: true },

    // Core Features
    { category: '📡 Core', name: 'Works Offline', official: false, saveToNotion: false, copyToNotion: false, clipperPro: 'Queue + sync', clipperProStatus: 'ready' as const, highlight: true },
    { category: '📡 Core', name: 'File Attachments', official: false, saveToNotion: false, copyToNotion: false, clipperPro: true, clipperProStatus: 'ready' as const, highlight: true },
    { category: '📡 Core', name: 'Full Pages', official: 'URL only', saveToNotion: true, copyToNotion: true, clipperPro: true, clipperProStatus: 'ready' as const, highlight: false },
    { category: '📡 Core', name: 'Screenshots', official: 'Basic', saveToNotion: true, copyToNotion: true, clipperPro: true, clipperProStatus: 'ready' as const, highlight: true },
    { category: '📡 Core', name: 'Highlights', official: false, saveToNotion: true, copyToNotion: true, clipperPro: true, clipperProStatus: 'ready' as const, highlight: true },

    // Productivity
    { category: '⚙️ Productivity', name: 'Custom Shortcuts', official: false, saveToNotion: false, copyToNotion: '5 max', clipperPro: true, clipperProStatus: 'ready' as const, highlight: false },
    { category: '⚙️ Productivity', name: 'Focus Mode', official: false, saveToNotion: false, copyToNotion: false, clipperPro: '60min free', clipperProStatus: 'ready' as const, highlight: true },
    { category: '⚙️ Productivity', name: 'Compact Mode', official: false, saveToNotion: false, copyToNotion: false, clipperPro: '60min free', clipperProStatus: 'ready' as const, highlight: true },
    { category: '⚙️ Productivity', name: 'Multi-select DBs', official: false, saveToNotion: true, copyToNotion: true, clipperPro: true, clipperProStatus: 'ready' as const, highlight: true },
    { category: '⚙️ Productivity', name: 'Quick DB Switch', official: false, saveToNotion: true, copyToNotion: true, clipperPro: true, clipperProStatus: 'ready' as const, highlight: false },
    { category: '⚙️ Productivity', name: 'Templates', official: false, saveToNotion: '4 max', copyToNotion: '1-5', clipperPro: 'Unlimited', clipperProStatus: 'ready' as const, highlight: true },

    // Analytics (Premium only)
    { category: '📊 Analytics', name: 'Usage Stats', official: false, saveToNotion: false, copyToNotion: false, clipperPro: true, clipperProStatus: 'ready' as const, highlight: true },
    { category: '📊 Analytics', name: 'History', official: false, saveToNotion: false, copyToNotion: false, clipperPro: true, clipperProStatus: 'ready' as const, highlight: true },
    { category: '📊 Analytics', name: 'Export Data', official: false, saveToNotion: false, copyToNotion: false, clipperPro: true, clipperProStatus: 'ready' as const, highlight: false },

    // Workspaces
    { category: '🏢 Workspaces', name: 'Notion Workspaces', official: '1', saveToNotion: '1', copyToNotion: '1', clipperPro: '5', clipperProStatus: 'ready' as const, highlight: true }
  ];

  const features = isCondensed ? condensedFeatures : fullFeatures;

  const renderCell = (value: any, isClipperPro: boolean, highlight: boolean, status?: 'ready' | 'soon' | 'planned') => {
    // For Clipper Pro column with status
    if (isClipperPro && status) {
      if (status === 'ready' && typeof value === 'boolean' && value) {
        return <Check className="w-5 h-5 mx-auto text-purple-600" strokeWidth={2.5} />;
      }
      if (status === 'ready' && typeof value === 'string') {
        return (
          <span className={`text-sm font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent`}>
            {value}
          </span>
        );
      }
      if (status === 'soon') {
        return <StatusBadge status="soon" />;
      }
      if (status === 'planned') {
        return <StatusBadge status="planned" />;
      }
    }
    
    if (typeof value === 'boolean') {
      return value ? (
        <Check className={`w-5 h-5 mx-auto ${isClipperPro && highlight ? 'text-purple-600' : 'text-green-500'}`} strokeWidth={2.5} />
      ) : (
        <X className="w-5 h-5 mx-auto text-gray-300 dark:text-gray-600" strokeWidth={2} />
      );
    }

    return (
      <span className={`text-sm ${isClipperPro && highlight ? 'font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent' : 'text-gray-600 dark:text-gray-400'}`}>
        {value}
      </span>
    );
  };

  return (
    <div className="w-full">
      {/* Table - Desktop */}
      <div className="hidden md:block overflow-hidden rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <table className="w-full">
          {/* Header avec gradients */}
          <thead>
            <tr className="bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 border-b border-gray-200/50 dark:border-gray-700/50">
              <th className="py-6 px-8 text-left font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wide w-1/4">
                Feature
              </th>
              <th className="py-6 px-6 w-[18.75%]">
                <div className="flex flex-col items-center gap-2">
                  <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">Official</span>
                  <span className="text-xs font-semibold px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                    Free
                  </span>
                </div>
              </th>
              <th className="py-6 px-6 w-[18.75%]">
                <div className="flex flex-col items-center gap-2">
                  <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">Save to Notion</span>
                  <span className="text-xs font-semibold px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                    $5.99/mo
                  </span>
                </div>
              </th>
              <th className="py-6 px-6 w-[18.75%]">
                <div className="flex flex-col items-center gap-2">
                  <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">Copy to Notion</span>
                  <span className="text-xs font-semibold px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                    $3.75-9/mo
                  </span>
                </div>
              </th>
              <th className="py-6 px-6 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-900/30 dark:via-blue-900/20 dark:to-indigo-900/30 w-[18.75%] border-l border-purple-200/50 dark:border-purple-700/50">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent text-base">
                      Clipper Pro
                    </span>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-md">
                    $2.99 early
                  </span>
                  <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Locked forever</span>
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {features.map((feature: any, index) => {
              const isHighlight = feature.highlight;
              return (
                <tr
                  key={index}
                  className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:via-purple-50/30 hover:to-pink-50/50 dark:hover:from-blue-900/10 dark:hover:via-purple-900/10 dark:hover:to-pink-900/10 transition-all duration-200"
                >
                  <td className="py-5 px-8">
                    <div className="flex items-center gap-3">
                      {feature.icon && (
                        <span className="text-xl">{feature.icon}</span>
                      )}
                      <span className="font-semibold text-gray-900 dark:text-white text-sm">
                        {feature.name || feature.category}
                      </span>
                    </div>
                  </td>
                  <td className="py-5 px-6 text-center">{renderCell(feature.official, false, false)}</td>
                  <td className="py-5 px-6 text-center">{renderCell(feature.saveToNotion, false, false)}</td>
                  <td className="py-5 px-6 text-center">{renderCell(feature.copyToNotion, false, false)}</td>
                  <td className={`py-5 px-6 text-center border-l border-purple-200/50 dark:border-purple-700/50 ${isHighlight
                      ? 'bg-gradient-to-br from-purple-100/50 via-blue-100/30 to-indigo-100/50 dark:from-purple-900/20 dark:via-blue-900/10 dark:to-indigo-900/20'
                      : 'bg-gradient-to-br from-purple-50/30 to-blue-50/30 dark:from-purple-900/10 dark:to-blue-900/10'
                    }`}>
                    {renderCell(feature.clipperPro, true, isHighlight, feature.clipperProStatus)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile View - Modern Cards */}
      <div className="md:hidden space-y-6">
        {features.map((feature: any, index) => (
          <div
            key={index}
            className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              {feature.icon && <span className="text-2xl">{feature.icon}</span>}
              <h3 className="font-bold text-gray-900 dark:text-white text-base flex-1">
                {feature.name || feature.category}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-gray-50/50 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-200/30 dark:border-gray-700/30">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">Official</p>
                  <div className="flex justify-center items-center h-6">
                    {renderCell(feature.official, false, false)}
                  </div>
                </div>
                <div className="bg-gray-50/50 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-200/30 dark:border-gray-700/30">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">Save to Notion</p>
                  <div className="flex justify-center items-center h-6">
                    {renderCell(feature.saveToNotion, false, false)}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50/50 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-200/30 dark:border-gray-700/30">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">Copy to Notion</p>
                  <div className="flex justify-center items-center h-6">
                    {renderCell(feature.copyToNotion, false, false)}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 rounded-xl p-3 border-2 border-purple-200/50 dark:border-purple-700/50 shadow-md">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                    <p className="text-xs font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      Clipper Pro
                    </p>
                  </div>
                  <div className="flex justify-center items-center h-6">
                    {renderCell(feature.clipperPro, true, feature.highlight, feature.clipperProStatus)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA for condensed version */}
      {isCondensed && (
        <div className="mt-8 text-center">
          <Link
            to="/compare"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            <span>See Full Comparison</span>
            <Sparkles className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* CTA Button pour version complète */}
      {!isCondensed && (
        <div className="mt-12 text-center">
          <Link
            to="/auth"
            className="inline-flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-purple-500/50 hover:scale-105 transition-all duration-200"
          >
            <Sparkles className="w-5 h-5" />
            <span>Start Free Trial</span>
          </Link>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{t('cta.trust', 'Cancel anytime • Secure payment')}</p>
        </div>
      )}
    </div>
  );
}