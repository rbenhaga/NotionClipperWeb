import { Check, X, Sparkles, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ComparisonTableProps {
  variant?: 'condensed' | 'full';
}

export default function ComparisonTable({ variant = 'condensed' }: ComparisonTableProps) {
  const isCondensed = variant === 'condensed';

  // Données condensées pour Homepage (focus différenciation)
  const condensedFeatures = [
    {
      name: 'Price',
      icon: '💰',
      official: 'Free',
      saveToNotion: '$5.99/mo',
      copyToNotion: '$3.75-9/mo',
      clipperPro: '$3.99 beta',
      highlight: false
    },
    {
      name: 'Desktop App',
      icon: '🖥️',
      official: false,
      saveToNotion: false,
      copyToNotion: false,
      clipperPro: '🚧 Beta',
      highlight: true,
      badge: 'In Dev'
    },
    {
      name: 'Offline Mode',
      icon: '📡',
      official: false,
      saveToNotion: false,
      copyToNotion: false,
      clipperPro: '🚧 Beta',
      highlight: true,
      badge: 'Queue sync'
    },
    {
      name: 'Usage Analytics',
      icon: '📊',
      official: false,
      saveToNotion: false,
      copyToNotion: false,
      clipperPro: '🚧 Coming',
      highlight: true,
      badge: 'Q1 2025'
    },
    {
      name: 'Chrome Extension',
      icon: '🌐',
      official: true,
      saveToNotion: true,
      copyToNotion: true,
      clipperPro: '🚧 Beta',
      highlight: false
    },
    {
      name: 'Web Highlights',
      icon: '✨',
      official: false,
      saveToNotion: true,
      copyToNotion: true,
      clipperPro: '🎯 Planned',
      highlight: false
    },
    {
      name: 'Custom Shortcuts',
      icon: '⌨️',
      official: false,
      saveToNotion: false,
      copyToNotion: 'Limited',
      clipperPro: '🎯 Planned',
      highlight: false
    }
  ];

  // Données complètes pour Pricing/Compare page
  const fullFeatures = [
    // Pricing
    { category: '💰 Pricing', name: 'Monthly', official: 'Free', saveToNotion: '$5.99', copyToNotion: '$9', clipperPro: '$3.99 beta', highlight: true },
    { category: '💰 Pricing', name: 'Regular Price', official: 'Free', saveToNotion: '$5.99', copyToNotion: '$9', clipperPro: '$5.99', highlight: false },
    { category: '💰 Pricing', name: 'Free Tier', official: 'Unlimited', saveToNotion: 'Unlimited', copyToNotion: '75 clips', clipperPro: '10/mo', highlight: false },

    // Platform
    { category: '🖥️ Platform', name: 'Browser Extension', official: true, saveToNotion: true, copyToNotion: true, clipperPro: '🚧 Beta', highlight: false },
    { category: '🖥️ Platform', name: 'Desktop App', official: false, saveToNotion: false, copyToNotion: false, clipperPro: '🚧 Beta', highlight: true, badge: 'macOS' },
    { category: '🖥️ Platform', name: 'Mobile App', official: false, saveToNotion: false, copyToNotion: false, clipperPro: '🔮 Q3 2025', highlight: false },

    // Core Features
    { category: '📡 Core', name: 'Works Offline', official: false, saveToNotion: false, copyToNotion: false, clipperPro: '🚧 Beta', highlight: true, badge: 'Queue' },
    { category: '📡 Core', name: 'Full Pages', official: 'URL only', saveToNotion: true, copyToNotion: true, clipperPro: '🚧 Beta', highlight: false },
    { category: '📡 Core', name: 'Screenshots', official: 'Basic', saveToNotion: true, copyToNotion: true, clipperPro: '🎯 Q2 2025', highlight: false },
    { category: '📡 Core', name: 'Highlights', official: false, saveToNotion: true, copyToNotion: true, clipperPro: '🎯 Q2 2025', highlight: false },

    // Productivity
    { category: '⚙️ Productivity', name: 'Custom Shortcuts', official: false, saveToNotion: false, copyToNotion: '5 max', clipperPro: '🎯 Q2 2025', highlight: false },
    { category: '⚙️ Productivity', name: 'Multi-select', official: false, saveToNotion: true, copyToNotion: true, clipperPro: '🎯 Q2 2025', highlight: false },
    { category: '⚙️ Productivity', name: 'Quick DB Switch', official: false, saveToNotion: true, copyToNotion: true, clipperPro: '✅ Ready', highlight: false },
    { category: '⚙️ Productivity', name: 'Templates', official: false, saveToNotion: '4 max', copyToNotion: '1-5', clipperPro: '🔮 Q3 2025', highlight: false },

    // Analytics
    { category: '📊 Analytics', name: 'Usage Stats', official: false, saveToNotion: false, copyToNotion: false, clipperPro: '🚧 Coming', highlight: true, badge: 'Q1 2025' },
    { category: '📊 Analytics', name: 'History', official: false, saveToNotion: false, copyToNotion: false, clipperPro: '✅ 1000+', highlight: true },
    { category: '📊 Analytics', name: 'Export Data', official: false, saveToNotion: false, copyToNotion: false, clipperPro: '🎯 Q2 2025', highlight: false }
  ];

  const features = isCondensed ? condensedFeatures : fullFeatures;

  const renderCell = (value: any, isClipperPro: boolean, highlight: boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className={`w-5 h-5 mx-auto ${isClipperPro && highlight ? 'text-purple-600' : 'text-gray-400'}`} strokeWidth={2.5} />
      ) : (
        <X className="w-5 h-5 mx-auto text-gray-300" strokeWidth={2} />
      );
    }

    return (
      <span className={`text-sm ${isClipperPro && highlight ? 'font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent' : 'text-gray-600'}`}>
        {value}
      </span>
    );
  };

  return (
    <div className="w-full">
      {/* Header avec titre et subtitle */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {isCondensed ? 'Why Choose Clipper Pro?' : 'Compare Notion Clippers'}
          </h2>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          {isCondensed
            ? 'The only clipper that works offline with a native desktop app'
            : "Side-by-side comparison of all major Notion clippers"}
        </p>
      </div>

      {/* Table - Desktop */}
      <div className="hidden md:block overflow-hidden rounded-3xl border border-gray-200/50 shadow-2xl bg-white/80 backdrop-blur-sm">
        <table className="w-full">
          {/* Header avec gradients */}
          <thead>
            <tr className="bg-gradient-to-br from-gray-50 via-white to-gray-50 border-b border-gray-200/50">
              <th className="py-6 px-8 text-left font-bold text-gray-900 text-sm uppercase tracking-wide w-1/4">
                Feature
              </th>
              <th className="py-6 px-6 w-[18.75%]">
                <div className="flex flex-col items-center gap-2">
                  <span className="font-bold text-gray-800 text-sm">Official</span>
                  <span className="text-xs font-semibold px-3 py-1 bg-green-100 text-green-700 rounded-full">
                    Free
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-gray-500">3.3 (607)</span>
                  </div>
                </div>
              </th>
              <th className="py-6 px-6 w-[18.75%]">
                <div className="flex flex-col items-center gap-2">
                  <span className="font-bold text-gray-800 text-sm">Save to Notion</span>
                  <span className="text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                    $5.99/mo
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-gray-500">4.3 (1.2K)</span>
                  </div>
                </div>
              </th>
              <th className="py-6 px-6 w-[18.75%]">
                <div className="flex flex-col items-center gap-2">
                  <span className="font-bold text-gray-800 text-sm">Copy to Notion</span>
                  <span className="text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                    $3.75-9/mo
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-gray-500">4.7 (295)</span>
                  </div>
                </div>
              </th>
              <th className="py-6 px-6 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 w-[18.75%] border-l border-purple-200/50">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent text-base">
                      Clipper Pro
                    </span>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-md">
                    $3.99 beta
                  </span>
                  <span className="text-xs text-gray-500 italic">🧪 Beta</span>
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {features.map((feature: any, index) => {
              const isHighlight = feature.highlight;
              return (
                <tr
                  key={index}
                  className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:via-purple-50/30 hover:to-pink-50/50 transition-all duration-200"
                >
                  <td className="py-5 px-8">
                    <div className="flex items-center gap-3">
                      {feature.icon && (
                        <span className="text-xl">{feature.icon}</span>
                      )}
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 text-sm">
                          {feature.name || feature.category}
                        </span>
                        {feature.badge && (
                          <span className="text-xs bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 px-2 py-0.5 rounded-full w-fit mt-1 font-medium">
                            {feature.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6 text-center">{renderCell(feature.official, false, false)}</td>
                  <td className="py-5 px-6 text-center">{renderCell(feature.saveToNotion, false, false)}</td>
                  <td className="py-5 px-6 text-center">{renderCell(feature.copyToNotion, false, false)}</td>
                  <td className={`py-5 px-6 text-center border-l border-purple-200/50 ${
                    isHighlight
                      ? 'bg-gradient-to-br from-purple-100/50 via-blue-100/30 to-indigo-100/50'
                      : 'bg-gradient-to-br from-purple-50/30 to-blue-50/30'
                  }`}>
                    {renderCell(feature.clipperPro, true, isHighlight)}
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
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              {feature.icon && <span className="text-2xl">{feature.icon}</span>}
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-base">
                  {feature.name || feature.category}
                </h3>
                {feature.badge && (
                  <span className="text-xs bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 px-2 py-1 rounded-full inline-block mt-1 font-medium">
                    {feature.badge}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-200/30">
                  <p className="text-xs text-gray-500 mb-2 font-medium">Official</p>
                  <div className="flex justify-center items-center h-6">
                    {renderCell(feature.official, false, false)}
                  </div>
                </div>
                <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-200/30">
                  <p className="text-xs text-gray-500 mb-2 font-medium">Save to Notion</p>
                  <div className="flex justify-center items-center h-6">
                    {renderCell(feature.saveToNotion, false, false)}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-200/30">
                  <p className="text-xs text-gray-500 mb-2 font-medium">Copy to Notion</p>
                  <div className="flex justify-center items-center h-6">
                    {renderCell(feature.copyToNotion, false, false)}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-3 border-2 border-purple-200/50 shadow-md">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Sparkles className="w-3 h-3 text-purple-600" />
                    <p className="text-xs font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      Clipper Pro
                    </p>
                  </div>
                  <div className="flex justify-center items-center h-6">
                    {renderCell(feature.clipperPro, true, feature.highlight)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer note avec style moderne */}
      <div className="mt-8 text-center space-y-4">
        <div className="inline-block bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 px-6 py-4 shadow-md max-w-4xl">
          <p className="text-sm text-gray-600 mb-3">
            <Star className="w-4 h-4 inline fill-yellow-400 text-yellow-400 -mt-0.5" /> Ratings from Chrome Web Store (Nov 2025).
            Official clipper has 1M+ users but 3.3★ due to "go online" errors.
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-gray-600 pt-3 border-t border-gray-200">
            <span>✅ Production Ready</span>
            <span>🚧 Beta/In Dev</span>
            <span>🎯 Planned Q2</span>
            <span>🔮 Future Q3+</span>
          </div>
        </div>

        {isCondensed && (
          <Link
            to="/compare"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            <span>See Full Comparison</span>
            <Sparkles className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* CTA Button pour version complète */}
      {!isCondensed && (
        <div className="mt-12 text-center">
          <Link
            to="/auth"
            className="inline-flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-purple-500/50 hover:scale-105 transition-all duration-200"
          >
            <Sparkles className="w-5 h-5" />
            <span>Start 14-Day Free Trial</span>
          </Link>
          <p className="mt-4 text-sm text-gray-500">No credit card required • Cancel anytime</p>
        </div>
      )}
    </div>
  );
}
