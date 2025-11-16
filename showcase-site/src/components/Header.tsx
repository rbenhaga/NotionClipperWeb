import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NotionClipperLogoWithText } from '../assets/Logo.tsx';
import LanguageToggle from './LanguageToggle.tsx';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation('common');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <NotionClipperLogoWithText size="sm" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
              {t('nav.home')}
            </Link>
            <Link to="/pricing" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
              {t('nav.pricing')}
            </Link>
            <a href="https://github.com/rbenhaga/NotionClipper" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
              Download
            </a>
          </div>

          {/* CTA Buttons + Language Toggle */}
          <div className="hidden md:flex items-center space-x-3">
            <LanguageToggle />
            <Link
              to="/auth"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              {t('nav.login')}
            </Link>
            <Link
              to="/auth"
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
            >
              {t('nav.getStarted')}
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? <X size={24} className="text-gray-700" /> : <Menu size={24} className="text-gray-700" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-gray-700 hover:text-gray-900"
              >
                {t('nav.home')}
              </Link>
              <Link
                to="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-gray-700 hover:text-gray-900"
              >
                {t('nav.pricing')}
              </Link>
              <a
                href="https://github.com/rbenhaga/NotionClipper"
                target="_blank"
                rel="noopener noreferrer"
                className="text-base font-medium text-gray-700 hover:text-gray-900"
              >
                Download
              </a>
              <div className="pt-4 flex flex-col space-y-3">
                <div className="flex justify-center">
                  <LanguageToggle />
                </div>
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-5 py-3 text-center text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-5 py-3 text-center bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 shadow-md"
                >
                  {t('nav.getStarted')}
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}