import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation('common');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Clipper Pro</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {t('footer.tagline', 'L\'outil ultime pour capturer vos idées dans Notion.')}
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('footer.product', 'Produit')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/pricing" className="text-xs text-gray-600 hover:text-gray-900">
                  {t('nav.pricing')}
                </Link>
              </li>
              <li>
                <a href="https://github.com/rbenhaga/NotionClipper" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-600 hover:text-gray-900">
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('footer.legal', 'Légal')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-xs text-gray-600 hover:text-gray-900">
                  {t('footer.privacy', 'Confidentialité')}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-xs text-gray-600 hover:text-gray-900">
                  {t('footer.terms', 'Conditions d\'utilisation')}
                </Link>
              </li>
              <li>
                <Link to="/legal" className="text-xs text-gray-600 hover:text-gray-900">
                  {t('footer.legalNotice', 'Mentions légales')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('footer.company', 'Entreprise')}</h3>
            <p className="text-xs text-gray-600">
              Rayane Ben Haga
              <br />
              <span className="text-gray-500">{t('footer.role', 'Entrepreneur')}</span>
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            © {currentYear} Clipper Pro. {t('footer.rights', 'Tous droits réservés.')}
          </p>
        </div>
      </div>
    </footer>
  );
}
