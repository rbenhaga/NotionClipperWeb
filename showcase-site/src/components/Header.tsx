import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NotionClipperLogo } from '../assets/Logo.tsx';
import LanguageToggle from './LanguageToggle.tsx';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation('common');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <nav className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <NotionClipperLogo size={24} />
            <span className="text-base font-semibold text-gray-900">Clipper Pro</span>
          </Link>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              {t('nav.home')}
            </Link>
            <Link to="/pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              {t('nav.pricing')}
            </Link>
          </div>

          {/* Right: Language + Auth */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageToggle />
            <Link
              to="/auth"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              {t('nav.login')}
            </Link>
            <Link
              to="/auth"
              className="px-4 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
            >
              {t('nav.getStarted')}
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
          >
            {mobileMenuOpen ? (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-4">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {t('nav.home')}
              </Link>
              <Link
                to="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {t('nav.pricing')}
              </Link>
              <div className="pt-3 flex flex-col gap-3 border-t border-gray-200">
                <LanguageToggle />
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm text-gray-600 hover:text-gray-900 text-center"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 text-center"
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
