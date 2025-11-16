import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageToggle() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLang);
  };

  const currentLang = i18n.language === 'fr' ? 'FR' : 'EN';

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all text-sm font-medium text-gray-700 hover:text-gray-900"
      aria-label="Toggle language"
    >
      <Globe size={16} />
      <span>{currentLang}</span>
    </button>
  );
}
