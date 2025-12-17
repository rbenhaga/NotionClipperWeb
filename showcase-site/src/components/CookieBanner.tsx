/**
 * CookieBanner - RGPD Compliant
 * Design premium, sobre, non-intrusif
 */

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const COOKIE_CONSENT_KEY = 'cookie_consent';

type ConsentStatus = 'accepted' | 'refused' | null;

export const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY) as ConsentStatus;
    if (!consent) {
      // Délai pour ne pas bloquer le rendu initial
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setVisible(false);
    // Activer analytics si accepté
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: 'granted',
      });
    }
  };

  const handleRefuse = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'refused');
    setVisible(false);
    // Désactiver analytics si refusé
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: 'denied',
      });
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              Nous utilisons des cookies pour améliorer votre expérience et analyser le trafic.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAccept}
                className="px-4 py-2 text-sm font-medium text-white bg-black dark:bg-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                Accepter
              </button>
              <button
                onClick={handleRefuse}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                Refuser
              </button>
              <a
                href="/privacy"
                className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none rounded-lg"
              >
                En savoir plus
              </a>
            </div>
          </div>
          <button
            onClick={handleRefuse}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none rounded-full"
            aria-label="Fermer la bannière de cookies"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
