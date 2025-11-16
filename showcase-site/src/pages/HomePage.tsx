import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Zap, Sparkles, Command } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { NotionClipperLogo } from '../assets/Logo';

export default function HomePage() {
  const { t } = useTranslation('home');

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Header />

      {/* Hero Section with Image */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <NotionClipperLogo size={48} />
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Clipper Pro
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {t('hero.title.line1')}
                </span>
                <br />
                <span className="text-gray-900">
                  {t('hero.title.line2')}
                </span>
              </h1>

              <p className="text-xl text-gray-700 leading-relaxed">
                {t('hero.subtitle.line1')} {t('hero.subtitle.line2')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  to="/auth"
                  className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <span className="relative z-10">{t('hero.cta.primary')}</span>
                </Link>

                <Link
                  to="/pricing"
                  className="px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-900 rounded-xl font-semibold text-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200"
                >
                  {t('hero.cta.secondary')}
                </Link>
              </div>

              <p className="text-sm text-gray-600 pt-2">
                {t('cta.trial')} • 2.99€/mois
              </p>
            </div>

            {/* Right: App Preview */}
            <div className="relative">
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 p-6">
                {/* Browser-like header */}
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex-1 text-center text-sm text-gray-500 font-medium">
                    Clipper Pro Extension
                  </div>
                </div>

                {/* App Screenshot Placeholder */}
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-8 aspect-[4/3] flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Sparkles className="w-16 h-16 text-purple-600 mx-auto" />
                    <p className="text-gray-600 font-medium">
                      Extension Chrome Clipper Pro
                    </p>
                    <p className="text-sm text-gray-500 max-w-xs">
                      Capturez n'importe quelle page web directement dans Notion en un clic
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating decoration */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full blur-3xl opacity-30 animate-pulse"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Visual Steps */}
      <section className="relative py-20 px-6 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              Simple et Rapide
            </h2>
            <p className="text-xl text-gray-700">
              Capturez et organisez en 3 étapes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center space-y-4">
              <div className="relative inline-flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-blue-400 rounded-2xl blur-xl opacity-30"></div>
                <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center mx-auto">
                    <Command className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                  Étape 1
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Cliquez sur l'extension
                </h3>
                <p className="text-gray-600">
                  Un simple clic sur l'icône dans votre navigateur
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="text-center space-y-4">
              <div className="relative inline-flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl blur-xl opacity-30"></div>
                <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center mx-auto">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  Étape 2
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Sélectionnez votre page
                </h3>
                <p className="text-gray-600">
                  Choisissez où sauvegarder dans votre Notion
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="text-center space-y-4">
              <div className="relative inline-flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-2xl blur-xl opacity-30"></div>
                <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center mx-auto">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
                  Étape 3
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  C'est sauvegardé !
                </h3>
                <p className="text-gray-600">
                  Retrouvez tout dans Notion, parfaitement formaté
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features with Visual Cards */}
      <section className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              Tout ce dont vous avez besoin
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Feature 1: Quick Capture */}
            <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {t('features.quickCapture.title')}
                </h3>
                <p className="text-gray-700">
                  {t('features.quickCapture.description')}
                </p>
                {/* Visual placeholder */}
                <div className="mt-4 p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600 font-mono">
                    ⌘ + Shift + S → Notion ✨
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2: Organization */}
            <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Format Notion Parfait
                </h3>
                <p className="text-gray-700">
                  Le contenu est automatiquement formaté en blocs Notion natifs avec images, liens et mise en forme
                </p>
                {/* Visual placeholder */}
                <div className="mt-4 space-y-2">
                  <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-2 bg-gray-200 rounded w-full"></div>
                  <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl p-12 sm:p-16 text-center shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

            <div className="relative z-10 space-y-6">
              <h2 className="text-4xl sm:text-5xl font-bold text-white">
                {t('cta.title')}
              </h2>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                {t('cta.subtitle')}
              </p>
              <div className="pt-4">
                <Link
                  to="/auth"
                  className="inline-block px-10 py-5 bg-white text-purple-600 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105"
                >
                  {t('cta.button')}
                </Link>
              </div>
              <p className="text-sm text-white/80">
                {t('cta.trial')} • Sans carte bancaire
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
