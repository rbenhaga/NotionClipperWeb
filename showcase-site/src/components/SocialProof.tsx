import { useTranslation } from 'react-i18next';
import { Shield, Zap, Clock } from 'lucide-react';

export default function SocialProof() {
  const { t } = useTranslation('common');
  
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-4">
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Clock className="w-4 h-4 text-purple-500" />
        <span>{t('trust.freeTrial', '14-day free trial')}</span>
      </div>
      <span className="hidden sm:inline text-gray-300 dark:text-gray-600">•</span>
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Shield className="w-4 h-4 text-green-500" />
        <span>{t('trust.secure', 'Secure payment')}</span>
      </div>
      <span className="hidden sm:inline text-gray-300 dark:text-gray-600">•</span>
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Zap className="w-4 h-4 text-blue-500" />
        <span>{t('trust.cancelAnytime', 'Cancel anytime')}</span>
      </div>
    </div>
  );
}
