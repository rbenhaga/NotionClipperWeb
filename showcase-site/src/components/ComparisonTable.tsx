import { Check, X, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ComparisonTableProps {
  variant?: 'condensed' | 'full';
}

export default function ComparisonTable({ variant = 'condensed' }: ComparisonTableProps) {
  const isCondensed = variant === 'condensed';

  // Données condensées pour Homepage (focus différenciation)
  const condensedFeatures = [
    {
      name: '💰 Price',
      official: 'Free',
      saveToNotion: '$5.99/mo',
      copyToNotion: '$3.75-9/mo',
      clipperPro: '$5.99/mo',
      highlight: false
    },
    {
      name: '🖥️ Desktop App',
      official: false,
      saveToNotion: false,
      copyToNotion: false,
      clipperPro: true,
      highlight: true,
      badge: 'Unique'
    },
    {
      name: '📡 Offline Mode',
      official: false,
      saveToNotion: false,
      copyToNotion: false,
      clipperPro: true,
      highlight: true,
      badge: 'Queue sync'
    },
    {
      name: '📊 Usage Stats',
      official: false,
      saveToNotion: false,
      copyToNotion: false,
      clipperPro: true,
      highlight: true,
      badge: 'Dashboard'
    },
    {
      name: '⚡ Performance',
      official: 'Slow',
      saveToNotion: 'Medium',
      copyToNotion: 'Medium',
      clipperPro: '44% faster',
      highlight: true
    },
    {
      name: '✏️ Highlights',
      official: false,
      saveToNotion: true,
      copyToNotion: true,
      clipperPro: true,
      highlight: false
    },
    {
      name: '⌨️ Custom Shortcuts',
      official: false,
      saveToNotion: false,
      copyToNotion: 'Limited',
      clipperPro: true,
      highlight: true,
      badge: 'Full control'
    }
  ];

  // Données complètes pour Pricing/Compare page
  const fullFeatures = [
    // Pricing
    { category: '💰 Pricing', name: 'Monthly', official: 'Free', saveToNotion: '$5.99', copyToNotion: '$9', clipperPro: '$5.99', highlight: false },
    { category: '💰 Pricing', name: 'Annual', official: 'Free', saveToNotion: 'N/A', copyToNotion: '$108 ($9/mo)', clipperPro: '$59 ($4.92/mo)', highlight: false },
    { category: '💰 Pricing', name: 'Free Tier', official: '✓ Unlimited', saveToNotion: '✓ Unlimited', copyToNotion: '75 clips total', clipperPro: '✓ 50 clips/mo', highlight: false },

    // Platform
    { category: '🖥️ Platform', name: 'Browser Extension', official: true, saveToNotion: true, copyToNotion: true, clipperPro: true, highlight: false },
    { category: '🖥️ Platform', name: 'Desktop App', official: false, saveToNotion: false, copyToNotion: false, clipperPro: true, highlight: true, badge: 'Windows/Mac' },
    { category: '🖥️ Platform', name: 'Mobile App', official: false, saveToNotion: false, copyToNotion: false, clipperPro: '⏳ Roadmap', highlight: false },

    // Core Features
    { category: '📡 Core Features', name: 'Works Offline', official: false, saveToNotion: false, copyToNotion: false, clipperPro: true, highlight: true, badge: 'Queue sync' },
    { category: '📡 Core Features', name: 'Save Full Pages', official: 'URL only', saveToNotion: true, copyToNotion: true, clipperPro: true, highlight: false },
    { category: '📡 Core Features', name: 'Screenshots', official: 'Basic', saveToNotion: true, copyToNotion: true, clipperPro: 'Enhanced', highlight: false },
    { category: '📡 Core Features', name: 'Highlights', official: false, saveToNotion: true, copyToNotion: true, clipperPro: true, highlight: false },

    // Productivity
    { category: '⚙️ Productivity', name: 'Custom Shortcuts', official: false, saveToNotion: false, copyToNotion: 'Limited (5)', clipperPro: true, highlight: true, badge: 'Unlimited' },
    { category: '⚙️ Productivity', name: 'Multi-select', official: false, saveToNotion: true, copyToNotion: true, clipperPro: true, highlight: false },
    { category: '⚙️ Productivity', name: 'Quick Database Switch', official: false, saveToNotion: true, copyToNotion: true, clipperPro: true, highlight: false },
    { category: '⚙️ Productivity', name: 'Templates/Forms', official: false, saveToNotion: 'Limited (4)', copyToNotion: '1-5 forms', clipperPro: '⏳ Coming Q1 2026', highlight: false },

    // Analytics
    { category: '📊 Analytics', name: 'Usage Statistics', official: false, saveToNotion: false, copyToNotion: false, clipperPro: true, highlight: true, badge: 'Dashboard' },
    { category: '📊 Analytics', name: 'Searchable History', official: false, saveToNotion: false, copyToNotion: false, clipperPro: '1000+ clips', highlight: true },
    { category: '📊 Analytics', name: 'Export Data', official: false, saveToNotion: false, copyToNotion: false, clipperPro: 'JSON/CSV', highlight: true }
  ];

  const features = isCondensed ? condensedFeatures : fullFeatures;

  const renderCell = (value: any, isClipperPro: boolean, highlight: boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className={`w-5 h-5 mx-auto ${isClipperPro && highlight ? 'text-green-600' : 'text-green-500'}`} />
      ) : (
        <X className="w-5 h-5 mx-auto text-gray-300" />
      );
    }

    if (value === 'N/A' || value === '-') {
      return <Minus className="w-5 h-5 mx-auto text-gray-300" />;
    }

    return (
      <span className={`text-sm ${isClipperPro && highlight ? 'font-bold text-purple-700' : 'text-gray-700'}`}>
        {value}
      </span>
    );
  };

  return (
    <div className="w-full">
      {/* Header avec titre et subtitle */}
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          {isCondensed ? 'Why Choose Clipper Pro?' : 'Compare Notion Clippers'}
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          {isCondensed
            ? 'The only clipper that works offline'
            : "Not sure which clipper is right for you? Here's an honest comparison."}
        </p>
      </div>

      {/* Table - Desktop */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border-2 border-gray-200 shadow-xl">
        <table className="w-full text-center">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="py-6 px-6 text-left font-bold text-gray-900 w-1/4">Feature</th>
              <th className="py-6 px-4 w-3/20">
                <div className="flex flex-col items-center gap-2">
                  <span className="font-bold text-gray-900">Official</span>
                  <span className="text-sm text-green-600 font-semibold">Free</span>
                  <span className="text-xs text-gray-500">3.3★ (607)</span>
                </div>
              </th>
              <th className="py-6 px-4 w-3/20">
                <div className="flex flex-col items-center gap-2">
                  <span className="font-bold text-gray-900">Save to Notion</span>
                  <span className="text-sm text-blue-600 font-semibold">$5.99/mo</span>
                  <span className="text-xs text-gray-500">4.3★ (1.2K)</span>
                </div>
              </th>
              <th className="py-6 px-4 w-3/20">
                <div className="flex flex-col items-center gap-2">
                  <span className="font-bold text-gray-900">Copy to Notion</span>
                  <span className="text-sm text-blue-600 font-semibold">$3.75-9/mo</span>
                  <span className="text-xs text-gray-500">4.7★ (295)</span>
                </div>
              </th>
              <th className="py-6 px-4 bg-gradient-to-br from-purple-50 to-blue-50 border-l-2 border-r-2 border-purple-200 w-3/20">
                <div className="flex flex-col items-center gap-2">
                  <span className="font-bold text-purple-700 text-lg">Clipper Pro</span>
                  <span className="text-sm text-purple-600 font-bold">$5.99/mo</span>
                  <span className="text-xs text-gray-500">⏳ TBD</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature: any, index) => {
              const isHighlight = feature.highlight;
              return (
                <tr
                  key={index}
                  className={`border-t ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50/30 transition-colors`}
                >
                  <td className="py-4 px-6 text-left font-medium text-gray-900">
                    {feature.name || feature.category}
                    {feature.badge && (
                      <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                        {feature.badge}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">{renderCell(feature.official, false, false)}</td>
                  <td className="py-4 px-4">{renderCell(feature.saveToNotion, false, false)}</td>
                  <td className="py-4 px-4">{renderCell(feature.copyToNotion, false, false)}</td>
                  <td className={`py-4 px-4 ${isHighlight ? 'bg-gradient-to-br from-green-50 to-emerald-50' : 'bg-gradient-to-br from-purple-50/50 to-blue-50/50'}`}>
                    {renderCell(feature.clipperPro, true, isHighlight)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile View - Cards */}
      <div className="md:hidden space-y-4">
        {features.map((feature: any, index) => (
          <div key={index} className="bg-white rounded-xl border-2 border-gray-200 p-4 shadow-md">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">{feature.name || feature.category}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Official</p>
                  <div className="flex justify-center">{renderCell(feature.official, false, false)}</div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Save to Notion</p>
                  <div className="flex justify-center">{renderCell(feature.saveToNotion, false, false)}</div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Copy to Notion</p>
                  <div className="flex justify-center">{renderCell(feature.copyToNotion, false, false)}</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-2 border-2 border-purple-200">
                  <p className="text-xs text-purple-700 font-bold mb-1">Clipper Pro</p>
                  <div className="flex justify-center">{renderCell(feature.clipperPro, true, feature.highlight)}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>* Ratings from Chrome Web Store (as of Nov 2025). Official clipper has 1M+ users but only 3.3★ due to frequent "go online" errors.</p>
        {isCondensed && (
          <Link to="/compare" className="inline-block mt-4 text-purple-600 hover:text-purple-700 font-semibold hover:underline">
            See full comparison →
          </Link>
        )}
      </div>

      {/* CTA Button */}
      {!isCondensed && (
        <div className="mt-10 text-center">
          <Link
            to="/auth"
            className="inline-block px-10 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Start Free Trial
          </Link>
          <p className="mt-3 text-sm text-gray-500">No credit card required</p>
        </div>
      )}
    </div>
  );
}
