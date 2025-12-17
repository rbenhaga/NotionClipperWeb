import { Twitter, Github, Mail } from 'lucide-react';
import { ClipperLogo } from './ClipperLogo';
import { useTranslation } from 'react-i18next';

export const LandingFooter = () => {
  const { t } = useTranslation('landing');

  return (
  <footer className="bg-gray-50 dark:bg-black border-t border-gray-200 dark:border-white/10 pt-16 pb-8">
    <div className="max-w-7xl mx-auto px-6">
      
      {/* Top Section: Links Columns */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
        <div className="col-span-2 lg:col-span-2">
          <a href="#" className="inline-flex items-center gap-2.5 mb-4 group">
            <ClipperLogo size={24} className="group-hover:scale-105 transition-transform" />
            <span className="font-bold text-lg text-gray-900 dark:text-white">Clipper Pro</span>
          </a>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
            {t('footer.description')}
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-4">{t('footer.product.title')}</h4>
          <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
            <li><a href="#features" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t('footer.product.features')}</a></li>
            <li><a href="#pricing" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t('footer.product.pricing')}</a></li>
            <li><a href="#changelog" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t('footer.product.updates')}</a></li>
            <li><a href="#download" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t('footer.product.download')}</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-4">{t('footer.resources.title')}</h4>
          <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
            <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t('footer.resources.docs')}</a></li>
            <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t('footer.resources.notionGuide')}</a></li>
            <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t('footer.resources.community')}</a></li>
            <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t('footer.resources.support')}</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-4">{t('footer.legal.title')}</h4>
          <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
            <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t('footer.legal.privacy')}</a></li>
            <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t('footer.legal.terms')}</a></li>
            <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t('footer.legal.security')}</a></li>
            <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t('footer.legal.legalNotice')}</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom Section: Copyright & Socials */}
      <div className="pt-8 border-t border-gray-200 dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
        
        <div className="flex items-center gap-6">
            <span className="text-xs text-gray-500 dark:text-gray-400">
            {t('footer.copyright')}
            </span>
            <div className="hidden md:flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                {t('footer.systemStatus')}
            </div>
        </div>

        <div className="flex items-center gap-2">
          <a href="#" className="p-3 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-full focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none" aria-label="Twitter">
            <Twitter className="w-5 h-5" />
          </a>
          <a href="#" className="p-3 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-full focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none" aria-label="Github">
            <Github className="w-5 h-5" />
          </a>
          <a href="#" className="p-3 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-full focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none" aria-label="Email">
            <Mail className="w-5 h-5" />
          </a>
        </div>

      </div>
    </div>
  </footer>
  );
};