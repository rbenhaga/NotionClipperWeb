import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ClipperProLogo } from '../assets/Logo.tsx';
import LanguageToggle from './LanguageToggle.tsx';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const location = useLocation();

  // Check if current path matches
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <nav className="max-w-7xl mx-auto px-6">
        <div className="flex items-center h-20">
          {/* Logo - Left */}
          <div className="flex-1 flex justify-start">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <ClipperProLogo size={36} />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Clipper Pro
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex flex-1 items-center justify-center gap-8">
            <Link 
              to="/" 
              className={`text-base font-semibold transition-colors ${
                isActive('/') 
                  ? 'text-purple-600 dark:text-purple-400' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
              }`}
            >
              {t('nav.home')}
            </Link>
            <Link 
              to="/pricing" 
              className={`text-base font-semibold transition-colors ${
                isActive('/pricing') 
                  ? 'text-purple-600 dark:text-purple-400' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
              }`}
            >
              {t('nav.pricing')}
            </Link>
            <Link 
              to="/compare" 
              className={`text-base font-semibold transition-colors ${
                isActive('/compare') 
                  ? 'text-purple-600 dark:text-purple-400' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
              }`}
            >
              {t('nav.compare')}
            </Link>
            <Link 
              to="/changelog" 
              className={`text-base font-semibold transition-colors ${
                isActive('/changelog') 
                  ? 'text-purple-600 dark:text-purple-400' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
              }`}
            >
              {t('nav.changelog', 'Changelog')}
            </Link>
          </div>

          {/* Right: Language + Auth */}
          <div className="hidden md:flex flex-1 items-center justify-end gap-4">
            <LanguageToggle />
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`text-base font-semibold transition-colors px-3 py-2 rounded-lg ${
                    location.pathname.startsWith('/dashboard')
                      ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10'
                      : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {user.notion_workspace_name || user.name || t('nav.account')}
                </Link>
                {user.subscription_status !== 'active' && user.subscription_status !== 'trialing' && (
                  <Link
                    to="/auth?checkout=true&plan=premium_monthly"
                    className="px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition-colors"
                  >
                    {t('nav.upgrade')}
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="text-base font-semibold text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors px-3 py-2"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/auth"
                  className="px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition-colors"
                >
                  {t('nav.start')}
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            {mobileMenuOpen ? (
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-col gap-4">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-medium ${
                  isActive('/') ? 'text-purple-600' : 'text-gray-700 dark:text-gray-300 hover:text-purple-600'
                }`}
              >
                {t('nav.home')}
              </Link>
              <Link
                to="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-medium ${
                  isActive('/pricing') ? 'text-purple-600' : 'text-gray-700 dark:text-gray-300 hover:text-purple-600'
                }`}
              >
                {t('nav.pricing')}
              </Link>
              <Link
                to="/compare"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-medium ${
                  isActive('/compare') ? 'text-purple-600' : 'text-gray-700 dark:text-gray-300 hover:text-purple-600'
                }`}
              >
                {t('nav.compare')}
              </Link>
              <Link
                to="/changelog"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-medium ${
                  isActive('/changelog') ? 'text-purple-600' : 'text-gray-700 dark:text-gray-300 hover:text-purple-600'
                }`}
              >
                {t('nav.changelog', 'Changelog')}
              </Link>
              <div className="pt-3 flex flex-col gap-3 border-t border-gray-200 dark:border-gray-700">
                <LanguageToggle />
                {user ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 text-center"
                    >
                      {user.notion_workspace_name || user.name || t('nav.account')}
                    </Link>
                    {user.subscription_status !== 'active' && user.subscription_status !== 'trialing' && (
                      <Link
                        to="/auth?checkout=true&plan=premium_monthly"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-5 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg text-center"
                      >
                        {t('nav.upgrade')}
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <Link
                      to="/auth"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 text-center"
                    >
                      {t('nav.login')}
                    </Link>
                    <Link
                      to="/auth"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-5 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg text-center"
                    >
                      {t('nav.start')}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
