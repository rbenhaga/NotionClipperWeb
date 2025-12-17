import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Imports des traductions
import commonFr from './locales/fr/common.json';
import homeFr from './locales/fr/home.json';
import authFr from './locales/fr/auth.json';
import pricingFr from './locales/fr/pricing.json';
import landingFr from './locales/fr/landing.json';

import commonEn from './locales/en/common.json';
import homeEn from './locales/en/home.json';
import authEn from './locales/en/auth.json';
import pricingEn from './locales/en/pricing.json';
import landingEn from './locales/en/landing.json';

// Configuration i18n
i18n
  .use(LanguageDetector) // Détecte automatiquement la langue du navigateur
  .use(initReactI18next) // Intègre avec React
  .init({
    resources: {
      fr: {
        common: commonFr,
        home: homeFr,
        auth: authFr,
        pricing: pricingFr,
        landing: landingFr,
      },
      en: {
        common: commonEn,
        home: homeEn,
        auth: authEn,
        pricing: pricingEn,
        landing: landingEn,
      },
    },
    fallbackLng: 'fr', // Langue par défaut : français
    defaultNS: 'common',
    ns: ['common', 'home', 'auth', 'pricing', 'landing'],

    interpolation: {
      escapeValue: false, // React échappe déjà
    },

    detection: {
      // Ordre de détection de la langue
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;
