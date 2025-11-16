import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Zap, Database, Check } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { NotionClipperLogo } from '../assets/Logo';

export default function HomePage() {
  const { t } = useTranslation('home');

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-[10px] opacity-50">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob" style={{ animationDelay: '2s' }}></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob" style={{ animationDelay: '4s' }}></div>
          <div className="absolute bottom-0 right-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob" style={{ animationDelay: '6s' }}></div>
        </div>
      </div>

      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-8">
            {/* Logo Animation */}
            <div className="flex justify-center mb-6 animate-pulse">
              <NotionClipperLogo size={80} />
            </div>

            {/* Title */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {t('hero.title.line1')}
              </span>
              <br />
              <span className="text-gray-900">
                {t('hero.title.line2')}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl sm:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              {t('hero.subtitle.line1')}
              <br className="hidden sm:block" />
              {t('hero.subtitle.line2')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                to="/auth"
                className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                <span className="relative z-10">{t('hero.cta.primary')}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>

              <Link
                to="/pricing"
                className="px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-900 rounded-xl font-semibold text-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 border border-gray-200"
              >
                {t('hero.cta.secondary')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">
              {t('features.title')}
            </h2>
            <p className="text-xl text-gray-700">
              {t('features.subtitle')}
            </p>
          </div>

          {/* Feature Cards with Gradients */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <Zap className="text-white" size={28} />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">{t('features.quickCapture.title')}</h3>
                <p className="text-gray-700 leading-relaxed">
                  {t('features.quickCapture.description')}
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <Database className="text-white" size={28} />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">{t('features.organization.title')}</h3>
                <p className="text-gray-700 leading-relaxed">
                  {t('features.organization.description')}
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <Check className="text-white" size={28} />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">{t('features.synchronization.title')}</h3>
                <p className="text-gray-700 leading-relaxed">
                  {t('features.synchronization.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl p-12 sm:p-16 text-center shadow-2xl overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

            <div className="relative z-10 space-y-6">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
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
              <p className="text-sm text-white/80 pt-2">
                {t('cta.trial')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
