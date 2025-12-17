import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ClipperProLogo } from '../assets/Logo.tsx';
import { Twitter, Mail } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation('common');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <ClipperProLogo size={28} />
              <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Clipper Pro
              </span>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              {t('footer.tagline', 'The ultimate tool to capture your ideas in Notion.')}
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a 
                href="https://twitter.com/clipper_pro" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                <Twitter size={16} />
              </a>
              <a 
                href="mailto:contact@clipper-pro.com"
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                <Mail size={16} />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{t('footer.product', 'Product')}</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/pricing" className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  {t('nav.pricing')}
                </Link>
              </li>
              <li>
                <Link to="/compare" className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  {t('nav.compare')}
                </Link>
              </li>
              <li>
                <Link to="/changelog" className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  {t('nav.changelog', 'Changelog')}
                </Link>
              </li>

            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{t('footer.legal', 'Legal')}</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  {t('footer.privacy', 'Privacy')}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  {t('footer.terms', 'Terms of Service')}
                </Link>
              </li>
              <li>
                <Link to="/legal" className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  {t('footer.legalNotice', 'Legal Notice')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{t('footer.company', 'Company')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Rayane Ben Haga
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {t('footer.role', 'Entrepreneur')}
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © {currentYear} Clipper Pro. {t('footer.rights', 'All rights reserved.')}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {t('footer.madeWith', 'Made with love for Notion users everywhere')} 💜
          </p>
        </div>
      </div>
    </footer>
  );
}
