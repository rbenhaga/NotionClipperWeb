import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Zap, Database, Check } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { NotionClipperLogo } from '../assets/Logo';

export default function HomePage() {
  const { t } = useTranslation('home');

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <NotionClipperLogo size={64} />
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            {t('hero.title.line1')}
            <br />
            {t('hero.title.line2')}
          </h1>

          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            {t('hero.subtitle.line1')} {t('hero.subtitle.line2')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth"
              className="px-6 py-3 bg-gray-900 text-white text-base font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              {t('hero.cta.primary')}
            </Link>
            <Link
              to="/pricing"
              className="px-6 py-3 border border-gray-300 text-gray-900 text-base font-medium rounded-lg hover:border-gray-400 transition-colors"
            >
              {t('hero.cta.secondary')}
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="text-white" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('features.quickCapture.title')}
              </h3>
              <p className="text-sm text-gray-600">
                {t('features.quickCapture.description')}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Database className="text-white" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('features.organization.title')}
              </h3>
              <p className="text-sm text-gray-600">
                {t('features.organization.description')}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Check className="text-white" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('features.synchronization.title')}
              </h3>
              <p className="text-sm text-gray-600">
                {t('features.synchronization.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t('cta.title')}
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            {t('cta.subtitle')}
          </p>
          <Link
            to="/auth"
            className="inline-block px-8 py-4 bg-gray-900 text-white text-base font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            {t('cta.button')}
          </Link>
          <p className="text-sm text-gray-500 mt-4">
            {t('cta.trial')}
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
